
import { defineConfig } from 'vitest/config';
import path from 'path';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'], // Add this line for global setup
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
