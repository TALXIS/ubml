/**
 * Common utilities for CLI formatters.
 */

import type { ValidationResult, ValidationError, ValidationWarning } from '../../validator/index.js';

/**
 * Union type for validation messages.
 */
export type ValidationMessage = ValidationError | ValidationWarning;

/**
 * Iterate over all validation messages (errors first, then warnings).
 */
export function* iterateMessages(result: ValidationResult): Generator<ValidationMessage> {
  for (const error of result.errors) {
    yield error;
  }
  for (const warning of result.warnings) {
    yield warning;
  }
}

/**
 * Group messages by filepath for formatted output.
 */
export function groupMessagesByFile(
  result: ValidationResult,
  options: { includeWarnings?: boolean } = {}
): Map<string, { errors: ValidationMessage[]; warnings: ValidationMessage[] }> {
  const { includeWarnings = true } = options;
  const byFile = new Map<string, { errors: ValidationMessage[]; warnings: ValidationMessage[] }>();

  for (const error of result.errors) {
    const existing = byFile.get(error.filepath) ?? { errors: [], warnings: [] };
    existing.errors.push(error);
    byFile.set(error.filepath, existing);
  }

  if (includeWarnings) {
    for (const warning of result.warnings) {
      const existing = byFile.get(warning.filepath) ?? { errors: [], warnings: [] };
      existing.warnings.push(warning);
      byFile.set(warning.filepath, existing);
    }
  }

  return byFile;
}

/**
 * Format a message location string.
 */
export function formatLocation(message: ValidationMessage): string {
  if (!message.line) return '';
  const column = message.column ?? 1;
  return `:${message.line}:${column}`;
}

/**
 * Format a message path annotation.
 */
export function formatPath(message: ValidationMessage): string {
  return message.path ? ` (${message.path})` : '';
}
