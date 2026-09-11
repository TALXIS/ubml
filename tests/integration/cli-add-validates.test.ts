/**
 * Scaffold-validates Tests
 *
 * Every document type `ubml add` can create must produce a document that
 * `ubml validate` accepts. A scaffold that fails validation teaches the wrong
 * shape: the natural reading is that the schema is stricter than documented,
 * not that the template is stale.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { execSync } from 'child_process';
import { SCHEMA_VERSION } from '../../src/constants.js';
import { DOCUMENT_TYPES } from '../../src/generated/data.js';

describe('every add scaffold validates', () => {
  let tempDir: string;
  let originalCwd: string;

  beforeEach(() => {
    originalCwd = process.cwd();
    tempDir = mkdtempSync(join(tmpdir(), 'ubml-scaffold-'));
    writeFileSync(
      join(tempDir, 'test.workspace.ubml.yaml'),
      `ubml: "${SCHEMA_VERSION}"\nname: test\n`
    );
  });

  afterEach(() => {
    process.chdir(originalCwd);
    rmSync(tempDir, { recursive: true, force: true });
  });

  function runUbml(args: string): { stdout: string; exitCode: number } {
    const ubmlBin = join(originalCwd, 'dist', 'cli.js');
    try {
      return {
        stdout: execSync(`node ${ubmlBin} ${args}`, {
          cwd: tempDir,
          encoding: 'utf8',
          stdio: ['pipe', 'pipe', 'pipe'],
        }),
        exitCode: 0,
      };
    } catch (error: unknown) {
      const e = error as { stdout?: string; status?: number };
      return { stdout: e.stdout || '', exitCode: e.status || 1 };
    }
  }

  // The workspace document is created by `init`, not `add`.
  const scaffoldable = DOCUMENT_TYPES.filter((t) => t !== 'workspace');

  it.each(scaffoldable)('add %s produces a valid document', (type) => {
    const added = runUbml(`add ${type} sample`);
    expect(added.exitCode, `ubml add ${type} failed:\n${added.stdout}`).toBe(0);

    const validated = runUbml('validate .');
    expect(
      validated.stdout,
      `ubml add ${type} scaffolds a document validate rejects:\n${validated.stdout}`
    ).not.toMatch(/\berror\b/);
    expect(validated.exitCode).toBe(0);
  }, 20000);
});
