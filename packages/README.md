# Shared Packages

Reusable code consumed by the applications in `apps/`.

| Package                     | Purpose                                            |
| --------------------------- | -------------------------------------------------- |
| `@monorepo/api-client`       | API contracts and a typed client for the Hono API  |
| `@monorepo/typescript-config`| Shared TypeScript configurations                   |

## Creating a New Package

1. Create a new directory under `packages/` with a `package.json`:

   ```json
   {
     "name": "@monorepo/my-package",
     "version": "0.0.0",
     "private": true,
     "type": "module",
     "exports": {
       ".": "./src/index.ts"
     }
   }
   ```

2. Add the package as a dependency in an app:

   ```json
   {
     "dependencies": {
       "@monorepo/my-package": "workspace:*"
     }
   }
   ```

3. Install dependencies:

   ```sh
   bun install
   ```

Packages ship TypeScript source directly; consumers compile it. Next.js
consumers must list the package in `transpilePackages`.
