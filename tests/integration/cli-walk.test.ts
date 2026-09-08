/**
 * Walk Command Tests
 *
 * `walk next` must pick the next unwalked insight in the order the material was
 * produced, and `walk set` must change one line and nothing else - the workspace
 * is a document a human is reading, not a serialisation target.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync, readFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { execSync } from 'child_process';
import { SCHEMA_VERSION } from '../../src/constants.js';
import { parse } from 'yaml';

describe('CLI Walk Command', () => {
  let tempDir: string;
  let originalCwd: string;

  const SOURCES = `ubml: "${SCHEMA_VERSION}"
sources:
  SR01010:
    name: Later meeting
    type: meeting
    date: "2026-03-01"
  SR01000:
    name: Earlier note
    type: document
    date: "2026-01-01"
`;

  // Deliberately awkward: a comment, a blank line and an out-of-order id, all of
  // which a parse-and-reserialise would quietly rewrite.
  const INSIGHTS = `ubml: "${SCHEMA_VERSION}"

# hand-written, and it should stay that way
insights:

  IN01010:
    text: "From the later meeting."
    kind: process-fact
    status: proposed
    source: SR01010
    confidence: 0.8

  IN01000:
    text: "From the earlier note."
    kind: decision
    status: proposed
    source: SR01000
    confidence: 0.9
    context: "the verbatim thing someone said"
`;

  beforeEach(() => {
    originalCwd = process.cwd();
    tempDir = mkdtempSync(join(tmpdir(), 'ubml-walk-'));
    writeFileSync(join(tempDir, 'test.workspace.ubml.yaml'), `ubml: "${SCHEMA_VERSION}"\nname: test\n`);
    writeFileSync(join(tempDir, 'sources.ubml.yaml'), SOURCES);
    writeFileSync(join(tempDir, 'insights.ubml.yaml'), INSIGHTS);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    rmSync(tempDir, { recursive: true, force: true });
  });

  function runUbml(args: string): string {
    const bin = join(originalCwd, 'dist', 'cli.js');
    try {
      return execSync(`node ${bin} ${args}`, { cwd: tempDir, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
    } catch (error: unknown) {
      const failed = error as { stdout?: string; stderr?: string };
      return failed.stdout || failed.stderr || '';
    }
  }

  it('takes the earliest source first, not the first id', () => {
    const out = runUbml('walk next');

    expect(out).toContain('IN01000');
    expect(out).not.toContain('IN01010');
    expect(out).toContain('Earlier note');
  });

  it('shows the source text beside the claim', () => {
    const out = runUbml('walk next');

    expect(out).toContain('Source says');
    expect(out).toContain('the verbatim thing someone said');
    expect(out).toContain('Extracted as');
    expect(out).toContain('From the earlier note.');
  });

  it('puts the source before the extraction, and the ID last', () => {
    const out = runUbml('walk next');

    // The rules this replaces used to live in the skill: label both blocks,
    // evidence before claim, ID last so the reviewer reads before decoding.
    expect(out.indexOf('Source says')).toBeLessThan(out.indexOf('Extracted as'));
    expect(out.indexOf('Extracted as')).toBeLessThan(out.indexOf('IN01000'));
    expect(out.trimEnd().endsWith('IN01000')).toBe(true);
  });

  it('leads with position, not identity', () => {
    const out = runUbml('walk next');

    expect(out).toMatch(/Source 1 of 2 .* insight 1 of 1/);
    expect(out.indexOf('Source 1 of 2')).toBeLessThan(out.indexOf('IN01000'));
  });

  it('opens a source with how many insights it holds', () => {
    const out = runUbml('walk next');

    expect(out).toContain('1 insights');
  });

  it('counts as restating only what points back at an earlier source', () => {
    // `related` links any relationship. Counting all of them reported "13 of 15
    // restating" on a workspace where almost nothing restated anything.
    writeFileSync(join(tempDir, 'insights.ubml.yaml'), `ubml: "${SCHEMA_VERSION}"
insights:
  IN01000:
    text: "From the earlier note."
    kind: decision
    status: proposed
    source: SR01000
    related: [IN01020]
  IN01010:
    text: "Restates the earlier note."
    kind: decision
    status: proposed
    source: SR01010
    related: [IN01000]
  IN01020:
    text: "Related to a sibling in the same source."
    kind: decision
    status: proposed
    source: SR01000
    related: [IN01000]
`);

    // First source: two insights, neither can restate anything earlier.
    expect(runUbml('walk next')).not.toContain('restating');

    runUbml('walk set IN01000 validated');
    runUbml('walk set IN01020 validated');

    // Second source: its one insight points back at the first.
    expect(runUbml('walk next')).toContain('1 restating');
  });

  it('moves on once an insight is answered', () => {
    runUbml('walk set IN01000 validated');
    const out = runUbml('walk next');

    expect(out).toContain('IN01010');
  });

  it('moves on from a claim the reviewer deferred', () => {
    // Deferring is an answer. Left as proposed, a claim nobody can settle is
    // offered again every time and the walk cannot get past it.
    runUbml('walk set IN01000 deferred');
    const out = runUbml('walk next');

    expect(out).toContain('IN01010');
    expect(out).not.toContain('IN01000');
  });

  it('changes one line and leaves the rest of the file alone', () => {
    const before = readFileSync(join(tempDir, 'insights.ubml.yaml'), 'utf8');

    runUbml('walk set IN01000 validated');
    const after = readFileSync(join(tempDir, 'insights.ubml.yaml'), 'utf8');

    const changed = before.split('\n')
      .map((line, i) => [line, after.split('\n')[i]])
      .filter(([a, b]) => a !== b);

    expect(changed).toHaveLength(1);
    expect(changed[0][1]).toContain('validated');
    expect(after).toContain('# hand-written, and it should stay that way');
  });

  it('round-trips back to the original bytes', () => {
    const before = readFileSync(join(tempDir, 'insights.ubml.yaml'), 'utf8');

    runUbml('walk set IN01000 validated');
    runUbml('walk set IN01000 proposed');

    expect(readFileSync(join(tempDir, 'insights.ubml.yaml'), 'utf8')).toBe(before);
  });

  it('refuses a status the enum does not have', () => {
    const out = runUbml('walk set IN01000 invalidated');

    expect(out).not.toContain('→');
    expect(readFileSync(join(tempDir, 'insights.ubml.yaml'), 'utf8')).toContain('status: proposed');
  });

  describe('the element half of a bundle', () => {
    beforeEach(() => {
      writeFileSync(join(tempDir, 'actors.ubml.yaml'), `ubml: "${SCHEMA_VERSION}"
actors:
  AC01000:
    name: Someone the claim implies
    type: role
    kind: human
    reviewStatus: proposed
    derivedFrom: [IN01000]
`);
    });

    it('shows the element the claim would create', () => {
      const out = runUbml('walk next');

      // Reviewing the claim without it approves the extraction and leaves the
      // interpretation unasked.
      expect(out).toContain('Would add');
      expect(out).toContain('AC01000');
      expect(out).toContain('actor');
    });

    it('records the element with its own vocabulary', () => {
      runUbml('walk set AC01000 accepted');

      expect(readFileSync(join(tempDir, 'actors.ubml.yaml'), 'utf8'))
        .toContain('reviewStatus: accepted');
    });

    it('refuses an insight status on an element', () => {
      runUbml('walk set AC01000 validated');

      expect(readFileSync(join(tempDir, 'actors.ubml.yaml'), 'utf8'))
        .toContain('reviewStatus: proposed');
    });

    it('counts the elements left, not the insights', () => {
      // On a workspace whose claims were settled before reviewStatus existed,
      // reporting the insight backlog leaves the number unmoved and the command
      // reads as though it did nothing.
      const out = runUbml('walk set AC01000 accepted');

      expect(out).toContain('elements awaiting review');
      expect(out).not.toContain('insights still proposed');
    });

    it('lets a reviewer change their mind after accepting', () => {
      runUbml('walk set AC01000 accepted');
      runUbml('walk set AC01000 rejected');

      expect(readFileSync(join(tempDir, 'actors.ubml.yaml'), 'utf8'))
        .toContain('reviewStatus: rejected');
    });

    it('stops offering it once answered', () => {
      runUbml('walk set AC01000 accepted');

      expect(runUbml('walk next')).not.toContain('Would add');
    });

    it('updates a reviewStatus that carries a comment, and keeps the comment', () => {
      const actors = join(tempDir, 'actors.ubml.yaml');
      writeFileSync(actors, readFileSync(actors, 'utf8').replace(
        'reviewStatus: proposed',
        'reviewStatus: proposed # agreed in the kickoff?',
      ));

      runUbml('walk set AC01000 accepted');
      const after = readFileSync(actors, 'utf8');

      expect(after).toContain('    reviewStatus: accepted # agreed in the kickoff?\n');
      expect(after.split('reviewStatus:')).toHaveLength(2);
    });

    it('finds an element whose id carries a comment', () => {
      const actors = join(tempDir, 'actors.ubml.yaml');
      writeFileSync(actors, readFileSync(actors, 'utf8').replace('  AC01000:\n', '  AC01000:   # confirmed by phone\n'));

      const out = runUbml('walk set AC01000 accepted');
      const after = readFileSync(actors, 'utf8');

      expect(out).toContain('→');
      expect(after).toContain('  AC01000:   # confirmed by phone\n');
      expect(after).toContain('    reviewStatus: accepted\n');
    });

    it('reads past comments under an element, deeper than its fields or at the margin', () => {
      const actors = join(tempDir, 'actors.ubml.yaml');
      writeFileSync(actors, readFileSync(actors, 'utf8').replace(
        '  AC01000:\n',
        '  AC01000:\n        # deeper than the fields\n# at the margin\n',
      ));

      const out = runUbml('walk set AC01000 accepted');
      const after = readFileSync(actors, 'utf8');

      expect(out).toContain('→');
      expect(after).toContain('    reviewStatus: accepted\n');
      expect((parse(after) as { actors: Record<string, { reviewStatus: string }> }).actors.AC01000.reviewStatus).toBe('accepted');
    });

    it('does not call the walk finished while an element still awaits review', () => {
      runUbml('walk set IN01000 validated');
      runUbml('walk set IN01010 disputed');

      const out = runUbml('walk next');

      expect(out).not.toContain('finished');
      expect(out).toContain('AC01000');
    });

    it('says when an accepted element rests on a claim nobody validated', () => {
      expect(runUbml('walk set AC01000 accepted'))
        .toContain('"AC01000" is accepted and rests on "IN01000", which is proposed');
    });

    it('says nothing more once that claim is validated', () => {
      runUbml('walk set IN01000 validated');

      expect(runUbml('walk set AC01000 accepted')).not.toContain('is accepted and rests');
    });
  });

  describe('an element that cites no claim', () => {
    beforeEach(() => {
      writeFileSync(join(tempDir, 'actors.ubml.yaml'), `ubml: "${SCHEMA_VERSION}"
actors:
  AC01000:
    name: Someone nobody quoted
    type: role
    kind: human
    reviewStatus: proposed
`);
      writeFileSync(join(tempDir, 'process.ubml.yaml'), `ubml: "${SCHEMA_VERSION}"
processes:
  PR01000:
    name: A process
    steps:
      ST01000:
        name: A step nobody quoted
        kind: action
        reviewStatus: proposed
        derivedFrom: []
`);
    });

    it('still awaits review once every claim is answered', () => {
      runUbml('walk set IN01000 validated');
      runUbml('walk set IN01010 validated');

      const out = runUbml('walk next');

      expect(out).not.toContain('finished');
      expect(out).toContain('AC01000');
      expect(out).toContain('ST01000');
    });

    it('awaits review in a workspace with nothing extracted yet', () => {
      writeFileSync(join(tempDir, 'insights.ubml.yaml'), `ubml: "${SCHEMA_VERSION}"\ninsights: {}\n`);

      const out = runUbml('walk next');

      expect(out).toContain('AC01000');
      expect(out).toContain('ST01000');
    });

    it('awaits review beside claims the walk cannot place', () => {
      writeFileSync(join(tempDir, 'sources.ubml.yaml'), `ubml: "${SCHEMA_VERSION}"\nsources: {}\n`);

      const out = runUbml('walk next');

      expect(out).toContain('IN01000 cites SR01000');
      expect(out).toContain('AC01000');
      expect(out).toContain('ST01000');
    });

    it('can be answered, and says what its acceptance rests on', () => {
      const accepted = runUbml('walk set AC01000 accepted');
      runUbml('walk set ST01000 rejected');

      expect(accepted).toContain('"AC01000" is accepted and cites no insight');
      expect(readFileSync(join(tempDir, 'actors.ubml.yaml'), 'utf8')).toContain('    reviewStatus: accepted\n');
      expect(readFileSync(join(tempDir, 'process.ubml.yaml'), 'utf8')).toContain('        reviewStatus: rejected\n');
    });
  });

  describe('an element that contains other elements', () => {
    // A process holds steps and each of them carries the same field. The
    // process's own sits after them here, which is where anyone writing YAML by
    // hand puts it.
    beforeEach(() => {
      writeFileSync(join(tempDir, 'process.ubml.yaml'), `ubml: "${SCHEMA_VERSION}"
processes:
  PR01000:
    name: A process the claim implies
    steps:
      ST01000:
        name: A step inside it
        kind: action
        reviewStatus: proposed
        derivedFrom: [IN01000]
    reviewStatus: proposed
    derivedFrom: [IN01000]
`);
    });

    it('records the answer against the id it was given', () => {
      runUbml('walk set PR01000 accepted');
      const after = readFileSync(join(tempDir, 'process.ubml.yaml'), 'utf8');

      // Read by position, because both lines say the same thing.
      const [step, process] = after.split('reviewStatus: ').slice(1).map((s) => s.split('\n')[0]);
      expect(step).toBe('proposed');
      expect(process).toBe('accepted');
    });

    it('leaves a nested element to be answered by its own id', () => {
      runUbml('walk set PR01000 accepted');
      runUbml('walk set ST01000 accepted');
      const after = readFileSync(join(tempDir, 'process.ubml.yaml'), 'utf8');

      expect(after.split('reviewStatus: accepted').length - 1).toBe(2);
    });
  });

  it('reports when nothing is left', () => {
    runUbml('walk set IN01000 validated');
    runUbml('walk set IN01010 disputed');

    expect(runUbml('walk next')).toContain('finished');
  });

  it('says to extract a source only when nothing has been extracted', () => {
    writeFileSync(join(tempDir, 'insights.ubml.yaml'), `ubml: "${SCHEMA_VERSION}"\ninsights: {}\n`);

    expect(runUbml('walk next')).toContain('No insights to walk');
  });

  describe('a claim the walk cannot place', () => {
    const UNPLACED = `
  IN01020:
    text: "Written down with no source."
    status: proposed

  IN01030:
    text: "Citing a source nobody registered."
    status: proposed
    source: SR09999
`;

    beforeEach(() => {
      writeFileSync(join(tempDir, 'insights.ubml.yaml'), INSIGHTS + UNPLACED);
    });

    it('is listed once the sourced claims are done, rather than the walk called finished', () => {
      runUbml('walk set IN01000 validated');
      runUbml('walk set IN01010 validated');

      const out = runUbml('walk next');

      expect(out).not.toContain('finished');
      expect(out).toContain('IN01020 cites no source');
      expect(out).toContain('IN01030 cites SR09999');
    });

    it('is listed when no claim cites a source the workspace defines', () => {
      writeFileSync(join(tempDir, 'sources.ubml.yaml'), `ubml: "${SCHEMA_VERSION}"\nsources: {}\n`);

      const out = runUbml('walk next');

      expect(out).not.toContain('No insights to walk');
      for (const id of ['IN01000', 'IN01010', 'IN01020', 'IN01030']) expect(out).toContain(id);
    });

    it('can be settled, and then the walk is finished', () => {
      for (const id of ['IN01000', 'IN01010', 'IN01020', 'IN01030']) runUbml(`walk set ${id} validated`);

      expect(runUbml('walk next')).toContain('finished');
    });
  });

  it('names a file it cannot parse instead of reading it as empty', () => {
    writeFileSync(join(tempDir, 'insights.ubml.yaml'), INSIGHTS.replace(
      '    status: proposed\n    source: SR01000',
      '    status: proposed\n    status: validated\n    source: SR01000',
    ));

    const out = runUbml('walk next');

    expect(out).toContain('insights.ubml.yaml');
    expect(out).toContain('Map keys must be unique');
    expect(out).not.toContain('No insights to walk');
  });

  it('updates a status that carries a comment, and keeps the comment', () => {
    writeFileSync(join(tempDir, 'insights.ubml.yaml'), INSIGHTS.replace(
      '    status: proposed\n    source: SR01000',
      '    status: proposed   # waiting on the reviewer\n    source: SR01000',
    ));

    runUbml('walk set IN01000 validated');
    const after = readFileSync(join(tempDir, 'insights.ubml.yaml'), 'utf8');

    expect(after).toContain('    status: validated   # waiting on the reviewer\n');
    expect(after.split('status:')).toHaveLength(3);
  });

  it('finds a claim whose id carries a comment', () => {
    writeFileSync(join(tempDir, 'insights.ubml.yaml'), INSIGHTS.replace(
      '  IN01000:\n',
      '  IN01000:   # confirmed by phone\n',
    ));

    const out = runUbml('walk set IN01000 validated');

    expect(out).toContain('→');
    expect(readFileSync(join(tempDir, 'insights.ubml.yaml'), 'utf8')).toContain('  IN01000:   # confirmed by phone\n');
    expect(runUbml('walk next')).toContain('IN01010');
  });

  it('reads past a comment line inside a claim', () => {
    writeFileSync(join(tempDir, 'insights.ubml.yaml'), INSIGHTS.replace(
      '    kind: decision\n',
      '    kind: decision\n# checked against the recording\n  # and again on the call\n',
    ));

    const out = runUbml('walk set IN01000 validated');
    const after = readFileSync(join(tempDir, 'insights.ubml.yaml'), 'utf8');

    expect(out).toContain('→');
    expect(after).toContain('  # and again on the call\n    status: validated\n');
    expect((parse(after) as { insights: Record<string, { status: string }> }).insights.IN01000.status).toBe('validated');
  });

  it('takes an id as written, whatever characters it carries', () => {
    writeFileSync(join(tempDir, 'insights.ubml.yaml'), INSIGHTS.replace('  IN01000:\n', '  IN0100[:\n'));

    const out = runUbml('walk set "IN0100[" validated');
    const after = readFileSync(join(tempDir, 'insights.ubml.yaml'), 'utf8');

    expect(out).toContain('→');
    expect((parse(after) as { insights: Record<string, { status: string }> }).insights['IN0100['].status).toBe('validated');
  });

  it.each([
    ['a block scalar', '    status: >-\n      proposed\n', 'runs on past its own line'],
    ['a value on the next line', '    status:\n      proposed\n', 'runs on past its own line'],
    ['a quoted key', '    "status": proposed\n', 'which this does not rewrite'],
    ['a space before the colon', '    status : proposed\n', 'which this does not rewrite'],
  ])('refuses a status written as %s, says why, and leaves the file as it was', (_, written, why) => {
    const before = INSIGHTS.replace('    kind: decision\n    status: proposed\n', `    kind: decision\n${written}`);
    writeFileSync(join(tempDir, 'insights.ubml.yaml'), before);

    const out = runUbml('walk set IN01000 validated');
    const after = readFileSync(join(tempDir, 'insights.ubml.yaml'), 'utf8');

    expect(out).not.toContain('→');
    expect(out).toContain('IN01000');
    expect(out).toContain(why);
    expect(out).toContain('Nothing was written');
    expect(after).toBe(before);
    expect((parse(after) as { insights: Record<string, { status: string }> }).insights.IN01000.status).toBe('proposed');
  });

  it.each([
    [
      'an anchor an alias further down still names',
      'IN01010',
      (text: string) => text
        .replace('    status: proposed\n    source: SR01010\n', '    status: &open proposed\n    source: SR01010\n')
        .replace('    status: proposed\n    source: SR01000\n', '    status: *open\n    source: SR01000\n'),
    ],
    [
      'an anchor shadowing another of the same name',
      'IN01000',
      (text: string) => text
        .replace('    text: "From the earlier note."\n', '    text: &said "From the earlier note."\n')
        .replace('    status: proposed\n    source: SR01000\n', '    status: &said proposed\n    source: SR01000\n    notes: *said\n'),
    ],
  ])('refuses a rewrite that would change more than the status, through %s', (_, id, edit) => {
    const before = edit(INSIGHTS);
    expect(before).not.toBe(INSIGHTS);
    writeFileSync(join(tempDir, 'insights.ubml.yaml'), before);

    const out = runUbml(`walk set ${id} validated`);

    expect(out).toContain(`Rewriting ${id}'s status would`);
    expect(out).toContain('Nothing was written');
    expect(readFileSync(join(tempDir, 'insights.ubml.yaml'), 'utf8')).toBe(before);
  });
});
