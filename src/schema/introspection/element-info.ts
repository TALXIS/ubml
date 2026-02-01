/**
 * Element Type Information
 *
 * Query element type metadata from schemas.
 *
 * @module ubml/schema/introspection/element-info
 */

import {
  ID_PREFIXES,
  type IdPrefix,
} from '../../generated/data.js';
import { typeSchemas, refsDefsSchema } from '../../generated/bundled.js';
import { getTypeString } from '../utils.js';
import type {
  ElementTypeInfo,
  PropertyInfo,
  IdPrefixInfo,
} from '../types.js';

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
