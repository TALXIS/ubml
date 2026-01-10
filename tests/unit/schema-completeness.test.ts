/**
 * Schema Completeness Tests
 * 
 * Ensure ALL metadata is defined in schemas, not in code fallbacks.
 * These tests fail LOUDLY if any schema is missing required metadata.
 */

import { describe, it, expect } from 'vitest';
import { defsSchema, documentSchemas } from '../../src/generated/bundled.js';
import { DOCUMENT_TYPES } from '../../src/metadata.js';

describe('Schema Completeness - NO FALLBACKS ALLOWED', () => {
  
  describe('Ref types in defs.schema.yaml', () => {
    it('should have complete x-ubml metadata for ALL Ref types', () => {
      const defs = (defsSchema as Record<string, unknown>).$defs as Record<string, Record<string, unknown>>;
      const refTypes = Object.entries(defs).filter(([name]) => name.endsWith('Ref'));
      
      expect(refTypes.length).toBeGreaterThan(0);
      
      for (const [name, def] of refTypes) {
        const xubml = def['x-ubml'] as Record<string, unknown> | undefined;
        
        // Must have x-ubml metadata
        expect(xubml, `${name} must have x-ubml metadata`).toBeDefined();
        
        // Must have ALL required fields - NO FALLBACKS
        expect(xubml!.prefix, `${name} must define x-ubml.prefix`).toBeDefined();
        expect(xubml!.humanName, `${name} must define x-ubml.humanName`).toBeDefined();
        expect(xubml!.shortDescription, `${name} must define x-ubml.shortDescription`).toBeDefined();
        expect(xubml!.errorHint, `${name} must define x-ubml.errorHint`).toBeDefined();
        expect(xubml!.category, `${name} must define x-ubml.category`).toBeDefined();
        expect(xubml!.categoryDisplayName, `${name} must define x-ubml.categoryDisplayName`).toBeDefined();
        
        // Must have pattern field
        expect(def.pattern, `${name} must define pattern`).toBeDefined();
      }
    });
  });
  
  describe('Document schemas', () => {
    it('should have complete x-ubml-cli metadata for ALL document types', () => {
      for (const type of DOCUMENT_TYPES) {
        const schema = documentSchemas[type] as Record<string, unknown>;
        const metadata = schema['x-ubml-cli'] as Record<string, unknown> | undefined;
        
        // Must have x-ubml-cli metadata
        expect(metadata, `${type}.document.yaml must have x-ubml-cli metadata`).toBeDefined();
        
        // Must have ALL required fields - NO FALLBACKS
        expect(metadata!.category, `${type} must define x-ubml-cli.category`).toBeDefined();
        expect(metadata!.categoryDisplayName, `${type} must define x-ubml-cli.categoryDisplayName`).toBeDefined();
        expect(metadata!.shortDescription, `${type} must define x-ubml-cli.shortDescription`).toBeDefined();
        expect(metadata!.defaultFilename, `${type} must define x-ubml-cli.defaultFilename`).toBeDefined();
        expect(metadata!.workflowOrder, `${type} must define x-ubml-cli.workflowOrder`).toBeDefined();
        expect(metadata!.detectBy, `${type} must define x-ubml-cli.detectBy`).toBeDefined();
        expect(Array.isArray(metadata!.detectBy), `${type} x-ubml-cli.detectBy must be an array`).toBe(true);
        expect((metadata!.detectBy as unknown[]).length, `${type} x-ubml-cli.detectBy must not be empty`).toBeGreaterThan(0);
      }
    });
  });
  
  describe('Category configuration', () => {
    it('should have complete category definitions in defs.schema.yaml', () => {
      const categories = (defsSchema as Record<string, unknown>)['x-ubml-categories'] as unknown[];
      
      expect(categories, 'defs.schema.yaml must define x-ubml-categories').toBeDefined();
      expect(Array.isArray(categories), 'x-ubml-categories must be an array').toBe(true);
      expect(categories.length, 'x-ubml-categories must not be empty').toBeGreaterThan(0);
      
      for (const cat of categories) {
        const category = cat as Record<string, unknown>;
        expect(category.key, 'category must define key').toBeDefined();
        expect(category.displayName, 'category must define displayName').toBeDefined();
        expect(category.order, 'category must define order').toBeDefined();
      }
    });
  });
  
  describe('ID configuration', () => {
    it('should have complete ID config in defs.schema.yaml', () => {
      const idConfig = (defsSchema as Record<string, unknown>)['x-ubml-id-config'] as Record<string, unknown> | undefined;
      
      expect(idConfig, 'defs.schema.yaml must define x-ubml-id-config').toBeDefined();
      expect(idConfig!.digitLength, 'x-ubml-id-config must define digitLength').toBeDefined();
      expect(idConfig!.pattern, 'x-ubml-id-config must define pattern').toBeDefined();
      expect(idConfig!.initOffset, 'x-ubml-id-config must define initOffset').toBeDefined();
      expect(idConfig!.addOffset, 'x-ubml-id-config must define addOffset').toBeDefined();
    });
  });
});
