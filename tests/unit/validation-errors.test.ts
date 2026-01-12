/**
 * Validation Error Formatter Tests
 */

import { describe, it, expect } from 'vitest';
import { SCHEMA_VERSION } from '../../src/constants.js';
import { 
  formatValidationError, 
  formatEnhancedErrorToString, 
  findClosestMatch, 
  levenshtein 
} from '../../src/cli/formatters/validation-errors.js';
import type { RawAjvError, SchemaContext } from '../../src/validator.js';

describe('Levenshtein Distance', () => {
  it('should return 0 for identical strings', () => {
    expect(levenshtein('test', 'test')).toBe(0);
  });

  it('should return correct distance for single character difference', () => {
    expect(levenshtein('test', 'best')).toBe(1); // Different character
    expect(levenshtein('test', 'tests')).toBe(1); // Addition
    expect(levenshtein('test', 'tes')).toBe(1); // Deletion
  });

  it('should return correct distance for multiple differences', () => {
    expect(levenshtein('kitten', 'sitting')).toBe(3);
  });
});

describe('findClosestMatch', () => {
  it('should find exact match', () => {
    expect(findClosestMatch('action', ['action', 'milestone', 'decision'])).toBe('action');
  });

  it('should find closest match with typo', () => {
    expect(findClosestMatch('acton', ['action', 'milestone', 'decision'])).toBe('action');
    expect(findClosestMatch('milstone', ['action', 'milestone', 'decision'])).toBe('milestone');
  });

  it('should return undefined for distant strings', () => {
    expect(findClosestMatch('xyz', ['action', 'milestone', 'decision'])).toBeUndefined();
  });

  it('should handle empty options', () => {
    expect(findClosestMatch('test', [])).toBeUndefined();
  });
});

describe('formatValidationError', () => {
  describe('additionalProperties errors', () => {
    it('should format unknown property error', () => {
      const error: RawAjvError = {
        keyword: 'additionalProperties',
        params: { additionalProperty: 'unknownProp' },
        instancePath: '/processes/PR00001/steps/ST00001',
      };

      const result = formatValidationError(error);
      expect(result.message).toBe('Unknown property: "unknownProp"');
    });

    it('should suggest RACI nesting for RACI properties', () => {
      const error: RawAjvError = {
        keyword: 'additionalProperties',
        params: { additionalProperty: 'responsible' },
        instancePath: '/processes/PR00001/steps/ST00001',
      };

      const result = formatValidationError(error);
      expect(result.message).toBe('Unknown property: "responsible"');
      expect(result.suggestion).toBe("Did you mean to put this inside 'raci'?");
      expect(result.example).toContain('raci:');
      expect(result.example).toContain('responsible: [AC00001]');
    });

    it('should suggest closest match', () => {
      const error: RawAjvError = {
        keyword: 'additionalProperties',
        params: { additionalProperty: 'naem' },
        instancePath: '/processes/PR00001/steps/ST00001',
      };
      const context: SchemaContext = {
        validProperties: ['name', 'kind', 'duration', 'description'],
      };

      const result = formatValidationError(error, context);
      expect(result.suggestion).toBe('Did you mean: "name"?');
      expect(result.validOptions).toContain('name');
    });
  });

  describe('enum errors', () => {
    it('should format enum error with allowed values', () => {
      const error: RawAjvError = {
        keyword: 'enum',
        params: { allowedValues: ['action', 'milestone', 'decision'] },
        data: 'task',
        instancePath: '/processes/PR00001/steps/ST00001/kind',
      };

      const result = formatValidationError(error);
      expect(result.message).toBe('Invalid value: "task"');
      expect(result.validOptions).toEqual(['action', 'milestone', 'decision']);
    });

    it('should suggest closest match for typo', () => {
      const error: RawAjvError = {
        keyword: 'enum',
        params: { allowedValues: ['action', 'milestone', 'decision'] },
        data: 'acton',
        instancePath: '/processes/PR00001/steps/ST00001/kind',
      };

      const result = formatValidationError(error);
      expect(result.suggestion).toBe('Did you mean: "action"?');
    });

    it('should provide schema-driven hint for step kind "task"', () => {
      const error: RawAjvError = {
        keyword: 'enum',
        params: { allowedValues: ['action', 'milestone', 'decision', 'subprocess', 'wait', 'handoff', 'start', 'end'] },
        data: 'task',
        instancePath: '/processes/PR00001/steps/ST00001/kind',
      };

      const result = formatValidationError(error);
      expect(result.message).toBe('Invalid value: "task"');
      expect(result.suggestion).toContain("Use 'action' for work steps");
      expect(result.suggestion).toContain('not a valid step kind');
    });

    it('should provide schema-driven hint for step kind "gateway"', () => {
      const error: RawAjvError = {
        keyword: 'enum',
        params: { allowedValues: ['action', 'milestone', 'decision', 'subprocess', 'wait', 'handoff', 'start', 'end'] },
        data: 'gateway',
        instancePath: '/processes/PR00001/steps/ST00001/kind',
      };

      const result = formatValidationError(error);
      expect(result.message).toBe('Invalid value: "gateway"');
      expect(result.suggestion).toContain("Use 'decision'");
      expect(result.suggestion).toContain('BPMN');
    });

    it('should provide schema-driven hint for step kind "event"', () => {
      const error: RawAjvError = {
        keyword: 'enum',
        params: { allowedValues: ['action', 'milestone', 'decision', 'subprocess', 'wait', 'handoff', 'start', 'end'] },
        data: 'event',
        instancePath: '/processes/PR00001/steps/ST00001/kind',
      };

      const result = formatValidationError(error);
      expect(result.message).toBe('Invalid value: "event"');
      expect(result.suggestion).toContain("Use 'start', 'end', 'wait', or 'milestone'");
    });

    it('should provide schema-driven hint for actor type "user"', () => {
      const error: RawAjvError = {
        keyword: 'enum',
        params: { allowedValues: ['person', 'role', 'team', 'system', 'organization', 'external', 'customer'] },
        data: 'user',
        instancePath: '/actors/AC00001/type',
      };

      const result = formatValidationError(error);
      expect(result.message).toBe('Invalid value: "user"');
      expect(result.suggestion).toContain("Use 'person'");
      expect(result.suggestion).toContain('role');
    });

    it('should provide schema-driven hint for actor type "service"', () => {
      const error: RawAjvError = {
        keyword: 'enum',
        params: { allowedValues: ['person', 'role', 'team', 'system', 'organization', 'external', 'customer'] },
        data: 'service',
        instancePath: '/actors/AC00001/type',
      };

      const result = formatValidationError(error);
      expect(result.message).toBe('Invalid value: "service"');
      expect(result.suggestion).toContain("Use 'system'");
      expect(result.suggestion).toContain('APIs');
    });

    it('should provide schema-driven hint for actor type "human"', () => {
      const error: RawAjvError = {
        keyword: 'enum',
        params: { allowedValues: ['person', 'role', 'team', 'system', 'organization', 'external', 'customer'] },
        data: 'human',
        instancePath: '/actors/AC00001/type',
      };

      const result = formatValidationError(error);
      expect(result.message).toBe('Invalid value: "human"');
      expect(result.suggestion).toContain("Use 'person'");
      expect(result.suggestion).toContain("'human' is an actor 'kind'");
    });

    it('should fall back to closest match when no schema hint exists', () => {
      const error: RawAjvError = {
        keyword: 'enum',
        params: { allowedValues: ['low', 'normal', 'high', 'urgent'] },
        data: 'urgnt',
        instancePath: '/notification/priority',
      };

      const result = formatValidationError(error);
      expect(result.message).toBe('Invalid value: "urgnt"');
      expect(result.suggestion).toBe('Did you mean: "urgent"?');
    });

    it('should handle enum error without data field gracefully', () => {
      const error: RawAjvError = {
        keyword: 'enum',
        params: { allowedValues: ['action', 'milestone'] },
        // data is undefined
        instancePath: '/processes/PR00001/steps/ST00001/kind',
      };

      const result = formatValidationError(error);
      expect(result.message).toBe('Invalid value: ""');
      expect(result.validOptions).toEqual(['action', 'milestone']);
    });
  });

  describe('pattern errors', () => {
    it('should format actor ID pattern error', () => {
      const error: RawAjvError = {
        keyword: 'pattern',
        params: { pattern: '^AC\\d{5,}$' },
        data: 'AC01',
        instancePath: '/actors/AC01',
      };

      const result = formatValidationError(error);
      expect(result.message).toBe('Invalid format: "AC01"');
      expect(result.hint).toContain('AC');
      expect(result.hint).toContain('5+ digits');
      expect(result.example).toContain('AC00001');
    });

    it('should format duration pattern error', () => {
      const error: RawAjvError = {
        keyword: 'pattern',
        params: { pattern: '^[0-9]+(\\.[0-9]+)?(min|h|d|wk|mo)$' },
        data: '2 hours',
        instancePath: '/processes/PR00001/steps/ST00001/duration',
      };

      const result = formatValidationError(error);
      expect(result.message).toBe('Invalid format: "2 hours"');
      // Hint comes from schema x-ubml metadata
      expect(result.hint).toContain('unit');
      expect(result.example).toContain('30min');
    });

    it('should suggest fix for duration without unit', () => {
      const error: RawAjvError = {
        keyword: 'pattern',
        params: { pattern: '^[0-9]+(\\.[0-9]+)?(min|h|d|wk|mo)$' },
        data: '30',
        instancePath: '/processes/PR00001/steps/ST00001/duration',
      };

      const result = formatValidationError(error);
      expect(result.suggestion).toContain('Missing unit');
    });

    it('should suggest fix for ID with too few digits', () => {
      const error: RawAjvError = {
        keyword: 'pattern',
        params: { pattern: '^ST\\d{3,}$' },
        data: 'ST01',
        instancePath: '/processes/PR00001/steps/ST01',
      };

      const result = formatValidationError(error);
      expect(result.suggestion).toContain('at least 3 digits');
    });
  });

  describe('required errors', () => {
    it('should format missing required property', () => {
      const error: RawAjvError = {
        keyword: 'required',
        params: { missingProperty: 'name' },
        instancePath: '/processes/PR00001',
      };

      const result = formatValidationError(error);
      expect(result.message).toBe('Missing required property: "name"');
      expect(result.hint).toBeTruthy();
      expect(result.example).toContain('name:');
    });

    it('should provide ubml hint', () => {
      const error: RawAjvError = {
        keyword: 'required',
        params: { missingProperty: 'ubml' },
        instancePath: '',
      };

      const result = formatValidationError(error);
      expect(result.hint).toContain('ubml');
      expect(result.example).toContain(`ubml: "${SCHEMA_VERSION}"`);
    });
  });

  describe('type errors', () => {
    it('should format type mismatch', () => {
      const error: RawAjvError = {
        keyword: 'type',
        params: { type: 'array' },
        data: 'AC00001',
        instancePath: '/processes/PR00001/steps/ST00001/raci/responsible',
      };

      const result = formatValidationError(error);
      expect(result.message).toContain('Type mismatch');
      expect(result.message).toContain('array');
      expect(result.suggestion).toContain('[');
    });
  });
});

describe('formatEnhancedErrorToString', () => {
  it('should format simple error', () => {
    const result = formatEnhancedErrorToString({
      message: 'Test error',
    });
    expect(result).toBe('Test error');
  });

  it('should include all components', () => {
    const result = formatEnhancedErrorToString({
      message: 'Test error',
      suggestion: 'Try this instead',
      hint: 'Some helpful hint',
      example: 'correct: value',
      validOptions: ['opt1', 'opt2', 'opt3'],
    });

    expect(result).toContain('Test error');
    expect(result).toContain('Try this instead');
    expect(result).toContain('Some helpful hint');
    expect(result).toContain('correct: value');
    expect(result).toContain('opt1');
    expect(result).toContain('opt2');
    expect(result).toContain('opt3');
  });

  it('should truncate many options', () => {
    const manyOptions = Array.from({ length: 20 }, (_, i) => `option${i}`);
    const result = formatEnhancedErrorToString({
      message: 'Test',
      validOptions: manyOptions,
    });

    expect(result).toContain('option0');
    expect(result).toContain('8 more');
  });
});
