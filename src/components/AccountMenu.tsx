import { useState } from 'react';
import { useAuth } from '../lib/auth';
import { AUTH_UI_ENABLED, LockBadge, openBillingPortal, useEntitlement } from '../lib/premium';

/**
 * Header sign-in / account control. Renders nothing until accounts are switched
 * on (AUTH_UI_ENABLED), so the live header is unchanged until launch.
 */
export default function AccountMenu() {
  const { user, loading, signInWithEmail, signInWithGoogle, signOut } = useAuth();
  const { premium } = useEntitlement();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  if (!AUTH_UI_ENABLED) return null;
  if (loading) return <span className="ml-auto font-mono text-[11px] text-muted">…</span>;

  async function sendLink(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const error = await signInWithEmail(email.trim());
    if (error) setErr(error);
    else setSent(true);
  }

  return (
    <div className="ml-auto relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-muted hover:text-fg"
      >
        {user ? (
          <>
            {premium && <LockBadge />}
            <span className="max-w-[10rem] truncate normal-case tracking-normal">{user.email}</span>
          </>
        ) : (
          'Sign in'
        )}
        <span aria-hidden="true">▾</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 rounded-lg border border-steel bg-panel p-4 shadow-xl z-30">
          {user ? (
            <div className="space-y-3">
              <p className="text-sm">
                Signed in as <span className="text-fg">{user.email}</span>
              </p>
              <p className="font-mono text-[11px] text-muted">
                Plan: {premium ? <span className="text-open">Pro</span> : <span className="text-soon">Free</span>}
              </p>
              {premium && (
                <button
                  type="button"
                  onClick={() => openBillingPortal().catch((e) => setErr(e.message))}
                  className="w-full rounded border border-steel px-3 py-2 text-sm hover:border-violet/60 text-left"
                >
                  Manage subscription →
                </button>
              )}
              <button
                type="button"
                onClick={() => { signOut(); setOpen(false); }}
                className="w-full rounded border border-steel px-3 py-2 text-sm hover:border-closed/60 text-left text-muted"
              >
                Sign out
              </button>
            </div>
          ) : sent ? (
            <p className="text-sm text-open">✓ Check your email for a sign-in link.</p>
          ) : (
            <div className="space-y-3">
              <form onSubmit={sendLink} className="space-y-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="w-full bg-bg border border-steel rounded px-3 py-2 text-sm"
                />
                <button type="submit" className="w-full rounded-md bg-violet px-3 py-2 text-sm font-medium text-white hover:bg-violet/90">
                  Email me a sign-in link
                </button>
              </form>
              <button
                type="button"
                onClick={() => signInWithGoogle().catch((e) => setErr(e.message))}
                className="w-full rounded border border-steel px-3 py-2 text-sm hover:border-violet/60"
              >
                Continue with Google
              </button>
            </div>
          )}
          {err && <p className="mt-2 text-xs text-closed">{err}</p>}
        </div>
      )}
    </div>
  );
}
