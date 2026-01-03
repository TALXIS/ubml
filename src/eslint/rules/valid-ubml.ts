/**
 * ESLint rule for validating UBML documents.
 */

import type { Rule } from 'eslint';
import { tmpdir } from 'os';
import { join } from 'path';
import { writeFileSync } from 'fs';
import { validateDocument } from '../../validator/schema-validator.js';

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
          schemasDir: {
            type: 'string',
            description: 'Path to schemas directory',
          },
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

        // For in-memory or untitled files, we need to write to temp file
        // because validateDocument expects a file path
        let filePathToValidate = filename;
        let isTempFile = false;

        if (filename.startsWith('untitled:') || !filename) {
          // Create a temporary file with proper UBML naming
          const tempFilename = `temp.process.ubml.yaml`;
          filePathToValidate = join(tmpdir(), tempFilename);
          writeFileSync(filePathToValidate, text, 'utf8');
          isTempFile = true;
        }

        try {
          // Use the shared validation logic
          const result = await validateDocument(filePathToValidate, {
            schemasDir: options.schemasDir,
            strict: options.strict ?? false,
          });

          // Report errors
          for (const error of result.errors) {
            context.report({
              node,
              messageId: error.code === 'parse-error' ? 'parseError' : 'validationError',
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

          // Report warnings if not in strict mode (strict mode converts warnings to errors)
          if (!options.strict) {
            for (const warning of result.warnings) {
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
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          context.report({
            node,
            messageId: 'validationError',
            data: { message, path: '' },
          });
        } finally {
          // Clean up temp file if created
          if (isTempFile) {
            try {
              const { unlinkSync } = await import('fs');
              unlinkSync(filePathToValidate);
            } catch {
              // Ignore cleanup errors
            }
          }
        }
      },
    };
  },
};
