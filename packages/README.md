# Shared Packages

This directory contains shared packages that can be reused across apps in the monorepo.

## Creating a New Package

1. Create a new directory under `packages/`:
   ```bash
   mkdir packages/my-package
   ```

2. Create a `package.json` with a unique name:
   ```json
   {
     "name": "@bigbang/my-package",
     "version": "0.0.0",
     "type": "module",
     "main": "./src/index.ts",
     "types": "./src/index.ts",
     "exports": {
       ".": "./src/index.ts"
     }
   }
   ```

3. Add the package as a dependency in your app:
   ```json
   {
     "dependencies": {
       "@bigbang/my-package": "workspace:*"
     }
   }
   ```

4. Install dependencies:
   ```bash
   pnpm install
   ```

## Using Packages

Import packages using their workspace name:

```typescript
import { something } from '@bigbang/my-package';
```

## Package Structure Example

```
packages/
  my-package/
    package.json
    src/
      index.ts
    tsconfig.json
```
