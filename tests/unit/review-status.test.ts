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
import { validateDocuments, validateWorkspaceStructure } from '../../src/semantic-validator.js';
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

describe('an approval without validated evidence', () => {
  function insights(status: string): [string, string] {
    return [
      'insights.ubml.yaml',
      `ubml: "${SCHEMA_VERSION}"\ninsights:\n  IN00001:\n    text: Invoices wait for a signature.\n    status: ${status}\n`,
    ];
  }

  const ACCEPTED = '  AC00001:\n    name: Approver\n    type: role\n    kind: human\n    reviewStatus: accepted\n';

  function approvals(...files: [string, string][]) {
    return validateDocuments(docs(...files)).warnings.filter(
      (w) => w.code === 'ubml/accepted-on-unvalidated-insight'
    );
  }

  it('is reported for an accepted element resting on a proposed insight', () => {
    const found = approvals(insights('proposed'), actors(`${ACCEPTED}    derivedFrom: [IN00001]\n`));

    expect(found).toHaveLength(1);
    expect(found[0].message).toContain('AC00001');
    expect(found[0].message).toContain('IN00001');
    expect(found[0].message).toContain('proposed');
    expect(found[0].filepath).toBe('actors.ubml.yaml');
  });

  it('is not reported once that insight is validated', () => {
    expect(approvals(insights('validated'), actors(`${ACCEPTED}    derivedFrom: [IN00001]\n`))).toHaveLength(0);
  });

  it('is reported for an accepted element that cites no insight at all', () => {
    const found = approvals(insights('validated'), actors(ACCEPTED));

    expect(found).toHaveLength(1);
    expect(found[0].message).toContain('cites no insight');
  });

  it('reads an insight with no status as proposed, the schema default', () => {
    const unmarked: [string, string] = [
      'insights.ubml.yaml',
      `ubml: "${SCHEMA_VERSION}"\ninsights:\n  IN00001:\n    text: Invoices wait for a signature.\n`,
    ];

    const found = approvals(unmarked, actors(`${ACCEPTED}    derivedFrom: [IN00001]\n`));

    expect(found).toHaveLength(1);
    expect(found[0].message).toContain('which is proposed');
  });

  it('is not reported for an element still proposed', () => {
    const proposed = ACCEPTED.replace('accepted', 'proposed');

    expect(approvals(insights('proposed'), actors(`${proposed}    derivedFrom: [IN00001]\n`))).toHaveLength(0);
  });
});
