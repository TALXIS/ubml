/**
 * UBML - Unified Business Modeling Language
 *
 * A TypeScript library for parsing, validating, and serializing UBML documents.
 *
 * @module ubml
 *
 * @example
 * ```typescript
 * import { parseDocument, validateDocument, serializeDocument } from 'ubml';
 *
 * // Parse a UBML document
 * const result = await parseDocument('process.ubml.yaml');
 *
 * // Validate a workspace
 * const validation = await validateWorkspace('./my-workspace');
 *
 * // Serialize to YAML
 * await serializeDocument(content, 'output.ubml.yaml');
 * ```
 */

// Parser exports
export {
  parseDocument,
  parseDocumentFromString,
  type ParseResult,
  type UBMLDocument,
  type DocumentMeta,
  type ParsedNode,
  type SourceLocation,
} from './parser/index.js';

// Validator exports
export {
  validateDocument,
  validateWorkspace,
  validateReferences,
  formatError,
  formatErrors,
  type ValidationResult,
  type ValidatorOptions,
  type ReferenceValidationResult,
  type ValidationError,
  type ValidationWarning,
} from './validator/index.js';

// Serializer exports
export {
  serializeDocument,
  serializeToString,
  type SerializeOptions,
} from './serializer/index.js';

// Constants
export { VERSION, PACKAGE_NAME, REPOSITORY_URL } from './constants.js';

// Schema utilities - single source of truth for all schema-related constants
export {
  // Document types
  type DocumentType,
  DOCUMENT_TYPES,
  // Schema paths and version
  SCHEMA_VERSION,
  SCHEMA_PATHS,
  getSchemaPathForDocumentType,
  getSchemaPathForFileSuffix,
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
  // Document type detection
  detectDocumentType,
  getUBMLFilePatterns,
  isUBMLFile,
  // Schema loading
  loadSchema,
  loadRootSchema,
  loadDefsSchema,
  getSchemasDirectory,
  getSchemaPath,
} from './schemas/loader.js';
