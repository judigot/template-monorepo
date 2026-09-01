# Shared Packages

Reusable code consumed by the applications in `apps/`.

| Package                     | Purpose                                            |
| --------------------------- | -------------------------------------------------- |
| `@bigbang/api-client`       | API contracts and a typed client for the Hono API  |
| `@bigbang/typescript-config`| Shared TypeScript configurations                   |

## Creating a New Package

1. Create a new directory under `packages/` with a `package.json`:

   ```json
   {
     "name": "@bigbang/my-package",
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
       "@bigbang/my-package": "workspace:*"
     }
   }
   ```

3. Install dependencies:

   ```sh
   bun install
   ```

Packages ship TypeScript source directly; consumers compile it. Next.js
consumers must list the package in `transpilePackages`.
