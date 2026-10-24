/**
 * Source companion-file tests.
 *
 * A source entry exists so a quote can be checked against what was read. That
 * guarantee is only real if the companion file resolves, and it silently is not
 * when `file` holds a URL - which validated cleanly before this check.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { validateWorkspace } from '../../src/node/validator.js';
import { SCHEMA_VERSION } from '../../src/constants.js';

describe('source companion files', () => {
  let dir: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'ubml-sourcefile-'));
    writeFileSync(join(dir, 'test.workspace.ubml.yaml'), `ubml: "${SCHEMA_VERSION}"\nname: test\n`);
  });

  afterEach(() => rmSync(dir, { recursive: true, force: true }));

  function sources(body: string) {
    writeFileSync(join(dir, 'sources.ubml.yaml'), `ubml: "${SCHEMA_VERSION}"\nsources:\n${body}`);
  }

  function codes(result: Awaited<ReturnType<typeof validateWorkspace>>) {
    return result.files.flatMap((f) => f.errors.map((e) => e.code));
  }

  it('accepts a companion file that exists', async () => {
    mkdirSync(join(dir, 'sources'));
    writeFileSync(join(dir, 'sources', 'call.md'), 'what was actually said');
    sources('  SR01000:\n    name: A call\n    file: ./sources/call.md\n');

    const result = await validateWorkspace(dir);

    expect(codes(result)).not.toContain('SOURCE_FILE_MISSING');
    expect(result.valid).toBe(true);
  });

  it('rejects a companion file that does not exist', async () => {
    sources('  SR01000:\n    name: A call\n    file: ./sources/missing.md\n');

    const result = await validateWorkspace(dir);

    // Worse than absent: it looks like the evidence is filed when it is not.
    expect(codes(result)).toContain('SOURCE_FILE_MISSING');
    expect(result.valid).toBe(false);
  });

  it('rejects a URL in file, which is what url is for', async () => {
    sources('  SR01000:\n    name: A call\n    file: https://sharepoint.example/recording.vtt\n');

    const result = await validateWorkspace(dir);

    expect(codes(result)).toContain('SOURCE_FILE_IS_URL');
    expect(result.valid).toBe(false);
  });

  it('says nothing about a source with no companion file', async () => {
    // A corridor conversation has no artefact. That is a real source.
    sources('  SR01000:\n    name: A corridor conversation\n    type: interview\n');

    const result = await validateWorkspace(dir);

    expect(codes(result)).not.toContain('SOURCE_FILE_MISSING');
    expect(result.valid).toBe(true);
  });

  it('leaves url alone', async () => {
    sources(
      '  SR01000:\n    name: A call\n' +
      '    url: https://sharepoint.example/recording.vtt\n'
    );

    const result = await validateWorkspace(dir);

    expect(codes(result)).toHaveLength(0);
    expect(result.valid).toBe(true);
  });
});
