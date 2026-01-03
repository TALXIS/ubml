/**
 * Document types and AST definitions for UBML.
 */

// Re-export document types from the single source of truth
export { DOCUMENT_TYPES } from '../schemas/loader.js';
export type { DocumentType } from '../schemas/loader.js';

// Import the type for local use
import type { DocumentType } from '../schemas/loader.js';

/**
 * Source location information for error reporting.
 */
export interface SourceLocation {
  /** Line number (1-indexed) */
  line: number;
  /** Column number (1-indexed) */
  column: number;
  /** Byte offset in file */
  offset: number;
}

/**
 * A parsed node with optional source location.
 */
export interface ParsedNode<T = unknown> {
  value: T;
  location?: SourceLocation;
}

/**
 * Document metadata extracted from UBML files.
 */
export interface DocumentMeta {
  /** UBML version (e.g., "1.0") */
  ubmlVersion: string;
  /** Document type detected from filename or content */
  documentType: DocumentType;
  /** Original filename */
  filename: string;
  /** Absolute file path */
  filepath: string;
}

/**
 * A parsed UBML document.
 */
export interface UBMLDocument<T = Record<string, unknown>> {
  /** Parsed document content */
  content: T;
  /** Document metadata */
  meta: DocumentMeta;
  /** Raw YAML string */
  raw: string;
}
