import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from './supabaseClient';

interface AuthState {
  session: Session | null;
  user: User | null;
  loading: boolean;
  /** Send a 6-digit sign-in code by email. Returns an error message, or null. */
  signInWithEmail: (email: string) => Promise<string | null>;
  /** Verify the 6-digit code the user typed. Returns an error message, or null. */
  verifyOtp: (email: string, token: string) => Promise<string | null>;
  /** Begin Google OAuth (redirect flow). */
  signInWithGoogle: () => Promise<string | null>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

const redirectTo = typeof window !== 'undefined' ? window.location.origin : undefined;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      async signInWithEmail(email: string) {
        if (!supabase) return 'Accounts are not configured yet.';
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: redirectTo, shouldCreateUser: true },
        });
        return error ? error.message : null;
      },
      async verifyOtp(email: string, token: string) {
        if (!supabase) return 'Accounts are not configured yet.';
        const { error } = await supabase.auth.verifyOtp({ email, token, type: 'email' });
        return error ? error.message : null;
      },
      async signInWithGoogle() {
        if (!supabase) return 'Accounts are not configured yet.';
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo },
        });
        return error ? error.message : null;
      },
      async signOut() {
        await supabase?.auth.signOut();
      },
    }),
    [session, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    // Safe fallback if a component renders outside the provider.
    return {
      session: null,
      user: null,
      loading: false,
      signInWithEmail: async () => 'Accounts are not configured yet.',
      verifyOtp: async () => 'Accounts are not configured yet.',
      signInWithGoogle: async () => 'Accounts are not configured yet.',
      signOut: async () => {},
    };
  }
  return ctx;
}
