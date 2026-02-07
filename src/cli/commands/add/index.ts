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
import { findWorkspaceFile } from '../../../node/id-scanner';
import {
  getDocumentTypeInfo,
  getSuggestedNextStep,
} from '../../../schema/index.js';
import { 
  DOCUMENT_TYPES, 
  type DocumentType,
  detectDocumentType,
} from '../../../metadata.js';
import { INDENT, success, highlight, code, dim } from '../../formatters/text';
import { toKebabCase } from '../../../utils/index.js';
import { createCommentedTemplate } from './templates.js';

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
    if (info) {
      console.log(INDENT + highlight(nextStep.type) + ' - ' + info.title);
      console.log(INDENT + dim(nextStep.reason));
      console.log();
      console.log(INDENT + 'Run: ' + code(`ubml add ${nextStep.type}`));
      console.log();
    }
  }

  console.log(chalk.bold('Available document types:'));
  console.log();

  for (const type of DOCUMENT_TYPES) {
    const info = getDocumentTypeInfo(type);
    if (!info) continue;
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
    sources: 'sources',
    insights: 'insights',
  };

  return defaults[type] || type;
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
  
  // Warn if not in a workspace
  if (!findWorkspaceFile(dir)) {
    console.log(chalk.yellow('Note: No workspace found. Run "ubml init ." first.'));
  }
  
  const info = getDocumentTypeInfo(type);
  if (!info) {
    console.error(chalk.red(`Error: Unknown document type: ${type}`));
    process.exit(1);
  }

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

  // Create template - prefer commented template for better analyst guidance
  const content = createCommentedTemplate(type, name || baseName);

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
${DOCUMENT_TYPES.map(type => {
  const info = getDocumentTypeInfo(type);
  return `  ${type.padEnd(12)} ${info?.shortDescription ?? ''}`;
}).join('\n')}
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
        console.error('Available types: ' + DOCUMENT_TYPES.join(', '));
        console.error();
        console.error('Run ' + code('ubml add') + ' to see details.');
        process.exit(1);
      }

      addDocument(type as DocumentType, name, options);
    });

  return command;
}
