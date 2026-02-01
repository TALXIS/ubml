/**
 * Schema Module
 *
 * Unified module for schema introspection and utilities.
 * Consolidates all schema-related functionality for CLI and consumers.
 *
 * @module ubml/schema
 */

// =============================================================================
// Types
// =============================================================================

export type {
  SchemaCliMetadata,
  DocumentTypeInfo,
  SectionInfo,
  ElementTypeInfo,
  PropertyInfo,
  WorkflowStep,
  IdPrefixInfo,
} from './types.js';

// =============================================================================
// Introspection
// =============================================================================

export {
  getDocumentTypeInfo,
  getAllDocumentTypes,
  getDocumentTypesByCategory,
  getElementTypeInfo,
  getAllElementTypes,
  getIdPrefixInfo,
  getAllIdPrefixes,
  getSuggestedWorkflow,
  getSuggestedNextStep,
  // Help topics
  getHelpTopics,
  getHelpTopicsByCategory,
  findHelpTopic,
  getConceptInfo,
  type HelpTopic,
  type HelpTopicCategory,
} from './introspection/index.js';

// =============================================================================
// ID Utilities
// =============================================================================

export {
  formatId,
  parseIdNumber,
  getIdPrefix,
  getNextId,
  validateId,
  isValidId,
  getElementTypeFromId,
  getInitStartNumber,
  getAddStartNumber,
  getIdDigitLength,
  ALL_ID_PATTERN,
  ID_PATTERNS,
} from './id-utils.js';

// =============================================================================
// Detection
// =============================================================================

export {
  detectDocumentType,
  detectDocumentTypeFromContent,
  getUBMLFilePatterns,
  isUBMLFile,
  getSchemaPathForFileSuffix,
} from './detection.js';

// =============================================================================
// Hints
// =============================================================================

export {
  getPatternHint,
  getPatternHintByPrefix,
  getNestedPropertyHint,
  shouldBeNested,
  getEnumHint,
  getEnumValueMistakeHint,
  getEnumValues,
} from './hints.js';

// =============================================================================
// Templates
// =============================================================================

export {
  createDocument,
  createDocumentYaml,
  getDefaultFilename,
  type CreateDocumentOptions,
} from './templates.js';

// =============================================================================
// Schema-Derived Metadata
// =============================================================================

export {
  getAllIdPrefixMetadata,
  getIdPrefixMetadata,
  getIdPrefixCategories,
  getIdPrefixCategoryMap,
  getCommonProperties,
  type IdPrefixMetadata,
  type IdCategory,
} from './derive.js';
