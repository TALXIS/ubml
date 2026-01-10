/**
 * Tooling Hints
 *
 * Utilities for accessing pattern, enum, and nested property hints
 * extracted from schema x-ubml metadata.
 *
 * @module ubml/schema/hints
 */

import {
  PATTERN_HINTS,
  NESTED_PROPERTY_HINTS,
  ENUM_HINTS,
  type PatternHintData,
  type NestedPropertyHintData,
  type EnumHintData,
} from '../metadata.js';

// Re-export with simpler names for consumers
export type PatternHint = PatternHintData;
export type NestedPropertyHint = NestedPropertyHintData;
export type EnumHint = EnumHintData;

// =============================================================================
// Pattern Hints
// =============================================================================

/**
 * Get pattern hint for a regex pattern.
 */
export function getPatternHint(pattern: string): PatternHint | undefined {
  return PATTERN_HINTS.find((h) => h.pattern === pattern);
}

/**
 * Get pattern hint by prefix (e.g., 'AC', 'PR').
 */
export function getPatternHintByPrefix(prefix: string): PatternHint | undefined {
  return PATTERN_HINTS.find((h) => h.prefix === prefix);
}

// =============================================================================
// Nested Property Hints
// =============================================================================

/**
 * Get nested property hint for a property that might be misplaced.
 */
export function getNestedPropertyHint(propertyName: string): NestedPropertyHint | undefined {
  return NESTED_PROPERTY_HINTS.find((h) => h.childProperties.includes(propertyName));
}

/**
 * Check if a property should be nested inside another property.
 */
export function shouldBeNested(
  propertyName: string
): { parent: string; hint: string; example: string } | undefined {
  const hint = getNestedPropertyHint(propertyName);
  if (hint) {
    return {
      parent: hint.parentProperty,
      hint: hint.misplacementHint,
      example: hint.misplacementExample,
    };
  }
  return undefined;
}

// =============================================================================
// Enum Hints
// =============================================================================

/**
 * Get enum hint for a property name.
 */
export function getEnumHint(propertyName: string): EnumHint | undefined {
  return ENUM_HINTS.find((h) => h.propertyNames.includes(propertyName));
}

/**
 * Get hint for an invalid enum value on a specific property.
 *
 * Because multiple enum types can share the same property name (e.g., "kind" for
 * Phase.kind, Step.kind, Loop.kind), we first try to find an enum that has the
 * specific invalid value in its valueMistakes, then fall back to the first match.
 */
export function getEnumValueMistakeHint(
  propertyName: string,
  invalidValue: string
): string | undefined {
  // First, try to find an enum hint that specifically has this invalid value
  // This handles cases like "task" which should match Step.kind, not Phase.kind
  for (const enumHint of ENUM_HINTS) {
    if (enumHint.propertyNames.includes(propertyName) && enumHint.valueMistakes?.[invalidValue]) {
      return enumHint.valueMistakes[invalidValue].hint;
    }
  }
  return undefined;
}

/**
 * Get all valid values for a property's enum.
 */
export function getEnumValues(propertyName: string): string[] | undefined {
  const hint = getEnumHint(propertyName);
  return hint?.values;
}
