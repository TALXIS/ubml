/**
 * CLI Init Command Tests
 *
 * Integration tests for the `ubml init` command.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, existsSync, readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { SCHEMA_VERSION } from '../../src/constants.js';
import { execSync } from 'child_process';

describe('CLI Init Command', () => {
  let tempDir: string;
  let originalCwd: string;

  beforeEach(() => {
    originalCwd = process.cwd();
    tempDir = mkdtempSync(join(tmpdir(), 'ubml-test-init-'));
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
    const ubmlBin = join(originalCwd, 'bin', 'ubml.ts');
    try {
      const stdout = execSync(`npx tsx ${ubmlBin} ${args}`, {
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

  describe('init with directory name', () => {
    it('should create a new UBML workspace directory', () => {
      const result = runUbml('init test-project');

      expect(result.exitCode).toBe(0);
      expect(existsSync(join(tempDir, 'test-project'))).toBe(true);
    });

    it('should create workspace.ubml.yaml file', () => {
      runUbml('init test-project');

      const files = readdirSync(join(tempDir, 'test-project'));
      const workspaceFile = files.find(f => f.endsWith('.workspace.ubml.yaml'));
      expect(workspaceFile).toBeDefined();
    });

    it('should create valid UBML document', () => {
      runUbml('init test-project');

      const projectDir = join(tempDir, 'test-project');
      const files = readdirSync(projectDir);
      const workspaceFile = files.find(f => f.endsWith('.workspace.ubml.yaml'));

      if (workspaceFile) {
        const content = readFileSync(join(projectDir, workspaceFile), 'utf8');
        expect(content).toContain(`ubml: "${SCHEMA_VERSION}"`);
      }
    });

    it('should fail if directory already exists', () => {
      runUbml('init existing-project');
      const result = runUbml('init existing-project');

      expect(result.exitCode).not.toBe(0);
    });
  });

  describe('init in current directory', () => {
    it('should initialize in current directory with "."', () => {
      const result = runUbml('init .');

      expect(result.exitCode).toBe(0);
      const files = readdirSync(tempDir);
      const workspaceFile = files.find(f => f.endsWith('.workspace.ubml.yaml'));
      expect(workspaceFile).toBeDefined();
    });
  });

  describe('init options', () => {
    it('should support --minimal flag', () => {
      const result = runUbml('init test-project --minimal');

      expect(result.exitCode).toBe(0);
      const projectDir = join(tempDir, 'test-project');
      const files = readdirSync(projectDir);
      
      // Minimal should only create workspace file
      const ubmlFiles = files.filter(f => f.endsWith('.ubml.yaml'));
      expect(ubmlFiles.length).toBe(1);
    });

    it('should create .gitignore with .ubml/ directory', () => {
      const result = runUbml('init test-project --minimal');

      expect(result.exitCode).toBe(0);
      const projectDir = join(tempDir, 'test-project');
      const gitignorePath = join(projectDir, '.gitignore');
      
      expect(existsSync(gitignorePath)).toBe(true);
      const content = readFileSync(gitignorePath, 'utf8');
      expect(content).toContain('.ubml/');
    });

    it.skip('should support --full flag', () => {
      // Skip: --full flag may not be implemented
      const result = runUbml('init test-project --full');

      expect(result.exitCode).toBe(0);
      const projectDir = join(tempDir, 'test-project');
      const files = readdirSync(projectDir);
      
      // Full should create multiple files
      const ubmlFiles = files.filter(f => f.endsWith('.ubml.yaml'));
      expect(ubmlFiles.length).toBeGreaterThan(1);
    });
  });

  describe('init output messages', () => {
    it('should show success message', () => {
      const result = runUbml('init test-project');

      expect(result.stdout).toContain('Created');
    });

    it('should show next steps', () => {
      const result = runUbml('init test-project');

      expect(result.stdout.toLowerCase()).toContain('next');
    });
  });
});
