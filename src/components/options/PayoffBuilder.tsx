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

/**
 * Interactive payoff-diagram builder: pick a strategy template, tweak strikes
 * and premiums, and watch the expiry P&L curve update. Extracted from the old
 * Options page so it can be embedded inside Chapter 1.
 */
export default function PayoffBuilder() {
  const [stratId, setStratId] = useState('long-call');
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
  );
}
