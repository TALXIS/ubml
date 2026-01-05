/**
 * UBML File Serializer (Node.js)
 * 
 * File system operations for serializing UBML documents.
 */

import { resolve, dirname } from 'path';
import { mkdir } from 'fs/promises';
import { type FileSystem, nodeFS } from './fs.js';
import { serialize, type SerializeOptions } from '../serializer.js';

/**
 * Options for serializing to a file.
 */
export interface SerializeToFileOptions extends SerializeOptions {
  /** Custom file system implementation */
  fs?: FileSystem;
  /** Create parent directories if they don't exist (default: true) */
  createDirs?: boolean;
}

/**
 * Serialize and write a UBML document to a file.
 * 
 * @param content - The content to serialize
 * @param path - Path to write to
 * @param options - Serialization options
 * 
 * @example
 * ```typescript
 * import { serializeToFile } from 'ubml/node';
 * 
 * await serializeToFile({
 *   ubml: '1.0',
 *   processes: { PR001: { name: 'My Process' } }
 * }, './output.process.ubml.yaml');
 * ```
 */
export async function serializeToFile(
  content: unknown,
  path: string,
  options: SerializeToFileOptions = {}
): Promise<void> {
  const { fs = nodeFS, createDirs = true, ...serializeOpts } = options;
  const absolutePath = resolve(path);
  
  // Create parent directories if needed
  if (createDirs) {
    const dir = dirname(absolutePath);
    await mkdir(dir, { recursive: true });
  }
  
  const yaml = serialize(content, serializeOpts);
  await fs.writeFile(absolutePath, yaml);
}
