import { createRequire } from 'node:module';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import importPlugin from 'eslint-plugin-import';
import noTypeAssertion from 'eslint-plugin-no-type-assertion';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const require = createRequire(import.meta.url);

// Detect if this is a Next.js project by checking:
// 1. If 'next' is in package.json dependencies or devDependencies
// 2. If any Next.js config file exists (next.config.js, next.config.mjs, etc.)
// prettier-ignore
const isNextJs = (() => {
	try {
		const p = require(`${process.cwd()}/package.json`);
		return (
			"next" in (p.dependencies ?? {}) ||
			"next" in (p.devDependencies ?? {}) ||
			[
				"next.config.js",
				"next.config.mjs",
				"next.config.ts",
				"next.config.cjs",
			].some((f) => require("fs").existsSync(f))
		);
	} catch {
		return false;
	}
})();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Load and merge Next.js ESLint configs while resolving plugin conflicts.
 *
 * Next.js configs (core-web-vitals and typescript) export flat configs that include
 * their own plugin definitions. Some of these plugins conflict with plugins we
 * already define in our main config (e.g., @typescript-eslint).
 *
 * Strategy:
 * 1. Load both Next.js configs (core-web-vitals + typescript)
 * 2. Filter out conflicting plugins (listed in conflictingPlugins array)
 * 3. Keep non-conflicting plugins (e.g., @next/next) which we don't define elsewhere
 * 4. Merge the filtered configs with our main config
 *
 * To add more conflicting plugins in the future, add them to the conflictingPlugins array.
 */
const nextConfigs = (() => {
  if (!isNextJs) {
    return [];
  }
  try {
    const nextVitals = require('eslint-config-next/core-web-vitals');
    const nextTs = require('eslint-config-next/typescript');

    // Plugins that Next.js configs define but we already define elsewhere.
    // These will be filtered out to avoid "plugin redefinition" errors.
    // We use our own versions of these plugins (defined in the main config below).
    const conflictingPlugins = ['@typescript-eslint'];

    return [...nextVitals, ...nextTs].map((config) => {
      // Skip configs without plugins
      if (!config.plugins) {
        return config;
      }

      // Remove conflicting plugins, keep the rest (e.g., @next/next)
      const filteredPlugins = Object.fromEntries(
        Object.entries(config.plugins).filter(
          ([key]) => !conflictingPlugins.includes(key),
        ),
      );

      // Reconstruct config without conflicting plugins
      const result = { ...config };
      if (Object.keys(filteredPlugins).length > 0) {
        result.plugins = filteredPlugins;
      } else {
        // Remove plugins property entirely if all were filtered out
        delete result.plugins;
      }
      return result;
    });
  } catch {
    // If Next.js configs fail to load, continue without them
    return [];
  }
})();

export default defineConfig([
  // Global file patterns to ignore across all configs
  globalIgnores([
    // Build and output directories
    '**/dist',
    '.next/**',
    'out/**',
    'build/**',
    'coverage/**',
    'src/tests/golden-projects/output/**',

    // Generated apps (have their own eslint config)
    '.apps/**',

    // Template source files (not part of scaffolder codebase)
    'files/Core/**',

    // Config files (not linted)
    '**/eslint.config.js',
    '**/vite.config.ts',
    '**/vitest.config.ts',
    '**/tailwind.config.js',
    '**/postcss.config.js',
    '**/vitest.setup.ts',
    '**/bun-test-setup.ts',
    'next-env.d.ts',

    // Utility scripts
    'scripts/**',
  ]),

  // Main TypeScript/React configuration
  {
    files: ['**/*.{ts,tsx}'],

    // Core plugins used throughout the codebase
    plugins: {
      react,
      'no-type-assertion': noTypeAssertion,
      'react-hooks': reactHooks,
    },

    // Base configs to extend from
    extends: [
      // JavaScript recommended rules
      js.configs.recommended,

      // TypeScript rules with type checking
      tseslint.configs.recommendedTypeChecked,
      tseslint.configs.strictTypeChecked,
      tseslint.configs.stylisticTypeChecked,

      // Framework-specific configs
      ...(() =>
        isNextJs
          ? [reactRefresh.configs.next] // Next.js specific React Refresh config
          : [
              importPlugin.flatConfigs.recommended, // Vite: import plugin for module resolution
              reactRefresh.configs.vite, // Vite: React Refresh config
            ])(),
    ],

    // Language and parser configuration
    languageOptions: {
      // Global variables available in the codebase
      globals: {
        ...globals.browser, // Standard browser globals (window, document, etc.)

        // Test framework globals (Vitest)
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        test: 'readonly',
        vi: 'readonly',
      },

      // TypeScript parser for type-aware linting
      parser: tseslint.parser,
      ecmaVersion: 12,
      sourceType: 'module',

      parserOptions: {
        // Enable JSX parsing
        ecmaFeatures: {
          jsx: true,
        },

        // Use projectService for better support of TypeScript project references
        // This automatically handles tsconfig.json references without manual configuration
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },

    // Plugin settings
    settings: {
      react: {
        version: 'detect', // Automatically detect React version from package.json
      },
      'import/resolver': {
        typescript: {
          // Always consider TypeScript types when resolving imports
          alwaysTryTypes: true,
        },
      },
    },

    // Custom rules and overrides
    rules: {
      // Import rules
      'import/extensions': [
        'error',
        'ignorePackages', // Don't require extensions for package imports
        {
          ts: 'always', // Always require .ts extension for TypeScript files
          tsx: 'always', // Always require .tsx extension for React files
          index: 'never', // Never require extension for index files
        },
      ],

      // Code style rules
      curly: ['error', 'all'], // Require braces for all control statements
      'object-shorthand': ['error', 'always'], // Prefer object shorthand syntax

      // Type safety rules
      'no-type-assertion/no-type-assertion': 'error', // Disallow type assertions (use type guards instead)

      // React-specific rules
      'react-refresh/only-export-components': [
        'warn',
        {
          allowConstantExport: true, // Allow exporting constants alongside components
        },
      ],
      'react/react-in-jsx-scope': 'off', // Not needed in React 17+ (automatic JSX runtime)
      'react/jsx-props-no-spreading': 'error', // Disallow prop spreading (explicit props only)
      'react/jsx-filename-extension': [
        1,
        {
          extensions: ['.tsx'], // Only allow JSX in .tsx files
        },
      ],
      'react/jsx-pascal-case': 'error', // Component names must be PascalCase

      // React Hooks rules
      'react-hooks/rules-of-hooks': 'error', // Enforce Rules of Hooks
      'react-hooks/exhaustive-deps': 'error', // Enforce exhaustive dependencies in useEffect

      // Restricted syntax
      'no-restricted-syntax': [
        'error',
        {
          selector: 'TSEnumDeclaration',
          message: 'Enums are not allowed. Use object literals instead.',
        },
      ],

      // Console and debugging
      'no-alert': ['error'], // Disallow alert() calls
      'no-console': [
        'error',
        {
          allow: ['warn', 'error'], // Only allow console.warn and console.error
        },
      ],

      // TypeScript-specific rules
      '@typescript-eslint/no-unnecessary-boolean-literal-compare': ['error'],
      '@typescript-eslint/no-explicit-any': 'error', // Disallow 'any' type
      '@typescript-eslint/strict-boolean-expressions': 'error', // Require explicit boolean checks

      // Unused variables (TypeScript version)
      'no-unused-vars': 'off', // Disable base rule (use TypeScript version below)
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'all', // Check all function arguments
          argsIgnorePattern: '^_', // Ignore args starting with underscore
          varsIgnorePattern: '^_', // Ignore vars starting with underscore
        },
      ],

      // Naming conventions
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'function',
          format: ['camelCase', 'PascalCase'], // Functions: camelCase or PascalCase (for components)
        },
        {
          selector: 'function',
          modifiers: ['exported'],
          format: ['camelCase', 'PascalCase'], // Exported functions: same as above
        },
        {
          selector: 'class',
          format: ['PascalCase'], // Classes: PascalCase only
        },
        {
          selector: 'typeLike',
          format: ['PascalCase'], // Types and type aliases: PascalCase
        },
        {
          selector: 'interface',
          format: ['PascalCase'],
          prefix: ['I'], // Interfaces: PascalCase with 'I' prefix (e.g., IUser)
        },
      ],
    },
  },

  // Test files and development utilities configuration
  // Allow console.log in test files for debugging test output
  // Allow console.log in chat components for development debugging
  // Allow console.log in code generator frameworks for debugging
  {
    files: [
      '**/*.test.ts',
      '**/*.test.tsx',
      '**/tests/**/*.ts',
      '**/chat-app/**/*.tsx',
      '**/chat-app/**/*.ts',
      '**/frameworks/**/*.ts',
      '**/dynamic-form/**/*.tsx',
      'src/main.tsx',
    ],
    rules: {
      'no-console': 'off',
    },
  },

  // Code generator files with complex iteration patterns
  // These files iterate over schemas/configs where optional chaining is valid
  {
    files: ['**/frameworks/**/*.ts'],
    rules: {
      '@typescript-eslint/no-unnecessary-condition': 'off',
    },
  },

  // External SDK interface files
  // These files interface with third-party SDKs (AI SDK, etc.) that require
  // type assertions at the boundary where our validated data meets SDK types.
  {
    files: [
      'src/app/routes/agent.ts',
      'src/app/routes/opencode/**/*.ts',
      'src/test/mocks/**/*.ts',
    ],
    rules: {
      'no-type-assertion/no-type-assertion': 'off',
    },
  },

  // Merge Next.js-specific configs (if applicable)
  // These are loaded conditionally and have conflicting plugins filtered out
  ...nextConfigs,
]);
