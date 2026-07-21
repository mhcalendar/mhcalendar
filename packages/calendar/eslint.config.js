import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import stencil from '@stencil/eslint-plugin';
import prettier from 'eslint-config-prettier';
import { sharedRules } from '../../eslint.config.base.js';

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
      ...sharedRules,
      'react/react-in-jsx-scope': 'off',
    },
  },

  prettier,
];
