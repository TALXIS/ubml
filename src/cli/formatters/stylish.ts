/**
 * Stylish formatter for CLI output.
 */

import type { ValidationResult } from '../../validator/index.js';
import { SUCCESS_MESSAGES } from '../../validator/messages.js';
import { groupMessagesByFile, formatLocation, formatPath } from './common.js';

export interface StylishOptions {
  quiet?: boolean;
  colors?: boolean;
}

/**
 * Format validation results in a human-readable style.
 */
export function formatStylish(
  result: ValidationResult,
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
      lines.push(`  ${location}  error  ${error.message}${path}`);
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
    lines.push(SUCCESS_MESSAGES.FILES_VALIDATED(result.filesValidated));
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
