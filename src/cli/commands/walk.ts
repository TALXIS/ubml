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
import { typeSchemas, sharedDefsSchema } from '../../generated/bundled.js';
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
  /** The words that were said, each span verbatim in the cited source. */
  quote?: string[];
  /** The claim this one replaces, so the walk can warn before it is settled. */
  supersedes?: string;
  /** The whole claim, so the reviewer sees what they are approving. */
  body: Record<string, unknown>;
}

interface Source {
  id: string;
  name?: string;
  date?: string;
  /** The whole source, so a claim can be checked against where it came from. */
  body: Record<string, unknown>;
}

/** A model element extraction proposed, waiting on the same answer. */
interface Proposal {
  id: string;
  reviewStatus: string;
  kind: string;
  name: string;
  /** Where a step sits in its process, so the reviewer can place it. */
  position?: { process: string; at: number; of: number };
  /** Who the element says is answerable for it. */
  responsible?: string;
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
  /** Every id the workspace defines, against what it is called. */
  names: Map<string, string>;
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
  names?: Map<string, string>,
): void {
  if (!value || typeof value !== 'object') return;
  if (Array.isArray(value)) {
    for (const item of value) collectProposals(item, file, into, undefined, names);
    return;
  }
  const obj = value as Record<string, unknown>;

  if (key && /^[A-Z]{2,3}\d{5}$/.test(key) && (obj.name || obj.term)) {
    names?.set(key, String(obj.name ?? obj.term));
  }

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
      responsible: Array.isArray((obj.RACI as Record<string, unknown>)?.responsible)
        ? ((obj.RACI as Record<string, string[]>).responsible).join(', ')
        : undefined,
    };
    into.push(proposal);
  }

  for (const [childKey, child] of Object.entries(obj)) {
    collectProposals(child, file, into, childKey, names);
  }

  // A process knows the order of its own steps; a step on its own does not.
  // After the recursion, because it numbers proposals the recursion creates.
  if (obj.steps && typeof obj.steps === 'object' && Array.isArray(obj.links)) {
    placeSteps(obj as Record<string, unknown>, key ?? '', into);
  }
}

/**
 * Number each step by the shortest path from an entry point. Shortest, because
 * a process with two ways in can route one back through the other, and the
 * longest path then calls a second step the sixth.
 */
function placeSteps(
  process: Record<string, unknown>,
  processId: string,
  into: Proposal[],
): void {
  const steps = process.steps as Record<string, unknown>;
  const links = process.links as Array<{ from: string; to: string }>;
  const starts = (process.startsWith as string[]) ?? Object.keys(steps).slice(0, 1);
  const next = new Map<string, string[]>();
  for (const l of links) next.set(l.from, [...(next.get(l.from) ?? []), l.to]);

  const at = new Map<string, number>();
  let frontier = starts.filter((id) => id in steps);
  let depth = 1;
  while (frontier.length) {
    const onward: string[] = [];
    for (const id of frontier) {
      if (at.has(id)) continue;
      at.set(id, depth);
      onward.push(...(next.get(id) ?? []));
    }
    frontier = onward;
    depth += 1;
  }

  const of = Object.keys(steps).length;
  const label = String(process.name ?? processId);
  for (const p of into) {
    if (p.position === undefined && at.has(p.id)) {
      p.position = { process: label, at: at.get(p.id) as number, of };
    }
  }
}

function load(dir: string): Walkable {
  const sources: Source[] = [];
  // Every id the workspace defines, against what it is called. A reviewer
  // reading "responsible AC01010" has been handed the tool's own bookkeeping.
  const names = new Map<string, string>();
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
        sources.push({ id, name: s.name as string, date: s.date as string, body: s });
      }
    }

    if (type !== 'insights' && type !== 'sources') {
      collectProposals(doc, path, proposals, undefined, names);
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
          quote: typeof i.quote === 'string'
            ? [i.quote as string]
            : ((i.quote as string[]) ?? []),
          supersedes: i.supersedes as string | undefined,
          body: i,
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

  return { sources, bySource, proposals, proposalsFor, names };
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

/** A metadata line: the label plain, the value picked out. */
function labelled(pairs: Array<[string, unknown]>): string {
  return pairs
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${k} ${highlight(String(v))}`)
    .join(' · ');
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
function describe(
  obj: Record<string, unknown>,
  depth = 0,
  skip = new Set(['reviewStatus', 'name', 'term']),
): string[] {
  // The skip set names what the caller already printed above. That is true of
  // the element itself and not of its children - an attribute's description
  // has not been printed anywhere.
  if (depth > 0) skip = new Set();
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
        for (const item of value) nested.push(...describe(item as Record<string, unknown>, depth + 1, skip));
      }
    } else if (typeof value === 'object') {
      const kids = Object.entries(value as Record<string, unknown>);
      // A map of child elements - a process's steps, a tree's nodes - is not
      // this element's detail. Each child is reviewed on its own, and printing
      // them here buried one claim under sixteen.
      const children = kids.filter(([k]) => /^[A-Z]{2,3}\d{5}$/.test(k));
      if (children.length && children.length === kids.length) {
        facts.push(`${words(key)} ${children.length}, reviewed separately`);
        continue;
      }
      nested.push(`${pad}${words(key)}`);
      for (const [childKey, child] of kids) {
        if (/^[A-Z]{2,3}\d{5}$/.test(childKey)) continue;
        // A list of ids reads as a list. Recursing into it prints its indices.
        if (Array.isArray(child) && child.every((v) => typeof v !== 'object')) {
          nested.push(`${pad}  ${words(childKey)} ${child.join(', ')}`);
        } else if (child && typeof child === 'object') {
          nested.push(`${pad}  ${words(childKey)}`);
          nested.push(...describe(child as Record<string, unknown>, depth + 2, skip));
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
  const { sources, bySource, proposals: elements, proposalsFor, names } = load(options.dir);
  /** Swap every id in a value for what that thing is called. */
  const named = (v: unknown): string =>
    String(v ?? '').replace(/\b[A-Z]{2,3}\d{5}\b/g, (id) => names.get(id) ?? id);
  // Only the sources with something left to answer. A reviewer counting their
  // way through a session should not be told they are on bundle 186 of 215
  // because the workspace remembers five earlier sittings.
  const ordered = sources.filter((s) =>
    (bySource.get(s.id) ?? []).some((i) => i.status === 'proposed'),
  );

  // Which source each insight belongs to, so a `related` link can be told apart
  // from a restatement: a restatement points back at an earlier source.
  const sourceOf = new Map<string, string>();
  for (const [sourceId, list] of bySource) {
    for (const insight of list) sourceOf.set(insight.id, sourceId);
  }

  // Where the reviewer is in the whole walk, not only in this source.
  for (let si = 0; si < ordered.length; si++) {
    const source = ordered[si];
    // Every source that comes before this one, not only the ones still being
    // walked. A claim restating a source finished last week is still restating.
    const here = sources.findIndex((s) => s.id === source.id);
    const earlier = new Set(sources.slice(0, here).map((s) => s.id));
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
      const sb = source.body;
      const about = [
        sb.type ? `type ${highlight(String(sb.type))}` : null,
        sb.date ? `date ${highlight(String(sb.date))}` : null,
        Array.isArray(sb.participants)
          ? `present ${highlight((sb.participants as string[]).join(', '))}`
          : null,
        `claims ${highlight(String(insights.length))}` +
          (restating ? ` (${restating} restating an earlier source)` : ''),
      ].filter(Boolean).join(' · ');
      for (const line of wrap(about, 76)) console.log(`  ${line}`);
      // The stored text first: a quote is only checkable against a file the
      // reader can open, and a reviewer who cannot find the passage goes back
      // to the recording.
      if (sb.file) console.log(`  ${dim(String(sb.file))}`);
      if (sb.url) console.log(`  ${dim(String(sb.url))}`);
      console.log();
      console.log(dim('  ubml walk legend · ask for more of the transcript any time'));
      console.log();
    }

    console.log(dim(
      `source ${si + 1}/${ordered.length}, ` +
      `${insights.length - remaining + 1}/${insights.length} claims:`,
    ));
    console.log();
    for (const span of insight.quote ?? []) {
      for (const line of wrap(span, 76)) console.log(`> ${line}`);
      console.log();
    }
    if (insight.context) {
      for (const line of String(insight.context).split('\n')) console.log(dim(line));
      console.log();
    }

    const b = insight.body;
    console.log(chalk.bold('Insight'));
    for (const line of insight.text.split('\n')) console.log(`> ${line}`);
    console.log(wrap(labelled([
      ['kind', b.kind],
      ['confidence', b.confidence],
      ['said by', b.attribution],
      ['date', b.date],
      ['tags', Array.isArray(b.tags) ? (b.tags as string[]).join(', ') : null],
    ]), 76).join('\n'));
    if (b.notes) {
      console.log();
      for (const line of wrap(String(b.notes), 76)) console.log(dim(line));
    }
    console.log();

    // The element half of the bundle. Reviewing the claim without it approves
    // the extraction and leaves the interpretation unasked.
    const proposals = (proposalsFor.get(insight.id) ?? []).filter(
      (p) => p.reviewStatus === 'proposed',
    );
    proposals.forEach((p, n) => {
      const where = p.position
        ? `step ${p.position.at} of ${p.position.of}, ${highlight(p.name)}`
        : `${p.kind}, ${highlight(p.name)}`;
      const label = proposals.length > 1 ? `Model Update ${n + 1}` : 'Model Update';
      console.log(`${chalk.bold(label)} — ${where}`);
      const body = { ...p.body };
      const prose = String(body.description ?? '');
      delete body.description;
      for (const line of wrap(prose, 76)) console.log(`> ${line}`);
      const meta = labelled([
        p.position ? ['process', p.position.process] : null,
        p.position ? null : ['type', p.kind],
        ['responsible', p.responsible ? named(p.responsible) : undefined],
        ['derived from', p.derivedFrom.length === 1
          ? 'this claim alone'
          : `${p.derivedFrom.length} claims, including this one`],
      ].filter(Boolean) as Array<[string, unknown]>);
      if (meta) console.log(wrap(meta, 76).join('\n'));
      const rest = describe(body, 0, new Set(['name', 'reviewStatus', 'derivedFrom', 'description', 'RACI']));
      if (rest.length) {
        console.log();
        for (const line of rest) console.log(`  ${named(line)}`);
      }
      console.log();
    });

    // Settling a claim the same source later overturns, without being told it
    // is coming, is how a reviewer ends up validating something they knew would
    // not survive. The edge is written at extraction; this only surfaces it.
    const revisedBy = (bySource.get(sourceOf.get(insight.id) ?? '') ?? [])
      .filter((i) => i.supersedes === insight.id)
      .map((i) => i.id);
    if (revisedBy.length) {
      console.log(dim(wrap(
        `Later in this source, ${revisedBy.join(' and ')} revises this. ` +
        `Settle it as it stood here; the revision retires it when it arrives.`,
        76,
      ).join('\n')));
      console.log();
    }

    console.log(dim(insight.id));
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

/**
 * A value written back into YAML as a plain scalar where that is safe.
 *
 * Statuses always are. A reviewer's name is whatever they are called, and one
 * containing a colon or leading punctuation would otherwise end the document's
 * day.
 */
function yamlScalar(value: string): string {
  const plain = /^[A-Za-z0-9][A-Za-z0-9 ._'\u00C0-\u024F-]*$/.test(value) && parseYaml(value) === value;
  return plain ? value : JSON.stringify(value);
}

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
 * Set one field of the claim or element an id names - a claim's `status` or
 * `reviewedBy`, an element's `reviewStatus` - rewriting its line in place or
 * adding the line where the field is absent, or say why not and write nothing.
 *
 * A surgical text edit, not a parse-and-reserialise: the workspace's comments,
 * quoting and line breaks are content, and round-tripping them through the
 * serializer would rewrite a file the reviewer is reading.
 */
function setStatus(
  file: string,
  id: string,
  status: string,
  field: 'status' | 'reviewStatus' | 'reviewedBy' | 'answeredBy' = 'status',
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
  // Where a newly added field goes: beside the answer it qualifies if that is
  // in the file, otherwise at the end of the element's own block.
  let blockEnd = -1;
  let after = -1;
  const preferAfter = field === 'reviewedBy' || field === 'answeredBy' ? 'status' : null;

  for (let i = start + 1; i < src.length; i++) {
    if (!src[i].trim() || src[i].trimStart().startsWith('#')) continue;
    const indent = src[i].length - src[i].trimStart().length;
    // Stop at the next sibling or anything shallower: the block has ended.
    if (indent <= depth) break;
    // Whatever the file indents by, the first line under the id sets it.
    if (fieldDepth === -1) fieldDepth = indent;
    blockEnd = i;
    // Deeper than that is something nested, which is set by its own id.
    if (indent !== fieldDepth) continue;
    // Escapes are doubled: a template literal resolves \s to s before RegExp
    // ever sees the pattern.
    const m = src[i].match(new RegExp(`^(\\s+${field}:)(\\s*)(?:${SCALAR})?(\\s+#.*|\\s*)$`));
    if (!m) {
      if (keyOf(src[i])?.name === field) {
        return `${id} carries its ${field} as \`${src[i].trim()}\`, which this does not rewrite. Set it by hand.`;
      }
      if (preferAfter && new RegExp(`^\\s+${preferAfter}:\\s`).test(src[i])) after = i;
      continue;
    }
    if (runsOn(src, i)) return `${id}'s ${field} runs on past its own line. Set it by hand.`;
    src[i] = `${m[1]}${m[2] || ' '}${yamlScalar(status)}${m[3]}`;
    return writeIfHolds(file, original, src.join(eol), id, field, status);
  }

  // The field is not in the file yet, which is the ordinary case: a fresh
  // extraction has been reviewed by nobody, so nothing carries reviewedBy and
  // nothing carries reviewStatus. Rewriting only what is already written would
  // leave the flag working solely where it had been used before.
  if (fieldDepth === -1 || blockEnd === -1) return `Found ${id} but could not locate its ${field} line.`;
  const at = after === -1 ? blockEnd : after;
  src.splice(at + 1, 0, `${' '.repeat(fieldDepth)}${field}: ${yamlScalar(status)}`);
  return writeIfHolds(file, original, src.join(eol), id, field, status);
}

/**
 * Both vocabularies, side by side, in the words the schema uses.
 *
 * A reviewer meeting this for the first time has to place six values across two
 * vocabularies before the first bundle means anything, and the pair is what
 * confuses: `validated` and `accepted` sound like the same answer about the
 * same thing. Printed from the schema so the gloss cannot drift from the rule.
 */
function doLegend(): void {
  const insight = (typeSchemas as Record<string, { $defs?: Record<string, {
    description?: string;
    properties?: Record<string, { description?: string }>;
  }> }>).knowledge?.$defs?.Insight;
  // The per-value glosses live on the type and the lifecycle note on the
  // field. A reviewer needs both: what each word means, and that deferring is
  // an answer rather than a gap.
  const described = (insight?.description ?? '').split('\n');
  const from = described.findIndex((l) => l.trim().startsWith('STATUS LIFECYCLE'));
  const lifecycle: string[] = [];
  for (const line of from === -1 ? [] : described.slice(from + 1)) {
    if (line.trim().startsWith('- ')) lifecycle.push(line.trim());
    else if (lifecycle.length) break;
  }
  const review = (sharedDefsSchema as Record<string, unknown>).$defs as
    Record<string, { description?: string }> | undefined;

  console.log();
  console.log(header('What a claim can be'));
  console.log();
  for (const line of lifecycle) console.log(`  ${line}`);
  for (const line of (insight?.properties?.status?.description ?? '').split('\n')) {
    console.log(`  ${line}`);
  }
  console.log();
  console.log(header('What an element can be'));
  console.log();
  for (const line of (review?.ReviewStatus?.description ?? '').split('\n')) {
    console.log(`  ${line}`);
  }
  console.log();
  console.log(dim('  A claim is read correctly or it is not; an element is the right'));
  console.log(dim('  modelling of it or it is not. Two questions, two answers.'));
  console.log();
}

/**
 * The passage a claim came from, with what was said around it.
 *
 * A quote arrives with no timestamp and no neighbours, and a reviewer who
 * cannot tell what preceded it goes back to the recording - which is an hour
 * for a claim that takes a minute to settle.
 */
function doContext(id: string, options: { dir: string; lines: string }): void {
  const walkable = load(options.dir);
  const insight = [...walkable.bySource.values()].flat().find((i) => i.id === id);
  if (!insight) {
    console.error(chalk.red(`No insight ${id} in this workspace.`));
    process.exit(1);
  }
  if (!insight.quote?.length) {
    console.error(chalk.red(`${id} has no quote recorded, so there is no passage to find.`));
    process.exit(1);
  }

  const source = walkable.sources.find((s) => s.id === insight.source);
  const file = source?.body?.file;
  if (typeof file !== 'string' || !file) {
    console.error(chalk.red(`${insight.source ?? 'Its source'} has no \`file\`, so there is no text to search.`));
    process.exit(1);
  }

  const path = resolve(options.dir, file);
  let text: string;
  try {
    text = readFileSync(path, 'utf8');
  } catch {
    console.error(chalk.red(`Cannot read ${file}`));
    process.exit(1);
    return;
  }

  const lines = text.split(/\r?\n/);
  const window = Math.max(1, Number(options.lines) || 6);

  for (const needle of insight.quote) {
    const probe = needle.trim().slice(0, 40);
    const at = probe ? lines.findIndex((l) => l.includes(probe)) : -1;
    console.log();
    if (at === -1) {
      console.log(dim(`  not found in ${file}: ${probe}`));
      continue;
    }
    const from = Math.max(0, at - window);
    const to = Math.min(lines.length - 1, at + window);
    for (let i = from; i <= to; i++) {
      console.log(i === at ? `> ${lines[i]}` : dim(`  ${lines[i]}`));
    }
  }
  console.log();
}

function doSet(id: string, status: string, options: { dir: string; by?: string; to?: string }): void {
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

  // Only when it differs from whoever commits, which the commit already
  // records. A delegated walk, or a room where different people settled
  // different claims, is where the two come apart.
  if (options.by && !isElement) {
    const unrecorded = setStatus(file, id, options.by, 'reviewedBy');
    if (!unrecorded) {
      console.log(`${highlight(id)} ${dim('→')} ${status} ${dim(`(${options.by})`)}`);
    } else {
      console.log(`${highlight(id)} ${dim('→')} ${status}`);
      console.error(chalk.red(`${unrecorded} The status was written; reviewedBy was not.`));
      process.exitCode = 1;
    }
  } else if (options.by) {
    // An element has no reviewedBy. reviewStatus records the judgement and the
    // commit records who made it, so say the name went nowhere rather than
    // printing a success that looks like it was written.
    console.log(`${highlight(id)} ${dim('→')} ${status}`);
    console.log(dim('  --by is not recorded on an element; the commit is what names who accepted it'));
  } else {
    console.log(`${highlight(id)} ${dim('→')} ${status}`);
  }

  // Who can still settle it. Deferring without this leaves a question nobody
  // is carrying, which is how a workspace ends up with sixteen of them and no
  // way to tell which are waiting on a partner and which on a colleague.
  if (options.to && !isElement) {
    const unrecorded = setStatus(file, id, options.to, 'answeredBy');
    if (!unrecorded) {
      console.log(dim(`  answered by ${options.to}`));
    } else {
      console.error(chalk.red(`${unrecorded} The status was written; answeredBy was not.`));
      process.exitCode = 1;
    }
  } else if (options.to) {
    // An element is a modelling decision; the open question is on the claim
    // beneath it, which is where an answerer belongs.
    console.log(dim('  --to is not recorded on an element; set it on the claim it rests on'));
  }

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
    .command('legend')
    .description('What each status means, for a claim and for an element')
    .action(doLegend);

  command
    .command('context <id>')
    .description('The passage a claim came from, with what was said around it')
    .option('-d, --dir <directory>', 'Workspace directory', '.')
    .option('-l, --lines <n>', 'Lines either side', '6')
    .action(doContext);

  command
    .command('set <id> <status>')
    .description(
      "Record a reviewer's answer. An insight takes " +
      `${INSIGHT_STATUSES.join(' | ')}; a proposed element takes ` +
      `${REVIEW_STATUSES.join(' | ')}`,
    )
    .option('-d, --dir <directory>', 'Workspace directory', '.')
    .option('--by <name>', 'Who settled it, when that is not whoever commits the file')
    .option('--to <name>', 'Who can settle it, for a claim being deferred')
    .action(doSet);

  return command;
}
