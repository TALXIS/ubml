/**
 * Init command for UBML CLI.
 *
 * Initializes a new UBML workspace with proper structure and VS Code configuration.
 * Supports both creating a new directory and initializing in the current directory.
 *
 * @module ubml/cli/commands/init
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { mkdirSync, writeFileSync, existsSync, readdirSync, readFileSync } from 'fs';
import { join, resolve, basename } from 'path';
import { serialize } from '../../index';
import { findWorkspaceFile } from '../../node/id-scanner';
import { 
  DOCUMENT_TYPES, 
  SCHEMA_VERSION, 
  SCHEMA_PATHS,
  ID_CONFIG,
  formatId,
} from '../../metadata.js';
import { INDENT, success, highlight, code, dim } from '../formatters/text';

/**
 * Convert a name to kebab-case for filenames.
 */
function toKebabCase(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}



/**
 * Check if UBML files already exist in a directory.
 */
function hasUbmlFiles(dir: string): boolean {
  try {
    const files = readdirSync(dir);
    return files.some((f) => f.endsWith('.ubml.yaml') || f.endsWith('.ubml.yml'));
  } catch {
    return false;
  }
}

/**
 * Generate VS Code YAML schema settings from document types.
 * Generates patterns for both full (*.type.ubml.yaml) and simple (type.ubml.yaml) patterns.
 */
function generateVscodeSchemaSettings(): Record<string, string[]> {
  const settings: Record<string, string[]> = {};
  for (const type of DOCUMENT_TYPES) {
    const schemaUrl = `https://ubml.talxis.com/schemas/${SCHEMA_VERSION}/${SCHEMA_PATHS.documents[type]}`;
    // Support both patterns: prefix.type.ubml.yaml AND type.ubml.yaml
    settings[schemaUrl] = [
      `*.${type}.ubml.yaml`,   // Full pattern: organization.actors.ubml.yaml
      `${type}.ubml.yaml`,     // Simple pattern: actors.ubml.yaml
    ];
  }
  return settings;
}

/**
 * Generate VS Code extensions recommendations.
 */
function generateVscodeExtensions(): { recommendations: string[] } {
  return {
    recommendations: [
      'redhat.vscode-yaml', // YAML language support with schema validation
    ],
  };
}

// =============================================================================
// Templates
// =============================================================================

/**
 * Document template type.
 */
type TemplateType = 'workspace' | 'process' | 'actors';

/**
 * Template factory for creating UBML document templates.
 */
function createDocumentTemplate(type: TemplateType, name?: string): unknown {
  const base = { ubml: SCHEMA_VERSION };

  switch (type) {
    case 'workspace':
      return {
        ...base,
        name: name ?? 'UBML Workspace',
        description: `${name ?? 'UBML'} workspace - add your project description here`,
        organization: {
          name: 'Your Organization',
          department: 'Department',
        },
      };

    case 'process': {
      // Use centralized ID generation with initOffset
      const offset = ID_CONFIG.initOffset;
      const prId = formatId('PR', offset);
      const st1 = formatId('ST', offset);
      const st2 = formatId('ST', offset + 1);
      const st3 = formatId('ST', offset + 2);
      
      return {
        ...base,
        processes: {
          [prId]: {
            name: 'Sample Process',
            description: 'A sample business process - replace with your actual process',
            level: 3,
            steps: {
              [st1]: {
                name: 'Start',
                kind: 'start',
                description: 'Process entry point',
              },
              [st2]: {
                name: 'First Activity',
                kind: 'action',
                description: 'First activity - describe what happens here',
              },
              [st3]: {
                name: 'End',
                kind: 'end',
                description: 'Process exit point',
              },
            },
            links: [
              { from: st1, to: st2 },
              { from: st2, to: st3 },
            ],
          },
        },
      };
    }

    case 'actors': {
      const acId = formatId('AC', ID_CONFIG.initOffset);
      return {
        ...base,
        actors: {
          [acId]: {
            name: 'Business User',
            type: 'role',
            kind: 'human',
            description: 'Primary business user role - replace with actual roles',
          },
        },
      };
    }
  }
}

// =============================================================================
// Init Actions
// =============================================================================

interface InitOptions {
  minimal: boolean;
  force: boolean;
}

/**
 * Initialize a workspace in the current directory.
 */
function initCurrentDirectory(name: string, options: InitOptions): void {
  // Validate name
  if (!name || name.trim() === '' || (name !== '.' && !/^[a-zA-Z0-9._-]+$/.test(name))) {
    console.error(chalk.red('Error: Invalid workspace name.'));
    console.error('Use letters, numbers, hyphens, underscores, or "." for current directory.');
    process.exit(1);
  }

  // Determine workspace directory
  // If name is "." or an absolute/relative path, use it directly
  // Otherwise, create a subdirectory with that name
  const workspaceDir = name === '.' || name.startsWith('.') || name.startsWith('/') 
    ? resolve(name)
    : resolve('.', name);
  const safeName = toKebabCase(name === '.' ? basename(process.cwd()) : name);

  // Check if already inside a workspace
  if (name !== '.' && !options.force) {
    const parent = findWorkspaceFile(resolve('.'));
    if (parent) {
      console.error(chalk.yellow('Warning: Already inside workspace ' + basename(parent)));
      console.error('Use --force to create nested workspace, or use "ubml init ."');
      process.exit(1);
    }
  }

  // Create directory if it doesn't exist (when creating new subdirectory)
  if (workspaceDir !== resolve('.')) {
    if (existsSync(workspaceDir) && !options.force) {
      console.error(chalk.red(`Error: Directory already exists: ${workspaceDir}`));
      console.error();
      console.error('Use ' + code('--force') + ' to reinitialize.');
      process.exit(1);
    }
    mkdirSync(workspaceDir, { recursive: true });
  }

  // Check for existing UBML files
  if (hasUbmlFiles(workspaceDir) && !options.force) {
    console.error(chalk.red('Error: UBML files already exist in this directory.'));
    console.error();
    console.error('Use ' + code('--force') + ' to reinitialize.');
    process.exit(1);
  }

  // Create files
  createWorkspaceFiles(workspaceDir, safeName, name === '.' ? basename(process.cwd()) : name, options.minimal);

  // Print success message
  printSuccessMessage(workspaceDir, name === '.' ? basename(process.cwd()) : name, workspaceDir === resolve('.'));
}

/**
 * Create all workspace files.
 */
function createWorkspaceFiles(
  workspaceDir: string,
  safeName: string,
  displayName: string,
  minimal: boolean
): void {
  const createdFiles: string[] = [];

  // Create workspace file
  const workspaceFile = join(workspaceDir, `${safeName}.workspace.ubml.yaml`);
  writeFileSync(workspaceFile, serialize(createDocumentTemplate('workspace', displayName)));
  createdFiles.push(workspaceFile);

  if (!minimal) {
    // Create sample process file
    const processFile = join(workspaceDir, 'process.ubml.yaml');
    writeFileSync(processFile, serialize(createDocumentTemplate('process')));
    createdFiles.push(processFile);

    // Create sample actors file
    const actorsFile = join(workspaceDir, 'actors.ubml.yaml');
    writeFileSync(actorsFile, serialize(createDocumentTemplate('actors')));
    createdFiles.push(actorsFile);
  }

  // Create VS Code settings directory
  const vscodeDir = join(workspaceDir, '.vscode');
  mkdirSync(vscodeDir, { recursive: true });

  // Create or update .gitignore
  const gitignorePath = join(workspaceDir, '.gitignore');
  let gitignoreContent = '';
  if (existsSync(gitignorePath)) {
    try {
      gitignoreContent = readFileSync(gitignorePath, 'utf-8');
    } catch {
      // If we can't read, start fresh
    }
  }
  
  // Add .ubml/ to .gitignore if not already present
  if (!gitignoreContent.includes('.ubml/')) {
    const newLine = gitignoreContent && !gitignoreContent.endsWith('\n') ? '\n' : '';
    const comment = gitignoreContent ? '' : '# UBML cache directory\n';
    gitignoreContent += `${newLine}${comment}.ubml/\n`;
    writeFileSync(gitignorePath, gitignoreContent);
    createdFiles.push(gitignorePath);
  }

  // Create settings.json
  const settingsFile = join(vscodeDir, 'settings.json');
  let existingSettings: Record<string, unknown> = {};
  if (existsSync(settingsFile)) {
    try {
      const content = readFileSync(settingsFile, 'utf-8');
      existingSettings = JSON.parse(content);
    } catch {
      // If we can't read/parse, start fresh
    }
  }
  const newSettings = {
    ...existingSettings,
    'yaml.schemas': {
      ...((existingSettings['yaml.schemas'] as Record<string, unknown>) || {}),
      ...generateVscodeSchemaSettings(),
    },
  };
  writeFileSync(settingsFile, JSON.stringify(newSettings, null, 2));
  createdFiles.push(settingsFile);

  // Create extensions.json
  const extensionsFile = join(vscodeDir, 'extensions.json');
  if (!existsSync(extensionsFile)) {
    writeFileSync(extensionsFile, JSON.stringify(generateVscodeExtensions(), null, 2));
    createdFiles.push(extensionsFile);
  }

  // Print created files
  console.log();
  console.log(chalk.bold('Created files:'));
  for (const file of createdFiles) {
    const relativePath = file.replace(workspaceDir + '/', '');
    console.log(INDENT + success('✓') + ' ' + relativePath);
  }
}

/**
 * Print success message with next steps.
 */
function printSuccessMessage(workspaceDir: string, name: string, inPlace: boolean): void {
  console.log();
  console.log(success('✓') + chalk.bold(' Workspace initialized successfully!'));
  console.log();

  // VS Code setup info
  console.log(chalk.bold.cyan('VS Code Setup'));
  console.log(dim('────────────────────────────────────────────────────────────'));
  console.log(INDENT + success('✓') + ' Schema validation configured in ' + code('.vscode/settings.json'));
  console.log(INDENT + success('✓') + ' YAML extension recommended in ' + code('.vscode/extensions.json'));
  console.log();

  console.log(chalk.bold('Next steps:'));
  console.log();

  if (!inPlace) {
    console.log(INDENT + chalk.bold('1.') + ' Open in VS Code:');
    console.log(INDENT + INDENT + code(`code ${basename(workspaceDir)}`));
    console.log();
    console.log(INDENT + chalk.bold('2.') + ' Install recommended extensions when prompted');
    console.log(INDENT + INDENT + dim('(or manually: Cmd+Shift+X → search "YAML")'));
  } else {
    console.log(INDENT + chalk.bold('1.') + ' Reload VS Code window to apply settings');
    console.log(INDENT + INDENT + dim('(Cmd+Shift+P → "Developer: Reload Window")'));
    console.log();
    console.log(INDENT + chalk.bold('2.') + ' Ensure YAML extension is installed');
    console.log(INDENT + INDENT + dim('(Cmd+Shift+X → search "YAML" by Red Hat)'));
  }

  console.log();
  console.log(INDENT + chalk.bold(inPlace ? '3.' : '3.') + ' Start editing - you\'ll get autocomplete and validation!');
  console.log(INDENT + INDENT + dim('Open any .ubml.yaml file and start typing'));
  console.log();
  console.log(INDENT + chalk.bold(inPlace ? '4.' : '4.') + ' Add more content:');
  console.log(INDENT + INDENT + code('ubml add') + dim('              # See what you can add'));
  console.log(INDENT + INDENT + code('ubml add process') + dim('      # Add a new process'));
  console.log();
  console.log(INDENT + chalk.bold(inPlace ? '5.' : '5.') + ' Validate your model:');
  console.log(INDENT + INDENT + code('ubml validate .'));
  console.log();

  console.log(dim('────────────────────────────────────────────────────────────'));
  console.log();
  console.log(chalk.bold('Tips:'));
  console.log(INDENT + '• ' + dim('In VS Code, press ') + code('Ctrl+Space') + dim(' for autocomplete'));
  console.log(INDENT + '• ' + dim('Hover over properties to see documentation'));
  console.log(INDENT + '• ' + dim('Red squiggles show validation errors'));
  console.log();
  console.log('More help: ' + code('ubml docs vscode'));
  console.log();
}

// =============================================================================
// Command Definition
// =============================================================================

/**
 * Create the init command.
 */
export function initCommand(): Command {
  const command = new Command('init');

  command
    .description('Initialize a new UBML workspace in the current directory')
    .argument('<name>', 'Workspace name (used for file naming)')
    .option('-m, --minimal', 'Create only workspace file, no samples', false)
    .option('-f, --force', 'Force initialization even if files exist', false)
    .addHelpText('after', `
Examples:
  ${chalk.dim('# Initialize workspace in current directory')}
  ubml init my-project

  ${chalk.dim('# Create minimal workspace (no sample files)')}
  ubml init my-project --minimal

  ${chalk.dim('# Force reinitialize existing directory')}
  ubml init my-project --force

What gets created:
  ${highlight('<name>.workspace.ubml.yaml')}  Workspace configuration
  ${highlight('process.ubml.yaml')}           Sample process (unless --minimal)
  ${highlight('actors.ubml.yaml')}            Sample actors (unless --minimal)
  ${highlight('.vscode/settings.json')}       VS Code YAML schema settings
  ${highlight('.vscode/extensions.json')}     Recommended extensions
`)
    .action((name: string, options: InitOptions) => {
      initCurrentDirectory(name, options);
    });

  return command;
}
