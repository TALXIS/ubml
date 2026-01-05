import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.d.ts'],
    },
  },
  resolve: {
    extensions: ['.ts', '.js', '.mts', '.mjs'],
    alias: {
      // Allow .js imports to resolve to .ts files
      './generated/metadata.js': './src/generated/metadata.ts',
      './generated/bundled.js': './src/generated/bundled.ts',
    },
  },
});
