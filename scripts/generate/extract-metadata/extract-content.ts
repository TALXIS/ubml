/**
 * Content Detection and Configuration Extraction
 *
 * Extract content detection config and other configuration from schemas.
 *
 * @module generate/extract-metadata/extract-content
 */

import { join } from 'path';
import { loadYamlFile, SCHEMAS_DIR } from '../utils.js';

export interface ContentDetectionConfig {
  documentType: string;
  detectBy: string[];
}

export interface ValidationPatterns {
  duration: string;
  time: string;
}

export interface CategoryConfig {
  key: string;
  displayName: string;
  order: number;
}

/**
 * Extract content detection configuration from document schemas.
 * Reads x-ubml-cli.detectBy from each document schema.
 */
export function extractContentDetectionConfig(documentTypes: string[]): ContentDetectionConfig[] {
  const configs: ContentDetectionConfig[] = [];

  for (const type of documentTypes) {
    const schemaPath = join(SCHEMAS_DIR, 'documents', `${type}.schema.yaml`);
    const schema = loadYamlFile(schemaPath) as {
      'x-ubml-cli'?: {
        detectBy?: string[];
      };
    };

    const metadata = schema['x-ubml-cli'];
    const detectBy = metadata?.detectBy ?? [];

    if (detectBy.length > 0) {
      configs.push({
        documentType: type,
        detectBy,
      });
    }
  }

  return configs;
}

/**
 * Extract validation patterns from primitives.defs.yaml.
 * Reads pattern from DurationString and TimeString $defs.
 * Throws if patterns are missing.
 */
export function extractValidationPatterns(): ValidationPatterns {
  const primitivesPath = join(SCHEMAS_DIR, 'defs', 'primitives.defs.yaml');
  const defs = loadYamlFile(primitivesPath) as {
    $defs?: Record<string, { pattern?: string }>;
  };

  // DurationString has the actual pattern (Duration is a oneOf wrapper)
  if (!defs.$defs?.DurationString?.pattern) {
    throw new Error('Schema error: primitives.defs.yaml must define DurationString with pattern');
  }
  if (!defs.$defs?.TimeString?.pattern) {
    throw new Error('Schema error: primitives.defs.yaml must define TimeString with pattern');
  }

  return {
    duration: defs.$defs.DurationString.pattern,
    time: defs.$defs.TimeString.pattern,
  };
}

/**
 * Extract category configuration from shared.defs.yaml.
 * Reads x-ubml-categories for display order and naming.
 * Throws if x-ubml-categories is missing or empty.
 */
export function extractCategoryConfig(): CategoryConfig[] {
  const sharedPath = join(SCHEMAS_DIR, 'defs', 'shared.defs.yaml');
  const defs = loadYamlFile(sharedPath) as {
    'x-ubml-categories'?: CategoryConfig[];
  };

  const categories = defs['x-ubml-categories'];
  if (!categories || !Array.isArray(categories) || categories.length === 0) {
    throw new Error(
      'Schema error: shared.defs.yaml must define x-ubml-categories array'
    );
  }

  return categories.sort((a, b) => a.order - b.order);
}
