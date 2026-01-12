/**
 * Stylish formatter for CLI output.
 */

import chalk from 'chalk';
import type { FormatterResult, ValidationMessage } from './common';
import { groupMessagesByFile, formatLocation, formatPath, SUCCESS_MESSAGES } from './common';
import { formatValidationError } from './validation-errors';
import type { RawAjvError, SchemaContext } from '../../validator.js';

export interface StylishOptions {
  quiet?: boolean;
  explain?: boolean;
}

/**
 * Format a single error with enhanced context.
 */
function formatError(
  error: ValidationMessage, 
  explain: boolean
): string[] {
  const location = formatLocation(error);
  const path = formatPath(error);
  const lines: string[] = [];
  
  // Try to use enhanced formatting if ajvError is available
  if (error.ajvError) {
    const enhanced = formatValidationError(
      error.ajvError as RawAjvError, 
      error.schemaContext as SchemaContext
    );
    
    if (explain) {
      // Detailed multi-line format for --explain
      lines.push(`  ${chalk.dim(location)}  ${chalk.red('error')}`);
      lines.push(`    ${chalk.bold(enhanced.message)}`);
      
      if (enhanced.suggestion) {
        lines.push(`    ${chalk.cyan('→')} ${enhanced.suggestion}`);
      }
      if (enhanced.hint) {
        lines.push(`    ${chalk.dim(enhanced.hint)}`);
      }
      if (enhanced.example) {
        // Handle multi-line examples with proper indentation
        const exampleLines = enhanced.example.split('\n');
        if (exampleLines.length === 1) {
          lines.push(`    ${chalk.dim('Example:')} ${chalk.green(enhanced.example)}`);
        } else {
          lines.push(`    ${chalk.dim('Example:')}`);
          for (const exLine of exampleLines) {
            lines.push(`      ${chalk.green(exLine)}`);
          }
        }
      }
      if (enhanced.validOptions && enhanced.validOptions.length > 0) {
        const optionsStr = enhanced.validOptions.slice(0, 8).join(', ');
        const more = enhanced.validOptions.length > 8 
          ? chalk.dim(` +${enhanced.validOptions.length - 8} more`)
          : '';
        lines.push(`    ${chalk.dim('Valid:')} ${optionsStr}${more}`);
      }
    } else {
      // Compact single-line format with key info
      let compactMsg = enhanced.message;
      if (enhanced.suggestion) {
        compactMsg += chalk.cyan(` (${enhanced.suggestion})`);
      }
      lines.push(`  ${chalk.dim(location)}  ${chalk.red('error')}  ${compactMsg}${chalk.dim(path)}`);
    }
  } else {
    // Fallback to original message
    lines.push(`  ${chalk.dim(location)}  ${chalk.red('error')}  ${error.message}${chalk.dim(path)}`);
  }
  
  return lines;
}

/**
 * Format validation results in a human-readable style.
 */
export function formatStylish(
  result: FormatterResult,
  options: StylishOptions = {}
): string {
  const { quiet = false, explain = false } = options;
  const lines: string[] = [];

  // Group messages by file using common utility
  const byFile = groupMessagesByFile(result, { includeWarnings: !quiet });

  // Output by file
  for (const [filepath, messages] of byFile) {
    lines.push('');
    lines.push(chalk.underline(filepath));
    
    for (const error of messages.errors) {
      lines.push(...formatError(error, explain));
    }
    
    for (const warning of messages.warnings) {
      const location = formatLocation(warning);
      const path = formatPath(warning);
      lines.push(`  ${chalk.dim(location)}  ${chalk.yellow('warning')}  ${warning.message}${chalk.dim(path)}`);
    }
  }

  // Summary
  lines.push('');
  const errorCount = result.errors.length;
  const warningCount = quiet ? 0 : result.warnings.length;
  const problemCount = errorCount + warningCount;

  if (problemCount === 0) {
    lines.push(chalk.green(SUCCESS_MESSAGES.allFilesValid(result.filesValidated)));
  } else {
    const parts: string[] = [];
    if (errorCount > 0) {
      parts.push(chalk.red(`${errorCount} error${errorCount === 1 ? '' : 's'}`));
    }
    if (warningCount > 0) {
      parts.push(chalk.yellow(`${warningCount} warning${warningCount === 1 ? '' : 's'}`));
    }
    lines.push(`${chalk.red('✗')} ${problemCount} problem${problemCount === 1 ? '' : 's'} (${parts.join(', ')})`);
  }

  return lines.join('\n');
}
