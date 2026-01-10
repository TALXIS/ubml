/**
 * Metadata generation tests
 * 
 * Tests for auto-generated metadata from schemas, including:
 * - Reference field extraction
 * - ID pattern validation
 * - Document type detection
 */

import { describe, it, expect } from 'vitest';
import {
  REFERENCE_FIELDS,
  isReferenceField,
  isValidId,
  getElementTypeFromId,
  ID_PREFIXES,
  DOCUMENT_TYPES,
} from '../../src/metadata.js';

describe('Generated Metadata', () => {
  describe('REFERENCE_FIELDS', () => {
    it('should be an array of strings', () => {
      expect(Array.isArray(REFERENCE_FIELDS)).toBe(true);
      expect(REFERENCE_FIELDS.length).toBeGreaterThan(0);
      REFERENCE_FIELDS.forEach(field => {
        expect(typeof field).toBe('string');
      });
    });

    it('should include common reference fields', () => {
      // Common RACI fields
      expect(REFERENCE_FIELDS).toContain('responsible');
      expect(REFERENCE_FIELDS).toContain('accountable');
      expect(REFERENCE_FIELDS).toContain('consulted');
      expect(REFERENCE_FIELDS).toContain('informed');
      
      // Common relationship fields
      expect(REFERENCE_FIELDS).toContain('owner');
      expect(REFERENCE_FIELDS).toContain('actor');
      expect(REFERENCE_FIELDS).toContain('skills');
      expect(REFERENCE_FIELDS).toContain('from');
      expect(REFERENCE_FIELDS).toContain('to');
      expect(REFERENCE_FIELDS).toContain('parent');
      // Note: 'children' removed per P1.1 principle (no dual hierarchy)
    });

    it('should not contain duplicates', () => {
      const uniqueFields = new Set(REFERENCE_FIELDS);
      expect(uniqueFields.size).toBe(REFERENCE_FIELDS.length);
    });

    it('should be sorted alphabetically', () => {
      const sorted = [...REFERENCE_FIELDS].sort();
      expect(REFERENCE_FIELDS).toEqual(sorted);
    });
  });

  describe('isReferenceField', () => {
    it('should return true for known reference fields', () => {
      expect(isReferenceField('responsible')).toBe(true);
      expect(isReferenceField('accountable')).toBe(true);
      expect(isReferenceField('skills')).toBe(true);
      expect(isReferenceField('owner')).toBe(true);
    });

    it('should return false for unknown fields', () => {
      expect(isReferenceField('name')).toBe(false);
      expect(isReferenceField('description')).toBe(false);
      expect(isReferenceField('kind')).toBe(false);
      expect(isReferenceField('unknownField')).toBe(false);
    });

    it('should be case-sensitive', () => {
      expect(isReferenceField('Responsible')).toBe(false);
      expect(isReferenceField('OWNER')).toBe(false);
    });
  });

  describe('ID Pattern Validation', () => {
    it('should validate actor IDs', () => {
      expect(isValidId('AC00001')).toBe(true);
      expect(isValidId('AC99999')).toBe(true);
      expect(isValidId('AC123456')).toBe(true); // 6+ digits also valid
      expect(isValidId('AC0001')).toBe(false); // Too short (4 digits)
      expect(isValidId('AC')).toBe(false);
      expect(isValidId('ac00001')).toBe(false); // Lowercase
    });

    it('should validate step IDs', () => {
      expect(isValidId('ST00001')).toBe(true);
      expect(isValidId('ST10000')).toBe(true);
    });

    it('should validate entity IDs', () => {
      expect(isValidId('EN00001')).toBe(true);
      expect(isValidId('EN25000')).toBe(true);
    });

    it('should validate KPI IDs', () => {
      expect(isValidId('KP00001')).toBe(true);
      expect(isValidId('KP00024')).toBe(true);
    });

    it('should reject invalid IDs', () => {
      expect(isValidId('')).toBe(false);
      expect(isValidId('XY00001')).toBe(false); // Invalid prefix
      expect(isValidId('AC')).toBe(false);
      expect(isValidId('123')).toBe(false);
      expect(isValidId('INVALID')).toBe(false);
    });
  });

  describe('getElementTypeFromId', () => {
    it('should extract element type from actor ID', () => {
      expect(getElementTypeFromId('AC00001')).toBe('actor');
      expect(getElementTypeFromId('AC123')).toBe('actor');
    });

    it('should extract element type from step ID', () => {
      expect(getElementTypeFromId('ST00001')).toBe('step');
    });

    it('should extract element type from entity ID', () => {
      expect(getElementTypeFromId('EN00001')).toBe('entity');
    });

    it('should return undefined for invalid IDs', () => {
      expect(getElementTypeFromId('INVALID')).toBeUndefined();
      expect(getElementTypeFromId('XY001')).toBeUndefined();
      expect(getElementTypeFromId('')).toBeUndefined();
    });
  });

  describe('ID_PREFIXES', () => {
    it('should contain expected prefixes', () => {
      expect(ID_PREFIXES).toHaveProperty('AC');
      expect(ID_PREFIXES).toHaveProperty('ST');
      expect(ID_PREFIXES).toHaveProperty('EN');
      expect(ID_PREFIXES).toHaveProperty('PR');
      expect(ID_PREFIXES).toHaveProperty('KP');
      expect(ID_PREFIXES).toHaveProperty('SK');
    });

    it('should map prefixes to correct types', () => {
      expect(ID_PREFIXES.AC).toBe('actor');
      expect(ID_PREFIXES.ST).toBe('step');
      expect(ID_PREFIXES.EN).toBe('entity');
      expect(ID_PREFIXES.PR).toBe('process');
      expect(ID_PREFIXES.KP).toBe('kpi');
      expect(ID_PREFIXES.SK).toBe('skill');
    });
  });

  describe('DOCUMENT_TYPES', () => {
    it('should include all expected document types', () => {
      expect(DOCUMENT_TYPES).toContain('actors');
      expect(DOCUMENT_TYPES).toContain('entities');
      expect(DOCUMENT_TYPES).toContain('process');
      expect(DOCUMENT_TYPES).toContain('metrics');
      expect(DOCUMENT_TYPES).toContain('workspace');
      expect(DOCUMENT_TYPES).toContain('glossary');
    });

    it('should be sorted alphabetically', () => {
      const sorted = [...DOCUMENT_TYPES].sort();
      expect(DOCUMENT_TYPES).toEqual(sorted);
    });

    it('should not contain duplicates', () => {
      const uniqueTypes = new Set(DOCUMENT_TYPES);
      expect(uniqueTypes.size).toBe(DOCUMENT_TYPES.length);
    });
  });
});
