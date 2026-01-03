/**
 * UBML CLI Module
 *
 * Command-line interface for UBML operations.
 *
 * @module ubml/cli
 */

import { Command } from 'commander';
import { VERSION } from '../constants.js';
import { validateCommand } from './commands/validate.js';
import { initCommand } from './commands/init.js';

/**
 * Create and configure the CLI program.
 */
export function createProgram(): Command {
  const program = new Command();

  program
    .name('ubml')
    .description('UBML - Unified Business Modeling Language CLI')
    .version(VERSION);

  // Add commands
  program.addCommand(validateCommand());
  program.addCommand(initCommand());

  return program;
}

/**
 * Run the CLI with the given arguments.
 */
export async function run(args: string[]): Promise<void> {
  const program = createProgram();
  await program.parseAsync(['node', 'ubml', ...args]);
}
