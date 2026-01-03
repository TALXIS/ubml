/**
 * UBML Validator Module
 *
 * Provides schema and semantic validation for UBML documents.
 *
 * @module ubml/validator
 */

export {
  validateDocument,
  validateWorkspace,
  type ValidationResult,
  type ValidatorOptions,
} from './schema-validator.js';
export {
  validateReferences,
  type ReferenceValidationResult,
} from './semantic-validator.js';
export {
  validateSchemas,
  type SchemaValidationResult,
  type SchemaFileResult,
} from './meta-validator.js';
export {
  ValidationError,
  ValidationWarning,
  formatError,
  formatErrors,
} from './errors.js';
