import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { useAuth } from './auth';
import { supabase, isSupabaseConfigured } from './supabaseClient';

/**
 * MASTER SWITCH.
 *
 * While this is false, `useEntitlement` reports everyone as premium, no
 * sign-in UI appears, and every <Premium> gate renders its children — i.e.
 * the site is byte-for-byte the experience it is today. Flip
 * VITE_PAYWALL_ENABLED to 'true' in the environment (once Stripe is wired and
 * tested) to switch gating on.
 */
export const PAYWALL_ENABLED = import.meta.env.VITE_PAYWALL_ENABLED === 'true';

/** Auth/sign-in UI should only show once the feature is on AND configured. */
export const AUTH_UI_ENABLED = PAYWALL_ENABLED && isSupabaseConfigured;

// Dev-only preview toggle so gating can be eyeballed locally without Stripe.
// Inert in production builds (import.meta.env.DEV is false there).
function devPremiumOverride(): boolean {
  if (!import.meta.env.DEV) return false;
  try {
    return window.localStorage.getItem('qh:dev-premium') === '1';
  } catch {
    return false;
  }
}

export interface Entitlement {
  premium: boolean;
  loading: boolean;
  refresh: () => void;
}

export function useEntitlement(): Entitlement {
  const { user, loading: authLoading } = useAuth();
  // When the feature is off, start (and stay) unlocked so nothing ever flashes
  // a paywall on the currently-free site.
  const [premium, setPremium] = useState(!PAYWALL_ENABLED);
  const [loading, setLoading] = useState(PAYWALL_ENABLED);
  const [nonce, setNonce] = useState(0);

  const refresh = useCallback(() => setNonce((n) => n + 1), []);

  useEffect(() => {
    // Feature off → the whole site is unlocked, exactly as before.
    if (!PAYWALL_ENABLED) {
      setPremium(true);
      setLoading(false);
      return;
    }
    if (devPremiumOverride()) {
      setPremium(true);
      setLoading(false);
      return;
    }
    if (authLoading) return;
    if (!user || !supabase) {
      setPremium(false);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    supabase
      .from('profiles')
      .select('subscription_status, access_expires_at')
      .eq('id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return;
        const status = data?.subscription_status;
        const activeSub = status === 'active' || status === 'trialing';
        const pass = data?.access_expires_at && new Date(data.access_expires_at as string) > new Date();
        setPremium(Boolean(activeSub || pass));
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user, authLoading, nonce]);

  return { premium, loading, refresh };
}

// ── Stripe checkout / portal helpers ──────────────────────────────────────
async function authHeader(): Promise<Record<string, string>> {
  const token = (await supabase?.auth.getSession())?.data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function postFn<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`/.netlify/functions/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(await authHeader()) },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export type PlanId = 'monthly' | 'annual' | 'week' | 'month';

export async function startCheckout(plan: PlanId): Promise<void> {
  const { url } = await postFn<{ url: string }>('create-checkout-session', { plan });
  window.location.href = url;
}

export async function openBillingPortal(): Promise<void> {
  const { url } = await postFn<{ url: string }>('create-portal-session', {});
  window.location.href = url;
}

// ── UI ─────────────────────────────────────────────────────────────────────

/**
 * Plan display data. The amounts here are *display only* — the real charge is
 * whatever you set on the matching Stripe Price. Keep these labels in sync with
 * Stripe (or they will mislead users). The server maps `id` → a price via env.
 */
export const PLANS: { id: PlanId; name: string; price: string; cadence: string; blurb: string; recurring: boolean }[] = [
  { id: 'monthly', name: 'Monthly', price: '£—', cadence: '/ month', blurb: 'Full access, cancel anytime.', recurring: true },
  { id: 'annual', name: 'Annual', price: '£—', cadence: '/ year', blurb: 'Best value for a full application cycle.', recurring: true },
  { id: 'week', name: '1-week pass', price: '£—', cadence: 'one-off', blurb: 'Cram before a specific interview.', recurring: false },
  { id: 'month', name: '1-month pass', price: '£—', cadence: 'one-off', blurb: 'A single month, no subscription.', recurring: false },
];

export function LockBadge({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider text-soon border border-soon/40 rounded px-1.5 py-0.5 ${className}`}
    >
      ★ Pro
    </span>
  );
}

/**
 * Wrap any premium surface. When entitled (or the feature is off) it renders
 * children; otherwise it renders the paywall. `feature` is used in the copy.
 */
export function Premium({ feature, children }: { feature: string; children: ReactNode }) {
  const { premium, loading } = useEntitlement();
  if (loading) {
    return <div className="text-sm text-muted font-mono">Checking access…</div>;
  }
  if (premium) return <>{children}</>;
  return <Paywall feature={feature} />;
}

export function Paywall({ feature }: { feature: string }) {
  const { user } = useAuth();
  const { refresh } = useEntitlement();
  const [busy, setBusy] = useState<PlanId | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signInWithEmail } = useAuth();
  const [email, setEmail] = useState('');

  // Re-check entitlement when returning from Stripe (success_url adds ?checkout).
  useEffect(() => {
    if (new URLSearchParams(window.location.search).has('checkout')) refresh();
  }, [refresh]);

  async function choose(plan: PlanId) {
    setError(null);
    setBusy(plan);
    try {
      await startCheckout(plan);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not start checkout.');
      setBusy(null);
    }
  }

  async function sendLink(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const err = await signInWithEmail(email.trim());
    if (err) setError(err);
    else setEmailSent(true);
  }

  return (
    <div className="rounded-lg border border-violet/40 bg-plum/15 p-6 max-w-2xl">
      <div className="flex items-center gap-2">
        <LockBadge />
        <h3 className="font-semibold">{feature} is a Pro feature</h3>
      </div>
      <p className="mt-2 text-sm text-muted leading-relaxed">
        Pro unlocks the advanced market-making games, the full options course, the mock interview, the
        downloadable CV template, the project guides, and your saved tracker — everything built to get
        you through the real thing.
      </p>

      {!user ? (
        <div className="mt-5">
          {emailSent ? (
            <p className="text-sm text-open font-mono">✓ Check your email for a sign-in link.</p>
          ) : (
            <form onSubmit={sendLink} className="flex flex-wrap items-end gap-2">
              <div>
                <label className="font-mono text-[11px] uppercase tracking-wider text-muted block mb-1">
                  Sign in to continue
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="bg-bg border border-steel rounded px-3 py-2 text-sm w-64"
                />
              </div>
              <button type="submit" className="rounded-md bg-violet px-4 py-2 text-sm font-medium text-white hover:bg-violet/90">
                Email me a link
              </button>
            </form>
          )}
        </div>
      ) : (
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {PLANS.map((p) => (
            <button
              key={p.id}
              type="button"
              disabled={busy !== null}
              onClick={() => choose(p.id)}
              className="text-left rounded-lg border border-steel bg-panel p-4 hover:border-violet/60 transition-colors disabled:opacity-60"
            >
              <div className="flex items-baseline justify-between">
                <span className="font-semibold text-sm">{p.name}</span>
                <span className="font-mono text-xs text-violet-light">
                  {p.price} <span className="text-muted">{p.cadence}</span>
                </span>
              </div>
              <p className="text-xs text-muted mt-1">{p.blurb}</p>
              <span className="mt-2 inline-block font-mono text-[11px] text-violet-light">
                {busy === p.id ? 'Starting…' : 'Choose →'}
              </span>
            </button>
          ))}
        </div>
      )}

      {error && <p className="mt-3 text-sm text-closed">{error}</p>}
    </div>
  );
}
