# Wanderapp

One Expo Router application for **web, Android, and iOS**. The same screens
and Tamagui components run on every platform, with responsive two-column
web cards and one-column phone cards.

Wanderapp lives on `app/travel-app` in `judigot/template-monorepo`. The Hono API
handles Google sign-in. Destination content is illustrative, and saved places
are held in the app's local state.

## Development and release workflow

| Goal | Use | What needs to run |
| --- | --- | --- |
| See edits live on Android | **Wanderapp Dev** with `make dev` on the phone or `make tunnel` from a remote computer | Metro serves the app code and Fast Refresh while you work. |
| Check the same screens in a browser | `make web` | Expo's web development server. |
| Demo on Android without a development server | **Wanderapp**, the standalone EAS Preview APK | The APK opens from the home screen. Google sign-in uses the hosted API. |
| Deliver a compatible feature or fix to an installed preview APK | EAS Update on the `preview` channel | Expo hosts and serves the published bundle and assets. The phone needs internet access to download them. |
| Deliver native changes | Build a fresh APK and install it | EAS Build for standalone previews or GitHub Actions for the Android dev client. |

The Expo tunnel is for development. It forwards the phone's requests to Metro
wherever you started it. Closing Metro stops Fast Refresh. Once an EAS Update
is published, the standalone app fetches it from Expo without a tunnel, a local
server, or an open port. The installed app can open with its bundled or cached
version offline. Google sign-in requires the separate Vercel API and its Neon
database. Deploying an EAS Update affects Android only when publishing with
`--platform android`. Deploy the web export separately.

You can close or delete a Codespace after pushing your changes. Published EAS
updates remain available. Pushes to `app/travel-app` run GitHub Actions CI and
can automatically publish an Android over-the-air update. Native changes can
also trigger the separate Android dev APK workflow.

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

The Explore map uses MapLibre Native on phones and MapLibre GL JS on the web,
with the same OpenFreeMap style and place profile on both. Use the
[catalog migrations](../api/migrations/README.md) to set up the public place
API. The bundled Tatang’s profile also lets the demo open while the API is
unavailable. Adding the native map module requires a new APK.

## Native Android development: build once, iterate instantly

The production app is **native React Native**; no WebView or embedded website.
The development client is a separate application, **Wanderapp Dev**,
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

Open the successful Android Development Client run for your branch, download the
`wanderapp-dev-client` artifact ZIP, extract `app-debug.apk` using
Android's Files app, then install the APK. It contains the developer launcher
and **must connect to Metro** to run your latest JavaScript. The artifact
is a development build, not a distributable production APK.

On feature branches the workflow runs on pushes that change `apps/travel/package.json`,
`apps/travel/app.json`, `apps/travel/app.config.ts`, `apps/travel/eas.json`,
`bun.lock`, or the workflow itself. UI-only edits do not trigger a native rebuild.
Concurrent builds for the same feature branch cancel older in-progress runs.

After merging to the default branch, the same workflow supports manual
`workflow_dispatch` builds when a native change requires another APK.

### 2. Run Metro from Termux Ubuntu on your Android phone

In Termux Ubuntu (PRoot), from the repository root:

```bash
make setup
make dev
```

Open **Wanderapp Dev**, then connect to the address
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

From a remote desktop or workspace, run `make tunnel` and scan the QR code
with the phone camera or paste the printed HTTPS URL into **Wanderapp Dev**.
If Expo's signed tunnel requires a login, sign in or use Expo's ngrok option
from `apps/travel`:

```sh
EXPO_APP_VARIANT=development bun expo start --dev-client --tunnel ngrok
```

Metro from Ubuntu PRoot running on the same physical Android device remains
**experimental and unverified**. If bundler connection or file watchers fail,
a standard Linux/macOS development host with Metro and an Android phone on the
same network is the supported fallback.

### Termux troubleshooting: ENOSPC file watcher limit

On unprivileged Android/Termux Ubuntu, the error `ENOSPC: System limit for
number of file watchers reached` means Metro exhausted Android's inotify
quota. It does **not** mean your phone ran out of storage.

The `metro.config.cjs` in this repo narrows Metro's watched roots to the
travel app and its shared design-token workspace, while Expo SDK 58's
on-demand resolver still reads Bun's `node_modules/.bun` dependencies
as needed. This keeps Fast Refresh for shared UI sources.

Update the checkout and restart Metro after pulling this fix:

```bash
git pull
make dev-go
```

For the custom native development client, use `make dev` instead.
If you continue to see watcher exhaustion, inspect the kernel quota:

```bash
cat /proc/sys/fs/inotify/max_user_watches
cat /proc/sys/fs/inotify/max_user_instances
```

A PRoot `root` shell cannot raise these kernel limits without real Android
root privileges. Closing other running Metro/Node processes may free
watches. Avoid ignoring `node_modules/.bun` with Metro's `blockList`,
because those files must remain resolvable. This mitigates Termux
watcher pressure but does not establish verified device compatibility.

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

### Over-the-air updates for standalone previews

`make build` creates a standalone Android APK subscribed to the EAS
`preview` channel on the linked Expo project `@judigot/travel-demo`. Set
`EXPO_PUBLIC_API_URL` in that project's
**Preview** environment before building or publishing. Use the public API
origin without `/api/auth`.

Install an APK built with this configuration once. To enable automatic
publishing, add an Expo access token with access to the linked project as the
`EXPO_TOKEN` repository Actions secret. The [CI workflow](../../.github/workflows/ci.yml)
publishes to Android Preview after all CI jobs pass on a push to
`app/travel-app`. It compares the update fingerprint with the finished
standalone Preview APK. When testers move to a new native build, set the
`WANDERAPP_PREVIEW_BUILD_ID` repository Actions variable to that EAS build ID.
The workflow skips publishing when the runtime differs or when a newer push
has superseded the run.

For a manual release, start from the intended source revision and run the
project checks. Compare the Android fingerprint with the runtime version
reported on the EAS build that testers have installed. From `apps/travel`:

```sh
npx --yes eas-cli@latest fingerprint:generate --environment preview --platform android
npx --yes eas-cli@latest update --channel preview --environment preview --platform android --message "Describe the change"
```

Publish the update when the fingerprint matches. If it differs, build an APK
for the new runtime. Record the source commit, runtime, and EAS update link.
To verify delivery, open the standalone **Wanderapp** while online, give it
time to download the update, then fully close and reopen it. Confirm the
changed screen on the phone. For a temporary preview test, publish the
restored code after the test so devices that downloaded it also get the cleanup.

## Verification

```sh
make check
bun expo install --check  # from apps/travel
```

Manually confirm search, region filters, saved items, and detail navigation
on the browser and a real Android device. iOS is a supported target but
requires independent device verification.
