/**
 * Document Type Detection
 *
 * Utilities for detecting UBML document types from filenames and content.
 *
 * @module ubml/schema/detection
 */

import { DOCUMENT_TYPES, SCHEMA_PATHS, type DocumentType } from '../metadata.js';

// =============================================================================
// Filename-based Detection
// =============================================================================

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

// =============================================================================
// File Pattern Utilities
// =============================================================================

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
