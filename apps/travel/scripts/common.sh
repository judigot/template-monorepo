#!/usr/bin/env bash

# Source from travel.sh. Keep all paths independent of the caller's cwd.
TRAVEL_SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
TRAVEL_APP_DIR="$(cd -- "$TRAVEL_SCRIPT_DIR/.." && pwd)"
TRAVEL_REPO_DIR="$(cd -- "$TRAVEL_APP_DIR/../.." && pwd)"
TRAVEL_BUN_VERSION=1.4.2

fail() {
  printf 'Error: %s\n' "$*" >&2
  exit 1
}

require_bun() {
  command -v bun >/dev/null 2>&1 || fail 'Bun is missing. Install Bun 1.4.2 in Ubuntu, then run make setup.'
  local installed_version
  installed_version="$(bun --version)" || fail 'Bun could not start in this Ubuntu environment.'
  [[ "$installed_version" == "$TRAVEL_BUN_VERSION" ]] || fail "Expected Bun $TRAVEL_BUN_VERSION, found $installed_version. Use the pinned Bun version."
}

require_node() {
  command -v node >/dev/null 2>&1 || fail 'Node.js 24 or later is required. Install Node.js in Ubuntu.'
  node -e 'process.exit(Number(process.versions.node.split(".")[0]) >= 24 ? 0 : 1)' \
    || fail "Node.js 24 or later is required (found $(node --version))."
}

require_dependencies() {
  [[ -d "$TRAVEL_REPO_DIR/node_modules" ]] || fail 'Dependencies not installed. Run make setup from the repository root.'
}

run_eas() {
  require_node
  require_bun
  require_dependencies
  cd "$TRAVEL_APP_DIR"
  bunx eas-cli@latest "$@"
}
