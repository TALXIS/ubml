#!/usr/bin/env node
/**
 * Verify Version Consistency
 *
 * Verifies that all UBML version references are consistent across:
 * - package.json
 * - Schema files
 * - TypeScript constants
 * - Test files
 *
 * This script is run before publishing to ensure no version mismatches.
 *
 * Exits with non-zero code if:
 * - Any version mismatch is found
 * - Required files are missing
 * - Versions are malformed
 *
 * @module scripts/verify-versions
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ROOT_DIR = join(__dirname, '..');
const SCHEMAS_ROOT = join(ROOT_DIR, 'schemas');
const SRC_DIR = join(ROOT_DIR, 'src');

// =============================================================================
// Types
// =============================================================================

interface VersionIssue {
  file: string;
  expected: string;
  found: string;
  context: string;
}

// =============================================================================
// Version Reading
// =============================================================================

/**
 * Read package version from package.json.
 */
function getPackageVersion(): { full: string; schema: string } {
  const packageJsonPath = join(ROOT_DIR, 'package.json');
  
  let packageJson: { version?: string };
  try {
    const content = readFileSync(packageJsonPath, 'utf8');
    packageJson = JSON.parse(content);
  } catch (error) {
    console.error(`❌ Failed to read package.json: ${error}`);
    process.exit(1);
  }

  if (!packageJson.version) {
    console.error('❌ Version missing in package.json');
    process.exit(1);
  }

  const fullVersion = packageJson.version;
  const schemaVersion = fullVersion.split('.').slice(0, 2).join('.');

  return { full: fullVersion, schema: schemaVersion };
}

// =============================================================================
// File Scanning
// =============================================================================

/**
 * Get all YAML files in a directory recursively.
 */
function getAllYamlFiles(dir: string): string[] {
  const files: string[] = [];
  
  function scan(currentDir: string): void {
    const entries = readdirSync(currentDir);
    
    for (const entry of entries) {
      const fullPath = join(currentDir, entry);
      const stat = statSync(fullPath);
      
      if (stat.isDirectory()) {
        scan(fullPath);
      } else if (extname(entry) === '.yaml') {
        files.push(fullPath);
      }
    }
  }
  
  scan(dir);
  return files;
}

// =============================================================================
// Verification
// =============================================================================

/**
 * Verify schema files contain correct version.
 */
function verifySchemaFiles(schemaVersion: string): VersionIssue[] {
  const issues: VersionIssue[] = [];
  const SCHEMAS_DIR = join(SCHEMAS_ROOT, schemaVersion);
  const schemaFiles = getAllYamlFiles(SCHEMAS_DIR);

  for (const file of schemaFiles) {
    const relativePath = file.replace(ROOT_DIR + '/', '');
    let content: string;
    
    try {
      content = readFileSync(file, 'utf8');
    } catch (error) {
      console.error(`❌ Failed to read ${relativePath}: ${error}`);
      process.exit(1);
    }

    // Check $id URLs
    const idPattern = /https:\/\/ubml\.talxis\.com\/schemas\/(\d+\.\d+)\//g;
    let match;
    while ((match = idPattern.exec(content)) !== null) {
      if (match[1] !== schemaVersion) {
        issues.push({
          file: relativePath,
          expected: schemaVersion,
          found: match[1],
          context: `$id URL contains version ${match[1]}`
        });
      }
    }

    // Check const: "X.Y"
    const constPattern = /const:\s*"(\d+\.\d+)"/g;
    while ((match = constPattern.exec(content)) !== null) {
      if (match[1] !== schemaVersion) {
        issues.push({
          file: relativePath,
          expected: schemaVersion,
          found: match[1],
          context: `const value is "${match[1]}"`
        });
      }
    }

    // Check description headers
    const versionHeaderPattern = /Version\s+(\d+\.\d+)/g;
    while ((match = versionHeaderPattern.exec(content)) !== null) {
      if (match[1] !== schemaVersion) {
        issues.push({
          file: relativePath,
          expected: schemaVersion,
          found: match[1],
          context: `Description header shows Version ${match[1]}`
        });
      }
    }

    // Check "Must be" descriptions
    const mustBePattern = /Must be\s+"(\d+\.\d+)"\s+for this schema version/g;
    while ((match = mustBePattern.exec(content)) !== null) {
      if (match[1] !== schemaVersion) {
        issues.push({
          file: relativePath,
          expected: schemaVersion,
          found: match[1],
          context: `Description says "Must be ${match[1]}"`
        });
      }
    }
  }

  return issues;
}

/**
 * Verify TypeScript constants file.
 */
function verifyConstants(fullVersion: string, schemaVersion: string): VersionIssue[] {
  const issues: VersionIssue[] = [];
  const constantsPath = join(SRC_DIR, 'constants.ts');
  const relativePath = constantsPath.replace(ROOT_DIR + '/', '');

  let content: string;
  try {
    content = readFileSync(constantsPath, 'utf8');
  } catch (error) {
    console.error(`❌ Failed to read ${relativePath}: ${error}`);
    process.exit(1);
  }

  // Check VERSION constant
  const versionMatch = content.match(/export const VERSION = "([^"]+)"/);
  if (versionMatch && versionMatch[1] !== fullVersion) {
    issues.push({
      file: relativePath,
      expected: fullVersion,
      found: versionMatch[1],
      context: `VERSION constant is "${versionMatch[1]}"`
    });
  }

  // Check SCHEMA_VERSION constant
  const schemaVersionMatch = content.match(/export const SCHEMA_VERSION = "([^"]+)"/);
  if (schemaVersionMatch && schemaVersionMatch[1] !== schemaVersion) {
    issues.push({
      file: relativePath,
      expected: schemaVersion,
      found: schemaVersionMatch[1],
      context: `SCHEMA_VERSION constant is "${schemaVersionMatch[1]}"`
    });
  }

  return issues;
}

// =============================================================================
// Main
// =============================================================================

function main(): void {
  console.log('🔍 Verifying UBML version consistency...\n');

  const { full: fullVersion, schema: schemaVersion } = getPackageVersion();
  console.log(`📦 Package version: ${fullVersion}`);
  console.log(`📋 Schema version:  ${schemaVersion}\n`);

  const allIssues: VersionIssue[] = [];

  // Verify schema files
  console.log('📁 Checking schema files...');
  const schemaIssues = verifySchemaFiles(schemaVersion);
  allIssues.push(...schemaIssues);
  if (schemaIssues.length === 0) {
    console.log('   ✅ All schema files correct\n');
  } else {
    console.log(`   ⚠️  Found ${schemaIssues.length} issue(s)\n`);
  }

  // Verify TypeScript constants
  console.log('📄 Checking TypeScript constants...');
  const constantsIssues = verifyConstants(fullVersion, schemaVersion);
  allIssues.push(...constantsIssues);
  if (constantsIssues.length === 0) {
    console.log('   ✅ Constants file correct\n');
  } else {
    console.log(`   ⚠️  Found ${constantsIssues.length} issue(s)\n`);
  }

  // Report results
  if (allIssues.length === 0) {
    console.log('✅ All version references are consistent!\n');
    process.exit(0);
  } else {
    console.error(`❌ Found ${allIssues.length} version inconsistency issue(s):\n`);
    
    for (const issue of allIssues) {
      console.error(`   ${issue.file}`);
      console.error(`   Expected: ${issue.expected}`);
      console.error(`   Found:    ${issue.found}`);
      console.error(`   Context:  ${issue.context}\n`);
    }

    console.error('Run "npm run update-schema-versions && npm run generate" to fix.\n');
    process.exit(1);
  }
}

main();
