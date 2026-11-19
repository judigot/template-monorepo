# Wanderapp

Wanderapp is the shared Expo Router app for Android, iOS, and web. The Hono
API, under `apps/api`, owns Better Auth and Google OAuth. Use the Bun
workspace and the existing Tamagui components and design tokens.

Read the [development workflow](README.md#development-and-release-workflow)
before planning a build or release. Read [AUTH_SETUP.md](AUTH_SETUP.md) when
changing authentication or testing it on a new environment.

- Use **Wanderapp Dev** with Metro and Fast Refresh for everyday Android UI
  and TypeScript work. Use `make tunnel` when the phone needs to reach Metro
  on a remote development machine. Use `make web` for browser checks.
- Use **Wanderapp** for standalone Android demos. It bundles the app and
  receives compatible over-the-air changes from EAS on the `preview` channel.
  Build and update with the EAS `preview` environment. The push CI job
  publishes compatible updates when `EXPO_TOKEN` is configured. Check that
  job before publishing the same revision manually.
- Build a new APK after native dependency, Expo SDK, or native configuration
  changes. Preserve the existing package IDs, callback schemes, and signing
  keys when making a branding-only change.
- Keep the API origin in `EXPO_PUBLIC_API_URL`. Keep Google and Better Auth
  secrets in the API environment. Test account changes with Google sign-in,
  return to Account, and logout on a real device.
- Run `make check` for Travel typecheck, tests, and a web export. Report the
  Git commit, CI result, and build or update link when publishing. Verify
  device behavior separately from a successful build or publish.
