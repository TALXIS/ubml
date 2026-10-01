/**
 * Commands the CLI prints for a reader to type, run the way a reader types them.
 */

import { spawnSync } from 'child_process';
import { resolve } from 'path';

const bin = resolve(process.cwd(), 'dist', 'cli.js');

export interface Ran {
  command: string;
  cwd: string;
  status: number | null;
  output: string;
}

export function ubml(args: string[], cwd: string): Ran {
  const result = spawnSync('node', [bin, ...args], {
    cwd,
    encoding: 'utf8',
    env: { ...process.env, FORCE_COLOR: '0' },
  });
  return {
    command: `ubml ${args.join(' ')}`,
    cwd,
    status: result.status,
    output: `${result.stdout}${result.stderr}`,
  };
}

/** The commands printed after the line holding `from`, up to the first line matching `to`. */
export function printedCommands(output: string, from: string, to: RegExp = /^\s*$/): string[] {
  const lines = output.split(/\r?\n/);
  const start = lines.findIndex((line) => line.includes(from));
  if (start === -1) return [];
  const commands: string[] = [];
  for (const line of lines.slice(start + 1)) {
    if (commands.length > 0 && to.test(line)) break;
    const command = line.trim().replace(/\s+#.*$/, '').split(/\s{2,}/)[0];
    if (/^(ubml|cd|code)(\s|$)/.test(command)) commands.push(command);
  }
  return commands;
}

/** Run printed commands in order from `from`: `cd` moves on, `code` is skipped, placeholders are filled. */
export function runAsPrinted(commands: string[], from: string, fill: Record<string, string> = {}): Ran[] {
  let cwd = from;
  const ran: Ran[] = [];
  for (const command of commands) {
    const [head, ...args] = command.split(/\s+/);
    const filled = args.map((arg) =>
      Object.entries(fill).reduce((value, [placeholder, by]) => value.split(placeholder).join(by), arg),
    );
    if (head === 'cd') cwd = resolve(cwd, filled[0] ?? '.');
    else if (head === 'ubml') ran.push(ubml(filled, cwd));
  }
  return ran;
}
