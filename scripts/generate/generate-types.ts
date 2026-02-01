/**
 * Generate types.ts
 *
 * Generate TypeScript type definitions from YAML schemas using json-schema-to-typescript.
 *
 * This is the SCHEMA-DRIVEN implementation - types are GENERATED from YAML schemas,
 * not hardcoded. When you edit a schema, the generated types change.
 *
 * @module generate/generate-types
 */

import { compile, type Options } from 'json-schema-to-typescript';
import { join } from 'path';
import { readdirSync } from 'fs';
import { createBanner, loadYamlFile, SCHEMAS_DIR, SCHEMA_VERSION } from './utils.js';
import type { RefInfo } from './extract-metadata/index.js';

// =============================================================================
// Error Collection
// =============================================================================

interface CompilationError {
  source: string;
  typeName: string;
  error: Error;
}

const compilationErrors: CompilationError[] = [];

// =============================================================================
// Type Registry (Prevent Duplicates at Source)
// =============================================================================

/**
 * Registry to track emitted types and prevent duplicates.
 * Fails on conflicting definitions instead of silently deduplicating.
 */
class TypeRegistry {
  private emitted = new Map<string, { source: string; content: string }>();

  /**
   * Register a type. Returns true if the type is new, false if already emitted.
   * Throws if the same type name has conflicting content.
   */
  register(typeName: string, source: string, content: string): boolean {
    if (this.emitted.has(typeName)) {
      const existing = this.emitted.get(typeName)!;
      // Normalize whitespace for comparison
      const normalizedExisting = existing.content.replace(/\s+/g, ' ').trim();
      const normalizedNew = content.replace(/\s+/g, ' ').trim();
      
      if (normalizedExisting !== normalizedNew) {
        // Conflicting definitions - fail hard
        throw new Error(
          `Type ${typeName} has conflicting definitions:\n` +
          `  - ${existing.source}\n` +
          `  - ${source}\n` +
          `Fix the schema to have consistent type definitions.`
        );
      }
      return false; // Already emitted, skip
    }
    this.emitted.set(typeName, { source, content });
    return true; // New type
  }

  /**
   * Check if a type has been registered.
   */
  has(typeName: string): boolean {
    return this.emitted.has(typeName);
  }
}

const typeRegistry = new TypeRegistry();

// =============================================================================
// Configuration
// =============================================================================

const DEFS_DIR = join(SCHEMAS_DIR, 'defs');
const TYPES_DIR = join(SCHEMAS_DIR, 'types');
const DOCUMENTS_DIR = join(SCHEMAS_DIR, 'documents');

const COMPILE_OPTIONS: Partial<Options> = {
  bannerComment: '',
  additionalProperties: false,
  strictIndexSignatures: true,
  enableConstEnums: false,
  declareExternallyReferenced: false,
  unknownAny: false,
  format: true,
};

// =============================================================================
// Type Name Utilities
// =============================================================================

/**
 * Convert a schema filename to a PascalCase type name.
 * Examples:
 *   actor.types.yaml → Actor
 *   actors.schema.yaml → Actors
 */
function schemaFileToTypeName(filename: string): string {
  const baseName = filename
    .replace(/\.(types|document|schema|defs)\.yaml$/, '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/ /g, '');
  return baseName;
}

// =============================================================================
// Schema Processing
// =============================================================================

interface SchemaWithDefs {
  $defs?: Record<string, unknown>;
  properties?: Record<string, unknown>;
  [key: string]: unknown;
}

/**
 * Strip x-ubml and other non-JSON-Schema extensions.
 */
function stripExtensions(schema: unknown): unknown {
  if (Array.isArray(schema)) {
    return schema.map((item) => stripExtensions(item));
  }

  if (schema !== null && typeof schema === 'object') {
    const obj = schema as Record<string, unknown>;
    const result: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj)) {
      // Skip x-ubml, x-ubml-cli, x-ubml-id-config extensions
      if (key.startsWith('x-')) {
        continue;
      }
      result[key] = stripExtensions(value);
    }

    return result;
  }

  return schema;
}

/**
 * Collect all $defs from all sources into a single map for unified reference resolution.
 */
function collectAllDefs(
  defsDefs: Record<string, unknown>,
  typesDefs: Map<string, Record<string, unknown>>
): Record<string, unknown> {
  const allDefs: Record<string, unknown> = { ...defsDefs };

  // Add all type defs
  for (const [, defs] of typesDefs) {
    for (const [defName, defValue] of Object.entries(defs)) {
      // Don't overwrite defs from defs/
      if (!allDefs[defName]) {
        allDefs[defName] = defValue;
      }
    }
  }

  return allDefs;
}

/**
 * Find a definition by name.
 * Returns null if not found - caller must handle missing definitions.
 * 
 * Note: Case-insensitive fallback was removed because the schema is consistent
 * (uses PascalCase with only first letter capitalized for acronyms: KpiRef not KPIRef).
 * If a definition is missing, it indicates a schema typo that should be fixed.
 */
function findDef(allDefs: Record<string, unknown>, defName: string): unknown | null {
  if (allDefs[defName]) {
    return allDefs[defName];
  }
  return null;
}

/**
 * Inline all $refs recursively using a unified defs map.
 * Handles:
 * - Local refs: #/$defs/SomeType
 * - External defs refs: ../defs/refs.defs.yaml#/$defs/SomeType, ../defs/primitives.defs.yaml#/$defs/SomeType, etc.
 * - Type refs: ../types/actor.types.yaml#/$defs/SomeType
 */
function inlineAllRefs(
  schema: unknown,
  allDefs: Record<string, unknown>,
  visited: Set<string> = new Set()
): unknown {
  if (Array.isArray(schema)) {
    return schema.map((item) => inlineAllRefs(item, allDefs, visited));
  }

  if (schema !== null && typeof schema === 'object') {
    const obj = schema as Record<string, unknown>;

    // Check if this is a $ref
    if ('$ref' in obj && typeof obj.$ref === 'string') {
      const ref = obj.$ref;

      // Extract the definition name from various ref patterns
      let defName: string | null = null;

      // Pattern 1: Local ref - #/$defs/SomeType
      const localMatch = ref.match(/^#\/\$defs\/(\w+)$/);
      if (localMatch) {
        defName = localMatch[1];
      }

      // Pattern 2: External defs ref - ../defs/refs.defs.yaml#/$defs/SomeType
      const defsMatch = ref.match(/\.defs\.yaml#\/\$defs\/(\w+)$/);
      if (defsMatch) {
        defName = defsMatch[1];
      }

      // Pattern 3: Type ref - ../types/actor.types.yaml#/$defs/SomeType
      const typesMatch = ref.match(/\.types\.yaml#\/\$defs\/(\w+)$/);
      if (typesMatch) {
        defName = typesMatch[1];
      }

      if (defName) {
        const foundDef = findDef(allDefs, defName);
        if (!foundDef) {
          throw new Error(
            `Schema error: Referenced definition '${defName}' not found in $ref: ${ref}\n` +
            `Available definitions: ${Object.keys(allDefs).join(', ')}`
          );
        }

        // Prevent infinite recursion
        if (visited.has(defName)) {
          // For recursive types, just return a simple object type
          return { type: 'object' };
        }

        const newVisited = new Set(visited);
        newVisited.add(defName);

        // Recursively inline the definition
        const inlined = inlineAllRefs(foundDef, allDefs, newVisited);

        // If there were other properties besides $ref, merge them
        const { $ref, ...rest } = obj;
        if (Object.keys(rest).length > 0) {
          return { ...(inlined as object), ...rest };
        }
        return inlined;
      } else {
        throw new Error(
          `Schema error: Could not extract definition name from $ref: ${ref}\n` +
          `Expected format: #/$defs/TypeName or ../path/file.yaml#/$defs/TypeName`
        );
      }
    }

    // Process other properties
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = inlineAllRefs(value, allDefs, visited);
    }
    return result;
  }

  return schema;
}

// =============================================================================
// Type Generation
// =============================================================================

/**
 * Generate branded reference types from RefInfo.
 */
function generateBrandedRefTypes(refInfos: RefInfo[]): string {
  return refInfos
    .map((r) => {
      const typeName = r.type.charAt(0).toUpperCase() + r.type.slice(1) + 'Ref';
      return `/** ${typeName} (${r.prefix}### pattern) */
export type ${typeName} = string & { readonly __brand: '${typeName}' };`;
    })
    .join('\n\n');
}

/**
 * Generate TypeScript types from a schema's $defs.
 */
async function generateTypesFromDefs(
  defs: Record<string, unknown>,
  allDefs: Record<string, unknown>,
  sourceFile: string = 'defs'
): Promise<string[]> {
  const results: string[] = [];

  for (const [defName, defSchema] of Object.entries(defs)) {
    // Skip if this is a Ref type (we handle those specially as branded types)
    if (defName.endsWith('Ref')) {
      continue;
    }

    try {
      // Inline all refs and strip extensions
      let processedSchema = inlineAllRefs(defSchema, allDefs);
      processedSchema = stripExtensions(processedSchema);

      // Add required JSON Schema metadata
      const schemaWithMeta = {
        $schema: 'http://json-schema.org/draft-07/schema#',
        ...(processedSchema as object),
      };

      const compiled = await compile(schemaWithMeta as object, defName, COMPILE_OPTIONS);

      // Only include if it generated something meaningful
      if (
        compiled.includes(`export type ${defName} =`) ||
        compiled.includes(`export interface ${defName}`)
      ) {
        // Register with TypeRegistry to prevent duplicates
        if (typeRegistry.register(defName, sourceFile, compiled)) {
          results.push(compiled);
        }
      }
    } catch (error) {
      compilationErrors.push({
        source: sourceFile,
        typeName: defName,
        error: error as Error,
      });
    }
  }

  return results;
}

/**
 * Generate document interface types from document schemas.
 */
async function generateDocumentTypes(
  allDefs: Record<string, unknown>
): Promise<string[]> {
  const results: string[] = [];
  const documentFiles = readdirSync(DOCUMENTS_DIR).filter((f) => f.endsWith('.schema.yaml'));

  for (const file of documentFiles) {
    const filePath = join(DOCUMENTS_DIR, file);
    const docName = schemaFileToTypeName(file) + 'Document';

    try {
      let schema = loadYamlFile(filePath) as SchemaWithDefs;

      // Inline all refs
      schema = inlineAllRefs(schema, allDefs) as SchemaWithDefs;
      schema = stripExtensions(schema) as SchemaWithDefs;

      // Remove $defs from the schema itself (we want just the document structure)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { $defs, $schema, $id, title, ...documentSchema } = schema;

      const schemaWithMeta = {
        $schema: 'http://json-schema.org/draft-07/schema#',
        ...documentSchema,
      };

      const compiled = await compile(schemaWithMeta, docName, COMPILE_OPTIONS);
      
      // Register with TypeRegistry to prevent duplicates
      if (typeRegistry.register(docName, file, compiled)) {
        results.push(compiled);
      }
    } catch (error) {
      compilationErrors.push({
        source: file,
        typeName: docName,
        error: error as Error,
      });
    }
  }

  return results;
}

// =============================================================================
// Post-Processing
// =============================================================================

/**
 * Post-process generated types for basic cleanup.
 * 
 * Note: Duplicate prevention is handled at source by TypeRegistry.
 * This function only does final whitespace cleanup.
 */
function postProcessTypes(types: string): string {
  // Clean up multiple blank lines
  return types.replace(/\n{3,}/g, '\n\n');
}

// =============================================================================
// Main Generator
// =============================================================================

/**
 * Generate types.ts content from YAML schemas.
 */
export async function generateTypesTs(refInfos: RefInfo[]): Promise<string> {
  const output: string[] = [];

  // 1. Load all defs from defs/ directory
  const defsDefsMap = new Map<string, Record<string, unknown>>();
  const defsFiles = readdirSync(DEFS_DIR).filter((f) => f.endsWith('.defs.yaml'));
  
  for (const file of defsFiles) {
    const filePath = join(DEFS_DIR, file);
    const schema = loadYamlFile(filePath) as SchemaWithDefs;
    const defsName = file.replace('.defs.yaml', '');

    if (schema.$defs) {
      for (const [defName, defValue] of Object.entries(schema.$defs)) {
        defsDefsMap.set(defName, defValue as Record<string, unknown>);
      }
    }
  }
  const defsDefs = Object.fromEntries(defsDefsMap);

  // 2. Load type defs (raw, without processing yet)
  const typesDefsMap = new Map<string, Record<string, unknown>>();
  const typesFiles = readdirSync(TYPES_DIR).filter((f) => f.endsWith('.types.yaml'));

  for (const file of typesFiles) {
    const filePath = join(TYPES_DIR, file);
    const schema = loadYamlFile(filePath) as SchemaWithDefs;
    const typesName = file.replace('.types.yaml', '');

    if (schema.$defs) {
      typesDefsMap.set(typesName, schema.$defs as Record<string, unknown>);
    }
  }

  // 3. Build unified defs map for ref resolution
  const allDefs = collectAllDefs(defsDefs, typesDefsMap);

  // 4. Generate branded reference types
  output.push('// =============================================================================');
  output.push('// REFERENCE TYPES (Branded strings for type safety)');
  output.push('// =============================================================================\n');
  output.push(generateBrandedRefTypes(refInfos));
  output.push('\n');

  // 5. Helper function for creating typed references
  output.push('/** Helper to create typed references */');
  output.push('export function createRef<T extends string>(id: string): T {');
  output.push('  return id as T;');
  output.push('}\n');

  // 6. Generate types from defs (primitives, refs, shared, etc.)
  output.push('// =============================================================================');
  output.push('// COMMON TYPES (from defs/*.defs.yaml)');
  output.push('// =============================================================================\n');

  const defsTypes = await generateTypesFromDefs(defsDefs, allDefs, 'defs/*.defs.yaml');
  output.push(defsTypes.join('\n\n'));
  output.push('\n');

  // 7. Generate types from types/
  output.push('// =============================================================================');
  output.push('// ENTITY TYPES (from types/*.types.yaml)');
  output.push('// =============================================================================\n');

  for (const [typesName, defs] of typesDefsMap) {
    const entityTypes = await generateTypesFromDefs(defs, allDefs, `types/${typesName}.types.yaml`);
    if (entityTypes.length > 0) {
      output.push(`// --- ${typesName} ---`);
      output.push(entityTypes.join('\n\n'));
      output.push('');
    }
  }

  // 8. Generate document types
  output.push('// =============================================================================');
  output.push('// DOCUMENT TYPES (from document schemas)');
  output.push('// =============================================================================\n');

  const documentTypes = await generateDocumentTypes(allDefs);
  output.push(documentTypes.join('\n\n'));
  output.push('\n');

  // 9. Add schema version type
  output.push('// =============================================================================');
  output.push('// VERSION TYPE');
  output.push('// =============================================================================\n');
  output.push(`/** Current UBML schema version type */`);
  output.push(`export type SchemaVersionString = '${SCHEMA_VERSION}';\n`);

  // 10. Add union type for all documents
  output.push('// =============================================================================');
  output.push('// DOCUMENT UNION TYPE');
  output.push('// =============================================================================\n');

  const docFiles = readdirSync(DOCUMENTS_DIR).filter((f) => f.endsWith('.schema.yaml'));
  const docTypeNames = docFiles.map((f) => schemaFileToTypeName(f) + 'Document');
  output.push('export type UBMLDocumentContent =');
  output.push('  | ' + docTypeNames.join('\n  | ') + ';\n');

  // 11. Assemble final output
  const banner = createBanner(
    'types.ts',
    `UBML TypeScript Types

These types are GENERATED from the YAML schemas in /schemas.
They provide type-safe access to UBML document structures.

DO NOT EDIT - Changes will be overwritten by 'npm run generate'.
To modify types, edit the corresponding YAML schema and regenerate.`
  );

  let finalOutput =
    banner + '\n\n/* eslint-disable @typescript-eslint/no-explicit-any */\n\n' + output.join('\n');

  // Post-process to remove duplicates and clean up
  finalOutput = postProcessTypes(finalOutput);

  // Check for compilation errors and fail with details
  if (compilationErrors.length > 0) {
    console.error(`\n❌ ${compilationErrors.length} type compilation failures:\n`);
    for (const err of compilationErrors) {
      console.error(`  ${err.source} → ${err.typeName}`);
      console.error(`    ${err.error.message}\n`);
    }
    throw new Error(`Type generation failed with ${compilationErrors.length} errors`);
  }

  return finalOutput;
}
