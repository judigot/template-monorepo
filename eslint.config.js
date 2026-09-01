import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import noTypeAssertion from 'eslint-plugin-no-type-assertion';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
  globalIgnores([
    // Build and output directories
    '**/dist/**',
    '**/.next/**',
    '**/node_modules/**',
    '**/.turbo/**',
    '**/coverage/**',

    // Generated Vercel Function bundle (placeholder is overwritten by builds)
    'apps/api/api/**',
    '**/playwright-report/**',
    '**/test-results/**',

    // Config files outside the per-workspace TypeScript projects
    '**/eslint.config.js',
    '**/vite.config.ts',
    '**/postcss.config.mjs',
  ]),

  /*
   * Main TypeScript/React configuration. ESLint is the strictest, final
   * judge in the lint chain (Oxlint -> Biome -> ESLint); it owns the
   * type-aware rules that Biome and Oxlint cannot provide yet.
   */
  {
    files: ['**/*.{ts,tsx}'],

    plugins: {
      react,
      'no-type-assertion': noTypeAssertion,
      'react-hooks': reactHooks,
    },

    extends: [
      js.configs.recommended,
      tseslint.configs.recommendedTypeChecked,
      tseslint.configs.strictTypeChecked,
      tseslint.configs.stylisticTypeChecked,
    ],

    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parser: tseslint.parser,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        /* Resolves each file through its workspace tsconfig.json. */
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },

    settings: {
      react: {
        version: 'detect',
      },
    },

    rules: {
      // Code style rules
      curly: ['error', 'all'],
      'object-shorthand': ['error', 'always'],

      // Type safety rules
      'no-type-assertion/no-type-assertion': 'error',

      // React-specific rules
      'react/react-in-jsx-scope': 'off',
      'react/jsx-props-no-spreading': 'error',
      'react/jsx-filename-extension': [1, { extensions: ['.tsx'] }],
      'react/jsx-pascal-case': 'error',

      // React Hooks rules
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',

      // Restricted syntax
      'no-restricted-syntax': [
        'error',
        {
          selector: 'TSEnumDeclaration',
          message: 'Enums are not allowed. Use object literals instead.',
        },
      ],

      // Console and debugging
      'no-alert': ['error'],
      'no-console': ['error', { allow: ['warn', 'error'] }],

      // TypeScript-specific rules
      '@typescript-eslint/no-unnecessary-boolean-literal-compare': ['error'],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/strict-boolean-expressions': 'error',

      // Unused variables (TypeScript version)
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],

      // Naming conventions
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'function',
          format: ['camelCase', 'PascalCase'],
        },
        {
          selector: 'class',
          format: ['PascalCase'],
        },
        {
          selector: 'typeLike',
          format: ['PascalCase'],
        },
        {
          selector: 'interface',
          format: ['PascalCase'],
          prefix: ['I'],
        },
      ],
    },
  },

  /*
   * React Refresh only applies to the Vite app; Next.js has its own
   * fast-refresh mechanism with different export conventions.
   */
  {
    files: ['apps/vite/src/**/*.tsx'],
    extends: [reactRefresh.configs.vite],
    rules: {
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },

  /*
   * Declaration files augment externally defined ambient types (e.g.
   * Vite's ImportMetaEnv), whose names cannot follow the I-prefix rule.
   */
  {
    files: ['**/*.d.ts'],
    rules: {
      '@typescript-eslint/naming-convention': 'off',
    },
  },

  /*
   * Tests mock Web APIs (e.g. fetch); assertions at that boundary are
   * accepted, mirroring the scaffolder's test overrides.
   */
  {
    files: ['**/test/**'],
    rules: {
      'no-type-assertion/no-type-assertion': 'off',
      'no-console': 'off',
    },
  },
]);
