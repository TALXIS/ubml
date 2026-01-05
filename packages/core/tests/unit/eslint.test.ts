/**
 * ESLint plugin unit tests
 * 
 * Tests the UBML ESLint rule for correct validation and line number reporting.
 */

import { describe, it, expect } from 'vitest';
import { validUbmlRule } from '../../src/eslint/rules/valid-ubml.js';
import type { Rule } from 'eslint';

// Helper to simulate ESLint context and collect reported problems
interface ReportedProblem {
  messageId: string;
  data: Record<string, string>;
  loc?: {
    start: { line: number; column: number };
    end: { line: number; column: number };
  };
}

function createMockContext(
  filename: string,
  source: string,
  options: unknown[] = []
): { context: Rule.RuleContext; reports: ReportedProblem[] } {
  const reports: ReportedProblem[] = [];
  
  const context = {
    filename,
    getFilename: () => filename,
    sourceCode: {
      getText: () => source,
    },
    getSourceCode: () => ({
      getText: () => source,
    }),
    options,
    report: (descriptor: any) => {
      reports.push({
        messageId: descriptor.messageId,
        data: descriptor.data,
        loc: descriptor.loc,
      });
    },
  } as unknown as Rule.RuleContext;
  
  return { context, reports };
}

// Mock AST node for Program
const mockProgramNode = { 
  type: 'Program',
  sourceType: 'module',
  body: [],
  parent: null,
} as unknown as Rule.Node;

describe('ESLint Plugin', () => {
  describe('validUbmlRule', () => {
    it('should have correct meta information', () => {
      expect(validUbmlRule.meta?.type).toBe('problem');
      expect(validUbmlRule.meta?.docs?.description).toContain('UBML');
    });

    it('should skip non-UBML files', async () => {
      const source = 'foo: bar';
      const { context, reports } = createMockContext('regular.yaml', source);
      
      const listeners = validUbmlRule.create(context);
      
      // Non-UBML files should return empty listeners
      expect(Object.keys(listeners)).toHaveLength(0);
    });

    it('should process UBML files', async () => {
      const source = `ubml: "1.0"
processes:
  PR001:
    id: "PR001"
    name: "Test Process"
    steps:
      ST001:
        name: "Step 1"
        kind: action
`;
      const { context, reports } = createMockContext('test.process.ubml.yaml', source);
      
      const listeners = validUbmlRule.create(context);
      
      // UBML files should have Program listener
      expect(listeners).toHaveProperty('Program');
    });

    it('should process UBML files with simple pattern', async () => {
      const source = `ubml: "1.0"
actors:
  AC001:
    name: "Test Actor"
    type: role
    kind: human
`;
      // Test simple pattern: actors.ubml.yaml (no prefix)
      const { context, reports } = createMockContext('actors.ubml.yaml', source);
      
      const listeners = validUbmlRule.create(context);
      
      // UBML files should have Program listener
      expect(listeners).toHaveProperty('Program');
    });

    it('should report parse errors with line numbers', async () => {
      const source = `ubml: "1.0"
  invalid: indentation
`;
      const { context, reports } = createMockContext('test.process.ubml.yaml', source);
      
      const listeners = validUbmlRule.create(context);
      
      // Call the Program listener
      if (listeners.Program && typeof listeners.Program === 'function') {
        await (listeners.Program as any)(mockProgramNode);
      }
      
      // Should have parse error
      expect(reports.length).toBeGreaterThan(0);
      expect(reports[0].messageId).toBe('parseError');
      
      // Should have line information
      expect(reports[0].loc).toBeDefined();
      expect(reports[0].loc!.start.line).toBeGreaterThan(0);
    });

    it('should report validation errors with line numbers', async () => {
      const source = `ubml: "1.0"
processes:
  PR001:
    name: "Test Process"
    steps:
      ST001:
        name: "Step without kind"
`;
      const { context, reports } = createMockContext('test.process.ubml.yaml', source);
      
      const listeners = validUbmlRule.create(context);
      
      // Call the Program listener
      if (listeners.Program && typeof listeners.Program === 'function') {
        await (listeners.Program as any)(mockProgramNode);
      }
      
      // Should have validation errors (missing 'id' and 'kind')
      expect(reports.length).toBeGreaterThan(0);
      expect(reports.some(r => r.messageId === 'validationError')).toBe(true);
      
      // Find an error and check it has location
      const validationError = reports.find(r => r.messageId === 'validationError');
      expect(validationError).toBeDefined();
      expect(validationError!.loc).toBeDefined();
      expect(validationError!.loc!.start.line).toBeGreaterThan(0);
    });

    it('should report correct line numbers for nested errors', async () => {
      // Line 1: ubml
      // Line 2: processes
      // Line 3:   PR001
      // Line 4:     name (PR001 value starts here - missing 'id')
      // Line 5:     steps
      // Line 6:       ST001
      // Line 7:         name (ST001 value starts here - missing 'kind')
      const source = `ubml: "1.0"
processes:
  PR001:
    name: "Test"
    steps:
      ST001:
        name: "Step 1"
`;
      const { context, reports } = createMockContext('test.process.ubml.yaml', source);
      
      const listeners = validUbmlRule.create(context);
      
      if (listeners.Program && typeof listeners.Program === 'function') {
        await (listeners.Program as any)(mockProgramNode);
      }
      
      // Should have multiple validation errors
      expect(reports.length).toBeGreaterThanOrEqual(2);
      
      // Find errors by path
      const pr001Error = reports.find(r => 
        r.data?.path?.includes('/processes/PR001') && 
        !r.data?.path?.includes('/steps')
      );
      const st001Error = reports.find(r => 
        r.data?.path?.includes('/steps/ST001')
      );
      
      // Both should have line numbers
      if (pr001Error?.loc) {
        expect(pr001Error.loc.start.line).toBe(4); // PR001 value starts at line 4
      }
      if (st001Error?.loc) {
        expect(st001Error.loc.start.line).toBe(7); // ST001 value starts at line 7
      }
    });

    it('should validate actors document', async () => {
      const source = `ubml: "1.0"
actors:
  AC001:
    name: "Test Actor"
    type: role
`;
      const { context, reports } = createMockContext('test.actors.ubml.yaml', source);
      
      const listeners = validUbmlRule.create(context);
      
      if (listeners.Program && typeof listeners.Program === 'function') {
        await (listeners.Program as any)(mockProgramNode);
      }
      
      // Should have error for missing 'kind' field
      const kindError = reports.find(r => 
        r.data?.message?.includes('kind')
      );
      expect(kindError).toBeDefined();
      expect(kindError!.loc).toBeDefined();
      expect(kindError!.loc!.start.line).toBe(4); // AC001 value starts at line 4
    });

    it('should pass valid documents without errors', async () => {
      const source = `ubml: "1.0"
actors:
  AC001:
    name: "Test Actor"
    type: role
    kind: human
`;
      const { context, reports } = createMockContext('test.actors.ubml.yaml', source);
      
      const listeners = validUbmlRule.create(context);
      
      if (listeners.Program && typeof listeners.Program === 'function') {
        await (listeners.Program as any)(mockProgramNode);
      }
      
      // Should have no validation errors (only potential warnings)
      const errors = reports.filter(r => r.messageId === 'validationError' || r.messageId === 'parseError');
      expect(errors).toHaveLength(0);
    });
  });
});
