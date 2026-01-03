/**
 * Validator unit tests
 */

import { describe, it, expect } from 'vitest';
import { formatError, formatErrors, createError, createWarning } from '../../src/validator/errors.js';
import type { ValidationError, ValidationWarning } from '../../src/validator/errors.js';

describe('Validator', () => {
  describe('Error formatting', () => {
    it('should format error with all fields', () => {
      const error: ValidationError = {
        message: 'Test error message',
        filepath: '/path/to/file.yaml',
        line: 10,
        column: 5,
        path: '/processes/PR001',
        code: 'test-error',
        severity: 'error',
      };

      const formatted = formatError(error);
      expect(formatted).toContain('/path/to/file.yaml');
      expect(formatted).toContain(':10:5');
      expect(formatted).toContain('error');
      expect(formatted).toContain('[test-error]');
      expect(formatted).toContain('Test error message');
      expect(formatted).toContain('/processes/PR001');
    });

    it('should format error without optional fields', () => {
      const error: ValidationError = {
        message: 'Simple error',
        filepath: '/path/to/file.yaml',
        severity: 'error',
      };

      const formatted = formatError(error);
      expect(formatted).toBe('/path/to/file.yaml: error: Simple error');
    });

    it('should format multiple errors', () => {
      const errors: ValidationError[] = [
        { message: 'Error 1', filepath: '/file1.yaml', severity: 'error' },
        { message: 'Error 2', filepath: '/file2.yaml', severity: 'error' },
      ];

      const formatted = formatErrors(errors);
      expect(formatted).toContain('Error 1');
      expect(formatted).toContain('Error 2');
      expect(formatted.split('\n')).toHaveLength(2);
    });
  });

  describe('Error creation', () => {
    it('should create error with defaults', () => {
      const error = createError('Test message', '/path/file.yaml');
      expect(error.message).toBe('Test message');
      expect(error.filepath).toBe('/path/file.yaml');
      expect(error.severity).toBe('error');
    });

    it('should create warning with defaults', () => {
      const warning = createWarning('Test warning', '/path/file.yaml');
      expect(warning.message).toBe('Test warning');
      expect(warning.filepath).toBe('/path/file.yaml');
      expect(warning.severity).toBe('warning');
    });

    it('should allow optional fields', () => {
      const error = createError('Test', '/file.yaml', {
        line: 5,
        column: 10,
        code: 'custom-code',
      });
      expect(error.line).toBe(5);
      expect(error.column).toBe(10);
      expect(error.code).toBe('custom-code');
    });
  });
});
