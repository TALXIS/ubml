/**
 * Import command for UBML CLI.
 *
 * Turns a meeting transcript into the text a source points at. The conversion
 * is trivial; the counting is not. Teams writes one long utterance as a run of
 * cues and closes the speaker tag only on the last of them, so a parser that
 * looks for complete open-close pairs keeps the final fragment of every run and
 * silently drops the rest. That happened: 990 cues in, 379 out, and an hour of
 * discussion came out looking like a corrupt recording rather than a broken
 * conversion.
 *
 * So every cue in the file must appear in the output, and the command refuses
 * rather than writing a transcript that is quietly missing two thirds of what
 * was said. Everything downstream trusts this file - a quote is checked against
 * it and `walk context` reads the surrounding turns out of it - so a lossy
 * conversion makes both of them lie.
 *
 * @module ubml/cli/commands/import
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { basename, dirname, extname, resolve } from 'path';
import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dim, highlight, success } from '../formatters/text';

interface Cue {
  at: string;
  speaker: string;
  text: string;
}

/** `00:07:30.123 --> 00:07:33.456` keeps its start, to the second; the hours are optional. */
const TIMING = /^(?:(\d{2,}):)?(\d{2}):(\d{2})[.,]\d+\s+-->/;

/**
 * Read a WebVTT file into cues.
 *
 * The speaker tag opens on the cue that starts an utterance and closes on the
 * one that ends it, so a cue in the middle of a run carries neither. Carrying
 * the last speaker seen is what keeps those cues attached to the person who
 * said them instead of discarding them.
 */
function readVtt(text: string): { cues: Cue[]; counted: number } {
  const blocks = text.split(/\r?\n\r?\n/);
  const cues: Cue[] = [];
  let counted = 0;
  let speaker = '';

  for (const block of blocks) {
    const lines = block.split(/\r?\n/).filter((l) => l.trim());
    const timed = lines.findIndex((l) => TIMING.test(l));
    if (timed === -1) continue;
    counted += 1;

    const [, hours = '00', minutes, seconds] = lines[timed].match(TIMING) as RegExpMatchArray;
    const at = `${hours}:${minutes}:${seconds}`;
    const payload = lines.slice(timed + 1).join(' ');

    const opens = payload.match(/<v\s+([^>]+)>/);
    if (opens) speaker = opens[1].trim();

    const said = payload.replace(/<\/?v[^>]*>/g, '').trim();
    if (!said) continue;
    cues.push({ at, speaker, text: said });
  }

  return { cues, counted };
}

/**
 * One paragraph per turn, timestamped where the speaker started.
 *
 * A reviewer reads turns, not cues: a transcript broken at every pause is
 * unreadable and makes finding a passage harder, which is the thing the stored
 * text exists to make easy.
 */
function asTurns(cues: Cue[]): string[] {
  const turns: string[] = [];
  let open: Cue | null = null;

  for (const cue of cues) {
    if (open && cue.speaker === open.speaker) {
      open.text = `${open.text} ${cue.text}`;
      continue;
    }
    if (open) turns.push(`[${open.at}] ${open.speaker}: ${open.text}`);
    open = { ...cue };
  }
  if (open) turns.push(`[${open.at}] ${open.speaker}: ${open.text}`);

  return turns;
}

function doImport(file: string, options: { out?: string; title?: string }): void {
  const path = resolve(file);
  if (extname(path).toLowerCase() !== '.vtt') {
    console.error(chalk.red('Only .vtt is read today. Convert other exports by hand and keep the words verbatim.'));
    process.exit(1);
  }

  let raw: string;
  try {
    raw = readFileSync(path, 'utf8');
  } catch {
    console.error(chalk.red(`Cannot read ${file}`));
    process.exit(1);
    return;
  }

  const { cues, counted } = readVtt(raw);
  const inFile = raw.split(/\r?\n/).filter((l) => l.includes('-->')).length;

  // The invariant. Every cue that carried words has to come out the other
  // side; silence here is what made two thirds of a meeting vanish and read as
  // a bad recording rather than a broken conversion.
  if (counted !== inFile) {
    console.error(chalk.red(`${inFile} cues in the file and ${counted} read. Refusing to write a transcript missing ${inFile - counted} of them.`));
    process.exit(1);
  }
  if (counted && !cues.length) {
    console.error(chalk.red(`${counted} cues in the file and none carried words. The speaker tags are probably shaped differently than expected.`));
    process.exit(1);
  }

  const turns = asTurns(cues);
  const speakers = [...new Set(cues.map((c) => c.speaker).filter(Boolean))];
  const title = options.title ?? basename(path, extname(path));
  const body = [
    `# ${title}`,
    `# ${cues[0]?.at ?? ''} | ${speakers.join(', ')}`,
    '',
    ...turns.flatMap((t) => [t, '']),
  ].join('\n');

  const out = resolve(options.out ?? `${basename(path, extname(path))}.md`);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, body, 'utf8');

  console.log(success(`${highlight(String(counted))} cues → ${highlight(String(turns.length))} turns`));
  console.log(dim(`  ${out}`));
  console.log(dim(`  speakers: ${speakers.join(', ')}`));
}

export function importCommand(): Command {
  const command = new Command('import');

  command
    .description('Turn a meeting transcript into the text a source points at')
    .argument('<file>', 'A WebVTT transcript')
    .option('-o, --out <path>', 'Where to write it')
    .option('-t, --title <title>', 'Title line')
    .action(doImport);

  return command;
}
