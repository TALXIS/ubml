#!/usr/bin/env node
/**
 * Unified UBML schema generation script.
 *
 * This script is the SINGLE SOURCE OF TRUTH for all generated code.
 * It reads YAML schemas and generates:
 *
 * 1. src/generated/bundled.ts - Bundled schemas for browser use
 * 2. src/generated/data.ts - Pure data constants (no functions)
 * 3. src/generated/types.ts - TypeScript interfaces
 * 4. src/generated/template-data.ts - Template metadata (no functions)
 * 5. src/constants.ts - Version constants
 *
 * Hand-written runtime utilities (NOT generated):
 * - src/metadata.ts - Functions that use data.ts
 * - src/templates.ts - Functions that use template-data.ts
 *
 * Run: npm run generate
 *
 * Philosophy:
 * - One file change (schema), everything else derived
 * - Generated files contain DATA ONLY (no functions)
 * - Runtime logic is hand-written, type-checked, testable
 * - Clear separation between data and behavior
 *
 * @module generate/index
 */

import { writeFileSync } from 'fs';
import { join } from 'path';

import {
  discoverDocumentTypes,
  discoverTypes,
  ensureOutputDir,
  cleanupGeneratedFiles,
  OUTPUT_DIR,
  ROOT_DIR,
} from './utils.js';

import {
  extractIdPatterns,
  extractIdConfig,
  extractReferenceFields,
  extractTemplateData,
  extractToolingHints,
  extractContentDetectionConfig,
  extractValidationPatterns,
  extractCommonProperties,
  extractCategoryConfig,
} from './extract-metadata/index.js';

import { bundleSchemas, generateBundledTs } from './bundle-schemas.js';
import { generateDataTs } from './generate-data.js';
import { generateTypesTs } from './generate-types.js';
import { generateTemplateDataTs, transformTemplateData } from './generate-template-data.js';
import { generateConstantsTs } from './generate-constants.js';

// =============================================================================
// Main
// =============================================================================

async function main() {
  console.log('🔧 Generating UBML code from schemas...\n');

  // Clean up old generated files first
  console.log('🧹 Cleaning up old generated files...');
  cleanupGeneratedFiles();
  console.log('   Cleared stale generated code\n');

  ensureOutputDir();

  // Phase 1: Discover document types and type definitions
  console.log('📁 Discovering document types and type definitions...');
  const documentTypes = discoverDocumentTypes();
  const types = discoverTypes();
  console.log(`   Found ${documentTypes.length} document types: ${documentTypes.join(', ')}`);
  console.log(`   Found ${types.length} type definitions: ${types.join(', ')}`);

  // Phase 2: Extract ID patterns
  console.log('\n🔍 Extracting ID patterns from defs.schema.yaml...');
  const refInfos = extractIdPatterns();
  console.log(`   Found ${refInfos.length} ID patterns: ${refInfos.map((r) => r.prefix).join(', ')}`);

  // Phase 2b: Extract ID generation config
  const idConfig = extractIdConfig();
  console.log(
    `   ID format: ${idConfig.digitLength} digits, init offset: ${idConfig.initOffset}, add offset: ${idConfig.addOffset}`
  );

  // Phase 3: Extract reference field names
  console.log('\n🔗 Extracting reference field names from all schemas...');
  const refFields = extractReferenceFields();
  console.log(
    `   Found ${refFields.length} reference fields: ${refFields.slice(0, 10).join(', ')}${refFields.length > 10 ? '...' : ''}`
  );

  // Phase 4: Extract tooling hints from x-ubml metadata
  console.log('\n🎯 Extracting tooling hints from x-ubml metadata...');
  const toolingHints = extractToolingHints();
  console.log(
    `   Found ${toolingHints.patterns.length} pattern hints, ${toolingHints.nestedProperties.length} nested property hints, ${toolingHints.enums.length} enum hints`
  );

  // Phase 5: Extract template data from document schemas
  console.log('\n📋 Extracting template data from document schemas...');
  const rawTemplateData = extractTemplateData(documentTypes);
  const templateData = transformTemplateData(rawTemplateData);
  const totalSections = templateData.reduce((sum, t) => sum + t.sections.length, 0);
  console.log(`   Found ${templateData.length} document templates with ${totalSections} total sections`);

  // Phase 6: Extract content detection config from x-ubml-cli.detectBy
  console.log('\n🔍 Extracting content detection config from schemas...');
  const detectionConfig = extractContentDetectionConfig(documentTypes);
  console.log(`   Found detection rules for ${detectionConfig.length} document types`);

  // Phase 7: Extract validation patterns from defs.schema.yaml
  console.log('\n📏 Extracting validation patterns from defs.schema.yaml...');
  const validationPatterns = extractValidationPatterns();
  console.log(`   Duration pattern: ${validationPatterns.duration}`);
  console.log(`   Time pattern: ${validationPatterns.time}`);

  // Phase 8: Extract common properties config
  console.log('\n📦 Extracting common properties config...');
  const commonPropertiesConfig = extractCommonProperties();
  console.log(`   Found ${commonPropertiesConfig.properties.length} common properties`);

  // Phase 9: Extract category config
  console.log('\n📂 Extracting category config from defs.schema.yaml...');
  const categoryConfig = extractCategoryConfig();
  console.log(`   Found ${categoryConfig.length} category definitions`);

  // Phase 10: Generate files
  console.log('\n📝 Generating TypeScript files (DATA ONLY - no functions)...');

  // Generate bundled.ts (schemas as data)
  const bundledSchemas = bundleSchemas(documentTypes, types);
  const bundledContent = generateBundledTs(bundledSchemas);
  writeFileSync(join(OUTPUT_DIR, 'bundled.ts'), bundledContent, 'utf8');
  console.log('   ✓ src/generated/bundled.ts (schema data)');

  // Generate data.ts (pure data - replaces old metadata.ts)
  const dataContent = generateDataTs(
    documentTypes,
    types,
    refInfos,
    refFields,
    toolingHints,
    idConfig,
    detectionConfig,
    validationPatterns,
    commonPropertiesConfig,
    categoryConfig
  );
  writeFileSync(join(OUTPUT_DIR, 'data.ts'), dataContent, 'utf8');
  console.log('   ✓ src/generated/data.ts (pure data constants)');

  // Generate types.ts (async - uses json-schema-to-typescript)
  console.log('   ⏳ Generating types from schemas...');
  const typesContent = await generateTypesTs(refInfos);
  writeFileSync(join(OUTPUT_DIR, 'types.ts'), typesContent, 'utf8');
  console.log('   ✓ src/generated/types.ts (TypeScript interfaces)');

  // Generate template-data.ts (pure data - replaces old templates.ts)
  const templateDataContent = generateTemplateDataTs(templateData);
  writeFileSync(join(OUTPUT_DIR, 'template-data.ts'), templateDataContent, 'utf8');
  console.log('   ✓ src/generated/template-data.ts (template data)');

  // Generate constants.ts (in src/, not src/generated/)
  const constantsContent = generateConstantsTs();
  writeFileSync(join(ROOT_DIR, 'src', 'constants.ts'), constantsContent, 'utf8');
  console.log('   ✓ src/constants.ts');

  console.log('\n✅ Generation complete!');
  console.log('\n📌 Note: Runtime utilities are in hand-written files:');
  console.log('   - src/metadata.ts (uses generated/data.ts)');
  console.log('   - src/templates.ts (uses generated/template-data.ts)\n');
}

main().catch((error) => {
  console.error('❌ Generation failed:', error);
  process.exit(1);
});
