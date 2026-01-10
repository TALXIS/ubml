/**
 * Text formatting helpers for CLI commands.
 * Provides consistent chalk-based styling across all commands.
 * 
 * @module ubml/cli/formatters/text
 */

import chalk from 'chalk';

/** Standard indentation for nested content */
export const INDENT = '  ';

/** Format text as a section header (bold cyan) */
export function header(text: string): string {
  return chalk.bold.cyan(text);
}

/** Format text as a subsection header (bold white) */
export function subheader(text: string): string {
  return chalk.bold.white(text);
}

/** Format text as dimmed/muted (gray) */
export function dim(text: string): string {
  return chalk.dim(text);
}

/** Format text as highlighted/emphasized (yellow) */
export function highlight(text: string): string {
  return chalk.yellow(text);
}

/** Format text as code/literal (cyan) */
export function code(text: string): string {
  return chalk.cyan(text);
}

/** Format text as success indicator (green) */
export function success(text: string): string {
  return chalk.green(text);
}

/** Format text as error indicator (red) */
export function error(text: string): string {
  return chalk.red(text);
}

/** Format text as warning indicator (yellow) */
export function warning(text: string): string {
  return chalk.yellow(text);
}
