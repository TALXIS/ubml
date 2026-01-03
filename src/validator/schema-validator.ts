/**
 * JSON Schema validation for UBML documents.
 */

import { readFileSync } from 'fs';
import { join, resolve } from 'path';
import { parse } from 'yaml';
import { glob } from 'glob';
import { parseDocument } from '../parser/yaml-parser.js';
import { 
  getSchemasDirectory, 
  getSchemaPathForFileSuffix,
  getUBMLFilePatterns,
} from '../schemas/loader.js';
import { 
  ValidationError, 
  ValidationWarning, 
  createError, 
  createWarning,
  convertParseErrors,
  convertParseWarnings,
} from './errors.js';
import { SCHEMA_MESSAGES, FILE_MESSAGES } from './messages.js';

/**
 * Result of validating a document or workspace.
 */
export interface ValidationResult {
  /** Whether validation passed (no errors) */
  valid: boolean;
  /** Validation errors */
  errors: ValidationError[];
  /** Validation warnings */
  warnings: ValidationWarning[];
  /** Number of files validated */
  filesValidated: number;
}

/**
 * Options for the validator.
 */
export interface ValidatorOptions {
  /** Path to schemas directory (defaults to bundled schemas) */
  schemasDir?: string;
  /** Whether to validate cross-document references */
  validateReferences?: boolean;
  /** Whether to treat warnings as errors */
  strict?: boolean;
}

/** Internal Ajv error shape */
interface AjvError {
  message?: string;
  instancePath?: string;
  keyword?: string;
}

/** Internal validate function shape */
interface ValidateFn {
  (data: unknown): boolean;
  errors?: AjvError[] | null;
}

/** Internal validator state */
interface InternalValidator {
  compile(schema: unknown): ValidateFn;
  getSchema(id: string): ValidateFn | undefined;
  schemasDir: string;
}

/**
 * Load all schema files from a directory.
 */
function loadSchemas(schemasDir: string): Map<string, unknown> {
  const schemas = new Map<string, unknown>();
  const schemaFiles = glob.sync('**/*.yaml', { cwd: schemasDir });

  for (const file of schemaFiles) {
    const fullPath = join(schemasDir, file);
    const content = readFileSync(fullPath, 'utf8');
    const schema = parse(content);
    if (schema.$id) {
      schemas.set(schema.$id, schema);
    }
  }

  return schemas;
}

/**
 * Create a configured validator instance (internal).
 */
async function createValidatorAsync(options: ValidatorOptions = {}): Promise<InternalValidator> {
  const schemasDir = options.schemasDir ?? getSchemasDirectory();
  const schemas = loadSchemas(schemasDir);

  // Dynamic import to avoid TypeScript DTS issues with Ajv ESM interop
  const [{ default: Ajv2020 }, { default: addFormats }] = await Promise.all([
    import('ajv/dist/2020.js') as Promise<{ default: any }>,
    import('ajv-formats') as Promise<{ default: any }>,
  ]);

  const ajv = new Ajv2020({
    allErrors: true,
    strict: false,
    loadSchema: async (uri: string) => {
      const schema = schemas.get(uri);
      if (schema) return schema as Record<string, unknown>;
      throw new Error(`Schema not found: ${uri}`);
    },
  });
  
  addFormats(ajv);

  // Add all schemas to Ajv
  for (const [id, schema] of schemas) {
    try {
      ajv.addSchema(schema as Record<string, unknown>);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      if (!errMsg.includes('already exists')) {
        console.warn(`Warning: Could not add schema ${id}: ${errMsg}`);
      }
    }
  }

  return { 
    compile: (schema: unknown) => ajv.compile(schema as Record<string, unknown>),
    getSchema: (id: string) => ajv.getSchema(id),
    schemasDir 
  };
}

/**
 * Convert Ajv errors to ValidationErrors.
 */
function convertAjvErrors(
  ajvErrors: AjvError[] | null | undefined,
  filepath: string
): ValidationError[] {
  if (!ajvErrors) return [];

  return ajvErrors.map((err) => ({
    message: err.message ?? 'Unknown validation error',
    filepath,
    path: err.instancePath || undefined,
    code: err.keyword,
    severity: 'error' as const,
  }));
}

/**
 * Validate a single UBML document.
 */
export async function validateDocument(
  filepath: string,
  options: ValidatorOptions = {}
): Promise<ValidationResult> {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Parse the document
  const parseResult = await parseDocument(filepath);
  errors.push(...convertParseErrors(parseResult.errors));
  warnings.push(...convertParseWarnings(parseResult.warnings));

  if (!parseResult.document) {
    return { valid: false, errors, warnings, filesValidated: 1 };
  }

  // Determine which schema to use
  const schemaPath = getSchemaPathForFileSuffix(filepath);
  if (!schemaPath) {
    warnings.push(
      createWarning(SCHEMA_MESSAGES.COULD_NOT_DETERMINE_SCHEMA, filepath)
    );
    return { valid: errors.length === 0, errors, warnings, filesValidated: 1 };
  }

  // Create validator and validate
  const validator = await createValidatorAsync(options);
  const fullSchemaPath = join(validator.schemasDir, schemaPath);
  const schemaContent = readFileSync(fullSchemaPath, 'utf8');
  const schema = parse(schemaContent);

  try {
    const schemaId = (schema as { $id?: string }).$id;
    const validate = schemaId && validator.getSchema(schemaId) 
      ? validator.getSchema(schemaId)!
      : validator.compile(schema);
    
    const valid = validate(parseResult.document.content);

    if (!valid) {
      errors.push(...convertAjvErrors(validate.errors, filepath));
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    errors.push(createError(SCHEMA_MESSAGES.VALIDATION_FAILED(message), filepath));
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    filesValidated: 1,
  };
}

/**
 * Validate all UBML documents in a workspace directory.
 */
export async function validateWorkspace(
  workspaceDir: string,
  options: ValidatorOptions = {}
): Promise<ValidationResult> {
  const absoluteDir = resolve(workspaceDir);
  const allErrors: ValidationError[] = [];
  const allWarnings: ValidationWarning[] = [];

  // Find all UBML files using centralized patterns
  const patterns = getUBMLFilePatterns();
  const files: string[] = [];
  for (const pattern of patterns) {
    const matches = await glob(pattern, { cwd: absoluteDir, absolute: true });
    files.push(...matches);
  }

  if (files.length === 0) {
    allWarnings.push(
      createWarning(FILE_MESSAGES.NO_UBML_FILES, absoluteDir)
    );
    return { valid: true, errors: allErrors, warnings: allWarnings, filesValidated: 0 };
  }

  // Create a single validator instance for all files
  const validator = await createValidatorAsync(options);

  // Validate each file
  for (const filepath of files) {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Parse the document
    const parseResult = await parseDocument(filepath);
    errors.push(...convertParseErrors(parseResult.errors));
    warnings.push(...convertParseWarnings(parseResult.warnings));

    if (parseResult.document) {
      const schemaPath = getSchemaPathForFileSuffix(filepath);
      if (schemaPath) {
        const fullSchemaPath = join(validator.schemasDir, schemaPath);
        const schemaContent = readFileSync(fullSchemaPath, 'utf8');
        const schema = parse(schemaContent);

        try {
          const schemaId = (schema as { $id?: string }).$id;
          const validate = schemaId && validator.getSchema(schemaId) 
            ? validator.getSchema(schemaId)!
            : validator.compile(schema);
          
          const valid = validate(parseResult.document.content);

          if (!valid) {
            errors.push(...convertAjvErrors(validate.errors, filepath));
          }
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          errors.push(createError(SCHEMA_MESSAGES.VALIDATION_FAILED(message), filepath));
        }
      } else {
        warnings.push(
          createWarning(SCHEMA_MESSAGES.COULD_NOT_DETERMINE_SCHEMA, filepath)
        );
      }
    }

    allErrors.push(...errors);
    allWarnings.push(...warnings);
  }

  return {
    valid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
    filesValidated: files.length,
  };
}
