/**
 * Metadata Extraction
 *
 * Extract metadata from schema files for code generation.
 *
 * @module generate/extract-metadata
 */

import { join } from 'path';
import { readdirSync } from 'fs';
import { loadYamlFile, SCHEMAS_DIR } from '../utils.js';

// Re-export all types and functions
export type { RefInfo, IdConfig } from './extract-id.js';
export type { 
  PatternHint, 
  NestedPropertyHint, 
  EnumValueHint, 
  EnumHint, 
  ToolingHints 
} from './extract-hints.js';
export type { 
  TemplateSection, 
  TemplateData, 
  CommonPropertiesConfig 
} from './extract-templates.js';
export type { 
  ContentDetectionConfig, 
  ValidationPatterns, 
  CategoryConfig 
} from './extract-content.js';

export { extractIdPatterns, extractIdConfig } from './extract-id.js';
export { extractToolingHints } from './extract-hints.js';
export { extractTemplateData, extractCommonProperties } from './extract-templates.js';
export { 
  extractContentDetectionConfig, 
  extractValidationPatterns, 
  extractCategoryConfig 
} from './extract-content.js';

// =============================================================================
// Reference Field Extraction
// =============================================================================

/**
 * Extract reference field names from all schemas.
 */
export function extractReferenceFields(): string[] {
  const refFieldsSet = new Set<string>();

  function walkSchema(obj: unknown): void {
    if (!obj || typeof obj !== 'object') return;

    if (Array.isArray(obj)) {
      obj.forEach((item) => walkSchema(item));
      return;
    }

    const record = obj as Record<string, unknown>;

    if (record.properties && typeof record.properties === 'object') {
      const props = record.properties as Record<string, unknown>;

      for (const [propName, propDef] of Object.entries(props)) {
        if (propDef && typeof propDef === 'object') {
          const def = propDef as Record<string, unknown>;

          // Check for direct $ref to a *Ref type
          if (typeof def.$ref === 'string' && def.$ref.includes('Ref')) {
            refFieldsSet.add(propName);
          }

          // Check for array items with $ref
          if (def.items && typeof def.items === 'object') {
            const items = def.items as Record<string, unknown>;
            if (typeof items.$ref === 'string' && items.$ref.includes('Ref')) {
              refFieldsSet.add(propName);
            }
            // Handle oneOf/anyOf in items
            const variants = (items.oneOf || items.anyOf) as unknown[] | undefined;
            if (Array.isArray(variants)) {
              for (const variant of variants) {
                if (variant && typeof variant === 'object') {
                  const v = variant as Record<string, unknown>;
                  if (typeof v.$ref === 'string' && v.$ref.includes('Ref')) {
                    refFieldsSet.add(propName);
                  }
                }
              }
            }
          }

          // Check for oneOf/anyOf at property level
          const propVariants = (def.oneOf || def.anyOf) as unknown[] | undefined;
          if (Array.isArray(propVariants)) {
            for (const variant of propVariants) {
              if (variant && typeof variant === 'object') {
                const v = variant as Record<string, unknown>;
                if (typeof v.$ref === 'string' && v.$ref.includes('Ref')) {
                  refFieldsSet.add(propName);
                }
              }
            }
          }
        }
      }
    }

    // Recursively walk nested structures
    for (const value of Object.values(record)) {
      walkSchema(value);
    }
  }

  // Walk all document and type schemas
  const documentsDir = join(SCHEMAS_DIR, 'documents');
  const typesDir = join(SCHEMAS_DIR, 'types');
  const defsDir = join(SCHEMAS_DIR, 'defs');

  // Walk all defs files
  for (const file of readdirSync(defsDir).filter((f: string) => f.endsWith('.yaml'))) {
    walkSchema(loadYamlFile(join(defsDir, file)));
  }

  for (const file of readdirSync(documentsDir).filter((f: string) => f.endsWith('.yaml'))) {
    walkSchema(loadYamlFile(join(documentsDir, file)));
  }

  for (const file of readdirSync(typesDir).filter((f: string) => f.endsWith('.yaml'))) {
    walkSchema(loadYamlFile(join(typesDir, file)));
  }

  return Array.from(refFieldsSet).sort();
}
