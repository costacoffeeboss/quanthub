import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { PLANS, startCheckout, openBillingPortal, useEntitlement, type PlanId } from '../lib/premium';
import SignInForm from '../components/SignInForm';

const features: { title: string; body: string }[] = [
  {
    title: 'Advanced market-making games',
    body: "Adverse Selection and Hold'em Market Maker — the hardest, most interview-like games, with live feedback on every quote.",
  },
  {
    title: 'The full options course',
    body: 'Every chapter beyond the first — Black–Scholes, the Greeks, volatility — with the exams that lock in your progress.',
  },
  {
    title: 'The mock interview',
    body: 'A staged, graded brainteaser interview with follow-up probes. The closest thing to a real first round.',
  },
  {
    title: 'The CV template',
    body: 'The downloadable one-page quant CV in the house format, ready to fill in.',
  },
  {
    title: 'Coding project guides',
    body: 'Step-by-step builds (an options pricer, a live trading sim) with code, checkpoints and interview framing.',
  },
  {
    title: 'Your saved tracker',
    body: "Save application status, stars and notes across every firm you're targeting.",
  },
];

const faqs: { q: string; a: ReactNode }[] = [
  {
    q: 'Can I cancel anytime?',
    a: 'Yes — from the account menu → Manage subscription. You keep access until the end of the period you’ve already paid for.',
  },
  {
    q: 'What’s the difference between a pass and a subscription?',
    a: 'A subscription renews automatically (monthly or annual). A one-off pass gives you a fixed window — e.g. a week — and does not renew. Handy to cram before a specific interview.',
  },
  { q: 'How do I pay?', a: 'Securely via Stripe. We never see or store your card details.' },
  {
    q: 'Do you offer refunds?',
    a: (
      <>
        See our <Link to="/refunds">Refund &amp; Cancellation Policy</Link> for the details and your
        statutory rights.
      </>
    ),
  },
];

export default function Pro() {
  const { user } = useAuth();
  const { premium, loading } = useEntitlement();
  const [busy, setBusy] = useState<PlanId | null>(null);
  const [needSignIn, setNeedSignIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function choose(plan: PlanId) {
    if (!user) {
      setNeedSignIn(true);
      return;
    }
    setError(null);
    setBusy(plan);
    try {
      await startCheckout(plan);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not start checkout.');
      setBusy(null);
    }
  }

  return (
    <div className="space-y-14">
      <header className="text-center max-w-2xl mx-auto">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-violet-light">Quant Interview Pro</p>
        <h1 className="mt-2 text-3xl font-bold">Everything you need to walk in ready.</h1>
        <p className="mt-3 text-muted text-sm leading-relaxed">
          One upgrade unlocks the hardest games, the full options course, the mock interview, the CV
          template, the project guides and your saved tracker — the whole toolkit, built to get you
          through the real process.
        </p>
      </header>

      {premium && !loading && (
        <div className="mx-auto max-w-2xl rounded-lg border border-open/40 bg-open/10 p-4 text-center">
          <p className="text-sm">
            You’re on <strong className="text-open">Pro</strong> — you have full access. 🎉
          </p>
          <button
            type="button"
            onClick={() => openBillingPortal().catch((e) => setError(e.message))}
            className="mt-2 font-mono text-xs text-violet-light hover:underline"
          >
            Manage subscription →
          </button>
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <article key={f.title} className="rounded-lg border border-steel bg-panel p-4">
            <h3 className="font-semibold text-sm">{f.title}</h3>
            <p className="text-[13px] text-muted mt-1 leading-relaxed">{f.body}</p>
          </article>
        ))}
      </section>

      <section>
        <h2 className="text-xl font-bold text-center">Choose your plan</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3 max-w-3xl mx-auto">
          {PLANS.map((p) => (
            <div key={p.id} className="rounded-lg border border-steel bg-panel p-5 flex flex-col">
              <h3 className="font-semibold">{p.name}</h3>
              <p className="mt-1">
                <span className="text-2xl font-bold">{p.price}</span>{' '}
                <span className="text-muted text-sm">{p.cadence}</span>
              </p>
              <p className="text-[13px] text-muted mt-2 flex-1">{p.blurb}</p>
              {premium ? (
                <span className="mt-4 rounded-md border border-steel px-4 py-2 text-sm text-muted text-center">
                  Included
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => choose(p.id)}
                  disabled={busy !== null}
                  className="mt-4 rounded-md bg-violet px-4 py-2 text-sm font-medium text-white hover:bg-violet/90 disabled:opacity-60"
                >
                  {busy === p.id ? 'Starting…' : 'Choose'}
                </button>
              )}
            </div>
          ))}
        </div>

        {error && <p className="mt-3 text-center text-sm text-closed">{error}</p>}

        {needSignIn && !user && (
          <div className="mt-6 mx-auto max-w-sm rounded-lg border border-violet/40 bg-plum/15 p-4">
            <p className="font-mono text-[11px] uppercase tracking-wider text-muted mb-2">Sign in to subscribe</p>
            <SignInForm />
          </div>
        )}

        <p className="mt-4 text-center text-[11px] text-muted">
          By subscribing you agree to our{' '}
          <Link to="/terms" className="text-violet-light underline">Terms</Link> and{' '}
          <Link to="/privacy" className="text-violet-light underline">Privacy Policy</Link>. Cancel anytime.
        </p>
      </section>

      <section className="max-w-2xl mx-auto">
        <h2 className="text-xl font-bold">FAQ</h2>
        <dl className="mt-4 space-y-4">
          {faqs.map((f) => (
            <div key={f.q}>
              <dt className="font-semibold text-sm">{f.q}</dt>
              <dd className="text-[13px] text-muted mt-1 leading-relaxed [&_a]:text-violet-light [&_a]:underline">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
