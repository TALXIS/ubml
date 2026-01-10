/**
 * Validate command for UBML CLI.
 */

import { Command } from 'commander';
import { statSync } from 'fs';
import { resolve } from 'path';
import chalk from 'chalk';
import { validateFile, validateWorkspace, type WorkspaceValidationResult } from '../../node/index';
import { formatStylish } from '../formatters/stylish';
import { formatJson } from '../formatters/json';
import { formatSarif } from '../formatters/sarif';
import type { FormatterResult } from '../formatters/common';

export type OutputFormat = 'stylish' | 'json' | 'sarif';

export interface ValidateOptions {
  format: OutputFormat;
  strict: boolean;
  quiet: boolean;
  suppressUnused: boolean;
  explain: boolean;
  health: boolean;
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
 * Format health report summary.
 */
function formatHealthReport(result: WorkspaceValidationResult): string {
  const lines: string[] = [];
  
  // Calculate health score
  const errorCount = result.errorCount;
  const warningCount = result.warningCount;
  let score = 100;
  score -= errorCount * 10;
  score -= warningCount * 2;
  score = Math.max(0, Math.min(100, score));
  
  const scoreColor = score >= 90 ? chalk.green : score >= 70 ? chalk.yellow : chalk.red;
  
  lines.push('');
  lines.push(chalk.bold('Health Report'));
  lines.push(chalk.dim('─'.repeat(60)));
  lines.push(`  Files: ${chalk.cyan(result.fileCount.toString())}`);
  lines.push(`  Errors: ${errorCount > 0 ? chalk.red(errorCount.toString()) : chalk.green('0')}`);
  lines.push(`  Warnings: ${warningCount > 0 ? chalk.yellow(warningCount.toString()) : chalk.green('0')}`);
  lines.push(`  Health Score: ${scoreColor(score + '/100')}`);
  lines.push('');
  
  if (score === 100) {
    lines.push(chalk.green('✓ Perfect! Your workspace is healthy.'));
  } else if (score >= 70) {
    lines.push(chalk.yellow('⚠ Good, but could be improved. Address warnings when possible.'));
  } else {
    lines.push(chalk.red('✗ Issues detected. Please review errors and warnings.'));
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
    .option('--explain', 'Show detailed explanations for errors', false)
    .option('--health', 'Show health report summary', false)
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

      // Warn about single-file validation limitations
      if (!isDirectory && !options.quiet) {
        console.log(chalk.yellow('⚠️  Single-file validation:') + ' Cross-document references not checked.');
        console.log(chalk.dim('   Run ') + chalk.cyan('ubml validate .') + chalk.dim(' to validate workspace-level references.'));
        console.log();
      }

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
          output = formatStylish(result, { quiet: options.quiet, explain: options.explain });
          break;
      }

      console.log(output);

      // Show health report for workspace validation (if requested)
      if (isDirectory && options.format === 'stylish' && !options.quiet) {
        const workspaceResult = rawResult as WorkspaceValidationResult;
        
        if (options.health) {
          const healthOutput = formatHealthReport(workspaceResult);
          console.log(healthOutput);
        } else {
          const structureOutput = formatStructureWarnings(workspaceResult);
          if (structureOutput) {
            console.log(structureOutput);
          }
        }
      }

      // Exit with appropriate code
      process.exit(result.valid ? 0 : 1);
    });

  return command;
}
