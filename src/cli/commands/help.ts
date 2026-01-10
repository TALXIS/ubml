/**
 * Help command for UBML CLI.
 *
 * Unified help interface that consolidates documentation topics.
 * Topics are now derived from schema metadata.
 *
 * @module ubml/cli/commands/help
 */

import { Command } from 'commander';
import chalk from 'chalk';
import {
  getAllDocumentTypes,
  getDocumentTypeInfo,
  getAllElementTypes,
  getElementTypeInfo,
  getSuggestedWorkflow,
  getHelpTopics,
  getHelpTopicsByCategory,
  findHelpTopic,
  getIdPrefixCategoryMap,
  type HelpTopic,
  type HelpTopicCategory,
} from '../../schema/index.js';
import { 
  SCHEMA_VERSION, 
  ID_PREFIXES, 
  ID_CONFIG, 
  formatId,
  type IdPrefix,
  DOCUMENT_TYPES,
  type DocumentType,
} from '../../metadata.js';
import { INDENT, header, subheader, dim, code, highlight } from '../formatters/text';

// =============================================================================
// Helpers
// =============================================================================

function showTopicNotFound(topic: string): void {
  console.error(chalk.red(`Unknown topic: ${topic}`));
  console.error();
  console.error('Run ' + code('ubml help') + ' to see all topics.');
  process.exit(1);
}

// =============================================================================
// Topic Content
// =============================================================================

const TOPICS: Record<string, () => void> = {
  // Getting started
  quickstart: showQuickstart,
  start: showQuickstart,
  
  // Concepts
  concepts: showConcepts,
  overview: showConcepts,
  
  // Element types
  step: () => showElementHelp('step'),
  actor: () => showElementHelp('actor'),
  entity: () => showElementHelp('entity'),
  process: () => showDocumentHelp('process'),
  hypothesis: () => showElementHelp('hypothesis'),
  scenario: () => showElementHelp('scenario'),
  
  // Document types
  workspace: () => showDocumentHelp('workspace'),
  actors: () => showDocumentHelp('actors'),
  entities: () => showDocumentHelp('entities'),
  hypotheses: () => showDocumentHelp('hypotheses'),
  scenarios: () => showDocumentHelp('scenarios'),
  metrics: () => showDocumentHelp('metrics'),
  strategy: () => showDocumentHelp('strategy'),
  glossary: () => showDocumentHelp('glossary'),
  
  // Reference
  ids: showIdPatterns,
  duration: showDurationFormats,
  raci: showRaciHelp,
  workflow: showWorkflow,
  
  // VS Code
  vscode: showVscodeHelp,
  editor: showVscodeHelp,
};

// =============================================================================
// Help Content Functions
// =============================================================================

function showQuickstart(): void {
  console.log();
  console.log(header('UBML Quick Start Guide'));
  console.log(dim('─'.repeat(60)));
  console.log();
  
  console.log(subheader('1. Initialize a Workspace'));
  console.log();
  console.log(INDENT + code('ubml init my-project') + dim('     # Create new project'));
  console.log(INDENT + code('cd my-project'));
  console.log(INDENT + code('code .') + dim('                     # Open in VS Code'));
  console.log();
  
  console.log(subheader('2. Explore What You Can Model'));
  console.log();
  console.log(INDENT + code('ubml schema') + dim('                # See document types'));
  console.log(INDENT + code('ubml help process') + dim('          # Learn about processes'));
  console.log(INDENT + code('ubml help workflow') + dim('         # Recommended order'));
  console.log();
  
  console.log(subheader('3. Add Content'));
  console.log();
  console.log(INDENT + code('ubml add') + dim('                   # See what you can add'));
  console.log(INDENT + code('ubml add process') + dim('           # Add a process file'));
  console.log(INDENT + code('ubml add actors') + dim('            # Add actors/roles'));
  console.log();
  
  console.log(subheader('4. Validate Your Model'));
  console.log();
  console.log(INDENT + code('ubml validate .') + dim('            # Check for errors'));
  console.log();
  
  console.log(subheader('5. Visualize'));
  console.log();
  console.log(INDENT + code('ubml show') + dim('                  # See workspace summary'));
  console.log(INDENT + code('ubml show tree') + dim('             # Hierarchical view'));
  console.log();
  
  console.log(dim('─'.repeat(60)));
  console.log(dim('More: ubml help <topic>  |  Topics: concepts, step, actor, ids'));
  console.log();
}

function showConcepts(): void {
  console.log();
  console.log(header('UBML Core Concepts'));
  console.log(dim('─'.repeat(60)));
  console.log();
  
  console.log(subheader('Workspace'));
  console.log(INDENT + 'The root of your UBML project. Contains metadata and');
  console.log(INDENT + 'references to other documents.');
  console.log(INDENT + dim('File: *.workspace.ubml.yaml'));
  console.log();
  
  console.log(subheader('Processes'));
  console.log(INDENT + 'Business workflows with steps, decisions, and links.');
  console.log(INDENT + 'Processes can be hierarchical (L1-L4) for detail levels.');
  console.log(INDENT + dim('File: *.process.ubml.yaml'));
  console.log();
  
  console.log(subheader('Steps'));
  console.log(INDENT + 'Activities within a process:');
  console.log(INDENT + highlight('action') + INDENT + '- Work activity or task');
  console.log(INDENT + highlight('decision') + INDENT + '- Gateway/decision point');
  console.log(INDENT + highlight('start/end') + ' - Process boundaries');
  console.log(INDENT + highlight('wait') + INDENT + '  - Waiting for trigger');
  console.log();
  
  console.log(subheader('Actors'));
  console.log(INDENT + 'Who participates in processes:');
  console.log(INDENT + highlight('role') + INDENT + '- Job function (preferred for RACI)');
  console.log(INDENT + highlight('team') + INDENT + '- Department or group');
  console.log(INDENT + highlight('system') + '  - IT system or application');
  console.log(INDENT + highlight('external') + '- External party');
  console.log();
  
  console.log(subheader('Entities'));
  console.log(INDENT + 'Business objects that flow through processes.');
  console.log(INDENT + 'Documents, data objects, physical items.');
  console.log();
  
  console.log(dim('─'.repeat(60)));
  console.log(dim('More: ubml help <type>  |  Types: step, actor, process, entity'));
  console.log();
}

function showElementHelp(elementType: string): void {
  const info = getElementTypeInfo(elementType);
  if (!info) {
    console.error(chalk.red(`Unknown element type: ${elementType}`));
    return;
  }
  
  console.log();
  console.log(header(`${elementType.charAt(0).toUpperCase() + elementType.slice(1)} Reference`));
  console.log(dim('─'.repeat(60)));
  console.log();
  
  // Show properties
  console.log(subheader('Properties'));
  console.log();
  
  for (const prop of info.properties) {
    const req = prop.required ? chalk.red('*') : ' ';
    const typeInfo = prop.enumValues 
      ? prop.enumValues.slice(0, 5).join(' | ') + (prop.enumValues.length > 5 ? ' ...' : '')
      : prop.type;
    
    console.log(`${req} ${highlight(prop.name)}: ${typeInfo}`);
    
    if (prop.examples && prop.examples.length > 0) {
      const ex = prop.examples[0];
      const exStr = typeof ex === 'string' ? `"${ex}"` : JSON.stringify(ex);
      console.log(INDENT + dim('Example:') + ` ${exStr}`);
    }
  }
  
  console.log();
  console.log(dim('─'.repeat(60)));
  console.log(dim(`${chalk.red('*')} = required`));
  console.log();
}

function showDocumentHelp(docType: string): void {
  const info = getDocumentTypeInfo(docType as DocumentType);
  if (!info) {
    console.error(chalk.red(`Unknown document type: ${docType}`));
    return;
  }
  
  console.log();
  console.log(header(`${info.title} Document`));
  console.log(dim('─'.repeat(60)));
  console.log();
  console.log(info.shortDescription || 'No description available.');
  console.log();
  
  console.log(subheader('File Pattern'));
  console.log(INDENT + `*.${docType}.ubml.yaml`);
  console.log();
  
  if (info.sections.length > 0) {
    console.log(subheader('Sections'));
    for (const section of info.sections) {
      console.log(INDENT + `${highlight(section.name)}: ${dim(`${section.idPrefix}### IDs`)}`);
    }
    console.log();
  }
  
  console.log(subheader('Quick Start'));
  console.log(INDENT + code(`ubml add ${docType}`));
  console.log();
}

function showIdPatterns(): void {
  console.log();
  console.log(header('UBML ID Patterns'));
  console.log(dim('─'.repeat(60)));
  console.log();
  console.log(`Format: ${highlight('PREFIX')} + ${ID_CONFIG.digitLength} digits (e.g., AC00001, PR01000)`);
  console.log();
  
  // Get categories derived from schema (no hardcoding!)
  const categories = getIdPrefixCategoryMap();
  
  for (const [category, prefixes] of Object.entries(categories)) {
    console.log(subheader(category));
    for (const prefix of prefixes) {
      const type = ID_PREFIXES[prefix as IdPrefix];
      if (type) {
        console.log(INDENT + `${highlight(prefix)}##### - ${type}`);
      }
    }
    console.log();
  }
  
  console.log(dim('─'.repeat(60)));
  console.log(dim('Tip: Use gaps of 10 (AC00010, AC00020) for easy insertion'));
  console.log(dim('Get next ID: ubml nextid AC'));
  console.log();
}

function showDurationFormats(): void {
  console.log();
  console.log(header('Duration Formats'));
  console.log(dim('─'.repeat(60)));
  console.log();
  console.log('UBML uses ONE canonical duration format: number + unit');
  console.log(dim('(See P9.1: No Alternative Representations)'));
  console.log();
  
  console.log(subheader('Format: {number}{unit}'));
  console.log();
  console.log(INDENT + `${highlight('30min')}  - 30 minutes`);
  console.log(INDENT + `${highlight('2h')}     - 2 hours`);
  console.log(INDENT + `${highlight('1.5d')}   - 1.5 days (12 working hours)`);
  console.log(INDENT + `${highlight('1wk')}    - 1 week (5 working days)`);
  console.log(INDENT + `${highlight('3mo')}    - 3 months`);
  console.log();
  
  console.log(subheader('Available Units'));
  console.log();
  console.log(INDENT + `${highlight('min')} - minutes`);
  console.log(INDENT + `${highlight('h')}   - hours`);
  console.log(INDENT + `${highlight('d')}   - days (8 working hours)`);
  console.log(INDENT + `${highlight('wk')}  - weeks (5 working days)`);
  console.log(INDENT + `${highlight('mo')}  - months`);
  console.log();
  
  console.log(subheader('Decimals Supported'));
  console.log();
  console.log(INDENT + `${highlight('1.5h')}   - 1 hour 30 minutes`);
  console.log(INDENT + `${highlight('0.5d')}   - 4 hours (half day)`);
  console.log(INDENT + `${highlight('2.5wk')}  - 2 weeks 2.5 days`);
  console.log();
  
  console.log(dim('─'.repeat(60)));
  console.log(dim('Working day = 8 hours, Working week = 5 days'));
  console.log(dim('Use decimals for compound durations (1.5h not 1h30m)'));
  console.log();
}

function showRaciHelp(): void {
  console.log();
  console.log(header('RACI Matrix'));
  console.log(dim('─'.repeat(60)));
  console.log();
  console.log('RACI defines responsibility assignments for steps:');
  console.log();
  
  console.log(INDENT + `${highlight('R')}esponsible - Does the work (typically one actor)`);
  console.log(INDENT + `${highlight('A')}ccountable - Approves/signs off (exactly one actor)`);
  console.log(INDENT + `${highlight('C')}onsulted   - Provides input (two-way communication)`);
  console.log(INDENT + `${highlight('I')}nformed    - Kept up to date (one-way communication)`);
  console.log();
  
  console.log(subheader('Example'));
  console.log();
  console.log(dim(`  steps:
    ST00001:
      name: "Review Contract"
      kind: action
      raci:
        responsible: [AC00001]  # Legal Counsel
        accountable: AC00002    # Department Head
        consulted: [AC00003]    # Finance
        informed: [AC00004]     # Stakeholder`));
  console.log();
  
  console.log(dim('─'.repeat(60)));
  console.log(dim('Note: responsible and consulted are arrays, accountable is single'));
  console.log();
}

function showWorkflow(): void {
  console.log();
  console.log(header('Recommended Modeling Workflow'));
  console.log(dim('─'.repeat(60)));
  console.log();
  
  const workflow = getSuggestedWorkflow();
  let step = 1;
  
  for (const item of workflow) {
    const info = getDocumentTypeInfo(item.type);
    console.log(`${step}. ${highlight(item.type)} - ${info?.title || item.type}`);
    console.log(INDENT + dim(item.reason));
    console.log(INDENT + code(`ubml add ${item.type}`));
    console.log();
    step++;
  }
  
  console.log(dim('─'.repeat(60)));
  console.log(dim('This order minimizes forward references and validates progressively'));
  console.log();
}

function showVscodeHelp(): void {
  console.log();
  console.log(header('VS Code Integration'));
  console.log(dim('─'.repeat(60)));
  console.log();
  
  console.log(subheader('Setup'));
  console.log(INDENT + '1. Install the ' + highlight('YAML') + ' extension by Red Hat');
  console.log(INDENT + '2. Run ' + code('ubml init') + ' to create .vscode/settings.json');
  console.log(INDENT + '3. Reload the window (Cmd+Shift+P → "Reload Window")');
  console.log();
  
  console.log(subheader('Features'));
  console.log(INDENT + '• ' + highlight('Autocomplete') + ' - Press Ctrl+Space in YAML files');
  console.log(INDENT + '• ' + highlight('Validation') + ' - Red squiggles show errors');
  console.log(INDENT + '• ' + highlight('Hover docs') + ' - Hover over properties for help');
  console.log(INDENT + '• ' + highlight('Formatting') + ' - Right-click → Format Document');
  console.log();
  
  console.log(subheader('Keyboard Shortcuts'));
  console.log(INDENT + `${highlight('Ctrl+Space')}  - Trigger autocomplete`);
  console.log(INDENT + `${highlight('Ctrl+.')}      - Quick fixes for errors`);
  console.log(INDENT + `${highlight('F2')}          - Rename symbol`);
  console.log();
  
  console.log(dim('─'.repeat(60)));
  console.log(dim('Tip: The YAML extension uses UBML schemas from ubml.io'));
  console.log();
}

function showTopicList(): void {
  console.log();
  console.log(header('UBML Help Topics'));
  console.log(dim('─'.repeat(60)));
  console.log();
  
  const topicsByCategory = getHelpTopicsByCategory();
  
  const categoryLabels: Record<HelpTopicCategory, string> = {
    'getting-started': 'Getting Started',
    'documents': 'Document Types',
    'elements': 'Elements',
    'reference': 'Reference',
  };

  const categoryOrder: HelpTopicCategory[] = ['getting-started', 'documents', 'elements', 'reference'];

  for (const category of categoryOrder) {
    const topics = topicsByCategory[category];
    if (topics.length === 0) continue;

    console.log(subheader(categoryLabels[category]));
    for (const topic of topics) {
      console.log(INDENT + `${highlight(topic.name.padEnd(12))} - ${topic.description}`);
    }
    console.log();
  }
  
  console.log(dim('─'.repeat(60)));
  console.log('Usage: ' + code('ubml help <topic>'));
  console.log();
}

// =============================================================================
// Command Definition
// =============================================================================

/**
 * Create the help command.
 */
export function helpCommand(): Command {
  const command = new Command('help');

  command
    .description('Show help for UBML topics')
    .argument('[topic]', 'Help topic (e.g., quickstart, step, ids)')
    .addHelpText('after', `
Examples:
  ${chalk.dim('# Show all topics')}
  ubml help

  ${chalk.dim('# Quick start guide')}
  ubml help quickstart

  ${chalk.dim('# Learn about steps')}
  ubml help step

  ${chalk.dim('# ID pattern reference')}
  ubml help ids

Topics:
  quickstart   Getting started guide
  concepts     Core UBML concepts
  step         Step properties and examples
  actor        Actor properties and types
  process      Process document structure
  ids          ID pattern reference
  duration     Duration format guide
  raci         RACI matrix explained
  vscode       VS Code integration
`)
    .action((topic?: string) => {
      if (!topic) {
        showTopicList();
        return;
      }
      
      const normalizedTopic = topic.toLowerCase();
      
      // First try schema-driven topic lookup
      const helpTopic = findHelpTopic(normalizedTopic);
      
      if (helpTopic) {
        switch (helpTopic.type) {
          case 'document':
            showDocumentHelp(helpTopic.name);
            break;
          case 'element':
            showElementHelp(helpTopic.name);
            break;
          case 'static':
            // Static topics still use the TOPICS map for content
            const handler = TOPICS[helpTopic.name] ?? TOPICS[normalizedTopic];
            if (handler) {
              handler();
            } else {
              showTopicNotFound(topic);
            }
            break;
        }
        return;
      }
      
      // Check hardcoded TOPICS
      const handler = TOPICS[normalizedTopic];
      if (handler) {
        handler();
      } else {
        showTopicNotFound(topic);
      }
    });

  return command;
}
