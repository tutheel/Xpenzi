import path from 'node:path';
import { fileURLToPath } from 'node:url';

import js from '@eslint/js';
import nextPlugin from '@next/eslint-plugin-next';
import tseslint from 'typescript-eslint';

const projectDir = path.dirname(fileURLToPath(import.meta.url));
const tsFileGlobs = ['**/*.ts', '**/*.tsx', '**/*.mts', '**/*.cts'];

const strictTypeCheckedConfigs = tseslint.configs.strictTypeChecked.map((config) => ({
  ...config,
  files: config.files ?? tsFileGlobs,
  ignores: [...(config.ignores ?? []), '**/*.config.{ts,cts,mts}'],
  languageOptions: {
    ...config.languageOptions,
    parserOptions: {
      ...(config.languageOptions?.parserOptions ?? {}),
      projectService: true,
      tsconfigRootDir: projectDir,
    },
  },
}));

const stylisticTypeCheckedConfigs = tseslint.configs.stylisticTypeChecked.map((config) => ({
  ...config,
  files: config.files ?? tsFileGlobs,
  ignores: [...(config.ignores ?? []), '**/*.config.{ts,cts,mts}'],
}));

export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/.next/**',
      '**/.turbo/**',
      '**/coverage/**',
      '**/pnpm-lock.yaml',
      '**/*.min.*',
      '**/vitest.config.ts',
      '**/vitest.setup.ts',
      'apps/web/tailwind.config.ts',
    ],
  },
  js.configs.recommended,
  ...strictTypeCheckedConfigs,
  ...stylisticTypeCheckedConfigs,
  {
    files: tsFileGlobs,
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          disallowTypeAnnotations: false,
        },
      ],
    },
  },
  {
    files: ['apps/web/**/*.{ts,tsx,js,jsx}'],
    plugins: {
      '@next/next': nextPlugin,
    },
    rules: {
      ...nextPlugin.configs['core-web-vitals'].rules,
    },
  },
  {
    files: ['**/*.config.{ts,cts,mts}'],
    languageOptions: {
      parserOptions: {
        projectService: false,
      },
    },
    rules: {
      '@typescript-eslint/await-thenable': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-misused-promises': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
    },
  },
);




