// Shared rule set for all packages/* eslint.config.js files. Kept free of imports so
// each package resolves eslint/typescript-eslint/prettier against its OWN devDependency
// versions instead of the repo root's hoisted ones (avoids version drift between packages).
export const sharedRules = {
  '@typescript-eslint/no-explicit-any': 'off',
  '@typescript-eslint/no-empty-object-type': 'off',
  '@typescript-eslint/no-unsafe-function-type': 'off',

  // --- Stencil JSX fix (IMPORTANT)
  '@typescript-eslint/no-unused-vars': [
    'error',
    {
      varsIgnorePattern: '^h$|^_$',
      argsIgnorePattern: '^_',
      caughtErrorsIgnorePattern: '^_',
      ignoreRestSiblings: true,
    },
  ],

  'no-case-declarations': 'off',
  'no-prototype-builtins': 'off',

  'prefer-const': 'warn',
};
