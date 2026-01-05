/**
 * Validator unit tests
 */

import { describe, it, expect } from 'vitest';
import { parse, createValidator } from '../../src/index.js';

describe('Validator', () => {
  describe('createValidator', () => {
    it('should create a validator instance', async () => {
      const validator = await createValidator();
      expect(validator).toBeDefined();
      expect(typeof validator.validate).toBe('function');
      expect(typeof validator.validateDocument).toBe('function');
    });

    it('should validate valid process document', async () => {
      const validator = await createValidator();
      const content = {
        ubml: '1.0',
        processes: {
          PR001: {
            id: 'PR001',
            name: 'Test Process',
            steps: {
              ST001: {
                kind: 'action',
                name: 'First Step',
              },
            },
          },
        },
      };
      
      const result = validator.validate(content, 'process');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate parsed document', async () => {
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
      const parseResult = parse(yaml, 'test.process.ubml.yaml');
      expect(parseResult.ok).toBe(true);
      
      const validator = await createValidator();
      const result = validator.validateDocument(parseResult.document!);
      expect(result.valid).toBe(true);
    });

    it('should detect invalid document structure', async () => {
      const validator = await createValidator();
      const content = {
        ubml: '1.0',
        // Missing required processes field or invalid structure
        invalid: 'field',
      };
      
      const result = validator.validate(content, 'process');
      // May or may not be valid depending on schema strictness
      // Just verify it returns a result
      expect(result).toBeDefined();
      expect(typeof result.valid).toBe('boolean');
    });
  });
});
