import { defineVitestConfig } from '@stencil/vitest/config';

// Browser project (real Playwright browser, e2e/visual regression) is intentionally
// left out for now — add it back with `@vitest/browser-playwright` + `playwright`
// once we actually need e2e coverage, per https://github.com/stenciljs/vitest.
export default defineVitestConfig({
  stencilConfig: './stencil.config.ts',
  test: {
    projects: [
      // Unit tests - node environment for pure functions / logic (no DOM)
      {
        test: {
          name: 'unit',
          include: ['src/**/*.unit.{ts,tsx}'],
          environment: 'node',
        },
      },
      // Spec tests - components rendered against Stencil's mock-doc DOM
      {
        test: {
          name: 'spec',
          include: ['src/**/*.spec.{ts,tsx}'],
          environment: 'stencil',
          setupFiles: ['./vitest-setup.ts'],
        },
      },
    ],
  },
});
