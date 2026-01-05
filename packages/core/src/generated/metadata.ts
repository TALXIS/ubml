/**
 * Schema metadata derived from YAML schema files.
 * 
 * AUTO-GENERATED FILE - DO NOT EDIT
 * Run: npm run generate
 * 
 * This file is the SINGLE SOURCE OF TRUTH for:
 * - Document types (discovered from schemas/documents/*.document.yaml)
 * - Fragment names (discovered from schemas/fragments/*.fragment.yaml)
 * - ID prefixes and patterns (extracted from common/defs.schema.yaml)
 * - Reference field names (extracted from all schemas)
 */

// ============================================================================
// DOCUMENT TYPES (discovered from schema files)
// ============================================================================

/**
 * Supported UBML document types.
 * Derived from: schemas/documents/*.document.yaml
 */
export const DOCUMENT_TYPES = [
  'actors',
  'entities',
  'glossary',
  'hypotheses',
  'links',
  'metrics',
  'mining',
  'process',
  'scenarios',
  'strategy',
  'views',
  'workspace'
] as const;

export type DocumentType = typeof DOCUMENT_TYPES[number];

/**
 * Check if a string is a valid document type.
 */
export function isDocumentType(type: string): type is DocumentType {
  return DOCUMENT_TYPES.includes(type as DocumentType);
}

// ============================================================================
// FRAGMENT NAMES (discovered from schema files)
// ============================================================================

/**
 * Available fragment schema names.
 * Derived from: schemas/fragments/*.fragment.yaml
 */
export const FRAGMENT_NAMES = [
  'actor',
  'entity',
  'hypothesis',
  'link',
  'metrics',
  'mining',
  'process',
  'resource',
  'scenario',
  'step',
  'strategy',
  'view'
] as const;

export type FragmentName = typeof FRAGMENT_NAMES[number];

// ============================================================================
// SCHEMA VERSION
// ============================================================================

/**
 * Current UBML schema version.
 */
export const SCHEMA_VERSION = '1.0';

// ============================================================================
// SCHEMA PATHS
// ============================================================================

/**
 * Schema file paths relative to the schemas directory.
 */
export const SCHEMA_PATHS = {
  root: 'ubml.schema.yaml',
  defs: 'common/defs.schema.yaml',
  documents: {
    actors: 'documents/actors.document.yaml',
    entities: 'documents/entities.document.yaml',
    glossary: 'documents/glossary.document.yaml',
    hypotheses: 'documents/hypotheses.document.yaml',
    links: 'documents/links.document.yaml',
    metrics: 'documents/metrics.document.yaml',
    mining: 'documents/mining.document.yaml',
    process: 'documents/process.document.yaml',
    scenarios: 'documents/scenarios.document.yaml',
    strategy: 'documents/strategy.document.yaml',
    views: 'documents/views.document.yaml',
    workspace: 'documents/workspace.document.yaml'
  } as const,
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
    view: 'fragments/view.fragment.yaml'
  } as const,
} as const;

/**
 * Get the schema path for a document type.
 */
export function getSchemaPathForDocumentType(type: DocumentType): string {
  return SCHEMA_PATHS.documents[type];
}

// ============================================================================
// ID PATTERNS (extracted from defs.schema.yaml)
// ============================================================================

/**
 * ID prefix to element type mapping.
 * Extracted from: schemas/common/defs.schema.yaml $defs/*Ref patterns
 */
export const ID_PREFIXES = {
  AC: 'actor',
  BK: 'block',
  CP: 'capability',
  DC: 'document',
  EN: 'entity',
  EQ: 'equipment',
  EV: 'evidence',
  HY: 'hypothesis',
  KP: 'kpi',
  LC: 'location',
  PD: 'product',
  PF: 'portfolio',
  PH: 'phase',
  PR: 'process',
  PS: 'persona',
  RP: 'resourcePool',
  SC: 'scenario',
  SK: 'skill',
  ST: 'step',
  SV: 'service',
  VS: 'valueStream',
  VW: 'view'
} as const;

export type IdPrefix = keyof typeof ID_PREFIXES;
export type ElementType = (typeof ID_PREFIXES)[IdPrefix];

/**
 * ID patterns for UBML elements (RegExp).
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
// REFERENCE FIELD NAMES (extracted from all schemas)
// ============================================================================

/**
 * Property names that contain ID references to other elements.
 * Extracted from: All properties in schemas that use $ref to *Ref types
 * 
 * These fields are checked during semantic validation to find cross-document references.
 */
export const REFERENCE_FIELDS = [
  'accountable',
  'actor',
  'approvedBy',
  'approvers',
  'baseScenario',
  'basedOn',
  'capabilities',
  'children',
  'compareScenario',
  'consulted',
  'customer',
  'endMilestone',
  'endsWith',
  'entity',
  'equipment',
  'from',
  'includeSteps',
  'informed',
  'kpis',
  'location',
  'notify',
  'owner',
  'parent',
  'party',
  'process',
  'processRef',
  'processes',
  'products',
  'recipients',
  'ref',
  'relatedEntity',
  'relatedProducts',
  'relatedServices',
  'relativeTo',
  'reportsTo',
  'represents',
  'requiredCapabilities',
  'requiredSkill',
  'responsible',
  'reviewers',
  'services',
  'skill',
  'skills',
  'source',
  'stakeholders',
  'startMilestone',
  'startsWith',
  'step',
  'steps',
  'systems',
  'target',
  'templateSource',
  'to',
  'valueStream'
] as const;

/**
 * Check if a property name is a known reference field.
 */
export function isReferenceField(fieldName: string): boolean {
  return REFERENCE_FIELDS.includes(fieldName as typeof REFERENCE_FIELDS[number]);
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
 */
export function detectDocumentTypeFromContent(content: unknown): DocumentType | undefined {
  if (!content || typeof content !== 'object') {
    return undefined;
  }
  
  const obj = content as Record<string, unknown>;
  
  // Check for type-specific root properties
  if ('processes' in obj) return 'process';
  if ('actors' in obj) return 'actors';
  if ('entities' in obj) return 'entities';
  if ('hypothesisTrees' in obj) return 'hypotheses';
  if ('kpis' in obj || 'metrics' in obj) return 'metrics';
  if ('scenarios' in obj) return 'scenarios';
  if ('valueStreams' in obj || 'capabilities' in obj) return 'strategy';
  if ('miningSources' in obj) return 'mining';
  if ('views' in obj) return 'views';
  if ('links' in obj && !('processes' in obj)) return 'links';
  if ('terms' in obj || 'glossary' in obj) return 'glossary';
  if ('organization' in obj || 'documents' in obj) return 'workspace';
  
  return undefined;
}

/**
 * Get all glob patterns for finding UBML files.
 * Includes both full pattern (*.type.ubml.yaml) and simple pattern (type.ubml.yaml).
 */
export function getUBMLFilePatterns(): string[] {
  const patterns: string[] = [];
  for (const type of DOCUMENT_TYPES) {
    patterns.push(`**/*.${type}.ubml.yaml`);  // Full pattern: prefix.type.ubml.yaml
    patterns.push(`**/${type}.ubml.yaml`);    // Simple pattern: type.ubml.yaml
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
