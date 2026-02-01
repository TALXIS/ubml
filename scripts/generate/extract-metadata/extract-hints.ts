/**
 * Tooling Hints Extraction
 *
 * Extract pattern, nested property, and enum hints from x-ubml metadata.
 *
 * @module generate/extract-metadata/extract-hints
 */

import { join } from 'path';
import { readdirSync } from 'fs';
import { loadYamlFile, SCHEMAS_DIR } from '../utils.js';

export interface PatternHint {
  pattern: string;
  humanName: string;
  errorHint: string;
  examples: string[];
  prefix?: string;
  commonMistakes?: Array<{ pattern: string; message: string }>;
}

export interface NestedPropertyHint {
  parentProperty: string;
  childProperties: string[];
  misplacementHint: string;
  misplacementExample: string;
}

export interface EnumValueHint {
  value: string;
  hint: string;
}

export interface EnumHint {
  propertyNames: string[];
  values: string[];
  valueMistakes?: Record<string, EnumValueHint>;
}

export interface ToolingHints {
  patterns: PatternHint[];
  nestedProperties: NestedPropertyHint[];
  enums: EnumHint[];
}

/**
 * Extract tooling hints from x-ubml metadata.
 * This function matches the original generate-all.ts extractToolingHints logic.
 */
export function extractToolingHints(): ToolingHints {
  const patterns: PatternHint[] = [];
  const nestedProperties: NestedPropertyHint[] = [];
  const enums: EnumHint[] = [];

  function extractFromDef(name: string, def: Record<string, unknown>): void {
    // Extract pattern hints from types with patterns and x-ubml
    if (def.pattern && typeof def.pattern === 'string') {
      const xubml = def['x-ubml'] as Record<string, unknown> | undefined;
      const examples = (def.examples as string[]) || [];

      // Generate default hint from pattern if not specified
      let humanName = name.replace(/Ref$/, ' ID').replace(/String$/, '');
      let errorHint = `Must match pattern: ${def.pattern}`;
      let prefix: string | undefined;
      let commonMistakes: Array<{ pattern: string; message: string }> | undefined;

      if (xubml) {
        if (xubml.humanName) humanName = xubml.humanName as string;
        if (xubml.errorHint) errorHint = xubml.errorHint as string;
        if (xubml.prefix) prefix = xubml.prefix as string;
        if (xubml.commonMistakes) {
          commonMistakes = xubml.commonMistakes as Array<{ pattern: string; message: string }>;
        }
      }

      // Auto-detect prefix from pattern like "^AC\\d{3,}$"
      if (!prefix) {
        const match = (def.pattern as string).match(/^\^([A-Z]+)\\d/);
        if (match) prefix = match[1];
      }

      patterns.push({
        pattern: def.pattern as string,
        humanName,
        errorHint,
        examples,
        prefix,
        commonMistakes,
      });
    }

    // Extract nested property hints from x-ubml.nestedProperties
    const xubml = def['x-ubml'] as Record<string, unknown> | undefined;
    if (xubml?.nestedProperties && Array.isArray(xubml.nestedProperties)) {
      // Property name matches type name exactly (e.g., SCQH type → SCQH property, RACI type → RACI property)
      const parentProp = name;
      nestedProperties.push({
        parentProperty: parentProp,
        childProperties: xubml.nestedProperties as string[],
        misplacementHint: (xubml.misplacementHint as string) || `These properties belong inside '${parentProp}:'`,
        misplacementExample: (xubml.misplacementExample as string) || '',
      });
    }

    // Extract enum hints from types with enum and x-ubml
    if (def.enum && Array.isArray(def.enum) && xubml) {
      const propertyNames = (xubml.propertyNames as string[]) || [name.toLowerCase()];
      const values = def.enum as string[];
      const valueMistakes = xubml.valueMistakes as Record<string, EnumValueHint> | undefined;

      enums.push({
        propertyNames,
        values,
        valueMistakes,
      });
    }

    // Also check inside properties for inline enums with x-ubml
    if (def.properties && typeof def.properties === 'object') {
      const props = def.properties as Record<string, Record<string, unknown>>;
      for (const [propName, propDef] of Object.entries(props)) {
        if (propDef.enum && Array.isArray(propDef.enum)) {
          const propXubml = propDef['x-ubml'] as Record<string, unknown> | undefined;
          if (propXubml) {
            const propertyNames = (propXubml.propertyNames as string[]) || [propName];
            const values = propDef.enum as string[];
            const valueMistakes = propXubml.valueMistakes as Record<string, EnumValueHint> | undefined;

            enums.push({
              propertyNames,
              values,
              valueMistakes,
            });
          }
        }
      }
    }
  }

  function walkDefs(obj: unknown): void {
    if (!obj || typeof obj !== 'object') return;

    const record = obj as Record<string, unknown>;

    // Process $defs
    if (record.$defs && typeof record.$defs === 'object') {
      const defs = record.$defs as Record<string, Record<string, unknown>>;
      for (const [name, def] of Object.entries(defs)) {
        extractFromDef(name, def);
      }
    }
  }

  // Load all schemas and extract hints
  const defsDir = join(SCHEMAS_DIR, 'defs');
  const typesDir = join(SCHEMAS_DIR, 'types');
  
  // Walk all defs files
  for (const file of readdirSync(defsDir).filter((f: string) => f.endsWith('.yaml'))) {
    walkDefs(loadYamlFile(join(defsDir, file)));
  }
  
  // Walk all type files
  for (const file of readdirSync(typesDir).filter((f: string) => f.endsWith('.yaml'))) {
    walkDefs(loadYamlFile(join(typesDir, file)));
  }

  return { patterns, nestedProperties, enums };
}
