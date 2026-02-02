/**
 * UBML File Validator (Node.js)
 * 
 * File system operations for validating UBML documents.
 */

import { resolve, basename } from 'path';
import { type FileSystem, nodeFS } from './fs.js';
import { parseFile } from './parser.js';
import { 
  createValidator,
  validate,
  type ValidationError, 
  type ValidationWarning,
  type RawAjvError,
  type SchemaContext,
} from '../validator.js';
import { 
  getUBMLFilePatterns,
  type DocumentType,
} from '../metadata.js';
import { 
  validateWorkspaceStructure,
  type WorkspaceWarning,
} from '../semantic-validator.js';
import type { UBMLDocument } from '../parser.js';

/**
 * Validation error with file location.
 */
export interface FileValidationError extends ValidationError {
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
export interface FileValidationWarning extends ValidationWarning {
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
export interface FileValidationResult {
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
export interface WorkspaceValidationResult {
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
export interface ValidateOptions {
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
 * Convert parse errors to file validation errors.
 */
function convertParseErrors(
  errors: Array<{ message: string; line?: number; column?: number; code?: string }>,
  filepath: string
): FileValidationError[] {
  return errors.map((e) => ({
    message: e.message,
    filepath,
    line: e.line,
    column: e.column,
    code: e.code ?? 'PARSE_ERROR',
  }));
}

/**
 * Convert parse warnings to file validation warnings.
 */
function convertParseWarnings(
  warnings: Array<{ message: string; line?: number; column?: number; code?: string }>,
  filepath: string
): FileValidationWarning[] {
  return warnings.map((w) => ({
    message: w.message,
    filepath,
    line: w.line,
    column: w.column,
    code: w.code,
  }));
}

/**
 * Convert browser validation errors to file validation errors.
 * Preserves ajvError and schemaContext for enhanced formatting.
 */
function convertBrowserErrors(
  errors: Array<{ 
    message: string; 
    path?: string; 
    code?: string; 
    line?: number; 
    column?: number;
    ajvError?: RawAjvError;
    schemaContext?: SchemaContext;
  }>,
  filepath: string
): FileValidationError[] {
  return errors.map((e) => ({
    message: e.message,
    filepath,
    path: e.path,
    code: e.code,
    line: e.line,
    column: e.column,
    ajvError: e.ajvError,
    schemaContext: e.schemaContext,
  }));
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
export async function validateFile(
  path: string,
  options: ValidateOptions = {}
): Promise<FileValidationResult> {
  const fs = options.fs ?? nodeFS;
  const absolutePath = resolve(path);
  const errors: FileValidationError[] = [];
  const warnings: FileValidationWarning[] = [];

  // Parse the document
  const parseResult = await parseFile(absolutePath, { fs });
  errors.push(...convertParseErrors(parseResult.errors, absolutePath));
  warnings.push(...convertParseWarnings(parseResult.warnings, absolutePath));

  if (!parseResult.ok || !parseResult.document) {
    return {
      path: absolutePath,
      valid: false,
      documentType: undefined,
      errors,
      warnings,
    };
  }

  // Validate using browser validator
  const validator = await createValidator();
  const result = validator.validateDocument(parseResult.document);

  if (!result.valid) {
    errors.push(...convertBrowserErrors(result.errors, absolutePath));
  }

  return {
    path: absolutePath,
    valid: errors.length === 0,
    documentType: parseResult.document.meta.type,
    errors,
    warnings,
  };
}

/**
 * Find UBML files to validate in a workspace.
 */
async function findUBMLFiles(
  dir: string, 
  fs: FileSystem,
  _workspaceFile?: string
): Promise<{ files: string[]; workspaceFile?: string }> {
  // First, look for a workspace file
  const workspacePatterns = ['*.workspace.ubml.yaml', '*.workspace.ubml.yml'];
  let foundWorkspaceFile: string | undefined;
  let documentsFromWorkspace: string[] | undefined;

  for (const pattern of workspacePatterns) {
    const matches = await fs.glob(pattern, { cwd: dir });
    if (matches.length > 0) {
      foundWorkspaceFile = matches[0];
      
      // Try to read documents list from workspace file
      try {
        const content = await fs.readFile(foundWorkspaceFile);
        const { parse } = await import('../parser.js');
        const result = parse(content, basename(foundWorkspaceFile));
        
        if (result.ok && result.document) {
          const workspaceContent = result.document.content as { documents?: string[] };
          if (workspaceContent.documents && Array.isArray(workspaceContent.documents)) {
            documentsFromWorkspace = workspaceContent.documents.map(doc => 
              resolve(dir, doc)
            );
          }
        }
      } catch {
        // Ignore errors reading workspace file
      }
      break;
    }
  }

  // If workspace file has documents list, use that
  if (documentsFromWorkspace && documentsFromWorkspace.length > 0) {
    return { 
      files: documentsFromWorkspace, 
      workspaceFile: foundWorkspaceFile,
    };
  }

  // Otherwise, scan for all UBML files
  const patterns = getUBMLFilePatterns();
  const allFiles: string[] = [];
  
  for (const pattern of patterns) {
    const matches = await fs.glob(pattern, { cwd: dir });
    allFiles.push(...matches);
  }

  return { 
    files: [...new Set(allFiles)], // Deduplicate
    workspaceFile: foundWorkspaceFile,
  };
}

/**
 * Find UBML files that don't match expected naming patterns.
 * These files will be skipped during validation but should trigger warnings.
 */
async function findSkippedUBMLFiles(
  dir: string,
  fs: FileSystem,
  validFiles: string[]
): Promise<string[]> {
  // Find all files ending in .ubml.yaml or .ubml.yml
  const allUBMLFiles = await fs.glob('**/*.ubml.{yaml,yml}', { cwd: dir });
  
  // Create a set of valid files for quick lookup
  const validSet = new Set(validFiles);
  
  // Find files that aren't in the valid set
  return allUBMLFiles.filter(file => !validSet.has(file));
}

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
export async function validateWorkspace(
  dir: string,
  options: ValidateOptions = {}
): Promise<WorkspaceValidationResult> {
  const fs = options.fs ?? nodeFS;
  const absoluteDir = resolve(dir);
  
  // Find files to validate
  let files: string[];
  let workspaceFile: string | undefined;
  
  if (options.files && options.files.length > 0) {
    // Use explicit file list
    files = options.files.map(f => resolve(absoluteDir, f));
  } else {
    // Discover files from workspace
    const discovery = await findUBMLFiles(absoluteDir, fs);
    files = discovery.files;
    workspaceFile = discovery.workspaceFile;
  }

  // Apply exclusions
  if (options.exclude && options.exclude.length > 0) {
    const excludePatterns = options.exclude.map(p => new RegExp(p));
    files = files.filter(f => !excludePatterns.some(pattern => pattern.test(f)));
  }

  if (files.length === 0) {
    return {
      valid: true,
      files: [],
      errorCount: 0,
      warningCount: 0,
      fileCount: 0,
      workspaceFile,
      structureWarnings: [],
    };
  }

  // Parse all documents
  const documents: UBMLDocument[] = [];
  const fileResults: FileValidationResult[] = [];
  
  for (const filepath of files) {
    const parseResult = await parseFile(filepath, { fs });
    const errors: FileValidationError[] = convertParseErrors(parseResult.errors, filepath);
    const warnings: FileValidationWarning[] = convertParseWarnings(parseResult.warnings, filepath);
    
    if (parseResult.ok && parseResult.document) {
      documents.push(parseResult.document);
    }
    
    fileResults.push({
      path: filepath,
      valid: errors.length === 0,
      documentType: parseResult.document?.meta.type,
      errors,
      warnings,
    });
  }

  // Validate all documents (schema + references) in one call
  const validationResult = await validate(documents, {
    suppressUnusedWarnings: options.suppressUnusedWarnings,
  });

  // Validate workspace structure
  const structureResult = validateWorkspaceStructure(documents);

  // Check for skipped UBML files (files not matching expected patterns)
  const skippedFiles = await findSkippedUBMLFiles(absoluteDir, fs, files);
  const skippedWarnings: WorkspaceWarning[] = skippedFiles.map(file => ({
    code: 'SKIPPED_FILE',
    message: `File "${file}" not validated (doesn't match *.{type}.ubml.yaml pattern)`,
    suggestion: 'Valid patterns: *.process.ubml.yaml, *.actors.ubml.yaml, *.entities.ubml.yaml, etc.',
    files: [file],
  }));

  // Distribute validation errors/warnings to file results
  for (const error of validationResult.errors) {
    if (error.filepath) {
      const fileResult = fileResults.find(f => f.path.endsWith(error.filepath!));
      if (fileResult) {
        fileResult.errors.push(error as FileValidationError);
        fileResult.valid = false;
      }
    }
  }

  for (const warning of validationResult.warnings) {
    if (warning.filepath) {
      const fileResult = fileResults.find(f => f.path.endsWith(warning.filepath!));
      if (fileResult) {
        fileResult.warnings.push(warning as FileValidationWarning);
      }
    }
  }

  const totalErrors = fileResults.reduce((sum, r) => sum + r.errors.length, 0);
  const totalWarnings = fileResults.reduce((sum, r) => sum + r.warnings.length, 0);

  return {
    valid: totalErrors === 0,
    files: fileResults,
    errorCount: totalErrors,
    warningCount: totalWarnings,
    fileCount: files.length,
    workspaceFile,
    structureWarnings: [...structureResult.warnings, ...skippedWarnings],
  };
}
