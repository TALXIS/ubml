/**
 * Generate data.ts
 *
 * Generate PURE DATA exports from YAML schemas.
 * This file contains NO FUNCTIONS - just data constants that can be imported
 * by hand-written runtime utilities.
 *
 * @module generate/generate-data
 */

import { createBanner } from './utils.js';
import type {
  RefInfo,
  IdConfig,
  ToolingHints,
  ContentDetectionConfig,
  ValidationPatterns,
  CommonPropertiesConfig,
  CategoryConfig,
} from './extract-metadata/index.js';

// =============================================================================
// Generate data.ts
// =============================================================================

/**
 * Generate data.ts content - pure data exports only.
 */
export function generateDataTs(
  documentTypes: string[],
  types: string[],
  refInfos: RefInfo[],
  refFields: string[],
  toolingHints: ToolingHints,
  idConfig: IdConfig,
  detectionConfig: ContentDetectionConfig[],
  validationPatterns: ValidationPatterns,
  commonPropertiesConfig: CommonPropertiesConfig,
  categoryConfig: CategoryConfig[]
): string {
  // Build ID_PREFIXES object
  const idPrefixesObj = Object.fromEntries(refInfos.map((r) => [r.prefix, r.type]));

  // Build SCHEMA_PATHS object
  const schemaPaths = {
    root: 'ubml.schema.yaml',
    defs: {
      refs: 'defs/refs.defs.yaml',
      primitives: 'defs/primitives.defs.yaml',
      shared: 'defs/shared.defs.yaml',
    },
    documents: Object.fromEntries(documentTypes.map((t) => [t, `documents/${t}.schema.yaml`])),
    types: Object.fromEntries(types.map((t) => [t, `types/${t}.types.yaml`])),
  };

  // Build CONTENT_DETECTION_CONFIG object
  const contentDetection = Object.fromEntries(
    detectionConfig.map((c) => [c.documentType, c.detectBy])
  );

  return `${createBanner('data.ts', `Schema data derived from YAML schema files.

This file contains PURE DATA ONLY - no functions.
Runtime utilities that use this data are in src/metadata.ts.

This separation ensures:
- Generated code is minimal and obvious
- Runtime logic is hand-written, type-checked, and testable
- Schema changes only affect data, not behavior`)}

// ============================================================================
// DOCUMENT TYPES
// ============================================================================

/**
 * Supported UBML document types.
 * Derived from: schemas/documents/*.schema.yaml
 */
export const DOCUMENT_TYPES = ${JSON.stringify(documentTypes, null, 2).replace(/\n/g, '\n')} as const;

export type DocumentType = typeof DOCUMENT_TYPES[number];

// ============================================================================
// TYPE NAMES
// ============================================================================

/**
 * Available type schema names.
 * Derived from: schemas/types/*.types.yaml
 */
export const TYPE_NAMES = ${JSON.stringify(types, null, 2).replace(/\n/g, '\n')} as const;

export type TypeName = typeof TYPE_NAMES[number];

// ============================================================================
// SCHEMA PATHS
// ============================================================================

/**
 * Schema file paths relative to the schemas directory.
 */
export const SCHEMA_PATHS = ${JSON.stringify(schemaPaths, null, 2)} as const;

// ============================================================================
// ID CONFIGURATION
// ============================================================================

/**
 * Configuration for ID generation.
 * Extracted from: schemas/defs/shared.defs.yaml x-ubml-id-config
 */
export const ID_CONFIG = {
  /** Number of digits in ID (zero-padded) */
  digitLength: ${idConfig.digitLength},
  /** Regex pattern for validation */
  pattern: '${idConfig.pattern.replace(/\\/g, '\\\\')}',
  /** Starting number for 'ubml init' templates */
  initOffset: ${idConfig.initOffset},
  /** Starting number for 'ubml add' templates */
  addOffset: ${idConfig.addOffset},
} as const;

// ============================================================================
// ID PREFIXES
// ============================================================================

/**
 * ID prefix to element type mapping.
 * Extracted from: schemas/defs/refs.defs.yaml $defs/*Ref patterns
 */
export const ID_PREFIXES = ${JSON.stringify(idPrefixesObj, null, 2)} as const;

export type IdPrefix = keyof typeof ID_PREFIXES;
export type ElementType = (typeof ID_PREFIXES)[IdPrefix];

// ============================================================================
// REFERENCE FIELDS
// ============================================================================

/**
 * Property names that contain ID references to other elements.
 * Extracted from: All properties in schemas that use $ref to *Ref types
 */
export const REFERENCE_FIELDS = ${JSON.stringify(refFields, null, 2)} as const;

// ============================================================================
// COMMON PROPERTIES
// ============================================================================

/**
 * Property names that are common across all document types.
 */
export const COMMON_PROPERTIES = ${JSON.stringify(commonPropertiesConfig.properties, null, 2)} as const;

// ============================================================================
// VALIDATION PATTERNS
// ============================================================================

/**
 * Validation pattern strings (not RegExp - create at runtime for tree-shaking).
 */
export const VALIDATION_PATTERNS = {
  duration: '${validationPatterns.duration.replace(/\\/g, '\\\\')}',
  time: '${validationPatterns.time.replace(/\\/g, '\\\\')}',
} as const;

// ============================================================================
// CATEGORY CONFIGURATION
// ============================================================================

/**
 * Category configuration for display order and naming.
 * Extracted from: defs.schema.yaml x-ubml-categories
 */
export interface CategoryConfigItem {
  key: string;
  displayName: string;
  order: number;
}

export const CATEGORY_CONFIG: readonly CategoryConfigItem[] = ${JSON.stringify(categoryConfig, null, 2)};

// ============================================================================
// CONTENT DETECTION
// ============================================================================

/**
 * Content detection configuration.
 * Maps document types to properties that indicate that type.
 * Extracted from: x-ubml-cli.detectBy in each document schema
 */
export const CONTENT_DETECTION_CONFIG: Record<DocumentType, readonly string[]> = ${JSON.stringify(contentDetection, null, 2)};

// ============================================================================
// TOOLING HINTS
// ============================================================================

/**
 * Pattern validation hints for error messages.
 */
export interface PatternHintData {
  pattern: string;
  humanName: string;
  errorHint: string;
  examples: string[];
  prefix?: string;
  commonMistakes?: Array<{ pattern: string; message: string }>;
}

export const PATTERN_HINTS: readonly PatternHintData[] = ${JSON.stringify(toolingHints.patterns, null, 2)};

/**
 * Nested property hints for misplacement detection.
 */
export interface NestedPropertyHintData {
  parentProperty: string;
  childProperties: string[];
  misplacementHint: string;
  misplacementExample: string;
}

export const NESTED_PROPERTY_HINTS: readonly NestedPropertyHintData[] = ${JSON.stringify(toolingHints.nestedProperties, null, 2)};

/**
 * Enum validation hints.
 */
export interface EnumValueHintData {
  value: string;
  hint: string;
}

export interface EnumHintData {
  propertyNames: string[];
  values: string[];
  valueMistakes?: Record<string, EnumValueHintData>;
}

export const ENUM_HINTS: readonly EnumHintData[] = ${JSON.stringify(toolingHints.enums, null, 2)};
`;
}
