/**
 * Document Type Information
 *
 * Query document type metadata from schemas.
 *
 * @module ubml/schema/introspection/document-info
 */

import {
  DOCUMENT_TYPES,
  type DocumentType,
} from '../../generated/data.js';
import { documentSchemas } from '../../generated/bundled.js';
import type {
  SchemaCliMetadata,
  DocumentTypeInfo,
  SectionInfo,
} from '../types.js';
import { getCommonProperties } from '../derive.js';

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
      `All document schemas must define: category, categoryDisplayName, workflowOrder, shortDescription, defaultFilename, gettingStarted, exampleFilename`
    );
  }

  // Require all critical fields
  if (!metadata.category || !metadata.categoryDisplayName || !metadata.shortDescription || !metadata.defaultFilename || metadata.workflowOrder === undefined || !metadata.gettingStarted || !metadata.exampleFilename) {
    throw new Error(
      `Schema error: ${type}.schema.yaml x-ubml-cli is incomplete. ` +
      `Required fields: category, categoryDisplayName, workflowOrder, shortDescription, defaultFilename, gettingStarted, exampleFilename`
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
    workflowOrder: metadata.workflowOrder,
    defaultFilename: metadata.defaultFilename,
    gettingStarted: metadata.gettingStarted,
    exampleFilename: metadata.exampleFilename,
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
