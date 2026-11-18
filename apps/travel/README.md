# Roam Travel

One Expo Router application for **web, Android, and iOS**. The same screens
and Tamagui components run on every platform, with responsive two-column
web cards and one-column phone cards.

This is a demonstration feature branch in `judigot/template-monorepo`.
Existing Vite and Next.js applications remain untouched. Destination content
is illustrative; there is no backend, account, booking, or payment integration.

## Google sign-in

The Account tab uses Better Auth + Google OAuth when configured. It is
deliberately unavailable in unconfigured demo environments and does not
interrupt destination discovery. See [AUTH_SETUP.md](./AUTH_SETUP.md)
for API, PostgreSQL, Google Cloud, web and native instructions.

## Architecture

- `app/`: Expo Router screens, shared by all platforms.
- `src/components/`: reusable Tamagui UI and the responsive destination card.
- `src/data/`: typed demo data, search/filtering, and pure tests.
- `src/state/`: shared in-memory saved-place state.
- `@monorepo/design-tokens/palette`: existing platform-independent colors.

The browser uses Metro/React Native Web. Android and iOS render the same
React Native UI natively.

## Native Android development: build once, iterate instantly

The production app is **native React Native**; no WebView or embedded website.
The development client is a separate application, **Roam Travel Dev**,
package `com.judigot.roamtravel.dev`. It can coexist with your existing
signed preview/release app `com.judigot.roamtravel` without signature
conflicts or overwriting its data.

### 1. Obtain the development APK from GitHub Actions

When you push a change to native app configuration or dependencies on a feature
branch, the
[Android Development Client](../../.github/workflows/android-dev-client.yml)
workflow compiles a **debug APK directly with Expo prebuild and Gradle** on a
GitHub-hosted Linux runner. No Expo account, EAS Build queue, or Android
toolchain on your phone is required.

Open the GitHub Actions run for PR #31, download the
`roam-travel-dev-client` artifact ZIP, extract `app-debug.apk` using
Android's Files app, then install the APK. It contains the developer launcher
and **must connect to Metro** to run your latest JavaScript. The artifact
is a development build, not a distributable production APK.

The workflow runs automatically only on pushes that change `apps/travel/package.json`,
`apps/travel/app.json`, `apps/travel/app.config.ts`, `bun.lock`,
or the workflow itself. UI-only edits do not trigger a native rebuild.
Concurrent builds for the same feature branch cancel older in-progress runs.

After merging to the default branch, the same workflow supports manual
`workflow_dispatch` builds when a native change requires another APK.

### 2. Run Metro from Termux Ubuntu on your Android phone

In Termux Ubuntu (PRoot), from the repository root:

```bash
make setup
make dev
```

Open **Roam Travel Dev**, then connect to the address
`http://127.0.0.1:8081` from the development launcher. The shell starts
Expo with `EXPO_APP_VARIANT=development` and the `--dev-client` flag.
Keep Termux and the development server running.

Most React Native component, JavaScript/TypeScript, Tamagui styling, and
navigation changes appear through **Fast Refresh** without generating or
installing another APK. From another terminal, edit files as usual.
If the localhost connection is blocked, use `make tunnel` and connect
using the link printed by Expo (internet required). Expo Go remains
available through `make dev-go`, but it does not replace the custom
native development build.

Metro from Ubuntu PRoot running on the same physical Android device remains
**experimental and unverified**. If bundler connection or file watchers fail,
a standard Linux/macOS development host with Metro and an Android phone on the
same network is the supported fallback.

### 3. When a new APK is actually required

Rebuild and install a new dev APK after upgrading the Expo SDK or React Native,
adding/updating native libraries, changing Android permissions or app IDs,
or changing native config plugins. UI, business logic, or server-only changes
normally require no native rebuild.

To compile locally on a standard Linux/macOS workstation with an Android
SDK and JDK 17, use Expo's supported native workflow:

```bash
cd apps/travel
EXPO_APP_VARIANT=development bun expo prebuild --platform android --clean
EXPO_APP_VARIANT=development bun expo run:android --device
```

This is not recommended inside Android Termux PRoot.

### Web, preview releases, and EAS fallback

`make web` starts the same React Native Web screens in a browser.
`make build-web` creates a static web export.

`make build` is intentionally retained as the standalone **EAS preview APK**
workflow for now, not for ordinary development. The existing EAS profile does
not use the development client. `make eas-login` and `make eas-init`
remain optional. A separate `development` EAS profile exists as a fallback
but GitHub Actions is the preferred build transport.

The developer client and Metro/Fast Refresh apply only to development.
Shipping changes to **installed release users** without a new APK requires
a separately configured and tested `expo-updates` OTA delivery service.
OTA is not installed or operational yet, and native dependency changes still
require an updated binary.

## Verification

```sh
make check
bun expo install --check  # from apps/travel
```

Manually confirm search, region filters, saved items, and detail navigation
on the browser and a real Android device. iOS is a supported target but
requires independent device verification.
