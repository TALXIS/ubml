/**
 * Generate template-data.ts
 *
 * Generate PURE DATA for document templates from schemas.
 * No functions - just template metadata that can be used by hand-written factories.
 *
 * @module generate/generate-template-data
 */

import { createBanner } from './utils.js';
import type { TemplateData } from './extract-metadata.js';

// =============================================================================
// Types (also exported in the generated file)
// =============================================================================

export interface DocumentTemplateInfo {
  type: string;
  shortDescription: string;
  gettingStarted: string[];
  sections: SectionInfo[];
  requiredDocProps: string[];
}

export interface SectionInfo {
  name: string;
  idPrefix: string;
  description: string;
  requiredProps: string[];
  properties: PropertyInfo[];
  defaults?: Record<string, unknown>;
}

export interface PropertyInfo {
  name: string;
  type: string;
  description: string;
  required: boolean;
  enumValues?: string[];
  default?: unknown;
}

// =============================================================================
// Transform Template Data
// =============================================================================

/**
 * Transform extracted template data to the format expected by templates.
 */
export function transformTemplateData(templates: TemplateData[]): DocumentTemplateInfo[] {
  return templates.map((t) => ({
    type: t.type,
    shortDescription: t.shortDescription,
    gettingStarted: t.gettingStarted,
    sections: t.sections.map((s) => ({
      name: s.name,
      idPrefix: s.idPrefix ?? '',
      description: s.description,
      requiredProps: s.required ? [s.name] : [],
      properties: [],
      defaults: t.templateDefaults?.[s.name],
    })),
    requiredDocProps: [],
  }));
}

// =============================================================================
// Generate template-data.ts
// =============================================================================

/**
 * Generate template-data.ts content - pure data exports only.
 */
export function generateTemplateDataTs(templateData: DocumentTemplateInfo[]): string {
  return `${createBanner('template-data.ts', `UBML Document Template Data

This file contains PURE DATA ONLY - no functions.
Runtime template factories are in src/templates.ts.

Templates are derived from YAML schemas including:
- Section structure from document schemas
- Required/optional properties from fragment schemas
- Default values from x-ubml-cli.templateDefaults
- Descriptions for inline documentation`)}

import type { DocumentType } from './data.js';

// ============================================================================
// TEMPLATE TYPES
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
    Object.fromEntries(templateData.map((t) => [t.type, t])),
    null,
    2
  )};
`;
}
