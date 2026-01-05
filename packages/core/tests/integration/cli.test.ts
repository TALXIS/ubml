/**
 * CLI integration tests
 */

import { describe, it, expect } from 'vitest';
import { createProgram } from '../../src/cli/index.js';
import type { Command } from 'commander';

describe('CLI', () => {
  describe('createProgram', () => {
    it('should create a CLI program', () => {
      const program = createProgram();
      expect(program.name()).toBe('ubml');
    });

    it('should have validate command', () => {
      const program = createProgram();
      const validateCmd = program.commands.find((cmd: Command) => cmd.name() === 'validate');
      expect(validateCmd).toBeDefined();
    });

    it('should have init command', () => {
      const program = createProgram();
      const initCmd = program.commands.find((cmd: Command) => cmd.name() === 'init');
      expect(initCmd).toBeDefined();
    });
  });
});
