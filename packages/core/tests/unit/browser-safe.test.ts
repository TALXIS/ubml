/**
 * Browser-safe API tests
 * 
 * These tests verify that the browser-safe API (import from 'ubml')
 * works correctly without any Node.js-specific dependencies.
 * 
 * The API should work in any JavaScript runtime.
 */

import { describe, it, expect } from 'vitest';
import {
  parse,
  createValidator,
  getValidator,
  parseAndValidate,
  serialize,
  schemas,
  DOCUMENT_TYPES,
  ID_PREFIXES,
  detectDocumentType,
  detectDocumentTypeFromContent,
} from '../../src/index.js';

describe('Browser-Safe API', () => {
  describe('parse()', () => {
    it('should parse valid YAML content', () => {
      const yaml = `
ubml: "1.0"
processes:
  PR001:
    id: PR001
    name: "Test Process"
    steps:
      ST001:
        kind: action
        name: "First Step"
`;
      const result = parse(yaml, 'test.process.ubml.yaml');
      
      expect(result.ok).toBe(true);
      expect(result.document).toBeDefined();
      expect(result.document?.content).toHaveProperty('ubml', '1.0');
      expect(result.document?.meta.type).toBe('process');
      expect(result.errors).toHaveLength(0);
    });

    it('should detect document type from filename', () => {
      const yaml = `ubml: "1.0"\nactors: {}`;
      const result = parse(yaml, 'my-org.actors.ubml.yaml');
      
      expect(result.document?.meta.type).toBe('actors');
    });

    it('should return errors for invalid YAML', () => {
      const invalidYaml = `ubml: "1.0"\n  invalid: indentation`;
      const result = parse(invalidYaml);
      
      expect(result.ok).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('createValidator()', () => {
    it('should create a validator instance', async () => {
      const validator = await createValidator();
      
      expect(validator).toBeDefined();
      expect(typeof validator.validate).toBe('function');
      expect(typeof validator.validateDocument).toBe('function');
    });

    it('should validate content against document type', async () => {
      const validator = await createValidator();
      const content = {
        ubml: '1.0',
        processes: {
          PR001: {
            id: 'PR001',
            name: 'Test',
            steps: {
              ST001: { kind: 'action', name: 'Step' },
            },
          },
        },
      };
      
      const result = validator.validate(content, 'process');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return errors for invalid content', async () => {
      const validator = await createValidator();
      const content = {
        ubml: '1.0',
        processes: {
          PR001: {
            // Missing required: id, name, steps
          },
        },
      };
      
      const result = validator.validate(content, 'process');
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('getValidator()', () => {
    it('should return cached validator on subsequent calls', async () => {
      const v1 = await getValidator();
      const v2 = await getValidator();
      
      expect(v1).toBe(v2);
    });
  });

  describe('parseAndValidate()', () => {
    it('should parse and validate in one call', async () => {
      const yaml = `
ubml: "1.0"
processes:
  PR001:
    id: PR001
    name: "Test"
    steps:
      ST001:
        kind: action
        name: "Step"
`;
      const result = await parseAndValidate(yaml, 'test.process.ubml.yaml');
      
      expect(result.ok).toBe(true);
      expect(result.document).toBeDefined();
      expect(result.validation).toBeDefined();
      expect(result.validation?.valid).toBe(true);
    });
  });

  describe('serialize()', () => {
    it('should serialize object to YAML string', () => {
      const content = {
        ubml: '1.0',
        processes: { PR001: { id: 'PR001', name: 'Test', steps: {} } },
      };
      
      const yaml = serialize(content);
      
      expect(yaml).toContain('ubml:');
      expect(yaml).toContain('processes:');
      expect(yaml).toContain('PR001:');
    });

    it('should respect serialization options', () => {
      const content = { key: 'value' };
      
      const yaml4 = serialize(content, { indent: 4 });
      const yaml2 = serialize(content, { indent: 2 });
      
      // Both should contain the content
      expect(yaml4).toContain('key: value');
      expect(yaml2).toContain('key: value');
    });
  });

  describe('schemas', () => {
    it('should provide document schema by type', () => {
      const processSchema = schemas.document('process');
      
      expect(processSchema).toBeDefined();
      expect(processSchema.$id).toContain('process');
    });

    it('should provide fragment schema by name', () => {
      const actorFragment = schemas.fragment('actor');
      
      expect(actorFragment).toBeDefined();
      expect(actorFragment.$id).toContain('actor');
    });

    it('should list all available document types', () => {
      const types = schemas.documentTypes();
      
      expect(types).toContain('process');
      expect(types).toContain('actors');
      expect(types).toContain('entities');
      expect(types).toContain('workspace');
    });

    it('should provide all schemas for Ajv', () => {
      const all = schemas.all();
      
      expect(all).toBeInstanceOf(Map);
      expect(all.size).toBeGreaterThan(0);
    });
  });

  describe('DOCUMENT_TYPES', () => {
    it('should export document types array', () => {
      expect(DOCUMENT_TYPES).toContain('process');
      expect(DOCUMENT_TYPES).toContain('actors');
      expect(DOCUMENT_TYPES).toContain('workspace');
    });
  });

  describe('ID_PREFIXES', () => {
    it('should export ID prefixes object', () => {
      expect(ID_PREFIXES).toHaveProperty('PR');
      expect(ID_PREFIXES).toHaveProperty('ST');
      expect(ID_PREFIXES).toHaveProperty('AC');
    });
  });

  describe('detectDocumentType()', () => {
    it('should detect type from filename pattern', () => {
      expect(detectDocumentType('foo.process.ubml.yaml')).toBe('process');
      expect(detectDocumentType('bar.actors.ubml.yaml')).toBe('actors');
      expect(detectDocumentType('baz.workspace.ubml.yaml')).toBe('workspace');
    });

    it('should return undefined for non-matching patterns', () => {
      expect(detectDocumentType('regular.yaml')).toBeUndefined();
      expect(detectDocumentType('file.txt')).toBeUndefined();
    });
  });

  describe('detectDocumentTypeFromContent()', () => {
    it('should detect type from content properties', () => {
      expect(detectDocumentTypeFromContent({ processes: {} })).toBe('process');
      expect(detectDocumentTypeFromContent({ actors: {} })).toBe('actors');
      expect(detectDocumentTypeFromContent({ entities: {} })).toBe('entities');
    });

    it('should return undefined for unrecognized content', () => {
      expect(detectDocumentTypeFromContent({ random: 'data' })).toBeUndefined();
    });
  });
});
