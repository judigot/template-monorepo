# @bigbang/tsconfig

Shared TypeScript configurations for the monorepo.

## Usage

Extend the base configuration in your `tsconfig.json`:

```json
{
  "extends": "../tsconfig/base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  }
}
```

## Available Configs

### `base.json`
Base configuration for all packages. Includes:
- ES2022 target
- Strict mode
- Module resolution: node16
- Declaration files
- Source maps

### `react.json`
Extends `base.json` with React-specific settings:
- DOM types
- JSX support (react-jsx)

### `node.json`
Extends `base.json` with Node.js-specific settings:
- Node.js types

## Features

- **Composite mode**: Enabled for project references
- **Incremental builds**: Faster compilation
- **Strict type checking**: Maximum type safety
- **Modern ES modules**: ESNext module system
