/**
 * Parser unit tests
 */

import { describe, it, expect } from 'vitest';
import { parseDocumentFromString, detectDocumentType, DOCUMENT_TYPES } from '../../src/parser/index.js';

describe('Parser', () => {
  describe('parseDocumentFromString', () => {
    it('should parse valid YAML', () => {
      const yaml = `
ubml: "1.0"
name: "Test Workspace"
`;
      const result = parseDocumentFromString(yaml, 'test.workspace.ubml.yaml');
      
      expect(result.errors).toHaveLength(0);
      expect(result.document).toBeDefined();
      expect(result.document?.content).toEqual({
        ubml: '1.0',
        name: 'Test Workspace',
      });
    });

    it('should report YAML syntax errors', () => {
      const invalidYaml = `
ubml: "1.0"
  invalid: indentation
`;
      const result = parseDocumentFromString(invalidYaml, 'test.workspace.ubml.yaml');
      
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.document).toBeUndefined();
    });

    it('should extract document metadata', () => {
      const yaml = `ubml: "1.0"`;
      const result = parseDocumentFromString(yaml, '/path/to/test.process.ubml.yaml');
      
      expect(result.document?.meta.ubmlVersion).toBe('1.0');
      expect(result.document?.meta.documentType).toBe('process');
      expect(result.document?.meta.filename).toBe('test.process.ubml.yaml');
    });

    it('should warn for unknown document types', () => {
      const yaml = `ubml: "1.0"`;
      const result = parseDocumentFromString(yaml, 'unknown.yaml');
      
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0].message).toContain('Could not detect document type');
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
