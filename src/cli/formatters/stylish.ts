/**
 * Stylish formatter for CLI output.
 */

import type { FormatterResult } from './common';
import { groupMessagesByFile, formatLocation, formatPath, SUCCESS_MESSAGES } from './common';
import { formatValidationError } from './validation-errors';

export interface StylishOptions {
  quiet?: boolean;
  explain?: boolean;
}

/**
 * Format validation results in a human-readable style.
 */
export function formatStylish(
  result: FormatterResult,
  options: StylishOptions = {}
): string {
  const { quiet = false } = options;
  const lines: string[] = [];

  // Group messages by file using common utility
  const byFile = groupMessagesByFile(result, { includeWarnings: !quiet });

  // Output by file
  for (const [filepath, messages] of byFile) {
    lines.push('');
    lines.push(filepath);
    
    for (const error of messages.errors) {
      const location = formatLocation(error);
      const path = formatPath(error);
      
      if (options.explain && error.ajvError) {
        // Use enhanced error formatter
        const enhancedMessage = formatValidationError(error.ajvError, error.schema);
        const formattedLines = enhancedMessage.split('\n');
        lines.push(`  ${location}  error`);
        for (const line of formattedLines) {
          lines.push(`    ${line}`);
        }
      } else {
        // Standard format
        lines.push(`  ${location}  error  ${error.message}${path}`);
      }
    }
    
    for (const warning of messages.warnings) {
      const location = formatLocation(warning);
      const path = formatPath(warning);
      lines.push(`  ${location}  warning  ${warning.message}${path}`);
    }
  }

  // Summary
  lines.push('');
  const errorCount = result.errors.length;
  const warningCount = quiet ? 0 : result.warnings.length;
  const problemCount = errorCount + warningCount;

  if (problemCount === 0) {
    lines.push(SUCCESS_MESSAGES.allFilesValid(result.filesValidated));
  } else {
    const parts: string[] = [];
    if (errorCount > 0) {
      parts.push(`${errorCount} error${errorCount === 1 ? '' : 's'}`);
    }
    if (warningCount > 0) {
      parts.push(`${warningCount} warning${warningCount === 1 ? '' : 's'}`);
    }
    lines.push(`✗ ${problemCount} problem${problemCount === 1 ? '' : 's'} (${parts.join(', ')})`);
  }

  return lines.join('\n');
}
