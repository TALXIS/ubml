/**
 * UBML CLI Module
 *
 * Command-line interface for UBML operations.
 * 
 * Available commands:
 * - init: Initialize a new UBML workspace
 * - add: Add new UBML documents to workspace
 * - validate: Validate UBML documents against schemas
 * - schema: Explore UBML schema and learn what you can model
 * - help: Interactive help system
 * - syntax: Quick syntax lookup for element types
 * - examples: Show examples for types or properties
 * - ids: Show ID pattern reference
 * - enums: Show all enum values
 *
 * @module ubml/cli
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { VERSION } from '../index';
import { validateCommand } from './commands/validate';
import { initCommand } from './commands/init';
import { schemaCommand } from './commands/schema';
import { addCommand } from './commands/add/index';
import { showCommand } from './commands/show';
import { helpCommand } from './commands/help';
import { syntaxCommand, idsCommand, enumsCommand, nextidCommand, syncidsCommand } from './commands/ref';

/**
 * Create and configure the CLI program.
 */
export function createProgram(): Command {
  const program = new Command();

  program
    .name('ubml')
    .description('UBML - Unified Business Modeling Language CLI\n\n' +
      'Capture how your business works in structured, validated YAML files.')
    .version(VERSION)
    .addHelpText('after', `
${chalk.bold('Getting Started:')}
  ${chalk.cyan('ubml init my-project')}     Create a new UBML workspace
  ${chalk.cyan('ubml schema')}              Explore what you can model
  ${chalk.cyan('ubml add process')}         Add a new process file
  ${chalk.cyan('ubml validate .')}          Validate all files

${chalk.bold('Learn More:')}
  ${chalk.cyan('ubml help quickstart')}     Quick start guide
  ${chalk.cyan('ubml schema --workflow')}   Recommended modeling workflow
  ${chalk.cyan('ubml help examples')}       See code examples

${chalk.dim('Documentation: https://ubml.talxis.com/docs')}
`);

  // Add commands in logical order
  program.addCommand(initCommand());      // 1. Start here
  program.addCommand(schemaCommand());    // 2. Learn the schema
  program.addCommand(addCommand());       // 3. Add content
  program.addCommand(validateCommand());  // 4. Validate
  program.addCommand(showCommand());      // 5. Visualize workspace
  program.addCommand(helpCommand());      // Unified help
  
  // Quick reference commands
  program.addCommand(syntaxCommand());    // Quick syntax lookup
  program.addCommand(idsCommand());       // ID patterns
  program.addCommand(enumsCommand());     // Enum values
  program.addCommand(nextidCommand());    // Next available ID
  program.addCommand(syncidsCommand());   // Sync ID stats from files

  return program;
}

/**
 * Run the CLI with the given arguments.
 */
export async function run(args: string[]): Promise<void> {
  const program = createProgram();
  await program.parseAsync(['node', 'ubml', ...args]);
}
