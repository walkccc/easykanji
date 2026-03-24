import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import tseslint from 'typescript-eslint';

export default defineConfig(
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'dist/**',
      'out/**',
      'next-env.d.ts',
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../*'],
              message:
                'Use absolute imports (@/...) instead of relative imports.',
            },
            {
              group: [
                './*',
                '!./globals.css',
                '!./*.css',
                '!./*.scss',
                '!./*.sass',
              ],
              message:
                'Use absolute imports (@/...) instead of relative imports.',
            },
          ],
        },
      ],
    },
  },
);
