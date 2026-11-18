# Roam Travel

One Expo Router application for **web, Android, and iOS**. The same screens
and Tamagui components run on every platform, with responsive two-column
web cards and one-column phone cards.

This is a demonstration feature branch in `judigot/template-monorepo`.
Existing Vite and Next.js applications remain untouched. Destination content
is illustrative; there is no backend, account, booking, or payment integration.

## Architecture

- `app/`: Expo Router screens, shared by all platforms.
- `src/components/`: reusable Tamagui UI and the responsive destination card.
- `src/data/`: typed demo data, search/filtering, and pure tests.
- `src/state/`: shared in-memory saved-place state.
- `@monorepo/design-tokens/palette`: existing platform-independent colors.

The browser uses Metro/React Native Web. Android and iOS render the same
React Native UI natively.

## Termux Ubuntu quick start

Run these commands **inside your Ubuntu (PRoot) shell**, from the cloned
repository root. Ubuntu needs `make`, Node.js **24+**, and Bun **1.4.2**
(the monorepo's pinned version). Install these prerequisites in Ubuntu first;
Termux's Android-side binaries may not work inside PRoot.

```sh
make setup
make dev
```

`make setup` installs dependencies using the existing `bun.lock` without
updating it. `make dev` starts Metro in **localhost** mode for Expo Go on
this same Android phone. Install a compatible **Expo Go for SDK 58** and
open the `exp://` address printed by Expo. Keep Termux/Ubuntu running while
using Expo Go. You do not need a QR-code scanner on the same phone.

If Expo Go cannot connect to localhost, try `make tunnel`. A tunnel requires
network access and may prompt you to install its tunnel dependency. The URL
is publicly reachable, so treat it as a development-only address. Metro,
watching and Bun inside Android/PRoot are **experimental and have not been
verified on a physical phone**.

### Convenient Make commands

Run these commands from either the monorepo root or `apps/travel`:

| Command | Purpose |
| --- | --- |
| `make help` | Print all available commands |
| `make doctor` | Check installed tool versions and dependencies |
| `make setup` | Install locked dependencies |
| `make dev` or `make start` | Start native Expo Go development server on the phone |
| `make tunnel` | Start Expo Go development server using a tunnel |
| `make web` | Start the browser development server |
| `make build` or `make apk` | Request an installable Android APK from EAS cloud |
| `make build-web` | Export static web files to `apps/travel/dist` |
| `make eas-login` | Authenticate with Expo for the first APK build |
| `make eas-init` | Manually link the app to an Expo project |
| `make test` | Run travel app unit tests |
| `make check` | Run travel typecheck, unit tests and web export |

### Build an Android APK

```sh
make build
```

Unlike `make dev`, `make build` uses **Expo Application Services (EAS) cloud
builds**. It does **not** run the Android SDK/Gradle in your Termux Ubuntu
container. The first build needs an Expo account and an interactive login
(`make eas-login` if needed). When the app is not linked to an EAS project,
`make build` invokes `eas init` once, which may update `apps/travel/app.json`
with `extra.eas.projectId`. Review that locally generated change before
committing it. EAS may also ask to create Android signing credentials.

After EAS finishes, follow the APK download/install link printed in the CLI
on your Android device. The preview APK is a standalone app and does not
need Expo Go or a running Metro server. Cloud build availability and
billing are subject to your Expo account and plan. Native APK builds are
**not yet verified** for this demo.

`make build-web` is separate because exporting a web bundle does not create
an Android APK. The generated `dist` directory is ignored by Git.

## Development on another machine

From the monorepo root, with Bun 1.4.2 and Node.js 24+:

```sh
make setup
make dev
```

`make dev` uses localhost by default for same-device Termux. When hosting
Metro on a different machine, use `make tunnel` so Expo Go can connect from
your phone. Direct browser access: `make web`.

## Verification

```sh
make check
bun expo install --check  # from apps/travel
```

Manually confirm search, region filters, saved items, and detail navigation
on the browser and a real Android device. iOS is a supported target but
requires independent device verification.
