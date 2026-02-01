/**
 * Schema Introspection Types
 *
 * Type definitions for schema introspection results.
 * These types describe the structure of information extracted from schemas.
 *
 * @module ubml/schema/types
 */

import type { DocumentType, IdPrefix } from '../generated/data.js';

/**
 * CLI metadata from schema x-ubml-cli extension.
 */
export interface SchemaCliMetadata {
  category: 'core' | 'analysis' | 'strategy' | 'advanced';
  categoryDisplayName: string;
  workflowOrder: number;
  shortDescription: string;
  defaultFilename?: string;
  gettingStarted: string[];
  exampleFilename: string;
  exampleFilenameAlternative?: string;
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
  defaultFilename: string;
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
  examples?: unknown[];
  pattern?: string;
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

/**
 * Information about an ID prefix.
 */
export interface IdPrefixInfo {
  prefix: IdPrefix;
  elementType: string;
  humanName: string;
  shortDescription: string;
  errorHint: string;
  pattern: RegExp;
}
