/**
 * UBML Node.js Module
 * 
 * File system operations for UBML parsing, validation, and serialization.
 * This module requires Node.js and has file system dependencies.
 * 
 * @module ubml/node
 * 
 * @example
 * ```typescript
 * import { parseFile, validateWorkspace, serializeToFile } from 'ubml/node';
 * 
 * // Parse a file
 * const result = await parseFile('./process.ubml.yaml');
 * 
 * // Validate a workspace
 * const validation = await validateWorkspace('./my-workspace');
 * 
 * // Write to file
 * await serializeToFile(content, './output.ubml.yaml');
 * ```
 */

// File system operations
export { 
  type FileSystem, 
  nodeFS, 
  createNodeFS,
} from './fs.js';

// Parser operations
export { parseFile } from './parser.js';

// Serializer operations
export { serializeToFile } from './serializer.js';

// ID scanning operations
export {
  scanWorkspaceIds,
  getNextAvailableId,
  getNextAvailableIds,
  checkIdConflict,
  findWorkspaceFile,
  readIdStats,
  writeIdStats,
  syncIdStats,
  type WorkspaceIdScan,
  type IdStats,
} from './id-scanner.js';

// Validator operations
export { 
  validateFile, 
  validateWorkspace,
  type FileValidationResult,
  type WorkspaceValidationResult,
  type ValidateOptions,
} from './validator.js';

// Re-export browser-safe core for convenience
export * from '../index.js';

// Re-export browser-safe types that are commonly needed
export type { 
  ParseResult, 
  UBMLDocument, 
  DocumentMeta,
  ParseError,
  ParseWarning,
} from '../parser.js';

export type {
  ValidationResult,
  ValidationError,
  ValidationWarning,
  Validator,
} from '../validator.js';

export type { 
  SerializeOptions,
} from '../serializer.js';

export type { 
  DocumentType,
} from '../metadata.js';
