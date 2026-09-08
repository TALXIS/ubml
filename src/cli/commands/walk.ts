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
import { detectDocumentType } from '../../metadata.js';
import { header, dim, highlight, success } from '../formatters/text';

// =============================================================================
// Types
// =============================================================================

const INSIGHT_STATUSES = ['proposed', 'validated', 'disputed', 'retired'] as const;
type InsightStatus = typeof INSIGHT_STATUSES[number];

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

interface Walkable {
  sources: Source[];
  /** Insights grouped by source id, each in file order. */
  bySource: Map<string, Insight[]>;
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

function load(dir: string): Walkable {
  const sources: Source[] = [];
  const bySource = new Map<string, Insight[]>();

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

  return { sources, bySource };
}

// =============================================================================
// next
// =============================================================================

function doNext(options: { dir: string }): void {
  const { sources, bySource } = load(options.dir);
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
    console.log();
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
function setStatus(file: string, id: string, status: InsightStatus): boolean {
  const original = readFileSync(file, 'utf8');
  const eol = original.includes('\r\n') ? '\r\n' : '\n';
  const src = original.split(/\r?\n/);

  const start = src.findIndex((l) => l.trimEnd() === `  ${id}:`);
  if (start === -1) return false;

  for (let i = start + 1; i < src.length; i++) {
    // Stop at the next top-level key or sibling id.
    if (src[i].length > 0 && !/^\s/.test(src[i])) break;
    if (/^ {2}\S/.test(src[i])) break;
    const m = src[i].match(/^(\s+status:\s*)(\S+)\s*$/);
    if (m) {
      src[i] = `${m[1]}${status}`;
      writeFileSync(file, src.join(eol), 'utf8');
      return true;
    }
  }
  return false;
}

function doSet(id: string, status: string, options: { dir: string }): void {
  if (!(INSIGHT_STATUSES as readonly string[]).includes(status)) {
    console.error(chalk.red(`Not a status: ${status}`));
    console.error(`Use one of: ${INSIGHT_STATUSES.join(', ')}`);
    process.exit(1);
  }

  const { bySource } = load(options.dir);
  const all = [...bySource.values()].flat();
  const insight = all.find((i) => i.id === id);

  if (!insight) {
    console.error(chalk.red(`No insight ${id} in this workspace.`));
    process.exit(1);
  }

  if (!setStatus(insight.file, id, status as InsightStatus)) {
    console.error(chalk.red(`Found ${id} but could not locate its status line.`));
    process.exit(1);
  }

  console.log(`${highlight(id)} ${dim('→')} ${status}`);

  // Re-read rather than adjusting the count in memory: setting a status back to
  // proposed has to raise the number, not lower it.
  const left = [...load(options.dir).bySource.values()]
    .flat()
    .filter((i) => i.status === 'proposed').length;
  console.log(dim(left === 0 ? '  nothing left proposed' : `  ${left} still proposed`));
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
    .description(`Record a reviewer's answer (${INSIGHT_STATUSES.join(' | ')})`)
    .option('-d, --dir <directory>', 'Workspace directory', '.')
    .action(doSet);

  return command;
}
