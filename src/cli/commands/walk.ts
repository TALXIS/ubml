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
import { resolve } from 'path';
import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { parse as parseYaml } from 'yaml';
import { detectDocumentType, getIdPrefix, ID_PREFIXES } from '../../metadata.js';
import { header, dim, highlight, success } from '../formatters/text';

// =============================================================================
// Types
// =============================================================================

const INSIGHT_STATUSES = ['proposed', 'validated', 'disputed', 'deferred', 'retired'] as const;
type InsightStatus = typeof INSIGHT_STATUSES[number];

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
  /** Reviewable elements, keyed by the insight id each one cites. */
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
 * Collect elements carrying a reviewStatus, keyed by the insights they cite.
 *
 * Walks the parsed document rather than knowing which types carry reviewStatus,
 * so a type gaining the field needs no change here.
 */
function collectProposals(
  value: unknown,
  file: string,
  into: Map<string, Proposal[]>,
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
    // Listed under every insight it cites, so whichever comes up first in the
    // walk carries it. A proposal resting on several claims is a judgement the
    // reviewer should see beside the first of them, not after the last.
    for (const insightId of cited) {
      into.set(insightId, [...(into.get(insightId) ?? []), proposal]);
    }
  }

  for (const [childKey, child] of Object.entries(obj)) {
    collectProposals(child, file, into, childKey);
  }
}

function allProposals(w: Walkable): Proposal[] {
  const byId = new Map<string, Proposal>();
  for (const p of [...w.proposalsFor.values()].flat()) byId.set(p.id, p);
  return [...byId.values()];
}

function load(dir: string): Walkable {
  const sources: Source[] = [];
  const bySource = new Map<string, Insight[]>();
  const proposalsFor = new Map<string, Proposal[]>();

  for (const { path, type } of ubmlFiles(dir)) {
    let doc: Record<string, unknown>;
    try {
      doc = parseYaml(readFileSync(path, 'utf8')) as Record<string, unknown>;
    } catch {
      continue;
    }
    if (!doc) continue;

    if (type === 'sources') {
      const entries = (doc.sources ?? {}) as Record<string, Record<string, unknown>>;
      for (const [id, s] of Object.entries(entries)) {
        sources.push({ id, name: s.name as string, date: s.date as string });
      }
    }

    if (type !== 'insights' && type !== 'sources') {
      collectProposals(doc, path, proposalsFor);
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

  return { sources, bySource, proposalsFor };
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

/** commissionRate -> commission rate */
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
  const { sources, bySource, proposalsFor } = load(options.dir);
  const ordered = sources.filter((s) => (bySource.get(s.id) ?? []).length > 0);

  // Which source each insight belongs to, so a `related` link can be told apart
  // from a restatement: a restatement points back at an earlier source.
  const sourceOf = new Map<string, string>();
  for (const [sourceId, list] of bySource) {
    for (const insight of list) sourceOf.set(insight.id, sourceId);
  }

  if (ordered.length === 0) {
    console.log();
    console.log('No insights to walk. Extract a source first.');
    console.log();
    return;
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

  console.log();
  console.log(success('Nothing left proposed. The walk is finished.'));
  console.log();
}

// =============================================================================
// set
// =============================================================================

/**
 * Rewrite one insight's `status` in place.
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
): boolean {
  const original = readFileSync(file, 'utf8');
  const eol = original.includes('\r\n') ? '\r\n' : '\n';
  const src = original.split(/\r?\n/);

  // Elements nest - a step lives inside a process - so the block is found by
  // its own indentation rather than an assumed depth.
  const start = src.findIndex((l) => /^\s+\S/.test(l) && l.trimEnd().endsWith(`${id}:`));
  if (start === -1) return false;

  const depth = src[start].length - src[start].trimStart().length;

  for (let i = start + 1; i < src.length; i++) {
    // Stop at the next sibling or anything shallower: the block has ended.
    if (src[i].trim() && src[i].length - src[i].trimStart().length <= depth) break;
    // Escapes are doubled: a template literal resolves \s to s before RegExp
    // ever sees the pattern.
    const m = src[i].match(new RegExp(`^(\\s+${field}:\\s*)(\\S+)\\s*$`));
    if (m) {
      src[i] = `${m[1]}${status}`;
      writeFileSync(file, src.join(eol), 'utf8');
      return true;
    }
  }
  return false;
}

function doSet(id: string, status: string, options: { dir: string }): void {
  const walkable = load(options.dir);
  const { bySource } = walkable;
  const all = [...bySource.values()].flat();
  const insight = all.find((i) => i.id === id);
  const proposal = allProposals(walkable).find((p) => p.id === id);

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
  if (!setStatus(file, id, status, field)) {
    console.error(chalk.red(`Found ${id} but could not locate its ${field} line.`));
    process.exit(1);
  }

  console.log(`${highlight(id)} ${dim('→')} ${status}`);

  // Re-read rather than adjusting the count in memory: setting a status back to
  // proposed has to raise the number, not lower it.
  const after = load(options.dir);
  const [left, noun] = isElement
    ? [allProposals(after).filter((p) => p.reviewStatus === 'proposed').length, 'elements awaiting review']
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
