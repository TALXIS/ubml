import { describe, it, expect } from 'vitest';
import { parse } from '../../src/parser.js';
import { validateDocuments } from '../../src/semantic-validator.js';

const workspace = (older?: string) => [
  parse(
    [
      'ubml: "1.4"',
      'name: Test',
      'insights:',
      '  IN00001:',
      '    text: The older claim.',
      ...(older ? [`    status: ${older}`] : []),
      '  IN00002:',
      '    text: The newer claim.',
      '    status: validated',
      '    supersedes: IN00001',
      '    related: [IN00001]',
      '',
    ].join('\n'),
    'insights.ubml.yaml',
  ).document!,
];

describe('an insight that has been replaced', () => {
  it('is reported while it still asserts itself', () => {
    const { warnings } = validateDocuments(workspace('validated'));
    const found = warnings.filter((w) => w.code === 'ubml/superseded-not-retired');

    expect(found).toHaveLength(1);
    // The reader is told which claim replaced which, and what state it is in.
    expect(found[0].message).toContain('IN00002');
    expect(found[0].message).toContain('IN00001');
    expect(found[0].message).toContain('validated');
  });

  it('is not reported once it is retired', () => {
    const { warnings } = validateDocuments(workspace('retired'));

    expect(warnings.filter((w) => w.code === 'ubml/superseded-not-retired')).toHaveLength(0);
  });

  it('reads an older claim with no status as proposed, the schema default', () => {
    const { warnings } = validateDocuments(workspace());
    const found = warnings.filter((w) => w.code === 'ubml/superseded-not-retired');

    expect(found).toHaveLength(1);
    expect(found[0].message).toContain('which is still proposed');
  });
});
