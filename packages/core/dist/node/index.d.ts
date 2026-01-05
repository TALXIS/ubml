import { ParseResult, SerializeOptions, ValidationError, ValidationWarning, WorkspaceWarning } from '../index.js';
export { Actor, ActorKind, ActorRef, ActorType, ActorsDocument, Attribute, BaseDocument, BlockOperator, BlockRef, Capability, CapabilityRef, ContactInfo, CustomFields, DOCUMENT_MULTIPLICITY, DataFlow, DocumentDef, DocumentMeta, DocumentMetadata, DocumentRef, Duration, EntitiesDocument, Entity, EntityRef, EntityType, EquipmentRef, Evidence, EvidenceRef, ExternalLink, GatewayCondition, GatewayType, GlossaryDocument, HypothesesDocument, Hypothesis, HypothesisRef, HypothesisStatus, HypothesisTree, HypothesisType, ISODate, ISODateTime, JSONSchema, KPI, KpiRef, Link, LinkType, LinksDocument, Location, LocationRef, MetricsDocument, MiningDocument, MiningSource, Money, Organization, PACKAGE_NAME, ParseAndValidateResult, ParseError, ParseWarning, PersonaRef, Phase, PhaseKind, PhaseRef, Portfolio, PortfolioRef, Process, ProcessDocument, ProcessLevel, ProcessRef, ProcessStatus, ProcessTrigger, ProductRef, RACI, REPOSITORY_URL, ROIAnalysis, Rate, ReferenceError, ReferenceValidateOptions, ReferenceValidationResult, ReferenceWarning, Relationship, ResourcePool, ResourcePoolRef, SCQH, Scenario, ScenarioRef, ScenariosDocument, Scope, ServiceRef, Skill, SkillRef, SourceLocation, Step, StepKind, StepRef, StrategyDocument, Term, Time, UBMLDocument, UBMLDocumentContent, VERSION, ValidationResult, Validator, ValueStream, ValueStreamRef, View, ViewRef, ViewsDocument, WorkspaceDocument, WorkspaceSettings, WorkspaceStructureResult, createRef, createValidator, extractDefinedIds, extractReferencedIds, getDocumentMultiplicity, getValidator, parse, parseAndValidate, schemas, serialize, validate, validateDocuments, validateWorkspaceStructure } from '../index.js';
import { DocumentType } from '../generated/metadata.js';
export { ALL_ID_PATTERN, DOCUMENT_TYPES, DURATION_PATTERN, ElementType, FRAGMENT_NAMES, FragmentName, ID_PATTERNS, ID_PREFIXES, IdPrefix, REFERENCE_FIELDS, SCHEMA_PATHS, SCHEMA_VERSION, TIME_PATTERN, detectDocumentType, detectDocumentTypeFromContent, getElementTypeFromId, getSchemaPathForDocumentType, getSchemaPathForFileSuffix, getUBMLFilePatterns, isDocumentType, isReferenceField, isUBMLFile, isValidId, validateId } from '../generated/metadata.js';

/**
 * File system abstraction for UBML.
 *
 * Provides an interface that can be implemented for different environments
 * (Node.js, browsers with virtual FS, etc.).
 */
/**
 * Abstract file system interface.
 * Implement this to use UBML with virtual file systems in web apps.
 */
interface FileSystem {
    /**
     * Read a file's contents as UTF-8 string.
     */
    readFile(path: string): Promise<string>;
    /**
     * Write content to a file as UTF-8.
     */
    writeFile(path: string, content: string): Promise<void>;
    /**
     * Find files matching a glob pattern.
     */
    glob(pattern: string, options?: {
        cwd?: string;
    }): Promise<string[]>;
    /**
     * Check if a file or directory exists.
     */
    exists(path: string): Promise<boolean>;
}
/**
 * Create a Node.js file system implementation.
 */
declare function createNodeFS(): FileSystem;
/**
 * Default Node.js file system implementation.
 */
declare const nodeFS: FileSystem;

/**
 * UBML File Parser (Node.js)
 *
 * File system operations for parsing UBML documents.
 */

/**
 * Options for parsing a file.
 */
interface ParseFileOptions {
    /** Custom file system implementation */
    fs?: FileSystem;
}
/**
 * Parse a UBML file from disk.
 *
 * @param path - Path to the UBML file
 * @param options - Parse options
 *
 * @example
 * ```typescript
 * import { parseFile } from 'ubml/node';
 *
 * const result = await parseFile('./process.ubml.yaml');
 * if (result.ok) {
 *   console.log(result.document.content);
 * }
 * ```
 */
declare function parseFile<T = unknown>(path: string, options?: ParseFileOptions): Promise<ParseResult<T>>;

/**
 * UBML File Serializer (Node.js)
 *
 * File system operations for serializing UBML documents.
 */

/**
 * Options for serializing to a file.
 */
interface SerializeToFileOptions extends SerializeOptions {
    /** Custom file system implementation */
    fs?: FileSystem;
    /** Create parent directories if they don't exist (default: true) */
    createDirs?: boolean;
}
/**
 * Serialize and write a UBML document to a file.
 *
 * @param content - The content to serialize
 * @param path - Path to write to
 * @param options - Serialization options
 *
 * @example
 * ```typescript
 * import { serializeToFile } from 'ubml/node';
 *
 * await serializeToFile({
 *   ubml: '1.0',
 *   processes: { PR001: { name: 'My Process' } }
 * }, './output.process.ubml.yaml');
 * ```
 */
declare function serializeToFile(content: unknown, path: string, options?: SerializeToFileOptions): Promise<void>;

/**
 * UBML File Validator (Node.js)
 *
 * File system operations for validating UBML documents.
 */

/**
 * Validation error with file location.
 */
interface FileValidationError extends ValidationError {
    /** File path where error occurred */
    filepath: string;
    /** Line number (1-indexed) */
    line?: number;
    /** Column number (1-indexed) */
    column?: number;
}
/**
 * Validation warning with file location.
 */
interface FileValidationWarning extends ValidationWarning {
    /** File path where warning occurred */
    filepath: string;
    /** Line number (1-indexed) */
    line?: number;
    /** Column number (1-indexed) */
    column?: number;
}
/**
 * Result of validating a single file.
 */
interface FileValidationResult {
    /** File path that was validated */
    path: string;
    /** Whether validation passed */
    valid: boolean;
    /** Detected document type */
    documentType: DocumentType | undefined;
    /** Validation errors with file locations */
    errors: FileValidationError[];
    /** Validation warnings with file locations */
    warnings: FileValidationWarning[];
}
/**
 * Result of validating a workspace.
 */
interface WorkspaceValidationResult {
    /** Whether all files validated successfully */
    valid: boolean;
    /** Validation results for each file */
    files: FileValidationResult[];
    /** Total error count */
    errorCount: number;
    /** Total warning count */
    warningCount: number;
    /** Number of files validated */
    fileCount: number;
    /** Workspace file used (if any) */
    workspaceFile?: string;
    /** Workspace structure warnings */
    structureWarnings: WorkspaceWarning[];
}
/**
 * Options for validation.
 */
interface ValidateOptions {
    /** Custom file system implementation */
    fs?: FileSystem;
    /** Explicit list of files to validate (overrides workspace file) */
    files?: string[];
    /** Glob patterns to exclude */
    exclude?: string[];
    /** Suppress unused-id warnings (useful for catalog documents) */
    suppressUnusedWarnings?: boolean;
}
/**
 * Validate a single UBML file.
 *
 * @param path - Path to the file to validate
 * @param options - Validation options
 *
 * @example
 * ```typescript
 * import { validateFile } from 'ubml/node';
 *
 * const result = await validateFile('./process.ubml.yaml');
 * if (!result.valid) {
 *   console.error(result.errors);
 * }
 * ```
 */
declare function validateFile(path: string, options?: ValidateOptions): Promise<FileValidationResult>;
/**
 * Validate all UBML documents in a workspace directory.
 *
 * If a workspace file exists with a `documents` array, those files are validated.
 * Otherwise, all *.{type}.ubml.yaml files are discovered and validated.
 *
 * @param dir - Directory to validate
 * @param options - Validation options
 *
 * @example
 * ```typescript
 * import { validateWorkspace } from 'ubml/node';
 *
 * const result = await validateWorkspace('./my-workspace');
 * console.log(`Validated ${result.fileCount} files`);
 * if (!result.valid) {
 *   console.error(`Found ${result.errorCount} errors`);
 * }
 * ```
 */
declare function validateWorkspace(dir: string, options?: ValidateOptions): Promise<WorkspaceValidationResult>;

export { DocumentType, type FileSystem, type FileValidationResult, ParseResult, SerializeOptions, type ValidateOptions, ValidationError, ValidationWarning, type WorkspaceValidationResult, WorkspaceWarning, createNodeFS, nodeFS, parseFile, serializeToFile, validateFile, validateWorkspace };
