/**
 * UBML Serializer (Browser-Safe)
 * 
 * Provides YAML serialization with consistent formatting.
 * Works in any JavaScript runtime (browser, Node.js, Deno, Bun).
 * 
 * @module ubml
 */

import { stringify, type DocumentOptions, type SchemaOptions, type ToStringOptions } from 'yaml';

/**
 * Options for YAML serialization.
 */
export interface SerializeOptions {
  /** Indentation spaces (default: 2) */
  indent?: number;
  /** Line width before wrapping (default: 120) */
  lineWidth?: number;
  /** Whether to use flow style for short arrays/objects */
  flowLevel?: number;
  /** Whether to add a final newline (default: true) */
  trailingNewline?: boolean;
  /** Whether to sort keys alphabetically (default: false) */
  sortKeys?: boolean;
  /** Quote style for strings: 'single' | 'double' | null (default: null = unquoted where possible) */
  quoteStyle?: 'single' | 'double' | null;
}

/**
 * Default serialization options for UBML documents.
 */
const DEFAULT_OPTIONS: Required<SerializeOptions> = {
  indent: 2,
  lineWidth: 120,
  flowLevel: -1, // Never use flow style
  trailingNewline: true,
  sortKeys: false,
  quoteStyle: null,
};

/**
 * Serialize a JavaScript object to a YAML string.
 * 
 * @param content - The object to serialize
 * @param options - Serialization options
 * 
 * @example
 * ```typescript
 * import { serialize } from 'ubml';
 * 
 * const yaml = serialize({
 *   ubml: '1.0',
 *   processes: {
 *     PR001: { name: 'My Process' }
 *   }
 * });
 * ```
 */
export function serialize(content: unknown, options: SerializeOptions = {}): string {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  const yamlOptions: DocumentOptions & SchemaOptions & ToStringOptions = {
    indent: opts.indent,
    lineWidth: opts.lineWidth,
    minContentWidth: 0,
    defaultKeyType: 'PLAIN',
    defaultStringType: opts.quoteStyle === 'single' ? 'QUOTE_SINGLE' 
                      : opts.quoteStyle === 'double' ? 'QUOTE_DOUBLE' 
                      : 'PLAIN',
    sortMapEntries: opts.sortKeys,
  };

  let yaml = stringify(content, yamlOptions);

  // Handle trailing newline
  if (opts.trailingNewline && !yaml.endsWith('\n')) {
    yaml += '\n';
  } else if (!opts.trailingNewline && yaml.endsWith('\n')) {
    yaml = yaml.slice(0, -1);
  }

  return yaml;
}
