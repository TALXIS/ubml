/**
 * Regression test: schema validation errors must surface from validateWorkspace().
 *
 * validateWorkspace() (used by `ubml validate <dir>`) previously dropped every
 * schema-level error, because the per-document schema check never attached a
 * `filepath` to its errors, and validateWorkspace() only attaches an error to
 * a file result when `filepath` is set. Malformed files therefore validated
 * clean under `ubml validate .` even though `ubml validate <file>` correctly
 * reported the same errors.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { SCHEMA_VERSION } from '../../src/constants.js';
import { validateWorkspace } from '../../src/node/index.js';

describe('validateWorkspace schema errors', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'ubml-test-validate-workspace-'));
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  it('reports schema violations (not just reference/semantic issues) for a file in a workspace', async () => {
    writeFileSync(
      join(tempDir, 'actors.ubml.yaml'),
      `ubml: "${SCHEMA_VERSION}"
actors:
  AC00001:
    type: not-a-valid-type
    bogusProperty: "should fail schema validation"
`
    );

    const result = await validateWorkspace(tempDir);

    expect(result.valid).toBe(false);
    expect(result.errorCount).toBeGreaterThan(0);

    const fileResult = result.files.find((f) => f.path.endsWith('actors.ubml.yaml'));
    expect(fileResult).toBeDefined();
    expect(fileResult!.errors.length).toBeGreaterThan(0);
    expect(fileResult!.errors.some((e) => e.code === 'additionalProperties')).toBe(true);
    expect(fileResult!.errors.some((e) => e.code === 'enum')).toBe(true);
  });
});
