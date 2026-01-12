/**
 * UBML Validator (Browser-Safe)
 * 
 * Provides validation without any Node.js file system dependencies.
 * Uses bundled schemas that are embedded at build time.
 * Works in any JavaScript runtime (browser, Node.js, Deno, Bun).
 * 
 * @module ubml
 * 
 * @example
 * ```typescript
 * import { parse, createValidator } from 'ubml';
 * 
 * const validator = await createValidator();
 * const parseResult = parse(yamlContent, 'process.ubml.yaml');
 * 
 * if (parseResult.ok) {
 *   const result = validator.validate(parseResult.document.content, 'process');
 *   if (!result.valid) {
 *     console.error(result.errors);
 *   }
 * }
 * ```
 */

import { documentSchemas, getAllSchemasById } from './generated/bundled.js';
import { type DocumentType } from './metadata.js';
import { parse, type ParseResult, type UBMLDocument } from './parser.js';

/**
 * Raw Ajv error object for enhanced formatting.
 * Re-exported from Ajv for convenience.
 */
export interface RawAjvError {
  /** Error keyword (e.g., 'additionalProperties', 'enum', 'pattern') */
  keyword?: string;
  /** Instance path to the error location */
  instancePath?: string;
  /** Error message */
  message?: string;
  /** Error-specific parameters */
  params?: Record<string, unknown>;
  /** Schema path */
  schemaPath?: string;
  /** Actual data that failed validation */
  data?: unknown;
}

/**
 * Schema context for enhanced error messages.
 */
export interface SchemaContext {
  /** Property schema with allowed values, patterns, examples */
  propertySchema?: Record<string, unknown>;
  /** Parent object's valid property names */
  validProperties?: string[];
  /** Schema examples if available */
  examples?: unknown[];
}

/**
 * A validation error.
 */
export interface ValidationError {
  /** Error message */
  message: string;
  /** JSON path to the error location (e.g., "/processes/PR00001/steps/ST00001") */
  path?: string;
  /** Error code/keyword for programmatic handling */
  code?: string;
  /** File path (for cross-document errors) */
  filepath?: string;
  /** Line number (1-indexed) */
  line?: number;
  /** Column number (1-indexed) */
  column?: number;
  /** Raw Ajv error for enhanced formatting */
  ajvError?: RawAjvError;
  /** Schema context for suggestions */
  schemaContext?: SchemaContext;
}

/**
 * A validation warning.
 */
export interface ValidationWarning {
  /** Warning message */
  message: string;
  /** JSON path to the warning location */
  path?: string;
  /** Warning code for programmatic handling */
  code?: string;  /** File path (for cross-document warnings) */
  filepath?: string;  /** Line number (1-indexed) */
  line?: number;
  /** Column number (1-indexed) */
  column?: number;
}

/**
 * Result of validating a document.
 */
export interface ValidationResult {
  /** Whether validation passed (no errors) */
  valid: boolean;
  /** Validation errors */
  errors: ValidationError[];
  /** Validation warnings */
  warnings: ValidationWarning[];
}

/**
 * Browser-compatible validator instance.
 */
export interface Validator {
  /**
   * Validate parsed content against a document type schema.
   * 
   * @param content - The parsed document content (JavaScript object)
   * @param documentType - The document type (e.g., 'process', 'actors')
   */
  validate(content: unknown, documentType: DocumentType): ValidationResult;
  
  /**
   * Validate a parsed UBML document, using its metadata for type detection.
   * 
   * @param doc - The parsed UBMLDocument from parse()
   */
  validateDocument(doc: UBMLDocument): ValidationResult;
}

/** Internal Ajv error shape */
interface AjvError {
  message?: string;
  instancePath?: string;
  keyword?: string;
  params?: Record<string, unknown>;
  schemaPath?: string;
  data?: unknown;
}

/** Internal validate function shape */
interface ValidateFn {
  (data: unknown): boolean;
  errors?: AjvError[] | null;
}

/**
 * Convert Ajv errors to ValidationErrors, preserving raw error data.
 */
function convertAjvErrors(
  ajvErrors: AjvError[] | null | undefined,
  schema?: Record<string, unknown>
): ValidationError[] {
  if (!ajvErrors) return [];

  return ajvErrors.map((err) => {
    // Build schema context for enhanced error messages
    const schemaContext = buildSchemaContext(err, schema);
    
    return {
      message: err.message ?? 'Unknown validation error',
      path: err.instancePath || undefined,
      code: err.keyword,
      ajvError: {
        keyword: err.keyword,
        instancePath: err.instancePath,
        message: err.message,
        params: err.params,
        schemaPath: err.schemaPath,
        data: err.data,
      },
      schemaContext,
    };
  });
}

/**
 * Build schema context for enhanced error messages.
 */
function buildSchemaContext(
  err: AjvError,
  schema?: Record<string, unknown>
): SchemaContext | undefined {
  if (!schema) return undefined;
  
  const context: SchemaContext = {};
  
  // For additionalProperties errors, extract valid property names
  if (err.keyword === 'additionalProperties' && err.schemaPath) {
    const parentPath = getParentSchemaPath(err.instancePath || '');
    const parentSchema = resolveSchemaPath(schema, parentPath);
    if (parentSchema && typeof parentSchema === 'object' && 'properties' in parentSchema) {
      const props = parentSchema.properties as Record<string, unknown>;
      context.validProperties = Object.keys(props);
    }
  }
  
  // For enum errors, extract allowed values
  if (err.keyword === 'enum' && err.params?.allowedValues) {
    context.propertySchema = { enum: err.params.allowedValues };
  }
  
  // For pattern errors, try to extract examples
  if (err.keyword === 'pattern' && err.schemaPath) {
    const propSchema = resolveSchemaPath(schema, err.schemaPath.replace('#/', '').replace('/pattern', ''));
    if (propSchema && typeof propSchema === 'object') {
      const ps = propSchema as Record<string, unknown>;
      if (ps.examples) {
        context.examples = ps.examples as unknown[];
      }
      context.propertySchema = ps;
    }
  }
  
  return Object.keys(context).length > 0 ? context : undefined;
}

/**
 * Get parent path from instance path.
 */
function getParentSchemaPath(instancePath: string): string {
  const parts = instancePath.split('/').filter(Boolean);
  return parts.slice(0, -1).join('/');
}

/**
 * Resolve a schema path to get the sub-schema.
 */
function resolveSchemaPath(schema: Record<string, unknown>, path: string): unknown {
  if (!path) return schema;
  
  const parts = path.split('/').filter(Boolean);
  let current: unknown = schema;
  
  for (const part of parts) {
    if (current && typeof current === 'object' && part in (current as object)) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }
  
  return current;
}

/**
 * Create a validator instance.
 * 
 * This validator uses bundled schemas and has no file system dependencies.
 * It can be used in browsers, Node.js, or any JavaScript runtime.
 * 
 * Reuse the validator instance for performance - schema compilation is cached.
 * 
 * @example
 * ```typescript
 * import { createValidator } from 'ubml';
 * 
 * const validator = await createValidator();
 * const result = validator.validate(documentContent, 'process');
 * ```
 */
export async function createValidator(): Promise<Validator> {
  // Dynamic import to avoid TypeScript DTS issues with Ajv ESM interop
  const [{ default: Ajv2020 }, { default: addFormats }] = await Promise.all([
    import('ajv/dist/2020.js') as Promise<{ default: any }>,
    import('ajv-formats') as Promise<{ default: any }>,
  ]);

  const ajv = new Ajv2020({
    allErrors: true,
    strict: false,
    verbose: true, // Include data in error objects for better error messages
  });
  
  addFormats(ajv);

  // Add all bundled schemas
  const allSchemas = getAllSchemasById();
  for (const [id, schema] of allSchemas) {
    try {
      ajv.addSchema(schema);
    } catch (err) {
      // Schema may already be added, ignore
      const errMsg = err instanceof Error ? err.message : String(err);
      if (!errMsg.includes('already exists')) {
        console.warn(`Warning: Could not add schema ${id}: ${errMsg}`);
      }
    }
  }

  // Cache compiled validators
  const validatorCache = new Map<DocumentType, ValidateFn>();

  function getOrCompileValidator(documentType: DocumentType): ValidateFn {
    let validate = validatorCache.get(documentType);
    if (!validate) {
      const schema = documentSchemas[documentType];
      if (!schema) {
        throw new Error(`Unknown document type: ${documentType}`);
      }
      validate = ajv.compile(schema) as ValidateFn;
      validatorCache.set(documentType, validate);
    }
    return validate;
  }
  
  function getSchemaForType(documentType: DocumentType): Record<string, unknown> | undefined {
    return documentSchemas[documentType] as Record<string, unknown> | undefined;
  }

  const validator: Validator = {
    validate(content: unknown, documentType: DocumentType): ValidationResult {
      const validate = getOrCompileValidator(documentType);
      const schema = getSchemaForType(documentType);
      const valid = validate(content);
      
      return {
        valid,
        errors: valid ? [] : convertAjvErrors(validate.errors, schema),
        warnings: [],
      };
    },

    validateDocument(doc: UBMLDocument): ValidationResult {
      const documentType = doc.meta.type;
      if (!documentType) {
        return {
          valid: false,
          errors: [{
            message: `Could not detect document type. Expected pattern: *.{type}.ubml.yaml`,
            line: 1,
            column: 1,
          }],
          warnings: [],
        };
      }
      
      const validate = getOrCompileValidator(documentType);
      const schema = getSchemaForType(documentType);
      const valid = validate(doc.content);
      
      if (valid) {
        return { valid: true, errors: [], warnings: [] };
      }
      
      // Convert errors with source location resolution and Ajv error preservation
      const errors: ValidationError[] = (validate.errors ?? []).map((err) => {
        const path = err.instancePath || undefined;
        const loc = path ? doc.getSourceLocation(path) : undefined;
        const schemaContext = buildSchemaContext(err, schema);
        
        return {
          message: err.message ?? 'Unknown validation error',
          path,
          code: err.keyword,
          line: loc?.line,
          column: loc?.column,
          ajvError: {
            keyword: err.keyword,
            instancePath: err.instancePath,
            message: err.message,
            params: err.params,
            schemaPath: err.schemaPath,
            data: err.data,
          },
          schemaContext,
        };
      });
      
      return { valid: false, errors, warnings: [] };
    },
  };

  return validator;
}

/**
 * Singleton validator instance for convenience.
 * Use `createValidator()` if you need multiple instances or custom configuration.
 */
let defaultValidator: Validator | null = null;

/**
 * Get or create the default validator instance.
 */
export async function getValidator(): Promise<Validator> {
  if (!defaultValidator) {
    defaultValidator = await createValidator();
  }
  return defaultValidator;
}

/**
 * Result of parsing and validating.
 */
export interface ParseAndValidateResult<T = unknown> extends ParseResult<T> {
  /** Validation result, undefined if parsing failed */
  validation: ValidationResult | undefined;
}

/**
 * Convenience function: parse + validate in one call.
 * 
 * @param content - YAML string to parse
 * @param filename - Optional filename for document type detection
 * 
 * @example
 * ```typescript
 * import { parseAndValidate } from 'ubml';
 * 
 * const result = await parseAndValidate(yamlContent, 'process.ubml.yaml');
 * if (result.ok && result.validation?.valid) {
 *   console.log('Document is valid!');
 * }
 * ```
 */
export async function parseAndValidate<T = unknown>(
  content: string,
  filename?: string
): Promise<ParseAndValidateResult<T>> {
  const parseResult = parse<T>(content, filename);
  
  if (!parseResult.ok || !parseResult.document) {
    return {
      ...parseResult,
      validation: undefined,
    };
  }
  
  const validator = await getValidator();
  const validation = validator.validateDocument(parseResult.document);
  
  return {
    ...parseResult,
    validation,
  };
}

/**
 * Options for validating multiple documents.
 */
export interface ValidateOptions {
  /** Suppress unused-id warnings (useful for catalog documents) */
  suppressUnusedWarnings?: boolean;
}

/**
 * Validate multiple UBML documents (schema + cross-document references).
 * 
 * This is the unified validation function that handles both schema validation
 * and cross-document reference validation in one call.
 * 
 * @param documents - Array of parsed UBML documents to validate
 * @param options - Validation options
 * 
 * @example
 * ```typescript
 * import { parse, validate } from 'ubml';
 * 
 * const actors = parse(actorsYaml, 'actors.actors.ubml.yaml');
 * const process = parse(processYaml, 'process.process.ubml.yaml');
 * 
 * const result = await validate([actors.document!, process.document!]);
 * if (!result.valid) {
 *   for (const error of result.errors) {
 *     console.error(error.message);
 *   }
 * }
 * ```
 */
export async function validate(
  documents: UBMLDocument[],
  options: ValidateOptions = {}
): Promise<ValidationResult> {
  const { validateDocuments } = await import('./semantic-validator.js');
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  
  const validator = await getValidator();
  
  // Phase 1: Validate each document against its schema
  for (const doc of documents) {
    const schemaResult = validator.validateDocument(doc);
    errors.push(...schemaResult.errors);
    warnings.push(...schemaResult.warnings);
  }
  
  // Phase 2: Validate cross-document references using semantic validator
  const refResult = validateDocuments(documents, {
    suppressUnusedWarnings: options.suppressUnusedWarnings,
  });
  
  // Add reference errors with suggestions
  for (const refError of refResult.errors) {
    errors.push({
      code: refError.code,
      message: refError.message,
      filepath: refError.filepath,
      path: refError.path,
    });
  }
  
  // Add reference warnings with source locations
  for (const refWarning of refResult.warnings) {
    warnings.push({
      code: refWarning.code,
      message: refWarning.message,
      filepath: refWarning.filepath,
      path: refWarning.path,
      line: refWarning.line,
      column: refWarning.column,
    });
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
