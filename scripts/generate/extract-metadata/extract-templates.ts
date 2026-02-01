/**
 * Template Data Extraction
 *
 * Extract template data and sections from document schemas.
 *
 * @module generate/extract-metadata/extract-templates
 */

import { join } from 'path';
import { loadYamlFile, SCHEMAS_DIR } from '../utils.js';

export interface TemplateSection {
  name: string;
  idPrefix: string | null;
  description: string;
  required: boolean;
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
          const match = pattern.match(/^\^([A-Z]{2})/);
          if (match) {
            idPrefix = match[1];
            break;
          }
        }
      }

      const description = propSchema.description as string | undefined;
      sections.push({
        name: propName,
        idPrefix,
        description: description ? description.split('\n')[0] : '',
        required: required.includes(propName),
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
