/**
 * UBML Parser Module
 *
 * Provides YAML parsing with source location tracking for UBML documents.
 *
 * @module ubml/parser
 */

export { parseDocument, parseDocumentFromString, type ParseResult } from './yaml-parser.js';
export {
  type UBMLDocument,
  type DocumentMeta,
  type ParsedNode,
  type SourceLocation,
  type DocumentType,
  DOCUMENT_TYPES,
} from './document.js';
// Re-export detectDocumentType from schemas for convenience
export { detectDocumentType } from '../schemas/loader.js';
