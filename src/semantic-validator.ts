/**
 * Browser-safe semantic validation (cross-document references).
 * 
 * This module provides the core validation logic without file system dependencies.
 * For file system operations, use the Node.js version in `node/semantic-validator.ts`.
 */

import { isValidId, REFERENCE_FIELDS, DOCUMENT_TYPES, type DocumentType, getIdPrefix } from './metadata.js';
import type { UBMLDocument } from './parser.js';

// =============================================================================
// Fuzzy Matching Utilities
// =============================================================================

/**
 * Calculate Levenshtein distance between two strings.
 */
function levenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Find similar IDs in a set of defined IDs.
 * Returns up to 3 suggestions with similarity scores.
 */
function findSimilarIds(
  targetId: string,
  definedIds: Map<string, { filepath: string; path: string }>
): { id: string; name?: string; distance: number }[] {
  const prefix = getIdPrefix(targetId);
  const suggestions: { id: string; distance: number }[] = [];

  for (const id of definedIds.keys()) {
    // Prefer same-prefix matches
    const idPrefix = getIdPrefix(id);
    const samePrefix = prefix && idPrefix === prefix;
    
    // Calculate distance
    const distance = levenshteinDistance(targetId, id);
    
    // Only suggest if reasonably similar (distance <= 4 for same prefix, <= 2 for different)
    const threshold = samePrefix ? 4 : 2;
    if (distance <= threshold) {
      suggestions.push({ id, distance: samePrefix ? distance : distance + 2 });
    }
  }

  // Sort by distance and return top 3
  return suggestions
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 3);
}

/**
 * Validation error for reference issues.
 */
export interface ReferenceError {
  /** Error message */
  message: string;
  /** File path where error occurred */
  filepath: string;
  /** JSON path to the error location */
  path?: string;
  /** Error code */
  code?: string;
  /** Suggested IDs that might be intended */
  suggestions?: string[];
}

/**
 * Validation warning for reference issues.
 */
export interface ReferenceWarning {
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
export interface ReferenceValidationResult {
  /** Whether all references are valid */
  valid: boolean;
  /** Validation errors for broken references */
  errors: ReferenceError[];
  /** Validation warnings */
  warnings: ReferenceWarning[];
  /** All defined IDs in the workspace */
  definedIds: Map<string, { filepath: string; path: string }>;
  /** All referenced IDs in the workspace */
  referencedIds: Map<string, string[]>;
}

/**
 * Options for reference validation.
 */
export interface ReferenceValidateOptions {
  /** Suppress unused-id warnings (useful for catalog documents like entities, actors, metrics) */
  suppressUnusedWarnings?: boolean;
}

/**
 * Extract all defined IDs from a document.
 */
export function extractDefinedIds(
  content: unknown,
  filepath: string,
  path: string = ''
): Map<string, { filepath: string; path: string }> {
  const ids = new Map<string, { filepath: string; path: string }>();

  if (content && typeof content === 'object') {
    if (Array.isArray(content)) {
      content.forEach((item, index) => {
        const childIds = extractDefinedIds(item, filepath, `${path}[${index}]`);
        for (const [id, info] of childIds) {
          ids.set(id, info);
        }
      });
    } else {
      const obj = content as Record<string, unknown>;
      for (const [key, value] of Object.entries(obj)) {
        const currentPath = path ? `${path}.${key}` : key;
        
        // Check if this key is an ID definition
        if (isValidId(key)) {
          ids.set(key, { filepath, path: currentPath });
        }
        
        // Recursively check nested objects
        const childIds = extractDefinedIds(value, filepath, currentPath);
        for (const [id, info] of childIds) {
          ids.set(id, info);
        }
      }
    }
  }

  return ids;
}

/**
 * Extract all referenced IDs from a document.
 */
export function extractReferencedIds(
  content: unknown,
  filepath: string,
  path: string = ''
): Map<string, { filepath: string; path: string }[]> {
  const refs = new Map<string, { filepath: string; path: string }[]>();

  function addRef(id: string, refPath: string) {
    const existing = refs.get(id) ?? [];
    existing.push({ filepath, path: refPath });
    refs.set(id, existing);
  }

  if (content && typeof content === 'object') {
    if (Array.isArray(content)) {
      content.forEach((item, index) => {
        // Check if array item is an ID reference (string)
        if (typeof item === 'string' && isValidId(item)) {
          addRef(item, `${path}[${index}]`);
        }
        
        const childRefs = extractReferencedIds(item, filepath, `${path}[${index}]`);
        for (const [id, locations] of childRefs) {
          const existing = refs.get(id) ?? [];
          existing.push(...locations);
          refs.set(id, existing);
        }
      });
    } else {
      const obj = content as Record<string, unknown>;
      for (const [key, value] of Object.entries(obj)) {
        const currentPath = path ? `${path}.${key}` : key;
        
        // Check if this key is a known reference field (auto-generated from schemas)
        if (REFERENCE_FIELDS.includes(key as typeof REFERENCE_FIELDS[number])) {
          if (typeof value === 'string' && isValidId(value)) {
            addRef(value, currentPath);
          } else if (Array.isArray(value)) {
            value.forEach((item, index) => {
              if (typeof item === 'string' && isValidId(item)) {
                addRef(item, `${currentPath}[${index}]`);
              }
            });
          }
        }
        
        // Recursively check nested objects
        const childRefs = extractReferencedIds(value, filepath, currentPath);
        for (const [id, locations] of childRefs) {
          const existing = refs.get(id) ?? [];
          existing.push(...locations);
          refs.set(id, existing);
        }
      }
    }
  }

  return refs;
}

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
export function validateDocuments(
  documents: UBMLDocument[],
  options: ReferenceValidateOptions = {}
): ReferenceValidationResult {
  const errors: ReferenceError[] = [];
  const warnings: ReferenceWarning[] = [];
  const definedIds = new Map<string, { filepath: string; path: string }>();
  const referencedIds = new Map<string, string[]>();

  // Extract IDs from all documents
  for (const document of documents) {
    const filepath = document.meta.filename || 'unknown';
    
    // Extract defined IDs
    const ids = extractDefinedIds(document.content, filepath);
    for (const [id, info] of ids) {
      if (definedIds.has(id)) {
        const existing = definedIds.get(id)!;
        errors.push({
          message: `Duplicate ID "${id}" (also defined in ${existing.filepath})`,
          filepath: info.filepath,
          path: info.path,
          code: 'ubml/duplicate-id',
        });
      } else {
        definedIds.set(id, info);
      }
    }
    
    // Extract referenced IDs
    const refs = extractReferencedIds(document.content, filepath);
    for (const [id, locations] of refs) {
      const existing = referencedIds.get(id) ?? [];
      existing.push(...locations.map(l => l.filepath));
      referencedIds.set(id, existing);
    }
  }

  // Check for undefined references
  for (const [id, filepaths] of referencedIds) {
    if (!definedIds.has(id)) {
      const uniqueFiles = [...new Set(filepaths)];
      
      // Find similar IDs for suggestions
      const similar = findSimilarIds(id, definedIds);
      const suggestions = similar.map(s => s.id);
      
      for (const filepath of uniqueFiles) {
        let message = `Reference to undefined ID "${id}"`;
        if (suggestions.length > 0) {
          message += ` - did you mean: ${suggestions.join(', ')}?`;
        }
        
        errors.push({
          message,
          filepath,
          code: 'ubml/undefined-reference',
          suggestions: suggestions.length > 0 ? suggestions : undefined,
        });
      }
    }
  }

  // Check for unused IDs (warning only)
  if (!options.suppressUnusedWarnings) {
    for (const [id, info] of definedIds) {
      if (!referencedIds.has(id)) {
        // Get the document to resolve source location
        const doc = documents.find(d => d.meta.filename === info.filepath);
        // Convert dot notation to JSON pointer: actors.AC118 -> /actors/AC118
        const jsonPointerPath = '/' + info.path.replace(/\./g, '/');
        const location = doc?.getSourceLocation(jsonPointerPath);
        
        warnings.push({
          message: `ID "${id}" is defined but never referenced`,
          filepath: info.filepath,
          path: info.path,
          code: 'ubml/unused-id',
          ...(location && {
            line: location.line,
            column: location.column,
          }),
        });
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    definedIds,
    referencedIds,
  };
}

// ============================================================================
// WORKSPACE STRUCTURE VALIDATION
// ============================================================================

/**
 * Document type multiplicity rules.
 * Defines how many files of each type are expected/allowed in a workspace.
 */
export const DOCUMENT_MULTIPLICITY: Record<DocumentType, 'singleton' | 'catalog' | 'multiple'> = {
  workspace: 'singleton',   // Exactly one per workspace
  glossary: 'singleton',    // Should be unified for consistency
  strategy: 'singleton',    // Single strategic context
  actors: 'catalog',        // Shared definitions, can split for large orgs
  entities: 'catalog',      // Shared definitions, can split by domain
  metrics: 'catalog',       // Shared definitions, can split by initiative
  process: 'multiple',      // One per business process
  scenarios: 'multiple',    // Grouped by process or initiative
  hypotheses: 'multiple',   // One per problem/initiative
  links: 'multiple',        // Can be split for manageability
  views: 'multiple',        // Different views for different audiences
  mining: 'multiple',       // Per data source or analysis
};

/**
 * Get the multiplicity rule for a document type.
 */
export function getDocumentMultiplicity(type: DocumentType): 'singleton' | 'catalog' | 'multiple' {
  return DOCUMENT_MULTIPLICITY[type] ?? 'multiple';
}

/**
 * Workspace validation warning.
 */
export interface WorkspaceWarning {
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
export interface WorkspaceValidationResult {
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
export function validateWorkspaceStructure(
  documents: UBMLDocument[]
): WorkspaceValidationResult {
  const warnings: WorkspaceWarning[] = [];
  const documentTypes = new Map<DocumentType, string[]>();

  // Group documents by type
  for (const doc of documents) {
    const type = doc.meta.type;
    if (type) {
      const files = documentTypes.get(type) ?? [];
      files.push(doc.meta.filename || 'unknown');
      documentTypes.set(type, files);
    }
  }

  // Check for missing workspace file
  if (!documentTypes.has('workspace')) {
    warnings.push({
      message: 'No workspace file found',
      code: 'ubml/missing-workspace',
      suggestion: 'Create a *.workspace.ubml.yaml file to define your project',
    });
  }

  // Check for multiple singleton documents
  for (const [type, files] of documentTypes) {
    const multiplicity = DOCUMENT_MULTIPLICITY[type];
    
    if (multiplicity === 'singleton' && files.length > 1) {
      warnings.push({
        message: `Multiple ${type} files found (expected single file)`,
        code: 'ubml/multiple-singleton',
        files,
        suggestion: `Consider consolidating into one ${type}.ubml.yaml file`,
      });
    }
  }

  // Check for process files without supporting documents
  const hasProcesses = documentTypes.has('process');
  if (hasProcesses) {
    if (!documentTypes.has('actors')) {
      warnings.push({
        message: 'Process files exist but no actors defined',
        code: 'ubml/missing-actors',
        suggestion: 'Add actors.ubml.yaml to define who performs process steps',
      });
    }
  }

  // Suggest glossary for complex workspaces
  const totalFiles = documents.length;
  if (totalFiles >= 5 && !documentTypes.has('glossary')) {
    warnings.push({
      message: 'Complex workspace without glossary',
      code: 'ubml/suggest-glossary',
      suggestion: 'Consider adding glossary.ubml.yaml for consistent terminology',
    });
  }

  return {
    valid: true, // Structure warnings don't fail validation
    warnings,
    documentTypes,
  };
}
