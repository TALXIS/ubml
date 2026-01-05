/**
 * Validate command for UBML CLI.
 */

import { Command } from 'commander';
import { statSync } from 'fs';
import { resolve } from 'path';
import chalk from 'chalk';
import { validateFile, validateWorkspace, type WorkspaceValidationResult } from '../../node/validator.js';
import { formatStylish } from '../formatters/stylish.js';
import { formatJson } from '../formatters/json.js';
import { formatSarif } from '../formatters/sarif.js';
import type { FormatterResult } from '../formatters/common.js';

export type OutputFormat = 'stylish' | 'json' | 'sarif';

export interface ValidateOptions {
  format: OutputFormat;
  strict: boolean;
  quiet: boolean;
  suppressUnused: boolean;
}

/**
 * Format workspace structure warnings for CLI display.
 */
function formatStructureWarnings(result: WorkspaceValidationResult): string {
  if (result.structureWarnings.length === 0) {
    return '';
  }

  const lines: string[] = [''];
  lines.push(chalk.bold.cyan('Workspace Structure Hints:'));
  
  for (const warning of result.structureWarnings) {
    lines.push(`  ${chalk.yellow('○')} ${warning.message}`);
    if (warning.suggestion) {
      lines.push(chalk.dim(`    → ${warning.suggestion}`));
    }
    if (warning.files && warning.files.length > 0) {
      lines.push(chalk.dim(`    Files: ${warning.files.join(', ')}`));
    }
  }
  
  return lines.join('\n');
}

/**
 * Create the validate command.
 */
export function validateCommand(): Command {
  const command = new Command('validate');

  command
    .description('Validate UBML documents against schemas')
    .argument('<path>', 'File or directory to validate')
    .option('-f, --format <format>', 'Output format: stylish, json, sarif', 'stylish')
    .option('-s, --strict', 'Treat warnings as errors', false)
    .option('-q, --quiet', 'Only output errors', false)
    .option('--suppress-unused', 'Suppress unused-id warnings (useful for catalog documents)', false)
    .action(async (path: string, options: ValidateOptions) => {
      const absolutePath = resolve(path);
      let isDirectory: boolean;

      try {
        isDirectory = statSync(absolutePath).isDirectory();
      } catch (err) {
        console.error(`Error: Path not found: ${absolutePath}`);
        process.exit(2);
      }

      // Validate
      const rawResult = isDirectory
        ? await validateWorkspace(absolutePath, { suppressUnusedWarnings: options.suppressUnused })
        : await validateFile(absolutePath);

      // Convert to unified format for formatters
      const result: FormatterResult = isDirectory
        ? {
            valid: (rawResult as Awaited<ReturnType<typeof validateWorkspace>>).valid,
            errors: (rawResult as Awaited<ReturnType<typeof validateWorkspace>>).files.flatMap(f => 
              f.errors.map(e => ({ ...e, filepath: f.path }))
            ),
            warnings: (rawResult as Awaited<ReturnType<typeof validateWorkspace>>).files.flatMap(f => 
              f.warnings.map(w => ({ ...w, filepath: f.path }))
            ),
            filesValidated: (rawResult as Awaited<ReturnType<typeof validateWorkspace>>).fileCount,
          }
        : {
            valid: (rawResult as Awaited<ReturnType<typeof validateFile>>).valid,
            errors: (rawResult as Awaited<ReturnType<typeof validateFile>>).errors,
            warnings: (rawResult as Awaited<ReturnType<typeof validateFile>>).warnings,
            filesValidated: 1,
          };

      // Apply strict mode
      if (options.strict) {
        result.errors.push(
          ...result.warnings.map((w) => ({ ...w }))
        );
        result.warnings = [];
        result.valid = result.errors.length === 0;
      }

      // Format output
      let output: string;
      switch (options.format) {
        case 'json':
          output = formatJson(result);
          break;
        case 'sarif':
          output = formatSarif(result);
          break;
        case 'stylish':
        default:
          output = formatStylish(result, { quiet: options.quiet });
          break;
      }

      console.log(output);

      // Show structure warnings for workspace validation (stylish format only)
      if (isDirectory && options.format === 'stylish' && !options.quiet) {
        const workspaceResult = rawResult as WorkspaceValidationResult;
        const structureOutput = formatStructureWarnings(workspaceResult);
        if (structureOutput) {
          console.log(structureOutput);
        }
      }

      // Show VS Code tip if there are errors (stylish format only)
      if (!result.valid && options.format === 'stylish') {
        console.log();
        console.log(chalk.dim('──────────────────────────────────────────────────────────────'));
        console.log(chalk.dim('Tip: Fix errors in VS Code with real-time schema validation.'));
        console.log(chalk.dim(`     Run: ${chalk.cyan('ubml docs vscode')} for setup guide.`));
      }

      // Exit with appropriate code
      process.exit(result.valid ? 0 : 1);
    });

  return command;
}
