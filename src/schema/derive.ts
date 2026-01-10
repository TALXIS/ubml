/**
 * Schema-Derived Metadata
 *
 * Functions that derive metadata from schema at runtime.
 * No hardcoded lists - everything comes from x-ubml schema extensions.
 *
 * @module ubml/schema/derive
 */

import { defsSchema, rootSchema } from '../generated/bundled.js';
import type { IdPrefix } from '../metadata.js';
import { getCategorySortOrder } from '../metadata.js';

// =============================================================================
// Types
// =============================================================================

/**
 * ID prefix category information derived from schema.
 */
export interface IdCategory {
  /** Category key (e.g., 'process-elements') */
  key: string;
  /** Display name (e.g., 'Process Elements') */
  displayName: string;
  /** Prefixes in this category */
  prefixes: IdPrefix[];
}

/**
 * ID prefix information derived from schema x-ubml metadata.
 */
export interface IdPrefixMetadata {
  prefix: IdPrefix;
  type: string;
  humanName: string;
  shortDescription: string;
  errorHint: string;
  category: string;
  categoryDisplayName: string;
}

// =============================================================================
// Schema-Derived Functions
// =============================================================================

/**
 * Get all ID prefix metadata from schema.
 * Reads x-ubml extensions from $defs/*Ref definitions.
 */
export function getAllIdPrefixMetadata(): IdPrefixMetadata[] {
  const defs = (defsSchema as Record<string, unknown>).$defs as Record<string, Record<string, unknown>> | undefined;
  if (!defs) return [];

  const result: IdPrefixMetadata[] = [];

  for (const [name, def] of Object.entries(defs)) {
    if (!name.endsWith('Ref')) continue;

    const xubml = def['x-ubml'] as Record<string, string> | undefined;
    if (!xubml?.prefix) continue;

    // Require ALL metadata in schema - no fallbacks!
    if (!xubml.humanName || !xubml.shortDescription || !xubml.errorHint || !xubml.category || !xubml.categoryDisplayName) {
      throw new Error(
        `Schema error: ${name} is missing required x-ubml metadata. ` +
        `All Ref types must define: prefix, humanName, shortDescription, errorHint, category, categoryDisplayName`
      );
    }

    result.push({
      prefix: xubml.prefix as IdPrefix,
      type: xubml.type || name.replace('Ref', '').toLowerCase(),
      humanName: xubml.humanName,
      shortDescription: xubml.shortDescription,
      errorHint: xubml.errorHint,
      category: xubml.category,
      categoryDisplayName: xubml.categoryDisplayName,
    });
  }

  return result;
}

/**
 * Get ID prefixes grouped by category.
 * Derived entirely from schema x-ubml.category metadata.
 *
 * @returns Map of category display name to prefixes
 */
export function getIdPrefixCategories(): IdCategory[] {
  const prefixMetadata = getAllIdPrefixMetadata();
  const categoryMap = new Map<string, IdCategory>();

  for (const meta of prefixMetadata) {
    let category = categoryMap.get(meta.category);
    if (!category) {
      category = {
        key: meta.category,
        displayName: meta.categoryDisplayName,
        prefixes: [],
      };
      categoryMap.set(meta.category, category);
    }
    category.prefixes.push(meta.prefix);
  }

  // Sort by order from CATEGORY_CONFIG (schema-driven, no hardcoding!)
  return Array.from(categoryMap.values()).sort((a, b) => {
    const aOrder = getCategorySortOrder(a.key);
    const bOrder = getCategorySortOrder(b.key);
    return aOrder - bOrder;
  });
}

/**
 * Get ID prefixes grouped by category display name.
 * Returns a simple Record for CLI display.
 *
 * @returns Map of display name to prefix array
 */
export function getIdPrefixCategoryMap(): Record<string, IdPrefix[]> {
  const categories = getIdPrefixCategories();
  const result: Record<string, IdPrefix[]> = {};

  for (const cat of categories) {
    result[cat.displayName] = cat.prefixes;
  }

  return result;
}

/**
 * Get metadata for a specific prefix.
 */
export function getIdPrefixMetadata(prefix: IdPrefix): IdPrefixMetadata | undefined {
  return getAllIdPrefixMetadata().find((m) => m.prefix === prefix);
}

// =============================================================================
// Common Properties
// =============================================================================

import { COMMON_PROPERTIES } from '../metadata.js';

/**
 * Property names that are common across all document types.
 * These are the standard UBML document properties that appear in every document.
 * Now derived from schemas at generation time (no hardcoding!).
 */
export function getCommonProperties(): Set<string> {
  return new Set(COMMON_PROPERTIES);
}

// =============================================================================
// Re-exports
// =============================================================================

export type { IdPrefix };
