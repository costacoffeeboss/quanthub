import { useState } from 'react';
import { usePersistentState } from '../lib/storage';

/**
 * Kelly sizing. A repeated +EV even-money bet (win prob 60%). You choose what
 * fraction of bankroll to stake each round; full-Kelly (20%) and half-Kelly
 * (10%) bots play the SAME coin outcomes alongside you. Teaches that growth is
 * maximised at f* = 2p−1, that overbetting destroys it, and that all-in ruins.
 */

const ROUNDS = 25;
const WIN_PROB = 0.6;
const KELLY = 2 * WIN_PROB - 1; // 0.2 for even money
const START = 100;
const btnCls =
  'font-mono text-sm px-5 py-2.5 rounded bg-violet text-white hover:bg-violet-light hover:text-bg transition-colors';

interface Series {
  player: number[];
  full: number[];
  half: number[];
}

function Chart({ s }: { s: Series }) {
  const W = 640, H = 240, pad = { l: 44, r: 12, t: 12, b: 22 };
  const all = [...s.player, ...s.full, ...s.half].filter((v) => v > 0);
  const max = Math.max(...all, START * 2);
  const min = Math.max(0.5, Math.min(...all, START / 2));
  const n = s.player.length;
  const x = (i: number) => pad.l + (n <= 1 ? 0 : (i / (n - 1)) * (W - pad.l - pad.r));
  const y = (v: number) => {
    const lv = Math.log(Math.max(v, min));
    const lo = Math.log(min), hi = Math.log(max);
    return pad.t + (1 - (lv - lo) / (hi - lo)) * (H - pad.t - pad.b);
  };
  const path = (arr: number[]) =>
    arr.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Bankroll over rounds (log scale)">
      <line x1={pad.l} x2={W - pad.r} y1={y(START)} y2={y(START)} stroke="#23252c" strokeDasharray="4 4" />
      <text x={pad.l - 6} y={y(START) + 4} textAnchor="end" fill="#7e838f" fontSize="10" fontFamily="JetBrains Mono, monospace">{START}</text>
      <text x={pad.l - 6} y={pad.t + 8} textAnchor="end" fill="#7e838f" fontSize="10" fontFamily="JetBrains Mono, monospace">{Math.round(max)}</text>
      <path d={path(s.half)} fill="none" stroke="#7e838f" strokeWidth="1.5" />
      <path d={path(s.full)} fill="none" stroke="#3ddc97" strokeWidth="1.5" />
      <path d={path(s.player)} fill="none" stroke="#6d4aff" strokeWidth="2.5" />
    </svg>
  );
}

export default function KellyGame() {
  const [best, setBest] = usePersistentState<number | null>('qh:hiscore:kelly', null);
  const [phase, setPhase] = useState<'idle' | 'play' | 'done'>('idle');
  const [round, setRound] = useState(0);
  const [frac, setFrac] = useState(20); // percent
  const [series, setSeries] = useState<Series>({ player: [START], full: [START], half: [START] });
  const [ruined, setRuined] = useState(false);
  const [lastWin, setLastWin] = useState<boolean | null>(null);

  const player = series.player[series.player.length - 1];
  const full = series.full[series.full.length - 1];
  const half = series.half[series.half.length - 1];

  function start() {
    setRound(0);
    setSeries({ player: [START], full: [START], half: [START] });
    setRuined(false);
    setLastWin(null);
    setFrac(20);
    setPhase('play');
  }

  function bet() {
    const f = Math.max(0, Math.min(1, frac / 100));
    const win = Math.random() < WIN_PROB;
    setLastWin(win);
    const step = (bal: number, frac: number) => {
      const nb = bal * (1 + (win ? frac : -frac));
      return nb < 0.01 ? 0 : nb;
    };
    const np = step(player, f);
    setSeries((s) => ({
      player: [...s.player, np],
      full: [...s.full, step(full, KELLY)],
      half: [...s.half, step(half, KELLY / 2)],
    }));
    if (np <= 0.01) {
      setRuined(true);
      setBest((b) => (b === null || 0 > b ? 0 : b));
      setPhase('done');
      return;
    }
    if (round + 1 >= ROUNDS) {
      setBest((b) => (b === null || np > b ? Math.round(np) : b));
      setPhase('done');
    } else {
      setRound((r) => r + 1);
    }
  }

  const quickFracs = [0, 10, 20, 50, 100];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-x-6 gap-y-1 font-mono text-xs text-muted">
        {phase === 'play' && <span>Round {round + 1}/{ROUNDS}</span>}
        <span>Best final bankroll: {best ?? '—'}</span>
      </div>

      {phase === 'idle' && (
        <div className="rounded-lg border border-steel bg-panel p-5 space-y-4">
          <h3 className="font-mono text-lg text-violet-light">Kelly Criterion</h3>
          <p className="text-sm text-muted leading-relaxed">
            A biased coin lands heads <strong>60% of the time</strong> and pays even money. You start
            with {START} and bet a fraction of your bankroll each round for {ROUNDS} rounds. A
            full-Kelly bot (stakes {Math.round(KELLY * 100)}%) and a half-Kelly bot ({Math.round(KELLY * 50)}%)
            ride the same coin flips. The edge is real — but how much you bet decides whether you
            compound or go bust.
          </p>
          <button type="button" className={btnCls} onClick={start}>Start →</button>
        </div>
      )}

      {phase === 'play' && (
        <div className="rounded-lg border border-steel bg-panel p-5 space-y-4">
          <div className="grid grid-cols-3 gap-2 font-mono text-xs text-center">
            <div className="rounded border border-violet/50 bg-violet/10 p-2">
              <p className="text-violet-light">You</p>
              <p className="text-lg">{player.toFixed(1)}</p>
            </div>
            <div className="rounded border border-steel p-2">
              <p className="text-open">Full-Kelly</p>
              <p className="text-lg">{full.toFixed(1)}</p>
            </div>
            <div className="rounded border border-steel p-2">
              <p className="text-muted">Half-Kelly</p>
              <p className="text-lg">{half.toFixed(1)}</p>
            </div>
          </div>

          <Chart s={series} />

          {lastWin !== null && (
            <p className="font-mono text-xs text-center">
              Last flip: {lastWin ? <span className="text-open">heads (won)</span> : <span className="text-closed">tails (lost)</span>}
            </p>
          )}

          <div className="space-y-2">
            <label className="block">
              <span className="font-mono text-xs text-muted">Stake this round: <span className="text-violet-light">{frac}%</span> of bankroll ({(player * frac / 100).toFixed(1)})</span>
              <input type="range" min={0} max={100} value={frac} onChange={(e) => setFrac(Number(e.target.value))} className="w-full accent-[#6d4aff]" />
            </label>
            <div className="flex flex-wrap gap-2">
              {quickFracs.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFrac(f)}
                  className={`font-mono text-[11px] px-2.5 py-1 rounded border ${frac === f ? 'border-violet text-violet-light' : 'border-steel text-muted hover:text-fg'}`}
                >
                  {f}%{f === 20 ? ' (Kelly)' : f === 100 ? ' (all-in)' : ''}
                </button>
              ))}
            </div>
          </div>

          <button type="button" className={btnCls} onClick={bet}>Place bet &amp; flip</button>
        </div>
      )}

      {phase === 'done' && (
        <div className="rounded-lg border border-steel bg-panel p-5 space-y-3">
          <Chart s={series} />
          {ruined ? (
            <p className="font-mono text-lg text-closed">Ruined — bankroll hit zero.</p>
          ) : (
            <p className="font-mono text-lg">
              Your final bankroll: <span className={player >= START ? 'text-open' : 'text-closed'}>{player.toFixed(1)}</span>
              <span className="text-muted text-sm"> (full-Kelly {full.toFixed(1)}, half-Kelly {half.toFixed(1)})</span>
            </p>
          )}
          <p className="text-sm text-muted leading-relaxed">
            Growth is maximised by betting the Kelly fraction f* = 2p − 1 = {Math.round(KELLY * 100)}% here — it
            maximises expected <em>log</em> wealth, not expected wealth. Betting more (50%, 100%) raises
            expected wealth in theory but tanks the typical outcome and, at all-in, guarantees eventual
            ruin from a single loss. Betting less is safe but slow. Real desks run <em>fractional</em>
            Kelly (often half) because edge estimates are noisy and overbetting an overestimated edge
            has negative growth.
          </p>
          <button type="button" className={btnCls} onClick={start}>Play again</button>
        </div>
      )}
    </div>
  );
}
