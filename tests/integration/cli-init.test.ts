/**
 * CLI Init Command Tests
 *
 * Integration tests for the `ubml init` command.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, existsSync, readdirSync, readFileSync, writeFileSync, renameSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { SCHEMA_VERSION } from '../../src/constants.js';
import { validateWorkspace } from '../../src/node/validator.js';
import { parse } from 'yaml';
import { DOCUMENT_TYPES } from '../../src/generated/data.js';
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

  describe('init with directory name', () => {
    it('should create a new UBML workspace directory', () => {
      const result = runUbml('init test-project');

      if (result.exitCode !== 0) {
        console.error('CLI failed with exit code:', result.exitCode);
        console.error('stderr:', result.stderr);
        console.error('stdout:', result.stdout);
      }
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

  describe('the scaffold is a worked example', () => {
    it('validates with no errors, so the shape it teaches is one the schema accepts', async () => {
      runUbml('init test-project');

      const result = await validateWorkspace(join(tempDir, 'test-project'));
      const errors = result.files.flatMap((f) => f.errors);

      // Warnings are expected and say an id is defined and never referenced,
      // which is what a leaf element looks like. Errors are not.
      expect(errors.map((e) => `${e.code}: ${e.message}`)).toEqual([]);
      expect(result.valid).toBe(true);
    });

    it('ships the whole chain: a source, its stored text, a claim quoting it, a step citing the claim', () => {
      runUbml('init test-project');
      const dir = join(tempDir, 'test-project');

      const read = (f: string) => parse(readFileSync(join(dir, f), 'utf8'));
      const [srId, source] = Object.entries(read('sources.ubml.yaml').sources)[0] as [string, Record<string, string>];
      const [inId, insight] = Object.entries(read('insights.ubml.yaml').insights)[0] as [string, Record<string, unknown>];

      // The pointer resolves. SOURCE_FILE_MISSING is an error precisely because
      // a file that is not there looks like evidence that is filed and is not.
      expect(existsSync(join(dir, source.file))).toBe(true);

      expect(insight.source).toBe(srId);
      expect(insight.quote).toBeInstanceOf(Array);
      const stored = readFileSync(join(dir, source.file), 'utf8');
      for (const quote of insight.quote as string[]) {
        expect(stored).toContain(quote);
      }

      const process = Object.values(read('process.ubml.yaml').processes)[0] as {
        steps: Record<string, { derivedFrom?: string[]; reviewStatus?: string }>;
      };
      const derived = Object.values(process.steps).filter((st) => st.derivedFrom?.length);
      expect(derived).toHaveLength(1);
      expect(derived[0].derivedFrom).toContain(inId);
      // Proposed, not accepted: nobody has reviewed a scaffold.
      expect(derived[0].reviewStatus).toBe('proposed');
    });

    it('explains itself, so nobody has to read somebody else\'s project to see the shape', () => {
      runUbml('init test-project');

      const readme = readFileSync(join(tempDir, 'test-project', 'README.md'), 'utf8');

      for (const file of ['sources.ubml.yaml', 'insights.ubml.yaml', 'process.ubml.yaml', 'actors.ubml.yaml']) {
        expect(readme).toContain(file);
      }
      expect(readme).toContain('derivedFrom');
      expect(readme).toContain('reviewStatus');
    });

    it('leaves the sample out of --minimal, which is what minimal means', () => {
      runUbml('init test-project --minimal');
      const dir = join(tempDir, 'test-project');

      expect(existsSync(join(dir, 'sources'))).toBe(false);
      expect(existsSync(join(dir, 'README.md'))).toBe(false);
    });

    it('tells --minimal only about what --minimal wrote', () => {
      const { stdout } = runUbml('init test-project --minimal');

      expect(stdout).not.toContain('README.md');
      expect(stdout).not.toContain('SR00001');
      expect(stdout).not.toContain('worked example');
      expect(stdout).toContain('ubml add sources');
    });

    it('decides what is missing by document type, not by file name, under --force', async () => {
      runUbml('init test-project');
      const dir = join(tempDir, 'test-project');
      renameSync(join(dir, 'test-project.workspace.ubml.yaml'), join(dir, 'kickoff.workspace.ubml.yaml'));
      renameSync(join(dir, 'sources.ubml.yaml'), join(dir, 'kickoff.sources.ubml.yaml'));
      renameSync(join(dir, 'insights.ubml.yaml'), join(dir, 'kickoff.insights.ubml.yaml'));
      const before = readdirSync(dir).sort();

      expect(runUbml('init test-project --force').exitCode).toBe(0);

      expect(readdirSync(dir).sort()).toEqual(before);
      const result = await validateWorkspace(dir);
      expect(result.files.flatMap((f) => f.errors).map((e) => `${e.code}: ${e.message}`)).toEqual([]);
    });

    it('keeps every file already there under --force and fills in only what is missing', async () => {
      runUbml('init test-project');
      const dir = join(tempDir, 'test-project');
      const worked: Record<string, string> = {};
      const edit = (file: string, change: (text: string) => string): void => {
        worked[file] = change(readFileSync(join(dir, file), 'utf8'));
        writeFileSync(join(dir, file), worked[file]);
      };
      edit('sources.ubml.yaml', (t) => t.replace('SR00001', 'SR00010').replace('Kickoff interview', 'Supplier onboarding call'));
      edit(join('sources', 'kickoff-interview.md'), (t) => `${t}\n**Interviewer:** And after that?\n`);
      edit('insights.ubml.yaml', (t) => t.replace('SR00001', 'SR00010').replace('status: proposed', 'status: validated'));
      edit('process.ubml.yaml', (t) => t.replace('reviewStatus: proposed', 'reviewStatus: accepted'));
      edit('actors.ubml.yaml', (t) => t.replace('Business User', 'Warehouse manager'));
      edit('test-project.workspace.ubml.yaml', (t) => t.replace('test-project workspace', 'Supplier onboarding'));
      rmSync(join(dir, 'README.md'));

      expect(runUbml('init test-project --force').exitCode).toBe(0);

      for (const [file, text] of Object.entries(worked)) {
        expect(readFileSync(join(dir, file), 'utf8')).toBe(text);
      }
      expect(existsSync(join(dir, 'README.md'))).toBe(true);
      const result = await validateWorkspace(dir);
      expect(result.files.flatMap((f) => f.errors).map((e) => `${e.code}: ${e.message}`)).toEqual([]);
    });
  });

  describe('VS Code schema settings', () => {
    it('should scaffold .vscode/settings.json pointing at the current schema version for every document type', () => {
      const result = runUbml('init test-project');
      expect(result.exitCode).toBe(0);

      const settingsPath = join(tempDir, 'test-project', '.vscode', 'settings.json');
      expect(existsSync(settingsPath)).toBe(true);

      const settings = JSON.parse(readFileSync(settingsPath, 'utf8'));
      const schemas = settings['yaml.schemas'] as Record<string, string[]>;
      const schemaUrls = Object.keys(schemas);

      // Regression test for https://github.com/TALXIS/ubml/issues/34:
      // settings.json must reference the current SCHEMA_VERSION (not a stale
      // hardcoded one) and must include every known document type, since
      // types added in newer schema versions (e.g. insights, sources) were
      // previously missing.
      for (const type of DOCUMENT_TYPES) {
        const expectedUrl = `https://ubml.talxis.com/schemas/${SCHEMA_VERSION}/documents/${type}.schema.yaml`;
        expect(schemaUrls).toContain(expectedUrl);
      }

      for (const url of schemaUrls) {
        expect(url).toContain(`/schemas/${SCHEMA_VERSION}/`);
      }
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
