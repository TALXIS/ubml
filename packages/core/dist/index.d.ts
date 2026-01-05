import { DocumentType } from './generated/metadata.js';
export { ALL_ID_PATTERN, DOCUMENT_TYPES, DURATION_PATTERN, ElementType, FRAGMENT_NAMES, FragmentName, ID_PATTERNS, ID_PREFIXES, IdPrefix, REFERENCE_FIELDS, SCHEMA_PATHS, SCHEMA_VERSION, TIME_PATTERN, detectDocumentType, detectDocumentTypeFromContent, getElementTypeFromId, getSchemaPathForDocumentType, getSchemaPathForFileSuffix, getUBMLFilePatterns, isDocumentType, isReferenceField, isUBMLFile, isValidId, validateId } from './generated/metadata.js';

/**
 * UBML Parser (Browser-Safe)
 *
 * Provides YAML parsing with source location tracking for UBML documents.
 * Works in any JavaScript runtime (browser, Node.js, Deno, Bun).
 *
 * @module ubml
 */

/**
 * Source location information for error reporting.
 */
interface SourceLocation {
    /** Line number (1-indexed) */
    line: number;
    /** Column number (1-indexed) */
    column: number;
    /** Byte offset in file */
    offset?: number;
}
/**
 * A parse error with location information.
 */
interface ParseError {
    message: string;
    line?: number;
    column?: number;
    /** End position for range highlighting */
    endLine?: number;
    endColumn?: number;
}
/**
 * A parse warning.
 */
interface ParseWarning {
    message: string;
    line?: number;
    column?: number;
    endLine?: number;
    endColumn?: number;
}
/**
 * Document metadata extracted from UBML files.
 */
interface DocumentMeta {
    /** UBML version (e.g., "1.0") */
    version: string;
    /** Document type detected from filename or content */
    type: DocumentType | undefined;
    /** Original filename (if provided) */
    filename?: string;
}
/**
 * A parsed UBML document.
 */
interface UBMLDocument<T = unknown> {
    /** Parsed document content */
    content: T;
    /** Document metadata */
    meta: DocumentMeta;
    /** Original source string */
    source: string;
    /**
     * Get source location for a JSON path.
     *
     * @param path - JSON pointer path (e.g., "/processes/PR001/steps/ST001")
     * @returns Source location or undefined if path not found
     *
     * @example
     * ```typescript
     * const loc = document.getSourceLocation('/processes/PR001/name');
     * console.log(`Line ${loc?.line}, column ${loc?.column}`);
     * ```
     */
    getSourceLocation(path: string): SourceLocation | undefined;
}
/**
 * Result of parsing a UBML document.
 */
interface ParseResult<T = unknown> {
    /** Successfully parsed document, or undefined on error */
    document: UBMLDocument<T> | undefined;
    /** Parse errors, if any */
    errors: ParseError[];
    /** Parse warnings */
    warnings: ParseWarning[];
    /** Whether parsing succeeded (no errors) */
    ok: boolean;
}
/**
 * Parse UBML content from a string.
 * Works in any JavaScript runtime (browser, Node, Deno, Bun).
 *
 * @param content - YAML string to parse
 * @param filename - Optional filename for document type detection
 *
 * @example
 * ```typescript
 * import { parse } from 'ubml';
 *
 * const result = parse(yamlContent, 'my-process.process.ubml.yaml');
 * if (result.ok) {
 *   console.log(result.document.content);
 * } else {
 *   console.error(result.errors);
 * }
 * ```
 */
declare function parse<T = unknown>(content: string, filename?: string): ParseResult<T>;

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

/**
 * A validation error.
 */
interface ValidationError {
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
interface ValidationWarning {
    /** Warning message */
    message: string;
    /** JSON path to the warning location */
    path?: string;
    /** Warning code for programmatic handling */
    code?: string; /** File path (for cross-document warnings) */
    filepath?: string; /** Line number (1-indexed) */
    line?: number;
    /** Column number (1-indexed) */
    column?: number;
}
/**
 * Result of validating a document.
 */
interface ValidationResult {
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
interface Validator {
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
declare function createValidator(): Promise<Validator>;
/**
 * Get or create the default validator instance.
 */
declare function getValidator(): Promise<Validator>;
/**
 * Result of parsing and validating.
 */
interface ParseAndValidateResult<T = unknown> extends ParseResult<T> {
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
declare function parseAndValidate<T = unknown>(content: string, filename?: string): Promise<ParseAndValidateResult<T>>;
/**
 * Options for validating multiple documents.
 */
interface ValidateOptions {
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
declare function validate(documents: UBMLDocument[], options?: ValidateOptions): Promise<ValidationResult>;

/**
 * Browser-safe semantic validation (cross-document references).
 *
 * This module provides the core validation logic without file system dependencies.
 * For file system operations, use the Node.js version in `node/semantic-validator.ts`.
 */

/**
 * Validation error for reference issues.
 */
interface ReferenceError {
    /** Error message */
    message: string;
    /** File path where error occurred */
    filepath: string;
    /** JSON path to the error location */
    path?: string;
    /** Error code */
    code?: string;
}
/**
 * Validation warning for reference issues.
 */
interface ReferenceWarning {
    /** Warning message */
    message: string;
    /** File path where warning occurred */
    filepath: string;
    /** JSON path to the warning location */
    path?: string;
    /** Warning code */
    code?: string;
    /** Line number (1-indexed) */
    line?: number;
    /** Column number (1-indexed) */
    column?: number;
}
/**
 * Result of reference validation.
 */
interface ReferenceValidationResult {
    /** Whether all references are valid */
    valid: boolean;
    /** Validation errors for broken references */
    errors: ReferenceError[];
    /** Validation warnings */
    warnings: ReferenceWarning[];
    /** All defined IDs in the workspace */
    definedIds: Map<string, {
        filepath: string;
        path: string;
    }>;
    /** All referenced IDs in the workspace */
    referencedIds: Map<string, string[]>;
}
/**
 * Options for reference validation.
 */
interface ReferenceValidateOptions {
    /** Suppress unused-id warnings (useful for catalog documents like entities, actors, metrics) */
    suppressUnusedWarnings?: boolean;
}
/**
 * Extract all defined IDs from a document.
 */
declare function extractDefinedIds(content: unknown, filepath: string, path?: string): Map<string, {
    filepath: string;
    path: string;
}>;
/**
 * Extract all referenced IDs from a document.
 */
declare function extractReferencedIds(content: unknown, filepath: string, path?: string): Map<string, {
    filepath: string;
    path: string;
}[]>;
/**
 * Validate cross-document references in a collection of pre-parsed documents.
 *
 * This is the browser-safe version that accepts documents directly instead of reading from disk.
 *
 * @param documents - Array of parsed UBML documents
 * @param options - Validation options
 *
 * @example
 * ```typescript
 * import { parse } from 'ubml';
 * import { validateDocuments } from 'ubml';
 *
 * const doc1 = parse(yaml1, 'actors.actors.ubml.yaml');
 * const doc2 = parse(yaml2, 'process.process.ubml.yaml');
 *
 * const result = validateDocuments([doc1.document!, doc2.document!]);
 * if (!result.valid) {
 *   console.error('Reference errors:', result.errors);
 * }
 * ```
 */
declare function validateDocuments(documents: UBMLDocument[], options?: ReferenceValidateOptions): ReferenceValidationResult;
/**
 * Document type multiplicity rules.
 * Defines how many files of each type are expected/allowed in a workspace.
 */
declare const DOCUMENT_MULTIPLICITY: Record<DocumentType, 'singleton' | 'catalog' | 'multiple'>;
/**
 * Get the multiplicity rule for a document type.
 */
declare function getDocumentMultiplicity(type: DocumentType): 'singleton' | 'catalog' | 'multiple';
/**
 * Workspace validation warning.
 */
interface WorkspaceWarning {
    /** Warning message */
    message: string;
    /** Warning code */
    code: string;
    /** Related files */
    files?: string[];
    /** Suggestion for fixing */
    suggestion?: string;
}
/**
 * Workspace validation result.
 */
interface WorkspaceValidationResult {
    /** Whether workspace structure is valid */
    valid: boolean;
    /** Warnings about workspace structure */
    warnings: WorkspaceWarning[];
    /** Document types found in workspace */
    documentTypes: Map<DocumentType, string[]>;
}
/**
 * Validate workspace structure and conventions.
 *
 * Checks for:
 * - Missing workspace file
 * - Multiple singleton documents (workspace, glossary, strategy)
 * - Missing recommended documents (actors, entities for process files)
 * - Naming consistency hints
 *
 * @param documents - Array of parsed UBML documents
 */
declare function validateWorkspaceStructure(documents: UBMLDocument[]): WorkspaceValidationResult;

/**
 * UBML Serializer (Browser-Safe)
 *
 * Provides YAML serialization with consistent formatting.
 * Works in any JavaScript runtime (browser, Node.js, Deno, Bun).
 *
 * @module ubml
 */
/**
 * Options for YAML serialization.
 */
interface SerializeOptions {
    /** Indentation spaces (default: 2) */
    indent?: number;
    /** Line width before wrapping (default: 120) */
    lineWidth?: number;
    /** Whether to use flow style for short arrays/objects */
    flowLevel?: number;
    /** Whether to add a final newline (default: true) */
    trailingNewline?: boolean;
    /** Whether to sort keys alphabetically (default: false) */
    sortKeys?: boolean;
    /** Quote style for strings: 'single' | 'double' | null (default: null = unquoted where possible) */
    quoteStyle?: 'single' | 'double' | null;
}
/**
 * Serialize a JavaScript object to a YAML string.
 *
 * @param content - The object to serialize
 * @param options - Serialization options
 *
 * @example
 * ```typescript
 * import { serialize } from 'ubml';
 *
 * const yaml = serialize({
 *   ubml: '1.0',
 *   processes: {
 *     PR001: { name: 'My Process' }
 *   }
 * });
 * ```
 */
declare function serialize(content: unknown, options?: SerializeOptions): string;

/**
 * UBML Schema Provider (Browser-Safe)
 *
 * Simple, unified API for accessing UBML schemas.
 * Works in both browser and Node.js environments.
 *
 * @module ubml
 *
 * @example
 * ```typescript
 * import { schemas } from 'ubml';
 *
 * // Get a document schema
 * const processSchema = schemas.document('process');
 *
 * // Get all schemas for Ajv
 * const allSchemas = schemas.all();
 * ```
 */

/**
 * JSON Schema type for convenience.
 * Contains standard JSON Schema properties used by UBML.
 */
type JSONSchema = Record<string, unknown> & {
    $schema?: string;
    $id?: string;
    title?: string;
    description?: string;
};
/**
 * Schema access API.
 *
 * All schemas are bundled at build time, so no file system access is required.
 * This works in browsers, Node.js, and any JavaScript runtime.
 */
declare const schemas: {
    /**
     * UBML schema version.
     */
    readonly version: "1.0";
    /**
     * Get a document schema by type.
     *
     * @example
     * ```typescript
     * const schema = schemas.document('process');
     * const actorsSchema = schemas.document('actors');
     * ```
     */
    readonly document: (type: DocumentType) => JSONSchema;
    /**
     * Get a fragment schema by name.
     *
     * @example
     * ```typescript
     * const stepSchema = schemas.fragment('step');
     * ```
     */
    readonly fragment: (name: string) => JSONSchema;
    /**
     * Get the root UBML schema.
     */
    readonly root: () => JSONSchema;
    /**
     * Get the common definitions schema.
     */
    readonly defs: () => JSONSchema;
    /**
     * Get all schemas as a Map keyed by $id.
     *
     * Useful for configuring Ajv's loadSchema callback.
     *
     * @example
     * ```typescript
     * const allSchemas = schemas.all();
     * const ajv = new Ajv({
     *   loadSchema: async (uri) => allSchemas.get(uri),
     * });
     * ```
     */
    readonly all: () => Map<string, JSONSchema>;
    /**
     * List all available document types.
     */
    readonly documentTypes: () => readonly DocumentType[];
    /**
     * List all available fragment names.
     */
    readonly fragmentNames: () => readonly string[];
};

/**
 * UBML TypeScript Types
 *
 * AUTO-GENERATED FILE - DO NOT EDIT
 * Run: npm run generate
 *
 * These types are generated from the YAML schemas in /schemas.
 * They provide type-safe access to UBML document structures.
 *
 * @module ubml/types
 */
/** ActorRef (AC### pattern) */
type ActorRef = string & {
    readonly __brand: 'ActorRef';
};
/** BlockRef (BK### pattern) */
type BlockRef = string & {
    readonly __brand: 'BlockRef';
};
/** CapabilityRef (CP### pattern) */
type CapabilityRef = string & {
    readonly __brand: 'CapabilityRef';
};
/** DocumentRef (DC### pattern) */
type DocumentRef = string & {
    readonly __brand: 'DocumentRef';
};
/** EntityRef (EN### pattern) */
type EntityRef = string & {
    readonly __brand: 'EntityRef';
};
/** EquipmentRef (EQ### pattern) */
type EquipmentRef = string & {
    readonly __brand: 'EquipmentRef';
};
/** EvidenceRef (EV### pattern) */
type EvidenceRef = string & {
    readonly __brand: 'EvidenceRef';
};
/** HypothesisRef (HY### pattern) */
type HypothesisRef = string & {
    readonly __brand: 'HypothesisRef';
};
/** KpiRef (KP### pattern) */
type KpiRef = string & {
    readonly __brand: 'KpiRef';
};
/** LocationRef (LC### pattern) */
type LocationRef = string & {
    readonly __brand: 'LocationRef';
};
/** ProductRef (PD### pattern) */
type ProductRef = string & {
    readonly __brand: 'ProductRef';
};
/** PortfolioRef (PF### pattern) */
type PortfolioRef = string & {
    readonly __brand: 'PortfolioRef';
};
/** PhaseRef (PH### pattern) */
type PhaseRef = string & {
    readonly __brand: 'PhaseRef';
};
/** ProcessRef (PR### pattern) */
type ProcessRef = string & {
    readonly __brand: 'ProcessRef';
};
/** PersonaRef (PS### pattern) */
type PersonaRef = string & {
    readonly __brand: 'PersonaRef';
};
/** ResourcePoolRef (RP### pattern) */
type ResourcePoolRef = string & {
    readonly __brand: 'ResourcePoolRef';
};
/** ScenarioRef (SC### pattern) */
type ScenarioRef = string & {
    readonly __brand: 'ScenarioRef';
};
/** SkillRef (SK### pattern) */
type SkillRef = string & {
    readonly __brand: 'SkillRef';
};
/** StepRef (ST### pattern) */
type StepRef = string & {
    readonly __brand: 'StepRef';
};
/** ServiceRef (SV### pattern) */
type ServiceRef = string & {
    readonly __brand: 'ServiceRef';
};
/** ValueStreamRef (VS### pattern) */
type ValueStreamRef = string & {
    readonly __brand: 'ValueStreamRef';
};
/** ViewRef (VW### pattern) */
type ViewRef = string & {
    readonly __brand: 'ViewRef';
};
/** Helper to create typed references */
declare function createRef<T extends string>(id: string): T;
/** Duration string (e.g., "2h", "30min", "1.5d") */
type Duration = string;
/** Time string in HH:MM format */
type Time = string;
/** Money amount (e.g., "$100", "100 USD") */
type Money = string;
/** Date string in ISO format */
type ISODate = string;
/** DateTime string in ISO format */
type ISODateTime = string;
/** Rate expression (e.g., "10/h", "100/wk") */
type Rate = string;
/** Custom fields object */
type CustomFields = Record<string, unknown>;
type ActorType = 'person' | 'role' | 'team' | 'system' | 'organization' | 'external' | 'customer';
type ActorKind = 'human' | 'org' | 'system';
interface Actor {
    name: string;
    type: ActorType;
    kind: ActorKind;
    description?: string;
    isExternal?: boolean;
    skills?: SkillRef[];
    reportingTo?: ActorRef;
    members?: ActorRef[];
    contact?: ContactInfo;
    custom?: CustomFields;
}
interface ContactInfo {
    email?: string;
    phone?: string;
    location?: string;
}
type ProcessLevel = 1 | 2 | 3 | 4;
type ProcessStatus = 'draft' | 'review' | 'approved' | 'deprecated';
interface Process {
    id: string;
    name: string;
    description?: string;
    level?: ProcessLevel;
    status?: ProcessStatus;
    owner?: ActorRef;
    steps?: Record<string, Step>;
    links?: Link[];
    phases?: Record<string, Phase>;
    triggers?: ProcessTrigger[];
    custom?: CustomFields;
}
type StepKind = 'task' | 'event' | 'gateway' | 'milestone' | 'subprocess' | 'block';
type GatewayType = 'exclusive' | 'parallel' | 'inclusive' | 'event';
type BlockOperator = 'par' | 'alt' | 'loop' | 'opt';
interface Step {
    name: string;
    kind: StepKind;
    description?: string;
    responsible?: ActorRef;
    accountable?: ActorRef;
    duration?: Duration;
    cost?: Money;
    inputs?: DataFlow[];
    outputs?: DataFlow[];
    raci?: RACI;
    gatewayType?: GatewayType;
    conditions?: GatewayCondition[];
    operator?: BlockOperator;
    children?: StepRef[];
    subprocess?: ProcessRef;
    custom?: CustomFields;
}
interface DataFlow {
    ref: EntityRef | DocumentRef;
    name?: string;
    description?: string;
}
interface RACI {
    responsible?: ActorRef[];
    accountable?: ActorRef[];
    consulted?: ActorRef[];
    informed?: ActorRef[];
}
interface GatewayCondition {
    to: StepRef;
    condition?: string;
    probability?: number;
    isDefault?: boolean;
}
type LinkType = 'sequence' | 'message' | 'signal' | 'timer' | 'conditional' | 'default';
interface Link {
    from: StepRef;
    to: StepRef;
    type?: LinkType;
    condition?: string;
    label?: string;
    probability?: number;
}
type PhaseKind = 'lifecycle' | 'delivery';
interface Phase {
    name: string;
    kind: PhaseKind;
    description?: string;
    entryCriteria?: string;
    exitCriteria?: string;
    startMilestone?: StepRef;
    endMilestone?: StepRef;
    includeSteps?: StepRef[];
}
interface ProcessTrigger {
    name: string;
    type: 'event' | 'schedule' | 'message' | 'signal';
    source?: ProcessRef | ActorRef;
    schedule?: string;
    description?: string;
}
type EntityType = 'master' | 'transactional' | 'reference' | 'document';
interface Entity {
    name: string;
    type?: EntityType;
    description?: string;
    attributes?: Record<string, Attribute>;
    relationships?: Relationship[];
    custom?: CustomFields;
}
interface Attribute {
    name: string;
    type: string;
    description?: string;
    required?: boolean;
    unique?: boolean;
}
interface Relationship {
    target: EntityRef;
    type: 'one-to-one' | 'one-to-many' | 'many-to-many';
    name?: string;
    description?: string;
}
type HypothesisType = 'root' | 'supporting' | 'assumption';
type HypothesisStatus = 'untested' | 'testing' | 'validated' | 'invalidated';
interface HypothesisTree {
    name: string;
    scqh: SCQH;
    hypotheses?: Record<string, Hypothesis>;
    evidence?: Record<string, Evidence>;
    custom?: CustomFields;
}
interface SCQH {
    situation: string;
    complication: string;
    question: string;
    hypothesis: string;
}
interface Hypothesis {
    name: string;
    type: HypothesisType;
    description?: string;
    status?: HypothesisStatus;
    children?: HypothesisRef[];
    evidence?: string[];
}
interface Evidence {
    type: 'observation' | 'data' | 'interview' | 'document' | 'analysis';
    title: string;
    description?: string;
    source?: string;
    linkedHypotheses?: HypothesisRef[];
}
interface BaseDocument {
    ubml: '1.0';
    name?: string;
    description?: string;
    metadata?: DocumentMetadata;
    tags?: string[];
    custom?: CustomFields;
}
interface DocumentMetadata {
    createdAt?: ISODateTime;
    createdBy?: string;
    updatedAt?: ISODateTime;
    updatedBy?: string;
}
interface ProcessDocument extends BaseDocument {
    processes: Record<string, Process>;
}
interface ActorsDocument extends BaseDocument {
    actors?: Record<string, Actor>;
    skills?: Record<string, Skill>;
    resourcePools?: Record<string, ResourcePool>;
}
interface EntitiesDocument extends BaseDocument {
    entities?: Record<string, Entity>;
    documents?: Record<string, DocumentDef>;
    locations?: Record<string, Location>;
}
interface WorkspaceDocument extends BaseDocument {
    organization?: Organization;
    scope?: Scope;
    settings?: WorkspaceSettings;
    documents?: string[];
}
interface HypothesesDocument extends BaseDocument {
    hypothesisTrees?: Record<string, HypothesisTree>;
}
interface ScenariosDocument extends BaseDocument {
    scenarios?: Record<string, Scenario>;
}
interface StrategyDocument extends BaseDocument {
    valueStreams?: Record<string, ValueStream>;
    capabilities?: Record<string, Capability>;
    portfolios?: Record<string, Portfolio>;
}
interface MetricsDocument extends BaseDocument {
    kpis?: Record<string, KPI>;
    roiAnalyses?: Record<string, ROIAnalysis>;
}
interface MiningDocument extends BaseDocument {
    miningSources?: Record<string, MiningSource>;
}
interface ViewsDocument extends BaseDocument {
    views?: Record<string, View>;
}
interface LinksDocument extends BaseDocument {
    links?: ExternalLink[];
}
interface GlossaryDocument extends BaseDocument {
    terms?: Record<string, Term>;
}
interface Skill {
    name: string;
    description?: string;
    category?: string;
}
interface ResourcePool {
    name: string;
    members?: ActorRef[];
    capacity?: number;
    skills?: SkillRef[];
}
interface DocumentDef {
    name: string;
    description?: string;
    entity?: EntityRef;
    format?: string;
}
interface Location {
    name: string;
    description?: string;
    address?: string;
    type?: string;
}
interface Organization {
    name: string;
    department?: string;
    description?: string;
}
interface Scope {
    inScope?: string[];
    outOfScope?: string[];
    assumptions?: string[];
    constraints?: string[];
}
interface WorkspaceSettings {
    defaultCurrency?: string;
    defaultTimezone?: string;
    workingHoursPerDay?: number;
    workingDaysPerWeek?: number;
}
interface Scenario {
    name: string;
    description?: string;
    parameters?: Record<string, unknown>;
}
interface ValueStream {
    name: string;
    description?: string;
    stages?: string[];
}
interface Capability {
    name: string;
    description?: string;
    level?: number;
}
interface Portfolio {
    name: string;
    description?: string;
    products?: ProductRef[];
    services?: ServiceRef[];
}
interface KPI {
    name: string;
    description?: string;
    unit?: string;
    target?: number;
    current?: number;
}
interface ROIAnalysis {
    name: string;
    description?: string;
    costs?: Money;
    benefits?: Money;
}
interface MiningSource {
    name: string;
    type: string;
    description?: string;
}
interface View {
    name: string;
    description?: string;
    type: string;
    elements?: string[];
}
interface ExternalLink {
    url: string;
    title?: string;
    description?: string;
}
interface Term {
    name: string;
    definition: string;
    synonyms?: string[];
    related?: string[];
}
type UBMLDocumentContent = ProcessDocument | ActorsDocument | EntitiesDocument | WorkspaceDocument | HypothesesDocument | ScenariosDocument | StrategyDocument | MetricsDocument | MiningDocument | ViewsDocument | LinksDocument | GlossaryDocument;

/**
 * Constants for UBML package.
 */
/**
 * UBML package version.
 */
declare const VERSION = "1.0.0";
/**
 * Package name.
 */
declare const PACKAGE_NAME = "ubml";
/**
 * Package repository URL.
 */
declare const REPOSITORY_URL = "https://github.com/TALXIS/ubml";

export { type Actor, type ActorKind, type ActorRef, type ActorType, type ActorsDocument, type Attribute, type BaseDocument, type BlockOperator, type BlockRef, type Capability, type CapabilityRef, type ContactInfo, type CustomFields, DOCUMENT_MULTIPLICITY, type DataFlow, type DocumentDef, type DocumentMeta, type DocumentMetadata, type DocumentRef, DocumentType, type Duration, type EntitiesDocument, type Entity, type EntityRef, type EntityType, type EquipmentRef, type Evidence, type EvidenceRef, type ExternalLink, type GatewayCondition, type GatewayType, type GlossaryDocument, type HypothesesDocument, type Hypothesis, type HypothesisRef, type HypothesisStatus, type HypothesisTree, type HypothesisType, type ISODate, type ISODateTime, type JSONSchema, type KPI, type KpiRef, type Link, type LinkType, type LinksDocument, type Location, type LocationRef, type MetricsDocument, type MiningDocument, type MiningSource, type Money, type Organization, PACKAGE_NAME, type ParseAndValidateResult, type ParseError, type ParseResult, type ParseWarning, type PersonaRef, type Phase, type PhaseKind, type PhaseRef, type Portfolio, type PortfolioRef, type Process, type ProcessDocument, type ProcessLevel, type ProcessRef, type ProcessStatus, type ProcessTrigger, type ProductRef, type RACI, REPOSITORY_URL, type ROIAnalysis, type Rate, type ReferenceError, type ReferenceValidateOptions, type ReferenceValidationResult, type ReferenceWarning, type Relationship, type ResourcePool, type ResourcePoolRef, type SCQH, type Scenario, type ScenarioRef, type ScenariosDocument, type Scope, type SerializeOptions, type ServiceRef, type Skill, type SkillRef, type SourceLocation, type Step, type StepKind, type StepRef, type StrategyDocument, type Term, type Time, type UBMLDocument, type UBMLDocumentContent, VERSION, type ValidateOptions, type ValidationError, type ValidationResult, type ValidationWarning, type Validator, type ValueStream, type ValueStreamRef, type View, type ViewRef, type ViewsDocument, type WorkspaceDocument, type WorkspaceSettings, type WorkspaceValidationResult as WorkspaceStructureResult, type WorkspaceWarning, createRef, createValidator, extractDefinedIds, extractReferencedIds, getDocumentMultiplicity, getValidator, parse, parseAndValidate, schemas, serialize, validate, validateDocuments, validateWorkspaceStructure };
