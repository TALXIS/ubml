/**
 * Walk command for UBML CLI.
 *
 * Bookkeeping for a stakeholder review of extracted insights: which insight is
 * next, in the order the material was produced, with the source text beside the
 * claim - and recording the answer once a human has given one.
 *
 * It deliberately stops there. Reading a reviewer's reply, deciding whether an
 * ambiguous answer counts, noticing that a correction changed the meaning rather
 * than the wording - none of that is a CLI's job. This supplies the payload and
 * records the outcome; the judgement stays with the caller.
 *
 * @module ubml/cli/commands/walk
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { relative, resolve } from 'path';
import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { isDeepStrictEqual } from 'util';
import { parse as parseYaml, parseDocument } from 'yaml';
import { detectDocumentType, getIdPrefix, ID_PREFIXES } from '../../metadata.js';
import { header, dim, highlight, success } from '../formatters/text';
import { unvalidatedApproval } from '../../semantic-validator.js';

// =============================================================================
// Types
// =============================================================================

const INSIGHT_STATUSES = ['proposed', 'validated', 'disputed', 'deferred', 'retired'] as const;

// A bundle carries two decisions with two vocabularies: was the claim read
// correctly, and should it have become this element.
const REVIEW_STATUSES = ['proposed', 'accepted', 'rejected'] as const;

interface Insight {
  id: string;
  file: string;
  text: string;
  kind?: string;
  status: string;
  source?: string;
  confidence?: number;
  context?: string;
  attribution?: string;
  related?: string[];
}

interface Source {
  id: string;
  name?: string;
  date?: string;
}

/** A model element extraction proposed, waiting on the same answer. */
interface Proposal {
  id: string;
  reviewStatus: string;
  kind: string;
  name: string;
  /** Everything else the element says, so the answer is about its content. */
  body: Record<string, unknown>;
  file: string;
  derivedFrom: string[];
}

interface Walkable {
  sources: Source[];
  /** Insights grouped by source id, each in file order. */
  bySource: Map<string, Insight[]>;
  /** Every element carrying a reviewStatus, whatever it cites. */
  proposals: Proposal[];
  /** The same elements, keyed by the insight id each one cites. */
  proposalsFor: Map<string, Proposal[]>;
}

// =============================================================================
// Loading
// =============================================================================

function ubmlFiles(dir: string): { path: string; type: string }[] {
  const out: { path: string; type: string }[] = [];
  const scan = (d: string): void => {
    for (const entry of readdirSync(d, { withFileTypes: true })) {
      const full = resolve(d, entry.name);
      if (entry.isDirectory() && !entry.name.startsWith('.')) scan(full);
      else if (entry.isFile() && entry.name.endsWith('.ubml.yaml')) {
        const type = detectDocumentType(entry.name);
        if (type) out.push({ path: full, type });
      }
    }
  };
  try {
    scan(resolve(dir));
  } catch {
    // an unreadable directory yields no files; the caller reports "nothing to walk"
  }
  return out;
}

/**
 * Collect every element carrying a reviewStatus, whatever it cites.
 *
 * Walks the parsed document rather than knowing which types carry reviewStatus,
 * so a type gaining the field needs no change here.
 */
function collectProposals(
  value: unknown,
  file: string,
  into: Proposal[],
  key?: string,
): void {
  if (!value || typeof value !== 'object') return;
  if (Array.isArray(value)) {
    for (const item of value) collectProposals(item, file, into);
    return;
  }
  const obj = value as Record<string, unknown>;

  // Every reviewed element, not only the proposed ones: a reviewer who accepts
  // by mistake has to be able to say so.
  if (typeof obj.reviewStatus === 'string' && key) {
    const cited = Array.isArray(obj.derivedFrom) ? (obj.derivedFrom as string[]) : [];
    const proposal: Proposal = {
      id: key,
      reviewStatus: obj.reviewStatus,
      kind: ID_PREFIXES[getIdPrefix(key) as keyof typeof ID_PREFIXES] ?? 'element',
      // Not everything states itself in `name`: a glossary entry uses `term`
      // and a hypothesis node uses `text`. Reading only `name` offered the
      // reviewer "Would add TM01030 · term ·" and left them to go and look.
      name: String(obj.name ?? obj.term ?? obj.text ?? ''),
      body: obj,
      file,
      derivedFrom: cited,
    };
    into.push(proposal);
  }

  for (const [childKey, child] of Object.entries(obj)) {
    collectProposals(child, file, into, childKey);
  }
}

function load(dir: string): Walkable {
  const sources: Source[] = [];
  const bySource = new Map<string, Insight[]>();
  const proposals: Proposal[] = [];

  for (const { path, type } of ubmlFiles(dir)) {
    let doc: Record<string, unknown>;
    try {
      doc = parseYaml(readFileSync(path, 'utf8')) as Record<string, unknown>;
    } catch (error) {
      console.error(chalk.red(`Cannot read ${relative(resolve(dir), path)}: ${(error as Error).message}`));
      process.exit(1);
    }
    if (!doc) continue;

    if (type === 'sources') {
      const entries = (doc.sources ?? {}) as Record<string, Record<string, unknown>>;
      for (const [id, s] of Object.entries(entries)) {
        sources.push({ id, name: s.name as string, date: s.date as string });
      }
    }

    if (type !== 'insights' && type !== 'sources') {
      collectProposals(doc, path, proposals);
    }

    if (type === 'insights') {
      const entries = (doc.insights ?? {}) as Record<string, Record<string, unknown>>;
      for (const [id, i] of Object.entries(entries)) {
        const insight: Insight = {
          id,
          file: path,
          text: String(i.text ?? ''),
          kind: i.kind as string,
          status: String(i.status ?? 'proposed'),
          source: i.source as string,
          confidence: i.confidence as number,
          context: i.context as string,
          attribution: i.attribution as string,
          related: (i.related as string[]) ?? [],
        };
        const key = insight.source ?? '(no source)';
        const list = bySource.get(key) ?? [];
        list.push(insight);
        bySource.set(key, list);
      }
    }
  }

  // A stakeholder reads their own project as a story, and the story is
  // chronological. Sources with no date sort last rather than silently first.
  sources.sort((a, b) => (a.date ?? '9999').localeCompare(b.date ?? '9999') || a.id.localeCompare(b.id));

  // Listed under every insight it cites, so whichever comes up first in the
  // walk carries it. A proposal resting on several claims is a judgement the
  // reviewer should see beside the first of them, not after the last.
  const proposalsFor = new Map<string, Proposal[]>();
  for (const proposal of proposals) {
    for (const insightId of proposal.derivedFrom) {
      proposalsFor.set(insightId, [...(proposalsFor.get(insightId) ?? []), proposal]);
    }
  }

  return { sources, bySource, proposals, proposalsFor };
}

// =============================================================================
// next
// =============================================================================

/** Pick every id out of a line, so a reviewer can see what to go and check. */
function colour(text: string): string {
  return text
    .split(/(\b[A-Z]{2,3}\d{5}\b)/g)
    .map((part, i) => (i % 2 ? highlight(part) : dim(part)))
    .join('');
}

function wrap(text: string, width: number): string[] {
  const out: string[] = [];
  for (const para of text.trim().split(/\n\s*\n/)) {
    if (out.length) out.push('');
    let line = '';
    for (const word of para.split(/\s+/).filter(Boolean)) {
      if (line && line.length + word.length + 1 > width) {
        out.push(line);
        line = word;
      } else {
        line = line ? `${line} ${word}` : word;
      }
    }
    if (line) out.push(line);
  }
  return out;
}

/** orderDate -> order date */
const words = (key: string): string => key.replace(/([a-z0-9])([A-Z])/g, '$1 $2').toLowerCase();

/**
 * Everything an element says, laid out to be read rather than parsed.
 *
 * Prose runs as prose. Short facts collapse onto one line, because a dozen of
 * them stacked vertically buries the sentence that matters. Nested things -
 * attributes, relationships, criteria - become a list, each with whatever it
 * says for itself. Only `reviewStatus` is left out: it is the question, not
 * part of the answer.
 */
function describe(obj: Record<string, unknown>, depth = 0): string[] {
  const skip = new Set(['reviewStatus', 'name', 'term']);
  const pad = '  '.repeat(depth);
  const width = 74 - pad.length;
  const prose: string[] = [];
  const facts: string[] = [];
  const nested: string[] = [];

  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined || value === null || skip.has(key)) continue;
    if (/^[A-Z]{2,3}\d{5}$/.test(key)) continue; // a child element, reviewed on its own

    if (Array.isArray(value)) {
      if (!value.length) continue;
      if (value.every((v) => typeof v !== 'object')) {
        facts.push(`${words(key)} ${value.join(', ')}`);
      } else {
        nested.push(`${pad}${words(key)}`);
        for (const item of value) nested.push(...describe(item as Record<string, unknown>, depth + 1));
      }
    } else if (typeof value === 'object') {
      nested.push(`${pad}${words(key)}`);
      for (const [childKey, child] of Object.entries(value as Record<string, unknown>)) {
        // A list of ids reads as a list. Recursing into it prints its indices.
        if (Array.isArray(child) && child.every((v) => typeof v !== 'object')) {
          nested.push(`${pad}  ${words(childKey)} ${child.join(', ')}`);
        } else if (child && typeof child === 'object') {
          nested.push(`${pad}  ${words(childKey)}`);
          nested.push(...describe(child as Record<string, unknown>, depth + 2));
        } else {
          nested.push(`${pad}  ${words(childKey)} ${String(child)}`);
        }
      }
    } else {
      const text = String(value);
      if (text.length > 90 || /\n/.test(text)) {
        for (const line of wrap(text, width)) prose.push(`${pad}${line}`);
        prose.push('');
      } else {
        facts.push(`${words(key)} ${text}`);
      }
    }
  }

  while (prose.length && !prose[prose.length - 1].trim()) prose.pop();
  const out = [...prose];
  if (facts.length) {
    if (out.length) out.push('');
    for (const line of wrap(facts.join(' · '), width)) out.push(`${pad}${line}`);
  }
  if (nested.length) {
    if (out.length) out.push('');
    out.push(...nested);
  }
  return out.map((line) => (line.trim() ? colour(line) : ''));
}

function doNext(options: { dir: string }): void {
  const { sources, bySource, proposals: elements, proposalsFor } = load(options.dir);
  const ordered = sources.filter((s) => (bySource.get(s.id) ?? []).length > 0);

  // Which source each insight belongs to, so a `related` link can be told apart
  // from a restatement: a restatement points back at an earlier source.
  const sourceOf = new Map<string, string>();
  for (const [sourceId, list] of bySource) {
    for (const insight of list) sourceOf.set(insight.id, sourceId);
  }

  for (let si = 0; si < ordered.length; si++) {
    const source = ordered[si];
    const earlier = new Set(ordered.slice(0, si).map((s) => s.id));
    const insights = bySource.get(source.id) ?? [];
    const idx = insights.findIndex((i) => i.status === 'proposed');
    if (idx === -1) continue;

    const insight = insights[idx];
    const remaining = insights.filter((i) => i.status === 'proposed').length;

    console.log();
    // The map, on the first unwalked insight of a source: how many, and how many
    // restate something already walked, so the reviewer can pace themselves.
    if (remaining === insights.length) {
      const restating = insights.filter((i) =>
        (i.related ?? []).some((ref) => earlier.has(sourceOf.get(ref) ?? '')),
      ).length;
      console.log(header(source.name ?? source.id));
      console.log(
        dim(`  ${insights.length} insights` +
          (restating ? `, ${restating} restating something already walked` : '')),
      );
      console.log();
    }

    console.log(
      dim(`Source ${si + 1} of ${ordered.length} · ${source.name ?? source.id} · ` +
        `insight ${idx + 1} of ${insights.length}`),
    );
    console.log();
    if (insight.context) {
      console.log(chalk.bold('Source says'));
      for (const line of String(insight.context).split('\n')) console.log(`> ${line}`);
      console.log();
    }
    console.log(chalk.bold('Extracted as'));
    for (const line of insight.text.split('\n')) console.log(`> ${line}`);
    console.log();

    const meta = [insight.kind, insight.confidence !== undefined ? `confidence ${insight.confidence}` : null, insight.status]
      .filter(Boolean)
      .join(' · ');
    console.log(dim(meta));
    if (insight.attribution) console.log(dim(insight.attribution));
    // The element half of the bundle. Reviewing the claim without it approves
    // the extraction and leaves the interpretation unasked.
    const proposals = (proposalsFor.get(insight.id) ?? []).filter(
      (p) => p.reviewStatus === 'proposed',
    );
    for (const p of proposals) {
      const shared = p.derivedFrom.length > 1
        ? dim(` (also from ${p.derivedFrom.filter((r) => r !== insight.id).join(', ')})`)
        : '';
      console.log(
        `${chalk.bold('Would add')} ${highlight(p.id)} · ${p.kind} · ${p.name}${shared}`,
      );
      for (const line of describe(p.body)) console.log(`    ${line}`);
      console.log();
    }
    if (proposals.length > 0) console.log();

    console.log(highlight(insight.id));
    console.log();
    return;
  }

  const known = new Set(sources.map((s) => s.id));
  const unplaced = [...bySource]
    .filter(([sourceId]) => !known.has(sourceId))
    .flatMap(([, list]) => list)
    .filter((i) => i.status === 'proposed');
  const waiting = elements.filter((p) => p.reviewStatus === 'proposed');

  console.log();
  if (bySource.size === 0) {
    console.log('No insights to walk. Extract a source first.');
  } else if (unplaced.length > 0) {
    console.log(`Proposed claims the walk cannot place: ${unplaced.length}`);
    for (const insight of unplaced) {
      const cites = insight.source
        ? `cites ${insight.source}, which no sources document defines`
        : 'cites no source';
      console.log(`  ${highlight(insight.id)} ${dim(cites)}`);
      for (const line of insight.text.split('\n')) console.log(`  > ${line}`);
    }
    console.log(dim('  Give each the source it came from, or settle it with ubml walk set <id> <status>'));
  } else if (waiting.length > 0) {
    console.log('No claim left proposed.');
  } else {
    console.log(success('Nothing left proposed. The walk is finished.'));
  }
  if (waiting.length > 0) {
    console.log();
    console.log(`Elements awaiting review: ${waiting.length}`);
    for (const p of waiting) console.log(`  ${highlight(p.id)} ${p.kind}, ${p.name}`);
    console.log(dim('  ubml walk set <id> accepted | rejected'));
  }
  console.log();
}

// =============================================================================
// set
// =============================================================================

const SCALAR = String.raw`"(?:[^"\\]|\\.)*"|'(?:[^']|'')*'|[^\s#](?:.*?\S)??`;

const KEY = /^(\s*)("(?:[^"\\]|\\.)*"|'(?:[^']|'')*'|[^\s#'"][^#]*?)\s*:(?=\s|$)(.*)$/;

function keyOf(line: string): { indent: number; name: string; rest: string } | undefined {
  const m = line.match(KEY);
  if (!m) return undefined;
  const name = /^(["']).*\1$/.test(m[2]) ? m[2].slice(1, -1) : m[2];
  return { indent: m[1].length, name, rest: m[3] };
}

function runsOn(src: string[], at: number): boolean {
  const indent = (line: string): number => line.length - line.trimStart().length;
  const next = src.slice(at + 1).find((l) => l.trim() && !l.trimStart().startsWith('#'));
  return next !== undefined && indent(next) > indent(src[at]);
}

function pathTo(value: unknown, id: string, at: string[] = []): string[] | undefined {
  if (!value || typeof value !== 'object') return undefined;
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    if (key === id && child && typeof child === 'object') return [...at, key];
    const found = pathTo(child, id, [...at, key]);
    if (found) return found;
  }
  return undefined;
}

function readBack(text: string): unknown {
  const doc = parseDocument(text);
  if (doc.errors.length > 0) throw doc.errors[0];
  return doc.toJS();
}

function writeIfHolds(
  file: string,
  before: string,
  after: string,
  id: string,
  field: string,
  value: string,
): string | undefined {
  let was: unknown;
  let now: unknown;
  try {
    was = readBack(before);
    now = readBack(after);
  } catch {
    return `Rewriting ${id}'s ${field} would leave a file that does not read back.`;
  }
  const path = pathTo(was, id);
  const element = (root: unknown): Record<string, unknown> | undefined =>
    path?.reduce<unknown>((at, key) => (at as Record<string, unknown> | undefined)?.[key], root) as
      Record<string, unknown> | undefined;
  const expected = element(was);
  if (!expected || element(now)?.[field] !== value) {
    return `Rewriting ${id}'s ${field} would not leave it reading ${value}.`;
  }
  expected[field] = value;
  if (!isDeepStrictEqual(now, was)) {
    return `Rewriting ${id}'s ${field} would change something else in the file too.`;
  }
  writeFileSync(file, after, 'utf8');
  return undefined;
}

/**
 * Rewrite a claim's `status` or an element's `reviewStatus` in place, or say
 * why not and write nothing.
 *
 * A surgical text edit, not a parse-and-reserialise: the workspace's comments,
 * quoting and line breaks are content, and round-tripping them through the
 * serializer would rewrite a file the reviewer is reading.
 */
function setStatus(
  file: string,
  id: string,
  status: string,
  field: 'status' | 'reviewStatus' = 'status',
): string | undefined {
  const original = readFileSync(file, 'utf8');
  const eol = original.includes('\r\n') ? '\r\n' : '\n';
  const src = original.split(/\r?\n/);

  // Elements nest - a step lives inside a process - so the block is found by
  // its own indentation rather than an assumed depth.
  const start = src.findIndex((l) => {
    const key = keyOf(l);
    return key !== undefined && key.indent > 0 && key.name === id && /^(?:\s+#.*|\s*)$/.test(key.rest);
  });
  if (start === -1) return `Found ${id} but could not locate its ${field} line.`;

  const depth = src[start].length - src[start].trimStart().length;

  // The element's own fields, and only those. A process contains steps and each
  // of them carries the same field, so a scan that takes the first one it meets
  // records the answer against a child whenever the parent's own field sits
  // below them - and reports the id it was asked for while doing it.
  let fieldDepth = -1;

  for (let i = start + 1; i < src.length; i++) {
    if (!src[i].trim() || src[i].trimStart().startsWith('#')) continue;
    const indent = src[i].length - src[i].trimStart().length;
    // Stop at the next sibling or anything shallower: the block has ended.
    if (indent <= depth) break;
    // Whatever the file indents by, the first line under the id sets it.
    if (fieldDepth === -1) fieldDepth = indent;
    // Deeper than that is something nested, which is set by its own id.
    if (indent !== fieldDepth) continue;
    // Escapes are doubled: a template literal resolves \s to s before RegExp
    // ever sees the pattern.
    const m = src[i].match(new RegExp(`^(\\s+${field}:)(\\s*)(?:${SCALAR})?(\\s+#.*|\\s*)$`));
    if (!m) {
      if (keyOf(src[i])?.name === field) {
        return `${id} carries its ${field} as \`${src[i].trim()}\`, which this does not rewrite. Set it by hand.`;
      }
      continue;
    }
    if (runsOn(src, i)) return `${id}'s ${field} runs on past its own line. Set it by hand.`;
    src[i] = `${m[1]}${m[2] || ' '}${status}${m[3]}`;
    return writeIfHolds(file, original, src.join(eol), id, field, status);
  }
  return `Found ${id} but could not locate its ${field} line.`;
}

function doSet(id: string, status: string, options: { dir: string }): void {
  const walkable = load(options.dir);
  const { bySource } = walkable;
  const all = [...bySource.values()].flat();
  const insight = all.find((i) => i.id === id);
  const proposal = walkable.proposals.find((p) => p.id === id);

  // The id says which decision is being recorded, so the caller does not have to.
  const isElement = !insight && proposal !== undefined;
  const allowed = isElement ? REVIEW_STATUSES : INSIGHT_STATUSES;
  const field = isElement ? 'reviewStatus' : 'status';

  if (!insight && !proposal) {
    console.error(chalk.red(`No insight or proposed element ${id} in this workspace.`));
    process.exit(1);
  }

  if (!(allowed as readonly string[]).includes(status)) {
    console.error(chalk.red(`Not a ${field}: ${status}`));
    console.error(`Use one of: ${allowed.join(', ')}`);
    process.exit(1);
  }

  const file = isElement ? proposal!.file : insight!.file;
  const refused = setStatus(file, id, status, field);
  if (refused) {
    console.error(chalk.red(`${refused} Nothing was written.`));
    process.exit(1);
  }

  console.log(`${highlight(id)} ${dim('→')} ${status}`);

  if (isElement && status === 'accepted') {
    for (const note of unvalidatedApproval(id, proposal!.derivedFrom, (ref) => all.find((i) => i.id === ref))) {
      console.log(dim(`  ${note}`));
    }
  }

  // Re-read rather than adjusting the count in memory: setting a status back to
  // proposed has to raise the number, not lower it.
  const after = load(options.dir);
  const [left, noun] = isElement
    ? [after.proposals.filter((p) => p.reviewStatus === 'proposed').length, 'elements awaiting review']
    : [[...after.bySource.values()].flat().filter((i) => i.status === 'proposed').length, 'insights still proposed'];
  console.log(dim(left === 0 ? `  no ${noun}` : `  ${left} ${noun}`));
}

// =============================================================================
// Command
// =============================================================================

export function walkCommand(): Command {
  const command = new Command('walk');

  command.description(
    'Bookkeeping for a stakeholder review: what to show next, and recording the answer',
  );

  command
    .command('next')
    .description('Show the next proposed insight, in the order the material was produced')
    .option('-d, --dir <directory>', 'Workspace directory', '.')
    .action(doNext);

  command
    .command('set <id> <status>')
    .description(
      "Record a reviewer's answer. An insight takes " +
      `${INSIGHT_STATUSES.join(' | ')}; a proposed element takes ` +
      `${REVIEW_STATUSES.join(' | ')}`,
    )
    .option('-d, --dir <directory>', 'Workspace directory', '.')
    .action(doSet);

  return command;
}
