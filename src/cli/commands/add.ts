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
import { serialize } from '../../index';
import {
  getDocumentTypeInfo,
  getSuggestedNextStep,
  getSuggestedWorkflow,
  createDocument,
} from '../../schema/index.js';
import { 
  DOCUMENT_TYPES, 
  type DocumentType, 
  type IdPrefix,
  detectDocumentType,
  ID_CONFIG,
  SCHEMA_VERSION,
  formatId,
} from '../../metadata.js';
import {
  TEMPLATE_DATA,
  createMinimalDocument,
  getDocumentHeader,
  getSectionComment,
} from '../../templates.js';
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
// Schema-Driven Template Generation
// =============================================================================
// Templates are generated from schema metadata extracted at build time.
// This ensures templates always match the current schema.
// =============================================================================

/**
 * Create a YAML template with helpful inline comments.
 * Uses schema-derived metadata for property info and comments.
 */
function createCommentedTemplate(type: DocumentType, name: string): string {
  const templateInfo = TEMPLATE_DATA[type];
  if (!templateInfo || templateInfo.sections.length === 0) {
    // Fallback to minimal document from schema
    const doc = createMinimalDocument(type, name);
    return serialize(doc);
  }

  // Build YAML with comments
  const lines: string[] = [];
  
  // Header with description and quick reference
  lines.push(getDocumentHeader(type, formatDisplayName(name)));
  lines.push(`ubml: "${SCHEMA_VERSION}"`);
  lines.push('');

  // Generate each section
  for (const section of templateInfo.sections) {
    lines.push(...generateSectionYaml(type, section, name));
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Format a name for display in comments.
 */
function formatDisplayName(name: string): string {
  return name
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Generate YAML for a document section with comments.
 */
function generateSectionYaml(
  docType: DocumentType,
  section: typeof TEMPLATE_DATA[DocumentType]['sections'][number],
  name: string
): string[] {
  const lines: string[] = [];
  
  // Section header with available properties
  lines.push(`${section.name}:`);
  lines.push(getSectionComment(docType, section.name));
  
  // Generate sample items based on section type
  const items = generateSectionItems(docType, section, name);
  
  for (const item of items) {
    lines.push(`  ${item.id}:`);
    
    // Check for raw YAML content (pre-formatted)
    const rawContent = item.properties.__raw;
    if (rawContent && typeof rawContent === 'string') {
      // Output raw content as-is (already properly indented)
      lines.push(rawContent);
    } else {
      // Output regular properties
      for (const [key, value] of Object.entries(item.properties)) {
        const propInfo = section.properties.find(p => p.name === key);
        const comment = propInfo?.enumValues 
          ? `  # ${propInfo.enumValues.join(' | ')}`
          : '';
        lines.push(`    ${key}: ${formatValue(value)}${comment}`);
      }
      if (item.commentedProps) {
        for (const [key, value] of Object.entries(item.commentedProps)) {
          lines.push(`    # ${key}: ${formatValue(value)}`);
        }
      }
    }
  }
  
  return lines;
}

interface SectionItem {
  id: string;
  properties: Record<string, unknown>;
  commentedProps?: Record<string, unknown>;
}

/**
 * Generate sample items for a section based on document type and section.
 */
function generateSectionItems(
  docType: DocumentType,
  section: typeof TEMPLATE_DATA[DocumentType]['sections'][number],
  name: string
): SectionItem[] {
  const items: SectionItem[] = [];
  const prefix = section.idPrefix;
  
  // Build required properties from schema
  const requiredProps: Record<string, unknown> = {};
  const optionalProps: Record<string, unknown> = {};
  
  for (const prop of section.properties) {
    if (prop.required) {
      if (prop.name === 'name') {
        requiredProps.name = 'TODO: Add name';
      } else if (prop.name === 'id') {
        // id will be set from the key
        requiredProps.id = formatId(prefix as IdPrefix, ID_CONFIG.addOffset);
      } else if (prop.enumValues && prop.enumValues.length > 0) {
        // Use first enum value as default, or schema default
        requiredProps[prop.name] = prop.default ?? prop.enumValues[0];
      } else if (prop.default !== undefined) {
        requiredProps[prop.name] = prop.default;
      } else if (prop.type === 'ref') {
        // Reference fields should use a placeholder ID pattern
        // Uses addOffset series to avoid conflicts with init templates
        requiredProps[prop.name] = formatId('AC', ID_CONFIG.addOffset);
      } else {
        requiredProps[prop.name] = 'TODO';
      }
    } else {
      // Collect interesting optional props to show as comments
      if (['description', 'duration', 'unit', 'target', 'baseline'].includes(prop.name)) {
        if (prop.enumValues && prop.enumValues.length > 0) {
          optionalProps[prop.name] = prop.enumValues[0];
        } else if (prop.type === 'string') {
          optionalProps[prop.name] = '...';
        } else if (prop.type === 'number') {
          optionalProps[prop.name] = 0;
        }
      }
    }
  }
  
  // Apply section defaults from schema
  if (section.defaults) {
    Object.assign(requiredProps, section.defaults);
  }
  
  // Handle special cases per document/section type
  switch (docType) {
    case 'process':
      if (section.name === 'processes') {
        return generateProcessItems(section, name);
      }
      break;
    case 'actors':
      if (section.name === 'actors') {
        return generateActorItems(section);
      }
      if (section.name === 'skills') {
        return generateSkillItems(section);
      }
      break;
    case 'hypotheses':
      if (section.name === 'hypothesisTrees') {
        return generateHypothesisTreeItems(section, name);
      }
      break;
  }
  
  // Default: single item with required props
  // Uses addOffset series to avoid conflicts with init templates
  items.push({
    id: formatId(prefix as IdPrefix, ID_CONFIG.addOffset),
    properties: requiredProps,
    commentedProps: Object.keys(optionalProps).length > 0 ? optionalProps : undefined,
  });
  
  return items;
}

/**
 * Generate process items with proper step structure.
 */
function generateProcessItems(
  section: typeof TEMPLATE_DATA[DocumentType]['sections'][number],
  name: string
): SectionItem[] {
  const displayName = formatDisplayName(name);
  
  // Use centralized ID generation with addOffset
  const offset = ID_CONFIG.addOffset;
  const prId = formatId('PR', offset);
  const st1 = formatId('ST', offset);
  const st2 = formatId('ST', offset + 1);
  const stEnd = formatId('ST', offset + 199);
  const acRef = formatId('AC', offset);
  
  // Build steps inline - processes need nested structure
  const processContent = `
    id: ${prId}
    name: "${displayName}"
    description: "TODO: Describe what this process achieves"
    level: 3
    steps:
      ${st1}:
        name: "Start"
        kind: start
        description: "Process entry point"
      ${st2}:
        name: "First Activity"
        kind: action
        description: "TODO: What happens in this step?"
        # duration: "1h"
        # raci:
        #   responsible: [${acRef}]
      ${stEnd}:
        name: "End"
        kind: end
        description: "Process completes"
    links:
      - from: ${st1}
        to: ${st2}
      - from: ${st2}
        to: ${stEnd}`;
  
  // Return as raw YAML to preserve nesting
  return [{
    id: prId,
    properties: {
      __raw: processContent,
    },
  }];
}

/**
 * Generate actor items with different types.
 */
function generateActorItems(
  section: typeof TEMPLATE_DATA[DocumentType]['sections'][number]
): SectionItem[] {
  const defaults = section.defaults || {};
  const offset = ID_CONFIG.addOffset;
  
  return [
    {
      id: formatId('AC', offset),
      properties: {
        name: 'Process Owner',
        type: defaults.type ?? 'role',
        kind: defaults.kind ?? 'human',
        description: 'Responsible for process outcomes',
      },
    },
    {
      id: formatId('AC', offset + 10),
      properties: {
        name: 'Core System',
        type: 'system',
        kind: 'system',
        description: 'Primary application',
      },
    },
  ];
}

/**
 * Generate skill items.
 */
function generateSkillItems(
  section: typeof TEMPLATE_DATA[DocumentType]['sections'][number]
): SectionItem[] {
  return [
    {
      id: formatId('SK', ID_CONFIG.addOffset),
      properties: {
        name: 'Domain Expertise',
        description: 'Deep knowledge of the business domain',
      },
    },
  ];
}

/**
 * Generate hypothesis tree items with proper nested structure.
 */
function generateHypothesisTreeItems(
  section: typeof TEMPLATE_DATA[DocumentType]['sections'][number],
  name: string
): SectionItem[] {
  const displayName = formatDisplayName(name);
  const offset = ID_CONFIG.addOffset;
  // HT pattern for hypothesis trees (not a standard IdPrefix in metadata)
  const htId = `HT${String(offset).padStart(ID_CONFIG.digitLength, '0')}`;
  
  // H prefix is used for hypothesis nodes within a tree
  const h1 = `H${String(offset).padStart(ID_CONFIG.digitLength - 1, '0')}`;
  const h2 = `H${String(offset + 1).padStart(ID_CONFIG.digitLength - 1, '0')}`;
  const h3 = `H${String(offset + 2).padStart(ID_CONFIG.digitLength - 1, '0')}`;
  
  const treeContent = `
    name: "${displayName} Analysis"
    scqh:
      situation: "TODO: Current state description"
      complication: "TODO: What problem exists?"
      question: "How can we improve?"
      hypothesis: "By doing X we can achieve Y"
    root:
      id: ${h1}
      text: "Main hypothesis to validate"
      type: hypothesis
      status: untested
      children:
        - id: ${h2}
          text: "Sub-hypothesis 1"
          type: hypothesis
          status: untested
        - id: ${h3}
          text: "Sub-hypothesis 2"
          type: hypothesis
          status: untested`;
  
  return [{
    id: htId,
    properties: {
      __raw: treeContent,
    },
  }];
}

/**
 * Format a value for YAML output.
 */
function formatValue(value: unknown): string {
  if (value === null || value === undefined) return '~';
  if (typeof value === 'string') {
    // Check if it's raw YAML (starts with newline)
    if (value.startsWith('\n')) return value;
    // Quote strings that need it
    if (value.includes(':') || value.includes('#') || value.includes('\n')) {
      return `"${value.replace(/"/g, '\\"')}"`;
    }
    return `"${value}"`;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    return `[${value.map(v => formatValue(v)).join(', ')}]`;
  }
  if (typeof value === 'object') {
    // Check for __raw marker
    const raw = (value as Record<string, unknown>).__raw;
    if (raw) return String(raw);
    return '{}';
  }
  return String(value);
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
 * Add a new UBML document file.
 */
function addDocument(
  type: DocumentType,
  name: string | undefined,
  options: { dir: string; force: boolean }
): void {
  const dir = resolve(options.dir);
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
