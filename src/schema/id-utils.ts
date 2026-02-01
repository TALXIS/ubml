/**
 * ID Utilities
 *
 * Utilities for working with UBML IDs - formatting, parsing, validation.
 * This module consolidates all ID-related functionality.
 *
 * @module ubml/schema/id-utils
 */

import { ID_CONFIG, ID_PREFIXES, type IdPrefix, type ElementType } from '../generated/data.js';

// =============================================================================
// ID Formatting
// =============================================================================

/**
 * Format an ID with the given prefix and number.
 * @example formatId('AC', 1) // → 'AC00001'
 * @example formatId('PR', 1000) // → 'PR01000'
 */
export function formatId(prefix: IdPrefix, num: number): string {
  return `${prefix}${String(num).padStart(ID_CONFIG.digitLength, '0')}`;
}

/**
 * Parse the numeric portion from an ID.
 * @example parseIdNumber('AC00001') // → 1
 * @example parseIdNumber('PR01000') // → 1000
 */
export function parseIdNumber(id: string): number | undefined {
  const match = id.match(/^[A-Z]+(\d+)$/);
  return match ? parseInt(match[1], 10) : undefined;
}

/**
 * Get the prefix from an ID.
 * @example getIdPrefix('AC00001') // → 'AC'
 */
export function getIdPrefix(id: string): IdPrefix | undefined {
  const match = id.match(/^([A-Z]+)\d+$/);
  if (!match) return undefined;
  const prefix = match[1] as IdPrefix;
  return prefix in ID_PREFIXES ? prefix : undefined;
}

/**
 * Find the next available ID for a given prefix.
 * @param prefix - The ID prefix (e.g., 'AC', 'PR')
 * @param existingIds - Set of existing IDs to avoid
 * @param startFrom - Starting number (defaults to 1)
 */
export function getNextId(prefix: IdPrefix, existingIds: Set<string>, startFrom = 1): string {
  let num = startFrom;
  let id = formatId(prefix, num);
  while (existingIds.has(id)) {
    num++;
    id = formatId(prefix, num);
  }
  return id;
}

// =============================================================================
// ID Validation
// =============================================================================

/**
 * Combined pattern matching any valid UBML ID.
 */
export const ALL_ID_PATTERN = new RegExp(
  `^(${Object.keys(ID_PREFIXES).join('|')})\\d{${ID_CONFIG.digitLength},}$`
);

/**
 * ID patterns for UBML elements (RegExp).
 * Uses 5+ digit format (zero-padded).
 */
export const ID_PATTERNS: Record<ElementType, RegExp> = Object.fromEntries(
  Object.entries(ID_PREFIXES).map(([prefix, type]) => [
    type,
    new RegExp(`^${prefix}\\d{${ID_CONFIG.digitLength},}$`),
  ])
) as Record<ElementType, RegExp>;

/**
 * Validate an ID against its expected pattern.
 */
export function validateId(type: ElementType, id: string): boolean {
  const pattern = ID_PATTERNS[type];
  return pattern?.test(id) ?? false;
}

/**
 * Check if a string is a valid UBML ID of any type.
 */
export function isValidId(id: string): boolean {
  return ALL_ID_PATTERN.test(id);
}

/**
 * Get the element type from an ID.
 */
export function getElementTypeFromId(id: string): ElementType | undefined {
  const prefix = getIdPrefix(id);
  if (prefix) {
    return ID_PREFIXES[prefix];
  }
  return undefined;
}

// =============================================================================
// ID Generation Helpers
// =============================================================================

/**
 * Get the starting ID number for 'ubml init' templates.
 */
export function getInitStartNumber(): number {
  return ID_CONFIG.initOffset;
}

/**
 * Get the starting ID number for 'ubml add' templates.
 */
export function getAddStartNumber(): number {
  return ID_CONFIG.addOffset;
}

/**
 * Get the digit length for IDs.
 */
export function getIdDigitLength(): number {
  return ID_CONFIG.digitLength;
}
