/**
 * ID Pattern and Configuration Extraction
 *
 * Extract ID patterns and config from schema defs.
 *
 * @module generate/extract-metadata/extract-id
 */

import { join } from 'path';
import { loadYamlFile, SCHEMAS_DIR } from '../utils.js';

export interface RefInfo {
  prefix: string;
  type: string;
  pattern: string;
  shortDescription?: string;
  humanName?: string;
  errorHint?: string;
}

export interface IdConfig {
  digitLength: number;
  pattern: string;
  initOffset: number;
  addOffset: number;
}

/**
 * Extract ID patterns from refs.defs.yaml.
 */
export function extractIdPatterns(): RefInfo[] {
  const refsPath = join(SCHEMAS_DIR, 'defs', 'refs.defs.yaml');
  const defs = loadYamlFile(refsPath) as {
    $defs?: Record<string, {
      pattern?: string;
      description?: string;
      'x-ubml'?: {
        prefix?: string;
        humanName?: string;
        shortDescription?: string;
        errorHint?: string;
      };
    }>;
  };

  const refInfos: RefInfo[] = [];

  if (defs.$defs) {
    for (const [name, def] of Object.entries(defs.$defs)) {
      // Only process Ref types with patterns
      if (name.endsWith('Ref') && def.pattern) {
        const match = def.pattern.match(/^\^([A-Z]+)\\d/);
        if (match) {
          const prefix = match[1];
          const typeName = name.replace('Ref', '');
          const type = typeName.charAt(0).toLowerCase() + typeName.slice(1);
          
          const xubml = def['x-ubml'];
          
          refInfos.push({
            prefix,
            type,
            pattern: def.pattern,
            shortDescription: xubml?.shortDescription,
            humanName: xubml?.humanName,
            errorHint: xubml?.errorHint,
          });
        }
      }
    }
  }

  return refInfos.sort((a, b) => a.prefix.localeCompare(b.prefix));
}

/**
 * Extract ID generation config from shared.defs.yaml.
 * Throws if x-ubml-id-config is missing or incomplete.
 */
export function extractIdConfig(): IdConfig {
  const sharedPath = join(SCHEMAS_DIR, 'defs', 'shared.defs.yaml');
  const defs = loadYamlFile(sharedPath) as { 'x-ubml-id-config'?: Partial<IdConfig> };

  const config = defs['x-ubml-id-config'];
  if (!config) {
    throw new Error(
      'Schema error: shared.defs.yaml must define x-ubml-id-config'
    );
  }

  const required = ['digitLength', 'pattern', 'initOffset', 'addOffset'] as const;
  for (const field of required) {
    if (config[field] === undefined) {
      throw new Error(`Schema error: x-ubml-id-config.${field} is missing`);
    }
  }

  return config as IdConfig;
}
