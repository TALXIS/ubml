/**
 * Validation error and warning types with formatting utilities.
 */

import type { ParseError, ParseWarning } from '../parser/yaml-parser.js';

/**
 * Severity levels for validation messages.
 */
export type Severity = 'error' | 'warning' | 'info';

/**
 * A validation error.
 */
export interface ValidationError {
  /** Error message */
  message: string;
  /** File path where error occurred */
  filepath: string;
  /** Line number (1-indexed) */
  line?: number;
  /** Column number (1-indexed) */
  column?: number;
  /** JSON path to the error location */
  path?: string;
  /** Error code for programmatic handling */
  code?: string;
  /** Severity level */
  severity: 'error';
}

/**
 * A validation warning.
 */
export interface ValidationWarning {
  /** Warning message */
  message: string;
  /** File path where warning occurred */
  filepath: string;
  /** Line number (1-indexed) */
  line?: number;
  /** Column number (1-indexed) */
  column?: number;
  /** JSON path to the warning location */
  path?: string;
  /** Warning code for programmatic handling */
  code?: string;
  /** Severity level */
  severity: 'warning';
}

/**
 * Union type for any validation message.
 */
export type ValidationMessage = ValidationError | ValidationWarning;

/**
 * Format a single error for display.
 */
export function formatError(error: ValidationMessage): string {
  const location = error.line
    ? `:${error.line}${error.column ? `:${error.column}` : ''}`
    : '';
  const severity = error.severity === 'error' ? 'error' : 'warning';
  const code = error.code ? ` [${error.code}]` : '';
  const path = error.path ? ` at ${error.path}` : '';
  
  return `${error.filepath}${location}: ${severity}${code}: ${error.message}${path}`;
}

/**
 * Format multiple errors for display.
 */
export function formatErrors(errors: ValidationMessage[]): string {
  return errors.map(formatError).join('\n');
}

/**
 * Create a validation error.
 */
export function createError(
  message: string,
  filepath: string,
  options?: Partial<Omit<ValidationError, 'message' | 'filepath' | 'severity'>>
): ValidationError {
  return {
    message,
    filepath,
    severity: 'error',
    ...options,
  };
}

/**
 * Create a validation warning.
 */
export function createWarning(
  message: string,
  filepath: string,
  options?: Partial<Omit<ValidationWarning, 'message' | 'filepath' | 'severity'>>
): ValidationWarning {
  return {
    message,
    filepath,
    severity: 'warning',
    ...options,
  };
}

/**
 * Convert parse errors to validation errors.
 */
export function convertParseErrors(parseErrors: ParseError[]): ValidationError[] {
  return parseErrors.map((e) =>
    createError(e.message, e.filepath, { line: e.line, column: e.column })
  );
}

/**
 * Convert parse warnings to validation warnings.
 */
export function convertParseWarnings(parseWarnings: ParseWarning[]): ValidationWarning[] {
  return parseWarnings.map((w) =>
    createWarning(w.message, w.filepath, { line: w.line, column: w.column })
  );
}
