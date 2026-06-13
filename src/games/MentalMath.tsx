import { useEffect, useRef, useState } from 'react';
import { usePersistentState } from '../lib/storage';

interface MathQ {
  text: string;
  answer: number;
}

const modes = [
  { id: '80', label: 'Full: 80 questions / 8 min', count: 80, seconds: 480 },
  { id: '40', label: 'Half: 40 questions / 4 min', count: 40, seconds: 240 },
  { id: '20', label: 'Sprint: 20 questions / 2 min', count: 20, seconds: 120 },
] as const;

type ModeId = (typeof modes)[number]['id'];

const ri = (lo: number, hi: number) => lo + Math.floor(Math.random() * (hi - lo + 1));
const pick = <T,>(xs: readonly T[]): T => xs[Math.floor(Math.random() * xs.length)];

function genQ(): MathQ {
  switch (ri(1, 7)) {
    case 1: {
      const a = ri(23, 989);
      const b = ri(23, 989);
      return { text: `${a} + ${b}`, answer: a + b };
    }
    case 2: {
      const a = ri(120, 999);
      const b = ri(23, a - 20);
      return { text: `${a} − ${b}`, answer: a - b };
    }
    case 3: {
      const a = ri(12, 99);
      const b = ri(3, 19);
      return { text: `${a} × ${b}`, answer: a * b };
    }
    case 4: {
      const b = ri(3, 19);
      const q = ri(4, 60);
      return { text: `${b * q} ÷ ${b}`, answer: q };
    }
    case 5: {
      // one-decimal addition
      const a = ri(11, 199) / 10;
      const b = ri(11, 199) / 10;
      return { text: `${a.toFixed(1)} + ${b.toFixed(1)}`, answer: Math.round((a + b) * 10) / 10 };
    }
    case 6: {
      // decimal × integer
      const a = pick([0.25, 0.5, 1.5, 2.5, 0.4, 0.75] as const);
      const b = ri(8, 96);
      return { text: `${a} × ${b}`, answer: Math.round(a * b * 100) / 100 };
    }
    default: {
      // fraction of an integer, integer answer
      const [num, den] = pick([
        [1, 2], [1, 4], [3, 4], [2, 3], [3, 8], [5, 8], [2, 5], [3, 5],
      ] as const);
      const q = ri(4, 30);
      const whole = q * den;
      return { text: `${num}/${den} of ${whole}`, answer: num * q };
    }
  }
}

interface Result {
  q: MathQ;
  given: number;
  ok: boolean;
}

export default function MentalMath() {
  const [highs, setHighs] = usePersistentState<Record<string, number>>('qh:hiscore:math', {});
  const [mode, setMode] = useState<ModeId>('20');
  const [phase, setPhase] = useState<'idle' | 'running' | 'done'>('idle');
  const [qs, setQs] = useState<MathQ[]>([]);
  const [idx, setIdx] = useState(0);
  const [input, setInput] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [flash, setFlash] = useState<'' | 'ok' | 'bad'>('');
  const inputRef = useRef<HTMLInputElement>(null);

  const cfg = modes.find((m) => m.id === mode)!;

  useEffect(() => {
    if (phase !== 'running') return;
    const t = window.setInterval(() => {
      setTimeLeft((s) => {
        if (s <= 1) {
          window.clearInterval(t);
          setPhase('done');
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => window.clearInterval(t);
  }, [phase]);

  const correct = results.filter((r) => r.ok).length;

  useEffect(() => {
    if (phase !== 'done') return;
    setHighs((h) => (correct > (h[mode] ?? -1) ? { ...h, [mode]: correct } : h));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  function start() {
    setQs(Array.from({ length: cfg.count }, genQ));
    setIdx(0);
    setResults([]);
    setInput('');
    setTimeLeft(cfg.seconds);
    setPhase('running');
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function submit() {
    if (input.trim() === '') return;
    const given = Number(input);
    if (Number.isNaN(given)) return;
    const q = qs[idx];
    const ok = Math.abs(given - q.answer) < 0.001;
    setResults((rs) => [...rs, { q, given, ok }]);
    setFlash(ok ? 'ok' : 'bad');
    window.setTimeout(() => setFlash(''), 250);
    setInput('');
    if (idx + 1 >= qs.length) {
      setPhase('done');
    } else {
      setIdx((i) => i + 1);
    }
    inputRef.current?.focus();
  }

  const mm = Math.floor(timeLeft / 60);
  const ss = String(timeLeft % 60).padStart(2, '0');
  const attempted = results.length;
  const accuracy = attempted === 0 ? 0 : Math.round((correct / attempted) * 100);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-x-6 gap-y-1 font-mono text-xs text-muted">
        <span>Best ({cfg.count}q): {highs[mode] ?? '—'}</span>
      </div>

      {phase === 'idle' && (
        <div className="rounded-lg border border-steel bg-panel p-5 space-y-4">
          <p className="text-sm text-muted">
            Optiver-style arithmetic under the clock: addition, subtraction, multiplication,
            division, decimals and fractions. Answer and press Enter; no skipping back. Wrong
            answers cost you nothing but time — but time is everything.
          </p>
          <div className="flex flex-wrap gap-2">
            {modes.map((m) => (
              <label
                key={m.id}
                className={`cursor-pointer font-mono text-xs rounded border px-3 py-2 ${
                  mode === m.id ? 'border-violet text-violet-light' : 'border-steel text-muted hover:text-fg'
                }`}
              >
                <input
                  type="radio"
                  name="mode"
                  className="sr-only"
                  checked={mode === m.id}
                  onChange={() => setMode(m.id)}
                />
                {m.label}
              </label>
            ))}
          </div>
          <button
            type="button"
            onClick={start}
            className="font-mono text-sm px-5 py-2.5 rounded bg-violet text-white hover:bg-violet-light hover:text-bg transition-colors"
          >
            Start →
          </button>
        </div>
      )}

      {phase === 'running' && (
        <div
          className={`rounded-lg border bg-panel p-5 space-y-4 transition-colors ${
            flash === 'ok' ? 'border-open' : flash === 'bad' ? 'border-closed' : 'border-steel'
          }`}
        >
          <div className="flex justify-between font-mono text-sm">
            <span className="text-muted">
              Q {idx + 1}/{qs.length}
            </span>
            <span className={timeLeft <= 10 ? 'text-closed' : 'text-soon'} aria-live="polite">
              {mm}:{ss}
            </span>
          </div>
          <p className="font-mono text-3xl text-center py-4" aria-live="polite">
            {qs[idx].text} <span className="text-muted">=</span>
          </p>
          <form
            className="flex gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
          >
            <input
              ref={inputRef}
              aria-label="Your answer"
              className="flex-1 bg-bg border border-steel rounded px-3 py-2 font-mono text-lg text-center"
              inputMode="decimal"
              autoComplete="off"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button
              type="submit"
              className="font-mono text-sm px-4 rounded bg-violet text-white hover:bg-violet-light hover:text-bg transition-colors"
            >
              ↵
            </button>
          </form>
        </div>
      )}

      {phase === 'done' && (
        <div className="rounded-lg border border-steel bg-panel p-5 space-y-4">
          <p className="font-mono text-lg">
            <span className="text-open">{correct}</span>
            <span className="text-muted">/{attempted} correct · {accuracy}% accuracy</span>
            {correct >= (highs[mode] ?? 0) && correct > 0 && <span className="text-soon"> ★ best</span>}
          </p>
          {results.some((r) => !r.ok) && (
            <details className="font-mono text-xs text-muted">
              <summary className="cursor-pointer hover:text-fg">Review mistakes ({results.filter((r) => !r.ok).length})</summary>
              <ul className="mt-2 space-y-1">
                {results
                  .filter((r) => !r.ok)
                  .map((r, i) => (
                    <li key={i}>
                      {r.q.text} = <span className="text-open">{r.q.answer}</span>{' '}
                      <span className="text-closed">(you: {r.given})</span>
                    </li>
                  ))}
              </ul>
            </details>
          )}
          <button
            type="button"
            onClick={() => setPhase('idle')}
            className="font-mono text-sm px-4 py-2 rounded bg-violet text-white hover:bg-violet-light hover:text-bg transition-colors"
          >
            Again
          </button>
        </div>
      )}
    </div>
  );
}
