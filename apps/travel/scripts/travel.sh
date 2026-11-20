#!/usr/bin/env bash
set -euo pipefail

source "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/common.sh"

command_name="${1:-help}"
shift || true

case "$command_name" in
  help)
    cat <<'HELP'
Wanderapp (run from the repo root or apps/travel)

  make setup          Install locked monorepo dependencies
  make doctor         Check Bun, Node.js, and dependency installation
  make dev            Start native development client + Fast Refresh on this phone
  make tunnel         Start native development client through a public tunnel
  make dev-go         Optional Expo Go UI-only fallback (no custom native modules)
  make web            Start the browser development server
  make build          Build a standalone preview Android APK using EAS cloud
  Android dev APK     Download the GitHub Actions artifact (see README)
  make build-web      Export a static web build to apps/travel/dist
  make eas-login      Sign in to an Expo account (first build)
  make eas-init       Link this demo to an Expo project (first build)
  make test           Run travel app unit tests
  make check          Run travel typecheck, tests, and web export

Aliases: make install, start, apk, build-android
HELP
    ;;
  doctor)
    printf 'Platform: %s %s\n' "$(uname -s)" "$(uname -m)"
    require_bun
    printf 'Bun: %s\n' "$(bun --version)"
    require_node
    printf 'Node.js: %s\n' "$(node --version)"
    require_dependencies
    printf 'Dependencies: installed\n'
    ;;
  setup)
    require_bun
    require_node
    cd "$TRAVEL_REPO_DIR"
    bun install --frozen-lockfile
    ;;
  dev)
    require_bun
    require_dependencies
    cd "$TRAVEL_APP_DIR"
    printf 'Open Wanderapp Dev on this phone and connect it to http://127.0.0.1:8081.\n'
    printf 'Keep Termux running; React edits appear through Fast Refresh without APK rebuilds.\n'
    exec env EXPO_APP_VARIANT=development bun expo start --dev-client --localhost "$@"
    ;;
  tunnel)
    require_bun
    require_dependencies
    cd "$TRAVEL_APP_DIR"
    printf 'The tunnel URL may be reachable by other devices; do not share it publicly.\n'
    exec env EXPO_APP_VARIANT=development bun expo start --dev-client --tunnel "$@"
    ;;
  dev-go)
    require_bun
    require_dependencies
    cd "$TRAVEL_APP_DIR"
    exec bun expo start --go --localhost "$@"
    ;;
  web)
    require_bun
    require_dependencies
    cd "$TRAVEL_APP_DIR"
    exec bun expo start --web --localhost "$@"
    ;;
  build)
    require_bun
    require_node
    require_dependencies
    cd "$TRAVEL_APP_DIR"
    if ! grep -Eq '"projectId"[[:space:]]*:' app.json; then
      printf 'First build: linking to Expo Application Services. This may update apps/travel/app.json.\n'
      run_eas init
    fi
    printf 'Requesting an installable Android APK from EAS Build (cloud).\n'
    run_eas build --platform android --profile preview "$@"
    ;;
  build-web)
    require_bun
    require_dependencies
    cd "$TRAVEL_APP_DIR"
    exec bun expo export --platform web "$@"
    ;;
  eas-login)
    run_eas login "$@"
    ;;
  eas-init)
    run_eas init "$@"
    ;;
  test)
    require_bun
    require_dependencies
    cd "$TRAVEL_REPO_DIR"
    exec bun run test --filter=@monorepo/travel "$@"
    ;;
  check)
    require_bun
    require_dependencies
    cd "$TRAVEL_REPO_DIR"
    bun run typecheck --filter=@monorepo/travel
    bun run test --filter=@monorepo/travel
    bun run build --filter=@monorepo/travel
    ;;
  *)
    fail "Unknown command: $command_name (run make help)."
    ;;
esac
