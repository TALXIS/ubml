/**
 * Tests for unified validation (schema + references).
 */

import { describe, it, expect } from 'vitest';
import { parse, validate } from '../../src/index.js';

describe('validate', () => {
  it('should validate schema and references together', async () => {
    // Actor document
    const actorsYaml = `
ubml: "1.0"
name: "Test Actors"
actors:
  AC001:
    name: "Project Manager"
    type: role
    kind: human
`;
    
    // Process referencing the actor
    const processYaml = `
ubml: "1.0"
name: "Test Process"
processes:
  PR001:
    id: "PR001"
    name: "Sample Process"
    steps:
      ST001:
        kind: action
        name: "Do Work"
        raci:
          accountable:
            - AC001
`;
    
    const actors = parse(actorsYaml, 'actors.actors.ubml.yaml');
    const process = parse(processYaml, 'process.process.ubml.yaml');
    
    const result = await validate([actors.document!, process.document!]);
    
    if (!result.valid) {
      console.log('Errors:', result.errors);
    }
    
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should detect undefined references', async () => {
    const processYaml = `
ubml: "1.0"
processes:
  PR001:
    id: "PR001"
    name: "Test"
    steps:
      ST001:
        kind: action
        name: "Step"
        raci:
          accountable:
            - AC999
`;
    
    const process = parse(processYaml, 'process.process.ubml.yaml');
    const result = await validate([process.document!]);
    
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.code === 'ubml/undefined-reference')).toBe(true);
    expect(result.errors.some(e => e.message.includes('AC999'))).toBe(true);
  });

  it('should detect duplicate IDs', async () => {
    const actors1 = parse(`
ubml: "1.0"
actors:
  AC001:
    name: "Manager"
    type: role
    kind: human
`, 'actors1.actors.ubml.yaml');
    
    const actors2 = parse(`
ubml: "1.0"
actors:
  AC001:
    name: "Different Manager"
    type: role
    kind: human
`, 'actors2.actors.ubml.yaml');
    
    const result = await validate([actors1.document!, actors2.document!]);
    
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.code === 'ubml/duplicate-id')).toBe(true);
  });

  it('should warn about unused IDs with line numbers', async () => {
    const actorsYaml = `
ubml: "1.0"
actors:
  AC001:
    name: "Unused Actor"
    type: role
    kind: human
`;
    
    const actors = parse(actorsYaml, 'actors.actors.ubml.yaml');
    const result = await validate([actors.document!]);
    
    expect(result.valid).toBe(true);
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings[0].code).toBe('ubml/unused-id');
    expect(result.warnings[0].line).toBeGreaterThan(0);
    expect(result.warnings[0].column).toBeGreaterThan(0);
  });

  it('should suppress unused warnings when requested', async () => {
    const actorsYaml = `
ubml: "1.0"
actors:
  AC001:
    name: "Catalog Actor"
    type: role
    kind: human
`;
    
    const actors = parse(actorsYaml, 'actors.actors.ubml.yaml');
    const result = await validate([actors.document!], {
      suppressUnusedWarnings: true,
    });
    
    expect(result.valid).toBe(true);
    expect(result.warnings).toHaveLength(0);
  });

  it('should detect schema validation errors', async () => {
    const invalidYaml = `
ubml: "1.0"
processes:
  PR001:
    id: "PR001"
    name: "Test"
    level: 999
`;
    
    const process = parse(invalidYaml, 'process.process.ubml.yaml');
    const result = await validate([process.document!]);
    
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('should validate multiple document types', async () => {
    const actors = parse(`
ubml: "1.0"
actors:
  AC001:
    name: "PM"
    type: role
    kind: human
`, 'actors.actors.ubml.yaml');
    
    const process = parse(`
ubml: "1.0"
processes:
  PR001:
    id: "PR001"
    name: "Process"
    steps:
      ST001:
        kind: action
        name: "Step"
        raci:
          accountable:
            - AC001
`, 'process.process.ubml.yaml');
    
    const result = await validate([
      actors.document!,
      process.document!,
    ]);
    
    if (!result.valid) {
      console.log('Errors:', result.errors);
    }
    
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});
