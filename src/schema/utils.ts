/**
 * Schema Utilities
 *
 * Shared utilities for working with JSON Schema.
 *
 * @module ubml/schema/utils
 */

/**
 * Get JSON Schema type as a readable string.
 */
export function getTypeString(schema: Record<string, unknown>): string {
  if (schema.$ref) {
    const ref = schema.$ref as string;
    const match = ref.match(/#\/\$defs\/(\w+)/);
    return match ? match[1] : 'object';
  }
  if (schema.type === 'array') {
    const items = schema.items as Record<string, unknown> | undefined;
    if (items?.$ref) {
      const ref = items.$ref as string;
      const match = ref.match(/#\/\$defs\/(\w+)/);
      return match ? `${match[1]}[]` : 'array';
    }
    return `${items?.type ?? 'any'}[]`;
  }
  if (schema.enum) {
    return 'enum';
  }
  if (schema.type === 'object') {
    if (schema.patternProperties) {
      return 'object (keyed)';
    }
    return 'object';
  }
  return (schema.type as string) ?? 'any';
}
