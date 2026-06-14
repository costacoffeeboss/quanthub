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

/** The five-Greek explainer grid, extracted from the old Options page for Chapter 3. */
export default function GreeksGrid() {
  return (
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
  );
}
