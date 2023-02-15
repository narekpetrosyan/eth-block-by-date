import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['__tests__/*.spec.ts'],
    testTimeout: 10000,
    cache: false,
  },
});
