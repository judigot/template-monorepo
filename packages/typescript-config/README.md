# @bigbang/typescript-config

Shared TypeScript configurations for every workspace in this monorepo.

| Config        | Purpose                                        |
| ------------- | ---------------------------------------------- |
| `base.json`   | Strict defaults shared by all workspaces       |
| `vite.json`   | Vite + React browser code (`apps/vite`)        |
| `nextjs.json` | Next.js App Router code (`apps/nextjs`)        |
| `api.json`    | Node/Bun server code (`apps/api` and packages) |

## Usage

```json
{
  "extends": "@bigbang/typescript-config/vite.json",
  "include": ["src"]
}
```

Add the package as a `devDependency`:

```json
{
  "devDependencies": {
    "@bigbang/typescript-config": "workspace:*"
  }
}
```
