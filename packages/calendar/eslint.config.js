import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import stencil from '@stencil/eslint-plugin';
import prettier from 'eslint-config-prettier';

export default [
  {
    ignores: ['dist', 'build', 'node_modules', './src/components.d.ts'],
  },

  js.configs.recommended,

  ...tseslint.configs.recommended,

  {
    plugins: {
      '@stencil': stencil,
    },
  },

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

      'no-case-declarations': 'off',
      'no-prototype-builtins': 'off',

      'prefer-const': 'warn',

      'react/react-in-jsx-scope': 'off',
    },
  },

  prettier,
];
