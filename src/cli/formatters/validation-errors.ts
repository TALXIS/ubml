/**
 * Validation Error Formatter
 *
 * Transforms cryptic JSON Schema errors into actionable guidance.
 * Uses generated metadata from schemas to provide accurate hints.
 *
 * @module ubml/cli/formatters/validation-errors
 */

import type { RawAjvError, SchemaContext } from '../../validator.js';
import { 
  getPatternHint, 
  shouldBeNested,
  getEnumValueMistakeHint,
  SCHEMA_VERSION,
} from '../../metadata.js';

/**
 * Enhanced error result with formatted message and suggestions.
 */
export interface EnhancedError {
  /** Main error message */
  message: string;
  /** "Did you mean?" suggestion if applicable */
  suggestion?: string;
  /** Example showing correct usage */
  example?: string;
  /** Hint about correct format */
  hint?: string;
  /** List of valid options (for enum/additionalProperties) */
  validOptions?: string[];
}

/**
 * Format a validation error with helpful context and suggestions.
 * Returns an enhanced error object with structured information.
 */
export function formatValidationError(
  error: RawAjvError,
  schemaContext?: SchemaContext
): EnhancedError {
  switch (error.keyword) {
    case 'additionalProperties':
      return formatAdditionalPropertiesError(error, schemaContext);
    
    case 'enum':
      return formatEnumError(error, schemaContext);
    
    case 'pattern':
      return formatPatternError(error, schemaContext);
    
    case 'required':
      return formatRequiredError(error, schemaContext);
    
    case 'type':
      return formatTypeError(error, schemaContext);
    
    case 'const':
      return formatConstError(error, schemaContext);
    
    case 'oneOf':
    case 'anyOf':
      return formatOneOfError(error, schemaContext);
    
    case 'minLength':
    case 'maxLength':
      return formatLengthError(error, schemaContext);
    
    case 'minimum':
    case 'maximum':
      return formatRangeError(error, schemaContext);
      
    default:
      return { message: error.message || 'Validation error' };
  }
}

/**
 * Format enhanced error to a string for CLI output.
 */
export function formatEnhancedErrorToString(enhanced: EnhancedError): string {
  const lines: string[] = [enhanced.message];
  
  if (enhanced.suggestion) {
    lines.push('');
    lines.push(enhanced.suggestion);
  }
  
  if (enhanced.hint) {
    lines.push('');
    lines.push(enhanced.hint);
  }
  
  if (enhanced.example) {
    lines.push('');
    lines.push(enhanced.example);
  }
  
  if (enhanced.validOptions && enhanced.validOptions.length > 0) {
    lines.push('');
    const optionsStr = enhanced.validOptions.slice(0, 12).join(', ');
    const more = enhanced.validOptions.length > 12 
      ? ` ... (${enhanced.validOptions.length - 12} more)`
      : '';
    lines.push(`Valid options: ${optionsStr}${more}`);
  }
  
  return lines.join('\n');
}

/**
 * Format "additional properties not allowed" errors.
 */
function formatAdditionalPropertiesError(
  error: RawAjvError, 
  schemaContext?: SchemaContext
): EnhancedError {
  const invalidProp = error.params?.additionalProperty as string;
  const validProps = schemaContext?.validProperties || [];
  
  const result: EnhancedError = {
    message: `Unknown property: "${invalidProp}"`,
    validOptions: validProps,
  };
  
  // Find closest match for suggestion
  if (validProps.length > 0) {
    const closest = findClosestMatch(invalidProp, validProps);
    if (closest && levenshtein(invalidProp, closest) <= 3) {
      result.suggestion = `Did you mean: "${closest}"?`;
    }
  }
  
  // Check if this property should be nested inside another property
  // (e.g., 'responsible' should be inside 'raci')
  const nestedHint = shouldBeNested(invalidProp);
  if (nestedHint) {
    result.suggestion = `Did you mean to put this inside '${nestedHint.parent}'?`;
    result.example = nestedHint.example;
  }
  
  // Special handling for common misplacements
  const misplacementHints: Record<string, string> = {
    'steps': 'Steps belong inside a process definition, not at the document root.',
    'actors': 'For a process document, actors should be in a separate *.actors.ubml.yaml file.',
    'duration': 'If this is at the process level, use it inside individual steps instead.',
    'raci': 'RACI should be inside a step definition.',
    'guard': 'Guards belong on links or steps, not at the process level.',
    'owner': 'Steps use RACI for responsibility. Add: RACI: { responsible: [AC00001] }',
    'properties': 'Entities use "attributes" (typed) or "custom" (freeform). Not "properties".',
    'goal': 'Goals belong in strategy (valueStreams), hypotheses (SCQH), or metrics (KPIs). Processes describe HOW work happens.',
    'objective': 'Objectives belong in strategy or hypotheses documents. Processes describe HOW, not WHY.',
    'target': 'Targets belong in metrics.ubml.yaml as KPI definitions. Link process to KPIs via references.',
  };
  
  if (misplacementHints[invalidProp]) {
    result.hint = misplacementHints[invalidProp];
  }
  
  return result;
}

/**
 * Format enum validation errors using generated schema metadata.
 */
function formatEnumError(
  error: RawAjvError, 
  _schemaContext?: SchemaContext
): EnhancedError {
  const allowedValues = (error.params?.allowedValues as string[]) || [];
  const actualValue = String(error.data ?? '');
  
  const result: EnhancedError = {
    message: `Invalid value: "${actualValue}"`,
    validOptions: allowedValues,
  };
  
  // Try to detect which property this is from the path
  const pathParts = (error.instancePath || '').split('/');
  const propName = pathParts[pathParts.length - 1];
  
  // Get hint from generated schema metadata (single source of truth)
  // This provides specific guidance for common mistakes like "task" → "action"
  const enumMistakeHint = getEnumValueMistakeHint(propName, actualValue);
  if (enumMistakeHint) {
    // Use as suggestion for compact display (shown inline)
    result.suggestion = enumMistakeHint;
    return result;
  }
  
  // Fall back to closest match if no specific hint
  if (allowedValues.length > 0) {
    const closest = findClosestMatch(actualValue, allowedValues);
    if (closest && levenshtein(actualValue, closest) <= 2) {
      result.suggestion = `Did you mean: "${closest}"?`;
    }
  }
  
  return result;
}

/**
 * Format pattern validation errors using generated schema metadata.
 */
function formatPatternError(
  error: RawAjvError, 
  schemaContext?: SchemaContext
): EnhancedError {
  const pattern = error.params?.pattern as string;
  const value = String(error.data ?? '');
  
  // Get pattern info from generated metadata (single source of truth)
  const patternInfo = getPatternHint(pattern);
  const examples = schemaContext?.examples || patternInfo?.examples || [];
  
  const result: EnhancedError = {
    message: `Invalid format: "${value}"`,
    hint: patternInfo?.errorHint || `Must match pattern: ${pattern}`,
  };
  
  if (examples.length > 0) {
    const exampleStrs = examples.slice(0, 4).map((ex: unknown) => 
      typeof ex === 'string' ? ex : JSON.stringify(ex)
    );
    result.example = `Examples: ${exampleStrs.join(', ')}`;
  }
  
  // Try to provide specific fix suggestions based on the pattern and value
  if (pattern.includes('\\d{3,}$') && /^[A-Z]{2}\d{1,2}$/.test(value)) {
    result.suggestion = `ID "${value}" needs at least 3 digits. Try "${value.slice(0, 2)}0${value.slice(2)}" or "${value.slice(0, 2)}${value.slice(2).padStart(3, '0')}"`;
  }
  
  // Check for common mistakes defined in schema x-ubml metadata
  if (patternInfo?.commonMistakes) {
    for (const mistake of patternInfo.commonMistakes) {
      const mistakePattern = new RegExp(mistake.pattern);
      if (mistakePattern.test(value)) {
        // Interpolate {value} placeholder in the message
        result.suggestion = mistake.message.replace(/\{value\}/g, value);
        break;
      }
    }
  }
  
  return result;
}

/**
 * Format required property errors.
 */
function formatRequiredError(
  error: RawAjvError,
  _schemaContext?: SchemaContext
): EnhancedError {
  const missingProp = error.params?.missingProperty as string;
  
  const result: EnhancedError = {
    message: `Missing required property: "${missingProp}"`,
  };
  
  // Add hints for common required properties
  const requiredHints: Record<string, string> = {
    'name': 'Every element needs a descriptive name.',
    'id': 'Every element needs a unique ID matching its key (e.g., AC00001).',
    'ubml': `Add \`ubml: "${SCHEMA_VERSION}"\` at the top of the file.`,
    'type': 'Specify the document or element type.',
    'steps': 'A process needs at least one step. Add a `steps:` section.',
    'to': 'Links need a target. Specify the `to:` step ID.',
    'from': 'Links need a source. Specify the `from:` step ID.',
  };
  
  if (requiredHints[missingProp]) {
    result.hint = requiredHints[missingProp];
  }
  
  // Add example for some common cases
  const requiredExamples: Record<string, string> = {
    'name': 'name: "My Process Name"',
    'ubml': `ubml: "${SCHEMA_VERSION}"`,
    'steps': 'steps:\n  ST00001:\n    name: "First Step"',
  };
  
  if (requiredExamples[missingProp]) {
    result.example = requiredExamples[missingProp];
  }
  
  return result;
}

/**
 * Format type mismatch errors.
 */
function formatTypeError(
  error: RawAjvError, 
  _schemaContext?: SchemaContext
): EnhancedError {
  const expectedType = error.params?.type as string;
  const actualValue = error.data;
  const actualType = typeof actualValue;
  
  const result: EnhancedError = {
    message: `Type mismatch: expected ${expectedType}, got ${actualType}`,
  };
  
  // Provide specific guidance based on common mistakes
  if (expectedType === 'array' && actualType === 'string') {
    result.suggestion = `Wrap in array brackets: [${JSON.stringify(actualValue)}]`;
  } else if (expectedType === 'string' && actualType === 'number') {
    result.suggestion = `Wrap in quotes: "${actualValue}"`;
  } else if (expectedType === 'object' && actualType === 'string') {
    result.hint = 'This property expects an object with nested properties, not a simple string.';
  } else if (expectedType === 'string' && actualType === 'object') {
    result.hint = 'This property expects a simple string value, not a nested object.';
  }
  
  return result;
}

/**
 * Format const value errors.
 */
function formatConstError(
  error: RawAjvError,
  _schemaContext?: SchemaContext
): EnhancedError {
  const expectedValue = error.params?.allowedValue;
  const actualValue = error.data;
  
  return {
    message: `Value must be exactly: "${expectedValue}"`,
    hint: `Got: "${actualValue}"`,
  };
}

/**
 * Format oneOf/anyOf errors.
 */
function formatOneOfError(
  error: RawAjvError,
  _schemaContext?: SchemaContext
): EnhancedError {
  const passingSchemas = error.params?.passingSchemas;
  
  if (Array.isArray(passingSchemas) && passingSchemas.length > 1) {
    return {
      message: 'Value matches multiple possible schemas (ambiguous)',
      hint: 'Make the value more specific to match exactly one schema.',
    };
  }
  
  return {
    message: 'Value does not match any allowed schema',
    hint: 'Check the documentation for valid formats for this property.',
  };
}

/**
 * Format min/max length errors.
 */
function formatLengthError(
  error: RawAjvError,
  _schemaContext?: SchemaContext
): EnhancedError {
  const limit = error.params?.limit as number;
  const actualValue = error.data;
  const actualLength = typeof actualValue === 'string' ? actualValue.length : 
                       Array.isArray(actualValue) ? actualValue.length : 0;
  
  if (error.keyword === 'minLength') {
    return {
      message: `Value too short: ${actualLength} characters (minimum: ${limit})`,
    };
  } else {
    return {
      message: `Value too long: ${actualLength} characters (maximum: ${limit})`,
    };
  }
}

/**
 * Format min/max range errors.
 */
function formatRangeError(
  error: RawAjvError,
  _schemaContext?: SchemaContext
): EnhancedError {
  const limit = error.params?.limit as number;
  const actualValue = error.data;
  
  if (error.keyword === 'minimum') {
    return {
      message: `Value ${actualValue} is below minimum: ${limit}`,
    };
  } else {
    return {
      message: `Value ${actualValue} exceeds maximum: ${limit}`,
    };
  }
}

/**
 * Find the closest matching string using Levenshtein distance.
 */
export function findClosestMatch(input: string, options: string[]): string | undefined {
  if (options.length === 0) return undefined;
  
  let closest = options[0];
  let minDistance = levenshtein(input.toLowerCase(), options[0].toLowerCase());
  
  for (const option of options.slice(1)) {
    const distance = levenshtein(input.toLowerCase(), option.toLowerCase());
    if (distance < minDistance) {
      minDistance = distance;
      closest = option;
    }
  }
  
  // Only return if reasonably close
  return minDistance <= Math.max(3, input.length / 2) ? closest : undefined;
}

/**
 * Calculate Levenshtein distance between two strings.
 */
export function levenshtein(a: string, b: string): number {
  const matrix: number[][] = [];
  
  // Initialize matrix
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  
  // Fill matrix
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  
  return matrix[b.length][a.length];
}
