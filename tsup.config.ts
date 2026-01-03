import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    'index': 'src/index.ts',
    'parser/index': 'src/parser/index.ts',
    'validator/index': 'src/validator/index.ts',
    'serializer/index': 'src/serializer/index.ts',
    'eslint/index': 'src/eslint/index.ts',
    'cli': 'bin/ubml.ts',
  },
  format: ['esm'],
  dts: true,
  splitting: false,
  clean: true,
  shims: true,
});
