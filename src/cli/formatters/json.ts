/**
 * JSON formatter for CLI output.
 */

import type { ValidationResult, ValidationError, ValidationWarning } from '../../validator/index.js';

/**
 * Format validation results as JSON.
 */
export function formatJson(result: ValidationResult): string {
  const output = {
    valid: result.valid,
    filesValidated: result.filesValidated,
    errorCount: result.errors.length,
    warningCount: result.warnings.length,
    errors: result.errors.map((e: ValidationError) => ({
      message: e.message,
      filepath: e.filepath,
      line: e.line,
      column: e.column,
      path: e.path,
      code: e.code,
    })),
    warnings: result.warnings.map((w: ValidationWarning) => ({
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
