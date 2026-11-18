# Google sign-in setup

Roam Travel uses Better Auth 1.7.25, the official Expo plugin, the existing
Hono API, and PostgreSQL. No Firebase Auth or EAS authentication service is needed.

## 1. Create Google OAuth credentials

In Google Cloud Console, configure the OAuth consent screen and create a
**Web application** OAuth client. Add the exact API callback URL:

    https://YOUR-API-HOST/api/auth/callback/google

Add your web app's deployed origin in the Google Cloud configuration when
required. Configure Google's consent-screen test users while the app is
in testing mode. The OAuth client secret is **server-side only**.

## 2. Configure the Hono API

Set the following environment variables in the API deployment (not in the
Expo app or public browser bundle):

    DATABASE_URL=postgresql://...
    BETTER_AUTH_URL=https://YOUR-API-HOST
    BETTER_AUTH_SECRET=at-least-32-cryptographically-random-characters
    GOOGLE_CLIENT_ID=...
    GOOGLE_CLIENT_SECRET=...
    CORS_ORIGINS=https://YOUR-TRAVEL-WEB-HOST

Use a dedicated PostgreSQL database or isolated branch for previews. Do not
reuse a production database for pull request builds. Configure all five auth
variables together: partial configuration fails startup deliberately.

Run the Better Auth schema migration from a trusted environment with access
to the database and server-only environment variables:

    cd apps/api
    npx --yes auth@1.7.25 migrate --config ./src/auth.ts

The API routes are mounted at /api/auth/* and return 503 when authentication
has not been configured. Existing /api/health and /api/hello remain available.

## 3. Configure the Expo app

Set this public (non-secret) variable for both web and Android builds:

    EXPO_PUBLIC_API_URL=https://YOUR-API-HOST

Keep it as the API origin, **without** /api/auth. The client uses the
roamtravel:// scheme, already declared in app.json. Better Auth's Expo client
uses expo-secure-store for native session cookies.

Build a new APK after adding expo-secure-store, expo-network and
expo-web-browser, because they contain native code. Expo Go and native
Android callbacks need device verification.

## 4. Test

- Open the Account tab and choose Continue with Google.
- Complete Google's consent screen.
- Confirm the app opens Account with the Google user's name and email.
- Relaunch the application and verify that the session remains available.
- Sign out and confirm the session clears.
- Test the same Google identity in the hosted web app.

The destination demo's existing saved-place list is **local in-memory state**.
Associating favorites with Google accounts is a separate database-backed
feature, not part of this sign-in implementation.

## Security

Never commit credentials, signing secrets, session cookies or database URLs.
Keep the API hosted on HTTPS. Google must redirect to the HTTPS API callback,
not directly to an arbitrary custom scheme. Do not enable wildcard trusted
origins in production. Both Better Auth packages should be updated together
to a patched stable version, including the November 2026 security fixes.
