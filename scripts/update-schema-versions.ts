#!/usr/bin/env node
/**
 * Update Schema Versions
 *
 * Updates all UBML schema files with the current version from package.json.
 * This script modifies the schema source files in place.
 *
 * Schema files are the source of truth for UBML language definition.
 * This script ensures version numbers are consistent across all schemas.
 *
 * Exits with non-zero code if:
 * - package.json version is missing or malformed
 * - Any schema file cannot be processed
 * - Version updates fail to apply
 *
 * @module scripts/update-schema-versions
 */

import { readFileSync, writeFileSync, readdirSync, statSync, renameSync, existsSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ROOT_DIR = join(__dirname, '..');
const SCHEMAS_ROOT = join(ROOT_DIR, 'schemas');
const EXAMPLE_DIR = join(ROOT_DIR, 'example');

// =============================================================================
// Version Validation
// =============================================================================

/**
 * Validate semver version format.
 */
function validateSemver(version: string): void {
  const semverRegex = /^\d+\.\d+\.\d+$/;
  if (!semverRegex.test(version)) {
    console.error(`❌ Invalid semver format: "${version}"`);
    console.error('   Expected format: X.Y.Z (e.g., "1.1.0")');
    process.exit(1);
  }
}

/**
 * Read and validate package version.
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
  validateSemver(fullVersion);

  // Schema version is major.minor (without patch)
  const schemaVersion = fullVersion.split('.').slice(0, 2).join('.');

  return { full: fullVersion, schema: schemaVersion };
}

// =============================================================================
// Schema File Processing
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

/**
 * Update version strings in schema file content.
 */
function updateSchemaContent(
  content: string,
  schemaVersion: string,
  filePath: string
): { updated: string; changes: number } {
  let updated = content;
  let changes = 0;

  // Pattern 1: $id URLs with version
  const idPattern = /(https:\/\/ubml\.talxis\.com\/schemas\/)(\d+\.\d+)(\/[^"]+)/g;
  const idMatches = content.match(idPattern);
  if (idMatches) {
    updated = updated.replace(idPattern, (match, prefix, oldVersion, suffix) => {
      if (oldVersion !== schemaVersion) {
        changes++;
      }
      return `${prefix}${schemaVersion}${suffix}`;
    });
  }

  // Pattern 2: const: "X.Y" for ubml property
  const constPattern = /const:\s*"(\d+\.\d+)"/g;
  const constMatches = content.match(constPattern);
  if (constMatches) {
    updated = updated.replace(constPattern, (match, oldVersion) => {
      if (oldVersion !== schemaVersion) {
        changes++;
      }
      return `const: "${schemaVersion}"`;
    });
  }

  // Pattern 3: Version in description headers (e.g., "Version 1.1")
  const versionHeaderPattern = /(Version\s+)(\d+\.\d+)/g;
  const headerMatches = content.match(versionHeaderPattern);
  if (headerMatches) {
    updated = updated.replace(versionHeaderPattern, (match, prefix, oldVersion) => {
      if (oldVersion !== schemaVersion) {
        changes++;
      }
      return `${prefix}${schemaVersion}`;
    });
  }

  // Pattern 4: Version in description text (e.g., "Must be "1.1" for this schema version")
  const mustBePattern = /(Must be\s+")(\d+\.\d+)("\s+for this schema version)/g;
  const mustBeMatches = content.match(mustBePattern);
  if (mustBeMatches) {
    updated = updated.replace(mustBePattern, (match, prefix, oldVersion, suffix) => {
      if (oldVersion !== schemaVersion) {
        changes++;
      }
      return `${prefix}${schemaVersion}${suffix}`;
    });
  }

  return { updated, changes };
}

/**
 * Update ubml version in example YAML files.
 */
function updateExampleContent(
  content: string,
  schemaVersion: string
): { updated: string; changes: number } {
  let updated = content;
  let changes = 0;

  // Pattern: ubml: "X.Y" at the beginning of the file
  const ubmlPattern = /^ubml:\s*"(\d+\.\d+)"/m;
  const match = content.match(ubmlPattern);
  if (match && match[1] !== schemaVersion) {
    updated = content.replace(ubmlPattern, `ubml: "${schemaVersion}"`);
    changes = 1;
  }

  return { updated, changes };
}

/**
 * Process a single schema file.
 */
function processSchemaFile(filePath: string, schemaVersion: string): number {
  let content: string;
  try {
    content = readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`❌ Failed to read ${filePath}: ${error}`);
    process.exit(1);
  }

  const { updated, changes } = updateSchemaContent(content, schemaVersion, filePath);

  if (changes > 0) {
    try {
      writeFileSync(filePath, updated, 'utf8');
    } catch (error) {
      console.error(`❌ Failed to write ${filePath}: ${error}`);
      process.exit(1);
    }
  }

  return changes;
}

// =============================================================================
// Version Folder Management
// =============================================================================

/**
 * Find the current version folder in schemas directory.
 */
function findCurrentVersionFolder(): string | null {
  try {
    const entries = readdirSync(SCHEMAS_ROOT);
    for (const entry of entries) {
      const fullPath = join(SCHEMAS_ROOT, entry);
      const stat = statSync(fullPath);
      if (stat.isDirectory() && /^\d+\.\d+$/.test(entry)) {
        return entry;
      }
    }
  } catch (error) {
    console.error(`❌ Failed to read schemas directory: ${error}`);
    process.exit(1);
  }
  return null;
}

/**
 * Rename version folder if needed.
 */
function renameVersionFolder(oldVersion: string, newVersion: string): void {
  const oldPath = join(SCHEMAS_ROOT, oldVersion);
  const newPath = join(SCHEMAS_ROOT, newVersion);
  
  console.log(`📦 Renaming folder: schemas/${oldVersion}/ → schemas/${newVersion}/`);
  
  try {
    renameSync(oldPath, newPath);
    console.log(`✅ Folder renamed successfully\n`);
  } catch (error) {
    console.error(`❌ Failed to rename folder: ${error}`);
    process.exit(1);
  }
}

// =============================================================================
// Main
// =============================================================================

function main(): void {
  console.log('🔧 Updating UBML schema versions...\n');

  const { full: fullVersion, schema: schemaVersion } = getPackageVersion();
  console.log(`📦 Package version: ${fullVersion}`);
  console.log(`📋 Schema version:  ${schemaVersion}\n`);

  // Check if version folder needs renaming
  const currentFolder = findCurrentVersionFolder();
  if (currentFolder && currentFolder !== schemaVersion) {
    console.log(`📁 Current folder: schemas/${currentFolder}/`);
    console.log(`📁 Target version: ${schemaVersion}\n`);
    renameVersionFolder(currentFolder, schemaVersion);
  }

  // Update schema files in versioned folder
  const SCHEMAS_DIR = join(SCHEMAS_ROOT, schemaVersion);
  
  if (!existsSync(SCHEMAS_DIR)) {
    console.error(`❌ Schema folder not found: schemas/${schemaVersion}/`);
    console.error(`   Please create the folder or check your package.json version`);
    process.exit(1);
  }
  
  const schemaFiles = getAllYamlFiles(SCHEMAS_DIR);
  console.log(`📁 Found ${schemaFiles.length} schema files in schemas/${schemaVersion}/\n`);

  let totalChanges = 0;
  let filesUpdated = 0;

  for (const file of schemaFiles) {
    const relativePath = file.replace(ROOT_DIR + '/', '');
    const changes = processSchemaFile(file, schemaVersion);
    
    if (changes > 0) {
      console.log(`✏️  ${relativePath} (${changes} update${changes > 1 ? 's' : ''})`);
      filesUpdated++;
      totalChanges += changes;
    }
  }

  console.log(`\n✅ Updated ${filesUpdated} schema file${filesUpdated !== 1 ? 's' : ''} (${totalChanges} change${totalChanges !== 1 ? 's' : ''})`);
  
  if (filesUpdated === 0) {
    console.log('   All schema files already up to date');
  }

  // Update example files
  console.log('\n📝 Updating example files...\n');
  
  let exampleFilesUpdated = 0;

  const exampleFiles = getAllYamlFiles(EXAMPLE_DIR);
  
  for (const file of exampleFiles) {
    const relativePath = file.replace(ROOT_DIR + '/', '');
    let content: string;
    
    try {
      content = readFileSync(file, 'utf8');
    } catch (error) {
      console.error(`❌ Failed to read ${relativePath}: ${error}`);
      process.exit(1);
    }

    const { updated, changes } = updateExampleContent(content, schemaVersion);

    if (changes > 0) {
      try {
        writeFileSync(file, updated, 'utf8');
        console.log(`✏️  ${relativePath}`);
        exampleFilesUpdated++;
      } catch (error) {
        console.error(`❌ Failed to write ${relativePath}: ${error}`);
        process.exit(1);
      }
    }
  }

  if (exampleFilesUpdated > 0) {
    console.log(`\n✅ Updated ${exampleFilesUpdated} example file${exampleFilesUpdated !== 1 ? 's' : ''}`);
  } else {
    console.log('✅ All example files already up to date');
  }
}

main();
