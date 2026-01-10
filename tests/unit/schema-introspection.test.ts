/**
 * Schema Introspection Tests
 *
 * Tests for the schema introspection utilities that read metadata
 * from UBML schemas.
 */

import { describe, it, expect } from 'vitest';
import {
  getDocumentTypeInfo,
  getAllDocumentTypes,
  getAllElementTypes,
  getElementTypeInfo,
  getSuggestedWorkflow,
  getSuggestedNextStep,
  createDocument,
  type DocumentTypeInfo,
  type ElementTypeInfo,
  type WorkflowStep,
} from '../../src/schema/index.js';
import { DOCUMENT_TYPES, type DocumentType } from '../../src/metadata.js';

describe('Schema Introspection', () => {
  // ==========================================================================
  // Document Type Information
  // ==========================================================================

  describe('getAllDocumentTypes', () => {
    it('should return all document types', () => {
      const docTypes = getAllDocumentTypes();
      expect(docTypes.length).toBeGreaterThan(0);
      expect(docTypes.length).toBe(DOCUMENT_TYPES.length);
    });

    it('should include all expected document types', () => {
      const docTypes = getAllDocumentTypes();
      const types = docTypes.map(d => d.type);
      
      expect(types).toContain('process');
      expect(types).toContain('actors');
      expect(types).toContain('entities');
      expect(types).toContain('workspace');
      expect(types).toContain('hypotheses');
      expect(types).toContain('scenarios');
      expect(types).toContain('metrics');
      expect(types).toContain('strategy');
    });

    it('should have workflow order for each document', () => {
      const docTypes = getAllDocumentTypes();
      for (const doc of docTypes) {
        expect(doc.workflowOrder).toBeDefined();
        expect(typeof doc.workflowOrder).toBe('number');
      }
    });
  });

  describe('getDocumentTypeInfo', () => {
    it('should return info for valid document type', () => {
      const info = getDocumentTypeInfo('process');
      expect(info).toBeDefined();
      expect(info?.type).toBe('process');
      expect(info?.shortDescription).toBeDefined();
      expect(info?.category).toBeDefined();
    });

    it('should return info for all document types', () => {
      for (const type of DOCUMENT_TYPES) {
        const info = getDocumentTypeInfo(type);
        expect(info).toBeDefined();
        expect(info?.type).toBe(type);
      }
    });

    it('should return undefined for invalid document type', () => {
      const info = getDocumentTypeInfo('invalid' as DocumentType);
      // The new API returns undefined for unknown types
      expect(info).toBeUndefined();
    });

    it('should include category information', () => {
      const processInfo = getDocumentTypeInfo('process');
      expect(processInfo?.category).toBe('core');
      expect(processInfo?.categoryDisplayName).toBe('Core Modeling');
    });

    it('should include workflow order', () => {
      const workspaceInfo = getDocumentTypeInfo('workspace');
      const processInfo = getDocumentTypeInfo('process');
      
      expect(workspaceInfo?.workflowOrder).toBeDefined();
      expect(processInfo?.workflowOrder).toBeDefined();
      // Workspace should come before process in workflow
      expect(workspaceInfo!.workflowOrder).toBeLessThan(processInfo!.workflowOrder);
    });

    it('should include required properties', () => {
      const processInfo = getDocumentTypeInfo('process');
      expect(processInfo?.requiredProperties).toContain('ubml');
      expect(processInfo?.requiredProperties).toContain('processes');
    });

    it('should include getting started tips', () => {
      const processInfo = getDocumentTypeInfo('process');
      expect(processInfo?.gettingStarted).toBeDefined();
      expect(processInfo!.gettingStarted.length).toBeGreaterThan(0);
    });
  });

  // ==========================================================================
  // Element Type Information
  // ==========================================================================

  describe('getAllElementTypes', () => {
    it('should return element types', () => {
      const elements = getAllElementTypes();
      expect(elements.length).toBeGreaterThan(0);
    });

    it('should include common elements', () => {
      const elements = getAllElementTypes();
      const types = elements.map(e => e.type);
      
      expect(types).toContain('step');
      expect(types).toContain('actor');
      expect(types).toContain('process');
    });

    it('should have prefix for each element', () => {
      const elements = getAllElementTypes();
      for (const elem of elements) {
        expect(elem.prefix).toBeDefined();
        expect(elem.prefix.length).toBeGreaterThanOrEqual(2);
      }
    });
  });

  describe('getElementTypeInfo', () => {
    it('should return info for step', () => {
      const info = getElementTypeInfo('step');
      expect(info).toBeDefined();
      expect(info?.type).toBe('step');
      expect(info?.idPrefix).toBe('ST');
    });

    it('should return info for actor', () => {
      const info = getElementTypeInfo('actor');
      expect(info).toBeDefined();
      expect(info?.type).toBe('actor');
      expect(info?.idPrefix).toBe('AC');
    });

    it('should include properties', () => {
      const stepInfo = getElementTypeInfo('step');
      expect(stepInfo?.properties).toBeDefined();
      expect(stepInfo!.properties.length).toBeGreaterThan(0);
      
      // Should have name property
      const nameProperty = stepInfo!.properties.find(p => p.name === 'name');
      expect(nameProperty).toBeDefined();
    });

    it('should include required properties', () => {
      const stepInfo = getElementTypeInfo('step');
      expect(stepInfo?.requiredProperties).toBeDefined();
    });

    it('should return undefined for invalid element type', () => {
      const info = getElementTypeInfo('invalidElement');
      expect(info).toBeUndefined();
    });

    it('should include enum values for properties', () => {
      const stepInfo = getElementTypeInfo('step');
      const kindProperty = stepInfo?.properties.find(p => p.name === 'kind');
      
      expect(kindProperty?.enumValues).toBeDefined();
      expect(kindProperty!.enumValues).toContain('action');
      expect(kindProperty!.enumValues).toContain('decision');
      expect(kindProperty!.enumValues).toContain('start');
      expect(kindProperty!.enumValues).toContain('end');
    });
  });

  // ==========================================================================
  // Workflow Suggestions
  // ==========================================================================

  describe('getSuggestedWorkflow', () => {
    it('should return a workflow with multiple steps', () => {
      const workflow = getSuggestedWorkflow();
      expect(workflow.length).toBeGreaterThan(0);
    });

    it('should start with workspace', () => {
      const workflow = getSuggestedWorkflow();
      expect(workflow[0].type).toBe('workspace');
    });

    it('should have increasing step numbers', () => {
      const workflow = getSuggestedWorkflow();
      for (let i = 1; i < workflow.length; i++) {
        expect(workflow[i].step).toBeGreaterThan(workflow[i - 1].step);
      }
    });

    it('should include reasons for each step', () => {
      const workflow = getSuggestedWorkflow();
      for (const step of workflow) {
        expect(step.reason).toBeDefined();
        expect(step.reason.length).toBeGreaterThan(0);
      }
    });
  });

  describe('getSuggestedNextStep', () => {
    it('should suggest actors after workspace', () => {
      const next = getSuggestedNextStep(['workspace']);
      expect(next?.type).toBe('actors');
    });

    it('should suggest process after actors', () => {
      const next = getSuggestedNextStep(['workspace', 'actors']);
      expect(next?.type).toBe('process');
    });

    it('should return undefined when workflow is complete', () => {
      const allTypes = DOCUMENT_TYPES.slice();
      const next = getSuggestedNextStep(allTypes);
      // Should return undefined when all types exist
      expect(next).toBeUndefined();
    });

    it('should return first step for empty input', () => {
      const next = getSuggestedNextStep([]);
      expect(next?.type).toBe('workspace');
    });
  });

  // ==========================================================================
  // Template Generation
  // ==========================================================================

  describe('createDocument', () => {
    it('should return minimal template for process', () => {
      const template = createDocument('process');
      expect(template).toBeDefined();
      expect(template.ubml).toBe('1.1');
      expect(template.processes).toBeDefined();
    });

    it('should return minimal template for actors', () => {
      const template = createDocument('actors');
      expect(template).toBeDefined();
      expect(template.ubml).toBe('1.1');
    });

    it('should return minimal template for workspace', () => {
      const template = createDocument('workspace');
      expect(template).toBeDefined();
      expect(template.ubml).toBe('1.1');
    });

    it('should return templates for all document types', () => {
      for (const type of DOCUMENT_TYPES) {
        const template = createDocument(type);
        expect(template).toBeDefined();
        expect(template.ubml).toBe('1.1');
      }
    });
  });
});
