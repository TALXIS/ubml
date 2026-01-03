/**
 * YAML Parser with source location tracking.
 */

import { readFile } from 'fs/promises';
import { basename, resolve } from 'path';
import { parseDocument as parseYamlDocument } from 'yaml';
import {
  type UBMLDocument,
  type DocumentMeta,
  type DocumentType,
} from './document.js';
import { detectDocumentType } from '../schemas/loader.js';

// Re-export for convenience
export { detectDocumentType };

/**
 * Result of parsing a UBML document.
 */
export interface ParseResult<T = Record<string, unknown>> {
  /** Successfully parsed document, or undefined on error */
  document?: UBMLDocument<T>;
  /** Parse errors, if any */
  errors: ParseError[];
  /** Parse warnings */
  warnings: ParseWarning[];
}

/**
 * A parse error with location information.
 */
export interface ParseError {
  message: string;
  line?: number;
  column?: number;
  filepath: string;
}

/**
 * A parse warning.
 */
export interface ParseWarning {
  message: string;
  line?: number;
  column?: number;
  filepath: string;
}

/**
 * Parse a UBML document from a file path.
 */
export async function parseDocument<T = Record<string, unknown>>(
  filepath: string
): Promise<ParseResult<T>> {
  const absolutePath = resolve(filepath);
  const filename = basename(filepath);
  const errors: ParseError[] = [];
  const warnings: ParseWarning[] = [];

  let raw: string;
  try {
    raw = await readFile(absolutePath, 'utf8');
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    errors.push({
      message: `Failed to read file: ${message}`,
      filepath: absolutePath,
    });
    return { errors, warnings };
  }

  return parseDocumentFromString<T>(raw, filepath);
}

/**
 * Parse a UBML document from a string.
 */
export function parseDocumentFromString<T = Record<string, unknown>>(
  content: string,
  filepath: string
): ParseResult<T> {
  const absolutePath = resolve(filepath);
  const filename = basename(filepath);
  const errors: ParseError[] = [];
  const warnings: ParseWarning[] = [];

  // Detect document type from filename
  const documentType = detectDocumentType(filename);
  if (!documentType) {
    warnings.push({
      message: `Could not detect document type from filename. Expected pattern: *.{type}.ubml.yaml`,
      filepath: absolutePath,
    });
  }

  // Parse YAML
  let content_parsed: T;
  try {
    const doc = parseYamlDocument(content);
    
    // Collect YAML parse errors
    for (const error of doc.errors) {
      errors.push({
        message: error.message,
        line: error.linePos?.[0]?.line,
        column: error.linePos?.[0]?.col,
        filepath: absolutePath,
      });
    }

    // Collect YAML parse warnings
    for (const warning of doc.warnings) {
      warnings.push({
        message: warning.message,
        line: warning.linePos?.[0]?.line,
        column: warning.linePos?.[0]?.col,
        filepath: absolutePath,
      });
    }

    if (errors.length > 0) {
      return { errors, warnings };
    }

    content_parsed = doc.toJSON() as T;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    errors.push({
      message: `YAML parse error: ${message}`,
      filepath: absolutePath,
    });
    return { errors, warnings };
  }

  // Extract UBML version
  const ubmlVersion = (content_parsed as Record<string, unknown>)?.['ubml'] as string ?? '1.0';

  const meta: DocumentMeta = {
    ubmlVersion,
    documentType: documentType ?? 'workspace', // Default to workspace if unknown
    filename,
    filepath: absolutePath,
  };

  const document: UBMLDocument<T> = {
    content: content_parsed,
    meta,
    raw: content,
  };

  return { document, errors, warnings };
}
