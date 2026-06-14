import { useState } from 'react';
import { blackScholes } from '../../lib/blackScholes';

interface Field {
  key: 'spot' | 'strike' | 't' | 'r' | 'vol';
  label: string;
  min: number;
  max: number;
  step: number;
  /** Display as a percentage (value stored as a fraction). */
  pct?: boolean;
}

const fields: Field[] = [
  { key: 'spot', label: 'Spot (S)', min: 1, max: 300, step: 1 },
  { key: 'strike', label: 'Strike (K)', min: 1, max: 300, step: 1 },
  { key: 't', label: 'Years to expiry (T)', min: 0.05, max: 5, step: 0.05 },
  { key: 'r', label: 'Rate (r)', min: 0, max: 0.2, step: 0.005, pct: true },
  { key: 'vol', label: 'Volatility (σ)', min: 0.01, max: 1, step: 0.01, pct: true },
];

/** Call value vs spot, with the intrinsic-value "hockey stick" underneath. */
function PriceCurve({ strike, t, r, vol }: { strike: number; t: number; r: number; vol: number }) {
  const W = 480;
  const H = 220;
  const pad = { l: 40, r: 12, t: 12, b: 24 };
  const sMin = Math.max(1, strike * 0.4);
  const sMax = strike * 1.8;

  const N = 120;
  const value: Array<[number, number]> = [];
  const intrinsic: Array<[number, number]> = [];
  let vMax = 0;
  for (let i = 0; i <= N; i++) {
    const s = sMin + ((sMax - sMin) * i) / N;
    const c = blackScholes({ spot: s, strike, t, r, vol }).call;
    const intr = Math.max(0, s - strike);
    value.push([s, c]);
    intrinsic.push([s, intr]);
    vMax = Math.max(vMax, c, intr);
  }
  vMax *= 1.1;

  const x = (s: number) => pad.l + ((s - sMin) / (sMax - sMin)) * (W - pad.l - pad.r);
  const y = (v: number) => pad.t + (1 - v / vMax) * (H - pad.t - pad.b);
  const toPath = (pts: Array<[number, number]>) =>
    pts.map(([s, v], i) => `${i === 0 ? 'M' : 'L'}${x(s).toFixed(1)},${y(v).toFixed(1)}`).join(' ');

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Call value and intrinsic value vs spot" className="w-full h-auto">
      <line x1={x(strike)} x2={x(strike)} y1={pad.t} y2={H - pad.b} stroke="#23252c" strokeWidth="1" />
      <text x={x(strike)} y={H - 8} textAnchor="middle" fill="#7e838f" fontSize="11" fontFamily="JetBrains Mono, monospace">
        K={strike}
      </text>
      <path d={toPath(intrinsic)} fill="none" stroke="#7e838f" strokeWidth="1.5" strokeDasharray="4 4" />
      <path d={toPath(value)} fill="none" stroke="#6d4aff" strokeWidth="2.5" />
      <text x={pad.l} y={pad.t + 4} fill="#a78bfa" fontSize="10" fontFamily="JetBrains Mono, monospace">
        call value
      </text>
      <text x={pad.l} y={pad.t + 16} fill="#7e838f" fontSize="10" fontFamily="JetBrains Mono, monospace">
        ---- intrinsic
      </text>
    </svg>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-steel bg-bg px-3 py-2">
      <p className="font-mono text-[10px] uppercase tracking-wider text-muted">{label}</p>
      <p className="font-mono text-sm text-fg tabular-nums">{value}</p>
    </div>
  );
}

/** Interactive Black-Scholes calculator for Chapter 4. */
export default function BlackScholesLab() {
  const [inputs, setInputs] = useState({ spot: 100, strike: 100, t: 1, r: 0.05, vol: 0.2 });
  const set = (key: Field['key'], v: number) => setInputs((s) => ({ ...s, [key]: v }));
  const res = blackScholes(inputs);

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      <div className="space-y-3">
        {fields.map((f) => {
          const raw = inputs[f.key];
          const shown = f.pct ? Math.round(raw * 1000) / 10 : raw;
          return (
            <label key={f.key} className="block">
              <span className="flex items-center justify-between font-mono text-[11px] text-muted">
                <span>{f.label}</span>
                <span className="text-violet-light tabular-nums">
                  {shown}
                  {f.pct ? '%' : ''}
                </span>
              </span>
              <input
                type="range"
                min={f.min}
                max={f.max}
                step={f.step}
                value={raw}
                onChange={(e) => set(f.key, Number(e.target.value))}
                className="mt-1 w-full accent-[#6d4aff]"
              />
            </label>
          );
        })}
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Call" value={`£${res.call.toFixed(2)}`} />
          <Stat label="Put" value={`£${res.put.toFixed(2)}`} />
          <Stat label="Call Δ" value={res.callDelta.toFixed(3)} />
          <Stat label="Put Δ" value={res.putDelta.toFixed(3)} />
          <Stat label="Gamma" value={res.gamma.toFixed(4)} />
          <Stat label="Vega /1%" value={(res.vega / 100).toFixed(3)} />
          <Stat label="Call Θ /day" value={(res.callTheta / 365).toFixed(3)} />
          <Stat label="d₁ / d₂" value={`${res.d1.toFixed(2)} / ${res.d2.toFixed(2)}`} />
        </div>
        <div className="rounded-lg border border-steel bg-panel p-4">
          <PriceCurve strike={inputs.strike} t={inputs.t} r={inputs.r} vol={inputs.vol} />
          <p className="mt-1 font-mono text-[10px] text-muted">
            The gap between the curves is time value — largest at the money, vanishing as the option goes
            deep ITM or OTM, or as expiry nears.
          </p>
        </div>
      </div>
    </div>
  );
}
