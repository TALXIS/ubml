/**
 * File system abstraction for UBML.
 * 
 * Provides an interface that can be implemented for different environments
 * (Node.js, browsers with virtual FS, etc.).
 */

import { readFile, writeFile } from 'fs/promises';
import { glob } from 'glob';
import { existsSync } from 'fs';

/**
 * Abstract file system interface.
 * Implement this to use UBML with virtual file systems in web apps.
 */
export interface FileSystem {
  /**
   * Read a file's contents as UTF-8 string.
   */
  readFile(path: string): Promise<string>;
  
  /**
   * Write content to a file as UTF-8.
   */
  writeFile(path: string, content: string): Promise<void>;
  
  /**
   * Find files matching a glob pattern.
   */
  glob(pattern: string, options?: { cwd?: string }): Promise<string[]>;
  
  /**
   * Check if a file or directory exists.
   */
  exists(path: string): Promise<boolean>;
}

/**
 * Create a Node.js file system implementation.
 */
export function createNodeFS(): FileSystem {
  return {
    async readFile(path: string): Promise<string> {
      return readFile(path, 'utf8');
    },

    async writeFile(path: string, content: string): Promise<void> {
      await writeFile(path, content, 'utf8');
    },

    async glob(pattern: string, options?: { cwd?: string }): Promise<string[]> {
      return glob(pattern, { 
        cwd: options?.cwd, 
        absolute: true,
      });
    },

    async exists(path: string): Promise<boolean> {
      return existsSync(path);
    },
  };
}

/**
 * Default Node.js file system implementation.
 */
export const nodeFS: FileSystem = createNodeFS();
