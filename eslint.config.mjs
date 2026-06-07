import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import globals from 'globals';
import playwright from 'eslint-plugin-playwright';
import tseslint from 'typescript-eslint';

export default [
  {
    ignores: [
      'node_modules/**',
      '.opencode/**',
      '.playwright-cli/**',
      'playwright-report/**',
      'test-results/**',
      'artifacts/**/runs/**',
      'artifacts/**/evidence/**',
      '.agent-logs/**',
      'coverage/**',
    ],
  },

  js.configs.recommended,

  {
    files: ['scripts/**/*.mjs', '.codex/hooks/**/*.mjs'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
    rules: {
      'no-console': 'off',
    },
  },

  ...tseslint.configs.recommended.map((config) => ({
    ...config,
    files: ['*.ts', 'tests/**/*.ts'],
  })),

  {
    files: ['playwright.config.ts', 'seed.spec.ts', 'tests/**/*.ts'],
    ...playwright.configs['flat/recommended'],
    rules: {
      ...playwright.configs['flat/recommended'].rules,
    },
  },

  eslintConfigPrettier,
];
