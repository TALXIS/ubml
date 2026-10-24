/**
 * `ubml next` — what is outstanding, and who owes the next move.
 *
 * The tests assert the contract rather than the wording: one undecided thing
 * reads as one item, scope is a union, unreviewed work gates the rest, and
 * nobody is named as an answerer unless the workspace says so.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { execSync } from 'child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join, resolve } from 'path';
import { SCHEMA_VERSION } from '../../src/constants.js';

let dir: string;

// The built binary, as the other CLI suites use. Spawning tsx per test is slow
// enough to flake against the default timeout.
const ubmlBin = resolve(process.cwd(), 'dist', 'cli.js');

const write = (name: string, body: string[]): void =>
  writeFileSync(join(dir, name), `${body.join('\n')}\n`, 'utf8');

function runUbml(args: string): string {
  return execSync(`node ${ubmlBin} ${args} -d "${dir}"`, {
    encoding: 'utf8',
    env: { ...process.env, FORCE_COLOR: '0' },
  });
}

beforeAll(() => {
  dir = mkdtempSync(join(tmpdir(), 'ubml-next-'));

  write('insights.ubml.yaml', [
    `ubml: "${SCHEMA_VERSION}"`,
    'name: Insights',
    'insights:',
    '  IN00001:',
    '    text: An undecided thing standing on its own.',
    '    status: deferred',
    '    tags: [billing]',
    '  IN00002:',
    '    text: The head of something undecided with nothing authored.',
    '    status: deferred',
    '    tags: [billing]',
    '    related: [IN00003]',
    '  IN00003:',
    '    text: A consequence of that same undecided thing.',
    '    status: deferred',
    '    tags: [billing]',
    '  IN00004:',
    '    text: A question for a named person.',
    '    status: deferred',
    '    tags: [fulfilment]',
    '    custom:',
    '      answeredBy: AC00004',
    '  IN00005:',
    '    text: A claim in another capability entirely.',
    '    status: deferred',
    '    tags: [warehousing]',
    '  IN00006:',
    '    text: A settled claim.',
    '    status: validated',
    '    tags: [billing]',
    '  IN00008:',
    '    text: A question for a named person, written as a field.',
    '    status: deferred',
    '    tags: [fulfilment]',
    '    answeredBy: AC00009',
  ]);
});

afterAll(() => rmSync(dir, { recursive: true, force: true }));

// Each run spawns the CLI, so the distinct ones are taken once here and the
// tests read them. Six spawns for six assertions is load this suite does not
// need to add.
let oneTag: string;
let twoTags: string;
let filtered: string;
let midWalk: string;
let nobody: string;

describe('ubml next', () => {
  beforeAll(() => {
    oneTag = runUbml('next billing');
    twoTags = runUbml('next fulfilment billing');
    filtered = runUbml('next fulfilment billing --with AC00004');
    nobody = runUbml('next fulfilment billing --with nobody');

    write('more.insights.ubml.yaml', [
      `ubml: "${SCHEMA_VERSION}"`,
      'name: More',
      'insights:',
      '  IN00007:',
      '    text: Extracted and never reviewed.',
      '    status: proposed',
      '    tags: [billing]',
    ]);
    midWalk = runUbml('next billing');
    rmSync(join(dir, 'more.insights.ubml.yaml'));
  }, 60_000);

  it('keeps linked claims with nothing authored as one item', () => {
    expect(oneTag).toContain('The head of something undecided with nothing authored.');
    expect(oneTag).not.toContain('A consequence of that same undecided thing.');
    expect(oneTag).toContain('1 more claim');
  });

  it('takes several tags as a union', () => {
    expect(twoTags).toContain('A question for a named person.');
    expect(twoTags).toContain('The head of something undecided with nothing authored.');
    expect(twoTags).not.toContain('A claim in another capability entirely.');
  });

  it('names an answerer only when the workspace does', () => {
    expect(twoTags).toContain('AC00004');
    expect(twoTags).toContain('unassigned');
  });

  it('reads the field, and still reads the key that predates it', () => {
    // `custom.answeredBy` is what workspaces used before answeredBy was a
    // field. Both have to resolve, or promoting it silently unassigns every
    // question somebody has already answered for.
    const both = runUbml('next fulfilment');

    expect(both).toContain('AC00009');   // the field, on IN00008
    expect(both).toContain('AC00004');   // custom.answeredBy, on IN00004

    expect(runUbml('next --with AC00009')).toContain('written as a field');
    expect(runUbml('next --with AC00004')).not.toContain('written as a field');
  });

  it('leaves settled claims out', () => {
    expect(oneTag).not.toContain('A settled claim.');
  });

  it('narrows to what one person can answer', () => {
    expect(filtered).toContain('A question for a named person.');
    expect(filtered).not.toContain('The head of something undecided with nothing authored.');
  });

  it('names the filter when it leaves nothing', () => {
    expect(nobody).toContain('Nothing deferred to anyone matching "nobody".');
    expect(nobody).not.toContain('Nothing is waiting on anybody');
  });

  it('says the list is incomplete while anything is unreviewed', () => {
    expect(midWalk).toContain('incomplete');
    expect(midWalk).toContain('walk next');
  });
});
