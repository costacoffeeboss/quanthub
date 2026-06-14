import type { ReactNode } from 'react';

/**
 * Shared presentational building blocks for the Options course lessons.
 * Kept deliberately small and on-brand (panel / steel / violet / plum tokens)
 * so chapter files can focus on content, not markup.
 */

/** Standard body-paragraph classes — import and spread onto <p>. */
export const prose = 'text-sm leading-relaxed text-fg/90';

/** Section heading. */
export function H({ children }: { children: ReactNode }) {
  return <h2 className="text-xl font-bold">{children}</h2>;
}

/** Sub-section heading within a section. */
export function H3({ children }: { children: ReactNode }) {
  return <h3 className="font-mono text-sm uppercase tracking-wider text-violet-light pt-1">{children}</h3>;
}

/** A formula or identity in the mono callout style. */
export function Formula({ children }: { children: ReactNode }) {
  return (
    <p className="font-mono text-sm text-violet-light bg-panel border border-steel rounded px-4 py-3 text-center">
      {children}
    </p>
  );
}

/** The single most important takeaway of a section. */
export function KeyIdea({ children }: { children: ReactNode }) {
  return (
    <aside className="rounded-lg border border-violet/40 bg-plum/20 p-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-violet-light mb-1">Key idea</p>
      <div className="text-sm leading-relaxed">{children}</div>
    </aside>
  );
}

/** A fully worked numeric example. */
export function Example({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <aside className="rounded-lg border border-steel bg-panel p-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted mb-2">
        {title ?? 'Worked example'}
      </p>
      <div className="text-sm leading-relaxed space-y-2">{children}</div>
    </aside>
  );
}

/** Plain-English unpacking of a piece of jargon. */
export function PlainEnglish({ children }: { children: ReactNode }) {
  return (
    <aside className="border-l-2 border-violet/60 pl-4 py-1">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted mb-1">In plain English</p>
      <div className="text-sm leading-relaxed text-muted">{children}</div>
    </aside>
  );
}

/** How this topic actually shows up in interviews. */
export function InterviewAngle({ children }: { children: ReactNode }) {
  return (
    <aside className="rounded-lg border border-steel bg-bg p-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-soon mb-1">The interview angle</p>
      <div className="text-sm leading-relaxed">{children}</div>
    </aside>
  );
}

/** A compact reference table. Pass an array of rows; first row is the header. */
export function Table({ headers, rows }: { headers: string[]; rows: ReactNode[][] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-steel">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-panel">
            {headers.map((h) => (
              <th
                key={h}
                className="text-left font-mono text-[11px] uppercase tracking-wider text-muted px-3 py-2 border-b border-steel"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-steel/60 last:border-0">
              {row.map((cell, j) => (
                <td key={j} className={`px-3 py-2 align-top ${j === 0 ? 'font-medium' : 'text-muted'}`}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** A downward equity skew, drawn schematically (used in the volatility chapter). */
export function SkewChart() {
  const W = 480;
  const H = 200;
  const pad = { l: 40, r: 16, t: 16, b: 28 };
  const pts: string[] = [];
  for (let i = 0; i <= 60; i++) {
    const t = i / 60; // moneyness left(low strike)→right(high strike)
    const iv = 0.34 - 0.22 * t + 0.06 * t * t;
    const x = pad.l + t * (W - pad.l - pad.r);
    const y = pad.t + (1 - (iv - 0.15) / 0.25) * (H - pad.t - pad.b);
    pts.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Equity implied-volatility skew" className="w-full h-auto">
      <line x1={pad.l} x2={W - pad.r} y1={H - pad.b} y2={H - pad.b} stroke="#23252c" strokeWidth="1" />
      <path d={pts.join(' ')} fill="none" stroke="#6d4aff" strokeWidth="2.5" />
      <text x={pad.l} y={H - 8} fill="#7e838f" fontSize="11" fontFamily="JetBrains Mono, monospace">
        low strikes (puts)
      </text>
      <text x={W - pad.r} y={H - 8} textAnchor="end" fill="#7e838f" fontSize="11" fontFamily="JetBrains Mono, monospace">
        high strikes (calls)
      </text>
      <text x={pad.l - 6} y={pad.t + 8} textAnchor="end" fill="#7e838f" fontSize="11" fontFamily="JetBrains Mono, monospace">
        IV
      </text>
    </svg>
  );
}
