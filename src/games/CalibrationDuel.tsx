import { useState } from 'react';
import { usePersistentState } from '../lib/storage';

/**
 * Give an 80% confidence interval for each estimation question. Calibrated
 * players contain the answer ~80% of the time — no more (overcautious), no less
 * (overconfident). Containing intervals score more when tighter; misses are
 * penalised. Lifetime hit-rate persists so you can see your calibration trend.
 */

interface EstQ {
  prompt: string;
  answer: number;
  unit: string;
  note?: string;
}

// Figures are approximate / rounded; the point is calibration, not trivia precision.
const BANK: EstQ[] = [
  { prompt: 'Height of Mount Everest', answer: 8849, unit: 'm' },
  { prompt: 'Number of bones in the adult human body', answer: 206, unit: 'bones' },
  { prompt: 'Speed of light in vacuum', answer: 299792, unit: 'km/s' },
  { prompt: 'Year the first iPhone was released', answer: 2007, unit: '' },
  { prompt: 'Number of UN member states', answer: 193, unit: 'countries' },
  { prompt: 'Greater London population', answer: 8900000, unit: 'people', note: '≈ 8.9 million' },
  { prompt: 'Average Earth–Moon distance', answer: 384400, unit: 'km' },
  { prompt: 'Keys on a standard piano', answer: 88, unit: 'keys' },
  { prompt: 'Marathon distance', answer: 42195, unit: 'm', note: '42.195 km' },
  { prompt: 'Elements in the periodic table', answer: 118, unit: 'elements' },
  { prompt: 'Seconds in a day', answer: 86400, unit: 's' },
  { prompt: 'Height of the Burj Khalifa', answer: 828, unit: 'm' },
  { prompt: 'Atomic number of gold', answer: 79, unit: '' },
  { prompt: 'Speed of sound in air at sea level', answer: 343, unit: 'm/s' },
  { prompt: 'Length of the River Nile', answer: 6650, unit: 'km' },
  { prompt: 'World population', answer: 8100000000, unit: 'people', note: '≈ 8.1 billion' },
  { prompt: 'Earth’s equatorial circumference', answer: 40075, unit: 'km' },
  { prompt: 'Adult human teeth', answer: 32, unit: 'teeth' },
  { prompt: 'Year the Berlin Wall fell', answer: 1989, unit: '' },
  { prompt: 'US population', answer: 335000000, unit: 'people', note: '≈ 335 million' },
  { prompt: 'Boiling point of water at sea level', answer: 100, unit: '°C' },
  { prompt: 'Squares on a chessboard', answer: 64, unit: 'squares' },
  { prompt: 'Diameter of the Earth', answer: 12742, unit: 'km' },
  { prompt: 'Number of bones a baby is born with', answer: 300, unit: 'bones', note: 'approx; many fuse' },
];

const ROUNDS = 8;
const btnCls =
  'font-mono text-sm px-5 py-2.5 rounded bg-violet text-white hover:bg-violet-light hover:text-bg transition-colors';
const btn2Cls = 'font-mono text-sm px-4 py-2 rounded border border-violet/60 text-violet-light hover:bg-violet/15';
const inputCls = 'bg-bg border border-steel rounded px-3 py-2 font-mono text-sm w-full';

function shuffle<T>(a: T[]): T[] {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; }
  return r;
}

interface Lifetime { hits: number; total: number; }

interface RoundResult {
  q: EstQ;
  lo: number;
  hi: number;
  contained: boolean;
  points: number;
}

export default function CalibrationDuel() {
  const [lifetime, setLifetime] = usePersistentState<Lifetime>('qh:calibration-lifetime', { hits: 0, total: 0 });
  const [best, setBest] = usePersistentState<number | null>('qh:hiscore:calibration', null);
  const [phase, setPhase] = useState<'idle' | 'ask' | 'reveal' | 'done'>('idle');
  const [qs, setQs] = useState<EstQ[]>([]);
  const [idx, setIdx] = useState(0);
  const [lo, setLo] = useState('');
  const [hi, setHi] = useState('');
  const [results, setResults] = useState<RoundResult[]>([]);
  const [last, setLast] = useState<RoundResult | null>(null);
  const [err, setErr] = useState('');

  function start() {
    setQs(shuffle(BANK).slice(0, ROUNDS));
    setIdx(0);
    setLo('');
    setHi('');
    setResults([]);
    setLast(null);
    setErr('');
    setPhase('ask');
  }

  function submit() {
    const l = Number(lo), h = Number(hi);
    if (lo.trim() === '' || hi.trim() === '' || Number.isNaN(l) || Number.isNaN(h)) return setErr('Enter a low and a high bound.');
    if (h < l) return setErr('High bound must be ≥ low bound.');
    setErr('');
    const q = qs[idx];
    const contained = q.answer >= l && q.answer <= h;
    const relWidth = (h - l) / Math.max(1, Math.abs(q.answer));
    const points = contained ? Math.max(1, Math.round(10 - 5 * relWidth)) : -8;
    const rec: RoundResult = { q, lo: l, hi: h, contained, points };
    setResults((r) => [...r, rec]);
    setLast(rec);
    setLifetime((lt) => ({ hits: lt.hits + (contained ? 1 : 0), total: lt.total + 1 }));
    setPhase('reveal');
  }

  function next() {
    if (idx + 1 >= qs.length) {
      const total = results.reduce((a, r) => a + r.points, 0);
      setBest((b) => (b === null || total > b ? total : b));
      setPhase('done');
    } else {
      setIdx((i) => i + 1);
      setLo('');
      setHi('');
      setPhase('ask');
    }
  }

  const total = results.reduce((a, r) => a + r.points, 0);
  const roundHits = results.filter((r) => r.contained).length;
  const lifeRate = lifetime.total > 0 ? Math.round((lifetime.hits / lifetime.total) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-x-6 gap-y-1 font-mono text-xs text-muted">
        {phase === 'ask' || phase === 'reveal' ? <span>Q {idx + 1}/{qs.length}</span> : null}
        <span>Lifetime hit rate: <span className={Math.abs(lifeRate - 80) <= 8 ? 'text-open' : 'text-soon'}>{lifetime.total > 0 ? `${lifeRate}%` : '—'}</span> (target 80%)</span>
        <span>Best round: {best ?? '—'}</span>
      </div>

      {phase === 'idle' && (
        <div className="rounded-lg border border-steel bg-panel p-5 space-y-4">
          <h3 className="font-mono text-lg text-violet-light">Calibration Duel</h3>
          <p className="text-sm text-muted leading-relaxed">
            For each question, give an <strong>80% confidence interval</strong> — a low and high
            bound you&apos;re 80% sure contains the true answer. If you&apos;re well-calibrated,
            you&apos;ll contain the answer about 8 times in 10: more means your intervals are too
            wide (timid), fewer means overconfident. Containing answers scores more when your
            interval is tight, so there&apos;s a real cost to hedging. Your lifetime hit rate
            persists across games.
          </p>
          <button type="button" className={btnCls} onClick={start}>Start →</button>
        </div>
      )}

      {(phase === 'ask' || phase === 'reveal') && (
        <div className="rounded-lg border border-steel bg-panel p-5 space-y-4">
          <p className="font-mono text-sm">
            {qs[idx].prompt}
            {qs[idx].unit && <span className="text-muted"> ({qs[idx].unit})</span>}?
          </p>

          {phase === 'ask' && (
            <form className="space-y-3 max-w-md" onSubmit={(e) => { e.preventDefault(); submit(); }}>
              <p className="text-sm text-muted">Your 80% interval:</p>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="font-mono text-[11px] text-muted">Low</span>
                  <input className={inputCls} inputMode="decimal" value={lo} onChange={(e) => setLo(e.target.value)} autoFocus />
                </label>
                <label className="block">
                  <span className="font-mono text-[11px] text-muted">High</span>
                  <input className={inputCls} inputMode="decimal" value={hi} onChange={(e) => setHi(e.target.value)} />
                </label>
              </div>
              {err && <p className="font-mono text-xs text-closed">{err}</p>}
              <button type="submit" className={btnCls}>Lock interval</button>
            </form>
          )}

          {phase === 'reveal' && last && (
            <div className="rounded border border-steel bg-bg p-4 space-y-2 font-mono text-sm">
              <p>
                Answer: <span className="text-violet-light">{last.q.answer.toLocaleString()}{last.q.unit ? ` ${last.q.unit}` : ''}</span>
                {last.q.note && <span className="text-muted text-xs"> ({last.q.note})</span>}
              </p>
              <p>
                Your interval [{last.lo.toLocaleString()}, {last.hi.toLocaleString()}]{' '}
                {last.contained ? <span className="text-open">contained it ✓</span> : <span className="text-closed">missed ✗</span>}
                {' · '}<span className={last.points >= 0 ? 'text-open' : 'text-closed'}>{last.points >= 0 ? '+' : ''}{last.points}</span>
              </p>
              <button type="button" className={btn2Cls} onClick={next}>
                {idx + 1 >= qs.length ? 'See results' : 'Next →'}
              </button>
            </div>
          )}
        </div>
      )}

      {phase === 'done' && (
        <div className="rounded-lg border border-steel bg-panel p-5 space-y-3">
          <p className="font-mono text-lg">
            Round score: <span className="text-violet-light">{total}</span>
            {best !== null && total >= best && <span className="text-soon"> ★ best</span>}
          </p>
          <p className="font-mono text-sm">
            This round you contained <span className="text-violet-light">{roundHits}/{qs.length}</span>{' '}
            ({Math.round((roundHits / qs.length) * 100)}%). Lifetime: {lifetime.hits}/{lifetime.total} ({lifeRate}%).
          </p>
          <p className="text-sm text-muted leading-relaxed">
            {lifeRate > 88
              ? 'Your intervals are too wide — you contain far more than 80%, leaving accuracy (and points) on the table. Tighten them: an 80% interval should feel slightly uncomfortable.'
              : lifeRate < 72 && lifetime.total >= ROUNDS
                ? 'You’re overconfident — your "80%" intervals contain the truth less than 80% of the time. Widen them, especially on unfamiliar quantities. Overconfidence is the single most common calibration failure, and interviewers probe for it directly.'
                : 'Well-calibrated — your hit rate is near the 80% target. That honesty about your own uncertainty is exactly what the market-making and probability questions reward.'}
          </p>
          <button type="button" className={btnCls} onClick={start}>Play again</button>
        </div>
      )}
    </div>
  );
}
