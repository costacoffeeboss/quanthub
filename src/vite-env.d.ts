/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  /** Master switch for accounts + paywall. Until this is 'true', the site
   *  behaves exactly as before: no sign-in UI, everything unlocked. */
  readonly VITE_PAYWALL_ENABLED?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
