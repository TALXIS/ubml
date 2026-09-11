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
      return (error as { stdout?: string }).stdout || '';
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

    expect(out).toContain('the verbatim thing someone said');
    expect(out).toContain('From the earlier note.');
    // Both quoted, because both are things the reviewer is asked to agree with.
    expect(out).toContain('> the verbatim thing someone said');
    expect(out).toContain('> From the earlier note.');
  });

  it('puts the source before the extraction, and the ID last', () => {
    const out = runUbml('walk next');

    // The rules this replaces used to live in the skill: label both blocks,
    // evidence before claim, ID last so the reviewer reads before decoding.
    expect(out.indexOf('the verbatim thing someone said'))
      .toBeLessThan(out.indexOf('From the earlier note.'));
    expect(out.indexOf('From the earlier note.')).toBeLessThan(out.indexOf('IN01000'));
    expect(out.trimEnd().endsWith('IN01000')).toBe(true);
  });

  it('leads with position, not identity', () => {
    const out = runUbml('walk next');

    expect(out).toMatch(/source 1\/2, 1\/1 claims/);
    expect(out.indexOf('source 1/2')).toBeLessThan(out.indexOf('IN01000'));
  });

  it('opens a source with what it is and who was there', () => {
    const out = runUbml('walk next');

    // A name alone left the reviewer nothing to go and check the claim against.
    expect(out).toContain('claims 1');
    expect(out).toContain('type document');
  });

  it('shows every field of the claim, not the handful it once loaded', () => {
    const out = runUbml('walk next');

    // Tags, links and the note explaining the reading never reached the
    // reviewer, because the loader did not read them off the file.
    expect(out).toContain('kind ');
    expect(out).toContain('confidence ');
    expect(out).toContain('date ');
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
      expect(out).toContain('Model Update');
      expect(out).toContain('actor');
      // Named, not numbered: an id tells a reviewer nothing about whether the
      // element is right.
      expect(out).toContain('Someone the claim implies');
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
  });

  it('reports when nothing is left', () => {
    runUbml('walk set IN01000 validated');
    runUbml('walk set IN01010 disputed');

    expect(runUbml('walk next')).toContain('finished');
  });
});
