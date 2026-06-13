import { useState } from 'react';
import { usePersistentState } from '../lib/storage';

interface Quantity {
  prompt: string;
  value: number;
  unit: string;
  note: string;
}

const pool: Quantity[] = [
  { prompt: 'Number of seconds in a fortnight', value: 1209600, unit: 's', note: '14 days × 86,400 seconds/day.' },
  { prompt: 'Number of minutes in a (non-leap) year', value: 525600, unit: 'min', note: '365 × 24 × 60.' },
  { prompt: 'Keys on a standard piano', value: 88, unit: 'keys', note: '52 white + 36 black.' },
  { prompt: 'Bones in an adult human body', value: 206, unit: 'bones', note: 'Babies have ~300; many fuse.' },
  { prompt: 'Heartbeats per day at 70 bpm', value: 100800, unit: 'beats', note: '70 × 60 × 24.' },
  { prompt: 'Height of Mount Everest in metres', value: 8849, unit: 'm', note: 'Official 2020 survey figure.' },
  { prompt: 'Litres in an Olympic swimming pool', value: 2500000, unit: 'L', note: '50m × 25m × 2m = 2,500 m³.' },
  { prompt: 'Days in a million hours', value: 41667, unit: 'days', note: '1,000,000 / 24 ≈ 41,667 (≈114 years).' },
  { prompt: 'UK population (latest estimates)', value: 68000000, unit: 'people', note: 'Roughly 68 million.' },
  { prompt: 'Steps in a typical walked mile', value: 2000, unit: 'steps', note: '~0.8m stride → ~2,000 steps.' },
  { prompt: 'Max take-off weight of a Boeing 747-8, in tonnes', value: 448, unit: 't', note: 'Mostly fuel and structure.' },
  { prompt: 'Playing cards in 12 standard decks (no jokers)', value: 624, unit: 'cards', note: '12 × 52.' },
  { prompt: 'Number of UK universities', value: 165, unit: 'unis', note: '~165 degree-awarding institutions.' },
  { prompt: 'Distinct 5-card poker hands from one deck', value: 2598960, unit: 'hands', note: 'C(52,5) = 2,598,960.' },
];

const ROUNDS = 5;

interface RoundResult {
  q: Quantity;
  bid: number;
  ask: number;
  pnl: number;
  hit: boolean;
}

function score(q: Quantity, bid: number, ask: number): { pnl: number; hit: boolean } {
  const v = q.value;
  if (bid <= v && v <= ask) {
    const width = (ask - bid) / v;
    return { pnl: Math.round(100 * Math.max(0.05, 1 - width)), hit: true };
  }
  const missRel = (bid > v ? bid - v : v - ask) / v;
  return { pnl: -Math.round(50 + 50 * Math.min(2, missRel)), hit: false };
}

function sample(): Quantity[] {
  return [...pool].sort(() => Math.random() - 0.5).slice(0, ROUNDS);
}

export default function MarketMaker() {
  const [high, setHigh] = usePersistentState<number | null>('qh:hiscore:market-maker', null);
  const [qs, setQs] = useState<Quantity[]>(sample);
  const [round, setRound] = useState(0);
  const [bid, setBid] = useState('');
  const [ask, setAsk] = useState('');
  const [results, setResults] = useState<RoundResult[]>([]);
  const [reveal, setReveal] = useState<RoundResult | null>(null);
  const [err, setErr] = useState('');

  const finished = results.length === ROUNDS && !reveal;
  const total = results.reduce((a, r) => a + r.pnl, 0);

  function quote() {
    const b = Number(bid);
    const a = Number(ask);
    if (!bid || !ask || Number.isNaN(b) || Number.isNaN(a)) return setErr('Enter both a bid and an ask.');
    if (a <= b) return setErr('Your ask must be above your bid — that is what a market is.');
    if (b < 0) return setErr('Bids below zero are bold but not allowed here.');
    setErr('');
    const q = qs[round];
    const r = { q, bid: b, ask: a, ...score(q, b, a) };
    setResults((rs) => [...rs, r]);
    setReveal(r);
  }

  function next() {
    setReveal(null);
    setBid('');
    setAsk('');
    if (results.length === ROUNDS) {
      if (high === null || total > high) setHigh(total);
    } else {
      setRound((r) => r + 1);
    }
  }

  function restart() {
    if (high === null || total > high) setHigh(total);
    setQs(sample());
    setRound(0);
    setResults([]);
    setReveal(null);
    setBid('');
    setAsk('');
    setErr('');
  }

  const inputCls = 'w-full bg-bg border border-steel rounded px-3 py-2 font-mono text-sm';

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-x-6 gap-y-1 font-mono text-xs text-muted">
        <span>Round {Math.min(round + 1, ROUNDS)}/{ROUNDS}</span>
        <span>
          P&amp;L: <span className={total >= 0 ? 'text-open' : 'text-closed'}>{total >= 0 ? '+' : ''}{total}</span>
        </span>
        <span>Best: {high === null ? '—' : high}</span>
      </div>

      <div className="rounded-lg border border-steel bg-panel p-5 space-y-4">
        <p className="text-sm text-muted">
          Quote a bid and an ask around the true value. A market that contains the value earns up
          to +100 — tighter is better. Miss it and you pay −50 to −150 depending how far off you
          are.
        </p>

        {!finished && (
          <>
            <p className="font-semibold">{qs[round].prompt}</p>
            {!reveal && (
              <form
                className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]"
                onSubmit={(e) => {
                  e.preventDefault();
                  quote();
                }}
              >
                <label className="block">
                  <span className="font-mono text-[11px] text-muted">Bid (you buy at)</span>
                  <input className={inputCls} inputMode="decimal" value={bid} onChange={(e) => setBid(e.target.value)} />
                </label>
                <label className="block">
                  <span className="font-mono text-[11px] text-muted">Ask (you sell at)</span>
                  <input className={inputCls} inputMode="decimal" value={ask} onChange={(e) => setAsk(e.target.value)} />
                </label>
                <button
                  type="submit"
                  className="self-end font-mono text-sm px-4 py-2 rounded bg-violet text-white hover:bg-violet-light hover:text-bg transition-colors"
                >
                  Quote
                </button>
              </form>
            )}
            {err && <p className="font-mono text-xs text-closed">{err}</p>}
            {reveal && (
              <div className="rounded border border-steel bg-bg p-4 space-y-2 font-mono text-sm">
                <p>
                  True value:{' '}
                  <span className="text-violet-light">
                    {reveal.q.value.toLocaleString()} {reveal.q.unit}
                  </span>{' '}
                  <span className="text-muted text-xs">({reveal.q.note})</span>
                </p>
                <p>
                  Your market: {reveal.bid.toLocaleString()} / {reveal.ask.toLocaleString()} —{' '}
                  {reveal.hit ? (
                    <span className="text-open">contained it. +{reveal.pnl}</span>
                  ) : (
                    <span className="text-closed">missed. {reveal.pnl}</span>
                  )}
                </p>
                <button
                  type="button"
                  onClick={next}
                  className="mt-1 font-mono text-sm px-4 py-2 rounded border border-violet/60 text-violet-light hover:bg-violet/15"
                >
                  {results.length === ROUNDS ? 'See summary' : 'Next round →'}
                </button>
              </div>
            )}
          </>
        )}

        {finished && (
          <div className="space-y-3">
            <p className="font-mono text-lg">
              Final P&amp;L:{' '}
              <span className={total >= 0 ? 'text-open' : 'text-closed'}>
                {total >= 0 ? '+' : ''}
                {total}
              </span>
              {high !== null && total >= high && <span className="text-soon"> ★ new best</span>}
            </p>
            <ul className="space-y-1 font-mono text-xs text-muted">
              {results.map((r, i) => (
                <li key={i}>
                  {r.q.prompt}: {r.bid.toLocaleString()}/{r.ask.toLocaleString()} vs{' '}
                  {r.q.value.toLocaleString()} →{' '}
                  <span className={r.pnl >= 0 ? 'text-open' : 'text-closed'}>
                    {r.pnl >= 0 ? '+' : ''}
                    {r.pnl}
                  </span>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={restart}
              className="font-mono text-sm px-4 py-2 rounded bg-violet text-white hover:bg-violet-light hover:text-bg transition-colors"
            >
              Play again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
