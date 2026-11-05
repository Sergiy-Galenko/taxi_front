import js from '@eslint/js';
import tseslint from 'typescript-eslint';
export default tseslint.config(
  { ignores: ['node_modules/**', 'dist/**', 'coverage/**', 'ios/**', 'android/**', '.expo/**'] },
  { files: ['jest*.js'], languageOptions: { globals: { jest: 'readonly' } }, rules: { '@typescript-eslint/no-require-imports': 'off' } },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: { globals: { module: 'readonly', require: 'readonly', process: 'readonly', __DEV__: 'readonly', console: 'readonly', alert: 'readonly', fetch: 'readonly', setTimeout: 'readonly', clearTimeout: 'readonly', URL: 'readonly', AbortController: 'readonly', Headers: 'readonly', atob: 'readonly' } },
    rules: { '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }] },
  },
  { files: ['**/__tests__/**', 'jest*.js'], languageOptions: { globals: { jest: 'readonly', test: 'readonly', expect: 'readonly', afterEach: 'readonly', beforeEach: 'readonly' } }, rules: { '@typescript-eslint/no-require-imports': 'off' } },
);
