/**
 * SARIF formatter for CLI output.
 *
 * SARIF (Static Analysis Results Interchange Format) is a standard format
 * for the output of static analysis tools, supported by VS Code, GitHub, etc.
 */

import type { ValidationResult } from '../../validator/index.js';
import { VERSION, PACKAGE_NAME, REPOSITORY_URL } from '../../constants.js';
import { ERROR_CODES } from '../../validator/messages.js';
import { iterateMessages } from './common.js';

interface SarifResult {
  ruleId: string;
  level: 'error' | 'warning' | 'note';
  message: { text: string };
  locations?: Array<{
    physicalLocation: {
      artifactLocation: { uri: string };
      region?: {
        startLine: number;
        startColumn?: number;
      };
    };
  }>;
}

interface SarifLog {
  $schema: string;
  version: string;
  runs: Array<{
    tool: {
      driver: {
        name: string;
        version: string;
        informationUri: string;
        rules: Array<{
          id: string;
          shortDescription: { text: string };
        }>;
      };
    };
    results: SarifResult[];
  }>;
}

/**
 * Format validation results as SARIF.
 */
export function formatSarif(result: ValidationResult): string {
  const sarifResults: SarifResult[] = [];

  for (const message of iterateMessages(result)) {
    const sarifResult: SarifResult = {
      ruleId: message.code ?? (message.severity === 'error' 
        ? ERROR_CODES.VALIDATION_ERROR 
        : ERROR_CODES.VALIDATION_WARNING),
      level: message.severity,
      message: { text: message.message },
    };

    if (message.filepath) {
      sarifResult.locations = [
        {
          physicalLocation: {
            artifactLocation: { uri: message.filepath },
            region: message.line
              ? {
                  startLine: message.line,
                  startColumn: message.column,
                }
              : undefined,
          },
        },
      ];
    }

    sarifResults.push(sarifResult);
  }

  const sarif: SarifLog = {
    $schema: 'https://json.schemastore.org/sarif-2.1.0.json',
    version: '2.1.0',
    runs: [
      {
        tool: {
          driver: {
            name: PACKAGE_NAME,
            version: VERSION,
            informationUri: REPOSITORY_URL,
            rules: [
              {
                id: ERROR_CODES.VALIDATION_ERROR,
                shortDescription: { text: 'UBML schema validation error' },
              },
              {
                id: ERROR_CODES.VALIDATION_WARNING,
                shortDescription: { text: 'UBML schema validation warning' },
              },
              {
                id: ERROR_CODES.UNDEFINED_REFERENCE,
                shortDescription: { text: 'Reference to undefined ID' },
              },
              {
                id: ERROR_CODES.DUPLICATE_ID,
                shortDescription: { text: 'Duplicate ID definition' },
              },
            ],
          },
        },
        results: sarifResults,
      },
    ],
  };

  return JSON.stringify(sarif, null, 2);
}
