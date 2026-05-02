import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import stencil from '@stencil/eslint-plugin';
import prettier from 'eslint-config-prettier';

export default [
  // -------------------------
  // ignores (ESLint 9+ way)
  // -------------------------
  {
    ignores: ['dist', 'www', 'build', 'node_modules', './src/components.d.ts'],
  },

  // -------------------------
  // base JS rules
  // -------------------------
  js.configs.recommended,

  // -------------------------
  // TypeScript rules
  // -------------------------
  ...tseslint.configs.recommended,

  // -------------------------
  // Stencil plugin
  // -------------------------
  {
    plugins: {
      '@stencil': stencil,
    },
  },

  // -------------------------
  // TS / TSX rules (main app)
  // -------------------------
  {
    files: ['**/*.ts', '**/*.tsx'],

    languageOptions: {
      parser: tseslint.parser,
    },

    rules: {
      // --- core safety
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

      // --- relax for reducers / switch cases
      'no-case-declarations': 'off',
      'no-prototype-builtins': 'off',

      // --- allow const flexibility in reducers
      'prefer-const': 'warn',

      // --- React rule (Stencil JSX compatibility)
      'react/react-in-jsx-scope': 'off',
    },
  },

  // -------------------------
  // Prettier (must be last)
  // -------------------------
  prettier,
];
