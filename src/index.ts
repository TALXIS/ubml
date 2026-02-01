/**
 * UBML - Unified Business Modeling Language
 *
 * A TypeScript library for parsing, validating, and serializing UBML documents.
 * 
 * This is the main entry point with browser-safe exports.
 * For Node.js file system operations, use `ubml/node`.
 *
 * @module ubml
 *
 * @example
 * ```typescript
 * // Browser-safe API (works everywhere)
 * import { parse, createValidator, serialize, schemas } from 'ubml';
 *
 * const result = parse(yamlContent, 'process.ubml.yaml');
 * if (result.ok) {
 *   const validator = await createValidator();
 *   const validation = validator.validateDocument(result.document);
 *   console.log(validation.valid ? 'Valid!' : validation.errors);
 * }
 * ```
 * 
 * @example
 * ```typescript
 * // Node.js file operations
 * import { parseFile, validateWorkspace, serializeToFile } from 'ubml/node';
 * 
 * const result = await parseFile('./process.ubml.yaml');
 * const workspace = await validateWorkspace('./my-workspace');
 * await serializeToFile(content, './output.ubml.yaml');
 * ```
 */

// ============================================================================
// PARSER (Browser-Safe)
// ============================================================================

export {
  parse,
  type ParseResult,
  type UBMLDocument,
  type DocumentMeta,
  type ParseError,
  type ParseWarning,
  type SourceLocation,
} from './parser.js';

// ============================================================================
// VALIDATOR (Browser-Safe)
// ============================================================================

export {
  createValidator,
  getValidator,
  parseAndValidate,
  validate,
  type Validator,
  type ValidationResult,
  type ValidationError,
  type ValidationWarning,
  type ValidateOptions,
  type ParseAndValidateResult,
  type RawAjvError,
  type SchemaContext,
} from './validator.js';

// ============================================================================
// SEMANTIC VALIDATION (Browser-Safe)
// ============================================================================

export {
  validateDocuments,
  validateWorkspaceStructure,
  extractDefinedIds,
  extractReferencedIds,
  getDocumentMultiplicity,
  DOCUMENT_MULTIPLICITY,
  type ReferenceError,
  type ReferenceWarning,
  type ReferenceValidationResult,
  type ReferenceValidateOptions,
  type WorkspaceWarning,
  type WorkspaceValidationResult as WorkspaceStructureResult,
} from './semantic-validator.js';

// ============================================================================
// SERIALIZER (Browser-Safe)
// ============================================================================

export {
  serialize,
  type SerializeOptions,
} from './serializer.js';

// ============================================================================
// SCHEMAS (Browser-Safe)
// ============================================================================

export {
  schemas,
  type JSONSchema,
} from './schemas.js';

// ============================================================================
// DOCUMENT TYPE DETECTION (Browser-Safe)
// ============================================================================

export {
  detectDocumentType,
  detectDocumentTypeFromContent,
} from './schema/detection.js';

export {
  isDocumentType,
  DOCUMENT_TYPES,
  type DocumentType,
} from './metadata.js';

// ============================================================================
// TYPES (Browser-Safe)
// ============================================================================

export * from './types.js';

// ============================================================================
// METADATA (Browser-Safe)
// ============================================================================

export {
  TYPE_NAMES,
  type TypeName,
  // ID patterns and validation
  ID_PREFIXES,
  type IdPrefix,
  type ElementType,
  ID_PATTERNS,
  ALL_ID_PATTERN,
  validateId,
  isValidId,
  getElementTypeFromId,
  // Validation patterns
  DURATION_PATTERN,
  TIME_PATTERN,
  // File patterns
  getUBMLFilePatterns,
  isUBMLFile,
  getSchemaPathForFileSuffix,
  getSchemaPathForDocumentType,
  SCHEMA_PATHS,
  // Reference field validation
  REFERENCE_FIELDS,
  isReferenceField,
} from './metadata.js';

// ============================================================================
// CONSTANTS
// ============================================================================

export { VERSION, SCHEMA_VERSION, PACKAGE_NAME, REPOSITORY_URL } from './constants.js';
