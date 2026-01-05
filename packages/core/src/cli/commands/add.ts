/**
 * Add command for UBML CLI.
 *
 * Creates new UBML document files with proper templates and structure.
 *
 * @module ubml/cli/commands/add
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { existsSync, writeFileSync, readdirSync } from 'fs';
import { join, resolve, basename } from 'path';
import { serialize } from '../../serializer.js';
import {
  getDocumentTypeInfo,
  getMinimalTemplate,
  getSuggestedNextStep,
  getSuggestedWorkflow,
} from '../schema-introspection.js';
import { DOCUMENT_TYPES, type DocumentType, detectDocumentType } from '../../generated/metadata.js';

// =============================================================================
// Helpers
// =============================================================================

const INDENT = '  ';

function success(text: string): string {
  return chalk.green(text);
}

function highlight(text: string): string {
  return chalk.yellow(text);
}

function code(text: string): string {
  return chalk.cyan(text);
}

function dim(text: string): string {
  return chalk.dim(text);
}

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
 * Find existing UBML files in a directory.
 */
function findExistingUbmlFiles(dir: string): { path: string; type: DocumentType }[] {
  const files: { path: string; type: DocumentType }[] = [];

  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isFile() && entry.name.endsWith('.ubml.yaml')) {
        const type = detectDocumentType(entry.name);
        if (type) {
          files.push({ path: join(dir, entry.name), type });
        }
      }
    }
  } catch {
    // Directory doesn't exist or can't be read
  }

  return files;
}

/**
 * Get existing document types in the workspace.
 */
function getExistingTypes(dir: string): DocumentType[] {
  const files = findExistingUbmlFiles(dir);
  return [...new Set(files.map((f) => f.type))];
}

// =============================================================================
// Templates
// =============================================================================

/**
 * Create template with custom name.
 */
function createTemplate(type: DocumentType, name: string): Record<string, unknown> {
  const template = getMinimalTemplate(type);

  // Customize based on type
  switch (type) {
    case 'workspace':
      return {
        ...template,
        name,
        description: `${name} workspace`,
      };

    case 'process': {
      const processName = name.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      return {
        ubml: '1.0',
        processes: {
          PR001: {
            name: processName,
            description: `${processName} process`,
            level: 3,
            steps: {
              ST001: {
                name: 'Start',
                kind: 'event',
                description: 'Process start event',
              },
              ST002: {
                name: 'First Activity',
                kind: 'action',
                description: 'First activity in the process',
              },
              ST003: {
                name: 'End',
                kind: 'event',
                description: 'Process end event',
              },
            },
            links: [
              { from: 'ST001', to: 'ST002' },
              { from: 'ST002', to: 'ST003' },
            ],
          },
        },
      };
    }

    case 'actors':
      return {
        ubml: '1.0',
        actors: {
          AC001: {
            name: 'Business User',
            type: 'role',
            kind: 'human',
            description: 'Primary business user role',
          },
        },
        skills: {
          SK001: {
            name: 'Domain Knowledge',
            description: 'Knowledge of business domain',
          },
        },
      };

    case 'entities':
      return {
        ubml: '1.0',
        entities: {
          EN001: {
            name: 'Primary Entity',
            description: 'Main business entity',
          },
        },
      };

    case 'hypotheses':
      return {
        ubml: '1.0',
        hypothesisTrees: {
          HT001: {
            name: 'Improvement Analysis',
            situation: 'Describe the current situation',
            complication: 'What is causing problems or inefficiency?',
            question: 'What problem should we solve?',
            hypotheses: {
              HY001: {
                name: 'Primary Hypothesis',
                statement: 'We believe that...',
                status: 'open',
              },
            },
          },
        },
      };

    case 'metrics':
      return {
        ubml: '1.0',
        kpis: {
          KP001: {
            name: 'Process Cycle Time',
            description: 'Total time from start to finish',
            unit: 'hours',
            direction: 'lower-is-better',
          },
          KP002: {
            name: 'Throughput',
            description: 'Number of completed cases per period',
            unit: 'cases/day',
            direction: 'higher-is-better',
          },
        },
      };

    case 'scenarios':
      return {
        ubml: '1.0',
        scenarios: {
          SC001: {
            name: 'Current State',
            description: 'Baseline scenario representing current operations',
            type: 'baseline',
          },
          SC002: {
            name: 'Improved State',
            description: 'Target scenario after improvements',
            type: 'target',
          },
        },
      };

    case 'strategy':
      return {
        ubml: '1.0',
        valueStreams: {
          VS001: {
            name: 'Core Value Delivery',
            description: 'Primary value stream to customers',
          },
        },
        capabilities: {
          CP001: {
            name: 'Core Capability',
            description: 'Essential business capability',
          },
        },
      };

    default:
      return template;
  }
}

// =============================================================================
// Command Actions
// =============================================================================

/**
 * Show what can be added and suggest next steps.
 */
function showWhatCanBeAdded(dir: string): void {
  const existingTypes = getExistingTypes(dir);
  const existingFiles = findExistingUbmlFiles(dir);

  console.log();
  console.log(chalk.bold.cyan('UBML Document Types'));
  console.log(dim('────────────────────────────────────────────────────────────'));
  console.log();

  if (existingFiles.length > 0) {
    console.log(chalk.bold('Existing files:'));
    for (const file of existingFiles) {
      console.log(INDENT + success('✓') + ' ' + basename(file.path) + dim(` (${file.type})`));
    }
    console.log();
  }

  // Show suggested next step
  const nextStep = getSuggestedNextStep(existingTypes);
  if (nextStep) {
    console.log(chalk.bold('Suggested next:'));
    const info = getDocumentTypeInfo(nextStep.type);
    console.log(INDENT + highlight(nextStep.type) + ' - ' + info.title);
    console.log(INDENT + dim(nextStep.reason));
    console.log();
    console.log(INDENT + 'Run: ' + code(`ubml add ${nextStep.type}`));
    console.log();
  }

  console.log(chalk.bold('Available document types:'));
  console.log();

  for (const type of DOCUMENT_TYPES) {
    const info = getDocumentTypeInfo(type);
    const exists = existingTypes.includes(type);
    const marker = exists ? dim(' (exists)') : '';
    console.log(INDENT + highlight(type.padEnd(12)) + info.title + marker);
  }

  console.log();
  console.log(dim('────────────────────────────────────────────────────────────'));
  console.log();
  console.log('Usage: ' + code('ubml add <type> [name]'));
  console.log();
  console.log('Examples:');
  console.log(INDENT + code('ubml add process') + dim('              # Creates process.ubml.yaml'));
  console.log(INDENT + code('ubml add process order-fulfillment') + dim(' # Creates order-fulfillment.process.ubml.yaml'));
  console.log();
}

/**
 * Add a new UBML document file.
 */
function addDocument(
  type: DocumentType,
  name: string | undefined,
  options: { dir: string; force: boolean }
): void {
  const dir = resolve(options.dir);
  const info = getDocumentTypeInfo(type);

  // Generate filename
  const baseName = name ? toKebabCase(name) : getDefaultName(type, dir);
  const filename = `${baseName}.${type}.ubml.yaml`;
  const filepath = join(dir, filename);

  // Check if file exists
  if (existsSync(filepath) && !options.force) {
    console.error(chalk.red(`Error: File already exists: ${filename}`));
    console.error();
    console.error('Use ' + code('--force') + ' to overwrite, or specify a different name:');
    console.error(INDENT + code(`ubml add ${type} my-custom-name`));
    process.exit(1);
  }

  // Create template
  const template = createTemplate(type, name || baseName);
  const content = serialize(template);

  // Write file
  writeFileSync(filepath, content);

  console.log();
  console.log(success('✓') + ' Created ' + highlight(filename));
  console.log();
  console.log(chalk.bold('File type:') + ' ' + info.title);
  console.log(chalk.bold('Location:') + '  ' + dim(filepath));
  console.log();

  // Show sections in the file
  if (info.sections.length > 0) {
    console.log(chalk.bold('Contains:'));
    for (const section of info.sections.filter((s) => s.idPrefix)) {
      console.log(INDENT + highlight(section.name) + dim(` (${section.idPrefix}###)`));
    }
    console.log();
  }

  // Show VS Code tip
  console.log(chalk.bold.cyan('In VS Code:'));
  console.log(INDENT + '• Open ' + code(filename) + ' - you\'ll get autocomplete and validation');
  console.log(INDENT + '• Press ' + code('Ctrl+Space') + ' to see available properties');
  console.log(INDENT + '• Hover over properties for documentation');
  console.log();

  // Show next steps
  console.log(chalk.bold('Next steps:'));
  console.log(INDENT + '1. Edit the template to match your business');
  console.log(INDENT + '2. Run ' + code('ubml validate .') + ' to check for errors');
  console.log();

  // Suggest what to add next
  const existingTypes = getExistingTypes(dir);
  existingTypes.push(type);
  const nextStep = getSuggestedNextStep(existingTypes);
  if (nextStep) {
    console.log(chalk.bold('Then:'));
    console.log(INDENT + 'Add ' + highlight(nextStep.type) + ' - ' + nextStep.reason);
    console.log(INDENT + 'Run: ' + code(`ubml add ${nextStep.type}`));
    console.log();
  }
}

/**
 * Get default name for a document type.
 */
function getDefaultName(type: DocumentType, dir: string): string {
  const defaults: Record<DocumentType, string> = {
    workspace: basename(dir) || 'my-workspace',
    process: 'sample',
    actors: 'organization',
    entities: 'data-model',
    hypotheses: 'analysis',
    scenarios: 'scenarios',
    strategy: 'strategy',
    metrics: 'kpis',
    mining: 'mining',
    views: 'views',
    links: 'links',
    glossary: 'glossary',
  };

  return defaults[type] || type;
}

// =============================================================================
// Command Definition
// =============================================================================

/**
 * Create the add command.
 */
export function addCommand(): Command {
  const command = new Command('add');

  command
    .description('Add a new UBML document to your workspace')
    .argument('[type]', 'Document type to add')
    .argument('[name]', 'Name for the document (used in filename)')
    .option('-d, --dir <directory>', 'Directory to create the file in', '.')
    .option('-f, --force', 'Overwrite existing file', false)
    .addHelpText('after', `
Examples:
  ${chalk.dim('# Show available document types')}
  ubml add

  ${chalk.dim('# Add a process document')}
  ubml add process

  ${chalk.dim('# Add a named process document')}
  ubml add process customer-onboarding

  ${chalk.dim('# Add actors to a subdirectory')}
  ubml add actors sales-team --dir ./sales

Document Types:
  workspace    Root workspace configuration
  process      Business process definitions
  actors       Roles, teams, and systems
  entities     Business entities and documents
  hypotheses   Problem framing with SCQH
  scenarios    Simulation scenarios
  strategy     Value streams and capabilities
  metrics      KPIs and ROI analysis
  mining       Process mining configuration
  views        Custom visualizations
  links        Cross-process links
  glossary     Business terminology
`)
    .action((
      type: string | undefined,
      name: string | undefined,
      options: { dir: string; force: boolean }
    ) => {
      // If no type specified, show what can be added
      if (!type) {
        showWhatCanBeAdded(resolve(options.dir));
        return;
      }

      // Validate type
      if (!DOCUMENT_TYPES.includes(type as DocumentType)) {
        console.error(chalk.red(`Error: Unknown document type "${type}"`));
        console.error();
        console.error('Available types:');
        for (const t of DOCUMENT_TYPES) {
          console.error(INDENT + highlight(t));
        }
        console.error();
        console.error('Run ' + code('ubml add') + ' to see details.');
        process.exit(1);
      }

      addDocument(type as DocumentType, name, options);
    });

  return command;
}
