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

## Run from a development machine

From the monorepo root with **Bun 1.4.2** and **Node 24+** available:

```sh
bun install --frozen-lockfile
bun run dev:travel
```

Press `w` in Expo CLI for the browser. For a direct browser launch:

```sh
bun run web:travel
```

Install **Expo Go** for **SDK 58** on Android/iPhone and open the development
server URL or scan its QR code. If connecting over different networks, run:

```sh
cd apps/travel
bun expo start --tunnel
```

An Expo development server must be running to use Expo Go. Installing only
Termux does not install or launch the native app.

## Android with Termux

Termux is optional. The easiest path is to run the Expo server on a
computer and use Expo Go on your phone. You can also experiment with
your existing Termux Ubuntu environment:

1. Enter the Ubuntu environment and install a current Node.js and the
   repository's pinned Bun version, if they work on your device.
2. Clone the branch and install dependencies from the monorepo root.
3. Launch `cd apps/travel && bun expo start --tunnel`.
4. Open the URL in Expo Go **on Android**, which is a separate app.

Linux tools in Termux/PRoot can have Metro watcher, native module, or
architecture limitations; this pathway has not been device-tested.
For a reliable first test, host Metro on your desktop/WSL instead.

iOS native builds require Apple's tooling or Expo Application Services.
A compatible iPhone can run the Expo Go preview without an iOS build.

## Verification

```sh
bun run test --filter=@monorepo/travel
bun run typecheck --filter=@monorepo/travel
bun run build --filter=@monorepo/travel
bun expo install --check
```

Manually confirm search, region filters, saved items, and detail navigation
on the browser and a real Android device. iOS is a supported target but
requires independent device verification.
