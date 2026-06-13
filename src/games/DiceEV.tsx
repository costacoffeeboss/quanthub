import { useState } from 'react';
import { usePersistentState } from '../lib/storage';

interface Bet {
  description: string;
  cost: number;
  /** Resolve one play: returns the gross win amount (0 if lost). */
  resolve: () => number;
  ev: number; // net EV per play
  evExplain: string;
}

const ri = (lo: number, hi: number) => lo + Math.floor(Math.random() * (hi - lo + 1));
const d6 = () => ri(1, 6);

function makeBet(): Bet {
  const kind = ri(1, 5);
  if (kind === 1) {
    // win w if roll >= k
    const k = ri(3, 6);
    const p = (7 - k) / 6;
    const fair = Math.round((10 * p + Number.EPSILON) * 2) / 2; // around payout 10
    const w = 10;
    const cost = Math.max(0.5, fair + (Math.random() < 0.5 ? -1 : 1) * (ri(1, 3) / 2));
    return {
      description: `Pay £${cost.toFixed(2)}: win £${w} if a die rolls ${k} or higher`,
      cost,
      resolve: () => (d6() >= k ? w : 0),
      ev: w * p - cost,
      evExplain: `P(roll ≥ ${k}) = ${7 - k}/6, so the bet pays ${w} × ${7 - k}/6 = £${((w * (7 - k)) / 6).toFixed(2)} on average vs £${cost.toFixed(2)} cost.`,
    };
  }
  if (kind === 2) {
    // paid face value
    const cost = Math.max(0.5, 3.5 + (Math.random() < 0.5 ? -1 : 1) * (ri(1, 3) / 2));
    return {
      description: `Pay £${cost.toFixed(2)}: roll a die, win its face value in £`,
      cost,
      resolve: () => d6(),
      ev: 3.5 - cost,
      evExplain: `E[face] = (1+2+…+6)/6 = £3.50 vs £${cost.toFixed(2)} cost.`,
    };
  }
  if (kind === 3) {
    // win w if even
    const w = ri(4, 8);
    const cost = Math.max(0.5, w / 2 + (Math.random() < 0.5 ? -1 : 1) * (ri(1, 3) / 2));
    return {
      description: `Pay £${cost.toFixed(2)}: win £${w} if the roll is even`,
      cost,
      resolve: () => (d6() % 2 === 0 ? w : 0),
      ev: w / 2 - cost,
      evExplain: `P(even) = 1/2, so average payout £${(w / 2).toFixed(2)} vs £${cost.toFixed(2)} cost.`,
    };
  }
  if (kind === 4) {
    // two dice sum >= s
    const s = ri(8, 11);
    const ways = ({ 8: 15, 9: 10, 10: 6, 11: 3 } as Record<number, number>)[s];
    const p = ways / 36;
    const w = 12;
    const cost = Math.max(0.5, w * p + (Math.random() < 0.5 ? -1 : 1) * (ri(1, 3) / 2));
    return {
      description: `Pay £${cost.toFixed(2)}: win £${w} if two dice sum to ${s} or more`,
      cost,
      resolve: () => (d6() + d6() >= s ? w : 0),
      ev: w * p - cost,
      evExplain: `P(sum ≥ ${s}) = ${ways}/36, average payout £${(w * p).toFixed(2)} vs £${cost.toFixed(2)} cost.`,
    };
  }
  // doubles
  const w = ri(7, 12);
  const cost = Math.max(0.5, w / 6 + (Math.random() < 0.5 ? -1 : 1) * (ri(1, 2) / 2));
  return {
    description: `Pay £${cost.toFixed(2)}: win £${w} if two dice show doubles`,
    cost,
    resolve: () => {
      const a = d6();
      const b = d6();
      return a === b ? w : 0;
    },
    ev: w / 6 - cost,
    evExplain: `P(doubles) = 6/36 = 1/6, average payout £${(w / 6).toFixed(2)} vs £${cost.toFixed(2)} cost.`,
  };
}

const ROUNDS = 8;

interface RoundLog {
  bet: Bet;
  took: boolean;
  pnl: number;
  correct: boolean;
}

export default function DiceEV() {
  const [high, setHigh] = usePersistentState<number | null>('qh:hiscore:dice', null);
  const [bets, setBets] = useState<Bet[]>(() => Array.from({ length: ROUNDS }, makeBet));
  const [round, setRound] = useState(0);
  const [log, setLog] = useState<RoundLog[]>([]);
  const [last, setLast] = useState<RoundLog | null>(null);

  const finished = log.length === ROUNDS && !last;
  const pnl = log.reduce((a, r) => a + r.pnl, 0);
  const correctCalls = log.filter((r) => r.correct).length;

  function decide(take: boolean) {
    const bet = bets[round];
    let roundPnl = 0;
    if (take) {
      roundPnl = bet.resolve() - bet.cost;
    }
    const entry: RoundLog = {
      bet,
      took: take,
      pnl: Math.round(roundPnl * 100) / 100,
      correct: take === bet.ev > 0,
    };
    setLog((l) => [...l, entry]);
    setLast(entry);
  }

  function next() {
    setLast(null);
    if (log.length === ROUNDS) {
      const final = Math.round(pnl * 100) / 100;
      if (high === null || final > high) setHigh(final);
    } else {
      setRound((r) => r + 1);
    }
  }

  function restart() {
    const final = Math.round(pnl * 100) / 100;
    if (log.length === ROUNDS && (high === null || final > high)) setHigh(final);
    setBets(Array.from({ length: ROUNDS }, makeBet));
    setRound(0);
    setLog([]);
    setLast(null);
  }

  const optimalEV = bets.slice(0, log.length).reduce((a, b) => a + Math.max(0, b.ev), 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-x-6 gap-y-1 font-mono text-xs text-muted">
        <span>Round {Math.min(round + 1, ROUNDS)}/{ROUNDS}</span>
        <span>
          P&amp;L: <span className={pnl >= 0 ? 'text-open' : 'text-closed'}>£{pnl.toFixed(2)}</span>
        </span>
        <span>Best: {high === null ? '—' : `£${high.toFixed(2)}`}</span>
      </div>

      <div className="rounded-lg border border-steel bg-panel p-5 space-y-4">
        <p className="text-sm text-muted">
          Each round offers a dice bet — some are good, some are traps. Take it or pass. Your
          score is realised P&amp;L, but the real grade is whether your decisions matched the
          expected value.
        </p>

        {!finished && (
          <>
            <p className="font-semibold font-mono text-sm">{bets[round].description}</p>
            {!last && (
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => decide(true)}
                  className="font-mono text-sm px-5 py-2 rounded bg-violet text-white hover:bg-violet-light hover:text-bg transition-colors"
                >
                  Take the bet
                </button>
                <button
                  type="button"
                  onClick={() => decide(false)}
                  className="font-mono text-sm px-5 py-2 rounded border border-steel hover:border-violet-light transition-colors"
                >
                  Pass
                </button>
              </div>
            )}
            {last && (
              <div className="rounded border border-steel bg-bg p-4 space-y-2 font-mono text-sm">
                <p>
                  {last.took ? (
                    <>
                      You took it: <span className={last.pnl >= 0 ? 'text-open' : 'text-closed'}>£{last.pnl.toFixed(2)}</span>
                    </>
                  ) : (
                    'You passed.'
                  )}{' '}
                  {last.correct ? (
                    <span className="text-open">EV says: right call.</span>
                  ) : (
                    <span className="text-closed">EV says: wrong call.</span>
                  )}
                </p>
                <p className="text-xs text-muted">
                  EV = <span className={last.bet.ev > 0 ? 'text-open' : 'text-closed'}>£{last.bet.ev.toFixed(2)}</span>. {last.bet.evExplain}
                </p>
                <button
                  type="button"
                  onClick={next}
                  className="mt-1 font-mono text-sm px-4 py-2 rounded border border-violet/60 text-violet-light hover:bg-violet/15"
                >
                  {log.length === ROUNDS ? 'See breakdown' : 'Next round →'}
                </button>
              </div>
            )}
          </>
        )}

        {finished && (
          <div className="space-y-3">
            <p className="font-mono">
              Realised P&amp;L:{' '}
              <span className={pnl >= 0 ? 'text-open' : 'text-closed'}>£{pnl.toFixed(2)}</span>
              <span className="text-muted"> · optimal-play EV was £{optimalEV.toFixed(2)}</span>
            </p>
            <p className="font-mono text-sm">
              EV-correct decisions: <span className="text-violet-light">{correctCalls}/{ROUNDS}</span>
              <span className="text-muted text-xs"> — over many rounds, this number is your edge; the P&amp;L is just variance.</span>
            </p>
            <div className="overflow-x-auto rounded border border-steel">
              <table className="w-full font-mono text-xs">
                <thead>
                  <tr className="text-muted text-left uppercase tracking-wider">
                    <th className="p-2 border-b border-steel">Bet</th>
                    <th className="p-2 border-b border-steel">EV</th>
                    <th className="p-2 border-b border-steel">You</th>
                    <th className="p-2 border-b border-steel">Call</th>
                    <th className="p-2 border-b border-steel">P&amp;L</th>
                  </tr>
                </thead>
                <tbody>
                  {log.map((r, i) => (
                    <tr key={i} className="border-b border-steel last:border-0 align-top">
                      <td className="p-2">{r.bet.description}</td>
                      <td className={`p-2 whitespace-nowrap ${r.bet.ev > 0 ? 'text-open' : 'text-closed'}`}>
                        £{r.bet.ev.toFixed(2)}
                      </td>
                      <td className="p-2">{r.took ? 'take' : 'pass'}</td>
                      <td className={`p-2 ${r.correct ? 'text-open' : 'text-closed'}`}>{r.correct ? '✓' : '✗'}</td>
                      <td className={`p-2 whitespace-nowrap ${r.pnl >= 0 ? 'text-open' : 'text-closed'}`}>
                        £{r.pnl.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
