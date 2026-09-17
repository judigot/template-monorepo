# Vite app

Run `bun run dev` from the repository root. After adding or changing a workspace package or lockfile, run `bun install` and restart Vite. An already-running Vite process cannot resolve a newly added `@monorepo/*` workspace specifier; a healthy restart may log “Re-optimizing dependencies because lockfile has changed”.
