/**
 * Show command for UBML CLI.
 *
 * Visualizes UBML workspace contents without reading raw YAML.
 * Provides tree, summary, and flow views.
 *
 * @module ubml/cli/commands/show
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { resolve, basename, relative } from 'path';
import { readdirSync, readFileSync, statSync } from 'fs';
import { parse as parseYaml } from 'yaml';
import { 
  ID_PREFIXES, 
  DOCUMENT_TYPES,
  type DocumentType,
  type IdPrefix,
  getIdPrefix,
  isValidId,
  detectDocumentType,
} from '../../metadata.js';
import { INDENT, header, subheader, dim, highlight, success } from '../formatters/text';

// =============================================================================
// Workspace Parsing
// =============================================================================

interface WorkspaceElement {
  id: string;
  name: string;
  type: string;
  file: string;
  children?: WorkspaceElement[];
}

interface WorkspaceInfo {
  name?: string;
  description?: string;
  files: { path: string; type: DocumentType }[];
  actors: WorkspaceElement[];
  processes: WorkspaceElement[];
  entities: WorkspaceElement[];
  steps: Map<string, WorkspaceElement[]>;
  metrics: WorkspaceElement[];
  hypotheses: WorkspaceElement[];
  scenarios: WorkspaceElement[];
  totalElements: number;
}

/**
 * Scan a directory for UBML files and parse their contents.
 */
function scanWorkspace(dir: string): WorkspaceInfo {
  const info: WorkspaceInfo = {
    files: [],
    actors: [],
    processes: [],
    entities: [],
    steps: new Map(),
    metrics: [],
    hypotheses: [],
    scenarios: [],
    totalElements: 0,
  };

  function scanDir(currentDir: string): void {
    try {
      const entries = readdirSync(currentDir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = resolve(currentDir, entry.name);
        
        if (entry.isDirectory() && !entry.name.startsWith('.')) {
          scanDir(fullPath);
        } else if (entry.isFile() && entry.name.endsWith('.ubml.yaml')) {
          const type = detectDocumentType(entry.name);
          if (type) {
            info.files.push({ path: fullPath, type });
            parseUbmlFile(fullPath, type, info);
          }
        }
      }
    } catch {
      // Skip unreadable directories
    }
  }

  scanDir(dir);
  return info;
}

/**
 * Parse a UBML file and extract elements.
 */
function parseUbmlFile(filepath: string, type: DocumentType, info: WorkspaceInfo): void {
  try {
    const content = readFileSync(filepath, 'utf8');
    const parsed = parseYaml(content) as Record<string, unknown>;
    const filename = basename(filepath);

    // Extract workspace info
    if (type === 'workspace') {
      info.name = parsed.name as string | undefined;
      info.description = parsed.description as string | undefined;
    }

    // Extract actors
    if (parsed.actors && typeof parsed.actors === 'object') {
      for (const [id, actor] of Object.entries(parsed.actors as Record<string, { name?: string; type?: string }>)) {
        info.actors.push({
          id,
          name: actor.name || id,
          type: actor.type || 'unknown',
          file: filename,
        });
        info.totalElements++;
      }
    }

    // Extract processes and their steps
    if (parsed.processes && typeof parsed.processes === 'object') {
      for (const [id, process] of Object.entries(parsed.processes as Record<string, { name?: string; steps?: Record<string, { name?: string; kind?: string }> }>)) {
        const steps: WorkspaceElement[] = [];
        
        if (process.steps && typeof process.steps === 'object') {
          for (const [stepId, step] of Object.entries(process.steps)) {
            steps.push({
              id: stepId,
              name: step.name || stepId,
              type: step.kind || 'action',
              file: filename,
            });
            info.totalElements++;
          }
        }
        
        info.processes.push({
          id,
          name: process.name || id,
          type: 'process',
          file: filename,
          children: steps,
        });
        info.steps.set(id, steps);
        info.totalElements++;
      }
    }

    // Extract entities
    if (parsed.entities && typeof parsed.entities === 'object') {
      for (const [id, entity] of Object.entries(parsed.entities as Record<string, { name?: string; type?: string }>)) {
        info.entities.push({
          id,
          name: entity.name || id,
          type: entity.type || 'entity',
          file: filename,
        });
        info.totalElements++;
      }
    }

    // Extract metrics
    if (parsed.kpis && typeof parsed.kpis === 'object') {
      for (const [id, kpi] of Object.entries(parsed.kpis as Record<string, { name?: string }>)) {
        info.metrics.push({
          id,
          name: kpi.name || id,
          type: 'kpi',
          file: filename,
        });
        info.totalElements++;
      }
    }

    // Extract hypotheses
    if (parsed.hypothesisTrees && typeof parsed.hypothesisTrees === 'object') {
      for (const [id, tree] of Object.entries(parsed.hypothesisTrees as Record<string, { name?: string }>)) {
        info.hypotheses.push({
          id,
          name: tree.name || id,
          type: 'hypothesis',
          file: filename,
        });
        info.totalElements++;
      }
    }

    // Extract scenarios
    if (parsed.scenarios && typeof parsed.scenarios === 'object') {
      for (const [id, scenario] of Object.entries(parsed.scenarios as Record<string, { name?: string }>)) {
        info.scenarios.push({
          id,
          name: scenario.name || id,
          type: 'scenario',
          file: filename,
        });
        info.totalElements++;
      }
    }
  } catch {
    // Skip files that can't be parsed
  }
}

// =============================================================================
// Display Functions
// =============================================================================

/**
 * Show workspace summary.
 */
function showSummary(dir: string): void {
  const absoluteDir = resolve(dir);
  const info = scanWorkspace(absoluteDir);

  console.log();
  
  // Workspace header
  if (info.name) {
    console.log(header(info.name));
    if (info.description) {
      console.log(dim(info.description));
    }
  } else {
    console.log(header('UBML Workspace'));
  }
  console.log(dim('─'.repeat(60)));
  console.log();

  // Files summary
  console.log(subheader('Files'));
  const typeCount = new Map<DocumentType, number>();
  for (const file of info.files) {
    typeCount.set(file.type, (typeCount.get(file.type) || 0) + 1);
  }
  
  if (info.files.length === 0) {
    console.log(INDENT + dim('No UBML files found'));
  } else {
    for (const [type, count] of typeCount) {
      console.log(INDENT + `${highlight(type)}: ${count} file${count > 1 ? 's' : ''}`);
    }
  }
  console.log();

  // Elements summary
  console.log(subheader('Elements'));
  
  if (info.actors.length > 0) {
    const actorTypes = new Map<string, number>();
    for (const actor of info.actors) {
      actorTypes.set(actor.type, (actorTypes.get(actor.type) || 0) + 1);
    }
    const typeInfo = [...actorTypes.entries()].map(([t, c]) => `${c} ${t}`).join(', ');
    console.log(INDENT + `Actors (${info.actors.length}): ${dim(typeInfo)}`);
  }
  
  if (info.processes.length > 0) {
    let totalSteps = 0;
    for (const proc of info.processes) {
      totalSteps += proc.children?.length || 0;
    }
    console.log(INDENT + `Processes (${info.processes.length}): ${dim(`${totalSteps} total steps`)}`);
  }
  
  if (info.entities.length > 0) {
    console.log(INDENT + `Entities (${info.entities.length})`);
  }
  
  if (info.metrics.length > 0) {
    console.log(INDENT + `Metrics/KPIs (${info.metrics.length})`);
  }
  
  if (info.hypotheses.length > 0) {
    console.log(INDENT + `Hypothesis Trees (${info.hypotheses.length})`);
  }
  
  if (info.scenarios.length > 0) {
    console.log(INDENT + `Scenarios (${info.scenarios.length})`);
  }
  
  if (info.totalElements === 0) {
    console.log(INDENT + dim('No elements defined'));
  }
  
  console.log();
  console.log(dim('─'.repeat(60)));
  console.log(dim(`Total: ${info.files.length} files, ${info.totalElements} elements`));
  console.log();
}

/**
 * Show workspace as tree.
 */
function showTree(dir: string): void {
  const absoluteDir = resolve(dir);
  const info = scanWorkspace(absoluteDir);

  console.log();
  console.log(header(info.name || 'UBML Workspace'));
  console.log();

  // Show actors
  if (info.actors.length > 0) {
    console.log(subheader('Actors'));
    for (const actor of info.actors) {
      console.log(INDENT + `${highlight(actor.id)} ${actor.name} ${dim(`[${actor.type}]`)}`);
    }
    console.log();
  }

  // Show processes with steps
  if (info.processes.length > 0) {
    console.log(subheader('Processes'));
    for (const proc of info.processes) {
      console.log(INDENT + `${highlight(proc.id)} ${proc.name}`);
      if (proc.children && proc.children.length > 0) {
        for (let i = 0; i < proc.children.length; i++) {
          const step = proc.children[i];
          const isLast = i === proc.children.length - 1;
          const prefix = isLast ? '└──' : '├──';
          const kindIcon = getStepIcon(step.type);
          console.log(INDENT + INDENT + `${dim(prefix)} ${kindIcon} ${dim(step.id)} ${step.name}`);
        }
      }
    }
    console.log();
  }

  // Show entities
  if (info.entities.length > 0) {
    console.log(subheader('Entities'));
    for (const entity of info.entities) {
      console.log(INDENT + `${highlight(entity.id)} ${entity.name} ${dim(`[${entity.type}]`)}`);
    }
    console.log();
  }

  // Show metrics
  if (info.metrics.length > 0) {
    console.log(subheader('Metrics'));
    for (const metric of info.metrics) {
      console.log(INDENT + `${highlight(metric.id)} ${metric.name}`);
    }
    console.log();
  }
}

/**
 * Get icon for step kind.
 */
function getStepIcon(kind: string): string {
  switch (kind) {
    case 'start': return success('●');
    case 'end': return chalk.red('●');
    case 'decision': return chalk.magenta('◆');
    case 'wait': return chalk.blue('◎');
    case 'event': return chalk.cyan('◇');
    case 'subprocess': return chalk.yellow('▶');
    default: return '○';
  }
}

/**
 * Show list of processes.
 */
function showProcesses(dir: string): void {
  const absoluteDir = resolve(dir);
  const info = scanWorkspace(absoluteDir);

  console.log();
  console.log(header('Processes'));
  console.log(dim('─'.repeat(60)));
  console.log();

  if (info.processes.length === 0) {
    console.log(dim('No processes defined'));
    console.log();
    console.log('Add a process with: ' + chalk.cyan('ubml add process'));
  } else {
    for (const proc of info.processes) {
      const stepCount = proc.children?.length || 0;
      console.log(`${highlight(proc.id)} ${proc.name}`);
      console.log(INDENT + dim(`${stepCount} steps | ${proc.file}`));
      console.log();
    }
  }
  
  console.log();
}

/**
 * Show list of actors.
 */
function showActors(dir: string): void {
  const absoluteDir = resolve(dir);
  const info = scanWorkspace(absoluteDir);

  console.log();
  console.log(header('Actors'));
  console.log(dim('─'.repeat(60)));
  console.log();

  if (info.actors.length === 0) {
    console.log(dim('No actors defined'));
    console.log();
    console.log('Add actors with: ' + chalk.cyan('ubml add actors'));
  } else {
    // Group by type
    const byType = new Map<string, WorkspaceElement[]>();
    for (const actor of info.actors) {
      const list = byType.get(actor.type) || [];
      list.push(actor);
      byType.set(actor.type, list);
    }

    for (const [type, actors] of byType) {
      console.log(subheader(type.charAt(0).toUpperCase() + type.slice(1) + 's'));
      for (const actor of actors) {
        console.log(INDENT + `${highlight(actor.id)} ${actor.name}`);
      }
      console.log();
    }
  }
}

// =============================================================================
// Command Definition
// =============================================================================

/**
 * Create the show command.
 */
export function showCommand(): Command {
  const command = new Command('show');

  command
    .description('Visualize workspace contents')
    .argument('[view]', 'View type: summary (default), tree, processes, actors')
    .option('-d, --dir <directory>', 'Workspace directory', '.')
    .addHelpText('after', `
Examples:
  ${chalk.dim('# Show workspace summary')}
  ubml show

  ${chalk.dim('# Show workspace as tree')}
  ubml show tree

  ${chalk.dim('# List all processes')}
  ubml show processes

  ${chalk.dim('# List all actors')}
  ubml show actors

Views:
  summary     Overview of files and element counts (default)
  tree        Hierarchical view of all elements
  processes   List processes with step counts
  actors      List actors grouped by type
`)
    .action((view: string | undefined, options: { dir: string }) => {
      const viewType = view?.toLowerCase() || 'summary';
      const dir = resolve(options.dir);

      // Check if directory exists
      try {
        if (!statSync(dir).isDirectory()) {
          console.error(chalk.red(`Not a directory: ${dir}`));
          process.exit(1);
        }
      } catch {
        console.error(chalk.red(`Directory not found: ${dir}`));
        process.exit(1);
      }

      switch (viewType) {
        case 'summary':
        case 's':
          showSummary(dir);
          break;
        case 'tree':
        case 't':
          showTree(dir);
          break;
        case 'processes':
        case 'process':
        case 'p':
          showProcesses(dir);
          break;
        case 'actors':
        case 'actor':
        case 'a':
          showActors(dir);
          break;
        default:
          console.error(chalk.red(`Unknown view: ${view}`));
          console.error('Available views: summary, tree, processes, actors');
          process.exit(1);
      }
    });

  return command;
}
