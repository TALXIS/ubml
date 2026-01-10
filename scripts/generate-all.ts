#!/usr/bin/env node
/**
 * Unified UBML schema generation script.
 * 
 * This script is the SINGLE SOURCE OF TRUTH for all generated code.
 * It reads YAML schemas and generates:
 * 
 * 1. src/generated/bundled.ts - Bundled schemas for browser use
 * 2. src/generated/metadata.ts - Document types, ID patterns, etc.
 * 3. src/generated/types.ts - TypeScript interfaces
 * 
 * Run: npm run generate
 * 
 * Philosophy:
 * - One file change (schema), everything else derived
 * - No manual metadata duplication
 * - All schema-related constants extracted at build time
 */

import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const schemasDir = join(__dirname, '..', 'schemas');
const outputDir = join(__dirname, '..', 'src', 'generated');

// ============================================================================
// VERSION - Derived from package.json (single source of truth)
// ============================================================================

const packageJson = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf8'));
const PACKAGE_VERSION = packageJson.version as string; // e.g., "1.1.0"
const SCHEMA_VERSION = PACKAGE_VERSION.split('.').slice(0, 2).join('.'); // e.g., "1.1"

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function loadYamlFile(filepath: string): unknown {
  const content = readFileSync(filepath, 'utf8');
  return parse(content);
}

function loadDirectory(dir: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  const files = readdirSync(dir).filter(f => f.endsWith('.yaml'));
  
  for (const file of files) {
    const name = file.replace(/\.(document|fragment|schema)\.yaml$/, '');
    result[name] = loadYamlFile(join(dir, file));
  }
  
  return result;
}

function ensureOutputDir() {
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }
}

// ============================================================================
// PHASE 1: DISCOVER DOCUMENT TYPES FROM SCHEMA FILES
// ============================================================================

function discoverDocumentTypes(): string[] {
  const documentsDir = join(schemasDir, 'documents');
  const files = readdirSync(documentsDir).filter(f => f.endsWith('.document.yaml'));
  return files.map(f => f.replace('.document.yaml', '')).sort();
}

function discoverFragments(): string[] {
  const fragmentsDir = join(schemasDir, 'fragments');
  const files = readdirSync(fragmentsDir).filter(f => f.endsWith('.fragment.yaml'));
  return files.map(f => f.replace('.fragment.yaml', '')).sort();
}

// ============================================================================
// PHASE 2: EXTRACT ID PATTERNS FROM DEFS.SCHEMA.YAML
// ============================================================================

interface RefInfo {
  prefix: string;
  type: string;
  pattern: string;
}

function extractIdPatterns(): RefInfo[] {
  const defsPath = join(schemasDir, 'common', 'defs.schema.yaml');
  const defs = loadYamlFile(defsPath) as { $defs?: Record<string, { pattern?: string; description?: string }> };
  
  const refInfos: RefInfo[] = [];
  
  if (defs.$defs) {
    for (const [name, def] of Object.entries(defs.$defs)) {
      // Only process Ref types with patterns
      if (name.endsWith('Ref') && def.pattern) {
        // Extract prefix from pattern like "^AC\\d{3,}$" -> "AC"
        // After YAML parsing, the pattern is "^AC\\d{3,}$" (with single backslash escape)
        const match = def.pattern.match(/^\^([A-Z]+)\\d/);
        if (match) {
          const prefix = match[1];
          // Convert RefName to element type: ActorRef -> actor, HypothesisTreeRef -> hypothesistree
          const typeName = name.replace('Ref', '');
          // Convert PascalCase to lowercase: HypothesisTree -> hypothesistree
          const type = typeName.charAt(0).toLowerCase() + typeName.slice(1);
          refInfos.push({
            prefix,
            type,
            pattern: def.pattern,
          });
        }
      }
    }
  }
  
  return refInfos.sort((a, b) => a.prefix.localeCompare(b.prefix));
}

// ============================================================================
// PHASE 2b: EXTRACT ID GENERATION CONFIG FROM SCHEMA
// ============================================================================

interface IdConfig {
  digitLength: number;
  pattern: string;
  initOffset: number;
  addOffset: number;
}

function extractIdConfig(): IdConfig {
  const defsPath = join(schemasDir, 'common', 'defs.schema.yaml');
  const defs = loadYamlFile(defsPath) as { 'x-ubml-id-config'?: IdConfig };
  
  const config = defs['x-ubml-id-config'];
  if (!config) {
    // Defaults if not specified
    return {
      digitLength: 5,
      pattern: '^[A-Z]+\\d{5}$',
      initOffset: 1,
      addOffset: 1000,
    };
  }
  
  return {
    digitLength: config.digitLength ?? 5,
    pattern: config.pattern ?? '^[A-Z]+\\d{5}$',
    initOffset: config.initOffset ?? 1,
    addOffset: config.addOffset ?? 1000,
  };
}

// ============================================================================
// PHASE 3: EXTRACT REFERENCE FIELD NAMES FROM ALL SCHEMAS
// ============================================================================

function extractReferenceFields(): string[] {
  const refFieldsSet = new Set<string>();
  
  // Walk through all schemas and find properties that use $ref to a *Ref type
  function walkSchema(obj: unknown, path: string = ''): void {
    if (!obj || typeof obj !== 'object') return;
    
    if (Array.isArray(obj)) {
      obj.forEach((item, i) => walkSchema(item, `${path}[${i}]`));
      return;
    }
    
    const record = obj as Record<string, unknown>;
    
    // Check if this object has properties (indicating it's a schema with properties)
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
            if (Array.isArray(items.oneOf) || Array.isArray(items.anyOf)) {
              const variants = (items.oneOf || items.anyOf) as unknown[];
              for (const variant of variants) {
                if (variant && typeof variant === 'object') {
                  const v = variant as Record<string, unknown>;
                  if (typeof v.$ref === 'string' && v.$ref.includes('Ref')) {
                    refFieldsSet.add(propName);
                    break;
                  }
                }
              }
            }
          }
          
          // Check for oneOf/anyOf at property level
          if (Array.isArray(def.oneOf) || Array.isArray(def.anyOf)) {
            const variants = (def.oneOf || def.anyOf) as unknown[];
            for (const variant of variants) {
              if (variant && typeof variant === 'object') {
                const v = variant as Record<string, unknown>;
                if (typeof v.$ref === 'string' && v.$ref.includes('Ref')) {
                  refFieldsSet.add(propName);
                  break;
                }
              }
            }
          }
        }
      }
    }
    
    // Recursively walk all nested objects
    for (const value of Object.values(record)) {
      walkSchema(value, path);
    }
  }
  
  // Load and walk all schemas
  const defsSchema = loadYamlFile(join(schemasDir, 'common', 'defs.schema.yaml'));
  const documentSchemas = loadDirectory(join(schemasDir, 'documents'));
  const fragmentSchemas = loadDirectory(join(schemasDir, 'fragments'));
  
  walkSchema(defsSchema);
  Object.values(documentSchemas).forEach(schema => walkSchema(schema));
  Object.values(fragmentSchemas).forEach(schema => walkSchema(schema));
  
  return Array.from(refFieldsSet).sort();
}

// ============================================================================
// PHASE 4: EXTRACT TOOLING HINTS FROM x-ubml METADATA
// ============================================================================

interface PatternHint {
  pattern: string;
  humanName: string;
  errorHint: string;
  examples: string[];
  prefix?: string;
  commonMistakes?: Array<{ pattern: string; message: string }>;
}

interface NestedPropertyHint {
  parentProperty: string;
  childProperties: string[];
  misplacementHint: string;
  misplacementExample: string;
}

interface EnumValueHint {
  value: string;
  hint: string;
}

interface EnumHint {
  /** Property names where this enum is used */
  propertyNames: string[];
  /** Valid values for this enum */
  values: string[];
  /** Hints for common mistakes (maps invalid value to hint) */
  valueMistakes?: Record<string, EnumValueHint>;
}

interface ToolingHints {
  patterns: PatternHint[];
  nestedProperties: NestedPropertyHint[];
  enums: EnumHint[];
}

function extractToolingHints(): ToolingHints {
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
      const parentProp = findPropertyNameForType(name);
      if (parentProp) {
        nestedProperties.push({
          parentProperty: parentProp,
          childProperties: xubml.nestedProperties as string[],
          misplacementHint: (xubml.misplacementHint as string) || `These properties belong inside '${parentProp}'`,
          misplacementExample: (xubml.misplacementExample as string) || '',
        });
      }
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
  
  function findPropertyNameForType(typeName: string): string | undefined {
    // Map type names to their common property names
    const typeToProperty: Record<string, string> = {
      'RACI': 'raci',
      'Loop': 'loop',
      'Block': 'block',
      'Approval': 'approval',
      'Review': 'review',
    };
    return typeToProperty[typeName] || typeName.toLowerCase();
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
  const defsSchema = loadYamlFile(join(schemasDir, 'common', 'defs.schema.yaml'));
  const fragmentSchemas = loadDirectory(join(schemasDir, 'fragments'));
  
  walkDefs(defsSchema);
  Object.values(fragmentSchemas).forEach(schema => walkDefs(schema));
  
  return { patterns, nestedProperties, enums };
}

// ============================================================================
// PHASE 5: EXTRACT TEMPLATE DATA FROM DOCUMENT SCHEMAS
// ============================================================================

interface SectionInfo {
  /** Property name in the document (e.g., "processes", "actors") */
  name: string;
  /** ID pattern prefix (e.g., "PR", "AC") */
  idPrefix: string;
  /** Description from schema */
  description: string;
  /** Required properties for items in this section */
  requiredProps: string[];
  /** All properties with their types and descriptions */
  properties: PropertyInfo[];
  /** Template defaults from x-ubml-cli */
  defaults?: Record<string, unknown>;
}

interface PropertyInfo {
  name: string;
  type: string;
  description: string;
  required: boolean;
  enumValues?: string[];
  default?: unknown;
}

interface DocumentTemplateInfo {
  /** Document type name */
  type: string;
  /** Short description */
  shortDescription: string;
  /** Getting started tips */
  gettingStarted: string[];
  /** Sections in this document type */
  sections: SectionInfo[];
  /** Document-level required properties */
  requiredDocProps: string[];
}

function extractTemplateData(): DocumentTemplateInfo[] {
  const documentsDir = join(schemasDir, 'documents');
  const documentSchemas = loadDirectory(documentsDir);
  const fragmentSchemas = loadDirectory(join(schemasDir, 'fragments'));
  const defsSchema = loadYamlFile(join(schemasDir, 'common', 'defs.schema.yaml')) as Record<string, unknown>;
  
  const templates: DocumentTemplateInfo[] = [];
  
  for (const [docType, schema] of Object.entries(documentSchemas)) {
    const docSchema = schema as Record<string, unknown>;
    const xubmlCli = docSchema['x-ubml-cli'] as Record<string, unknown> | undefined;
    const properties = docSchema.properties as Record<string, Record<string, unknown>> | undefined;
    const required = (docSchema.required as string[]) || [];
    
    const templateInfo: DocumentTemplateInfo = {
      type: docType,
      shortDescription: xubmlCli?.shortDescription as string || '',
      gettingStarted: (xubmlCli?.gettingStarted as string[]) || [],
      sections: [],
      requiredDocProps: required,
    };
    
    // Extract templateDefaults
    const templateDefaults = xubmlCli?.templateDefaults as Record<string, Record<string, unknown>> | undefined;
    
    if (properties) {
      for (const [propName, propDef] of Object.entries(properties)) {
        // Skip non-section properties
        if (['ubml', 'name', 'description', 'metadata'].includes(propName)) continue;
        
        // Check if this is a patternProperties section (keyed by ID pattern)
        if (propDef.patternProperties && typeof propDef.patternProperties === 'object') {
          const patternProps = propDef.patternProperties as Record<string, Record<string, unknown>>;
          
          for (const [pattern, itemSchema] of Object.entries(patternProps)) {
            // Extract ID prefix from pattern like "^PR\\d{3,}$" -> "PR"
            const prefixMatch = pattern.match(/^\^([A-Z]+)\\d/);
            const idPrefix = prefixMatch ? prefixMatch[1] : '';
            
            // Resolve $ref to get actual item schema
            const resolvedSchema = resolveRef(itemSchema, fragmentSchemas, defsSchema);
            const itemRequired = (resolvedSchema.required as string[]) || [];
            const itemProps = (resolvedSchema.properties as Record<string, Record<string, unknown>>) || {};
            
            const sectionInfo: SectionInfo = {
              name: propName,
              idPrefix,
              description: (propDef.description as string) || '',
              requiredProps: itemRequired,
              properties: [],
              defaults: templateDefaults?.[propName],
            };
            
            // Extract property info
            for (const [itemPropName, itemPropDef] of Object.entries(itemProps)) {
              const propInfo: PropertyInfo = {
                name: itemPropName,
                type: inferType(itemPropDef),
                description: cleanDescription((itemPropDef.description as string) || ''),
                required: itemRequired.includes(itemPropName),
                enumValues: itemPropDef.enum as string[] | undefined,
                default: itemPropDef.default,
              };
              sectionInfo.properties.push(propInfo);
            }
            
            // Sort: required first, then alphabetically
            sectionInfo.properties.sort((a, b) => {
              if (a.required !== b.required) return a.required ? -1 : 1;
              return a.name.localeCompare(b.name);
            });
            
            templateInfo.sections.push(sectionInfo);
          }
        }
      }
    }
    
    templates.push(templateInfo);
  }
  
  return templates;
}

function resolveRef(
  schema: Record<string, unknown>, 
  fragmentSchemas: Record<string, unknown>,
  defsSchema: Record<string, unknown>
): Record<string, unknown> {
  if (!schema.$ref || typeof schema.$ref !== 'string') {
    return schema;
  }
  
  const ref = schema.$ref as string;
  
  // Handle fragment references like "../fragments/process.fragment.yaml#/$defs/Process"
  const fragmentMatch = ref.match(/\.\.\/fragments\/(\w+)\.fragment\.yaml#\/\$defs\/(\w+)/);
  if (fragmentMatch) {
    const [, fragmentName, defName] = fragmentMatch;
    const fragment = fragmentSchemas[fragmentName] as Record<string, unknown> | undefined;
    if (fragment?.$defs) {
      const defs = fragment.$defs as Record<string, Record<string, unknown>>;
      return defs[defName] || schema;
    }
  }
  
  // Handle common defs references
  const defsMatch = ref.match(/\.\.\/common\/defs\.schema\.yaml#\/\$defs\/(\w+)/);
  if (defsMatch) {
    const [, defName] = defsMatch;
    const defs = defsSchema.$defs as Record<string, Record<string, unknown>> | undefined;
    if (defs) {
      return defs[defName] || schema;
    }
  }
  
  return schema;
}

function inferType(propDef: Record<string, unknown>): string {
  if (propDef.enum) return 'enum';
  if (propDef.$ref) {
    const ref = propDef.$ref as string;
    if (ref.includes('Ref')) return 'ref';
    return 'object';
  }
  if (propDef.type === 'array') return 'array';
  if (propDef.type === 'object') return 'object';
  if (propDef.type === 'number' || propDef.type === 'integer') return 'number';
  if (propDef.type === 'boolean') return 'boolean';
  return propDef.type as string || 'string';
}

function cleanDescription(desc: string): string {
  // Get first line/sentence only, clean up whitespace
  return desc.split('\n')[0].trim().replace(/\s+/g, ' ');
}

// ============================================================================
// GENERATE: src/generated/bundled.ts
// ============================================================================

function generateBundledSchemas(documentTypes: string[]): string {
  const rootSchema = loadYamlFile(join(schemasDir, 'ubml.schema.yaml'));
  const defsSchema = loadYamlFile(join(schemasDir, 'common', 'defs.schema.yaml'));
  const documentSchemas = loadDirectory(join(schemasDir, 'documents'));
  const fragmentSchemas = loadDirectory(join(schemasDir, 'fragments'));

  return `/**
 * Bundled UBML schemas.
 * 
 * AUTO-GENERATED FILE - DO NOT EDIT
 * Run: npm run generate
 * 
 * These schemas are embedded at build time for browser compatibility.
 * They can be used without any file system access.
 */

import type { DocumentType } from './metadata.js';

/** Root UBML schema */
export const rootSchema = ${JSON.stringify(rootSchema, null, 2)} as const;

/** Common definitions schema */
export const defsSchema = ${JSON.stringify(defsSchema, null, 2)} as const;

/** Document schemas by type */
export const documentSchemas: Record<DocumentType, object> = ${JSON.stringify(documentSchemas, null, 2)};

/** Fragment schemas by name */
export const fragmentSchemas: Record<string, object> = ${JSON.stringify(fragmentSchemas, null, 2)};

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

// ============================================================================
// GENERATE: src/generated/metadata.ts
// ============================================================================

function generateMetadata(
  documentTypes: string[], 
  fragments: string[], 
  refInfos: RefInfo[], 
  refFields: string[],
  toolingHints: ToolingHints,
  idConfig: IdConfig
): string {
  const idPrefixesEntries = refInfos.map(r => `  ${r.prefix}: '${r.type}'`).join(',\n');
  const refFieldsEntries = refFields.map(f => `  '${f}'`).join(',\n');
  
  // Generate pattern hints
  const patternHintsJson = JSON.stringify(toolingHints.patterns, null, 2);
  
  // Generate nested property hints  
  const nestedPropsJson = JSON.stringify(toolingHints.nestedProperties, null, 2);
  
  // Generate enum hints
  const enumHintsJson = JSON.stringify(toolingHints.enums, null, 2);
  
  return `/**
 * Schema metadata derived from YAML schema files.
 * 
 * AUTO-GENERATED FILE - DO NOT EDIT
 * Run: npm run generate
 * 
 * This file is the SINGLE SOURCE OF TRUTH for:
 * - Document types (discovered from schemas/documents/*.document.yaml)
 * - Fragment names (discovered from schemas/fragments/*.fragment.yaml)
 * - ID prefixes and patterns (extracted from common/defs.schema.yaml)
 * - Reference field names (extracted from all schemas)
 */

// ============================================================================
// DOCUMENT TYPES (discovered from schema files)
// ============================================================================

/**
 * Supported UBML document types.
 * Derived from: schemas/documents/*.document.yaml
 */
export const DOCUMENT_TYPES = [
${documentTypes.map(t => `  '${t}'`).join(',\n')}
] as const;

export type DocumentType = typeof DOCUMENT_TYPES[number];

/**
 * Check if a string is a valid document type.
 */
export function isDocumentType(type: string): type is DocumentType {
  return DOCUMENT_TYPES.includes(type as DocumentType);
}

// ============================================================================
// FRAGMENT NAMES (discovered from schema files)
// ============================================================================

/**
 * Available fragment schema names.
 * Derived from: schemas/fragments/*.fragment.yaml
 */
export const FRAGMENT_NAMES = [
${fragments.map(f => `  '${f}'`).join(',\n')}
] as const;

export type FragmentName = typeof FRAGMENT_NAMES[number];

// ============================================================================
// SCHEMA VERSION (re-exported from constants for convenience)
// ============================================================================

export { SCHEMA_VERSION } from '../constants.js';

// ============================================================================
// SCHEMA PATHS
// ============================================================================

/**
 * Schema file paths relative to the schemas directory.
 */
export const SCHEMA_PATHS = {
  root: 'ubml.schema.yaml',
  defs: 'common/defs.schema.yaml',
  documents: {
${documentTypes.map(t => `    ${t}: 'documents/${t}.document.yaml'`).join(',\n')}
  } as const,
  fragments: {
${fragments.map(f => `    ${f}: 'fragments/${f}.fragment.yaml'`).join(',\n')}
  } as const,
} as const;

/**
 * Get the schema path for a document type.
 */
export function getSchemaPathForDocumentType(type: DocumentType): string {
  return SCHEMA_PATHS.documents[type];
}

// ============================================================================
// ID GENERATION CONFIGURATION (extracted from defs.schema.yaml)
// ============================================================================

/**
 * Configuration for ID generation.
 * Extracted from: schemas/common/defs.schema.yaml x-ubml-id-config
 */
export const ID_CONFIG = {
  /** Number of digits in ID (zero-padded) */
  digitLength: ${idConfig.digitLength},
  /** Regex pattern for validation */
  pattern: '${idConfig.pattern.replace(/\\/g, '\\\\')}',
  /** Starting number for 'ubml init' templates */
  initOffset: ${idConfig.initOffset},
  /** Starting number for 'ubml add' templates */
  addOffset: ${idConfig.addOffset},
} as const;

// ============================================================================
// ID PATTERNS (extracted from defs.schema.yaml)
// ============================================================================

/**
 * ID prefix to element type mapping.
 * Extracted from: schemas/common/defs.schema.yaml $defs/*Ref patterns
 */
export const ID_PREFIXES = {
${idPrefixesEntries}
} as const;

export type IdPrefix = keyof typeof ID_PREFIXES;
export type ElementType = (typeof ID_PREFIXES)[IdPrefix];

/**
 * ID patterns for UBML elements (RegExp).
 * Uses ${idConfig.digitLength}+ digit format (zero-padded).
 */
export const ID_PATTERNS: Record<ElementType, RegExp> = Object.fromEntries(
  Object.entries(ID_PREFIXES).map(([prefix, type]) => [
    type,
    new RegExp(\`^\${prefix}\\\\d{${idConfig.digitLength},}$\`),
  ])
) as Record<ElementType, RegExp>;

/**
 * Combined pattern matching any valid UBML ID.
 */
export const ALL_ID_PATTERN = new RegExp(
  \`^(\${Object.keys(ID_PREFIXES).join('|')})\\\\d{${idConfig.digitLength},}$\`
);

// ============================================================================
// ID GENERATION UTILITIES
// ============================================================================

/**
 * Format an ID with the given prefix and number.
 * @example formatId('AC', 1) // → 'AC00001'
 * @example formatId('PR', 1000) // → 'PR01000'
 */
export function formatId(prefix: IdPrefix, num: number): string {
  return \`\${prefix}\${String(num).padStart(ID_CONFIG.digitLength, '0')}\`;
}

/**
 * Parse the numeric portion from an ID.
 * @example parseIdNumber('AC00001') // → 1
 * @example parseIdNumber('PR01000') // → 1000
 */
export function parseIdNumber(id: string): number | undefined {
  const match = id.match(/^[A-Z]+(\\d+)$/);
  return match ? parseInt(match[1], 10) : undefined;
}

/**
 * Get the prefix from an ID.
 * @example getIdPrefix('AC00001') // → 'AC'
 */
export function getIdPrefix(id: string): IdPrefix | undefined {
  const match = id.match(/^([A-Z]+)\\d+$/);
  return match ? match[1] as IdPrefix : undefined;
}

/**
 * Find the next available ID for a given prefix.
 * @param prefix - The ID prefix (e.g., 'AC', 'PR')
 * @param existingIds - Set of existing IDs to avoid
 * @param startFrom - Starting number (defaults to 1)
 */
export function getNextId(prefix: IdPrefix, existingIds: Set<string>, startFrom = 1): string {
  let num = startFrom;
  let id = formatId(prefix, num);
  while (existingIds.has(id)) {
    num++;
    id = formatId(prefix, num);
  }
  return id;
}

/**
 * Validate an ID against its expected pattern.
 */
export function validateId(type: ElementType, id: string): boolean {
  const pattern = ID_PATTERNS[type];
  return pattern?.test(id) ?? false;
}

/**
 * Check if a string is a valid UBML ID of any type.
 */
export function isValidId(id: string): boolean {
  return ALL_ID_PATTERN.test(id);
}

/**
 * Get the element type from an ID.
 */
export function getElementTypeFromId(id: string): ElementType | undefined {
  const match = id.match(/^([A-Z]+)\\d+$/);
  if (match) {
    const prefix = match[1] as IdPrefix;
    return ID_PREFIXES[prefix];
  }
  return undefined;
}

// ============================================================================
// REFERENCE FIELD NAMES (extracted from all schemas)
// ============================================================================

/**
 * Property names that contain ID references to other elements.
 * Extracted from: All properties in schemas that use $ref to *Ref types
 * 
 * These fields are checked during semantic validation to find cross-document references.
 */
export const REFERENCE_FIELDS = [
${refFieldsEntries}
] as const;

/**
 * Check if a property name is a known reference field.
 */
export function isReferenceField(fieldName: string): boolean {
  return REFERENCE_FIELDS.includes(fieldName as typeof REFERENCE_FIELDS[number]);
}

// ============================================================================
// VALIDATION PATTERNS
// ============================================================================

/**
 * Duration pattern for validation.
 * Matches: 2d, 4h, 30min, 1.5wk, etc.
 */
export const DURATION_PATTERN = /^[0-9]+(\\.[0-9]+)?(min|h|d|wk|mo)$/;

/**
 * Time pattern for validation (HH:MM format).
 */
export const TIME_PATTERN = /^[0-2][0-9]:[0-5][0-9]$/;

// ============================================================================
// DOCUMENT TYPE DETECTION
// ============================================================================

/**
 * Detect document type from filename pattern.
 * 
 * Supports two patterns:
 * 1. Full pattern: prefix.type.ubml.yaml (e.g., organization.actors.ubml.yaml)
 * 2. Simple pattern: type.ubml.yaml (e.g., actors.ubml.yaml)
 * 
 * @example
 * detectDocumentType('foo.process.ubml.yaml') // → 'process'
 * detectDocumentType('process.ubml.yaml')     // → 'process'
 * detectDocumentType('actors.ubml.yaml')      // → 'actors'
 * detectDocumentType('generic.ubml.yaml')     // → undefined
 */
export function detectDocumentType(filename: string): DocumentType | undefined {
  const lower = filename.toLowerCase();
  for (const type of DOCUMENT_TYPES) {
    // Match both patterns: *.type.ubml.yaml AND type.ubml.yaml
    if (
      lower.includes(\`.\${type}.ubml.yaml\`) ||
      lower.includes(\`.\${type}.ubml.yml\`) ||
      lower.endsWith(\`\${type}.ubml.yaml\`) ||
      lower.endsWith(\`\${type}.ubml.yml\`)
    ) {
      return type;
    }
  }
  return undefined;
}

/**
 * Detect document type from parsed content by examining properties.
 * Useful for generic .ubml.yaml files without type in filename.
 */
export function detectDocumentTypeFromContent(content: unknown): DocumentType | undefined {
  if (!content || typeof content !== 'object') {
    return undefined;
  }
  
  const obj = content as Record<string, unknown>;
  
  // Check for type-specific root properties
  if ('processes' in obj) return 'process';
  if ('actors' in obj) return 'actors';
  if ('entities' in obj) return 'entities';
  if ('hypothesisTrees' in obj) return 'hypotheses';
  if ('kpis' in obj || 'metrics' in obj) return 'metrics';
  if ('scenarios' in obj) return 'scenarios';
  if ('valueStreams' in obj || 'capabilities' in obj) return 'strategy';
  if ('miningSources' in obj) return 'mining';
  if ('views' in obj) return 'views';
  if ('links' in obj && !('processes' in obj)) return 'links';
  if ('terms' in obj || 'glossary' in obj) return 'glossary';
  if ('organization' in obj || 'documents' in obj) return 'workspace';
  
  return undefined;
}

/**
 * Get all glob patterns for finding UBML files.
 * Includes both full pattern (*.type.ubml.yaml) and simple pattern (type.ubml.yaml).
 */
export function getUBMLFilePatterns(): string[] {
  const patterns: string[] = [];
  for (const type of DOCUMENT_TYPES) {
    patterns.push(\`**/*.\${type}.ubml.yaml\`);  // Full pattern: prefix.type.ubml.yaml
    patterns.push(\`**/\${type}.ubml.yaml\`);    // Simple pattern: type.ubml.yaml
  }
  return patterns;
}

/**
 * Check if a filename is a valid UBML file.
 */
export function isUBMLFile(filename: string): boolean {
  return detectDocumentType(filename) !== undefined;
}

/**
 * Get the schema path for a file based on its suffix.
 * Supports both full pattern (*.type.ubml.yaml) and simple pattern (type.ubml.yaml).
 */
export function getSchemaPathForFileSuffix(filepath: string): string | undefined {
  for (const type of DOCUMENT_TYPES) {
    if (
      filepath.endsWith(\`.\${type}.ubml.yaml\`) ||
      filepath.endsWith(\`.\${type}.ubml.yml\`) ||
      filepath.endsWith(\`\${type}.ubml.yaml\`) ||
      filepath.endsWith(\`\${type}.ubml.yml\`)
    ) {
      return SCHEMA_PATHS.documents[type];
    }
  }
  return undefined;
}

// ============================================================================
// TOOLING HINTS (extracted from x-ubml schema metadata)
// ============================================================================

/**
 * Pattern validation hints.
 * Extracted from: x-ubml metadata on schema types with patterns
 * 
 * Used by the validation error formatter to provide helpful messages.
 */
export interface PatternHint {
  pattern: string;
  humanName: string;
  errorHint: string;
  examples: string[];
  prefix?: string;
  commonMistakes?: Array<{ pattern: string; message: string }>;
}

export const PATTERN_HINTS: PatternHint[] = ${patternHintsJson};

/**
 * Get pattern hint for a regex pattern.
 */
export function getPatternHint(pattern: string): PatternHint | undefined {
  return PATTERN_HINTS.find(h => h.pattern === pattern);
}

/**
 * Nested property hints for misplacement detection.
 * Extracted from: x-ubml.nestedProperties on parent types
 * 
 * Used to detect when properties are used at the wrong nesting level.
 */
export interface NestedPropertyHint {
  parentProperty: string;
  childProperties: string[];
  misplacementHint: string;
  misplacementExample: string;
}

export const NESTED_PROPERTY_HINTS: NestedPropertyHint[] = ${nestedPropsJson};

/**
 * Get nested property hint for a property that might be misplaced.
 */
export function getNestedPropertyHint(propertyName: string): NestedPropertyHint | undefined {
  return NESTED_PROPERTY_HINTS.find(h => h.childProperties.includes(propertyName));
}

/**
 * Check if a property should be nested inside another property.
 */
export function shouldBeNested(propertyName: string): { parent: string; hint: string; example: string } | undefined {
  const hint = getNestedPropertyHint(propertyName);
  if (hint) {
    return {
      parent: hint.parentProperty,
      hint: hint.misplacementHint,
      example: hint.misplacementExample,
    };
  }
  return undefined;
}

// ============================================================================
// ENUM HINTS (extracted from x-ubml schema metadata)
// ============================================================================

/**
 * Enum validation hints for property-specific enum errors.
 * Extracted from: x-ubml metadata on schema types with enums
 */
export interface EnumValueHint {
  value: string;
  hint: string;
}

export interface EnumHint {
  propertyNames: string[];
  values: string[];
  valueMistakes?: Record<string, EnumValueHint>;
}

export const ENUM_HINTS: EnumHint[] = ${enumHintsJson};

/**
 * Get enum hint for a property name.
 */
export function getEnumHint(propertyName: string): EnumHint | undefined {
  return ENUM_HINTS.find(h => h.propertyNames.includes(propertyName));
}

/**
 * Get hint for an invalid enum value on a specific property.
 * 
 * Because multiple enum types can share the same property name (e.g., "kind" for
 * Phase.kind, Step.kind, Loop.kind), we first try to find an enum that has the
 * specific invalid value in its valueMistakes, then fall back to the first match.
 */
export function getEnumValueMistakeHint(propertyName: string, invalidValue: string): string | undefined {
  // First, try to find an enum hint that specifically has this invalid value
  // This handles cases like "task" which should match Step.kind, not Phase.kind
  for (const enumHint of ENUM_HINTS) {
    if (enumHint.propertyNames.includes(propertyName) && enumHint.valueMistakes?.[invalidValue]) {
      return enumHint.valueMistakes[invalidValue].hint;
    }
  }
  return undefined;
}
`;
}

// ============================================================================
// GENERATE: src/generated/types.ts
// ============================================================================

function generateTypes(documentTypes: string[], refInfos: RefInfo[]): string {
  // Create document type map for type names
  const docTypeToTypeName = (type: string): string => {
    const capitalized = type.charAt(0).toUpperCase() + type.slice(1);
    return `${capitalized}Document`;
  };

  const refTypeDefinitions = refInfos.map(r => {
    const typeName = r.type.charAt(0).toUpperCase() + r.type.slice(1) + 'Ref';
    return `/** ${typeName} (${r.prefix}### pattern) */
export type ${typeName} = string & { readonly __brand: '${typeName}' };`;
  }).join('\n\n');

  return `/**
 * UBML TypeScript Types
 * 
 * AUTO-GENERATED FILE - DO NOT EDIT
 * Run: npm run generate
 * 
 * These types are generated from the YAML schemas in /schemas.
 * They provide type-safe access to UBML document structures.
 * 
 * @module ubml/types
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

// =============================================================================
// REFERENCE TYPES (Branded strings for type safety)
// =============================================================================

${refTypeDefinitions}

/** Helper to create typed references */
export function createRef<T extends string>(id: string): T {
  return id as T;
}

// =============================================================================
// PRIMITIVE TYPES
// =============================================================================

/** Duration string (e.g., "2h", "30min", "1.5d") */
export type Duration = string;

/** Time string in HH:MM format */
export type Time = string;

/** Money amount (e.g., "$100", "100 USD") */
export type Money = string;

/** Date string in ISO format */
export type ISODate = string;

/** DateTime string in ISO format */
export type ISODateTime = string;

/** Rate expression (e.g., "10/h", "100/wk") */
export type Rate = string;

/** Custom fields object */
export type CustomFields = Record<string, unknown>;

// =============================================================================
// ACTOR TYPES
// =============================================================================

export type ActorType = 'person' | 'role' | 'team' | 'system' | 'organization' | 'external' | 'customer';
export type ActorKind = 'human' | 'org' | 'system';

export interface Actor {
  name: string;
  type: ActorType;
  kind: ActorKind;
  description?: string;
  isExternal?: boolean;
  skills?: SkillRef[];
  reportingTo?: ActorRef;
  members?: ActorRef[];
  contact?: ContactInfo;
  custom?: CustomFields;
}

export interface ContactInfo {
  email?: string;
  phone?: string;
  location?: string;
}

// =============================================================================
// PROCESS TYPES
// =============================================================================

export type ProcessLevel = 1 | 2 | 3 | 4;
export type ProcessStatus = 'draft' | 'review' | 'approved' | 'deprecated';

export interface Process {
  id: string;
  name: string;
  description?: string;
  level?: ProcessLevel;
  status?: ProcessStatus;
  owner?: ActorRef;
  steps?: Record<string, Step>;
  links?: Link[];
  phases?: Record<string, Phase>;
  triggers?: ProcessTrigger[];
  custom?: CustomFields;
}

// =============================================================================
// STEP TYPES
// =============================================================================

export type StepKind = 'task' | 'event' | 'gateway' | 'milestone' | 'subprocess' | 'block';
export type GatewayType = 'exclusive' | 'parallel' | 'inclusive' | 'event';
export type BlockOperator = 'par' | 'alt' | 'loop' | 'opt';

export interface Step {
  name: string;
  kind: StepKind;
  description?: string;
  responsible?: ActorRef;
  accountable?: ActorRef;
  duration?: Duration;
  cost?: Money;
  inputs?: DataFlow[];
  outputs?: DataFlow[];
  raci?: RACI;
  gatewayType?: GatewayType;
  conditions?: GatewayCondition[];
  operator?: BlockOperator;
  children?: StepRef[];
  subprocess?: ProcessRef;
  custom?: CustomFields;
}

export interface DataFlow {
  ref: EntityRef | DocumentRef;
  name?: string;
  description?: string;
}

export interface RACI {
  responsible?: ActorRef[];
  accountable?: ActorRef[];
  consulted?: ActorRef[];
  informed?: ActorRef[];
}

export interface GatewayCondition {
  to: StepRef;
  condition?: string;
  probability?: number;
  isDefault?: boolean;
}

// =============================================================================
// LINK TYPES
// =============================================================================

export type LinkType = 'sequence' | 'message' | 'signal' | 'timer' | 'conditional' | 'default';

export interface Link {
  from: StepRef;
  to: StepRef;
  type?: LinkType;
  condition?: string;
  label?: string;
  probability?: number;
}

// =============================================================================
// PHASE TYPES
// =============================================================================

export type PhaseKind = 'lifecycle' | 'delivery';

export interface Phase {
  name: string;
  kind: PhaseKind;
  description?: string;
  entryCriteria?: string;
  exitCriteria?: string;
  startMilestone?: StepRef;
  endMilestone?: StepRef;
  includeSteps?: StepRef[];
}

export interface ProcessTrigger {
  name: string;
  type: 'event' | 'schedule' | 'message' | 'signal';
  source?: ProcessRef | ActorRef;
  schedule?: string;
  description?: string;
}

// =============================================================================
// ENTITY TYPES
// =============================================================================

export type EntityType = 'master' | 'transactional' | 'reference' | 'document';

export interface Entity {
  name: string;
  type?: EntityType;
  description?: string;
  attributes?: Record<string, Attribute>;
  relationships?: Relationship[];
  custom?: CustomFields;
}

export interface Attribute {
  name: string;
  type: string;
  description?: string;
  required?: boolean;
  unique?: boolean;
}

export interface Relationship {
  target: EntityRef;
  type: 'one-to-one' | 'one-to-many' | 'many-to-many';
  name?: string;
  description?: string;
}

// =============================================================================
// HYPOTHESIS TYPES
// =============================================================================

export type HypothesisType = 'root' | 'supporting' | 'assumption';
export type HypothesisStatus = 'untested' | 'testing' | 'validated' | 'invalidated';

export interface HypothesisTree {
  name: string;
  scqh: SCQH;
  hypotheses?: Record<string, Hypothesis>;
  evidence?: Record<string, Evidence>;
  custom?: CustomFields;
}

export interface SCQH {
  situation: string;
  complication: string;
  question: string;
  hypothesis: string;
}

export interface Hypothesis {
  name: string;
  type: HypothesisType;
  description?: string;
  status?: HypothesisStatus;
  children?: HypothesisRef[];
  evidence?: string[];
}

export interface Evidence {
  type: 'observation' | 'data' | 'interview' | 'document' | 'analysis';
  title: string;
  description?: string;
  source?: string;
  linkedHypotheses?: HypothesisRef[];
}

// =============================================================================
// DOCUMENT TYPES
// =============================================================================

/** Current UBML schema version type */
export type SchemaVersionString = '${SCHEMA_VERSION}';

export interface BaseDocument {
  ubml: SchemaVersionString;
  name?: string;
  description?: string;
  metadata?: DocumentMetadata;
  tags?: string[];
  custom?: CustomFields;
}

export interface DocumentMetadata {
  createdAt?: ISODateTime;
  createdBy?: string;
  updatedAt?: ISODateTime;
  updatedBy?: string;
}

export interface ProcessDocument extends BaseDocument {
  processes: Record<string, Process>;
}

export interface ActorsDocument extends BaseDocument {
  actors?: Record<string, Actor>;
  skills?: Record<string, Skill>;
  resourcePools?: Record<string, ResourcePool>;
}

export interface EntitiesDocument extends BaseDocument {
  entities?: Record<string, Entity>;
  documents?: Record<string, DocumentDef>;
  locations?: Record<string, Location>;
}

export interface WorkspaceDocument extends BaseDocument {
  organization?: Organization;
  scope?: Scope;
  settings?: WorkspaceSettings;
  documents?: string[];
}

export interface HypothesesDocument extends BaseDocument {
  hypothesisTrees?: Record<string, HypothesisTree>;
}

export interface ScenariosDocument extends BaseDocument {
  scenarios?: Record<string, Scenario>;
}

export interface StrategyDocument extends BaseDocument {
  valueStreams?: Record<string, ValueStream>;
  capabilities?: Record<string, Capability>;
  portfolios?: Record<string, Portfolio>;
}

export interface MetricsDocument extends BaseDocument {
  kpis?: Record<string, KPI>;
  roiAnalyses?: Record<string, ROIAnalysis>;
}

export interface MiningDocument extends BaseDocument {
  miningSources?: Record<string, MiningSource>;
}

export interface ViewsDocument extends BaseDocument {
  views?: Record<string, View>;
}

export interface LinksDocument extends BaseDocument {
  links?: ExternalLink[];
}

export interface GlossaryDocument extends BaseDocument {
  terms?: Record<string, Term>;
}

// =============================================================================
// SUPPORTING TYPES
// =============================================================================

export interface Skill {
  name: string;
  description?: string;
  category?: string;
}

export interface ResourcePool {
  name: string;
  members?: ActorRef[];
  capacity?: number;
  skills?: SkillRef[];
}

export interface DocumentDef {
  name: string;
  description?: string;
  entity?: EntityRef;
  format?: string;
}

export interface Location {
  name: string;
  description?: string;
  address?: string;
  type?: string;
}

export interface Organization {
  name: string;
  department?: string;
  description?: string;
}

export interface Scope {
  inScope?: string[];
  outOfScope?: string[];
  assumptions?: string[];
  constraints?: string[];
}

export interface WorkspaceSettings {
  defaultCurrency?: string;
  defaultTimezone?: string;
  workingHoursPerDay?: number;
  workingDaysPerWeek?: number;
}

export interface Scenario {
  name: string;
  description?: string;
  parameters?: Record<string, unknown>;
}

export interface ValueStream {
  name: string;
  description?: string;
  stages?: string[];
}

export interface Capability {
  name: string;
  description?: string;
  level?: number;
}

export interface Portfolio {
  name: string;
  description?: string;
  products?: ProductRef[];
  services?: ServiceRef[];
}

export interface KPI {
  name: string;
  description?: string;
  unit?: string;
  target?: number;
  current?: number;
}

export interface ROIAnalysis {
  name: string;
  description?: string;
  costs?: Money;
  benefits?: Money;
}

export interface MiningSource {
  name: string;
  type: string;
  description?: string;
}

export interface View {
  name: string;
  description?: string;
  type: string;
  elements?: string[];
}

export interface ExternalLink {
  url: string;
  title?: string;
  description?: string;
}

export interface Term {
  name: string;
  definition: string;
  synonyms?: string[];
  related?: string[];
}

// =============================================================================
// UNION TYPE FOR ALL DOCUMENTS
// =============================================================================

export type UBMLDocumentContent =
  | ProcessDocument
  | ActorsDocument
  | EntitiesDocument
  | WorkspaceDocument
  | HypothesesDocument
  | ScenariosDocument
  | StrategyDocument
  | MetricsDocument
  | MiningDocument
  | ViewsDocument
  | LinksDocument
  | GlossaryDocument;
`;
}

// ============================================================================
// GENERATE: src/generated/templates.ts
// ============================================================================

function generateTemplates(templateData: DocumentTemplateInfo[]): string {
  return `/**
 * UBML Document Templates
 * 
 * AUTO-GENERATED FILE - DO NOT EDIT
 * Run: npm run generate
 * 
 * Templates are derived from YAML schemas including:
 * - Section structure from document schemas
 * - Required/optional properties from fragment schemas
 * - Default values from x-ubml-cli.templateDefaults
 * - Descriptions for inline documentation
 */

import { SCHEMA_VERSION, type DocumentType } from './metadata.js';

// ============================================================================
// TEMPLATE METADATA TYPES
// ============================================================================

export interface PropertyInfo {
  name: string;
  type: string;
  description: string;
  required: boolean;
  enumValues?: string[];
  default?: unknown;
}

export interface SectionInfo {
  name: string;
  idPrefix: string;
  description: string;
  requiredProps: string[];
  properties: PropertyInfo[];
  defaults?: Record<string, unknown>;
}

export interface DocumentTemplateInfo {
  type: string;
  shortDescription: string;
  gettingStarted: string[];
  sections: SectionInfo[];
  requiredDocProps: string[];
}

// ============================================================================
// TEMPLATE DATA (extracted from schemas)
// ============================================================================

export const TEMPLATE_DATA: Record<DocumentType, DocumentTemplateInfo> = ${JSON.stringify(
    Object.fromEntries(templateData.map(t => [t.type, t])),
    null,
    2
  )};

// ============================================================================
// TEMPLATE FACTORIES
// ============================================================================

/**
 * Create a minimal valid document of the specified type.
 * Uses schema defaults and required properties only.
 */
export function createMinimalDocument(type: DocumentType, name?: string): Record<string, unknown> {
  const template = TEMPLATE_DATA[type];
  if (!template) {
    return { ubml: SCHEMA_VERSION };
  }
  
  const doc: Record<string, unknown> = { ubml: SCHEMA_VERSION };
  
  // Add first section with minimal required item
  for (const section of template.sections) {
    const sectionData: Record<string, unknown> = {};
    const itemId = \`\${section.idPrefix}001\`;
    const itemData: Record<string, unknown> = {};
    
    // Add required properties with defaults or placeholders
    for (const prop of section.properties) {
      if (prop.required) {
        if (prop.name === 'id') {
          itemData.id = itemId;
        } else if (prop.name === 'name') {
          itemData.name = name || 'TODO: Add name';
        } else if (prop.default !== undefined) {
          itemData[prop.name] = prop.default;
        } else if (prop.enumValues && prop.enumValues.length > 0) {
          itemData[prop.name] = prop.enumValues[0];
        } else if (prop.type === 'string') {
          itemData[prop.name] = 'TODO';
        } else if (prop.type === 'number') {
          itemData[prop.name] = 0;
        } else if (prop.type === 'boolean') {
          itemData[prop.name] = false;
        } else if (prop.type === 'array') {
          itemData[prop.name] = [];
        } else if (prop.type === 'object') {
          itemData[prop.name] = {};
        }
      }
    }
    
    // Apply templateDefaults
    if (section.defaults) {
      Object.assign(itemData, section.defaults);
    }
    
    sectionData[itemId] = itemData;
    doc[section.name] = sectionData;
  }
  
  return doc;
}

/**
 * Get YAML comment header for a document type.
 * Includes getting started tips from schema.
 */
export function getDocumentHeader(type: DocumentType, name?: string): string {
  const template = TEMPLATE_DATA[type];
  if (!template) {
    return '# UBML Document\\n';
  }
  
  const displayName = name || type.charAt(0).toUpperCase() + type.slice(1);
  const lines: string[] = [
    '# ============================================================================',
    \`# \${displayName}\`,
    '# ============================================================================',
  ];
  
  if (template.shortDescription) {
    lines.push(\`# \${template.shortDescription}\`);
  }
  
  lines.push('#');
  
  // Add ID pattern quick reference
  const idPatterns = template.sections.map(s => \`\${s.idPrefix}### for \${s.name}\`);
  if (idPatterns.length > 0) {
    lines.push(\`# ID patterns: \${idPatterns.join(', ')}\`);
  }
  
  lines.push('# Run: ubml validate . to check for errors');
  lines.push('# ============================================================================');
  lines.push('');
  
  return lines.join('\\n');
}

/**
 * Convert section name (plural) to element type (singular) for CLI commands.
 * Maps: processes → process, actors → actor, etc.
 */
function sectionToElementType(sectionName: string): string {
  const mappings: Record<string, string> = {
    'processes': 'process',
    'actors': 'actor',
    'entities': 'entity',
    'hypotheses': 'hypothesis',
    'hypothesisTrees': 'hypothesis',
    'scenarios': 'scenario',
    'steps': 'step',
  };
  return mappings[sectionName] || sectionName;
}

/**
 * Get section properties as YAML comments for inline documentation.
 */
export function getSectionComment(type: DocumentType, sectionName: string): string {
  const template = TEMPLATE_DATA[type];
  if (!template) return '';
  
  const section = template.sections.find(s => s.name === sectionName);
  if (!section) return '';
  
  const lines: string[] = [
    \`  # Available properties for \${section.idPrefix}### items:\`,
  ];
  
  // Show required first
  const required = section.properties.filter(p => p.required);
  const optional = section.properties.filter(p => !p.required);
  
  for (const prop of required) {
    const enumInfo = prop.enumValues ? \` [\${prop.enumValues.join(' | ')}]\` : '';
    lines.push(\`  #   *\${prop.name}: <\${prop.type}>\${enumInfo} - \${prop.description}\`);
  }
  
  for (const prop of optional.slice(0, 5)) { // Show first 5 optional
    const enumInfo = prop.enumValues ? \` [\${prop.enumValues.join(' | ')}]\` : '';
    lines.push(\`  #    \${prop.name}: <\${prop.type}>\${enumInfo}\`);
  }
  
  if (optional.length > 5) {
    const elementType = sectionToElementType(sectionName);
    lines.push(\`  #   ... and \${optional.length - 5} more (run: ubml syntax \${elementType})\`);
  }
  
  return lines.join('\\n');
}

/**
 * Get enum values comment for a property.
 */
export function getEnumComment(type: DocumentType, sectionName: string, propName: string): string {
  const template = TEMPLATE_DATA[type];
  if (!template) return '';
  
  const section = template.sections.find(s => s.name === sectionName);
  if (!section) return '';
  
  const prop = section.properties.find(p => p.name === propName);
  if (!prop?.enumValues) return '';
  
  return \`# Valid values: \${prop.enumValues.join(' | ')}\`;
}
`;
}

// ============================================================================
// MAIN
// ============================================================================

function main() {
  console.log('🔧 Generating UBML code from schemas...\n');
  
  ensureOutputDir();
  
  // Phase 1: Discover document types and fragments
  console.log('📁 Discovering document types and fragments...');
  const documentTypes = discoverDocumentTypes();
  const fragments = discoverFragments();
  console.log(`   Found ${documentTypes.length} document types: ${documentTypes.join(', ')}`);
  console.log(`   Found ${fragments.length} fragments: ${fragments.join(', ')}`);
  
  // Phase 2: Extract ID patterns
  console.log('\n🔍 Extracting ID patterns from defs.schema.yaml...');
  const refInfos = extractIdPatterns();
  console.log(`   Found ${refInfos.length} ID patterns: ${refInfos.map(r => r.prefix).join(', ')}`);
  
  // Phase 2b: Extract ID generation config
  const idConfig = extractIdConfig();
  console.log(`   ID format: ${idConfig.digitLength} digits, init offset: ${idConfig.initOffset}, add offset: ${idConfig.addOffset}`);
  
  // Phase 3: Extract reference field names
  console.log('\n🔗 Extracting reference field names from all schemas...');
  const refFields = extractReferenceFields();
  console.log(`   Found ${refFields.length} reference fields: ${refFields.slice(0, 10).join(', ')}${refFields.length > 10 ? '...' : ''}`);
  
  // Phase 4: Extract tooling hints from x-ubml metadata
  console.log('\n🎯 Extracting tooling hints from x-ubml metadata...');
  const toolingHints = extractToolingHints();
  console.log(`   Found ${toolingHints.patterns.length} pattern hints, ${toolingHints.nestedProperties.length} nested property hints, ${toolingHints.enums.length} enum hints`);
  
  // Phase 5: Extract template data from document schemas
  console.log('\n📋 Extracting template data from document schemas...');
  const templateData = extractTemplateData();
  const totalSections = templateData.reduce((sum, t) => sum + t.sections.length, 0);
  console.log(`   Found ${templateData.length} document templates with ${totalSections} total sections`);
  
  // Phase 6: Generate files
  console.log('\n📝 Generating TypeScript files...');
  
  // Generate bundled.ts
  const bundledContent = generateBundledSchemas(documentTypes);
  writeFileSync(join(outputDir, 'bundled.ts'), bundledContent, 'utf8');
  console.log('   ✓ src/generated/bundled.ts');
  
  // Generate metadata.ts
  const metadataContent = generateMetadata(documentTypes, fragments, refInfos, refFields, toolingHints, idConfig);
  writeFileSync(join(outputDir, 'metadata.ts'), metadataContent, 'utf8');
  console.log('   ✓ src/generated/metadata.ts');
  
  // Generate types.ts
  const typesContent = generateTypes(documentTypes, refInfos);
  writeFileSync(join(outputDir, 'types.ts'), typesContent, 'utf8');
  console.log('   ✓ src/generated/types.ts');
  
  // Generate templates.ts
  const templatesContent = generateTemplates(templateData);
  writeFileSync(join(outputDir, 'templates.ts'), templatesContent, 'utf8');
  console.log('   ✓ src/generated/templates.ts');

  // Generate constants.ts (in src/, not src/generated/)
  const constantsContent = `/**
 * Constants for UBML package.
 * 
 * AUTO-GENERATED FILE - DO NOT EDIT
 * Run: npm run generate
 * 
 * Version is derived from package.json
 */

/**
 * UBML package version (from package.json).
 */
export const VERSION = "${PACKAGE_VERSION}";

/**
 * UBML schema version (major.minor).
 */
export const SCHEMA_VERSION = "${SCHEMA_VERSION}";

/**
 * Package name.
 */
export const PACKAGE_NAME = "ubml";

/**
 * Package repository URL.
 */
export const REPOSITORY_URL = "https://github.com/TALXIS/ubml";
`;
  writeFileSync(join(__dirname, '..', 'src', 'constants.ts'), constantsContent, 'utf8');
  console.log('   ✓ src/constants.ts');
  
  console.log('\n✅ Generation complete!\n');
}

main();
