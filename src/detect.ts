/**
 * UBML Document Type Detection (Browser-Safe)
 * 
 * Provides document type detection from filenames and content.
 * Works in any JavaScript runtime (browser, Node.js, Deno, Bun).
 * 
 * @module ubml
 */

// Re-export from schema module (primary implementation)
export {
  detectDocumentType,
  detectDocumentTypeFromContent,
  isUBMLFile,
  getUBMLFilePatterns,
  getSchemaPathForFileSuffix,
} from './schema/detection.js';

// Re-export types and constants from metadata
export {
  type DocumentType,
  DOCUMENT_TYPES,
  isDocumentType,
} from './metadata.js';
