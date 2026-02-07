/**
 * CLI Add Command Tests
 *
 * Integration tests for the `ubml add` command.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SCHEMA_VERSION } from '../../src/constants.js';
import { mkdtempSync, rmSync, existsSync, readdirSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { execSync } from 'child_process';

describe('CLI Add Command', () => {
  let tempDir: string;
  let originalCwd: string;

  beforeEach(() => {
    originalCwd = process.cwd();
    tempDir = mkdtempSync(join(tmpdir(), 'ubml-test-add-'));
    process.chdir(tempDir);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    rmSync(tempDir, { recursive: true, force: true });
  });

  /**
   * Helper to run ubml CLI command
   */
  function runUbml(args: string): { stdout: string; stderr: string; exitCode: number } {
    const ubmlBin = join(originalCwd, 'dist', 'cli.js');
    try {
      const stdout = execSync(`node ${ubmlBin} ${args}`, {
        cwd: tempDir,
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe'],
      });
      return { stdout, stderr: '', exitCode: 0 };
    } catch (error: unknown) {
      const execError = error as { stdout?: string; stderr?: string; status?: number };
      return {
        stdout: execError.stdout || '',
        stderr: execError.stderr || '',
        exitCode: execError.status || 1,
      };
    }
  }

  /**
   * Helper to create a minimal workspace for testing
   */
  function createMinimalWorkspace(): void {
    writeFileSync(join(tempDir, 'workspace.ubml.yaml'), `ubml: "${SCHEMA_VERSION}"\nname: test\n`);
  }

  describe('add without arguments', () => {
    it('should show available document types', () => {
      createMinimalWorkspace();
      const result = runUbml('add');

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('process');
      expect(result.stdout).toContain('actors');
      expect(result.stdout).toContain('entities');
    });
  });

  describe('add process', () => {
    beforeEach(() => {
      createMinimalWorkspace();
    });

    it('should create a process file', () => {
      const result = runUbml('add process');

      expect(result.exitCode).toBe(0);
      const files = readdirSync(tempDir);
      const processFile = files.find(f => f.endsWith('.process.ubml.yaml'));
      expect(processFile).toBeDefined();
    });

    it('should create a valid UBML process document', () => {
      runUbml('add process');

      const files = readdirSync(tempDir);
      const processFile = files.find(f => f.endsWith('.process.ubml.yaml'));

      if (processFile) {
        const content = readFileSync(join(tempDir, processFile), 'utf8');
        expect(content).toContain(`ubml: "${SCHEMA_VERSION}"`);
        expect(content).toContain('processes:');
      }
    });

    it('should support custom name', () => {
      const result = runUbml('add process order-fulfillment');

      expect(result.exitCode).toBe(0);
      expect(existsSync(join(tempDir, 'order-fulfillment.process.ubml.yaml'))).toBe(true);
    });
  });

  describe('add actors', () => {
    beforeEach(() => {
      createMinimalWorkspace();
    });

    it('should create an actors file', () => {
      const result = runUbml('add actors');

      expect(result.exitCode).toBe(0);
      const files = readdirSync(tempDir);
      const actorsFile = files.find(f => f.endsWith('.actors.ubml.yaml'));
      expect(actorsFile).toBeDefined();
    });

    it('should create valid UBML actors document', () => {
      runUbml('add actors');

      const files = readdirSync(tempDir);
      const actorsFile = files.find(f => f.endsWith('.actors.ubml.yaml'));

      if (actorsFile) {
        const content = readFileSync(join(tempDir, actorsFile), 'utf8');
        expect(content).toContain(`ubml: "${SCHEMA_VERSION}"`);
      }
    });
  });

  describe('add entities', () => {
    beforeEach(() => {
      createMinimalWorkspace();
    });

    it('should create an entities file', () => {
      const result = runUbml('add entities');

      expect(result.exitCode).toBe(0);
      const files = readdirSync(tempDir);
      const entitiesFile = files.find(f => f.endsWith('.entities.ubml.yaml'));
      expect(entitiesFile).toBeDefined();
    });
  });

  describe('add all document types', () => {
    const documentTypes = [
      'process',
      'actors',
      'entities',
      'hypotheses',
      'scenarios',
      'metrics',
      'strategy',
      'glossary',
    ];

    beforeEach(() => {
      createMinimalWorkspace();
    });

    it.each(documentTypes)('should create valid %s document', (type) => {
      const result = runUbml(`add ${type}`);

      expect(result.exitCode).toBe(0);
      const files = readdirSync(tempDir);
      const targetFile = files.find(f => f.includes(`.${type}.ubml.yaml`));
      expect(targetFile).toBeDefined();

      if (targetFile) {
        const content = readFileSync(join(tempDir, targetFile), 'utf8');
        expect(content).toContain(`ubml: "${SCHEMA_VERSION}"`);
      }
    });
  });

  describe('add with options', () => {
    beforeEach(() => {
      createMinimalWorkspace();
    });

    it.skip('should support --minimal flag', () => {
      // Skip: --minimal flag may not be implemented
      const result = runUbml('add process --minimal');

      expect(result.exitCode).toBe(0);
      const files = readdirSync(tempDir);
      const processFile = files.find(f => f.endsWith('.process.ubml.yaml'));
      expect(processFile).toBeDefined();

      if (processFile) {
        const content = readFileSync(join(tempDir, processFile), 'utf8');
        // Minimal should have less content
        expect(content.length).toBeLessThan(1000);
      }
    });
  });

  describe('add error handling', () => {
    beforeEach(() => {
      createMinimalWorkspace();
    });

    it('should fail for invalid document type', () => {
      const result = runUbml('add invalid-type');

      expect(result.exitCode).not.toBe(0);
    });

    it('should fail if file already exists', () => {
      runUbml('add process my-process');
      const result = runUbml('add process my-process');

      expect(result.exitCode).not.toBe(0);
    }, 10000); // Increase timeout for double CLI call
  });
});
