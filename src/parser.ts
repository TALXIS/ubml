/**
 * UBML Parser (Browser-Safe)
 * 
 * Provides YAML parsing with source location tracking for UBML documents.
 * Works in any JavaScript runtime (browser, Node.js, Deno, Bun).
 * 
 * @module ubml
 */

import { parseDocument as parseYamlDocument, Document, isMap, isSeq, Pair, Scalar, YAMLMap, YAMLSeq } from 'yaml';
import { detectDocumentType, detectDocumentTypeFromContent, type DocumentType } from './metadata.js';

// Re-export for convenience
export { detectDocumentType, detectDocumentTypeFromContent };
export type { DocumentType };

/**
 * Source location information for error reporting.
 */
export interface SourceLocation {
  /** Line number (1-indexed) */
  line: number;
  /** Column number (1-indexed) */
  column: number;
  /** Byte offset in file */
  offset?: number;
}

/**
 * A parse error with location information.
 */
export interface ParseError {
  message: string;
  line?: number;
  column?: number;
  /** End position for range highlighting */
  endLine?: number;
  endColumn?: number;
}

/**
 * A parse warning.
 */
export interface ParseWarning {
  message: string;
  line?: number;
  column?: number;
  endLine?: number;
  endColumn?: number;
}

/**
 * Document metadata extracted from UBML files.
 */
export interface DocumentMeta {
  /** UBML version (e.g., "1.0") */
  version: string;
  /** Document type detected from filename or content */
  type: DocumentType | undefined;
  /** Original filename (if provided) */
  filename?: string;
}

/**
 * A parsed UBML document.
 */
export interface UBMLDocument<T = unknown> {
  /** Parsed document content */
  content: T;
  /** Document metadata */
  meta: DocumentMeta;
  /** Original source string */
  source: string;
  /**
   * Get source location for a JSON path.
   * 
   * @param path - JSON pointer path (e.g., "/processes/PR00001/steps/ST00001")
   * @returns Source location or undefined if path not found
   * 
   * @example
   * ```typescript
   * const loc = document.getSourceLocation('/processes/PR00001/name');
   * console.log(`Line ${loc?.line}, column ${loc?.column}`);
   * ```
   */
  getSourceLocation(path: string): SourceLocation | undefined;
}

/**
 * Result of parsing a UBML document.
 */
export interface ParseResult<T = unknown> {
  /** Successfully parsed document, or undefined on error */
  document: UBMLDocument<T> | undefined;
  /** Parse errors, if any */
  errors: ParseError[];
  /** Parse warnings */
  warnings: ParseWarning[];
  /** Whether parsing succeeded (no errors) */
  ok: boolean;
}

/**
 * Parse UBML content from a string.
 * Works in any JavaScript runtime (browser, Node, Deno, Bun).
 * 
 * @param content - YAML string to parse
 * @param filename - Optional filename for document type detection
 * 
 * @example
 * ```typescript
 * import { parse } from 'ubml';
 * 
 * const result = parse(yamlContent, 'my-process.process.ubml.yaml');
 * if (result.ok) {
 *   console.log(result.document.content);
 * } else {
 *   console.error(result.errors);
 * }
 * ```
 */
export function parse<T = unknown>(content: string, filename?: string): ParseResult<T> {
  const errors: ParseError[] = [];
  const warnings: ParseWarning[] = [];

  // Detect document type from filename
  let documentType: DocumentType | undefined;
  if (filename) {
    documentType = detectDocumentType(filename);
    if (!documentType) {
      warnings.push({
        message: `Could not detect document type from filename. Expected pattern: *.{type}.ubml.yaml`,
      });
    }
  }

  // Parse YAML - keep the document for source location resolution
  let parsedContent: T;
  let yamlDoc: Document;
  try {
    yamlDoc = parseYamlDocument(content);
    
    // Collect YAML parse errors
    for (const error of yamlDoc.errors) {
      errors.push({
        message: error.message,
        line: error.linePos?.[0]?.line,
        column: error.linePos?.[0]?.col,
        endLine: error.linePos?.[1]?.line,
        endColumn: error.linePos?.[1]?.col,
      });
    }

    // Collect YAML parse warnings
    for (const warning of yamlDoc.warnings) {
      warnings.push({
        message: warning.message,
        line: warning.linePos?.[0]?.line,
        column: warning.linePos?.[0]?.col,
        endLine: warning.linePos?.[1]?.line,
        endColumn: warning.linePos?.[1]?.col,
      });
    }

    if (errors.length > 0) {
      return { document: undefined, errors, warnings, ok: false };
    }

    parsedContent = yamlDoc.toJSON() as T;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    errors.push({
      message: `YAML parse error: ${message}`,
    });
    return { document: undefined, errors, warnings, ok: false };
  }

  // Try to detect type from content if not detected from filename
  if (!documentType && parsedContent) {
    documentType = detectDocumentTypeFromContent(parsedContent);
  }

  // Extract UBML version
  const ubmlVersion = (parsedContent as Record<string, unknown>)?.['ubml'] as string ?? '1.1';

  const meta: DocumentMeta = {
    version: ubmlVersion,
    type: documentType,
    filename,
  };

  // Create source location resolver that walks the YAML AST
  const getSourceLocation = (path: string): SourceLocation | undefined => {
    if (!path || path === '/') {
      const range = yamlDoc.contents?.range;
      if (range) {
        // Get line/column from offset
        let line = 1;
        let column = 1;
        for (let i = 0; i < range[0]; i++) {
          if (content[i] === '\n') {
            line++;
            column = 1;
          } else {
            column++;
          }
        }
        return { line, column, offset: range[0] };
      }
      return undefined;
    }

    // Parse JSON pointer path: /foo/bar/0 -> ['foo', 'bar', '0']
    const parts = path.split('/').filter(Boolean);
    
    let node = yamlDoc.contents;
    for (const part of parts) {
      if (!node) return undefined;
      
      if (isMap(node)) {
        // Find the key in the map
        const pair = node.items.find((item): item is Pair => {
          if (item instanceof Pair) {
            const key = item.key;
            if (key instanceof Scalar) {
              return key.value === part;
            }
          }
          return false;
        });
        if (!pair) return undefined;
        node = pair.value as typeof node;
      } else if (isSeq(node)) {
        const index = parseInt(part, 10);
        if (isNaN(index) || index < 0 || index >= node.items.length) {
          return undefined;
        }
        node = node.items[index] as typeof node;
      } else {
        return undefined;
      }
    }

    if (node && 'range' in node && Array.isArray(node.range)) {
      const offset = node.range[0];
      // Convert offset to line/column
      let line = 1;
      let column = 1;
      for (let i = 0; i < offset; i++) {
        if (content[i] === '\n') {
          line++;
          column = 1;
        } else {
          column++;
        }
      }
      return { line, column, offset };
    }

    return undefined;
  };

  const document: UBMLDocument<T> = {
    content: parsedContent,
    meta,
    source: content,
    getSourceLocation,
  };

  return { document, errors, warnings, ok: true };
}
