/**
 * Serializer unit tests
 */

import { describe, it, expect } from 'vitest';
import { SCHEMA_VERSION } from '../../src/constants.js';
import { serialize } from '../../src/index.js';

describe('Serializer', () => {
  describe('serialize', () => {
    it('should serialize simple objects', () => {
      const obj = { ubml: SCHEMA_VERSION, name: 'Test' };
      
      const yaml = serialize(obj);
      
      expect(yaml).toContain(`ubml: "${SCHEMA_VERSION}"`);
      expect(yaml).toContain('name: Test');
      expect(yaml.endsWith('\n')).toBe(true);
    });

    it('should serialize nested objects', () => {
      const obj = {
        ubml: '1.1',
        processes: {
          PR00001: {
            name: 'Test Process',
            steps: {
              ST00001: { name: 'Step 1' },
            },
          },
        },
      };
      
      const yaml = serialize(obj);
      expect(yaml).toContain('processes:');
      expect(yaml).toContain('PR00001:');
      expect(yaml).toContain('steps:');
    });

    it('should serialize arrays', () => {
      const obj = {
        documents: ['file1.yaml', 'file2.yaml'],
      };
      
      const yaml = serialize(obj);
      expect(yaml).toContain('documents:');
      expect(yaml).toContain('- file1.yaml');
      expect(yaml).toContain('- file2.yaml');
    });

    it('should respect indent option', () => {
      const obj = { parent: { child: 'value' } };
      
      const yaml2 = serialize(obj, { indent: 2 });
      const yaml4 = serialize(obj, { indent: 4 });
      
      expect(yaml2).toContain('  child:');
      expect(yaml4).toContain('    child:');
    });

    it('should handle trailingNewline option', () => {
      const obj = { name: 'test' };
      
      const withNewline = serialize(obj, { trailingNewline: true });
      const withoutNewline = serialize(obj, { trailingNewline: false });
      
      expect(withNewline.endsWith('\n')).toBe(true);
      expect(withoutNewline.endsWith('\n')).toBe(false);
    });
  });
});
