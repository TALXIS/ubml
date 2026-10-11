/**
 * Template Data Extraction
 *
 * Extract template data and sections from document schemas.
 *
 * @module generate/extract-metadata/extract-templates
 */

import { join } from 'path';
import { loadYamlFile, SCHEMAS_DIR } from '../utils.js';

export interface TemplateProperty {
  name: string;
  type: string;
  description: string;
  required: boolean;
  enumValues?: string[];
  default?: unknown;
  /** For type 'ref': the ID prefix the reference must carry, e.g. 'ST'. */
  refPrefix?: string;
}

export interface TemplateSection {
  name: string;
  idPrefix: string | null;
  description: string;
  required: boolean;
  /** True when the section is a YAML sequence rather than an ID-keyed map. */
  isArray: boolean;
  /** Properties of one item in this section, resolved through $ref. */
  properties: TemplateProperty[];
}

export interface TemplateData {
  type: string;
  title: string;
  shortDescription: string;
  category: string;
  categoryDisplayName: string;
  workflowOrder: number;
  defaultFilename: string;
  gettingStarted: string[];
  exampleFilename: string;
  sections: TemplateSection[];
  templateDefaults?: Record<string, Record<string, unknown>>;
}

export interface CommonPropertiesConfig {
  properties: string[];
}

/**
 * Extract common properties from the workspace document schema.
 * These are properties that appear in all/most document types.
 * Throws if x-ubml-common-properties is missing.
 */
export function extractCommonProperties(): CommonPropertiesConfig {
  const workspacePath = join(SCHEMAS_DIR, 'documents', 'workspace.schema.yaml');
  const schema = loadYamlFile(workspacePath) as {
    properties?: Record<string, unknown>;
    'x-ubml-common-properties'?: string[];
  };

  const explicitCommon = schema['x-ubml-common-properties'];
  if (!explicitCommon || !Array.isArray(explicitCommon)) {
    throw new Error(
      'Schema error: workspace.schema.yaml must define x-ubml-common-properties array'
    );
  }

  return { properties: explicitCommon };
}

type SchemaNode = Record<string, unknown>;

/**
 * Resolve a local "<file>#/$defs/<Name>" reference to the node it names. Refs
 * are written relative to schemas/<version>/documents/, so join from there.
 * Returns null for anything it cannot resolve, so extraction degrades to an
 * empty property list rather than throwing on an unexpected reference shape.
 */
function resolveRef(ref: string): SchemaNode | null {
  const [filePart, pointer] = ref.split('#');
  if (!filePart || !pointer) return null;

  let node: unknown;
  try {
    node = loadYamlFile(join(SCHEMAS_DIR, 'documents', filePart));
  } catch {
    return null;
  }

  for (const segment of pointer.split('/').filter(Boolean)) {
    if (typeof node !== 'object' || node === null) return null;
    node = (node as SchemaNode)[segment];
  }
  return typeof node === 'object' && node !== null ? (node as SchemaNode) : null;
}

/**
 * Find the schema describing ONE item of a section.
 *
 * Sections come in two shapes: an ID-keyed map, where the item schema hangs off
 * patternProperties, and a sequence, where it hangs off items. Either may be
 * written inline or behind a $ref into types/.
 */
function resolveItemSchema(
  sectionSchema: SchemaNode
): { item: SchemaNode | null; isArray: boolean } {
  const isArray = sectionSchema.type === 'array';

  let candidate: unknown = null;
  if (isArray) {
    candidate = sectionSchema.items;
  } else {
    const patternProps = sectionSchema.patternProperties as SchemaNode | undefined;
    if (patternProps) candidate = Object.values(patternProps)[0];
  }

  if (typeof candidate !== 'object' || candidate === null) {
    return { item: null, isArray };
  }

  const node = candidate as SchemaNode;
  if (typeof node.$ref === 'string') {
    return { item: resolveRef(node.$ref), isArray };
  }
  return { item: node, isArray };
}

/**
 * Read the ID prefix out of a "*Ref" definition's own pattern.
 * "../defs/refs.defs.yaml#/$defs/StepRef" -> pattern "^ST\\d{5,}$" -> "ST".
 */
function refIdPrefix(ref: string): string | undefined {
  const pattern = resolveRef(ref)?.pattern;
  return typeof pattern === 'string' ? pattern.match(/^\^([A-Z]+)/)?.[1] : undefined;
}

/**
 * Describe the properties of one section item, so `ubml add` can scaffold a
 * document that satisfies the schema it was generated from.
 */
function extractItemProperties(item: SchemaNode | null): TemplateProperty[] {
  if (!item) return [];

  const props = item.properties as Record<string, SchemaNode> | undefined;
  if (!props) return [];

  const required = new Set(
    Array.isArray(item.required) ? (item.required as string[]) : []
  );

  return Object.entries(props).map(([name, prop]) => {
    const enumValues = Array.isArray(prop.enum) ? (prop.enum as string[]) : undefined;
    const description = typeof prop.description === 'string'
      ? prop.description.split('\n')[0]
      : '';

    // A $ref-typed property is a reference to another element. Take the ID
    // prefix from the referenced definition's own pattern, so a placeholder is
    // of the right kind - a step link wants ST#####, not AC#####.
    let type = typeof prop.type === 'string' ? prop.type : 'string';
    let refPrefix: string | undefined;
    if (typeof prop.$ref === 'string' && prop.$ref.includes('refs.defs.yaml')) {
      type = 'ref';
      refPrefix = refIdPrefix(prop.$ref);
    }

    return {
      name,
      type,
      description,
      required: required.has(name),
      ...(enumValues ? { enumValues } : {}),
      ...(prop.default !== undefined ? { default: prop.default } : {}),
      ...(refPrefix ? { refPrefix } : {}),
    };
  });
}

/**
 * Extract template data from document schemas.
 */
export function extractTemplateData(documentTypes: string[]): TemplateData[] {
  const templates: TemplateData[] = [];
  
  // Get common properties from schema-driven config
  const commonProps = extractCommonProperties();
  const skipProps = new Set(commonProps.properties);

  for (const type of documentTypes) {
    const schemaPath = join(SCHEMAS_DIR, 'documents', `${type}.schema.yaml`);
    const schema = loadYamlFile(schemaPath) as {
      title?: string;
      description?: string;
      required?: string[];
      properties?: Record<string, Record<string, unknown>>;
      'x-ubml-cli'?: {
        category?: string;
        categoryDisplayName?: string;
        workflowOrder?: number;
        shortDescription?: string;
        defaultFilename?: string;
        gettingStarted?: string[];
        exampleFilename?: string;
        templateDefaults?: Record<string, Record<string, unknown>>;
      };
    };

    const metadata = schema['x-ubml-cli'] ?? {};
    const properties = schema.properties ?? {};
    const required = schema.required ?? [];

    // Extract sections (skip common properties - now schema-driven!)
    const sections: TemplateSection[] = [];

    for (const [propName, propSchema] of Object.entries(properties)) {
      if (skipProps.has(propName)) continue;

      // Extract ID prefix from patternProperties
      let idPrefix: string | null = null;
      const patternProps = propSchema.patternProperties as Record<string, unknown> | undefined;
      if (patternProps) {
        for (const pattern of Object.keys(patternProps)) {
          const match = pattern.match(/^\^([A-Z]+)/);
          if (match) {
            idPrefix = match[1];
            break;
          }
        }
      }

      const description = propSchema.description as string | undefined;
      const { item, isArray } = resolveItemSchema(propSchema as SchemaNode);
      sections.push({
        name: propName,
        idPrefix,
        description: description ? description.split('\n')[0] : '',
        required: required.includes(propName),
        isArray,
        properties: extractItemProperties(item),
      });
    }

    // Validate required metadata - no silent fallbacks
    if (!metadata.shortDescription) {
      throw new Error(
        `Schema error: ${type}.schema.yaml missing required x-ubml-cli.shortDescription`
      );
    }
    if (!metadata.category) {
      throw new Error(
        `Schema error: ${type}.schema.yaml missing required x-ubml-cli.category`
      );
    }
    if (metadata.workflowOrder === undefined) {
      throw new Error(
        `Schema error: ${type}.schema.yaml missing required x-ubml-cli.workflowOrder`
      );
    }

    templates.push({
      type,
      title: schema.title ?? type,
      shortDescription: metadata.shortDescription,
      category: metadata.category,
      categoryDisplayName: metadata.categoryDisplayName ?? metadata.category,
      workflowOrder: metadata.workflowOrder,
      defaultFilename: metadata.defaultFilename ?? type,
      gettingStarted: metadata.gettingStarted ?? [],
      exampleFilename: metadata.exampleFilename ?? `${type}.ubml.yaml`,
      sections,
      templateDefaults: metadata.templateDefaults,
    });
  }

  return templates;
}
