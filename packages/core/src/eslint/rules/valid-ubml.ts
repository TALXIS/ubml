/**
 * ESLint rule for validating UBML documents.
 * 
 * Uses the browser-safe parser and validator directly,
 * no file system operations needed.
 */

import type { Rule } from 'eslint';
import { parse } from '../../parser.js';
import { createValidator, type Validator } from '../../validator.js';

// Cache the validator instance
let cachedValidator: Validator | null = null;

async function getValidator(): Promise<Validator> {
  if (!cachedValidator) {
    cachedValidator = await createValidator();
  }
  return cachedValidator;
}

/**
 * ESLint rule for validating UBML documents.
 */
export const validUbmlRule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Validate UBML documents against their schemas',
      category: 'Possible Errors',
      recommended: true,
    },
    messages: {
      parseError: 'YAML parse error: {{message}}',
      validationError: 'Validation error{{path}}: {{message}}',
      validationWarning: 'Validation warning{{path}}: {{message}}',
    },
    schema: [
      {
        type: 'object',
        properties: {
          strict: {
            type: 'boolean',
            description: 'Treat warnings as errors',
            default: false,
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    const filename = context.filename || context.getFilename();
    
    // Only process UBML files
    if (!filename.includes('.ubml.yaml') && !filename.includes('.ubml.yml')) {
      return {};
    }

    return {
      async Program(node) {
        const sourceCode = context.sourceCode || context.getSourceCode();
        const text = sourceCode.getText();
        const options = context.options[0] || {};

        try {
          // Parse the document using browser-safe parser
          const parseResult = parse(text, filename);

          // Report parse errors
          for (const error of parseResult.errors) {
            context.report({
              node,
              messageId: 'parseError',
              data: {
                message: error.message,
              },
              loc: error.line
                ? {
                    start: { line: error.line, column: (error.column ?? 1) - 1 },
                    end: { line: error.endLine ?? error.line, column: (error.endColumn ?? error.column ?? 1) },
                  }
                : undefined,
            });
          }

          // If parsing failed, don't validate
          if (!parseResult.ok || !parseResult.document) {
            return;
          }

          // Validate using browser-safe validator
          const validator = await getValidator();
          const validationResult = validator.validateDocument(parseResult.document);

          // Report validation errors
          for (const error of validationResult.errors) {
            context.report({
              node,
              messageId: 'validationError',
              data: {
                message: error.message,
                path: error.path ? ` at ${error.path}` : '',
              },
              loc: error.line
                ? {
                    start: { line: error.line, column: (error.column ?? 1) - 1 },
                    end: { line: error.line, column: (error.column ?? 1) },
                  }
                : undefined,
            });
          }

          // Report warnings if not in strict mode
          if (!options.strict) {
            for (const warning of validationResult.warnings) {
              context.report({
                node,
                messageId: 'validationWarning',
                data: {
                  message: warning.message,
                  path: warning.path ? ` at ${warning.path}` : '',
                },
                loc: warning.line
                  ? {
                      start: { line: warning.line, column: (warning.column ?? 1) - 1 },
                      end: { line: warning.line, column: (warning.column ?? 1) },
                    }
                  : undefined,
              });
            }
          }

          // Report parse warnings
          for (const warning of parseResult.warnings) {
            context.report({
              node,
              messageId: 'validationWarning',
              data: {
                message: warning.message,
                path: '',
              },
              loc: warning.line
                ? {
                    start: { line: warning.line, column: (warning.column ?? 1) - 1 },
                    end: { line: warning.endLine ?? warning.line, column: (warning.endColumn ?? warning.column ?? 1) },
                  }
                : undefined,
            });
          }
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          context.report({
            node,
            messageId: 'validationError',
            data: { message, path: '' },
          });
        }
      },
    };
  },
};
