/**
 * Template Generators for UBML CLI Add Command
 *
 * Create commented templates with schema-derived metadata.
 *
 * @module ubml/cli/commands/add/templates
 */

import { serialize } from '../../../index';
import { 
  type DocumentType, 
  SCHEMA_VERSION,
} from '../../../metadata.js';
import {
  TEMPLATE_DATA,
  createMinimalDocument,
  getDocumentHeader,
  getSectionComment,
} from '../../../templates.js';
import { formatDisplayName, generateSectionItems } from './items.js';

/**
 * Format a value for YAML output.
 */
export function formatValue(value: unknown): string {
  if (value === null || value === undefined) return '~';
  if (typeof value === 'string') {
    // Check if it's raw YAML (starts with newline)
    if (value.startsWith('\n')) return value;
    // Quote strings that need it
    if (value.includes(':') || value.includes('#') || value.includes('\n')) {
      return `"${value.replace(/"/g, '\\"')}"`;
    }
    return `"${value}"`;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    return `[${value.map(v => formatValue(v)).join(', ')}]`;
  }
  if (typeof value === 'object') {
    // Check for __raw marker
    const raw = (value as Record<string, unknown>).__raw;
    if (raw) return String(raw);
    return '{}';
  }
  return String(value);
}

/**
 * Generate YAML for a document section with comments.
 */
export function generateSectionYaml(
  docType: DocumentType,
  section: typeof TEMPLATE_DATA[DocumentType]['sections'][number],
  name: string
): string[] {
  const lines: string[] = [];
  
  // Section header with available properties
  lines.push(`${section.name}:`);
  lines.push(getSectionComment(docType, section.name));
  
  // Generate sample items based on section type
  const items = generateSectionItems(docType, section, name);
  
  for (const item of items) {
    lines.push(`  ${item.id}:`);
    
    // Check for raw YAML content (pre-formatted)
    const rawContent = item.properties.__raw;
    if (rawContent && typeof rawContent === 'string') {
      // Output raw content as-is (already properly indented)
      lines.push(rawContent);
    } else {
      // Output regular properties
      for (const [key, value] of Object.entries(item.properties)) {
        const propInfo = section.properties.find(p => p.name === key);
        const comment = propInfo?.enumValues 
          ? `  # ${propInfo.enumValues.join(' | ')}`
          : '';
        lines.push(`    ${key}: ${formatValue(value)}${comment}`);
      }
      if (item.commentedProps) {
        for (const [key, value] of Object.entries(item.commentedProps)) {
          lines.push(`    # ${key}: ${formatValue(value)}`);
        }
      }
    }
  }
  
  return lines;
}

/**
 * Create a YAML template with helpful inline comments.
 * Uses schema-derived metadata for property info and comments.
 */
export function createCommentedTemplate(type: DocumentType, name: string): string {
  const templateInfo = TEMPLATE_DATA[type];
  if (!templateInfo || templateInfo.sections.length === 0) {
    // Fallback to minimal document from schema
    const doc = createMinimalDocument(type, name);
    return serialize(doc);
  }

  // Build YAML with comments
  const lines: string[] = [];
  
  // Header with description and quick reference
  lines.push(getDocumentHeader(type, formatDisplayName(name)));
  lines.push(`ubml: "${SCHEMA_VERSION}"`);
  lines.push('');

  // Generate each section
  for (const section of templateInfo.sections) {
    lines.push(...generateSectionYaml(type, section, name));
    lines.push('');
  }

  return lines.join('\n');
}
