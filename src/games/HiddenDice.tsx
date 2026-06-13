import { useState } from 'react';
import { usePersistentState } from '../lib/storage';

/**
 * Three hidden dice are rolled; you make a market on their sum, then re-quote as
 * they're revealed one at a time. Scored on how close your mid is to the true
 * conditional mean (which shifts by +3.5 per unseen die) and on tightening your
 * width as uncertainty falls. Teaches conditional expectation under reveals.
 */

const ROUNDS = 4;
const DIE_VAR = 35 / 12;
const btnCls =
  'font-mono text-sm px-5 py-2.5 rounded bg-violet text-white hover:bg-violet-light hover:text-bg transition-colors';
const btn2Cls = 'font-mono text-sm px-4 py-2 rounded border border-violet/60 text-violet-light hover:bg-violet/15';
const inputCls = 'bg-bg border border-steel rounded px-3 py-2 font-mono text-sm w-full';

const PIPS: Record<number, [number, number][]> = {
  1: [[50, 50]],
  2: [[28, 28], [72, 72]],
  3: [[28, 28], [50, 50], [72, 72]],
  4: [[28, 28], [72, 28], [28, 72], [72, 72]],
  5: [[28, 28], [72, 28], [50, 50], [28, 72], [72, 72]],
  6: [[28, 26], [72, 26], [28, 50], [72, 50], [28, 74], [72, 74]],
};

function Die({ value, hidden }: { value: number; hidden?: boolean }) {
  return (
    <svg viewBox="0 0 100 100" className="w-14 h-14" role="img" aria-label={hidden ? 'hidden die' : `die showing ${value}`}>
      <rect x="4" y="4" width="92" height="92" rx="16" fill={hidden ? '#17181d' : '#eceef2'} stroke={hidden ? '#6d4aff' : '#9aa0ad'} strokeWidth="3" />
      {hidden ? (
        <text x="50" y="66" textAnchor="middle" fontSize="44" fill="#6d4aff" fontFamily="JetBrains Mono, monospace">?</text>
      ) : (
        PIPS[value].map(([cx, cy], i) => <circle key={i} cx={cx} cy={cy} r="9" fill="#1b1d24" />)
      )}
    </svg>
  );
}

const d6 = () => 1 + Math.floor(Math.random() * 6);

interface StageScore {
  stage: number;
  mu: number;
  sigma: number;
  mid: number;
  width: number;
  points: number;
}

export default function HiddenDice() {
  const [best, setBest] = usePersistentState<number | null>('qh:hiscore:hidden-dice', null);
  const [phase, setPhase] = useState<'idle' | 'quote' | 'reveal' | 'done'>('idle');
  const [round, setRound] = useState(0);
  const [dice, setDice] = useState<number[]>([d6(), d6(), d6()]);
  const [known, setKnown] = useState(0); // dice revealed so far
  const [bid, setBid] = useState('9');
  const [ask, setAsk] = useState('12');
  const [scores, setScores] = useState<StageScore[]>([]);
  const [total, setTotal] = useState(0);
  const [last, setLast] = useState<StageScore | null>(null);
  const [err, setErr] = useState('');

  function condMean(diceArr: number[], knownCount: number): number {
    const seen = diceArr.slice(0, knownCount).reduce((a, b) => a + b, 0);
    return seen + (3 - knownCount) * 3.5;
  }
  function condStd(knownCount: number): number {
    return Math.sqrt((3 - knownCount) * DIE_VAR);
  }

  function startGame() {
    setRound(0);
    setDice([d6(), d6(), d6()]);
    setKnown(0);
    setScores([]);
    setTotal(0);
    setLast(null);
    setBid('9');
    setAsk('12');
    setErr('');
    setPhase('quote');
  }

  function submitQuote() {
    const b = Number(bid), a = Number(ask);
    if (Number.isNaN(b) || Number.isNaN(a)) return setErr('Enter numeric bid and ask.');
    if (a <= b) return setErr('Ask must be above bid.');
    setErr('');
    const mu = condMean(dice, known);
    const sigma = condStd(known);
    const mid = (a + b) / 2;
    const width = a - b;
    // accuracy: lose 6 per unit of mid error; calibration: lose 1.5 per unit off ~2σ width
    const idealWidth = Math.max(1, 2 * sigma);
    const pts = Math.round(Math.max(-10, 20 - 6 * Math.abs(mid - mu) - 1.5 * Math.abs(width - idealWidth)));
    const sc: StageScore = { stage: known, mu, sigma, mid, width, points: pts };
    setScores((s) => [...s, sc]);
    setLast(sc);
    setTotal((t) => t + pts);
    setPhase('reveal');
  }

  function next() {
    if (known < 2) {
      // reveal one more die, quote again
      setKnown((k) => k + 1);
      const newKnown = known + 1;
      const mu = condMean(dice, newKnown);
      setBid(String(Math.round(mu - 2)));
      setAsk(String(Math.round(mu + 2)));
      setPhase('quote');
    } else {
      // round complete (all three effectively known after final reveal)
      if (round + 1 >= ROUNDS) {
        setBest((bsc) => (bsc === null || total > bsc ? total : bsc));
        setPhase('done');
      } else {
        setRound((r) => r + 1);
        const nd = [d6(), d6(), d6()];
        setDice(nd);
        setKnown(0);
        setBid('9');
        setAsk('12');
        setPhase('quote');
      }
    }
  }

  const trueSum = dice.reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-x-6 gap-y-1 font-mono text-xs text-muted">
        {phase !== 'idle' && phase !== 'done' && <span>Round {round + 1}/{ROUNDS}</span>}
        {phase !== 'idle' && <span>Score: <span className="text-violet-light">{total}</span></span>}
        <span>Best: {best ?? '—'}</span>
      </div>

      {phase === 'idle' && (
        <div className="rounded-lg border border-steel bg-panel p-5 space-y-4">
          <h3 className="font-mono text-lg text-violet-light">Hidden Dice</h3>
          <p className="text-sm text-muted leading-relaxed">
            Three dice are rolled face-down. Make a market on their <strong>sum</strong>, then
            re-quote as each die is revealed. Every unseen die is worth 3.5 on average, so your fair
            value should shift by exactly the revealed pip minus 3.5 — and your market should tighten
            as uncertainty drops (σ falls from ~2.96 to ~1.71 to 0). You&apos;re scored on mid
            accuracy and width calibration at each stage.
          </p>
          <button type="button" className={btnCls} onClick={startGame}>Start →</button>
        </div>
      )}

      {(phase === 'quote' || phase === 'reveal') && (
        <div className="rounded-lg border border-steel bg-panel p-5 space-y-4">
          <div className="flex gap-3 justify-center">
            {dice.map((d, i) => (
              <Die key={i} value={d} hidden={phase === 'quote' ? i >= known : i > known} />
            ))}
          </div>

          {phase === 'quote' && (
            <form className="space-y-3 max-w-md mx-auto" onSubmit={(e) => { e.preventDefault(); submitQuote(); }}>
              <p className="text-sm text-muted text-center">
                {known === 0 ? 'No dice revealed — quote the sum.' : `${known} die${known > 1 ? '/dice' : ''} shown. Re-quote the sum.`}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="font-mono text-[11px] text-muted">Bid</span>
                  <input className={inputCls} inputMode="decimal" value={bid} onChange={(e) => setBid(e.target.value)} />
                </label>
                <label className="block">
                  <span className="font-mono text-[11px] text-muted">Ask</span>
                  <input className={inputCls} inputMode="decimal" value={ask} onChange={(e) => setAsk(e.target.value)} />
                </label>
              </div>
              {err && <p className="font-mono text-xs text-closed">{err}</p>}
              <button type="submit" className={btnCls}>Quote</button>
            </form>
          )}

          {phase === 'reveal' && last && (
            <div className="rounded border border-steel bg-bg p-4 space-y-2 font-mono text-sm text-center">
              <p>
                True conditional fair value: <span className="text-violet-light">{last.mu.toFixed(1)}</span> (σ ≈ {last.sigma.toFixed(2)}).
                Your mid: {last.mid.toFixed(1)}, width {last.width.toFixed(1)}.
              </p>
              <p>
                Stage score: <span className={last.points >= 12 ? 'text-open' : last.points >= 0 ? 'text-soon' : 'text-closed'}>{last.points >= 0 ? '+' : ''}{last.points}</span>
              </p>
              {known === 2 && (
                <p className="text-xs text-muted">
                  Final sum is <span className="text-violet-light">{trueSum}</span> — your last market {last.mid - last.width / 2 <= trueSum && trueSum <= last.mid + last.width / 2 ? <span className="text-open">contained it ✓</span> : <span className="text-closed">missed it ✗</span>}.
                </p>
              )}
              <button type="button" className={btn2Cls} onClick={next}>
                {known < 2 ? 'Reveal next die →' : round + 1 >= ROUNDS ? 'See results' : 'Next round →'}
              </button>
            </div>
          )}
        </div>
      )}

      {phase === 'done' && (
        <div className="rounded-lg border border-steel bg-panel p-5 space-y-3">
          <p className="font-mono text-lg">
            Final score: <span className="text-violet-light">{total}</span>
            <span className="text-muted text-sm"> over {scores.length} quotes</span>
            {best !== null && total >= best && <span className="text-soon"> ★ best</span>}
          </p>
          <p className="text-sm text-muted leading-relaxed">
            The whole game is one idea: E[sum | dice seen] = (sum of seen pips) + 3.5 × (dice unseen).
            Your mid should track that exactly, and your width should shrink as dice reveal — quoting
            the same width with two dice known as with none means you&apos;re ignoring free
            information. This is conditional expectation, the engine behind pricing anything as
            evidence arrives.
          </p>
          <button type="button" className={btnCls} onClick={startGame}>Play again</button>
        </div>
      )}
    </div>
  );
}
