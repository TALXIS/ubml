/**
 * Document Type Detection
 *
 * Utilities for detecting UBML document types from filenames and content.
 *
 * @module ubml/schema/detection
 */

import { 
  DOCUMENT_TYPES, 
  SCHEMA_PATHS, 
  CONTENT_DETECTION_CONFIG,
  type DocumentType 
} from '../generated/data.js';

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
 * Detection rules are derived from x-ubml-cli.detectBy in schemas.
 */
export function detectDocumentTypeFromContent(content: unknown): DocumentType | undefined {
  if (!content || typeof content !== 'object') {
    return undefined;
  }

  const obj = content as Record<string, unknown>;

  // Score each document type by how many detectBy properties are present
  let bestMatch: DocumentType | undefined;
  let bestScore = 0;

  for (const [docType, detectProps] of Object.entries(CONTENT_DETECTION_CONFIG)) {
    const score = detectProps.filter((prop) => prop in obj).length;
    if (score > bestScore) {
      bestScore = score;
      bestMatch = docType as DocumentType;
    }
  }

  return bestMatch;
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
