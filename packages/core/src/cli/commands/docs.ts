/**
 * Docs command for UBML CLI.
 *
 * Provides quick reference documentation and examples.
 *
 * @module ubml/cli/commands/docs
 */

import { Command } from 'commander';
import chalk from 'chalk';
import {
  getAllDocumentTypes,
  getDocumentTypeInfo,
  getAllElementTypes,
  getSuggestedWorkflow,
} from '../schema-introspection.js';
import { SCHEMA_VERSION } from '../../generated/metadata.js';

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

function code(text: string): string {
  return chalk.cyan(text);
}

function highlight(text: string): string {
  return chalk.yellow(text);
}

// =============================================================================
// Documentation Content
// =============================================================================

const QUICKSTART = `
${header('UBML Quick Start Guide')}
${dim('────────────────────────────────────────────────────────────')}

UBML (Unified Business Modeling Language) helps you capture how 
your business works in structured, validated YAML files.

${subheader('1. Initialize a Workspace')}

   ${code('ubml init my-project')}      ${dim('# Create new project folder')}
   ${code('cd my-project')}
   ${code('code .')}                    ${dim('# Open in VS Code')}

${subheader('2. Explore What You Can Model')}

   ${code('ubml schema')}               ${dim('# See all document types')}
   ${code('ubml schema process')}       ${dim('# Learn about processes')}
   ${code('ubml schema --workflow')}    ${dim('# See recommended order')}

${subheader('3. Add Content')}

   ${code('ubml add')}                  ${dim('# See what you can add')}
   ${code('ubml add process')}          ${dim('# Add a process file')}
   ${code('ubml add actors')}           ${dim('# Add actors/roles')}

${subheader('4. Validate Your Model')}

   ${code('ubml validate .')}           ${dim('# Check for errors')}

${dim('────────────────────────────────────────────────────────────')}
`;

const CONCEPTS = `
${header('UBML Core Concepts')}
${dim('────────────────────────────────────────────────────────────')}

${subheader('Workspace')}
  The root of your UBML project. Contains metadata about the 
  project and references to other documents.
  ${dim('File: *.workspace.ubml.yaml')}

${subheader('Processes')}
  Business workflows with steps, decisions, and links.
  Processes can be hierarchical (L1-L4) for different detail levels.
  ${dim('File: *.process.ubml.yaml')}

${subheader('Steps')}
  Activities within a process. Types include:
  ${highlight('action')}     - Work activity or task
  ${highlight('decision')}   - Gateway/decision point  
  ${highlight('event')}      - Start, end, or intermediate event
  ${highlight('wait')}       - Waiting for external trigger
  ${highlight('subprocess')} - Call to another process

${subheader('Actors')}
  Who participates in processes. Types include:
  ${highlight('role')}         - Job function (preferred for RACI)
  ${highlight('team')}         - Department or group
  ${highlight('system')}       - IT system or application
  ${highlight('external')}     - External party (customer, vendor)
  ${highlight('organization')} - Legal entity

${subheader('Entities')}
  Business objects that flow through processes.
  Documents, data objects, physical items.

${subheader('Links')}
  Connections between steps defining process flow.
  Support dependencies, conditions, and timing.

${dim('────────────────────────────────────────────────────────────')}
Learn more: ${code('ubml schema <type> --properties')}
`;

const ID_REFERENCE = `
${header('UBML ID Reference')}
${dim('────────────────────────────────────────────────────────────')}

Every element in UBML has a typed ID prefix:

${subheader('Process Elements')}
  ${highlight('PR###')}  Process           ${dim('PR001, PR002...')}
  ${highlight('ST###')}  Step              ${dim('ST001, ST002...')}
  ${highlight('PH###')}  Phase             ${dim('PH001, PH002...')}
  ${highlight('BK###')}  Block             ${dim('BK001, BK002...')}

${subheader('Actors & Resources')}
  ${highlight('AC###')}  Actor             ${dim('AC001, AC002...')}
  ${highlight('SK###')}  Skill             ${dim('SK001, SK002...')}
  ${highlight('RP###')}  Resource Pool     ${dim('RP001, RP002...')}
  ${highlight('EQ###')}  Equipment         ${dim('EQ001, EQ002...')}
  ${highlight('PS###')}  Persona           ${dim('PS001, PS002...')}

${subheader('Information Model')}
  ${highlight('EN###')}  Entity            ${dim('EN001, EN002...')}
  ${highlight('DC###')}  Document          ${dim('DC001, DC002...')}
  ${highlight('LC###')}  Location          ${dim('LC001, LC002...')}

${subheader('Strategy')}
  ${highlight('VS###')}  Value Stream      ${dim('VS001, VS002...')}
  ${highlight('CP###')}  Capability        ${dim('CP001, CP002...')}
  ${highlight('PD###')}  Product           ${dim('PD001, PD002...')}
  ${highlight('SV###')}  Service           ${dim('SV001, SV002...')}
  ${highlight('PF###')}  Portfolio         ${dim('PF001, PF002...')}

${subheader('Analysis')}
  ${highlight('HY###')}  Hypothesis        ${dim('HY001, HY002...')}
  ${highlight('HT###')}  Hypothesis Tree   ${dim('HT001, HT002...')}
  ${highlight('EV###')}  Evidence          ${dim('EV001, EV002...')}
  ${highlight('SC###')}  Scenario          ${dim('SC001, SC002...')}
  ${highlight('KP###')}  KPI               ${dim('KP001, KP002...')}

${subheader('Other')}
  ${highlight('VW###')}  View              ${dim('VW001, VW002...')}
  ${highlight('MS###')}  Mining Source     ${dim('MS001, MS002...')}
  ${highlight('ROI###')} ROI Analysis      ${dim('ROI001, ROI002...')}

${dim('────────────────────────────────────────────────────────────')}
${dim('Tip: Leave gaps in IDs for future additions (ST001, ST005, ST010...)')}
`;

const EXAMPLES = `
${header('UBML Examples')}
${dim('────────────────────────────────────────────────────────────')}

${subheader('Simple Process')}

${dim('# order-fulfillment.process.ubml.yaml')}
${highlight('ubml')}: "1.0"
${highlight('processes')}:
  ${code('PR001')}:
    ${highlight('name')}: "Order Fulfillment"
    ${highlight('description')}: "Process customer orders from receipt to delivery"
    ${highlight('level')}: 3
    ${highlight('steps')}:
      ${code('ST001')}:
        ${highlight('name')}: "Receive Order"
        ${highlight('kind')}: event
      ${code('ST002')}:
        ${highlight('name')}: "Validate Order"
        ${highlight('kind')}: action
        ${highlight('responsible')}: AC001
      ${code('ST003')}:
        ${highlight('name')}: "Ship Order"
        ${highlight('kind')}: action
    ${highlight('links')}:
      - ${highlight('from')}: ST001
        ${highlight('to')}: ST002
      - ${highlight('from')}: ST002
        ${highlight('to')}: ST003

${subheader('Actors File')}

${dim('# actors.ubml.yaml')}
${highlight('ubml')}: "1.0"
${highlight('actors')}:
  ${code('AC001')}:
    ${highlight('name')}: "Order Processor"
    ${highlight('type')}: role
    ${highlight('kind')}: human
    ${highlight('skills')}:
      - SK001
  ${code('AC002')}:
    ${highlight('name')}: "ERP System"
    ${highlight('type')}: system
    ${highlight('kind')}: system

${highlight('skills')}:
  ${code('SK001')}:
    ${highlight('name')}: "Order Management"
    ${highlight('description')}: "Knowledge of order processing procedures"

${dim('────────────────────────────────────────────────────────────')}
Get templates: ${code('ubml schema <type> --template')}
`;

const FILE_PATTERNS = `
${header('UBML File Patterns')}
${dim('────────────────────────────────────────────────────────────')}

UBML supports two filename patterns:

  ${highlight('type.ubml.yaml')}          ${dim('Simple (actors.ubml.yaml)')}
  ${highlight('prefix.type.ubml.yaml')}   ${dim('Prefixed (sales.actors.ubml.yaml)')}

${subheader('Core Document Types')}
  ${highlight('workspace')}   Root workspace config (one per project)
  ${highlight('process')}     Business process definitions
  ${highlight('actors')}      People, roles, teams, systems
  ${highlight('entities')}    Information model, documents

${subheader('Analysis & Strategy')}
  ${highlight('hypotheses')}  SCQH problem framing
  ${highlight('scenarios')}   Simulation scenarios
  ${highlight('metrics')}     KPIs and measurements
  ${highlight('strategy')}    Value streams, capabilities
  ${highlight('glossary')}    Business terminology

${subheader('Advanced')}
  ${highlight('mining')}      Process mining config
  ${highlight('views')}       Custom visualizations
  ${highlight('links')}       Cross-document references

${subheader('Example Structures')}

  ${dim('Simple project:')}
  my-project/
  ├── my-project.workspace.ubml.yaml
  ├── process.ubml.yaml
  ├── actors.ubml.yaml
  └── entities.ubml.yaml

  ${dim('Complex project:')}
  my-project/
  ├── my-project.workspace.ubml.yaml
  ├── glossary.ubml.yaml
  ├── customer-service/
  │   ├── onboarding.process.ubml.yaml
  │   └── service-team.actors.ubml.yaml
  └── shared/
      └── entities.ubml.yaml

${dim('────────────────────────────────────────────────────────────')}
${dim('Tip: Organize by domain, not by file type')}
`;

const VSCODE_GUIDE = `
${header('UBML in VS Code')}
${dim('────────────────────────────────────────────────────────────')}

UBML is designed to work seamlessly with VS Code.

${subheader('Setup')}

  ${highlight('1.')} Initialize a workspace (creates .vscode settings):
     ${code('ubml init my-project')}

  ${highlight('2.')} Open in VS Code:
     ${code('code my-project')}

  ${highlight('3.')} Install the YAML extension when prompted
     ${dim('(or: Cmd+Shift+X → search "YAML" by Red Hat)')}

${subheader('Features You Get')}

  ${highlight('Autocomplete')}      Press ${code('Ctrl+Space')} to see available properties
  ${highlight('Hover Docs')}        Hover over any property for documentation
  ${highlight('Validation')}        Red squiggles show errors as you type
  ${highlight('Quick Fixes')}       Click lightbulb for suggestions
  ${highlight('Go to Definition')} ${code('Cmd+Click')} on IDs to jump to definitions

${subheader('Keyboard Shortcuts')}

  ${code('Ctrl+Space')}     Show autocomplete suggestions
  ${code('Cmd+Shift+P')}    Command palette (search "YAML")
  ${code('Cmd+.')}          Quick fix suggestions
  ${code('F12')}            Go to definition
  ${code('Shift+F12')}      Find all references

${subheader('Recommended Extensions')}

  ${highlight('YAML')}              Required - schema validation & autocomplete
  ${dim('                    (redhat.vscode-yaml)')}

${subheader('Troubleshooting')}

  ${highlight('No autocomplete?')}
    • Check YAML extension is installed and enabled
    • Verify .vscode/settings.json has yaml.schemas
    • Reload window: ${code('Cmd+Shift+P')} → "Reload Window"

  ${highlight('Wrong schema?')}
    • File must end in ${code('.type.ubml.yaml')} or ${code('type.ubml.yaml')}
    • Example: ${code('actors.ubml.yaml')} or ${code('sales.actors.ubml.yaml')}

  ${highlight('Red squiggles everywhere?')}
    • Run ${code('ubml validate .')} in terminal for clearer errors
    • Check for YAML syntax errors (indentation!)

${subheader('Manual Setup (if not using ubml init)')}

  Add to ${code('.vscode/settings.json')}:

  ${dim('{')}
  ${dim('  "yaml.schemas": {')}
  ${dim('    "https://ubml.io/schemas/1.0/documents/process.document.yaml":')}
  ${dim('      ["*.process.ubml.yaml", "process.ubml.yaml"],')}
  ${dim('    // ... repeat for other types')}
  ${dim('  }')}
  ${dim('}')}

  Or reinstall: ${code('ubml init --here --force')}

${dim('────────────────────────────────────────────────────────────')}
`;

// =============================================================================
// Topic Display
// =============================================================================

type Topic = 'quickstart' | 'concepts' | 'ids' | 'examples' | 'files' | 'vscode';

const TOPICS: Record<Topic, { title: string; content: string }> = {
  quickstart: { title: 'Quick Start Guide', content: QUICKSTART },
  concepts: { title: 'Core Concepts', content: CONCEPTS },
  ids: { title: 'ID Reference', content: ID_REFERENCE },
  examples: { title: 'Examples', content: EXAMPLES },
  files: { title: 'File Patterns', content: FILE_PATTERNS },
  vscode: { title: 'VS Code Guide', content: VSCODE_GUIDE },
};

function displayTopic(topic: Topic): void {
  console.log(TOPICS[topic].content);
}

function displayTopicList(): void {
  console.log();
  console.log(header('UBML Documentation'));
  console.log(dim('────────────────────────────────────────────────────────────'));
  console.log();
  console.log('Available topics:');
  console.log();

  for (const [key, value] of Object.entries(TOPICS)) {
    console.log(INDENT + highlight(key.padEnd(12)) + value.title);
  }

  console.log();
  console.log(dim('────────────────────────────────────────────────────────────'));
  console.log();
  console.log('Usage: ' + code('ubml docs <topic>'));
  console.log();
  console.log('Examples:');
  console.log(INDENT + code('ubml docs quickstart') + dim('  # Get started with UBML'));
  console.log(INDENT + code('ubml docs concepts') + dim('    # Learn core concepts'));
  console.log(INDENT + code('ubml docs examples') + dim('    # See code examples'));
  console.log();
  console.log('Also see:');
  console.log(INDENT + code('ubml schema') + dim('            # Explore the schema'));
  console.log(INDENT + code('ubml schema --workflow') + dim('  # Recommended modeling workflow'));
  console.log();
}

// =============================================================================
// Command Definition
// =============================================================================

/**
 * Create the docs command.
 */
export function docsCommand(): Command {
  const command = new Command('docs');

  command
    .description('Quick reference documentation for UBML')
    .argument('[topic]', 'Documentation topic')
    .addHelpText('after', `
Topics:
  ${highlight('quickstart')}   Get started with UBML
  ${highlight('concepts')}     Core concepts explained
  ${highlight('ids')}          ID prefixes and patterns
  ${highlight('examples')}     Code examples
  ${highlight('files')}        File naming and structure

Examples:
  ${code('ubml docs')}              ${dim('# List available topics')}
  ${code('ubml docs quickstart')}   ${dim('# Show quick start guide')}
  ${code('ubml docs examples')}     ${dim('# Show code examples')}
`)
    .action((topic: string | undefined) => {
      if (!topic) {
        displayTopicList();
        return;
      }

      const normalizedTopic = topic.toLowerCase() as Topic;
      if (!(normalizedTopic in TOPICS)) {
        console.error(chalk.red(`Unknown topic: ${topic}`));
        console.error();
        console.error('Available topics:');
        for (const key of Object.keys(TOPICS)) {
          console.error(INDENT + highlight(key));
        }
        process.exit(1);
      }

      displayTopic(normalizedTopic);
    });

  return command;
}
