/**
 * Parser unit tests
 */

import { describe, it, expect } from 'vitest';
import { SCHEMA_VERSION } from '../../src/constants.js';
import { parse, detectDocumentType, DOCUMENT_TYPES } from '../../src/index.js';

describe('Parser', () => {
  describe('parse', () => {
    it('should parse valid YAML', () => {
      const yaml = `
ubml: "${SCHEMA_VERSION}"
name: "Test Workspace"
`;
      const result = parse(yaml, 'test.workspace.ubml.yaml');
      
      expect(result.errors).toHaveLength(0);
      expect(result.ok).toBe(true);
      expect(result.document).toBeDefined();
      expect(result.document?.content).toEqual({
        ubml: SCHEMA_VERSION,
        name: 'Test Workspace',
      });
    });

    it('should report YAML syntax errors', () => {
      const invalidYaml = `
ubml: "${SCHEMA_VERSION}"
  invalid: indentation
`;
      const result = parse(invalidYaml, 'test.workspace.ubml.yaml');
      
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.ok).toBe(false);
      expect(result.document).toBeUndefined();
    });

    it('should extract document metadata', () => {
      const yaml = `ubml: "${SCHEMA_VERSION}"`;
      const result = parse(yaml, 'test.process.ubml.yaml');
      
      expect(result.document?.meta.version).toBe(SCHEMA_VERSION);
      expect(result.document?.meta.type).toBe('process');
      expect(result.document?.meta.filename).toBe('test.process.ubml.yaml');
    });

    it('should warn for unknown document types', () => {
      const yaml = `ubml: "${SCHEMA_VERSION}"`;
      const result = parse(yaml, 'unknown.yaml');
      
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0].message).toContain('Could not detect document type');
    });

    it('should provide source location for JSON paths', () => {
      const yaml = `ubml: "${SCHEMA_VERSION}"
processes:
  PR00001:
    name: "Test Process"
    steps:
      ST00001:
        name: "Step 1"
        kind: action
`;
      const result = parse(yaml, 'test.process.ubml.yaml');
      
      expect(result.ok).toBe(true);
      expect(result.document).toBeDefined();
      
      // Test root location
      const rootLoc = result.document!.getSourceLocation('/');
      expect(rootLoc).toBeDefined();
      expect(rootLoc!.line).toBe(1);
      
      // Test nested location
      const processLoc = result.document!.getSourceLocation('/processes/PR00001');
      expect(processLoc).toBeDefined();
      expect(processLoc!.line).toBe(4); // Line where PR00001 value starts
      
      // Test deep nested location
      const stepLoc = result.document!.getSourceLocation('/processes/PR00001/steps/ST00001');
      expect(stepLoc).toBeDefined();
      expect(stepLoc!.line).toBe(7); // Line where ST00001 value starts (one line earlier without id)
      
      // Test invalid path returns undefined
      const invalidLoc = result.document!.getSourceLocation('/invalid/path');
      expect(invalidLoc).toBeUndefined();
    });
  });

  describe('detectDocumentType', () => {
    it('should detect all document types', () => {
      for (const type of DOCUMENT_TYPES) {
        expect(detectDocumentType(`test.${type}.ubml.yaml`)).toBe(type);
        expect(detectDocumentType(`test.${type}.ubml.yml`)).toBe(type);
      }
    });

    it('should return undefined for non-UBML files', () => {
      expect(detectDocumentType('file.yaml')).toBeUndefined();
      expect(detectDocumentType('file.json')).toBeUndefined();
      expect(detectDocumentType('process.yaml')).toBeUndefined();
    });
  });
});
