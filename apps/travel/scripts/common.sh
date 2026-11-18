#!/usr/bin/env bash

# Source from travel.sh. Keep all paths independent of the caller's cwd.
TRAVEL_SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
TRAVEL_APP_DIR="$(cd -- "$TRAVEL_SCRIPT_DIR/.." && pwd)"
TRAVEL_REPO_DIR="$(cd -- "$TRAVEL_APP_DIR/../.." && pwd)"
TRAVEL_BUN_MINIMUM_VERSION=1.4.4

fail() {
  printf 'Error: %s\n' "$*" >&2
  exit 1
}

require_bun() {
  command -v bun >/dev/null 2>&1 || fail 'Bun is missing. Install the latest stable Bun in Ubuntu, then run make setup.'

  local installed_version
  installed_version="$(bun --version)" || fail 'Bun could not start in this Ubuntu environment.'

  [[ "$installed_version" =~ ^([0-9]+)\.([0-9]+)\.([0-9]+)$ ]] \
    || fail "Expected a stable Bun release, found $installed_version."

  local major="${BASH_REMATCH[1]}"
  local minor="${BASH_REMATCH[2]}"
  local patch="${BASH_REMATCH[3]}"

  if (( major < 1 || (major == 1 && minor < 4) || (major == 1 && minor == 4 && patch < 4) )); then
    fail "Bun $installed_version is too old. Install Bun $TRAVEL_BUN_MINIMUM_VERSION or newer (latest stable recommended)."
  fi
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
