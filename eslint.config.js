const js = require('@eslint/js');
const tseslint = require('@typescript-eslint/eslint-plugin');
const tsparser = require('@typescript-eslint/parser');
const prettierConfig = require('eslint-config-prettier');

module.exports = [
  js.configs.recommended,
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parser: tsparser,
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: {
        console: 'readonly',
        chrome: 'readonly',
        navigator: 'readonly',
        document: 'readonly',
        window: 'readonly',
        URL: 'readonly',
        Blob: 'readonly',
        Audio: 'readonly',
        HTMLElement: 'readonly',
        HTMLButtonElement: 'readonly',
        HTMLAudioElement: 'readonly',
        MutationObserver: 'readonly',
        IDBDatabase: 'readonly',
        IDBTransaction: 'readonly',
        IDBObjectStore: 'readonly',
        IDBRequest: 'readonly',
        indexedDB: 'readonly',
        MediaRecorder: 'readonly',
        alert: 'readonly',
        clearTimeout: 'readonly',
        setTimeout: 'readonly',
        Event: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      ...prettierConfig.rules,
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
];
