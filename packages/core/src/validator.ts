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
import { detectDocumentType, type DocumentType } from './generated/metadata.js';
import { parse, type ParseResult, type UBMLDocument } from './parser.js';

/**
 * A validation error.
 */
export interface ValidationError {
  /** Error message */
  message: string;
  /** JSON path to the error location (e.g., "/processes/PR001/steps/ST001") */
  path?: string;
  /** Error code/keyword for programmatic handling */
  code?: string;
  /** File path (for cross-document errors) */
  filepath?: string;
  /** Line number (1-indexed) */
  line?: number;
  /** Column number (1-indexed) */
  column?: number;
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
}

/** Internal validate function shape */
interface ValidateFn {
  (data: unknown): boolean;
  errors?: AjvError[] | null;
}

/**
 * Convert Ajv errors to ValidationErrors.
 */
function convertAjvErrors(ajvErrors: AjvError[] | null | undefined): ValidationError[] {
  if (!ajvErrors) return [];

  return ajvErrors.map((err) => ({
    message: err.message ?? 'Unknown validation error',
    path: err.instancePath || undefined,
    code: err.keyword,
  }));
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

  const validator: Validator = {
    validate(content: unknown, documentType: DocumentType): ValidationResult {
      const validate = getOrCompileValidator(documentType);
      const valid = validate(content);
      
      return {
        valid,
        errors: valid ? [] : convertAjvErrors(validate.errors),
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
      const valid = validate(doc.content);
      
      if (valid) {
        return { valid: true, errors: [], warnings: [] };
      }
      
      // Convert errors with source location resolution
      const errors: ValidationError[] = (validate.errors ?? []).map((err) => {
        const path = err.instancePath || undefined;
        const loc = path ? doc.getSourceLocation(path) : undefined;
        
        return {
          message: err.message ?? 'Unknown validation error',
          path,
          code: err.keyword,
          line: loc?.line,
          column: loc?.column,
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
  const { extractDefinedIds, extractReferencedIds } = await import('./semantic-validator.js');
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  
  const validator = await getValidator();
  
  // Phase 1: Validate each document against its schema
  for (const doc of documents) {
    const schemaResult = validator.validateDocument(doc);
    errors.push(...schemaResult.errors);
    warnings.push(...schemaResult.warnings);
  }
  
  // Phase 2: Validate cross-document references
  const definedIds = new Map<string, { filepath: string; path: string }>();
  const referencedIds = new Map<string, string[]>();
  
  // Extract all defined IDs
  for (const doc of documents) {
    const filepath = doc.meta.filename || 'unknown';
    const ids = extractDefinedIds(doc.content, filepath);
    
    for (const [id, info] of ids) {
      if (definedIds.has(id)) {
        const existing = definedIds.get(id)!;
        errors.push({
          code: 'ubml/duplicate-id',
          message: `ID \"${id}\" is defined in multiple files: ${existing.filepath} and ${info.filepath}`,
          filepath: info.filepath,
          path: info.path,
        });
      } else {
        definedIds.set(id, info);
      }
    }
    
    // Extract all referenced IDs
    const refs = extractReferencedIds(doc.content, filepath);
    for (const [id, locations] of refs) {
      const existing = referencedIds.get(id) ?? [];
      existing.push(...locations.map(l => l.filepath));
      referencedIds.set(id, existing);
    }
  }
  
  // Check for undefined references
  for (const [id, filepaths] of referencedIds) {
    if (!definedIds.has(id)) {
      const uniqueFiles = [...new Set(filepaths)];
      for (const filepath of uniqueFiles) {
        errors.push({
          code: 'ubml/undefined-reference',
          message: `Reference to undefined ID \"${id}\"`,
          filepath,
        });
      }
    }
  }
  
  // Check for unused IDs (warning only)
  if (!options.suppressUnusedWarnings) {
    for (const [id, info] of definedIds) {
      if (!referencedIds.has(id)) {
        // Get the document to resolve source location
        const doc = documents.find(d => d.meta.filename === info.filepath);
        const jsonPointerPath = '/' + info.path.replace(/\./g, '/');
        const location = doc?.getSourceLocation(jsonPointerPath);
        
        warnings.push({
          code: 'ubml/unused-id',
          message: `ID \"${id}\" is defined but never referenced`,
          filepath: info.filepath,
          path: info.path,
          ...(location && {
            line: location.line,
            column: location.column,
          }),
        });
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
