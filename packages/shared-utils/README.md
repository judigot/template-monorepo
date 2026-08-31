# @bigbang/shared-utils

Shared utilities package for the monorepo.

## Installation

This package is part of the pnpm workspace. Dependencies are managed at the root level.

## Usage

Add this package as a dependency in your app's or package's `package.json`:

```json
{
  "dependencies": {
    "@bigbang/shared-utils": "workspace:*"
  }
}
```

Then run `pnpm install` to link the workspace package.

Import and use:

```typescript
import { exampleUtil } from '@bigbang/shared-utils';

const result = exampleUtil();
```

## Development

```bash
# Build the package
pnpm build

# Watch mode
pnpm dev

# Type check
pnpm typecheck

# Clean build artifacts
pnpm clean
```

## Building

The package builds to the `dist/` directory with:
- ESM output (`dist/index.js`)
- TypeScript declarations (`dist/index.d.ts`)
- Source maps
