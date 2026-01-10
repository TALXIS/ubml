/**
 * Bundle Schemas
 *
 * Bundle YAML schemas into TypeScript for browser usage.
 *
 * @module generate/bundle-schemas
 */

import { join } from 'path';
import { loadYamlFile, loadDirectory, SCHEMAS_DIR, createBanner } from './utils.js';

// =============================================================================
// Types
// =============================================================================

export interface BundledSchemas {
  root: object;
  defs: object;
  documents: Record<string, object>;
  fragments: Record<string, object>;
}

// =============================================================================
// Bundle Functions
// =============================================================================

/**
 * Load and bundle all schemas for embedding.
 */
export function bundleSchemas(documentTypes: string[], fragmentTypes: string[]): BundledSchemas {
  // Load main schema
  const root = loadYamlFile(join(SCHEMAS_DIR, 'ubml.schema.yaml')) as object;

  // Load defs
  const defs = loadYamlFile(join(SCHEMAS_DIR, 'common', 'defs.schema.yaml')) as object;

  // Load documents using loadDirectory
  const documents = loadDirectory(join(SCHEMAS_DIR, 'documents')) as Record<string, object>;

  // Load fragments using loadDirectory
  const fragments = loadDirectory(join(SCHEMAS_DIR, 'fragments')) as Record<string, object>;

  return { root, defs, documents, fragments };
}

/**
 * Generate bundled.ts content.
 */
export function generateBundledTs(schemas: BundledSchemas): string {
  return `${createBanner('bundled.ts', `Bundled UBML schemas.

These schemas are embedded at build time for browser compatibility.
They can be used without any file system access.`)}

import type { DocumentType } from './data.js';

/** Root UBML schema */
export const rootSchema = ${JSON.stringify(schemas.root, null, 2)} as const;

/** Common definitions schema */
export const defsSchema = ${JSON.stringify(schemas.defs, null, 2)} as const;

/** Document schemas by type */
export const documentSchemas: Record<DocumentType, object> = ${JSON.stringify(schemas.documents, null, 2)};

/** Fragment schemas by name */
export const fragmentSchemas: Record<string, object> = ${JSON.stringify(schemas.fragments, null, 2)};

/**
 * Get all schemas as a map keyed by $id.
 * Useful for Ajv's loadSchema callback.
 */
export function getAllSchemasById(): Map<string, object> {
  const schemas = new Map<string, object>();
  
  const addSchema = (schema: object) => {
    const id = (schema as { $id?: string }).$id;
    if (id) {
      schemas.set(id, schema);
    }
  };
  
  addSchema(rootSchema);
  addSchema(defsSchema);
  Object.values(documentSchemas).forEach(addSchema);
  Object.values(fragmentSchemas).forEach(addSchema);
  
  return schemas;
}
`;
}
