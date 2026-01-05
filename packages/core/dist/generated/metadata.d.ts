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
/**
 * Supported UBML document types.
 * Derived from: schemas/documents/*.document.yaml
 */
declare const DOCUMENT_TYPES: readonly ["actors", "entities", "glossary", "hypotheses", "links", "metrics", "mining", "process", "scenarios", "strategy", "views", "workspace"];
type DocumentType = typeof DOCUMENT_TYPES[number];
/**
 * Check if a string is a valid document type.
 */
declare function isDocumentType(type: string): type is DocumentType;
/**
 * Available fragment schema names.
 * Derived from: schemas/fragments/*.fragment.yaml
 */
declare const FRAGMENT_NAMES: readonly ["actor", "entity", "hypothesis", "link", "metrics", "mining", "process", "resource", "scenario", "step", "strategy", "view"];
type FragmentName = typeof FRAGMENT_NAMES[number];
/**
 * Current UBML schema version.
 */
declare const SCHEMA_VERSION = "1.0";
/**
 * Schema file paths relative to the schemas directory.
 */
declare const SCHEMA_PATHS: {
    readonly root: "ubml.schema.yaml";
    readonly defs: "common/defs.schema.yaml";
    readonly documents: {
        readonly actors: "documents/actors.document.yaml";
        readonly entities: "documents/entities.document.yaml";
        readonly glossary: "documents/glossary.document.yaml";
        readonly hypotheses: "documents/hypotheses.document.yaml";
        readonly links: "documents/links.document.yaml";
        readonly metrics: "documents/metrics.document.yaml";
        readonly mining: "documents/mining.document.yaml";
        readonly process: "documents/process.document.yaml";
        readonly scenarios: "documents/scenarios.document.yaml";
        readonly strategy: "documents/strategy.document.yaml";
        readonly views: "documents/views.document.yaml";
        readonly workspace: "documents/workspace.document.yaml";
    };
    readonly fragments: {
        readonly actor: "fragments/actor.fragment.yaml";
        readonly entity: "fragments/entity.fragment.yaml";
        readonly hypothesis: "fragments/hypothesis.fragment.yaml";
        readonly link: "fragments/link.fragment.yaml";
        readonly metrics: "fragments/metrics.fragment.yaml";
        readonly mining: "fragments/mining.fragment.yaml";
        readonly process: "fragments/process.fragment.yaml";
        readonly resource: "fragments/resource.fragment.yaml";
        readonly scenario: "fragments/scenario.fragment.yaml";
        readonly step: "fragments/step.fragment.yaml";
        readonly strategy: "fragments/strategy.fragment.yaml";
        readonly view: "fragments/view.fragment.yaml";
    };
};
/**
 * Get the schema path for a document type.
 */
declare function getSchemaPathForDocumentType(type: DocumentType): string;
/**
 * ID prefix to element type mapping.
 * Extracted from: schemas/common/defs.schema.yaml $defs/*Ref patterns
 */
declare const ID_PREFIXES: {
    readonly AC: "actor";
    readonly BK: "block";
    readonly CP: "capability";
    readonly DC: "document";
    readonly EN: "entity";
    readonly EQ: "equipment";
    readonly EV: "evidence";
    readonly HY: "hypothesis";
    readonly KP: "kpi";
    readonly LC: "location";
    readonly PD: "product";
    readonly PF: "portfolio";
    readonly PH: "phase";
    readonly PR: "process";
    readonly PS: "persona";
    readonly RP: "resourcePool";
    readonly SC: "scenario";
    readonly SK: "skill";
    readonly ST: "step";
    readonly SV: "service";
    readonly VS: "valueStream";
    readonly VW: "view";
};
type IdPrefix = keyof typeof ID_PREFIXES;
type ElementType = (typeof ID_PREFIXES)[IdPrefix];
/**
 * ID patterns for UBML elements (RegExp).
 */
declare const ID_PATTERNS: Record<ElementType, RegExp>;
/**
 * Combined pattern matching any valid UBML ID.
 */
declare const ALL_ID_PATTERN: RegExp;
/**
 * Validate an ID against its expected pattern.
 */
declare function validateId(type: ElementType, id: string): boolean;
/**
 * Check if a string is a valid UBML ID of any type.
 */
declare function isValidId(id: string): boolean;
/**
 * Get the element type from an ID.
 */
declare function getElementTypeFromId(id: string): ElementType | undefined;
/**
 * Property names that contain ID references to other elements.
 * Extracted from: All properties in schemas that use $ref to *Ref types
 *
 * These fields are checked during semantic validation to find cross-document references.
 */
declare const REFERENCE_FIELDS: readonly ["accountable", "actor", "approvedBy", "approvers", "baseScenario", "basedOn", "capabilities", "children", "compareScenario", "consulted", "customer", "endMilestone", "endsWith", "entity", "equipment", "from", "includeSteps", "informed", "kpis", "location", "notify", "owner", "parent", "party", "process", "processRef", "processes", "products", "recipients", "ref", "relatedEntity", "relatedProducts", "relatedServices", "relativeTo", "reportsTo", "represents", "requiredCapabilities", "requiredSkill", "responsible", "reviewers", "services", "skill", "skills", "source", "stakeholders", "startMilestone", "startsWith", "step", "steps", "systems", "target", "templateSource", "to", "valueStream"];
/**
 * Check if a property name is a known reference field.
 */
declare function isReferenceField(fieldName: string): boolean;
/**
 * Duration pattern for validation.
 * Matches: 2d, 4h, 30min, 1.5wk, etc.
 */
declare const DURATION_PATTERN: RegExp;
/**
 * Time pattern for validation (HH:MM format).
 */
declare const TIME_PATTERN: RegExp;
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
declare function detectDocumentType(filename: string): DocumentType | undefined;
/**
 * Detect document type from parsed content by examining properties.
 * Useful for generic .ubml.yaml files without type in filename.
 */
declare function detectDocumentTypeFromContent(content: unknown): DocumentType | undefined;
/**
 * Get all glob patterns for finding UBML files.
 * Includes both full pattern (*.type.ubml.yaml) and simple pattern (type.ubml.yaml).
 */
declare function getUBMLFilePatterns(): string[];
/**
 * Check if a filename is a valid UBML file.
 */
declare function isUBMLFile(filename: string): boolean;
/**
 * Get the schema path for a file based on its suffix.
 * Supports both full pattern (*.type.ubml.yaml) and simple pattern (type.ubml.yaml).
 */
declare function getSchemaPathForFileSuffix(filepath: string): string | undefined;

export { ALL_ID_PATTERN, DOCUMENT_TYPES, DURATION_PATTERN, type DocumentType, type ElementType, FRAGMENT_NAMES, type FragmentName, ID_PATTERNS, ID_PREFIXES, type IdPrefix, REFERENCE_FIELDS, SCHEMA_PATHS, SCHEMA_VERSION, TIME_PATTERN, detectDocumentType, detectDocumentTypeFromContent, getElementTypeFromId, getSchemaPathForDocumentType, getSchemaPathForFileSuffix, getUBMLFilePatterns, isDocumentType, isReferenceField, isUBMLFile, isValidId, validateId };
