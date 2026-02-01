/**
 * UBML Metadata Utilities
 *
 * Runtime utilities for working with UBML metadata.
 * This file is HAND-WRITTEN (not generated) and imports pure data from generated/data.ts.
 *
 * This separation ensures:
 * - Type-safe, testable runtime logic
 * - No code-as-strings in generation scripts
 * - Clear boundary between data and behavior
 *
 * @module metadata
 */

import {
  DOCUMENT_TYPES,
  TYPE_NAMES,
  SCHEMA_PATHS,
  ID_CONFIG,
  ID_PREFIXES,
  REFERENCE_FIELDS,
  COMMON_PROPERTIES,
  VALIDATION_PATTERNS,
  CATEGORY_CONFIG,
  CONTENT_DETECTION_CONFIG,
  PATTERN_HINTS,
  NESTED_PROPERTY_HINTS,
  ENUM_HINTS,
  type DocumentType,
  type TypeName,
  type IdPrefix,
  type ElementType,
  type CategoryConfigItem,
  type PatternHintData,
  type NestedPropertyHintData,
  type EnumHintData,
} from './generated/data.js';

// Re-export data and types for convenience
export {
  DOCUMENT_TYPES,
  TYPE_NAMES,
  SCHEMA_PATHS,
  ID_CONFIG,
  ID_PREFIXES,
  REFERENCE_FIELDS,
  COMMON_PROPERTIES,
  VALIDATION_PATTERNS,
  CATEGORY_CONFIG,
  CONTENT_DETECTION_CONFIG,
  PATTERN_HINTS,
  NESTED_PROPERTY_HINTS,
  ENUM_HINTS,
  type DocumentType,
  type TypeName,
  type IdPrefix,
  type ElementType,
  type CategoryConfigItem,
  type PatternHintData,
  type NestedPropertyHintData,
  type EnumHintData,
};

// Re-export SCHEMA_VERSION from constants
export { SCHEMA_VERSION } from './constants.js';

// ============================================================================
// DOCUMENT TYPE UTILITIES
// ============================================================================

/**
 * Check if a string is a valid document type.
 */
export function isDocumentType(type: string): type is DocumentType {
  return DOCUMENT_TYPES.includes(type as DocumentType);
}

/**
 * Get the schema path for a document type.
 */
export function getSchemaPathForDocumentType(type: DocumentType): string {
  return SCHEMA_PATHS.documents[type];
}

// ============================================================================
// ID PATTERNS (computed from data)
// ============================================================================

/**
 * ID patterns for UBML elements (RegExp).
 * Uses configured digit length for zero-padded format.
 */
export const ID_PATTERNS: Record<ElementType, RegExp> = Object.fromEntries(
  Object.entries(ID_PREFIXES).map(([prefix, type]) => [
    type,
    new RegExp(`^${prefix}\\d{${ID_CONFIG.digitLength},}$`),
  ])
) as Record<ElementType, RegExp>;

/**
 * Combined pattern matching any valid UBML ID.
 */
export const ALL_ID_PATTERN = new RegExp(
  `^(${Object.keys(ID_PREFIXES).join('|')})\\d{${ID_CONFIG.digitLength},}$`
);

// ============================================================================
// ID UTILITIES
// ============================================================================

/**
 * Format an ID with the given prefix and number.
 * @example formatId('AC', 1) // → 'AC00001'
 * @example formatId('PR', 1000) // → 'PR01000'
 */
export function formatId(prefix: IdPrefix, num: number): string {
  return `${prefix}${String(num).padStart(ID_CONFIG.digitLength, '0')}`;
}

/**
 * Parse the numeric portion from an ID.
 * @example parseIdNumber('AC00001') // → 1
 * @example parseIdNumber('PR01000') // → 1000
 */
export function parseIdNumber(id: string): number | undefined {
  const match = id.match(/^[A-Z]+(\d+)$/);
  return match ? parseInt(match[1], 10) : undefined;
}

/**
 * Get the prefix from an ID.
 * @example getIdPrefix('AC00001') // → 'AC'
 */
export function getIdPrefix(id: string): IdPrefix | undefined {
  const match = id.match(/^([A-Z]+)\d+$/);
  return match ? (match[1] as IdPrefix) : undefined;
}

/**
 * Find the next available ID for a given prefix.
 * @param prefix - The ID prefix (e.g., 'AC', 'PR')
 * @param existingIds - Set of existing IDs to avoid
 * @param startFrom - Starting number (defaults to 1)
 */
export function getNextId(prefix: IdPrefix, existingIds: Set<string>, startFrom = 1): string {
  let num = startFrom;
  let id = formatId(prefix, num);
  while (existingIds.has(id)) {
    num++;
    id = formatId(prefix, num);
  }
  return id;
}

/**
 * Validate an ID against its expected pattern.
 */
export function validateId(type: ElementType, id: string): boolean {
  const pattern = ID_PATTERNS[type];
  return pattern?.test(id) ?? false;
}

/**
 * Check if a string is a valid UBML ID of any type.
 */
export function isValidId(id: string): boolean {
  return ALL_ID_PATTERN.test(id);
}

/**
 * Get the element type from an ID.
 */
export function getElementTypeFromId(id: string): ElementType | undefined {
  const match = id.match(/^([A-Z]+)\d+$/);
  if (match) {
    const prefix = match[1] as IdPrefix;
    return ID_PREFIXES[prefix];
  }
  return undefined;
}

// ============================================================================
// REFERENCE FIELD UTILITIES
// ============================================================================

/**
 * Check if a property name is a known reference field.
 */
export function isReferenceField(fieldName: string): boolean {
  return REFERENCE_FIELDS.includes(fieldName as (typeof REFERENCE_FIELDS)[number]);
}

// ============================================================================
// COMMON PROPERTY UTILITIES
// ============================================================================

/**
 * Check if a property is a common document property.
 */
export function isCommonProperty(propertyName: string): boolean {
  return COMMON_PROPERTIES.includes(propertyName as (typeof COMMON_PROPERTIES)[number]);
}

// ============================================================================
// VALIDATION PATTERN REGEXES (computed from data)
// ============================================================================

/**
 * Duration pattern for validation.
 * Matches: 2d, 4h, 30min, 1.5wk, etc.
 */
export const DURATION_PATTERN = new RegExp(VALIDATION_PATTERNS.duration);

/**
 * Time pattern for validation (HH:MM format).
 */
export const TIME_PATTERN = new RegExp(VALIDATION_PATTERNS.time);

// ============================================================================
// CATEGORY UTILITIES
// ============================================================================

/**
 * Get the sort order for a category key.
 */
export function getCategorySortOrder(categoryKey: string): number {
  const config = CATEGORY_CONFIG.find((c) => c.key === categoryKey);
  return config?.order ?? 999;
}

/**
 * Get the display name for a category key.
 */
export function getCategoryDisplayName(categoryKey: string): string {
  const config = CATEGORY_CONFIG.find((c) => c.key === categoryKey);
  return config?.displayName ?? categoryKey;
}

// ============================================================================
// DOCUMENT TYPE DETECTION
// ============================================================================

// Re-export detection functions from schema/detection.ts (single source of truth)
export {
  detectDocumentType,
  detectDocumentTypeFromContent,
  getUBMLFilePatterns,
  isUBMLFile,
  getSchemaPathForFileSuffix,
} from './schema/detection.js';

// ============================================================================
// PATTERN HINT UTILITIES
// ============================================================================

// Re-export hint functions from schema/hints.ts (single source of truth)
export {
  getPatternHint,
  getPatternHintByPrefix,
  getNestedPropertyHint,
  shouldBeNested,
  getEnumHint,
  getEnumValueMistakeHint,
  getEnumValues,
} from './schema/hints.js';

// ============================================================================
// ID UTILITIES
// ============================================================================
