/**
 * Schema Introspection Utilities
 *
 * Provides human-readable information about UBML schemas for CLI display.
 * ALL INFORMATION IS READ DIRECTLY FROM SCHEMA x-ubml-cli METADATA.
 *
 * The source of truth is the schemas directory. Each document schema
 * contains an x-ubml-cli block with structured metadata for tooling.
 *
 * @module ubml/cli/schema-introspection
 */

import {
  DOCUMENT_TYPES,
  ID_PREFIXES,
  type DocumentType,
  type IdPrefix,
} from '@ubml/core/generated/metadata';
import { documentSchemas, fragmentSchemas } from '@ubml/core/generated/bundled';

// =============================================================================
// Types
// =============================================================================

/**
 * CLI metadata from schema x-ubml-cli extension.
 */
interface SchemaCliMetadata {
  category: 'core' | 'analysis' | 'strategy' | 'advanced';
  categoryDisplayName: string;
  workflowOrder: number;
  shortDescription: string;
  gettingStarted: string[];
  exampleFilename: string;
  templateDefaults?: Record<string, Record<string, unknown>>;
}

/**
 * Information about a document type for display.
 */
export interface DocumentTypeInfo {
  type: DocumentType;
  filePattern: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  category: SchemaCliMetadata['category'];
  categoryDisplayName: string;
  workflowOrder: number;
  gettingStarted: string[];
  exampleFilename: string;
  sections: SectionInfo[];
  requiredProperties: string[];
  templateDefaults?: Record<string, Record<string, unknown>>;
}

/**
 * Information about a section (top-level property) in a document.
 */
export interface SectionInfo {
  name: string;
  idPrefix: string | null;
  description: string;
  required: boolean;
}

/**
 * Information about an element type for display.
 */
export interface ElementTypeInfo {
  type: string;
  idPrefix: IdPrefix;
  idPattern: string;
  description: string;
  properties: PropertyInfo[];
  requiredProperties: string[];
}

/**
 * Information about a property for display.
 */
export interface PropertyInfo {
  name: string;
  type: string;
  description: string;
  required: boolean;
  enumValues?: string[];
  default?: unknown;
}

/**
 * Workflow step information.
 */
export interface WorkflowStep {
  step: number;
  type: DocumentType;
  reason: string;
}

// =============================================================================
// Schema Access Helpers
// =============================================================================

/**
 * Get CLI metadata from a document schema.
 */
function getCliMetadata(type: DocumentType): SchemaCliMetadata | null {
  const schema = documentSchemas[type];
  if (!schema) return null;

  const metadata = (schema as Record<string, unknown>)['x-ubml-cli'] as SchemaCliMetadata | undefined;
  return metadata ?? null;
}

/**
 * Get the first matching ID prefix from a section's patternProperties.
 */
function extractIdPrefix(sectionSchema: Record<string, unknown>): string | null {
  const patternProps = sectionSchema.patternProperties as Record<string, unknown> | undefined;
  if (!patternProps) return null;

  for (const pattern of Object.keys(patternProps)) {
    // Match patterns like "^PR\\d{3,}$"
    const match = pattern.match(/^\^([A-Z]{2})/);
    if (match) return match[1];
  }
  return null;
}

/**
 * Get JSON Schema type as a readable string.
 */
function getTypeString(schema: Record<string, unknown>): string {
  if (schema.$ref) {
    const ref = schema.$ref as string;
    const match = ref.match(/#\/\$defs\/(\w+)/);
    return match ? match[1] : 'object';
  }
  if (schema.type === 'array') {
    const items = schema.items as Record<string, unknown> | undefined;
    if (items?.$ref) {
      const ref = items.$ref as string;
      const match = ref.match(/#\/\$defs\/(\w+)/);
      return match ? `${match[1]}[]` : 'array';
    }
    return `${items?.type ?? 'any'}[]`;
  }
  if (schema.enum) {
    return 'enum';
  }
  return (schema.type as string) ?? 'any';
}

// =============================================================================
// Document Type Information
// =============================================================================

/**
 * Get information about a document type.
 */
export function getDocumentTypeInfo(type: DocumentType): DocumentTypeInfo {
  const schema = documentSchemas[type];
  const metadata = getCliMetadata(type);

  // Extract sections from properties
  const sections: SectionInfo[] = [];
  const properties = (schema?.properties ?? {}) as Record<string, Record<string, unknown>>;
  const required = (schema?.required ?? []) as string[];

  // Skip common properties, focus on content sections
  const skipProps = new Set(['ubml', 'name', 'description', 'metadata', 'tags', 'custom']);

  for (const [propName, propSchema] of Object.entries(properties)) {
    if (skipProps.has(propName)) continue;

    sections.push({
      name: propName,
      idPrefix: extractIdPrefix(propSchema),
      description: (propSchema.description as string)?.split('\n')[0] ?? '',
      required: required.includes(propName),
    });
  }

  return {
    type,
    filePattern: `*.${type}.ubml.yaml`,
    title: (schema?.title as string) ?? type,
    shortDescription: metadata?.shortDescription ?? (schema?.description as string) ?? '',
    fullDescription: (schema?.description as string) ?? '',
    category: metadata?.category ?? 'advanced',
    categoryDisplayName: metadata?.categoryDisplayName ?? 'Advanced',
    workflowOrder: metadata?.workflowOrder ?? 99,
    gettingStarted: metadata?.gettingStarted ?? [],
    exampleFilename: metadata?.exampleFilename ?? `sample.${type}.ubml.yaml`,
    sections,
    requiredProperties: required,
    templateDefaults: metadata?.templateDefaults,
  };
}

/**
 * Get all document types with their info.
 */
export function getAllDocumentTypes(): DocumentTypeInfo[] {
  return DOCUMENT_TYPES.map((type) => getDocumentTypeInfo(type));
}

/**
 * Get document types grouped by category.
 */
export function getDocumentTypesByCategory(): Record<string, DocumentTypeInfo[]> {
  const all = getAllDocumentTypes();
  const grouped: Record<string, DocumentTypeInfo[]> = {
    core: [],
    analysis: [],
    strategy: [],
    advanced: [],
  };

  for (const info of all) {
    grouped[info.category].push(info);
  }

  // Sort each category by workflow order
  for (const category of Object.keys(grouped)) {
    grouped[category].sort((a, b) => a.workflowOrder - b.workflowOrder);
  }

  return grouped;
}

// =============================================================================
// Element Type Information
// =============================================================================

/**
 * Get all element types (from fragment schemas).
 */
export function getAllElementTypes(): { type: string; prefix: IdPrefix }[] {
  const elements: { type: string; prefix: IdPrefix }[] = [];

  // Map known prefixes to their element types
  const prefixMap: Record<string, IdPrefix> = {
    Process: 'PR',
    Step: 'ST',
    Actor: 'AC',
    Entity: 'EN',
    Hypothesis: 'HY',
    Scenario: 'SC',
    KPI: 'KP',
    Capability: 'CP',
    ValueStream: 'VS',
    Service: 'SV',
    Product: 'PD',
    Portfolio: 'PF',
    View: 'VW',
    Link: 'LC',
  };

  for (const [fragName, schema] of Object.entries(fragmentSchemas)) {
    const defs = (schema as Record<string, unknown>).$defs as Record<string, unknown> | undefined;
    if (!defs) continue;

    for (const defName of Object.keys(defs)) {
      if (prefixMap[defName]) {
        elements.push({
          type: defName.toLowerCase(),
          prefix: prefixMap[defName],
        });
      }
    }
  }

  return elements;
}

/**
 * Get detailed information about an element type.
 */
export function getElementTypeInfo(elementType: string): ElementTypeInfo | null {
  // Find the fragment containing this element
  for (const [fragName, schema] of Object.entries(fragmentSchemas)) {
    const defs = (schema as Record<string, unknown>).$defs as Record<string, Record<string, unknown>> | undefined;
    if (!defs) continue;

    // Look for matching definition (case-insensitive)
    for (const [defName, defSchema] of Object.entries(defs)) {
      if (defName.toLowerCase() === elementType.toLowerCase()) {
        const properties = (defSchema.properties ?? {}) as Record<string, Record<string, unknown>>;
        const required = (defSchema.required ?? []) as string[];

        const props: PropertyInfo[] = [];
        for (const [propName, propSchema] of Object.entries(properties)) {
          props.push({
            name: propName,
            type: getTypeString(propSchema),
            description: (propSchema.description as string)?.split('\n')[0] ?? '',
            required: required.includes(propName),
            enumValues: propSchema.enum as string[] | undefined,
            default: propSchema.default,
          });
        }

        // Find ID prefix
        const elements = getAllElementTypes();
        const element = elements.find((e) => e.type === elementType.toLowerCase());

        return {
          type: elementType,
          idPrefix: element?.prefix ?? ('XX' as IdPrefix),
          idPattern: `${element?.prefix ?? 'XX'}###`,
          description: (defSchema.description as string)?.split('\n')[0] ?? '',
          properties: props,
          requiredProperties: required,
        };
      }
    }
  }

  return null;
}

// =============================================================================
// Workflow
// =============================================================================

/**
 * Get suggested workflow order from schema metadata.
 */
export function getSuggestedWorkflow(): WorkflowStep[] {
  const all = getAllDocumentTypes();

  // Filter to those with workflow order and sort
  const ordered = all
    .filter((info) => info.workflowOrder < 99)
    .sort((a, b) => a.workflowOrder - b.workflowOrder);

  return ordered.map((info) => ({
    step: info.workflowOrder,
    type: info.type,
    reason: info.gettingStarted[0] ?? info.shortDescription,
  }));
}

/**
 * Get suggested next document type based on what exists.
 * Returns the next workflow step info, or null if all types exist.
 */
export function getSuggestedNextStep(existingTypes: DocumentType[]): WorkflowStep | null {
  const workflow = getSuggestedWorkflow();
  const existing = new Set(existingTypes);

  for (const step of workflow) {
    if (!existing.has(step.type)) {
      return step;
    }
  }

  return null;
}

// =============================================================================
// Templates
// =============================================================================

/**
 * Get a minimal template for a document type.
 */
export function getMinimalTemplate(type: DocumentType): Record<string, unknown> {
  const info = getDocumentTypeInfo(type);
  const template: Record<string, unknown> = {
    ubml: '1.0',
  };

  // Add name/description for most types
  if (type !== 'links') {
    template.name = `My ${info.title}`;
    template.description = 'Description goes here';
  }

  // Add a sample for each required section
  for (const section of info.sections) {
    if (section.required && section.idPrefix) {
      template[section.name] = createSampleSection(section, type);
    }
  }

  return template;
}

/**
 * Create a sample section with one element.
 */
function createSampleSection(
  section: SectionInfo,
  docType: DocumentType,
): Record<string, unknown> {
  const id = `${section.idPrefix}001`;

  // Get element info for better sample
  const singularName = section.name.replace(/e?s$/, '');
  const elementInfo = getElementTypeInfo(singularName);

  const sample: Record<string, unknown> = {
    name: `Sample ${singularName}`,
    description: 'Description goes here',
  };

  // Apply template defaults from schema
  const info = getDocumentTypeInfo(docType);
  const defaults = info.templateDefaults?.[section.name];
  if (defaults) {
    Object.assign(sample, defaults);
  }

  return { [id]: sample };
}

/**
 * Get an annotated template with comments.
 */
export function getAnnotatedTemplate(type: DocumentType): string {
  const info = getDocumentTypeInfo(type);
  const template = getMinimalTemplate(type);

  const lines: string[] = [
    `# ${info.title}`,
    `# ${info.shortDescription}`,
    `# File: ${info.exampleFilename}`,
    '#',
    `# See: ubml schema ${type} --properties`,
    '',
  ];

  // Simple YAML serialization with comments
  lines.push('ubml: "1.0"  # UBML version (required)');

  if (template.name) {
    lines.push(`name: "${template.name}"`);
  }
  if (template.description) {
    lines.push(`description: "${template.description}"`);
  }

  // Add sections
  for (const section of info.sections) {
    if (template[section.name]) {
      lines.push('');
      lines.push(`# ${section.description}`);
      lines.push(`${section.name}:`);

      const sectionData = template[section.name] as Record<string, unknown>;
      for (const [id, value] of Object.entries(sectionData)) {
        lines.push(`  ${id}:`);
        const obj = value as Record<string, unknown>;
        for (const [key, val] of Object.entries(obj)) {
          if (typeof val === 'object' && val !== null) {
            lines.push(`    ${key}:`);
            for (const [subKey, subVal] of Object.entries(val as Record<string, unknown>)) {
              lines.push(`      ${subKey}:`);
              const subObj = subVal as Record<string, unknown>;
              for (const [k, v] of Object.entries(subObj)) {
                lines.push(`        ${k}: "${v}"`);
              }
            }
          } else {
            lines.push(`    ${key}: "${val}"`);
          }
        }
      }
    }
  }

  return lines.join('\n');
}
