/**
 * Schema loader utilities.
 *
 * This is the SINGLE SOURCE OF TRUTH for all schema-related constants.
 * All document types, schema paths, ID patterns, etc. are defined here
 * and should be imported by other modules.
 */

import { readFile } from 'fs/promises';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'yaml';
import { existsSync } from 'fs';

// ============================================================================
// DOCUMENT TYPES
// ============================================================================

/**
 * Supported UBML document types.
 */
export type DocumentType =
  | 'workspace'
  | 'process'
  | 'actors'
  | 'entities'
  | 'scenarios'
  | 'hypotheses'
  | 'strategy'
  | 'metrics'
  | 'mining'
  | 'views'
  | 'links'
  | 'glossary';

/**
 * Array of all document types.
 */
export const DOCUMENT_TYPES: readonly DocumentType[] = [
  'workspace',
  'process',
  'actors',
  'entities',
  'scenarios',
  'hypotheses',
  'strategy',
  'metrics',
  'mining',
  'views',
  'links',
  'glossary',
] as const;

// ============================================================================
// SCHEMA PATHS
// ============================================================================

/**
 * Current UBML schema version.
 */
export const SCHEMA_VERSION = '1.0';

/**
 * Schema file paths relative to the schemas directory.
 * Generated from DOCUMENT_TYPES to avoid duplication.
 */
export const SCHEMA_PATHS = {
  root: 'ubml.schema.yaml',
  defs: 'common/defs.schema.yaml',
  documents: Object.fromEntries(
    DOCUMENT_TYPES.map((type) => [type, `documents/${type}.document.yaml`])
  ) as Record<DocumentType, string>,
  fragments: {
    actor: 'fragments/actor.fragment.yaml',
    entity: 'fragments/entity.fragment.yaml',
    hypothesis: 'fragments/hypothesis.fragment.yaml',
    link: 'fragments/link.fragment.yaml',
    metrics: 'fragments/metrics.fragment.yaml',
    mining: 'fragments/mining.fragment.yaml',
    process: 'fragments/process.fragment.yaml',
    resource: 'fragments/resource.fragment.yaml',
    scenario: 'fragments/scenario.fragment.yaml',
    step: 'fragments/step.fragment.yaml',
    strategy: 'fragments/strategy.fragment.yaml',
    view: 'fragments/view.fragment.yaml',
  },
} as const;

/**
 * Get the schema path for a document type.
 */
export function getSchemaPathForDocumentType(type: DocumentType): string {
  return SCHEMA_PATHS.documents[type];
}

/**
 * Mapping from file suffix patterns to schema paths.
 * Used for matching filenames to their schemas.
 */
export function getSchemaPathForFileSuffix(filepath: string): string | undefined {
  for (const type of DOCUMENT_TYPES) {
    if (
      filepath.endsWith(`.${type}.ubml.yaml`) ||
      filepath.endsWith(`.${type}.ubml.yml`)
    ) {
      return SCHEMA_PATHS.documents[type];
    }
  }
  return undefined;
}

// ============================================================================
// ID PATTERNS
// ============================================================================

/**
 * ID prefix to element type mapping.
 */
export const ID_PREFIXES = {
  AC: 'actor',
  PS: 'persona',
  SK: 'skill',
  RP: 'resourcePool',
  EQ: 'equipment',
  EN: 'entity',
  DC: 'document',
  LO: 'location',
  PR: 'process',
  ST: 'step',
  BK: 'block',
  PH: 'phase',
  SC: 'scenario',
  HT: 'hypothesisTree',
  HY: 'hypothesis',
  EV: 'evidence',
  VS: 'valueStream',
  CP: 'capability',
  PD: 'product',
  SV: 'service',
  PF: 'portfolio',
  KP: 'kpi',
  ROI: 'roiAnalysis',
  MS: 'miningSource',
  VW: 'view',
} as const;

export type IdPrefix = keyof typeof ID_PREFIXES;
export type ElementType = (typeof ID_PREFIXES)[IdPrefix];

/**
 * ID patterns for UBML elements.
 * Generated from ID_PREFIXES to avoid duplication.
 */
export const ID_PATTERNS: Record<ElementType, RegExp> = Object.fromEntries(
  Object.entries(ID_PREFIXES).map(([prefix, type]) => [
    type,
    new RegExp(`^${prefix}\\d{3,}$`),
  ])
) as Record<ElementType, RegExp>;

/**
 * Combined pattern matching any valid UBML ID.
 */
export const ALL_ID_PATTERN = new RegExp(
  `^(${Object.keys(ID_PREFIXES).join('|')})\\d{3,}$`
);

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
  const match = id.match(/^([A-Z]+)\d{3,}$/);
  if (match) {
    const prefix = match[1] as IdPrefix;
    return ID_PREFIXES[prefix];
  }
  return undefined;
}

// ============================================================================
// VALIDATION PATTERNS
// ============================================================================

/**
 * Duration pattern for validation.
 * Matches: 2d, 4h, 30min, 1.5wk, etc.
 */
export const DURATION_PATTERN = /^[0-9]+(\.[0-9]+)?(min|h|d|wk|mo)$/;

/**
 * Time pattern for validation (HH:MM format).
 */
export const TIME_PATTERN = /^[0-2][0-9]:[0-5][0-9]$/;

// ============================================================================
// SCHEMA DIRECTORY UTILITIES
// ============================================================================

let cachedSchemasDir: string | null = null;

/**
 * Get the schemas directory path.
 */
export function getSchemasDirectory(): string {
  if (cachedSchemasDir) {
    return cachedSchemasDir;
  }

  const currentFile = fileURLToPath(import.meta.url);
  const currentDir = dirname(currentFile);

  const possiblePaths = [
    resolve(currentDir, '..', '..', 'schemas'), // from dist/schemas/
    resolve(currentDir, '..', '..', '..', 'schemas'), // from src/schemas/
    resolve(process.cwd(), 'schemas'), // from cwd
  ];

  for (const path of possiblePaths) {
    if (existsSync(path)) {
      cachedSchemasDir = path;
      return path;
    }
  }

  throw new Error('Could not locate schemas directory');
}

/**
 * Get the absolute path to a specific schema file.
 */
export function getSchemaPath(relativePath: string): string {
  return join(getSchemasDirectory(), relativePath);
}

// ============================================================================
// SCHEMA LOADING
// ============================================================================

/**
 * Internal helper to load a schema file from a relative path.
 */
async function loadSchemaFile(relativePath: string): Promise<unknown> {
  const fullPath = join(getSchemasDirectory(), relativePath);
  const content = await readFile(fullPath, 'utf8');
  return parse(content);
}

/**
 * Load a schema file by document type.
 */
export async function loadSchema(type: DocumentType): Promise<unknown> {
  return loadSchemaFile(SCHEMA_PATHS.documents[type]);
}

/**
 * Load the root UBML schema.
 */
export async function loadRootSchema(): Promise<unknown> {
  return loadSchemaFile(SCHEMA_PATHS.root);
}

/**
 * Load the common definitions schema.
 */
export async function loadDefsSchema(): Promise<unknown> {
  return loadSchemaFile(SCHEMA_PATHS.defs);
}

// ============================================================================
// DOCUMENT TYPE DETECTION
// ============================================================================

/**
 * Detect document type from filename.
 */
export function detectDocumentType(filename: string): DocumentType | undefined {
  const lower = filename.toLowerCase();
  for (const type of DOCUMENT_TYPES) {
    if (lower.includes(`.${type}.ubml.yaml`) || lower.includes(`.${type}.ubml.yml`)) {
      return type;
    }
  }
  return undefined;
}

/**
 * Get all glob patterns for finding UBML files.
 */
export function getUBMLFilePatterns(): string[] {
  return DOCUMENT_TYPES.map((type) => `**/*.${type}.ubml.yaml`);
}

/**
 * Check if a filename is a valid UBML file.
 */
export function isUBMLFile(filename: string): boolean {
  return detectDocumentType(filename) !== undefined;
}
