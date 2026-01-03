/**
 * Validation error and warning message templates.
 * 
 * Centralizes all user-facing validation messages for consistency
 * and potential future internationalization.
 */

/**
 * File and parsing error messages.
 */
export const FILE_MESSAGES = {
  FILE_NOT_FOUND: (filepath: string) => `Failed to read file: ${filepath}`,
  INVALID_YAML: 'Invalid YAML syntax',
  COULD_NOT_DETECT_TYPE: 'Could not detect document type from filename. Expected pattern: *.{type}.ubml.yaml',
  NO_UBML_FILES: 'No UBML files found in workspace',
  SCHEMA_NOT_FOUND: (schemaPath: string) => `Schema not found: ${schemaPath}`,
} as const;

/**
 * Schema validation error messages.
 */
export const SCHEMA_MESSAGES = {
  VALIDATION_FAILED: (reason: string) => `Schema validation failed: ${reason}`,
  UNKNOWN_VALIDATION_ERROR: 'Unknown validation error',
  COULD_NOT_DETERMINE_SCHEMA: 'Could not determine schema for file. Skipping schema validation.',
} as const;

/**
 * Reference validation error messages.
 */
export const REFERENCE_MESSAGES = {
  UNDEFINED_REFERENCE: (id: string, path: string) => 
    `Reference to undefined ID "${id}" at ${path}`,
  DUPLICATE_ID: (id: string, existingFile: string) => 
    `Duplicate ID "${id}" (also defined in ${existingFile})`,
  UNUSED_ID: (id: string) => 
    `ID "${id}" is defined but never referenced`,
} as const;

/**
 * CLI error messages.
 */
export const CLI_MESSAGES = {
  PATH_NOT_FOUND: (path: string) => `Error: Path not found: ${path}`,
  DIRECTORY_EXISTS: (dir: string) => `Error: Directory already exists: ${dir}`,
  FATAL_ERROR: (message: string) => `Fatal error: ${message}`,
} as const;

/**
 * Success messages.
 */
export const SUCCESS_MESSAGES = {
  FILES_VALIDATED: (count: number) => 
    `✓ ${count} file${count === 1 ? '' : 's'} validated successfully`,
  WORKSPACE_CREATED: '✓ Workspace initialized successfully!',
  CREATED_FILE: (filepath: string) => `Created: ${filepath}`,
  CREATED_DIR: (dirpath: string) => `Created workspace directory: ${dirpath}`,
} as const;

/**
 * Error code constants for programmatic handling.
 */
export const ERROR_CODES = {
  PARSE_ERROR: 'ubml/parse-error',
  VALIDATION_ERROR: 'ubml/validation-error',
  VALIDATION_WARNING: 'ubml/validation-warning',
  UNDEFINED_REFERENCE: 'ubml/undefined-reference',
  DUPLICATE_ID: 'ubml/duplicate-id',
  UNUSED_ID: 'ubml/unused-id',
} as const;
