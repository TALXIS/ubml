/**
 * UBML TypeScript Types
 * 
 * Type-safe interfaces for working with UBML documents.
 * 
 * @module ubml
 * 
 * @example
 * ```typescript
 * import type { Process, Step, Actor, ProcessDocument } from 'ubml';
 * 
 * const process: Process = {
 *   id: 'PR001',
 *   name: 'Customer Onboarding',
 *   level: 3,
 *   steps: {
 *     ST001: {
 *       name: 'Receive Application',
 *       kind: 'task',
 *     }
 *   }
 * };
 * ```
 */

export * from './generated/types.js';
