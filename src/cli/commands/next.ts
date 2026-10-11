/**
 * What is outstanding in a model, and who owes the next move.
 *
 * `walk` hands over one claim at a time; this is the view above it. A model
 * collects two kinds of unfinished business - what the modeller has not
 * reviewed, and what nobody in the review can settle - and only the first had
 * a command.
 *
 * @module ubml/cli/commands/next
 */

import { readdirSync, readFileSync } from 'fs';
import { resolve, basename } from 'path';
import { Command } from 'commander';
import { parse as parseYaml } from 'yaml';
import { header, dim, highlight } from '../formatters/text';

interface Claim {
  id: string;
  text: string;
  status: string;
  tags: string[];
  related: string[];
  answeredBy?: string;
}

const ID = /^[A-Z]{2,3}\d{5}$/;

function strings(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : [];
}

/**
 * Elements awaiting the modeller's own review, at any depth - steps live under
 * a process, so a flat pass over the top level would miss most of them.
 */
function countUnreviewed(
  value: unknown,
  tagged: (tags: string[]) => boolean,
  key?: string,
): number {
  if (Array.isArray(value)) {
    return value.reduce<number>((n, item) => n + countUnreviewed(item, tagged), 0);
  }
  if (!value || typeof value !== 'object') return 0;
  const body = value as Record<string, unknown>;

  let found =
    key && ID.test(key) && body.reviewStatus === 'proposed' && tagged(strings(body.tags)) ? 1 : 0;
  for (const [childKey, child] of Object.entries(body)) {
    found += countUnreviewed(child, tagged, childKey);
  }
  return found;
}

function load(dir: string): { claims: Claim[]; others: unknown[] } {
  const claims: Claim[] = [];
  const others: unknown[] = [];

  const scan = (current: string): void => {
    let entries;
    try {
      entries = readdirSync(current, { withFileTypes: true });
    } catch {
      return; // unreadable directory; validate is the command that complains
    }
    for (const entry of entries) {
      const path = resolve(current, entry.name);
      if (entry.isDirectory() && !entry.name.startsWith('.')) {
        scan(path);
        continue;
      }
      if (!entry.isFile() || !entry.name.endsWith('.ubml.yaml')) continue;

      let doc: Record<string, unknown>;
      try {
        doc = parseYaml(readFileSync(path, 'utf8')) as Record<string, unknown>;
      } catch {
        continue; // next reads; malformed files are validate's business
      }
      if (!doc) continue;

      if (doc.insights && typeof doc.insights === 'object') {
        for (const [id, value] of Object.entries(doc.insights as Record<string, unknown>)) {
          const body = (value ?? {}) as Record<string, unknown>;
          // The field, then the convention it replaces: workspaces written
          // before it existed put the same string under `custom`.
          const custom = body.custom as Record<string, unknown> | undefined;
          const answeredBy = body.answeredBy ?? custom?.answeredBy;
          claims.push({
            id,
            text: String(body.text ?? id),
            status: typeof body.status === 'string' ? body.status : 'proposed',
            tags: strings(body.tags),
            related: strings(body.related),
            answeredBy: typeof answeredBy === 'string' ? answeredBy : undefined,
          });
        }
      }

      if (!basename(path).includes('insights')) others.push(doc);
    }
  };

  scan(dir);
  return { claims, others };
}

/**
 * Claims joined by `related`, so one undecided thing reads as one item rather
 * than as several unrelated ones.
 */
function cluster(open: Claim[]): Map<string, Set<string>> {
  const byId = new Map(open.map((c) => [c.id, c]));
  const links = new Map<string, Set<string>>();
  for (const claim of open) {
    for (const other of claim.related) {
      if (!byId.has(other)) continue;
      links.set(claim.id, (links.get(claim.id) ?? new Set()).add(other));
      links.set(other, (links.get(other) ?? new Set()).add(claim.id));
    }
  }
  return links;
}

function components(open: Claim[], links: Map<string, Set<string>>): Claim[][] {
  const byId = new Map(open.map((c) => [c.id, c]));
  const seen = new Set<string>();
  const out: Claim[][] = [];

  for (const claim of open) {
    if (seen.has(claim.id)) continue;
    const stack = [claim.id];
    const found: Claim[] = [];
    while (stack.length) {
      const id = stack.pop() as string;
      if (seen.has(id)) continue;
      seen.add(id);
      found.push(byId.get(id) as Claim);
      for (const other of links.get(id) ?? []) if (!seen.has(other)) stack.push(other);
    }
    out.push(found);
  }
  return out;
}

/**
 * A group is named by its most connected claim rather than by a tag. Tags
 * describe a subject and several open things share one, so tag names collide
 * exactly where it matters.
 */
function name(group: Claim[], links: Map<string, Set<string>>): string {
  const degree = (c: Claim): number =>
    [...(links.get(c.id) ?? [])].filter((o) => group.some((g) => g.id === o)).length;
  return [...group].sort((a, b) => degree(b) - degree(a) || a.id.localeCompare(b.id))[0].text;
}

function wrap(body: string, width: number, indent: string): string[] {
  const lines: string[] = [];
  let line = '';
  for (const word of body.split(/\s+/)) {
    if (line && line.length + word.length + 1 > width) {
      lines.push(line);
      line = word;
    } else {
      line = line ? `${line} ${word}` : word;
    }
  }
  if (line) lines.push(line);
  return lines.map((l, i) => (i === 0 ? l : indent + l));
}

function run(scope: string[], options: { dir: string; with?: string }): void {
  const { claims, others } = load(options.dir);
  const tagged = (tags: string[]): boolean =>
    scope.length === 0 || tags.some((t) => scope.includes(t));

  const unreviewed =
    claims.filter((c) => c.status === 'proposed' && tagged(c.tags)).length +
    others.reduce<number>((n, doc) => n + countUnreviewed(doc, tagged), 0);

  const open = claims.filter((c) => c.status === 'deferred' && tagged(c.tags));
  const links = cluster(open);
  let groups = components(open, links);

  if (options.with) {
    const needle = options.with.toLowerCase();
    groups = groups.filter((g) =>
      g.some((c) => (c.answeredBy ?? '').toLowerCase().includes(needle)),
    );
  }

  groups.sort(
    (a, b) =>
      b.length - a.length ||
      Number(Boolean(a[0].answeredBy)) - Number(Boolean(b[0].answeredBy)) ||
      a[0].id.localeCompare(b[0].id),
  );

  console.log();
  console.log(header(scope.length ? scope.join(', ') : 'whole workspace'));
  console.log(dim(`  ${unreviewed} unreviewed · ${groups.length} open`));
  console.log();

  for (const group of groups) {
    for (const line of wrap(name(group, links), 70, '  ')) console.log(`  ${line}`);
    const rest = group.length - 1;
    const who = group.map((c) => c.answeredBy).find(Boolean) ?? 'unassigned';
    console.log(
      dim(`    ${who}` + (rest > 0 ? ` · ${rest} more claim${rest === 1 ? '' : 's'}` : '')),
    );
    console.log();
  }

  if (!groups.length) {
    if (options.with) {
      console.log(`Nothing deferred to anyone matching "${options.with}".`);
    } else if (unreviewed > 0) {
      console.log('Nothing deferred so far.');
    } else {
      console.log('Nothing is waiting on anybody outside this review.');
    }
    console.log();
  }

  if (unreviewed > 0) {
    console.log(
      `${unreviewed} not yet reviewed, so this is incomplete. Run ${highlight('ubml walk next')} first.`,
    );
    console.log();
  }
}

export function nextCommand(): Command {
  return new Command('next')
    .description('What is outstanding in the model, and who owes the next move')
    .argument('[tags...]', 'Limit to elements carrying any of these tags')
    .option('-d, --dir <path>', 'Workspace directory', '.')
    .option('--with <name>', 'Only what this person can answer')
    .addHelpText(
      'after',
      [
        '',
        'Who answers a claim is read from its custom.answeredBy; it is never inferred.',
        '',
        'Examples:',
        '  ubml next                      everything outstanding in the workspace',
        '  ubml next billing fulfilment   claims tagged billing or fulfilment',
        '  ubml next --with AC00004       what one answerer owes (any part of answeredBy, any case)',
      ].join('\n'),
    )
    .action((tags: string[], options: { dir: string; with?: string }) => run(tags, options));
}
