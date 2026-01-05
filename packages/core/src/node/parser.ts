/**
 * UBML File Parser (Node.js)
 * 
 * File system operations for parsing UBML documents.
 */

import { resolve, basename } from 'path';
import { type FileSystem, nodeFS } from './fs.js';
import { parse, type ParseResult, type UBMLDocument } from '../parser.js';

/**
 * Options for parsing a file.
 */
export interface ParseFileOptions {
  /** Custom file system implementation */
  fs?: FileSystem;
}

/**
 * Parse a UBML file from disk.
 * 
 * @param path - Path to the UBML file
 * @param options - Parse options
 * 
 * @example
 * ```typescript
 * import { parseFile } from 'ubml/node';
 * 
 * const result = await parseFile('./process.ubml.yaml');
 * if (result.ok) {
 *   console.log(result.document.content);
 * }
 * ```
 */
export async function parseFile<T = unknown>(
  path: string,
  options: ParseFileOptions = {}
): Promise<ParseResult<T>> {
  const fs = options.fs ?? nodeFS;
  const absolutePath = resolve(path);
  const filename = basename(path);

  let content: string;
  try {
    content = await fs.readFile(absolutePath);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      document: undefined,
      errors: [{
        message: `Failed to read file: ${message}`,
      }],
      warnings: [],
      ok: false,
    };
  }

  // Parse using the browser-safe parser
  const result = parse<T>(content, filename);
  
  // Add filepath to the document meta if successful
  if (result.document) {
    (result.document as any).meta.filepath = absolutePath;
  }
  
  return result;
}
