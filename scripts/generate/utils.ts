/**
 * Generation Utilities
 *
 * Shared utility functions for the generation scripts.
 *
 * @module generate/utils
 */

import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// =============================================================================
// Paths
// =============================================================================

export const ROOT_DIR = join(__dirname, '..', '..');
export const SCHEMAS_ROOT = join(ROOT_DIR, 'schemas');
export const OUTPUT_DIR = join(ROOT_DIR, 'src', 'generated');

// =============================================================================
// Version
// =============================================================================

const packageJson = JSON.parse(readFileSync(join(ROOT_DIR, 'package.json'), 'utf8'));

/** Package version (e.g., "1.1.0") */
export const PACKAGE_VERSION = packageJson.version as string;

/** Schema version (e.g., "1.1") */
export const SCHEMA_VERSION = PACKAGE_VERSION.split('.').slice(0, 2).join('.');

/** Versioned schemas directory (e.g., "schemas/1.2") */
export const SCHEMAS_DIR = join(SCHEMAS_ROOT, SCHEMA_VERSION);

// =============================================================================
// File Operations
// =============================================================================

/**
 * Load a YAML file and parse it.
 */
export function loadYamlFile(filepath: string): unknown {
  const content = readFileSync(filepath, 'utf8');
  return parse(content);
}

/**
 * Load all YAML files from a directory.
 */
export function loadDirectory(dir: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  const files = readdirSync(dir).filter(f => f.endsWith('.yaml'));

  for (const file of files) {
    const name = file.replace(/\.(document|fragment|schema)\.yaml$/, '');
    result[name] = loadYamlFile(join(dir, file));
  }

  return result;
}

/**
 * Ensure the output directory exists.
 */
export function ensureOutputDir(): void {
  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }
}

/**
 * Write content to a file with a success message.
 */
export function writeGeneratedFile(filename: string, content: string): void {
  const filepath = join(OUTPUT_DIR, filename);
  writeFileSync(filepath, content, 'utf8');
  console.log(`   ✓ src/generated/${filename}`);
}

// =============================================================================
// Discovery Functions
// =============================================================================

/**
 * Discover document types from schema files.
 */
export function discoverDocumentTypes(): string[] {
  const documentsDir = join(SCHEMAS_DIR, 'documents');
  const files = readdirSync(documentsDir).filter(f => f.endsWith('.document.yaml'));
  return files.map(f => f.replace('.document.yaml', '')).sort();
}

/**
 * Discover fragment types from schema files.
 */
export function discoverFragments(): string[] {
  const fragmentsDir = join(SCHEMAS_DIR, 'fragments');
  const files = readdirSync(fragmentsDir).filter(f => f.endsWith('.fragment.yaml'));
  return files.map(f => f.replace('.fragment.yaml', '')).sort();
}

// =============================================================================
// Code Generation Helpers
// =============================================================================

/**
 * Escape a string for use in TypeScript code, wrapped in quotes.
 */
export function escapeForTs(str: string): string {
  const escaped = str
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\n/g, '\\n');
  return `'${escaped}'`;
}

/**
 * Create a TypeScript banner comment.
 * @param filename - The filename being generated
 * @param description - Optional description of the file
 */
export function createBanner(filename: string, description?: string): string {
  const desc = description ?? filename;
  return `/**
 * ${desc.split('\n').join('\n * ')}
 * 
 * AUTO-GENERATED FILE - DO NOT EDIT
 * Run: npm run generate
 */`;
}
