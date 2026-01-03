/**
 * Semantic validation for cross-document references.
 */

import { glob } from 'glob';
import { resolve } from 'path';
import { parseDocument } from '../parser/yaml-parser.js';
import type { UBMLDocument } from '../parser/document.js';
import { ALL_ID_PATTERN, isValidId } from '../schemas/loader.js';
import { ValidationError, ValidationWarning, createError, createWarning } from './errors.js';
import { REFERENCE_MESSAGES, ERROR_CODES } from './messages.js';

/**
 * Result of reference validation.
 */
export interface ReferenceValidationResult {
  /** Whether all references are valid */
  valid: boolean;
  /** Validation errors for broken references */
  errors: ValidationError[];
  /** Validation warnings */
  warnings: ValidationWarning[];
  /** All defined IDs in the workspace */
  definedIds: Map<string, string>; // ID -> filepath
  /** All referenced IDs in the workspace */
  referencedIds: Map<string, string[]>; // ID -> filepaths where referenced
}

/**
 * Extract all defined IDs from a document.
 */
function extractDefinedIds(
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
function extractReferencedIds(
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
        
        // Check reference fields
        const refFields = ['responsible', 'accountable', 'consulted', 'informed', 'actor', 'actors', 
                          'from', 'to', 'source', 'target', 'parent', 'children', 'relatedTo',
                          'inputs', 'outputs', 'resources', 'tools', 'systems'];
        
        if (refFields.includes(key)) {
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
 * Validate cross-document references in a workspace.
 */
export async function validateReferences(
  workspaceDir: string
): Promise<ReferenceValidationResult> {
  const absoluteDir = resolve(workspaceDir);
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  const definedIds = new Map<string, string>();
  const referencedIds = new Map<string, string[]>();

  // Find all UBML files
  const files = glob.sync('**/*.ubml.{yaml,yml}', { cwd: absoluteDir, absolute: true });

  // Parse all documents and extract IDs
  const documents: UBMLDocument[] = [];
  for (const filepath of files) {
    const result = await parseDocument(filepath);
    if (result.document) {
      documents.push(result.document);
      
      // Extract defined IDs
      const ids = extractDefinedIds(result.document.content, filepath);
      for (const [id, info] of ids) {
        if (definedIds.has(id)) {
          errors.push(createError(
            REFERENCE_MESSAGES.DUPLICATE_ID(id, definedIds.get(id)!),
            info.filepath,
            { path: info.path, code: ERROR_CODES.DUPLICATE_ID }
          ));
        } else {
          definedIds.set(id, info.filepath);
        }
      }
      
      // Extract referenced IDs
      const refs = extractReferencedIds(result.document.content, filepath);
      for (const [id, locations] of refs) {
        const existing = referencedIds.get(id) ?? [];
        existing.push(...locations.map(l => l.filepath));
        referencedIds.set(id, existing);
      }
    }
  }

  // Check for undefined references
  for (const [id, filepaths] of referencedIds) {
    if (!definedIds.has(id)) {
      for (const filepath of [...new Set(filepaths)]) {
        errors.push(createError(
          REFERENCE_MESSAGES.UNDEFINED_REFERENCE(id, filepath),
          filepath,
          { code: ERROR_CODES.UNDEFINED_REFERENCE }
        ));
      }
    }
  }

  // Check for unused IDs (warning only)
  for (const [id, filepath] of definedIds) {
    if (!referencedIds.has(id)) {
      warnings.push(createWarning(
        REFERENCE_MESSAGES.UNUSED_ID(id),
        filepath,
        { code: ERROR_CODES.UNUSED_ID }
      ));
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
