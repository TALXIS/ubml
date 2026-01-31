/**
 * ID Scanner Tests
 *
 * Unit tests for the ID scanning and caching functionality.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, existsSync, writeFileSync, readFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import {
  scanWorkspaceIds,
  getNextAvailableId,
  getNextAvailableIds,
  checkIdConflict,
  readIdStats,
  writeIdStats,
  syncIdStats,
  type IdStats,
} from '../../src/node/id-scanner.js';
import { serialize } from '../../src/index.js';

describe('ID Scanner', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'ubml-test-id-scanner-'));
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  /**
   * Helper to create a workspace file
   */
  function createWorkspaceFile(name: string = 'test'): string {
    const filename = `${name}.workspace.ubml.yaml`;
    const path = join(tempDir, filename);
    const content = serialize({
      ubml: '1.2',
      name: 'Test Workspace',
    });
    writeFileSync(path, content);
    return path;
  }

  /**
   * Helper to create a UBML file with IDs
   */
  function createFileWithIds(filename: string, ids: Record<string, unknown>): void {
    const path = join(tempDir, filename);
    const content = serialize({
      ubml: '1.2',
      ...ids,
    });
    writeFileSync(path, content);
  }

  /**
   * Helper to create cache file
   */
  function createCacheFile(stats: IdStats): void {
    const ubmlDir = join(tempDir, '.ubml');
    mkdirSync(ubmlDir, { recursive: true });
    const cachePath = join(ubmlDir, 'id-cache.json');
    writeFileSync(cachePath, JSON.stringify({
      version: 1,
      maxIds: stats,
    }, null, 2));
  }

  /**
   * Helper to read cache file
   */
  function readCacheFile(): IdStats | undefined {
    const cachePath = join(tempDir, '.ubml', 'id-cache.json');
    if (!existsSync(cachePath)) return undefined;
    const content = JSON.parse(readFileSync(cachePath, 'utf8'));
    return content.maxIds;
  }

  describe('readIdStats', () => {
    it('should return undefined when cache does not exist', () => {
      const stats = readIdStats(tempDir);
      expect(stats).toBeUndefined();
    });

    it('should read valid cache file', () => {
      createCacheFile({ AC: 5, PR: 10 });
      const stats = readIdStats(tempDir);
      expect(stats).toEqual({ AC: 5, PR: 10 });
    });

    it('should return undefined for invalid cache format', () => {
      const ubmlDir = join(tempDir, '.ubml');
      mkdirSync(ubmlDir, { recursive: true });
      const cachePath = join(ubmlDir, 'id-cache.json');
      writeFileSync(cachePath, 'invalid json');
      
      const stats = readIdStats(tempDir);
      expect(stats).toBeUndefined();
    });

    it('should return undefined for wrong cache version', () => {
      const ubmlDir = join(tempDir, '.ubml');
      mkdirSync(ubmlDir, { recursive: true });
      const cachePath = join(ubmlDir, 'id-cache.json');
      writeFileSync(cachePath, JSON.stringify({
        version: 2,
        maxIds: { AC: 5 },
      }));
      
      const stats = readIdStats(tempDir);
      expect(stats).toBeUndefined();
    });
  });

  describe('writeIdStats', () => {
    it('should create .ubml directory if it does not exist', () => {
      createWorkspaceFile();
      writeIdStats(tempDir, { AC: 5 });
      
      expect(existsSync(join(tempDir, '.ubml'))).toBe(true);
    });

    it('should write cache file with correct format', () => {
      createWorkspaceFile();
      writeIdStats(tempDir, { AC: 5, PR: 10 });
      
      const cache = readCacheFile();
      expect(cache).toEqual({ AC: 5, PR: 10 });
    });

    it('should merge with existing cache (keep higher values)', () => {
      createWorkspaceFile();
      createCacheFile({ AC: 10, PR: 5 });
      
      writeIdStats(tempDir, { AC: 5, PR: 10, ST: 15 });
      
      const cache = readCacheFile();
      expect(cache).toEqual({ AC: 10, PR: 10, ST: 15 });
    });

    it('should not decrease existing values', () => {
      createWorkspaceFile();
      createCacheFile({ AC: 20 });
      
      writeIdStats(tempDir, { AC: 10 });
      
      const cache = readCacheFile();
      expect(cache).toEqual({ AC: 20 });
    });
  });

  describe('scanWorkspaceIds', () => {
    it('should find no IDs in empty workspace', () => {
      createWorkspaceFile();
      
      const scan = scanWorkspaceIds(tempDir);
      
      expect(scan.totalCount).toBe(0);
      expect(scan.filesScanned).toBe(1);
    });

    it('should find IDs in process file', () => {
      createWorkspaceFile();
      createFileWithIds('process.ubml.yaml', {
        processes: {
          PR00001: { name: 'Process 1' },
          PR00002: { name: 'Process 2' },
        },
      });
      
      const scan = scanWorkspaceIds(tempDir);
      
      expect(scan.totalCount).toBe(2);
      expect(scan.idsByPrefix.get('PR')?.size).toBe(2);
      expect(scan.idsByPrefix.get('PR')?.has('PR00001')).toBe(true);
      expect(scan.idsByPrefix.get('PR')?.has('PR00002')).toBe(true);
    });

    it('should find IDs across multiple files', () => {
      createWorkspaceFile();
      createFileWithIds('process.ubml.yaml', {
        processes: {
          PR00001: { name: 'Process 1' },
        },
      });
      createFileWithIds('actors.ubml.yaml', {
        actors: {
          AC00001: { name: 'Actor 1' },
          AC00002: { name: 'Actor 2' },
        },
      });
      
      const scan = scanWorkspaceIds(tempDir);
      
      expect(scan.totalCount).toBe(3);
      expect(scan.idsByPrefix.get('PR')?.size).toBe(1);
      expect(scan.idsByPrefix.get('AC')?.size).toBe(2);
    });

    it('should find nested IDs in steps', () => {
      createWorkspaceFile();
      createFileWithIds('process.ubml.yaml', {
        processes: {
          PR00001: {
            name: 'Process 1',
            steps: {
              ST00001: { name: 'Step 1' },
              ST00002: { name: 'Step 2' },
            },
          },
        },
      });
      
      const scan = scanWorkspaceIds(tempDir);
      
      expect(scan.totalCount).toBe(3); // 1 process + 2 steps
      expect(scan.idsByPrefix.get('PR')?.size).toBe(1);
      expect(scan.idsByPrefix.get('ST')?.size).toBe(2);
    });

    it('should handle invalid YAML files gracefully', () => {
      createWorkspaceFile();
      writeFileSync(join(tempDir, 'invalid.ubml.yaml'), 'invalid: yaml: content:');
      
      const scan = scanWorkspaceIds(tempDir);
      
      // Should not throw, just skip the invalid file
      expect(scan.filesScanned).toBeGreaterThanOrEqual(1);
    });
  });

  describe('getNextAvailableId', () => {
    it('should generate first ID when no cache and no files', () => {
      createWorkspaceFile();
      
      const { id, usedStats } = getNextAvailableId('AC', tempDir, { updateStats: false });
      
      expect(id).toBe('AC01000'); // Default addOffset is 1000
      expect(usedStats).toBe(false);
    });

    it('should use cache when available', () => {
      createWorkspaceFile();
      createCacheFile({ AC: 1050 });
      
      const { id, usedStats } = getNextAvailableId('AC', tempDir, { updateStats: false });
      
      expect(id).toBe('AC01060'); // Rounded to next multiple of 10
      expect(usedStats).toBe(true);
    });

    it('should scan files when cache is missing', () => {
      createWorkspaceFile();
      createFileWithIds('actors.ubml.yaml', {
        actors: {
          AC01020: { name: 'Actor 1' },
        },
      });
      
      const { id, usedStats } = getNextAvailableId('AC', tempDir, { updateStats: false });
      
      expect(id).toBe('AC01030'); // Next multiple of 10 after 1020
      expect(usedStats).toBe(false);
    });

    it('should update cache when updateStats is true', () => {
      createWorkspaceFile();
      
      getNextAvailableId('AC', tempDir, { updateStats: true });
      
      const cache = readCacheFile();
      expect(cache).toBeDefined();
      expect(cache?.AC).toBe(1000);
    });

    it('should respect useGaps option', () => {
      createWorkspaceFile();
      createCacheFile({ AC: 1005 });
      
      const withGaps = getNextAvailableId('AC', tempDir, { useGaps: true, updateStats: false });
      expect(withGaps.id).toBe('AC01010'); // Rounded to 10
      
      const withoutGaps = getNextAvailableId('AC', tempDir, { useGaps: false, updateStats: false });
      expect(withoutGaps.id).toBe('AC01006'); // Exactly next
    });

    it('should respect minStart option', () => {
      createWorkspaceFile();
      
      const { id } = getNextAvailableId('AC', tempDir, { minStart: 2000, updateStats: false });
      
      expect(id).toBe('AC02000');
    });
  });

  describe('getNextAvailableIds', () => {
    it('should generate multiple IDs for same prefix', () => {
      createWorkspaceFile();
      
      const ids = getNextAvailableIds([{ prefix: 'AC', count: 3 }], tempDir, { updateStats: false });
      
      const acIds = ids.get('AC');
      expect(acIds).toBeDefined();
      expect(acIds?.length).toBe(3);
      expect(acIds).toEqual(['AC01000', 'AC01010', 'AC01020']);
    });

    it('should generate IDs for multiple prefixes', () => {
      createWorkspaceFile();
      
      const ids = getNextAvailableIds([
        { prefix: 'AC', count: 2 },
        { prefix: 'PR', count: 2 },
      ], tempDir, { updateStats: false });
      
      expect(ids.get('AC')).toEqual(['AC01000', 'AC01010']);
      expect(ids.get('PR')).toEqual(['PR01000', 'PR01010']);
    });

    it('should use cache when available', () => {
      createWorkspaceFile();
      createCacheFile({ AC: 1050 });
      
      const ids = getNextAvailableIds([{ prefix: 'AC', count: 2 }], tempDir, { updateStats: false });
      
      expect(ids.get('AC')).toEqual(['AC01060', 'AC01070']);
    });

    it('should update cache when updateStats is true', () => {
      createWorkspaceFile();
      
      getNextAvailableIds([{ prefix: 'AC', count: 3 }], tempDir, { updateStats: true });
      
      const cache = readCacheFile();
      expect(cache?.AC).toBe(1020); // Last generated ID
    });

    it('should respect useGaps option', () => {
      createWorkspaceFile();
      createCacheFile({ AC: 1000 });
      
      const withGaps = getNextAvailableIds([{ prefix: 'AC', count: 3 }], tempDir, { useGaps: true, updateStats: false });
      expect(withGaps.get('AC')).toEqual(['AC01010', 'AC01020', 'AC01030']);
      
      const withoutGaps = getNextAvailableIds([{ prefix: 'AC', count: 3 }], tempDir, { useGaps: false, updateStats: false });
      expect(withoutGaps.get('AC')).toEqual(['AC01001', 'AC01002', 'AC01003']);
    });
  });

  describe('syncIdStats', () => {
    it('should sync cache from files', () => {
      createWorkspaceFile();
      createFileWithIds('actors.ubml.yaml', {
        actors: {
          AC01020: { name: 'Actor 1' },
          AC01030: { name: 'Actor 2' },
        },
      });
      createFileWithIds('process.ubml.yaml', {
        processes: {
          PR01050: { name: 'Process 1' },
        },
      });
      
      const stats = syncIdStats(tempDir);
      
      expect(stats).toEqual({ AC: 1030, PR: 1050 });
      
      // Verify cache was written
      const cache = readCacheFile();
      expect(cache).toEqual({ AC: 1030, PR: 1050 });
    });

    it('should handle empty workspace', () => {
      createWorkspaceFile();
      
      const stats = syncIdStats(tempDir);
      
      expect(stats).toEqual({});
    });

    it('should update existing cache', () => {
      createWorkspaceFile();
      createCacheFile({ AC: 1000 });
      createFileWithIds('actors.ubml.yaml', {
        actors: {
          AC01050: { name: 'Actor 1' },
        },
      });
      
      syncIdStats(tempDir);
      
      const cache = readCacheFile();
      expect(cache?.AC).toBe(1050);
    });
  });

  describe('checkIdConflict', () => {
    it('should return false for non-existent ID', () => {
      createWorkspaceFile();
      createFileWithIds('actors.ubml.yaml', {
        actors: {
          AC01000: { name: 'Actor 1' },
        },
      });
      
      const hasConflict = checkIdConflict('AC01010', tempDir);
      
      expect(hasConflict).toBe(false);
    });

    it('should return true for existing ID', () => {
      createWorkspaceFile();
      createFileWithIds('actors.ubml.yaml', {
        actors: {
          AC01000: { name: 'Actor 1' },
        },
      });
      
      const hasConflict = checkIdConflict('AC01000', tempDir);
      
      expect(hasConflict).toBe(true);
    });

    it('should return false for invalid ID', () => {
      createWorkspaceFile();
      
      const hasConflict = checkIdConflict('INVALID', tempDir);
      
      expect(hasConflict).toBe(false);
    });
  });

  describe('cache file format', () => {
    it('should create properly formatted cache file', () => {
      createWorkspaceFile();
      writeIdStats(tempDir, { AC: 1000, PR: 2000 });
      
      const cachePath = join(tempDir, '.ubml', 'id-cache.json');
      const content = JSON.parse(readFileSync(cachePath, 'utf8'));
      
      expect(content).toEqual({
        version: 1,
        maxIds: {
          AC: 1000,
          PR: 2000,
        },
      });
    });

    it('should be human-readable JSON', () => {
      createWorkspaceFile();
      writeIdStats(tempDir, { AC: 1000 });
      
      const cachePath = join(tempDir, '.ubml', 'id-cache.json');
      const content = readFileSync(cachePath, 'utf8');
      
      // Should be pretty-printed
      expect(content).toContain('\n');
      expect(content).toContain('  ');
    });
  });
});
