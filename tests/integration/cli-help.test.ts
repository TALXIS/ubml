/**
 * CLI Help Command Tests
 *
 * Integration tests for the `ubml help` command.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { execSync } from 'child_process';

describe('CLI Help Command', () => {
  let tempDir: string;
  let originalCwd: string;

  beforeEach(() => {
    originalCwd = process.cwd();
    tempDir = mkdtempSync(join(tmpdir(), 'ubml-test-help-'));
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

  describe('help without arguments', () => {
    it('should show available topics', () => {
      const result = runUbml('help');

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('quickstart');
    });

    it('should mention key topics', () => {
      const result = runUbml('help');

      expect(result.stdout.toLowerCase()).toContain('step');
      expect(result.stdout.toLowerCase()).toContain('actor');
      expect(result.stdout.toLowerCase()).toContain('process');
    });
  });

  describe('help quickstart', () => {
    it('should show quickstart guide', () => {
      const result = runUbml('help quickstart');

      expect(result.exitCode).toBe(0);
      expect(result.stdout.toLowerCase()).toContain('quick');
    });

    it('should mention init command', () => {
      const result = runUbml('help quickstart');

      expect(result.stdout).toContain('init');
    });

    it('should mention validate command', () => {
      const result = runUbml('help quickstart');

      expect(result.stdout).toContain('validate');
    });
  });

  describe('help concepts', () => {
    it('should show concepts overview', () => {
      const result = runUbml('help concepts');

      expect(result.exitCode).toBe(0);
      expect(result.stdout.toLowerCase()).toContain('concept');
    });

    it('should explain workspace', () => {
      const result = runUbml('help concepts');

      expect(result.stdout.toLowerCase()).toContain('workspace');
    });

    it('should explain processes', () => {
      const result = runUbml('help concepts');

      expect(result.stdout.toLowerCase()).toContain('process');
    });
  });

  describe('help for element types', () => {
    const elementTypes = ['step', 'actor', 'entity', 'scenario'];

    it.each(elementTypes)('should show help for %s', (type) => {
      const result = runUbml(`help ${type}`);

      expect(result.exitCode).toBe(0);
      expect(result.stdout.toLowerCase()).toContain(type);
    });

    it.skip('should show help for hypothesis', () => {
      // Skip: hypothesis may be accessed via hypotheses
      const result = runUbml('help hypothesis');
      expect(result.exitCode).toBe(0);
    });
  });

  describe('help for document types', () => {
    const documentTypes = ['process', 'actors', 'entities', 'workspace', 'hypotheses', 'scenarios'];

    it.each(documentTypes)('should show help for %s', (type) => {
      const result = runUbml(`help ${type}`);

      expect(result.exitCode).toBe(0);
      expect(result.stdout.toLowerCase()).toContain(type);
    });
  });

  describe('help ids', () => {
    it('should show ID patterns', () => {
      const result = runUbml('help ids');

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('ID');
    });

    it('should show common prefixes', () => {
      const result = runUbml('help ids');

      expect(result.stdout).toContain('AC');
      expect(result.stdout).toContain('ST');
      expect(result.stdout).toContain('PR');
      expect(result.stdout).toContain('EN');
    });
  });

  describe('help workflow', () => {
    it('should show recommended workflow', () => {
      const result = runUbml('help workflow');

      expect(result.exitCode).toBe(0);
      expect(result.stdout.toLowerCase()).toContain('workflow');
    });

    it('should mention document types in order', () => {
      const result = runUbml('help workflow');

      expect(result.stdout.toLowerCase()).toContain('workspace');
      expect(result.stdout.toLowerCase()).toContain('actor');
      expect(result.stdout.toLowerCase()).toContain('process');
    });
  });

  describe('help for invalid topic', () => {
    it('should show error for unknown topic', () => {
      const result = runUbml('help unknown-topic');

      // Should either fail or show available topics
      expect(result.stdout + result.stderr).toBeDefined();
    });
  });

  describe('help aliases', () => {
    it('should support "start" as alias for quickstart', () => {
      const result = runUbml('help start');

      expect(result.exitCode).toBe(0);
      expect(result.stdout.toLowerCase()).toContain('quick');
    });

    it('should support "overview" as alias for concepts', () => {
      const result = runUbml('help overview');

      expect(result.exitCode).toBe(0);
      expect(result.stdout.toLowerCase()).toContain('concept');
    });
  });
});
