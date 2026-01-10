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
  FRAGMENT_NAMES,
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
  type FragmentName,
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
  FRAGMENT_NAMES,
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
  type FragmentName,
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

/**
 * Detect document type from filename pattern.
 *
 * Supports two patterns:
 * 1. Full pattern: prefix.type.ubml.yaml (e.g., organization.actors.ubml.yaml)
 * 2. Simple pattern: type.ubml.yaml (e.g., actors.ubml.yaml)
 *
 * @example
 * detectDocumentType('foo.process.ubml.yaml') // → 'process'
 * detectDocumentType('process.ubml.yaml')     // → 'process'
 * detectDocumentType('actors.ubml.yaml')      // → 'actors'
 * detectDocumentType('generic.ubml.yaml')     // → undefined
 */
export function detectDocumentType(filename: string): DocumentType | undefined {
  const lower = filename.toLowerCase();
  for (const type of DOCUMENT_TYPES) {
    // Match both patterns: *.type.ubml.yaml AND type.ubml.yaml
    if (
      lower.includes(`.${type}.ubml.yaml`) ||
      lower.includes(`.${type}.ubml.yml`) ||
      lower.endsWith(`${type}.ubml.yaml`) ||
      lower.endsWith(`${type}.ubml.yml`)
    ) {
      return type;
    }
  }
  return undefined;
}

/**
 * Detect document type from parsed content by examining properties.
 * Useful for generic .ubml.yaml files without type in filename.
 * Detection rules are derived from x-ubml-cli.detectBy in schemas.
 */
export function detectDocumentTypeFromContent(content: unknown): DocumentType | undefined {
  if (!content || typeof content !== 'object') {
    return undefined;
  }

  const obj = content as Record<string, unknown>;

  // Score each document type by how many detectBy properties are present
  let bestMatch: DocumentType | undefined;
  let bestScore = 0;

  for (const [docType, detectProps] of Object.entries(CONTENT_DETECTION_CONFIG)) {
    const score = detectProps.filter((prop) => prop in obj).length;
    if (score > bestScore) {
      bestScore = score;
      bestMatch = docType as DocumentType;
    }
  }

  return bestMatch;
}

/**
 * Get all glob patterns for finding UBML files.
 * Includes both full pattern (*.type.ubml.yaml) and simple pattern (type.ubml.yaml).
 */
export function getUBMLFilePatterns(): string[] {
  const patterns: string[] = [];
  for (const type of DOCUMENT_TYPES) {
    patterns.push(`**/*.${type}.ubml.yaml`); // Full pattern: prefix.type.ubml.yaml
    patterns.push(`**/${type}.ubml.yaml`); // Simple pattern: type.ubml.yaml
  }
  return patterns;
}

/**
 * Check if a filename is a valid UBML file.
 */
export function isUBMLFile(filename: string): boolean {
  return detectDocumentType(filename) !== undefined;
}

/**
 * Get the schema path for a file based on its suffix.
 * Supports both full pattern (*.type.ubml.yaml) and simple pattern (type.ubml.yaml).
 */
export function getSchemaPathForFileSuffix(filepath: string): string | undefined {
  for (const type of DOCUMENT_TYPES) {
    if (
      filepath.endsWith(`.${type}.ubml.yaml`) ||
      filepath.endsWith(`.${type}.ubml.yml`) ||
      filepath.endsWith(`${type}.ubml.yaml`) ||
      filepath.endsWith(`${type}.ubml.yml`)
    ) {
      return SCHEMA_PATHS.documents[type];
    }
  }
  return undefined;
}

// ============================================================================
// PATTERN HINT UTILITIES
// ============================================================================

/**
 * Get pattern hint for a regex pattern.
 */
export function getPatternHint(pattern: string): PatternHintData | undefined {
  return PATTERN_HINTS.find((h) => h.pattern === pattern);
}

// ============================================================================
// NESTED PROPERTY HINT UTILITIES
// ============================================================================

/**
 * Get nested property hint for a property that might be misplaced.
 */
export function getNestedPropertyHint(propertyName: string): NestedPropertyHintData | undefined {
  return NESTED_PROPERTY_HINTS.find((h) => h.childProperties.includes(propertyName));
}

/**
 * Check if a property should be nested inside another property.
 */
export function shouldBeNested(
  propertyName: string
): { parent: string; hint: string; example: string } | undefined {
  const hint = getNestedPropertyHint(propertyName);
  if (hint) {
    return {
      parent: hint.parentProperty,
      hint: hint.misplacementHint,
      example: hint.misplacementExample,
    };
  }
  return undefined;
}

// ============================================================================
// ENUM HINT UTILITIES
// ============================================================================

/**
 * Get enum hint for a property name.
 */
export function getEnumHint(propertyName: string): EnumHintData | undefined {
  return ENUM_HINTS.find((h) => h.propertyNames.includes(propertyName));
}

/**
 * Get hint for an invalid enum value on a specific property.
 *
 * Because multiple enum types can share the same property name (e.g., "kind" for
 * Phase.kind, Step.kind, Loop.kind), we first try to find an enum that has the
 * specific invalid value in its valueMistakes, then fall back to the first match.
 */
export function getEnumValueMistakeHint(
  propertyName: string,
  invalidValue: string
): string | undefined {
  // First, try to find an enum hint that specifically has this invalid value
  // This handles cases like "task" which should match Step.kind, not Phase.kind
  for (const enumHint of ENUM_HINTS) {
    if (enumHint.propertyNames.includes(propertyName) && enumHint.valueMistakes?.[invalidValue]) {
      return enumHint.valueMistakes[invalidValue].hint;
    }
  }
  return undefined;
}
