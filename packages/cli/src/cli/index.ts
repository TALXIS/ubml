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
 * - docs: Quick reference documentation
 *
 * @module ubml/cli
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { VERSION } from '@ubml/core';
import { validateCommand } from './commands/validate.js';
import { initCommand } from './commands/init.js';
import { schemaCommand } from './commands/schema.js';
import { addCommand } from './commands/add.js';
import { docsCommand } from './commands/docs.js';

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
  ${chalk.cyan('ubml docs quickstart')}     Quick start guide
  ${chalk.cyan('ubml schema --workflow')}   Recommended modeling workflow
  ${chalk.cyan('ubml docs examples')}       See code examples

${chalk.dim('Documentation: https://ubml.io/docs')}
`);

  // Add commands in logical order
  program.addCommand(initCommand());      // 1. Start here
  program.addCommand(schemaCommand());    // 2. Learn the schema
  program.addCommand(addCommand());       // 3. Add content
  program.addCommand(validateCommand());  // 4. Validate
  program.addCommand(docsCommand());      // Reference docs

  return program;
}

/**
 * Run the CLI with the given arguments.
 */
export async function run(args: string[]): Promise<void> {
  const program = createProgram();
  await program.parseAsync(['node', 'ubml', ...args]);
}
