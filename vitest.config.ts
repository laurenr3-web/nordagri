
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.js'],
    coverage: {
      provider: 'c8',
      reporter: ['text', 'json-summary', 'html'],
      reportsDirectory: './coverage',
      lines: 80,
      branches: 80,
      functions: 80,
      statements: 80,
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
