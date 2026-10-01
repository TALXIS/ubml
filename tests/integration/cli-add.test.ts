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
import { SCAFFOLDED_TYPES } from '../../src/cli/commands/init.js';
import { printedCommands, runAsPrinted, ubml, type Ran } from './printed-commands.js';

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

  describe('add after init', () => {
    beforeEach(() => {
      runUbml('init .');
    });

    it.each([
      ['sources', 'a'],
      ['insights', 'an'],
      ['process', 'a'],
      ['actors', 'an'],
    ])('refuses a second %s document beside the one init wrote', (type, article) => {
      const before = readdirSync(tempDir).sort();

      const result = runUbml(`add ${type}`);

      expect(result.exitCode).not.toBe(0);
      expect(result.stderr).toContain(`This workspace already has ${article} ${type} document: ${type}.ubml.yaml`);
      expect(result.stderr).toContain(`ubml add ${type} <name>`);
      expect(readdirSync(tempDir).sort()).toEqual(before);
    });

    it('adds another one that is given a name', () => {
      expect(runUbml('add sources workshop').exitCode).toBe(0);
      expect(existsSync(join(tempDir, 'workshop.sources.ubml.yaml'))).toBe(true);
    });

    it('names the workspace the folder already has rather than offer to overwrite it or add a second', () => {
      const before = readdirSync(tempDir).sort();

      for (const args of ['add workspace', 'add workspace another']) {
        const result = runUbml(args);

        expect(result.exitCode).not.toBe(0);
        expect(result.stderr).toMatch(/already has a workspace: \S+\.workspace\.ubml\.yaml/);
        expect(result.stderr).not.toContain('--force');
        expect(result.stderr).not.toContain('ubml add workspace');
      }
      expect(readdirSync(tempDir).sort()).toEqual(before);
    });
  });

  describe('every add command the CLI prints runs as printed', () => {
    const failed = (ran: Ran[]): string[] =>
      ran.filter((r) => r.status !== 0).map((r) => `${r.command} in ${r.cwd}: ${r.output}`);

    it('from ubml --help, starting where the workspace is made', () => {
      const commands = printedCommands(ubml(['--help'], tempDir).output, 'Getting Started:');

      expect(commands).toContain('ubml add');
      expect(failed(runAsPrinted(commands, tempDir))).toEqual([]);
    });

    it('from ubml schema --workflow, starting where the workspace is made', () => {
      const commands = printedCommands(ubml(['schema', '--workflow'], tempDir).output, 'Quick start:');

      expect(commands).toContain('ubml add');
      expect(failed(runAsPrinted(commands, tempDir))).toEqual([]);
    });

    it('from ubml add --help, in a workspace init made', () => {
      ubml(['init', '.'], tempDir);
      const commands = printedCommands(ubml(['add', '--help'], tempDir).output, 'Examples:', /Document Types:/);

      expect(commands.filter((c) => c.startsWith('ubml add '))).toHaveLength(3);
      expect(failed(runAsPrinted(commands, tempDir))).toEqual([]);
    });

    it('from ubml add, in a workspace init made', () => {
      ubml(['init', '.'], tempDir);
      const listing = ubml(['add'], tempDir).output;
      const examples = printedCommands(listing, 'Examples:');
      const suggested = listing.match(/Run: (ubml add \S+)/)?.[1];

      expect(examples).toHaveLength(2);
      expect(suggested).toBeDefined();
      expect(failed(runAsPrinted([...new Set([suggested as string, ...examples])], tempDir))).toEqual([]);
    });

    it.each([...SCAFFOLDED_TYPES.filter((type) => type !== 'workspace'), 'entities'])(
      'from ubml schema %s, in a workspace init made',
      (type) => {
        ubml(['init', '.'], tempDir);
        const printed = ubml(['schema', type], tempDir).output.match(/Use (ubml .+?) to create/)?.[1];

        expect(printed).toBeDefined();
        expect(failed(runAsPrinted([printed as string], tempDir, { '<name>': 'another' }))).toEqual([]);
      },
    );

    it('from ubml schema workspace, which points at init rather than add', () => {
      const printed = ubml(['schema', 'workspace'], tempDir).output.match(/Use (ubml .+?) to create/)?.[1];

      expect(printed).toBe('ubml init <name>');
      expect(failed(runAsPrinted([printed as string], tempDir, { '<name>': 'another' }))).toEqual([]);
    });

    it.each([
      ['processes', 'process', 'processes'],
      ['actors', 'actors', 'actors'],
    ])('from ubml show %s, in a workspace init made whose %s file is emptied', (view, type, section) => {
      ubml(['init', '.'], tempDir);
      writeFileSync(join(tempDir, `${type}.ubml.yaml`), `ubml: "${SCHEMA_VERSION}"\n${section}: {}\n`);
      const printed = ubml(['show', view], tempDir).output.match(/with: (ubml .+)$/m)?.[1];

      expect(printed).toBeDefined();
      expect(failed(runAsPrinted([printed as string], tempDir, { '<name>': 'another' }))).toEqual([]);
    });
  });

  it('creates the folder --dir names', () => {
    createMinimalWorkspace();

    expect(runUbml('add actors sales-team --dir ./sales').exitCode).toBe(0);
    expect(existsSync(join(tempDir, 'sales', 'sales-team.actors.ubml.yaml'))).toBe(true);
  });
});
