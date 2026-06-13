import { useState } from 'react';

interface Leg {
  kind: 'call' | 'put';
  qty: number; // positive = long, negative = short
  strike: number;
  premium: number;
}

interface Strategy {
  id: string;
  name: string;
  note: string;
  legs: Leg[];
}

const strategies: Strategy[] = [
  { id: 'long-call', name: 'Long call', note: 'Bullish; loss capped at premium, unlimited upside.', legs: [{ kind: 'call', qty: 1, strike: 100, premium: 5 }] },
  { id: 'short-call', name: 'Short call', note: 'Collect premium; unlimited risk above the strike.', legs: [{ kind: 'call', qty: -1, strike: 100, premium: 5 }] },
  { id: 'long-put', name: 'Long put', note: 'Bearish; pays off as the underlying falls below strike.', legs: [{ kind: 'put', qty: 1, strike: 100, premium: 5 }] },
  { id: 'short-put', name: 'Short put', note: 'Collect premium; large risk if the underlying collapses.', legs: [{ kind: 'put', qty: -1, strike: 100, premium: 5 }] },
  {
    id: 'straddle',
    name: 'Long straddle',
    note: 'Long a call and a put at the same strike — a bet on a big move either way.',
    legs: [
      { kind: 'call', qty: 1, strike: 100, premium: 4 },
      { kind: 'put', qty: 1, strike: 100, premium: 4 },
    ],
  },
  {
    id: 'strangle',
    name: 'Long strangle',
    note: 'Cheaper than a straddle: out-of-the-money call and put; needs a bigger move.',
    legs: [
      { kind: 'put', qty: 1, strike: 90, premium: 2.5 },
      { kind: 'call', qty: 1, strike: 110, premium: 2.5 },
    ],
  },
  {
    id: 'bull-spread',
    name: 'Bull call spread',
    note: 'Buy a lower-strike call, sell a higher-strike call: capped cost, capped profit.',
    legs: [
      { kind: 'call', qty: 1, strike: 95, premium: 7 },
      { kind: 'call', qty: -1, strike: 105, premium: 3 },
    ],
  },
  {
    id: 'bear-spread',
    name: 'Bear put spread',
    note: 'Buy a higher-strike put, sell a lower-strike put: a defined-risk bearish bet.',
    legs: [
      { kind: 'put', qty: 1, strike: 105, premium: 7 },
      { kind: 'put', qty: -1, strike: 95, premium: 3 },
    ],
  },
  {
    id: 'butterfly',
    name: 'Long call butterfly',
    note: 'Buy the wings, sell 2× the body: a cheap bet that the underlying pins the middle strike.',
    legs: [
      { kind: 'call', qty: 1, strike: 90, premium: 12 },
      { kind: 'call', qty: -2, strike: 100, premium: 6 },
      { kind: 'call', qty: 1, strike: 110, premium: 2.5 },
    ],
  },
];

function payoffAt(legs: Leg[], s: number): number {
  return legs.reduce((acc, leg) => {
    const intrinsic = leg.kind === 'call' ? Math.max(0, s - leg.strike) : Math.max(0, leg.strike - s);
    return acc + leg.qty * (intrinsic - leg.premium);
  }, 0);
}

function PayoffChart({ legs }: { legs: Leg[] }) {
  const W = 640;
  const H = 300;
  const pad = { l: 48, r: 16, t: 16, b: 28 };

  const strikes = legs.map((l) => l.strike);
  const sMin = Math.max(0, Math.min(...strikes) - 40);
  const sMax = Math.max(...strikes) + 40;

  const N = 160;
  const pts: Array<[number, number]> = [];
  let pMin = Infinity;
  let pMax = -Infinity;
  for (let i = 0; i <= N; i++) {
    const s = sMin + ((sMax - sMin) * i) / N;
    const p = payoffAt(legs, s);
    pts.push([s, p]);
    pMin = Math.min(pMin, p);
    pMax = Math.max(pMax, p);
  }
  const span = Math.max(1, pMax - pMin);
  pMin -= span * 0.15;
  pMax += span * 0.15;

  const x = (s: number) => pad.l + ((s - sMin) / (sMax - sMin)) * (W - pad.l - pad.r);
  const y = (p: number) => pad.t + ((pMax - p) / (pMax - pMin)) * (H - pad.t - pad.b);

  const line = pts.map(([s, p], i) => `${i === 0 ? 'M' : 'L'}${x(s).toFixed(1)},${y(p).toFixed(1)}`).join(' ');

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="Profit and loss at expiry across underlying prices"
      className="w-full h-auto"
    >
      {/* zero P&L line */}
      {pMin < 0 && pMax > 0 && (
        <line x1={pad.l} x2={W - pad.r} y1={y(0)} y2={y(0)} stroke="#7e838f" strokeWidth="1" strokeDasharray="4 4" />
      )}
      {/* strike markers */}
      {strikes.map((k, i) => (
        <g key={i}>
          <line x1={x(k)} x2={x(k)} y1={pad.t} y2={H - pad.b} stroke="#23252c" strokeWidth="1" />
          <text x={x(k)} y={H - 8} textAnchor="middle" fill="#7e838f" fontSize="11" fontFamily="JetBrains Mono, monospace">
            {k}
          </text>
        </g>
      ))}
      {/* axes labels */}
      <text x={pad.l - 6} y={y(0) + 4} textAnchor="end" fill="#7e838f" fontSize="11" fontFamily="JetBrains Mono, monospace">
        0
      </text>
      <text x={pad.l - 6} y={pad.t + 10} textAnchor="end" fill="#3ddc97" fontSize="11" fontFamily="JetBrains Mono, monospace">
        +{(pMax - span * 0.15 > 0 ? pMax - span * 0.15 : pMax).toFixed(0)}
      </text>
      <text x={pad.l - 6} y={H - pad.b} textAnchor="end" fill="#e5484d" fontSize="11" fontFamily="JetBrains Mono, monospace">
        {(pMin + span * 0.15).toFixed(0)}
      </text>
      {/* payoff line */}
      <path d={line} fill="none" stroke="#6d4aff" strokeWidth="2.5" />
    </svg>
  );
}

function miniPath(fn: (t: number) => number, w = 120, h = 48): string {
  // fn maps [0,1] -> [0,1]; draw with small padding
  const pts: string[] = [];
  for (let i = 0; i <= 40; i++) {
    const t = i / 40;
    const v = Math.min(1, Math.max(0, fn(t)));
    pts.push(`${i === 0 ? 'M' : 'L'}${(4 + t * (w - 8)).toFixed(1)},${(h - 6 - v * (h - 12)).toFixed(1)}`);
  }
  return pts.join(' ');
}

const greeks = [
  {
    name: 'Delta (Δ)',
    curve: miniPath((t) => 1 / (1 + Math.exp(-10 * (t - 0.5)))),
    caption: 'Call delta vs spot: 0 deep OTM → 1 deep ITM',
    text: 'How much the option price moves per £1 move in the underlying. A 0.5-delta call behaves like holding half a share. Delta is also a rough market-implied probability of finishing in the money — at-the-money options sit near 0.5 because it is a coin flip.',
  },
  {
    name: 'Gamma (Γ)',
    curve: miniPath((t) => Math.exp(-((t - 0.5) ** 2) / 0.02)),
    caption: 'Gamma peaks at the strike',
    text: 'How fast delta itself changes. Gamma is the curvature of your position: long gamma means moves help you in both directions (your delta grows as the market goes your way). It is largest at the money near expiry — exactly where hedging gets frantic.',
  },
  {
    name: 'Vega (ν)',
    curve: miniPath((t) => Math.exp(-((t - 0.5) ** 2) / 0.045)),
    caption: 'Vega is largest at the money',
    text: 'Sensitivity to implied volatility. Options are bets on movement, so more expected movement makes them worth more — long options are long vega. A vol trader’s P&L often comes from vega, not direction.',
  },
  {
    name: 'Theta (Θ)',
    curve: miniPath((t) => 1 - t * t * t),
    caption: 'Option value bleeding as expiry nears',
    text: 'Time decay: what an option loses each day if nothing else changes. The flip side of gamma — long options pay theta to own convexity, short options collect theta for bearing it. Decay accelerates into expiry for at-the-money options.',
  },
  {
    name: 'Rho (ρ)',
    curve: miniPath((t) => 0.25 + t * 0.5),
    caption: 'Mild, near-linear rate sensitivity',
    text: 'Sensitivity to interest rates — usually the least interesting Greek for short-dated equity options, but it matters for long-dated options and was very real again when rates left zero. Higher rates raise call values (carrying cost of the hedge) and lower puts.',
  },
];

export default function Options() {
  const [stratId, setStratId] = useState('straddle');
  const template = strategies.find((s) => s.id === stratId)!;
  const [legs, setLegs] = useState<Leg[]>(template.legs);

  function pickStrategy(id: string) {
    setStratId(id);
    setLegs(strategies.find((s) => s.id === id)!.legs.map((l) => ({ ...l })));
  }

  function updateLeg(i: number, field: 'strike' | 'premium', value: number) {
    setLegs((ls) => ls.map((l, j) => (j === i ? { ...l, [field]: value } : l)));
  }

  const cost = legs.reduce((a, l) => a + l.qty * l.premium, 0);

  return (
    <div className="space-y-12">
      <header>
        <h1 className="text-2xl font-bold">Options Theory</h1>
        <p className="mt-2 text-muted max-w-2xl text-sm">
          The intuition layer: build payoffs, internalise the Greeks, and see why parity is not
          optional. Light on formulas on purpose — interviews reward understanding over recall.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-bold">Payoff diagram builder</h2>
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <div className="space-y-4">
            <label className="block">
              <span className="font-mono text-xs uppercase tracking-wider text-muted">Strategy</span>
              <select
                className="mt-1 w-full bg-panel border border-steel rounded px-2 py-2 font-mono text-sm"
                value={stratId}
                onChange={(e) => pickStrategy(e.target.value)}
              >
                {strategies.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
            <p className="text-sm text-muted">{template.note}</p>

            <div className="space-y-3">
              {legs.map((leg, i) => (
                <fieldset key={i} className="rounded border border-steel bg-panel p-3">
                  <legend className="font-mono text-[11px] uppercase tracking-wider px-1 text-violet-light">
                    {leg.qty > 0 ? `Long ${leg.qty > 1 ? leg.qty + '× ' : ''}` : `Short ${Math.abs(leg.qty) > 1 ? Math.abs(leg.qty) + '× ' : ''}`}
                    {leg.kind}
                  </legend>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="block">
                      <span className="font-mono text-[11px] text-muted">Strike</span>
                      <input
                        type="number"
                        min={50}
                        max={150}
                        step={1}
                        value={leg.strike}
                        onChange={(e) => updateLeg(i, 'strike', Number(e.target.value))}
                        className="mt-1 w-full bg-bg border border-steel rounded px-2 py-1.5 font-mono text-sm"
                      />
                    </label>
                    <label className="block">
                      <span className="font-mono text-[11px] text-muted">Premium</span>
                      <input
                        type="number"
                        min={0}
                        max={50}
                        step={0.5}
                        value={leg.premium}
                        onChange={(e) => updateLeg(i, 'premium', Number(e.target.value))}
                        className="mt-1 w-full bg-bg border border-steel rounded px-2 py-1.5 font-mono text-sm"
                      />
                    </label>
                  </div>
                </fieldset>
              ))}
            </div>

            <p className="font-mono text-xs text-muted">
              Net premium:{' '}
              <span className={cost >= 0 ? 'text-closed' : 'text-open'}>
                {cost >= 0 ? `pay ${cost.toFixed(2)}` : `collect ${(-cost).toFixed(2)}`}
              </span>
            </p>
          </div>

          <div className="rounded-lg border border-steel bg-panel p-4">
            <p className="font-mono text-xs uppercase tracking-wider text-muted mb-2">
              P&amp;L at expiry vs underlying price
            </p>
            <PayoffChart legs={legs} />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold">The Greeks, plainly</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {greeks.map((g) => (
            <article key={g.name} className="rounded-lg border border-steel bg-panel p-4">
              <h3 className="font-mono text-sm text-violet-light">{g.name}</h3>
              <svg viewBox="0 0 120 48" className="w-full h-12 my-2" aria-hidden="true">
                <path d={g.curve} fill="none" stroke="#a78bfa" strokeWidth="2" />
              </svg>
              <p className="font-mono text-[10px] text-muted mb-2">{g.caption}</p>
              <p className="text-sm leading-relaxed">{g.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-3 max-w-3xl">
        <h2 className="text-xl font-bold">Put-call parity</h2>
        <p className="font-mono text-sm text-violet-light bg-panel border border-steel rounded px-4 py-3">
          Call − Put = Spot − PV(Strike)
        </p>
        <div className="text-sm leading-relaxed space-y-3">
          <p>
            Buy a call and sell a put at the same strike and expiry, and look at what you hold at
            expiry: above the strike you exercise the call; below it the put is exercised against
            you. Either way <strong>you end up owning the stock at the strike price</strong>. So
            call-minus-put is exactly a forward purchase of the stock — and a forward&apos;s value
            today is spot minus the discounted strike.
          </p>
          <p>
            This is an arbitrage relationship, not a model: it assumes nothing about volatility or
            distributions. If it breaks, you can buy the cheap side, sell the rich side, and lock
            in riskless profit — which is why it doesn&apos;t break. Interviewers love it because
            it lets you price a put from a call (or spot a mispriced one) with no Black-Scholes at
            all, and because it explains why calls and puts at the same strike must carry the{' '}
            <em>same implied volatility</em>.
          </p>
        </div>
      </section>

      <section className="space-y-3 max-w-3xl">
        <h2 className="text-xl font-bold">Black-Scholes intuition</h2>
        <div className="text-sm leading-relaxed space-y-3">
          <p>
            Forget the PDE for a moment. Black-Scholes says: an option&apos;s payoff can be{' '}
            <strong>manufactured</strong> by continuously trading the stock — hold delta shares,
            adjust as delta changes. If you can manufacture it, its price must equal the
            manufacturing cost, or someone arbitrages the difference. The formula is just that
            cost, computed under the assumption that prices diffuse smoothly with a known
            volatility.
          </p>
          <p>
            The replication view explains the Greeks in one stroke: delta is your hedge ratio;
            gamma is how often the hedge needs adjusting; theta is the rent you pay (or collect)
            for the convexity of the position; vega is the sensitivity to the volatility number
            you plugged in. It also explains the famous result that the expected{' '}
            <em>direction</em> of the stock does not appear in the formula — the hedge removes
            direction, leaving only the cost of rebalancing, which depends on volatility alone.
          </p>
          <p>
            What to actually say in an interview: price ≈ expected discounted payoff under
            risk-neutral probabilities; hedging is what makes risk-neutral pricing legitimate;
            and in practice traders quote implied vol, not price — the formula is a translation
            device between the two. Knowing its assumptions fail (volatility is not constant,
            prices jump, hedging is not free) and that the vol surface exists to patch this is
            worth more than reciting the derivation.
          </p>
        </div>
      </section>
    </div>
  );
}
