import { useState } from 'react';
import { useAuth } from '../lib/auth';

/**
 * Email → 6-digit code sign-in. No redirect, so it works regardless of which
 * browser/app opens the email. On success the auth state change updates the UI.
 */
export default function SignInForm() {
  const { signInWithEmail, verifyOtp, signInWithGoogle } = useAuth();
  const [stage, setStage] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    const error = await signInWithEmail(email.trim());
    setBusy(false);
    if (error) setErr(error);
    else setStage('code');
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    const error = await verifyOtp(email.trim(), code.trim());
    setBusy(false);
    if (error) setErr(error);
    // success → onAuthStateChange swaps the UI
  }

  if (stage === 'code') {
    return (
      <form onSubmit={verify} className="space-y-2">
        <p className="text-sm text-muted">
          Enter the code sent to <span className="text-fg">{email}</span>.
        </p>
        <input
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={10}
          required
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
          placeholder="code from email"
          className="w-full bg-bg border border-steel rounded px-3 py-2 text-lg font-mono tracking-[0.3em] text-center"
        />
        <button
          type="submit"
          disabled={busy || code.length < 6}
          className="w-full rounded-md bg-violet px-3 py-2 text-sm font-medium text-white hover:bg-violet/90 disabled:opacity-60"
        >
          {busy ? 'Verifying…' : 'Verify & sign in'}
        </button>
        <button
          type="button"
          onClick={() => { setStage('email'); setCode(''); setErr(null); }}
          className="w-full text-xs text-muted hover:text-fg"
        >
          ← use a different email
        </button>
        {err && <p className="text-xs text-closed">{err}</p>}
      </form>
    );
  }

  return (
    <div className="space-y-3">
      <form onSubmit={send} className="space-y-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          className="w-full bg-bg border border-steel rounded px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-md bg-violet px-3 py-2 text-sm font-medium text-white hover:bg-violet/90 disabled:opacity-60"
        >
          {busy ? 'Sending…' : 'Email me a 6-digit code'}
        </button>
      </form>
      <button
        type="button"
        onClick={() => signInWithGoogle().catch(() => {})}
        className="w-full rounded border border-steel px-3 py-2 text-sm hover:border-violet/60"
      >
        Continue with Google
      </button>
      {err && <p className="text-xs text-closed">{err}</p>}
    </div>
  );
}
