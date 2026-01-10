/**
 * Quick reference commands for UBML CLI.
 *
 * Provides fast syntax lookups for terminal users.
 *
 * @module ubml/cli/commands/ref
 */

import { Command } from 'commander';
import chalk from 'chalk';
import {
  getAllElementTypes,
  getElementTypeInfo,
  type ElementTypeInfo,
} from '../schema-introspection';
import { 
  ID_PREFIXES, 
  ID_CONFIG, 
  formatId,
  parseIdNumber,
  type IdPrefix,
} from '../../generated/metadata';
import { scanWorkspaceIds, getNextAvailableId, readIdStats, syncIdStats } from '../../node/id-scanner';
import { INDENT, header, subheader, dim, highlight, code } from '../formatters/text';

// =============================================================================
// Syntax Command
// =============================================================================

function showSyntax(elementType: string): void {
  const info = getElementTypeInfo(elementType);
  if (!info) {
    console.error(chalk.red(`Unknown element type: ${elementType}`));
    console.log();
    console.log('Available: step, actor, entity, process, hypothesis, scenario');
    process.exit(1);
  }
  
  console.log();
  console.log(header(`${info.type.charAt(0).toUpperCase() + info.type.slice(1)} Syntax`));
  console.log(dim('────────────────────────────────────────────────────────────'));
  console.log();
  
  for (const prop of info.properties) {
    const req = prop.required ? ' (required)' : '';
    const typeInfo = prop.enumValues 
      ? prop.enumValues.join(' | ')
      : prop.type;
    
    console.log(`  ${highlight(prop.name)}: ${typeInfo}${req}`);
    
    if (prop.examples && prop.examples.length > 0) {
      const ex = prop.examples[0];
      const exStr = typeof ex === 'string' ? `"${ex}"` : JSON.stringify(ex);
      console.log(`    ${dim('Example:')} ${exStr}`);
    }
  }
  
  console.log();
}

// =============================================================================
// Examples Command
// =============================================================================

function showExamples(typeOrProperty: string): void {
  // Parse: could be "duration" or "step.kind"
  const parts = typeOrProperty.split('.');
  const elementType = parts[0];
  const propName = parts[1];
  
  const info = getElementTypeInfo(elementType);
  if (!info) {
    console.error(chalk.red(`Unknown type: ${elementType}`));
    process.exit(1);
  }
  
  console.log();
  
  if (propName) {
    // Show examples for specific property
    const prop = info.properties.find(p => p.name === propName);
    if (!prop || !prop.examples) {
      console.log(`No examples found for ${typeOrProperty}`);
      return;
    }
    
    console.log(header(`${elementType}.${propName} Examples`));
    console.log(dim('────────────────────────────────────────────────────────────'));
    console.log();
    prop.examples.forEach(ex => {
      const str = typeof ex === 'string' ? `"${ex}"` : JSON.stringify(ex, null, 2);
      console.log(`  ${str}`);
    });
  } else {
    // Show all examples for element type
    console.log(header(`${info.type.charAt(0).toUpperCase() + info.type.slice(1)} Examples`));
    console.log(dim('────────────────────────────────────────────────────────────'));
    console.log();
    
    for (const prop of info.properties) {
      if (prop.examples && prop.examples.length > 0) {
        console.log(`  ${highlight(prop.name)}:`);
        prop.examples.slice(0, 2).forEach(ex => {
          const str = typeof ex === 'string' ? `"${ex}"` : JSON.stringify(ex);
          console.log(`    ${str}`);
        });
        console.log();
      }
    }
  }
  
  console.log();
}

// =============================================================================
// IDs Command
// =============================================================================

function showIdPatterns(): void {
  console.log();
  console.log(header('UBML ID Patterns'));
  console.log(dim('────────────────────────────────────────────────────────────'));
  console.log();
  console.log(`Format: PREFIX + ${ID_CONFIG.digitLength}+ digits (e.g., AC00001, ST00010, EN01000)`);
  console.log();
  
  const prefixDescriptions: Record<string, string> = {
    AC: 'Actors (people, teams, systems)',
    ST: 'Steps in processes',
    PR: 'Processes',
    EN: 'Entities (data objects)',
    HY: 'Hypotheses',
    SC: 'Scenarios',
    MT: 'Metrics',
    KP: 'KPIs',
    CP: 'Capabilities',
    VS: 'Value Streams',
    SV: 'Services',
    PD: 'Products',
    PF: 'Portfolios',
    VW: 'Views',
    EQ: 'Equipment',
    LC: 'Locations',
    SK: 'Skills',
    RP: 'Resource Pools',
    PS: 'Personas',
    BK: 'Blocks',
    PH: 'Phases',
    DC: 'Documents',
    EV: 'Evidence',
  };
  
  // ID_PREFIXES is an object, get keys
  const prefixes = Object.keys(ID_PREFIXES) as IdPrefix[];
  
  for (const prefix of prefixes) {
    const description = prefixDescriptions[prefix] || prefix;
    const exampleId = formatId(prefix, 1);
    console.log(`  ${highlight(prefix + '#'.repeat(ID_CONFIG.digitLength))}  - ${description}  ${dim(`(${exampleId})`)}`);
  }
  
  console.log();
  console.log(dim(`ID Ranges:`));
  console.log(dim(`  • 'ubml init' templates start at: ${formatId('XX' as IdPrefix, ID_CONFIG.initOffset).replace('XX', '<PREFIX>')}`));
  console.log(dim(`  • 'ubml add' templates start at:  ${formatId('XX' as IdPrefix, ID_CONFIG.addOffset).replace('XX', '<PREFIX>')}`));
  console.log();
  console.log(dim('Best Practice: Use gaps of 10 for easy insertion'));
  console.log(dim('  ✓ AC00010, AC00020, AC00030'));
  console.log(dim('  ✗ AC00001, AC00002, AC00003'));
  console.log();
  console.log(dim(`Use ${chalk.cyan('ubml nextid <prefix>')} to get the next available ID`));
  console.log();
}

// =============================================================================
// Enums Command
// =============================================================================

function showAllEnums(): void {
  const elements = getAllElementTypes();
  
  console.log();
  console.log(header('UBML Enum Values'));
  console.log(dim('────────────────────────────────────────────────────────────'));
  console.log();
  
  for (const elem of elements) {
    const info = getElementTypeInfo(elem.type);
    if (!info) continue;
    
    const enumProps = info.properties.filter(p => p.enumValues);
    if (enumProps.length === 0) continue;
    
    console.log(subheader(info.type.charAt(0).toUpperCase() + info.type.slice(1)));
    for (const prop of enumProps) {
      console.log(`  ${highlight(prop.name)}:`);
      console.log(`    ${prop.enumValues!.join(', ')}`);
    }
    console.log();
  }
}

// =============================================================================
// NextId Command
// =============================================================================

function showNextId(prefix: string, options: { dir?: string; scan?: boolean }): void {
  // Validate prefix
  const upperPrefix = prefix.toUpperCase();
  const validPrefixes = Object.keys(ID_PREFIXES);
  
  if (!validPrefixes.includes(upperPrefix)) {
    console.error(chalk.red(`Invalid ID prefix: ${prefix}`));
    console.log();
    console.log('Valid prefixes: ' + validPrefixes.join(', '));
    process.exit(1);
  }
  
  const idPrefix = upperPrefix as IdPrefix;
  const elementType = ID_PREFIXES[idPrefix];
  const dir = options.dir || process.cwd();
  const shouldScan = options.scan !== false; // Default to true
  
  console.log();
  console.log(header('Next Available ID'));
  console.log(dim('────────────────────────────────────────────────────────────'));
  console.log();
  
  if (shouldScan) {
    // Scan workspace for existing IDs
    const scan = scanWorkspaceIds(dir);
    const existingIds = scan.idsByPrefix.get(idPrefix) ?? new Set();
    
    if (scan.filesScanned === 0) {
      console.log(dim(`  (No UBML files found in workspace)`));
      console.log();
    } else {
      console.log(`  Workspace: ${dim(dir)}`);
      console.log(`  Files scanned: ${scan.filesScanned}`);
      if (existingIds.size > 0) {
        console.log(`  Existing ${idPrefix}### IDs: ${existingIds.size}`);
        
        // Show highest existing ID
        let maxNum = 0;
        for (const id of existingIds) {
          const num = parseIdNumber(id);
          if (num !== undefined && num > maxNum) {
            maxNum = num;
          }
        }
        if (maxNum > 0) {
          console.log(`  Highest: ${formatId(idPrefix, maxNum)}`);
        }
      } else {
        console.log(`  Existing ${idPrefix}### IDs: ${dim('none')}`);
      }
      console.log();
    }
    
    // Get next available ID using stats or scanning
    const result = getNextAvailableId(idPrefix, dir, { useGaps: true, updateStats: true });
    
    console.log(`  Prefix:  ${highlight(idPrefix)} (${elementType})`);
    console.log(`  Next ID: ${code(result.id)}`);
    if (result.usedStats) {
      console.log(`  Source:  ${dim('workspace idStats (fast)')}`);
    } else {
      console.log(`  Source:  ${dim('file scan (no idStats found)')}`);
    }
    console.log();
    
    // Show sequence with gaps
    const nextNum = parseIdNumber(result.id) ?? ID_CONFIG.addOffset;
    console.log(dim(`  Suggested sequence (gaps of 10):`));
    console.log(dim(`    ${formatId(idPrefix, nextNum)}, ${formatId(idPrefix, nextNum + 10)}, ${formatId(idPrefix, nextNum + 20)}, ...`));
  } else {
    // No scanning, just show calculated ID
    const nextId = formatId(idPrefix, ID_CONFIG.addOffset);
    
    console.log(`  Prefix:  ${highlight(idPrefix)} (${elementType})`);
    console.log(`  Next ID: ${code(nextId)} ${dim('(from addOffset)')}`);
    console.log();
    console.log(dim(`  Tip: Use --scan (default) to check existing IDs in workspace`));
  }
  
  console.log();
}

// =============================================================================
// Command Definitions
// =============================================================================

/**
 * Create the syntax command.
 */
export function syntaxCommand(): Command {
  const command = new Command('syntax');
  
  command
    .description('Show compact syntax reference for an element type')
    .argument('<element>', 'Element type (e.g., step, actor, entity)')
    .action(showSyntax);
  
  return command;
}

/**
 * Create the examples command.
 */
export function examplesCommand(): Command {
  const command = new Command('examples');
  
  command
    .description('Show examples for a type or property')
    .argument('<type>', 'Type or property (e.g., duration, step.kind)')
    .action(showExamples);
  
  return command;
}

/**
 * Create the ids command.
 */
export function idsCommand(): Command {
  const command = new Command('ids');
  
  command
    .description('Show ID pattern reference')
    .action(showIdPatterns);
  
  return command;
}

/**
 * Create the enums command.
 */
export function enumsCommand(): Command {
  const command = new Command('enums');
  
  command
    .description('Show all enum values')
    .action(showAllEnums);
  
  return command;
}

/**
 * Create the nextid command.
 */
export function nextidCommand(): Command {
  const command = new Command('nextid');
  
  command
    .description('Get the next available ID for a given prefix (scans workspace)')
    .argument('<prefix>', `ID prefix (${Object.keys(ID_PREFIXES).join(', ')})`)
    .option('-d, --dir <directory>', 'Workspace directory to scan', '.')
    .option('--no-scan', 'Skip workspace scanning, use default offset')
    .action(showNextId);
  
  return command;
}

/**
 * Sync ID stats from file contents to workspace document.
 */
function doSyncIds(options: { dir: string }): void {
  const dir = options.dir;
  
  console.log();
  console.log(header('Syncing ID Stats'));
  console.log(dim('────────────────────────────────────────────────────────────'));
  console.log();
  
  // Check for workspace file
  const existingStats = readIdStats(dir);
  
  // Sync from files
  const newStats = syncIdStats(dir);
  
  if (!newStats) {
    console.error(chalk.red('No workspace file found in: ' + dir));
    console.log();
    console.log('A workspace.ubml.yaml file is required to store idStats.');
    process.exit(1);
  }
  
  if (Object.keys(newStats).length === 0) {
    console.log('No IDs found in workspace files.');
    console.log();
    return;
  }
  
  console.log('Updated idStats in workspace document:');
  console.log();
  
  for (const [prefix, maxNum] of Object.entries(newStats).sort()) {
    const oldNum = existingStats?.[prefix as keyof typeof ID_PREFIXES] ?? 0;
    const changed = oldNum !== maxNum;
    const indicator = changed ? chalk.green('→') : ' ';
    console.log(`  ${prefix}: ${oldNum} ${indicator} ${highlight(String(maxNum))}`);
  }
  
  console.log();
  console.log(chalk.green('✓ idStats synced from file contents'));
  console.log();
}

/**
 * Create the syncids command.
 */
export function syncidsCommand(): Command {
  const command = new Command('syncids');
  
  command
    .description('Sync idStats in workspace document from actual file contents')
    .option('-d, --dir <directory>', 'Workspace directory to scan', '.')
    .action(doSyncIds);
  
  return command;
}
