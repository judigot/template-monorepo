/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the deployed API; empty/undefined means same-origin. */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
