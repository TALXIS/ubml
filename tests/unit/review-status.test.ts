/**
 * Review Status Tests
 *
 * `derivedFrom` proves an element came from evidence somebody confirmed. It says
 * nothing about whether anyone agreed the evidence should become THIS element.
 * `reviewStatus` records that second judgement, and the validator has to make an
 * unapproved one visible rather than let it pass as reviewed.
 */

import { describe, it, expect } from 'vitest';
import { parse } from '../../src/parser.js';
import { validateWorkspaceStructure } from '../../src/semantic-validator.js';
import { SCHEMA_VERSION } from '../../src/constants.js';

function docs(...files: [string, string][]) {
  return files.map(([name, body]) => {
    const result = parse(body, name);
    if (!result.document) throw new Error('fixture did not parse: ' + name);
    return result.document;
  });
}

const WORKSPACE: [string, string] = [
  'test.workspace.ubml.yaml',
  `ubml: "${SCHEMA_VERSION}"\nname: test\n`,
];

function actors(body: string): [string, string] {
  return ['actors.ubml.yaml', `ubml: "${SCHEMA_VERSION}"\nactors:\n${body}`];
}

function findWarning(result: ReturnType<typeof validateWorkspaceStructure>) {
  return result.warnings.find((w) => w.code === 'ubml/unreviewed-model-elements');
}

describe('reviewStatus', () => {
  it('warns when a modelling decision is still proposed', () => {
    const result = validateWorkspaceStructure(
      docs(WORKSPACE, actors(
        '  AC00001:\n    name: Suggested\n    type: role\n    kind: human\n    reviewStatus: proposed\n'
      ))
    );

    const warning = findWarning(result);
    expect(warning).toBeDefined();
    expect(warning?.message).toContain('1 model element carries');
    expect(warning?.files).toContain('actors.ubml.yaml');
  });

  it('says nothing about an accepted decision', () => {
    const result = validateWorkspaceStructure(
      docs(WORKSPACE, actors(
        '  AC00001:\n    name: Reviewed\n    type: role\n    kind: human\n    reviewStatus: accepted\n'
      ))
    );

    expect(findWarning(result)).toBeUndefined();
  });

  it('reads nothing into an absent reviewStatus', () => {
    // P4.4: absence means not specified, never accepted. It raises no hint,
    // and it does not count as approval either.
    const result = validateWorkspaceStructure(
      docs(WORKSPACE, actors('  AC00001:\n    name: Legacy\n    type: role\n    kind: human\n'))
    );

    expect(findWarning(result)).toBeUndefined();
  });

  it('counts nested elements, not just top-level ones', () => {
    // Steps live inside a process and carry reviewStatus too.
    const process: [string, string] = [
      'process.ubml.yaml',
      `ubml: "${SCHEMA_VERSION}"
processes:
  PR00001:
    name: Something
    reviewStatus: proposed
    steps:
      ST00001:
        name: A step
        kind: action
        reviewStatus: proposed
`,
    ];

    const result = validateWorkspaceStructure(docs(WORKSPACE, process));

    expect(findWarning(result)?.message).toContain('2 model elements carry');
  });

  it('reports each file once however many elements it holds', () => {
    const result = validateWorkspaceStructure(
      docs(WORKSPACE, actors(
        '  AC00001:\n    name: One\n    type: role\n    kind: human\n    reviewStatus: proposed\n' +
        '  AC00002:\n    name: Two\n    type: role\n    kind: human\n    reviewStatus: proposed\n'
      ))
    );

    const warning = findWarning(result);
    expect(warning?.message).toContain('2 model elements');
    expect(warning?.files).toEqual(['actors.ubml.yaml']);
  });
});
