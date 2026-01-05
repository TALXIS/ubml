#!/usr/bin/env node
/**
 * UBML CLI
 *
 * Command-line interface for validating UBML documents.
 *
 * Usage:
 *   npx ubml validate <path>
 *   npx ubml validate ./my-workspace
 *   npx ubml validate document.ubml.yaml
 */

import { run } from '../src/cli/index.js';

run(process.argv.slice(2)).catch((error: Error) => {
  console.error(`Fatal error: ${error.message}`);
  process.exit(2);
});
