/**
 * Schema command for UBML CLI.
 *
 * Provides interactive exploration of the UBML schema to help users
 * understand what they can model and how.
 *
 * @module ubml/cli/commands/schema
 */

import { Command } from 'commander';
import chalk from 'chalk';
import {
  getAllDocumentTypes,
  getDocumentTypeInfo,
  getAllElementTypes,
  getElementTypeInfo,
  getMinimalTemplate,
  getAnnotatedTemplate,
  getSuggestedWorkflow,
  type DocumentTypeInfo,
} from '../schema-introspection.js';
import { DOCUMENT_TYPES, type DocumentType } from '../../generated/metadata.js';
import { serialize } from '../../serializer.js';

// =============================================================================
// Formatting Helpers
// =============================================================================

const INDENT = '  ';

function header(text: string): string {
  return chalk.bold.cyan(text);
}

function subheader(text: string): string {
  return chalk.bold.white(text);
}

function dim(text: string): string {
  return chalk.dim(text);
}

function success(text: string): string {
  return chalk.green(text);
}

function highlight(text: string): string {
  return chalk.yellow(text);
}

function code(text: string): string {
  return chalk.cyan(text);
}

// =============================================================================
// Display Functions
// =============================================================================

/**
 * Display overview of all document types.
 */
function displayOverview(): void {
  console.log();
  console.log(header('UBML Schema Overview'));
  console.log(dim('────────────────────────────────────────────────────────────'));
  console.log();
  console.log('UBML (Unified Business Modeling Language) uses YAML files to model');
  console.log('business processes, actors, entities, and more.');
  console.log();
  console.log(subheader('Document Types:'));
  console.log();

  const docTypes = getAllDocumentTypes();

  // Group by category using schema-derived categoryDisplayName
  const categoryOrder = ['core', 'analysis', 'strategy', 'advanced'];
  const grouped = new Map<string, DocumentTypeInfo[]>();

  for (const info of docTypes) {
    const displayName = info.categoryDisplayName;
    if (!grouped.has(displayName)) {
      grouped.set(displayName, []);
    }
    grouped.get(displayName)!.push(info);
  }

  // Sort each category by workflow order
  for (const types of grouped.values()) {
    types.sort((a, b) => a.workflowOrder - b.workflowOrder);
  }

  // Display in category order
  for (const category of categoryOrder) {
    const types = docTypes.filter((d) => d.category === category);
    if (types.length === 0) continue;

    const displayName = types[0].categoryDisplayName;
    console.log(INDENT + chalk.bold(displayName));
    for (const info of types.sort((a, b) => a.workflowOrder - b.workflowOrder)) {
      console.log(INDENT + INDENT + highlight(info.filePattern.padEnd(28)) + dim(info.title));
    }
    console.log();
  }

  console.log(dim('────────────────────────────────────────────────────────────'));
  console.log();
  console.log('Use ' + code('ubml schema <type>') + ' to see details about a document type.');
  console.log('Use ' + code('ubml schema --workflow') + ' to see the recommended modeling workflow.');
  console.log();
}

/**
 * Display recommended workflow for new users.
 */
function displayWorkflow(): void {
  console.log();
  console.log(header('Recommended UBML Workflow'));
  console.log(dim('────────────────────────────────────────────────────────────'));
  console.log();
  console.log('Follow these steps to build a complete business model:');
  console.log();

  const workflow = getSuggestedWorkflow();
  for (const step of workflow) {
    const info = getDocumentTypeInfo(step.type);
    console.log(
      INDENT +
        chalk.bold.green(`${step.step}.`) +
        ` Create ${highlight(info.filePattern)}`
    );
    console.log(INDENT + INDENT + dim(step.reason));
    console.log();
  }

  console.log(dim('────────────────────────────────────────────────────────────'));
  console.log();
  console.log('Quick start:');
  console.log(INDENT + code('ubml init my-project') + dim('        # Create a new workspace'));
  console.log(INDENT + code('ubml add process') + dim('           # Add a process file'));
  console.log(INDENT + code('ubml validate .') + dim('            # Validate all files'));
  console.log();
}

/**
 * Display detailed information about a document type.
 */
function displayDocumentType(type: DocumentType, options: { properties?: boolean; template?: boolean }): void {
  const info = getDocumentTypeInfo(type);

  console.log();
  console.log(header(info.title));
  console.log(dim('────────────────────────────────────────────────────────────'));
  console.log();
  console.log(info.shortDescription);
  console.log();
  console.log(subheader('File Pattern:') + ' ' + highlight(info.filePattern));
  console.log(subheader('Example:') + '      ' + code(info.exampleFilename));
  console.log();

  if (info.sections.length > 0) {
    console.log(subheader('Sections:'));
    console.log();
    for (const section of info.sections) {
      const prefix = section.idPrefix ? dim(` (${section.idPrefix}###)`) : '';
      const req = section.required ? success(' [required]') : '';
      console.log(INDENT + highlight(section.name) + prefix + req);
      console.log(INDENT + INDENT + dim(section.description));
    }
    console.log();
  }

  // Show element details if --properties flag is set
  if (options.properties) {
    displayElementProperties(info);
  }

  // Show template if --template flag is set
  if (options.template) {
    displayTemplate(type);
  }

  if (!options.template) {
    console.log(dim('────────────────────────────────────────────────────────────'));
    console.log();
    console.log('Use ' + code(`ubml schema ${type} --template`) + ' to see a starter template.');
    console.log('Use ' + code(`ubml schema ${type} --properties`) + ' to see all available properties.');
    console.log('Use ' + code(`ubml add ${type}`) + ' to create a new file of this type.');
    console.log();
  }
}

/**
 * Display element properties for a document type.
 */
function displayElementProperties(docInfo: DocumentTypeInfo): void {
  console.log(subheader('Element Properties:'));
  console.log();

  for (const section of docInfo.sections) {
    if (!section.idPrefix) continue;

    // Find the corresponding element type
    const elementTypes = getAllElementTypes();
    const element = elementTypes.find((e) => e.prefix === section.idPrefix);
    if (!element) continue;

    const info = getElementTypeInfo(element.type);
    if (!info || info.properties.length === 0) continue;

    console.log(INDENT + chalk.bold(section.name) + dim(` (${section.idPrefix}###)`));
    console.log();

    for (const prop of info.properties) {
      const req = prop.required ? success('*') : ' ';
      const typeStr = dim(`<${prop.type}>`);
      console.log(INDENT + INDENT + req + highlight(prop.name.padEnd(20)) + typeStr);
      if (prop.description) {
        console.log(INDENT + INDENT + '  ' + dim(prop.description));
      }
      if (prop.enumValues) {
        console.log(INDENT + INDENT + '  ' + dim('Values: ') + prop.enumValues.join(', '));
      }
    }
    console.log();
  }

  console.log(dim('* = required'));
  console.log();
}

/**
 * Display a template for a document type.
 */
function displayTemplate(type: DocumentType): void {
  console.log(subheader('Template:'));
  console.log();

  const template = getAnnotatedTemplate(type);
  // Colorize YAML output
  const lines = template.split('\n');
  for (const line of lines) {
    if (line.startsWith('#')) {
      console.log(dim(line));
    } else if (line.includes(':')) {
      const [key, ...rest] = line.split(':');
      const value = rest.join(':');
      console.log(highlight(key) + ':' + value);
    } else {
      console.log(line);
    }
  }
  console.log();
}

/**
 * Display all element types (ID patterns).
 */
function displayElements(): void {
  console.log();
  console.log(header('UBML Element Types'));
  console.log(dim('────────────────────────────────────────────────────────────'));
  console.log();
  console.log('Elements are identified by prefixed IDs. Each prefix indicates the type:');
  console.log();

  const elements = getAllElementTypes();

  // Group by category
  const groups: Record<string, typeof elements> = {
    'Process Elements': elements.filter((e) => ['PR', 'ST', 'PH', 'BK'].includes(e.prefix)),
    'Actors & Resources': elements.filter((e) => ['AC', 'SK', 'RP', 'EQ', 'PS'].includes(e.prefix)),
    'Information Model': elements.filter((e) => ['EN', 'DC', 'LC'].includes(e.prefix)),
    'Strategy': elements.filter((e) => ['VS', 'CP', 'PD', 'SV', 'PF'].includes(e.prefix)),
    'Analysis': elements.filter((e) => ['HY', 'EV', 'SC', 'KP'].includes(e.prefix)),
    'Other': elements.filter((e) => ['VW'].includes(e.prefix)),
  };

  for (const [group, items] of Object.entries(groups)) {
    if (items.length === 0) continue;
    console.log(INDENT + chalk.bold(group));
    for (const item of items) {
      console.log(
        INDENT + INDENT +
        code(item.prefix.padEnd(4)) +
        highlight(item.type.padEnd(16)) +
        dim(`Example: ${item.prefix}001`)
      );
    }
    console.log();
  }

  console.log(dim('────────────────────────────────────────────────────────────'));
  console.log();
  console.log('Use ' + code('ubml schema <type> --properties') + ' to see properties for a document type.');
  console.log();
}

// =============================================================================
// Command Definition
// =============================================================================

/**
 * Create the schema command.
 */
export function schemaCommand(): Command {
  const command = new Command('schema');

  command
    .description('Explore UBML schema and learn what you can model')
    .argument('[type]', 'Document type to show details for')
    .option('-w, --workflow', 'Show recommended modeling workflow')
    .option('-e, --elements', 'Show all element types and ID patterns')
    .option('-p, --properties', 'Show detailed property information')
    .option('-t, --template', 'Show a starter template for the type')
    .option('--json', 'Output in JSON format')
    .addHelpText('after', `
Examples:
  ${chalk.dim('# Show overview of all document types')}
  ubml schema

  ${chalk.dim('# Show recommended workflow for new users')}
  ubml schema --workflow

  ${chalk.dim('# Show details for process documents')}
  ubml schema process

  ${chalk.dim('# Show a template for a new process file')}
  ubml schema process --template

  ${chalk.dim('# Show all properties for actors')}
  ubml schema actors --properties

  ${chalk.dim('# Show all element ID patterns')}
  ubml schema --elements
`)
    .action((type: string | undefined, options: {
      workflow?: boolean;
      elements?: boolean;
      properties?: boolean;
      template?: boolean;
      json?: boolean;
    }) => {
      // JSON output mode
      if (options.json) {
        if (type && isValidDocumentType(type)) {
          const info = getDocumentTypeInfo(type as DocumentType);
          console.log(JSON.stringify(info, null, 2));
        } else {
          const allTypes = getAllDocumentTypes();
          console.log(JSON.stringify(allTypes, null, 2));
        }
        return;
      }

      // Workflow mode
      if (options.workflow) {
        displayWorkflow();
        return;
      }

      // Elements mode
      if (options.elements) {
        displayElements();
        return;
      }

      // Specific type mode
      if (type) {
        if (!isValidDocumentType(type)) {
          console.error(chalk.red(`Error: Unknown document type "${type}"`));
          console.error();
          console.error('Available types:');
          for (const t of DOCUMENT_TYPES) {
            console.error(INDENT + highlight(t));
          }
          process.exit(1);
        }

        displayDocumentType(type as DocumentType, {
          properties: options.properties,
          template: options.template,
        });
        return;
      }

      // Default: show overview
      displayOverview();
    });

  return command;
}

/**
 * Check if a string is a valid document type.
 */
function isValidDocumentType(type: string): boolean {
  return DOCUMENT_TYPES.includes(type as DocumentType);
}
