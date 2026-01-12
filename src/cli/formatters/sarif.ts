/**
 * SARIF formatter for CLI output.
 *
 * SARIF (Static Analysis Results Interchange Format) is a standard format
 * for the output of static analysis tools, supported by VS Code, GitHub, etc.
 */

import type { FormatterResult, ValidationMessage } from './common';
import { VERSION, PACKAGE_NAME, REPOSITORY_URL } from '../../index';
import { ERROR_CODES } from './common';

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
export function formatSarif(result: FormatterResult): string {
  const sarifResults: SarifResult[] = [];

  // Process errors
  for (const error of result.errors) {
    sarifResults.push(createSarifResult(error, 'error'));
  }

  // Process warnings
  for (const warning of result.warnings) {
    sarifResults.push(createSarifResult(warning, 'warning'));
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
                id: ERROR_CODES.SCHEMA_ERROR,
                shortDescription: { text: 'UBML schema validation error' },
              },
              {
                id: ERROR_CODES.PARSE_ERROR,
                shortDescription: { text: 'UBML parse error' },
              },
              {
                id: ERROR_CODES.REFERENCE_ERROR,
                shortDescription: { text: 'Reference to undefined ID' },
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

function createSarifResult(
  message: ValidationMessage,
  level: 'error' | 'warning'
): SarifResult {
  const sarifResult: SarifResult = {
    ruleId: message.code ?? (level === 'error'
      ? ERROR_CODES.SCHEMA_ERROR
      : ERROR_CODES.UNKNOWN_ERROR),
    level,
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

  return sarifResult;
}
