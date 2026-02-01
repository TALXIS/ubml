/**
 * Schema Introspection
 *
 * Query schema metadata for CLI and consumer use.
 * Reads structured information from x-ubml and x-ubml-cli extensions.
 *
 * @module ubml/schema/introspection
 */

import {
  DOCUMENT_TYPES,
  ID_PREFIXES,
  type DocumentType,
  type IdPrefix,
} from '../metadata.js';
import { documentSchemas, typeSchemas, refsDefsSchema } from '../generated/bundled.js';
import { getTypeString } from './utils.js';
import type {
  SchemaCliMetadata,
  DocumentTypeInfo,
  SectionInfo,
  ElementTypeInfo,
  PropertyInfo,
  WorkflowStep,
  IdPrefixInfo,
} from './types.js';
import { getCommonProperties } from './derive.js';

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

// =============================================================================
// Document Type Information
// =============================================================================

/**
 * Get information about a document type.
 */
export function getDocumentTypeInfo(type: DocumentType): DocumentTypeInfo | undefined {
  const schema = documentSchemas[type] as Record<string, unknown> | undefined;
  if (!schema) return undefined;

  const metadata = getCliMetadata(type);

  // Extract sections from properties
  const sections: SectionInfo[] = [];
  const properties = (schema?.properties ?? {}) as Record<string, Record<string, unknown>>;
  const required = (schema?.required ?? []) as string[];

  // Require metadata to exist - no fallbacks
  if (!metadata) {
    throw new Error(
      `Schema error: ${type}.schema.yaml is missing x-ubml-cli metadata. ` +
      `All document schemas must define: category, categoryDisplayName, workflowOrder, shortDescription, defaultFilename`
    );
  }

  // Require all critical fields
  if (!metadata.category || !metadata.categoryDisplayName || !metadata.shortDescription || !metadata.defaultFilename) {
    throw new Error(
      `Schema error: ${type}.schema.yaml x-ubml-cli is incomplete. ` +
      `Required fields: category, categoryDisplayName, shortDescription, defaultFilename`
    );
  }

  // Skip common properties, focus on content sections
  // Uses schema-derived common properties (no hardcoding!)
  const skipProps = getCommonProperties();

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
    title: (schema?.title as string) || type,
    shortDescription: metadata.shortDescription,
    fullDescription: (schema?.description as string) || '',
    category: metadata.category,
    categoryDisplayName: metadata.categoryDisplayName,
    workflowOrder: metadata.workflowOrder ?? 99,
    defaultFilename: metadata.defaultFilename,
    gettingStarted: metadata.gettingStarted ?? [],
    exampleFilename: metadata.exampleFilename ?? `sample.${type}.ubml.yaml`,
    sections,
    requiredProperties: required,
    templateDefaults: metadata.templateDefaults,
  };
}

/**
 * Get all document types with their info.
 */
export function getAllDocumentTypes(): DocumentTypeInfo[] {
  return DOCUMENT_TYPES
    .map((type) => getDocumentTypeInfo(type))
    .filter((info): info is DocumentTypeInfo => info !== undefined)
    .sort((a, b) => a.workflowOrder - b.workflowOrder);
}

/**
 * Get document types grouped by category.
 * Categories are now dynamically discovered from document schemas (no hardcoding!).
 */
export function getDocumentTypesByCategory(): Record<string, DocumentTypeInfo[]> {
  const all = getAllDocumentTypes();
  
  // Dynamically build category map from discovered categories
  const grouped: Record<string, DocumentTypeInfo[]> = {};

  for (const info of all) {
    if (!grouped[info.category]) {
      grouped[info.category] = [];
    }
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

  // Build prefix to element type map from ID_PREFIXES
  for (const [prefix, elementType] of Object.entries(ID_PREFIXES)) {
    elements.push({
      type: elementType,
      prefix: prefix as IdPrefix,
    });
  }

  return elements;
}

/**
 * Get detailed information about an element type.
 */
export function getElementTypeInfo(elementType: string): ElementTypeInfo | undefined {
  // First, find the matching prefix
  const prefixEntry = Object.entries(ID_PREFIXES).find(
    ([, type]) => type.toLowerCase() === elementType.toLowerCase()
  );
  
  // Also try to match by prefix name (e.g., 'step' matches 'Step' in types)
  const capitalizedType = elementType.charAt(0).toUpperCase() + elementType.slice(1);

  // Find the type containing this element
  for (const [_typeName, schema] of Object.entries(typeSchemas)) {
    const defs = (schema as Record<string, unknown>).$defs as Record<string, Record<string, unknown>> | undefined;
    if (!defs) continue;

    // Look for matching definition (case-insensitive)
    for (const [defName, defSchema] of Object.entries(defs)) {
      if (
        defName.toLowerCase() === elementType.toLowerCase() ||
        defName === capitalizedType
      ) {
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
            examples: propSchema.examples as unknown[] | undefined,
            pattern: propSchema.pattern as string | undefined,
            default: propSchema.default,
          });
        }

        // Find ID prefix
        const idPrefix = prefixEntry?.[0] as IdPrefix ?? 'XX' as IdPrefix;

        return {
          type: elementType,
          idPrefix,
          idPattern: `${idPrefix}#####`,
          description: (defSchema.description as string)?.split('\n')[0] ?? '',
          properties: props,
          requiredProperties: required,
        };
      }
    }
  }

  return undefined;
}

// =============================================================================
// ID Prefix Information
// =============================================================================

/**
 * Get information about an ID prefix from schema metadata.
 */
export function getIdPrefixInfo(prefix: IdPrefix): IdPrefixInfo | undefined {
  const elementType = ID_PREFIXES[prefix];
  if (!elementType) return undefined;

  // Find the Ref definition in refs defs schema
  const defs = (refsDefsSchema as Record<string, unknown>).$defs as Record<string, Record<string, unknown>> | undefined;
  if (!defs) {
    return {
      prefix,
      elementType,
      humanName: `${prefix} ID`,
      shortDescription: elementType,
      errorHint: `${prefix} + 5+ digits`,
      pattern: new RegExp(`^${prefix}\\d{5,}$`),
    };
  }

  // Look for the Ref type (e.g., ActorRef for AC)
  for (const [defName, defSchema] of Object.entries(defs)) {
    if (!defName.endsWith('Ref')) continue;
    
    const xubml = defSchema['x-ubml'] as Record<string, string> | undefined;
    if (xubml?.prefix === prefix) {
      // Require ALL metadata in schema - no fallbacks!
      if (!xubml.humanName || !xubml.shortDescription || !xubml.errorHint) {
        throw new Error(
          `Schema error: ${defName} is missing required x-ubml metadata for prefix ${prefix}. ` +
          `All fields must be defined in schema: humanName, shortDescription, errorHint`
        );
      }
      if (!defSchema.pattern) {
        throw new Error(
          `Schema error: ${defName} is missing pattern field for prefix ${prefix}`
        );
      }
      return {
        prefix,
        elementType,
        humanName: xubml.humanName,
        shortDescription: xubml.shortDescription,
        errorHint: xubml.errorHint,
        pattern: new RegExp(defSchema.pattern as string),
      };
    }
  }

  // No fallback - throw error if not found in schema
  throw new Error(
    `Schema error: No Ref type found with prefix "${prefix}". ` +
    `All ID prefixes must be defined in schemas/defs/refs.defs.yaml with complete x-ubml metadata.`
  );
}

/**
 * Get all ID prefix information.
 */
export function getAllIdPrefixes(): IdPrefixInfo[] {
  return (Object.keys(ID_PREFIXES) as IdPrefix[])
    .map(prefix => getIdPrefixInfo(prefix))
    .filter((info): info is IdPrefixInfo => info !== undefined);
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
 * Returns the next workflow step info, or undefined if all types exist.
 */
export function getSuggestedNextStep(existingTypes: DocumentType[]): WorkflowStep | undefined {
  const workflow = getSuggestedWorkflow();
  const existing = new Set(existingTypes);

  for (const step of workflow) {
    if (!existing.has(step.type)) {
      return step;
    }
  }

  return undefined;
}

// =============================================================================
// Help Topics (Schema-Driven)
// =============================================================================

/**
 * Help topic category.
 */
export type HelpTopicCategory = 'getting-started' | 'documents' | 'elements' | 'reference';

/**
 * Information about a help topic.
 */
export interface HelpTopic {
  /** Topic name (used as argument to `ubml help <topic>`) */
  name: string;
  /** Aliases for this topic */
  aliases?: string[];
  /** Short description for topic list */
  description: string;
  /** Topic category for grouping */
  category: HelpTopicCategory;
  /** Display order within category */
  order: number;
  /** Topic type for routing */
  type: 'static' | 'document' | 'element';
}

/**
 * Get all help topics derived from schema.
 * 
 * This provides a schema-driven topic list for the help command.
 * Static topics (quickstart, concepts, etc.) are listed first,
 * then document types and element types are derived from schema.
 */
export function getHelpTopics(): HelpTopic[] {
  const topics: HelpTopic[] = [];

  // Static topics (getting started and reference)
  const staticTopics: HelpTopic[] = [
    {
      name: 'quickstart',
      aliases: ['start'],
      description: 'Quick start guide',
      category: 'getting-started',
      order: 1,
      type: 'static',
    },
    {
      name: 'concepts',
      aliases: ['overview'],
      description: 'Core UBML concepts',
      category: 'getting-started',
      order: 2,
      type: 'static',
    },
    {
      name: 'workflow',
      description: 'Recommended modeling order',
      category: 'getting-started',
      order: 3,
      type: 'static',
    },
    {
      name: 'ids',
      description: 'ID pattern reference',
      category: 'reference',
      order: 1,
      type: 'static',
    },
    {
      name: 'duration',
      description: 'Duration format guide',
      category: 'reference',
      order: 2,
      type: 'static',
    },
    {
      name: 'raci',
      description: 'RACI matrix explained',
      category: 'reference',
      order: 3,
      type: 'static',
    },
    {
      name: 'vscode',
      aliases: ['editor'],
      description: 'VS Code setup and tips',
      category: 'reference',
      order: 4,
      type: 'static',
    },
  ];
  topics.push(...staticTopics);

  // Document types from schema
  const docTypes = getAllDocumentTypes();
  for (const docInfo of docTypes) {
    topics.push({
      name: docInfo.type,
      description: docInfo.shortDescription || docInfo.title,
      category: 'documents',
      order: docInfo.workflowOrder,
      type: 'document',
    });
  }

  // Key element types from fragments
  const elementTopics: Array<{ name: string; description: string; order: number }> = [
    { name: 'step', description: 'Process step properties', order: 1 },
    { name: 'actor', description: 'Actor properties and types', order: 2 },
    { name: 'entity', description: 'Entity properties', order: 3 },
    { name: 'hypothesis', description: 'Hypothesis properties', order: 4 },
    { name: 'scenario', description: 'Scenario properties', order: 5 },
  ];

  for (const elem of elementTopics) {
    // Only add if we have schema info
    const info = getElementTypeInfo(elem.name);
    if (info) {
      topics.push({
        name: elem.name,
        description: info.description || elem.description,
        category: 'elements',
        order: elem.order,
        type: 'element',
      });
    }
  }

  return topics;
}

/**
 * Get help topics grouped by category.
 */
export function getHelpTopicsByCategory(): Record<HelpTopicCategory, HelpTopic[]> {
  const topics = getHelpTopics();
  const grouped: Record<HelpTopicCategory, HelpTopic[]> = {
    'getting-started': [],
    'documents': [],
    'elements': [],
    'reference': [],
  };

  for (const topic of topics) {
    grouped[topic.category].push(topic);
  }

  // Sort each category by order
  for (const category of Object.keys(grouped) as HelpTopicCategory[]) {
    grouped[category].sort((a, b) => a.order - b.order);
  }

  return grouped;
}

/**
 * Find a help topic by name or alias.
 */
export function findHelpTopic(name: string): HelpTopic | undefined {
  const normalized = name.toLowerCase();
  const topics = getHelpTopics();

  for (const topic of topics) {
    if (topic.name === normalized) return topic;
    if (topic.aliases?.includes(normalized)) return topic;
  }

  return undefined;
}

// =============================================================================
// Concept Information (Block, Phase, etc.)
// =============================================================================

/**
 * Get information about a concept type from type schemas.
 * Used for help topics that explain control flow concepts like Block, Phase.
 * 
 * @param conceptName - Name of the concept (e.g., 'Block', 'Phase')
 */
export function getConceptInfo(conceptName: string): {
  name: string;
  description: string;
  properties: PropertyInfo[];
} | undefined {
  const capitalizedName = conceptName.charAt(0).toUpperCase() + conceptName.slice(1);

  // Search all type schemas for the concept definition
  for (const [_typeName, schema] of Object.entries(typeSchemas)) {
    const defs = (schema as Record<string, unknown>).$defs as Record<string, Record<string, unknown>> | undefined;
    if (!defs) continue;

    // Look for matching definition
    for (const [defName, defSchema] of Object.entries(defs)) {
      if (defName === capitalizedName || defName.toLowerCase() === conceptName.toLowerCase()) {
        const properties = (defSchema.properties ?? {}) as Record<string, Record<string, unknown>>;
        const required = (defSchema.required ?? []) as string[];

        const props: PropertyInfo[] = [];
        for (const [propName, propSchema] of Object.entries(properties)) {
          props.push({
            name: propName,
            type: getTypeString(propSchema),
            description: (propSchema.description as string) ?? '',
            required: required.includes(propName),
            enumValues: propSchema.enum as string[] | undefined,
            examples: propSchema.examples as unknown[] | undefined,
            pattern: propSchema.pattern as string | undefined,
            default: propSchema.default,
          });
        }

        return {
          name: conceptName,
          description: (defSchema.description as string) ?? '',
          properties: props,
        };
      }
    }
  }

  return undefined;
}
