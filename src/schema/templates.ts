/**
 * Template Utilities
 *
 * Functions for creating document templates from schema metadata.
 *
 * @module ubml/schema/templates
 */

import { SCHEMA_VERSION, type DocumentType, type IdPrefix } from '../metadata.js';
import { getDocumentTypeInfo } from './introspection.js';
import type { DocumentTypeInfo, SectionInfo } from './types.js';
import { formatId, getInitStartNumber, getAddStartNumber } from './id-utils.js';

// =============================================================================
// Template Creation
// =============================================================================

/**
 * Options for creating a document template.
 */
export interface CreateDocumentOptions {
  /** Document name (defaults to type-specific default) */
  name?: string;
  /** Whether to include comments in YAML output */
  useComments?: boolean;
  /** Starting ID source: 'init' (00001), 'add' (01000), or custom number */
  startIds?: 'init' | 'add' | number;
}

/**
 * Create a minimal document template for a document type.
 */
export function createDocument(
  type: DocumentType,
  options: CreateDocumentOptions = {}
): Record<string, unknown> {
  const info = getDocumentTypeInfo(type);
  if (!info) {
    throw new Error(`Unknown document type: ${type}`);
  }

  const { name, startIds = 'add' } = options;
  const startNumber = typeof startIds === 'number' 
    ? startIds 
    : startIds === 'init' 
      ? getInitStartNumber() 
      : getAddStartNumber();

  const template: Record<string, unknown> = {
    ubml: SCHEMA_VERSION,
  };

  // Add name for most types
  if (type !== 'links') {
    template.name = name ?? info.defaultFilename ?? `My ${info.title}`;
    template.description = `${info.title} description`;
  }

  // Add a sample for each required section with ID prefix
  let sectionIndex = 0;
  for (const section of info.sections) {
    if (section.required || section.idPrefix) {
      if (section.idPrefix) {
        template[section.name] = createSampleSection(section, info, startNumber + sectionIndex * 10);
        sectionIndex++;
      }
    }
  }

  return template;
}

/**
 * Create a sample section with one element.
 */
function createSampleSection(
  section: SectionInfo,
  docInfo: DocumentTypeInfo,
  idNumber: number
): Record<string, unknown> {
  if (!section.idPrefix) {
    return {};
  }

  const id = formatId(section.idPrefix as IdPrefix, idNumber);

  // Get singular name for element
  const singularName = section.name.replace(/e?s$/, '');

  const sample: Record<string, unknown> = {
    name: `Sample ${singularName}`,
    description: 'Description goes here',
  };

  // Apply template defaults from schema
  const defaults = docInfo.templateDefaults?.[section.name];
  if (defaults) {
    Object.assign(sample, defaults);
  }

  return { [id]: sample };
}

/**
 * Get the default filename for a document type.
 */
export function getDefaultFilename(type: DocumentType): string {
  const info = getDocumentTypeInfo(type);
  return info?.defaultFilename ?? type;
}

/**
 * Create a YAML template string for a document type with optional comments.
 */
export function createDocumentYaml(
  type: DocumentType,
  options: CreateDocumentOptions = {}
): string {
  const { useComments = true } = options;
  const doc = createDocument(type, options);
  const info = getDocumentTypeInfo(type);

  const lines: string[] = [];

  // Add header comment
  if (useComments && info) {
    lines.push('# ============================================================================');
    lines.push(`# ${info.title}`);
    lines.push('# ============================================================================');
    if (info.shortDescription) {
      lines.push(`# ${info.shortDescription}`);
    }
    lines.push('#');
    // Add ID pattern quick reference
    const idPatterns = info.sections
      .filter((s) => s.idPrefix)
      .map((s) => `${s.idPrefix}### for ${s.name}`);
    if (idPatterns.length > 0) {
      lines.push(`# ID patterns: ${idPatterns.join(', ')}`);
    }
    lines.push('# Run: ubml validate . to check for errors');
    lines.push('# ============================================================================');
    lines.push('');
  }

  // Serialize the document to YAML
  lines.push(`ubml: "${doc.ubml}"`);
  if (doc.name) {
    lines.push(`name: ${JSON.stringify(doc.name)}`);
  }
  if (doc.description) {
    lines.push(`description: ${JSON.stringify(doc.description)}`);
  }
  lines.push('');

  // Add sections
  for (const section of info?.sections ?? []) {
    const sectionData = doc[section.name] as Record<string, unknown> | undefined;
    if (!sectionData) continue;

    if (useComments && section.description) {
      lines.push(`# ${section.description}`);
    }
    lines.push(`${section.name}:`);

    for (const [id, value] of Object.entries(sectionData)) {
      lines.push(`  ${id}:`);
      if (typeof value === 'object' && value !== null) {
        for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
          if (typeof val === 'string') {
            lines.push(`    ${key}: ${JSON.stringify(val)}`);
          } else {
            lines.push(`    ${key}: ${JSON.stringify(val)}`);
          }
        }
      }
    }
    lines.push('');
  }

  return lines.join('\n');
}

// =============================================================================
// Re-exports for convenience
// =============================================================================

export type { DocumentTypeInfo, SectionInfo } from './types.js';
