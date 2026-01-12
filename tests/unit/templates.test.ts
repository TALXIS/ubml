/**
 * Template Validation Tests
 * 
 * Ensures that CLI-generated templates are valid UBML documents.
 * This catches issues like using 'event' instead of 'start'/'end' for step kinds.
 */

import { describe, it, expect } from 'vitest';
import { SCHEMA_VERSION } from '../../src/constants.js';
import { parse } from '../../src/parser.js';
import { createValidator } from '../../src/validator.js';

// Import the templates by simulating what add.ts generates
// We test the actual YAML output to ensure templates validate

describe('CLI Templates', () => {
  describe('Process Template', () => {
    const processYaml = `
ubml: "${SCHEMA_VERSION}"
processes:
  PR00001:
    name: "Test Process"
    level: 3
    steps:
      ST00001:
        name: "Start"
        kind: start
        description: "Process entry point"
      ST00002:
        name: "First Activity"
        kind: action
        description: "First activity"
        duration: "1h"
      ST00099:
        name: "End"
        kind: end
        description: "Process exit point"
    links:
      - from: ST00001
        to: ST00002
      - from: ST00002
        to: ST00099
`;

    it('should parse without errors', () => {
      const result = parse(processYaml, 'test.process.ubml.yaml');
      expect(result.errors).toHaveLength(0);
      expect(result.ok).toBe(true);
      expect(result.document).toBeDefined();
    });

    it('should validate against process schema', async () => {
      const validator = await createValidator();
      const parsed = parse(processYaml, 'test.process.ubml.yaml');
      expect(parsed.document).toBeDefined();
      const result = validator.validateDocument(parsed.document!);
      
      // Should have no schema errors (warnings about unreferenced IDs are OK)
      const schemaErrors = result.errors.filter(e => e.code !== 'unused-definition');
      expect(schemaErrors).toHaveLength(0);
    });

    it('should use valid step kinds', () => {
      const parsed = parse(processYaml, 'test.process.ubml.yaml');
      expect(parsed.document).toBeDefined();
      const steps = (parsed.document!.content as any).processes.PR00001.steps;
      
      const validKinds = ['action', 'milestone', 'decision', 'subprocess', 'wait', 'handoff', 'start', 'end'];
      for (const [id, step] of Object.entries(steps)) {
        expect(validKinds).toContain((step as any).kind);
      }
    });
  });

  describe('Actors Template', () => {
    const actorsYaml = `
ubml: "${SCHEMA_VERSION}"
actors:
  AC00001:
    name: "Process Owner"
    type: role
    kind: human
    description: "Responsible for process outcomes"
  AC00010:
    name: "ERP System"
    type: system
    kind: system
    description: "Core enterprise system"
  AC00020:
    name: "Customer"
    type: customer
    kind: human
    isExternal: true
    description: "External customer"
skills:
  SK00001:
    name: "Domain Expertise"
    description: "Deep knowledge of the business domain"
`;

    it('should parse without errors', () => {
      const result = parse(actorsYaml, 'test.actors.ubml.yaml');
      expect(result.errors).toHaveLength(0);
      expect(result.ok).toBe(true);
      expect(result.document).toBeDefined();
    });

    it('should validate against actors schema', async () => {
      const validator = await createValidator();
      const parsed = parse(actorsYaml, 'test.actors.ubml.yaml');
      expect(parsed.document).toBeDefined();
      const result = validator.validateDocument(parsed.document!);
      
      // Should have no schema errors
      const schemaErrors = result.errors.filter(e => e.code !== 'unused-definition');
      expect(schemaErrors).toHaveLength(0);
    });

    it('should use valid actor types', () => {
      const parsed = parse(actorsYaml, 'test.actors.ubml.yaml');
      expect(parsed.document).toBeDefined();
      const actors = (parsed.document!.content as any).actors;
      
      const validTypes = ['person', 'role', 'team', 'system', 'organization', 'external', 'customer'];
      for (const [id, actor] of Object.entries(actors)) {
        expect(validTypes).toContain((actor as any).type);
      }
    });

    it('should use valid actor kinds', () => {
      const parsed = parse(actorsYaml, 'test.actors.ubml.yaml');
      expect(parsed.document).toBeDefined();
      const actors = (parsed.document!.content as any).actors;
      
      const validKinds = ['human', 'org', 'system'];
      for (const [id, actor] of Object.entries(actors)) {
        expect(validKinds).toContain((actor as any).kind);
      }
    });
  });

  describe('Entities Template', () => {
    const entitiesYaml = `
ubml: "${SCHEMA_VERSION}"
entities:
  EN00001:
    name: "Order"
    description: "Customer order for products or services"
  EN00002:
    name: "Customer"
    description: "Customer or client record"
documents:
  DC00001:
    name: "Order Form"
    description: "Form used to capture order details"
`;

    it('should parse without errors', () => {
      const result = parse(entitiesYaml, 'test.entities.ubml.yaml');
      expect(result.errors).toHaveLength(0);
      expect(result.ok).toBe(true);
    });

    it('should validate against entities schema', async () => {
      const validator = await createValidator();
      const parsed = parse(entitiesYaml, 'test.entities.ubml.yaml');
      expect(parsed.document).toBeDefined();
      const result = validator.validateDocument(parsed.document!);
      
      const schemaErrors = result.errors.filter(e => e.code !== 'unused-definition' && e.code !== 'unresolved-reference');
      expect(schemaErrors).toHaveLength(0);
    });
  });

  describe('Metrics Template', () => {
    const metricsYaml = `
ubml: "${SCHEMA_VERSION}"
kpis:
  KP00001:
    name: "Cycle Time"
    description: "Total elapsed time from start to completion"
    unit: "hours"
    type: process
  KP00002:
    name: "Throughput"
    description: "Number of cases completed per period"
    unit: "cases/day"
    type: outcome
`;

    it('should parse without errors', () => {
      const result = parse(metricsYaml, 'test.metrics.ubml.yaml');
      expect(result.errors).toHaveLength(0);
      expect(result.ok).toBe(true);
    });

    it('should validate against metrics schema', async () => {
      const validator = await createValidator();
      const parsed = parse(metricsYaml, 'test.metrics.ubml.yaml');
      expect(parsed.document).toBeDefined();
      const result = validator.validateDocument(parsed.document!);
      
      const schemaErrors = result.errors.filter(e => e.code !== 'unused-definition');
      expect(schemaErrors).toHaveLength(0);
    });

    it('should use valid type values', () => {
      const parsed = parse(metricsYaml, 'test.metrics.ubml.yaml');
      expect(parsed.document).toBeDefined();
      const kpis = (parsed.document!.content as any).kpis;
      
      const validTypes = ['outcome', 'process', 'leading', 'lagging'];
      for (const [id, kpi] of Object.entries(kpis)) {
        if ((kpi as any).type) {
          expect(validTypes).toContain((kpi as any).type);
        }
      }
    });
  });

  describe('Hypotheses Template', () => {
    const hypothesesYaml = `
ubml: "${SCHEMA_VERSION}"
hypothesisTrees:
  HT00001:
    name: "Process Improvement Analysis"
    scqh:
      situation: "Current state description"
      complication: "Problem description"
      question: "How can we improve?"
      hypothesis: "By improving X we can achieve Y"
    root:
      HY00001:
        text: "We can improve outcomes by automating X"
        status: untested
        children:
          HY00002:
            text: "Automation reduces manual errors"
            status: untested
          HY00003:
            text: "Automation reduces processing time"
            status: validated
`;

    it('should parse without errors', () => {
      const result = parse(hypothesesYaml, 'test.hypotheses.ubml.yaml');
      expect(result.errors).toHaveLength(0);
      expect(result.ok).toBe(true);
    });

    it('should validate against hypotheses schema', async () => {
      const validator = await createValidator();
      const parsed = parse(hypothesesYaml, 'test.hypotheses.ubml.yaml');
      expect(parsed.document).toBeDefined();
      const result = validator.validateDocument(parsed.document!);
      
      const schemaErrors = result.errors.filter(e => e.code !== 'unused-definition');
      expect(schemaErrors).toHaveLength(0);
    });

    it('should use valid hypothesis status', () => {
      const parsed = parse(hypothesesYaml, 'test.hypotheses.ubml.yaml');
      expect(parsed.document).toBeDefined();
      const tree = (parsed.document!.content as any).hypothesisTrees.HT00001;
      
      const validStatuses = ['untested', 'validated', 'invalidated', 'partial'];
      // Root is now a keyed dictionary, get the first node
      const rootNode = Object.values(tree.root)[0] as any;
      expect(validStatuses).toContain(rootNode.status);
    });
  });
});
