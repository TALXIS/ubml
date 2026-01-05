/**
 * JSON formatter for CLI output.
 */

import type { FormatterResult, ValidationMessage } from './common.js';

/**
 * Format validation results as JSON.
 */
export function formatJson(result: FormatterResult): string {
  const output = {
    valid: result.valid,
    filesValidated: result.filesValidated,
    errorCount: result.errors.length,
    warningCount: result.warnings.length,
    errors: result.errors.map((e: ValidationMessage) => ({
      message: e.message,
      filepath: e.filepath,
      line: e.line,
      column: e.column,
      path: e.path,
      code: e.code,
    })),
    warnings: result.warnings.map((w: ValidationMessage) => ({
      message: w.message,
      filepath: w.filepath,
      line: w.line,
      column: w.column,
      path: w.path,
      code: w.code,
    })),
  };

  return JSON.stringify(output, null, 2);
}
