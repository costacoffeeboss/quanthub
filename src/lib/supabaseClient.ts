import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Single shared Supabase browser client.
 *
 * The URL + anon (publishable) key are *public by design* — they ship in the
 * bundle and are protected by Row-Level Security on the database. The secret
 * (service-role) key is never referenced here; it lives only in the Netlify
 * Functions environment.
 *
 * If the env vars are absent (e.g. a deploy that hasn't configured them yet),
 * `supabase` is null and the rest of the app degrades gracefully to its
 * pre-accounts behaviour rather than crashing.
 */
const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url as string, anonKey as string, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        // Implicit flow puts the session in the URL fragment so a magic link
        // works even when the email opens it in a different browser/webview.
        // (PKCE, the default, only works in the browser that requested it.)
        flowType: 'implicit',
      },
    })
  : null;
