import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    'cli': 'src/cli.ts',
  },
  format: ['esm'],
  dts: true,
  splitting: false,
  clean: true,
  shims: true,
  outDir: 'dist',
});
