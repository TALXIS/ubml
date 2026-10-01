/**
 * `ubml import` — a transcript the rest of the workspace can trust.
 *
 * The case that matters is the one that nearly shipped: Teams writes a long
 * utterance as a run of cues and closes the speaker tag only on the last, so a
 * parser matching open-close pairs keeps the final fragment and drops the rest
 * without saying so.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { execSync } from 'child_process';
import { existsSync, mkdtempSync, rmSync, writeFileSync, readFileSync } from 'fs';
import { tmpdir } from 'os';
import { join, resolve } from 'path';
import { printedCommands, runAsPrinted } from './printed-commands.js';

let dir: string;
const ubmlBin = resolve(process.cwd(), 'dist', 'cli.js');

// One utterance split across three cues, the tag opening on the first and
// closing on the third - which is what Teams writes and what a pair-matching
// parser loses two thirds of.
const RUN = `WEBVTT

1
00:00:04.316 --> 00:00:06.756
<v Alex Reviewer>So the invoice waits,

2
00:00:06.756 --> 00:00:09.120
until the manager signs it,

3
00:00:09.120 --> 00:00:12.058
and then it goes out.</v>

4
00:00:13.000 --> 00:00:15.400
<v Sam Reviewer>Yes, exactly.</v>
`;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'ubml-import-'));
});

afterEach(() => rmSync(dir, { recursive: true, force: true }));

function run(args: string): string {
  try {
    return execSync(`node ${ubmlBin} import ${args}`, {
      encoding: 'utf8',
      env: { ...process.env, FORCE_COLOR: '0' },
    });
  } catch (error: unknown) {
    const failed = error as { stdout?: string; stderr?: string };
    // `||`, not `??`: a command that exits non-zero has an empty stdout, and
    // what it said is on stderr.
    return failed.stdout || failed.stderr || '';
  }
}

function ubml(args: string, cwd = dir): string {
  return execSync(`node ${ubmlBin} ${args}`, {
    cwd,
    encoding: 'utf8',
    env: { ...process.env, FORCE_COLOR: '0' },
  });
}

describe('ubml import', () => {
  it('keeps the cues that carry no speaker tag of their own', () => {
    const vtt = join(dir, 'meeting.vtt');
    const out = join(dir, 'meeting.md');
    writeFileSync(vtt, RUN, 'utf8');

    run(`"${vtt}" -o "${out}"`);
    const text = readFileSync(out, 'utf8');

    // All three fragments, not only the one that closed the tag.
    expect(text).toContain("So the invoice waits");
    expect(text).toContain('until the manager signs it');
    expect(text).toContain("and then it goes out.");
  });

  it('gives a run of cues one turn, attributed to whoever opened it', () => {
    const vtt = join(dir, 'meeting.vtt');
    const out = join(dir, 'meeting.md');
    writeFileSync(vtt, RUN, 'utf8');

    run(`"${vtt}" -o "${out}"`);
    const turns = readFileSync(out, 'utf8')
      .split('\n')
      .filter((l) => l.startsWith('['));

    expect(turns).toHaveLength(2);
    expect(turns[0]).toContain('Alex Reviewer');
    expect(turns[0]).toContain('[00:00:04]');
    expect(turns[1]).toContain('Sam Reviewer');
  });

  it('refuses a file whose tags it cannot read at all', () => {
    const vtt = join(dir, 'odd.vtt');
    writeFileSync(vtt, 'WEBVTT\n\n1\n00:00:01.000 --> 00:00:02.000\n\n', 'utf8');

    expect(run(`"${vtt}" -o "${join(dir, 'odd.md')}"`)).toContain('none carried words');
  });

  it('refuses rather than drop a cue it could not read', () => {
    const vtt = join(dir, 'meeting.vtt');
    const out = join(dir, 'meeting.md');
    writeFileSync(vtt, RUN.replace('00:00:13.000 --> 00:00:15.400', '00:00:13 --> 00:00:15.400'), 'utf8');

    expect(run(`"${vtt}" -o "${out}"`)).toContain('4 cues in the file and 3 read');
    expect(existsSync(out)).toBe(false);
  });

  it('reads a cue timing that leaves out the hours, as WebVTT allows', () => {
    const vtt = join(dir, 'meeting.vtt');
    const out = join(dir, 'meeting.md');
    writeFileSync(vtt, RUN.replace('00:00:13.000 --> 00:00:15.400', '00:13.000 --> 00:15.400'), 'utf8');

    run(`"${vtt}" -o "${out}"`);

    expect(readFileSync(out, 'utf8')).toContain('[00:00:13] Sam Reviewer: Yes, exactly.');
  });

  it('creates the folder it is told to write into', () => {
    const vtt = join(dir, 'meeting.vtt');
    const out = join(dir, 'sources', 'meeting.md');
    writeFileSync(vtt, RUN, 'utf8');

    run(`"${vtt}" -o "${out}"`);

    expect(readFileSync(out, 'utf8')).toContain('until the manager signs it');
  });

  it('reads only what it can read verbatim', () => {
    const docx = join(dir, 'meeting.docx');
    writeFileSync(docx, 'not really a docx', 'utf8');

    expect(run(`"${docx}"`)).toContain('Only .vtt');
  });

  it('takes where to write it as a second argument', () => {
    const vtt = join(dir, 'meeting.vtt');
    const out = join(dir, 'kickoff.md');
    writeFileSync(vtt, RUN, 'utf8');

    run(`"${vtt}" "${out}"`);

    expect(readFileSync(out, 'utf8')).toContain('until the manager signs it');
  });

  it('refuses a destination given both ways rather than pick one', () => {
    const vtt = join(dir, 'meeting.vtt');
    writeFileSync(vtt, RUN, 'utf8');

    expect(run(`"${vtt}" "${join(dir, 'a.md')}" -o "${join(dir, 'b.md')}"`)).toContain('not both');
    expect(existsSync(join(dir, 'a.md'))).toBe(false);
    expect(existsSync(join(dir, 'b.md'))).toBe(false);
  });

  it.each([['init demo-workspace'], ['init demo-workspace --minimal']])('%s prints next steps that run in order from where it was run', (printing) => {
    const vtt = join(dir, 'call.vtt');
    writeFileSync(vtt, RUN, 'utf8');

    const steps = printedCommands(ubml(printing), 'Next steps:', /─{10}/);
    const ran = runAsPrinted(steps, dir, { '<meeting.vtt>': vtt, '<name>': 'kickoff' });

    expect(steps[0]).toBe('cd demo-workspace');
    expect(steps.some((step) => step.startsWith('ubml import'))).toBe(true);
    expect(ran.filter((r) => r.status !== 0).map((r) => `${r.command}: ${r.output}`)).toEqual([]);
    expect(readFileSync(join(dir, 'demo-workspace', 'sources', 'kickoff.md'), 'utf8')).toContain('So the invoice waits');
    expect(existsSync(join(dir, 'sources'))).toBe(false);
  });
});
