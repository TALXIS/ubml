/**
 * Meta-validation for UBML schema files themselves.
 * 
 * This validates that schema files are correctly structured and
 * follow JSON Schema specifications.
 */

import { readFileSync } from 'fs';
import { relative } from 'path';
import { parse } from 'yaml';
import { glob } from 'glob';
import { getSchemasDirectory } from '../schemas/loader.js';
import { ValidationError, ValidationWarning, createError, createWarning } from './errors.js';

/**
 * Result of schema file validation.
 */
export interface SchemaValidationResult {
  /** Whether all schemas are valid */
  valid: boolean;
  /** Validation errors */
  errors: ValidationError[];
  /** Validation warnings */
  warnings: ValidationWarning[];
  /** Number of schema files validated */
  filesValidated: number;
  /** Details for each schema file */
  details: SchemaFileResult[];
}

/**
 * Result for a single schema file.
 */
export interface SchemaFileResult {
  /** Relative path to schema file */
  filepath: string;
  /** Whether this schema is valid */
  valid: boolean;
  /** Parse error if YAML parsing failed */
  parseError?: string;
  /** Metadata warnings (missing $id, title, etc.) */
  metadataWarnings: string[];
  /** Schema compilation error if Ajv couldn't compile it */
  compilationError?: string;
}

/**
 * Check metadata fields in a schema.
 */
function checkMetadata(schema: unknown): string[] {
  const warnings: string[] = [];

  if (!schema || typeof schema !== 'object') {
    return warnings;
  }

  const schemaObj = schema as Record<string, unknown>;

  if (!schemaObj.$schema) {
    warnings.push('Missing $schema declaration');
  }
  if (!schemaObj.$id) {
    warnings.push('Missing $id declaration');
  }
  if (!schemaObj.title) {
    warnings.push('Missing title');
  }
  if (!schemaObj.description) {
    warnings.push('Missing description');
  }

  return warnings;
}

/**
 * Parse and validate all schema files in the schemas directory.
 */
export async function validateSchemas(
  schemasDir?: string
): Promise<SchemaValidationResult> {
  const actualSchemasDir = schemasDir ?? getSchemasDirectory();
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  const details: SchemaFileResult[] = [];

  // Find all schema YAML files
  const schemaFiles = await glob('**/*.yaml', {
    cwd: actualSchemasDir,
    absolute: true,
  });

  if (schemaFiles.length === 0) {
    warnings.push(createWarning('No schema files found', actualSchemasDir));
    return {
      valid: true,
      errors,
      warnings,
      filesValidated: 0,
      details,
    };
  }

  // Parse all schemas first
  const parsedSchemas = new Map<string, { schema: unknown; warnings: string[] }>();
  const parseErrors = new Map<string, string>();

  for (const filePath of schemaFiles) {
    const relativePath = relative(actualSchemasDir, filePath);
    const content = readFileSync(filePath, 'utf8');

    try {
      const schema = parse(content);
      const metadataWarnings = checkMetadata(schema);
      parsedSchemas.set(filePath, { schema, warnings: metadataWarnings });

      // Add metadata warnings
      for (const warning of metadataWarnings) {
        warnings.push(createWarning(warning, filePath));
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      parseErrors.set(filePath, message);
      errors.push(createError(`Invalid YAML: ${message}`, filePath));
    }
  }

  // Create Ajv instance and try to compile all schemas
  const [{ default: Ajv2020 }, { default: addFormats }] = await Promise.all([
    import('ajv/dist/2020.js') as Promise<{ default: any }>,
    import('ajv-formats') as Promise<{ default: any }>,
  ]);
  
  const ajv = new Ajv2020({
    strict: false,
    allErrors: true,
  });
  addFormats(ajv);

  const compilationErrors = new Map<string, string>();

  // Try to add all schemas to Ajv
  for (const [filePath, { schema }] of parsedSchemas) {
    if (!schema || typeof schema !== 'object') {
      continue;
    }

    try {
      ajv.addSchema(schema as Record<string, unknown>);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      compilationErrors.set(filePath, message);
      errors.push(createError(`Invalid JSON Schema: ${message}`, filePath));
    }
  }

  // Build details for each file
  for (const filePath of schemaFiles) {
    const relativePath = relative(actualSchemasDir, filePath);
    const parseError = parseErrors.get(filePath);
    const compilationError = compilationErrors.get(filePath);
    const parsed = parsedSchemas.get(filePath);

    details.push({
      filepath: relativePath,
      valid: !parseError && !compilationError,
      parseError,
      metadataWarnings: parsed?.warnings ?? [],
      compilationError,
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    filesValidated: schemaFiles.length,
    details,
  };
}
