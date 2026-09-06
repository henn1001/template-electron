import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import-x';
import vuePlugin from 'eslint-plugin-vue';
import prettierConfig from 'eslint-config-prettier';
import globals from 'globals';

const importRecommended = importPlugin.configs.recommended;
const importElectron = importPlugin.configs.electron;
const importTypescript = importPlugin.configs.typescript;

export default [
  js.configs.recommended,
  ...tseslint.configs['flat/recommended'],
  {
    files: ['**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts,vue}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      'import-x': importPlugin,
    },
    settings: {
      ...importElectron.settings,
      ...importTypescript.settings,
    },
    rules: {
      ...importRecommended.rules,
      ...importTypescript.rules,
      'import-x/no-unresolved': ['error', { ignore: ['^vite$', '^@vitejs/plugin-vue$'] }],
    },
  },
  ...vuePlugin.configs['flat/base'],
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: tsParser,
      },
    },
  },
  // Must be last: disables ESLint formatting rules in favour of Prettier.
  prettierConfig,
];
