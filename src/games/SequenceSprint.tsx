import { useEffect, useRef, useState } from 'react';
import { usePersistentState } from '../lib/storage';

/**
 * Optiver "Zap"-style sequence test: infer the rule, type the next term, fast.
 * Difficulty rises with the score (more exotic rules unlock).
 */

interface Puzzle {
  terms: number[];
  answer: number;
  rule: string;
}

const ri = (lo: number, hi: number) => lo + Math.floor(Math.random() * (hi - lo + 1));
const PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47];

type Gen = () => Puzzle;

// --- generators, grouped by tier ---
const arithmetic: Gen = () => {
  const a = ri(1, 20), d = ri(2, 12) * (Math.random() < 0.3 ? -1 : 1);
  const t = [a, a + d, a + 2 * d, a + 3 * d];
  return { terms: t, answer: a + 4 * d, rule: `Arithmetic: add ${d} each step.` };
};
const geometric: Gen = () => {
  const a = ri(1, 6), r = ri(2, 4);
  const t = [a, a * r, a * r * r, a * r ** 3];
  return { terms: t, answer: a * r ** 4, rule: `Geometric: multiply by ${r} each step.` };
};
const squares: Gen = () => {
  const s = ri(1, 6);
  const t = [s, s + 1, s + 2, s + 3].map((n) => n * n);
  return { terms: t, answer: (s + 4) ** 2, rule: `Consecutive squares from ${s}².` };
};
const fibonacci: Gen = () => {
  let a = ri(1, 5), b = ri(a, a + 5);
  const t = [a, b];
  for (let i = 0; i < 2; i++) { const n = a + b; t.push(n); a = b; b = n; }
  return { terms: t.slice(0, 4), answer: t[2] + t[3], rule: 'Each term is the sum of the previous two (Fibonacci-like).' };
};
const secondDiff: Gen = () => {
  const a = ri(1, 8), d = ri(1, 5), dd = ri(1, 4);
  const t = [a];
  let step = d;
  for (let i = 0; i < 4; i++) { t.push(t[t.length - 1] + step); step += dd; }
  return { terms: t.slice(0, 4), answer: t[4], rule: `Differences grow by ${dd} each step (second difference constant).` };
};
const alternating: Gen = () => {
  const a = ri(1, 10), d1 = ri(2, 9), d2 = ri(2, 9);
  const t = [a, a + d1, a + d1 - d2, a + 2 * d1 - d2];
  return { terms: t, answer: a + 2 * d1 - 2 * d2, rule: `Alternating: +${d1} then −${d2}, repeating.` };
};
const primesSeq: Gen = () => {
  const i = ri(0, PRIMES.length - 5);
  return { terms: PRIMES.slice(i, i + 4), answer: PRIMES[i + 4], rule: 'Consecutive prime numbers.' };
};
const interleaved: Gen = () => {
  // two interleaved arithmetic sequences
  const a = ri(1, 9), b = ri(1, 9), d1 = ri(2, 6), d2 = ri(2, 6);
  const t = [a, b, a + d1, b + d2];
  return { terms: t, answer: a + 2 * d1, rule: `Two interleaved sequences (+${d1} and +${d2}); the next term continues the first.` };
};
const digitOp: Gen = () => {
  const a = ri(11, 40);
  const t = [a];
  for (let i = 0; i < 3; i++) {
    const prev = t[t.length - 1];
    const digitSum = String(prev).split('').reduce((s, c) => s + Number(c), 0);
    t.push(prev + digitSum);
  }
  const last = t[3];
  const ds = String(last).split('').reduce((s, c) => s + Number(c), 0);
  return { terms: t, answer: last + ds, rule: 'Add the sum of the digits of the previous term.' };
};

const TIERS: Gen[][] = [
  [arithmetic, geometric, squares],
  [arithmetic, geometric, squares, fibonacci, alternating, primesSeq],
  [secondDiff, fibonacci, alternating, primesSeq, interleaved, digitOp, geometric],
];

function genFor(score: number): Puzzle {
  const tier = score < 5 ? 0 : score < 12 ? 1 : 2;
  const gens = TIERS[tier];
  return gens[Math.floor(Math.random() * gens.length)]();
}

const DURATION = 120;
const btnCls =
  'font-mono text-sm px-5 py-2.5 rounded bg-violet text-white hover:bg-violet-light hover:text-bg transition-colors';

export default function SequenceSprint() {
  const [best, setBest] = usePersistentState<number | null>('qh:hiscore:sequence', null);
  const [phase, setPhase] = useState<'idle' | 'run' | 'done'>('idle');
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [input, setInput] = useState('');
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [flash, setFlash] = useState<'' | 'ok' | 'bad'>('');
  const [lastMiss, setLastMiss] = useState<Puzzle | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (phase !== 'run') return;
    const t = window.setInterval(() => {
      setTimeLeft((s) => {
        if (s <= 1) {
          window.clearInterval(t);
          setPhase('done');
          setBest((b) => (b === null || score > b ? score : b));
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => window.clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, score]);

  function start() {
    setScore(0);
    setAttempts(0);
    setTimeLeft(DURATION);
    setLastMiss(null);
    setPuzzle(genFor(0));
    setPhase('run');
    setInput('');
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function submit() {
    if (!puzzle || input.trim() === '') return;
    const correct = Number(input) === puzzle.answer;
    setAttempts((a) => a + 1);
    if (correct) {
      setScore((s) => s + 1);
      setFlash('ok');
      setLastMiss(null);
    } else {
      setFlash('bad');
      setLastMiss(puzzle);
    }
    window.setTimeout(() => setFlash(''), 250);
    setInput('');
    setPuzzle(genFor(correct ? score + 1 : score));
    inputRef.current?.focus();
  }

  const mm = Math.floor(timeLeft / 60);
  const ss = String(timeLeft % 60).padStart(2, '0');

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-x-6 gap-y-1 font-mono text-xs text-muted">
        <span>Best: {best ?? '—'}</span>
      </div>

      {phase === 'idle' && (
        <div className="rounded-lg border border-steel bg-panel p-5 space-y-4">
          <h3 className="font-mono text-lg text-violet-light">Sequence Sprint</h3>
          <p className="text-sm text-muted">
            Infer the rule and type the next number. {DURATION} seconds; the sequences get nastier as
            your score climbs — arithmetic and geometric early, then second-differences, interleaved
            sequences, primes, and digit operations. Optiver and SIG use tests just like this.
          </p>
          <button type="button" className={btnCls} onClick={start}>Start →</button>
        </div>
      )}

      {phase === 'run' && puzzle && (
        <div className={`rounded-lg border bg-panel p-5 space-y-4 transition-colors ${flash === 'ok' ? 'border-open' : flash === 'bad' ? 'border-closed' : 'border-steel'}`}>
          <div className="flex justify-between font-mono text-sm">
            <span className="text-muted">Score {score}</span>
            <span className={timeLeft <= 15 ? 'text-closed' : 'text-soon'} aria-live="polite">{mm}:{ss}</span>
          </div>
          <p className="font-mono text-2xl sm:text-3xl text-center py-4 tracking-wide">
            {puzzle.terms.join(',  ')},  <span className="text-violet-light">?</span>
          </p>
          <form className="flex gap-3 max-w-sm mx-auto" onSubmit={(e) => { e.preventDefault(); submit(); }}>
            <input
              ref={inputRef}
              aria-label="Next number"
              className="flex-1 bg-bg border border-steel rounded px-3 py-2 font-mono text-lg text-center"
              inputMode="numeric"
              autoComplete="off"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button type="submit" className="font-mono text-sm px-4 rounded bg-violet text-white hover:bg-violet-light hover:text-bg">↵</button>
          </form>
          {lastMiss && (
            <p className="font-mono text-[11px] text-muted text-center">
              Last miss: {lastMiss.terms.join(', ')}, <span className="text-closed">{lastMiss.answer}</span> — {lastMiss.rule}
            </p>
          )}
        </div>
      )}

      {phase === 'done' && (
        <div className="rounded-lg border border-steel bg-panel p-5 space-y-3">
          <p className="font-mono text-lg">
            <span className="text-open">{score}</span> correct
            <span className="text-muted"> / {attempts} attempted ({attempts ? Math.round((score / attempts) * 100) : 0}% accuracy)</span>
            {best !== null && score >= best && <span className="text-soon"> ★ best</span>}
          </p>
          <p className="text-sm text-muted">
            Speed comes from pattern recognition: check first differences, then ratios, then second
            differences, then whether two sequences are interleaved. Most test sequences are one of
            those four.
          </p>
          <button type="button" className={btnCls} onClick={() => setPhase('idle')}>Again</button>
        </div>
      )}
    </div>
  );
}
