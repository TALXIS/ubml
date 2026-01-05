/**
 * UBML Document Type Detection (Browser-Safe)
 * 
 * Provides document type detection from filenames and content.
 * Works in any JavaScript runtime (browser, Node.js, Deno, Bun).
 * 
 * @module ubml
 */

// Re-export from generated metadata
export {
  detectDocumentType,
  detectDocumentTypeFromContent,
  type DocumentType,
  DOCUMENT_TYPES,
  isDocumentType,
} from './generated/metadata.js';
