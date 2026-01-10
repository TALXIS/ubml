/**
 * UBML ID Scanner (Node.js)
 * 
 * Manages ID sequences for UBML workspaces.
 * 
 * Uses workspace-stored idStats (like database sequences) for fast next-ID
 * generation. Falls back to file scanning when stats are missing.
 */

import { readdirSync, readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';
import {
  ID_CONFIG,
  ID_PREFIXES,
  formatId,
  parseIdNumber,
  getIdPrefix,
  isValidId,
  type IdPrefix,
} from '../generated/metadata.js';

/**
 * ID statistics stored in workspace document.
 * Maps prefix to highest used ID number.
 */
export type IdStats = Partial<Record<IdPrefix, number>>;

/**
 * Result of scanning a workspace for IDs.
 */
export interface WorkspaceIdScan {
  /** All existing IDs grouped by prefix */
  idsByPrefix: Map<IdPrefix, Set<string>>;
  /** Total number of IDs found */
  totalCount: number;
  /** Files scanned */
  filesScanned: number;
}

/**
 * Find the workspace file in a directory.
 * Returns the path to the workspace file, or undefined if not found.
 */
export function findWorkspaceFile(dir: string): string | undefined {
  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isFile() && entry.name.endsWith('.workspace.ubml.yaml')) {
        return join(dir, entry.name);
      }
    }
    // Also check for workspace.ubml.yaml without prefix
    for (const entry of entries) {
      if (entry.isFile() && entry.name === 'workspace.ubml.yaml') {
        return join(dir, entry.name);
      }
    }
  } catch {
    // Directory doesn't exist or can't be read
  }
  return undefined;
}

/**
 * Read idStats from the workspace document.
 * Returns undefined if workspace file doesn't exist or has no idStats.
 */
export function readIdStats(dir: string): IdStats | undefined {
  const workspaceFile = findWorkspaceFile(dir);
  if (!workspaceFile) return undefined;
  
  try {
    const content = readFileSync(workspaceFile, 'utf8');
    const parsed = parseYaml(content) as Record<string, unknown>;
    if (parsed && typeof parsed.idStats === 'object' && parsed.idStats !== null) {
      return parsed.idStats as IdStats;
    }
  } catch {
    // File can't be read or parsed
  }
  return undefined;
}

/**
 * Write idStats to the workspace document.
 * Creates or updates the idStats property.
 */
export function writeIdStats(dir: string, stats: IdStats): boolean {
  const workspaceFile = findWorkspaceFile(dir);
  if (!workspaceFile) return false;
  
  try {
    const content = readFileSync(workspaceFile, 'utf8');
    const parsed = parseYaml(content) as Record<string, unknown>;
    
    // Merge with existing stats (only update, don't remove)
    const existingStats = (parsed.idStats as IdStats) ?? {};
    const mergedStats: IdStats = { ...existingStats };
    for (const [prefix, value] of Object.entries(stats)) {
      const existingValue = mergedStats[prefix as IdPrefix] ?? 0;
      if (value !== undefined && value > existingValue) {
        mergedStats[prefix as IdPrefix] = value;
      }
    }
    
    parsed.idStats = mergedStats;
    
    // Write back with preserved formatting
    const newContent = stringifyYaml(parsed, { lineWidth: 0 });
    writeFileSync(workspaceFile, newContent, 'utf8');
    return true;
  } catch {
    return false;
  }
}

/**
 * Recursively extract all IDs from a YAML structure.
 */
function extractIdsFromContent(content: unknown): Set<string> {
  const ids = new Set<string>();

  function traverse(value: unknown): void {
    if (value && typeof value === 'object') {
      if (Array.isArray(value)) {
        for (const item of value) {
          traverse(item);
        }
      } else {
        for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
          // Check if key is an ID
          if (isValidId(key)) {
            ids.add(key);
          }
          traverse(val);
        }
      }
    }
  }

  traverse(content);
  return ids;
}

/**
 * Scan a workspace directory for all existing UBML IDs.
 * 
 * @param dir - The workspace directory to scan
 * @returns Map of prefix to set of existing IDs
 */
export function scanWorkspaceIds(dir: string): WorkspaceIdScan {
  const idsByPrefix = new Map<IdPrefix, Set<string>>();
  let totalCount = 0;
  let filesScanned = 0;

  // Initialize empty sets for all prefixes
  for (const prefix of Object.keys(ID_PREFIXES) as IdPrefix[]) {
    idsByPrefix.set(prefix, new Set());
  }

  // Find all UBML files
  function scanDirectory(currentDir: string): void {
    try {
      const entries = readdirSync(currentDir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = join(currentDir, entry.name);
        
        if (entry.isDirectory() && !entry.name.startsWith('.')) {
          scanDirectory(fullPath);
        } else if (entry.isFile() && entry.name.endsWith('.ubml.yaml')) {
          try {
            const content = readFileSync(fullPath, 'utf8');
            const parsed = parseYaml(content);
            const ids = extractIdsFromContent(parsed);
            
            for (const id of ids) {
              const prefix = getIdPrefix(id);
              if (prefix) {
                idsByPrefix.get(prefix)?.add(id);
                totalCount++;
              }
            }
            filesScanned++;
          } catch {
            // Skip files that can't be parsed
          }
        }
      }
    } catch {
      // Directory doesn't exist or can't be read
    }
  }

  scanDirectory(dir);

  return { idsByPrefix, totalCount, filesScanned };
}

/**
 * Get the next available ID for a prefix in a workspace.
 * 
 * Uses workspace idStats for fast lookup when available.
 * Falls back to file scanning when stats are missing.
 * 
 * @param prefix - The ID prefix (e.g., 'AC', 'PR')
 * @param dir - The workspace directory to scan
 * @param options - Options for ID generation
 * @returns The next available ID and whether stats were used
 */
export function getNextAvailableId(
  prefix: IdPrefix,
  dir: string,
  options: { 
    /** Use gaps of 10 for easier insertion */
    useGaps?: boolean;
    /** Minimum starting number (defaults to addOffset) */
    minStart?: number;
    /** Update workspace idStats after generating ID */
    updateStats?: boolean;
  } = {}
): { id: string; usedStats: boolean } {
  const { useGaps = true, minStart = ID_CONFIG.addOffset, updateStats = true } = options;
  
  // Try to use workspace stats first (fast path)
  const stats = readIdStats(dir);
  let maxNum: number;
  let usedStats = false;
  
  if (stats && typeof stats[prefix] === 'number') {
    // Use stored stats - assert type since we just checked
    maxNum = stats[prefix] as number;
    usedStats = true;
  } else {
    // Fall back to scanning (slow path)
    const scan = scanWorkspaceIds(dir);
    const existingIds = scan.idsByPrefix.get(prefix) ?? new Set();
    
    // Find the highest existing ID number
    maxNum = 0;
    for (const id of existingIds) {
      const num = parseIdNumber(id);
      if (num !== undefined && num > maxNum) {
        maxNum = num;
      }
    }
  }
  
  // Calculate next number
  let nextNum: number;
  if (maxNum === 0) {
    // No existing IDs, start from minStart
    nextNum = minStart;
  } else if (useGaps) {
    // Round up to next multiple of 10
    nextNum = Math.ceil((maxNum + 1) / 10) * 10;
    // Ensure we're at least at minStart
    if (nextNum < minStart) {
      nextNum = minStart;
    }
  } else {
    nextNum = maxNum + 1;
    if (nextNum < minStart) {
      nextNum = minStart;
    }
  }
  
  const id = formatId(prefix, nextNum);
  
  // Update workspace stats
  if (updateStats) {
    const newMaxNum = parseIdNumber(id) ?? nextNum;
    writeIdStats(dir, { [prefix]: newMaxNum } as IdStats);
  }
  
  return { id, usedStats };
}

/**
 * Get a batch of next available IDs for multiple prefixes.
 * Useful when creating a template that needs multiple IDs.
 * 
 * Uses workspace idStats for fast lookup when available.
 * 
 * @param prefixes - Array of prefixes and counts needed
 * @param dir - The workspace directory to scan
 * @returns Map of prefix to array of available IDs
 */
export function getNextAvailableIds(
  prefixes: { prefix: IdPrefix; count: number }[],
  dir: string,
  options: { useGaps?: boolean; updateStats?: boolean } = {}
): Map<IdPrefix, string[]> {
  const { useGaps = true, updateStats = true } = options;
  const stats = readIdStats(dir);
  const result = new Map<IdPrefix, string[]>();
  const newStats: IdStats = {};
  
  // Only scan if we don't have stats for at least one prefix
  let scan: WorkspaceIdScan | undefined;
  
  for (const { prefix, count } of prefixes) {
    const ids: string[] = [];
    let maxNum: number;
    
    if (stats && typeof stats[prefix] === 'number') {
      // Use stored stats - assert type since we just checked
      maxNum = stats[prefix] as number;
    } else {
      // Fall back to scanning
      if (!scan) {
        scan = scanWorkspaceIds(dir);
      }
      const existingIds = scan.idsByPrefix.get(prefix) ?? new Set();
      maxNum = 0;
      for (const id of existingIds) {
        const num = parseIdNumber(id);
        if (num !== undefined && num > maxNum) {
          maxNum = num;
        }
      }
    }
    
    // Start from appropriate position
    let nextNum = maxNum === 0 ? ID_CONFIG.addOffset : (useGaps ? Math.ceil((maxNum + 1) / 10) * 10 : maxNum + 1);
    if (nextNum < ID_CONFIG.addOffset) {
      nextNum = ID_CONFIG.addOffset;
    }
    
    // Generate the requested number of IDs
    for (let i = 0; i < count; i++) {
      const id = formatId(prefix, nextNum);
      ids.push(id);
      nextNum += useGaps ? 10 : 1;
    }
    
    result.set(prefix, ids);
    
    // Track highest generated number for stats update
    if (ids.length > 0) {
      const lastId = ids[ids.length - 1];
      const lastNum = parseIdNumber(lastId);
      if (lastNum !== undefined) {
        newStats[prefix] = lastNum;
      }
    }
  }
  
  // Update workspace stats
  if (updateStats && Object.keys(newStats).length > 0) {
    writeIdStats(dir, newStats);
  }
  
  return result;
}

/**
 * Sync idStats from actual file contents.
 * Use this to initialize stats or recover from inconsistencies.
 * 
 * @param dir - The workspace directory to scan
 * @returns The synced stats, or undefined if no workspace file
 */
export function syncIdStats(dir: string): IdStats | undefined {
  const workspaceFile = findWorkspaceFile(dir);
  if (!workspaceFile) return undefined;
  
  // Scan all files to find actual IDs
  const scan = scanWorkspaceIds(dir);
  const stats: IdStats = {};
  
  // Find max for each prefix
  for (const [prefix, ids] of scan.idsByPrefix.entries()) {
    let maxNum = 0;
    for (const id of ids) {
      const num = parseIdNumber(id);
      if (num !== undefined && num > maxNum) {
        maxNum = num;
      }
    }
    if (maxNum > 0) {
      stats[prefix] = maxNum;
    }
  }
  
  // Write to workspace
  if (Object.keys(stats).length > 0) {
    writeIdStats(dir, stats);
  }
  
  return stats;
}

/**
 * Check if an ID would conflict with existing IDs in the workspace.
 * 
 * @param id - The ID to check
 * @param dir - The workspace directory to scan
 * @returns True if the ID already exists
 */
export function checkIdConflict(id: string, dir: string): boolean {
  const prefix = getIdPrefix(id);
  if (!prefix) return false;
  
  const scan = scanWorkspaceIds(dir);
  return scan.idsByPrefix.get(prefix)?.has(id) ?? false;
}
