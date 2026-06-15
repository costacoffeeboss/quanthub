import { useState } from 'react';
import {
  quizQuestions,
  scoreQuiz,
  type QuizResult,
} from '../data/firmTypes';
import { usePersistentState } from '../lib/storage';

const TOTAL = quizQuestions.length;

export default function FirmQuiz() {
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = usePersistentState<QuizResult | null>('qh:firmquiz', null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [index, setIndex] = useState(0);
  const [retaking, setRetaking] = useState(false);
  // bump on every card change to retrigger the entry animation
  const [animKey, setAnimKey] = useState(0);

  const showResult = saved && !retaking;
  const q = quizQuestions[index];

  const goTo = (next: number) => {
    setIndex(next);
    setAnimKey((k) => k + 1);
  };

  const choose = (oi: number) => {
    const nextAnswers = { ...answers, [q.id]: oi };
    setAnswers(nextAnswers);
    // let the selection register, then slide on
    window.setTimeout(() => {
      if (index < TOTAL - 1) {
        goTo(index + 1);
      } else {
        setSaved(scoreQuiz(nextAnswers));
        setRetaking(false);
      }
    }, 200);
  };

  const back = () => {
    if (index > 0) goTo(index - 1);
  };

  const start = () => {
    setAnswers({});
    setIndex(0);
    setRetaking(true);
    setAnimKey((k) => k + 1);
  };

  return (
    <section className="rounded-lg border border-violet/40 bg-violet/5">
      {/* one-shot keyframes for the card entry animation */}
      <style>{`
        @keyframes qhq-in { from { opacity: 0; transform: translateX(18px); } to { opacity: 1; transform: translateX(0); } }
        .qhq-card { animation: qhq-in 220ms ease-out both; }
        @media (prefers-reduced-motion: reduce) { .qhq-card { animation: none; } }
      `}</style>

      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
      >
        <span className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[11px] uppercase tracking-wider text-violet-light">Quiz</span>
          <span className="font-semibold">Which quant firm suits you?</span>
          {saved && <span className="font-mono text-[11px] text-soon">· result saved</span>}
        </span>
        <span className="font-mono text-xs text-muted">{open ? '▲ hide' : '▼ start'}</span>
      </button>

      {open && (
        <div className="border-t border-violet/30 px-5 py-5">
          {showResult ? (
            <ResultView result={saved!} onRetake={start} />
          ) : (
            <div className="space-y-5">
              {/* progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between font-mono text-[11px] text-muted">
                  <span>
                    Question {index + 1} <span className="text-muted/60">/ {TOTAL}</span>
                  </span>
                  <span>{Math.round((index / TOTAL) * 100)}%</span>
                </div>
                <div className="h-1.5 rounded bg-steel/40 overflow-hidden">
                  <div
                    className="h-full bg-violet transition-all duration-300"
                    style={{ width: `${(index / TOTAL) * 100}%` }}
                  />
                </div>
              </div>

              {/* animated question card */}
              <div key={animKey} className="qhq-card space-y-4 min-h-[18rem]">
                <p className="text-lg font-semibold leading-snug">{q.prompt}</p>
                <div className="space-y-2">
                  {q.options.map((opt, oi) => {
                    const selected = answers[q.id] === oi;
                    return (
                      <button
                        key={oi}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => choose(oi)}
                        className={`flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
                          selected
                            ? 'border-violet-light bg-violet/20 text-fg'
                            : 'border-steel bg-panel text-fg/90 hover:border-violet-light hover:bg-violet/10'
                        }`}
                      >
                        <span
                          className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border font-mono text-[11px] ${
                            selected ? 'border-violet-light text-violet-light' : 'border-steel text-muted'
                          }`}
                        >
                          {String.fromCharCode(65 + oi)}
                        </span>
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={back}
                  disabled={index === 0}
                  className={`rounded border px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors ${
                    index === 0
                      ? 'border-steel/40 text-muted/40 cursor-not-allowed'
                      : 'border-steel text-muted hover:border-violet-light hover:text-fg'
                  }`}
                >
                  ← Back
                </button>
                <span className="font-mono text-[11px] text-muted">Tap an answer to continue</span>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function ResultView({ result, onRetake }: { result: QuizResult; onRetake: () => void }) {
  const medal = ['①', '②', '③'];
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted">
        Based on your answers. A starting point, not gospel — read the profiles and verify
        everything yourself.
      </p>

      <div>
        <h3 className="font-mono text-xs uppercase tracking-wider text-muted mb-3">Your top firm types</h3>
        <div className="space-y-2">
          {result.topTypes.map((t, i) => (
            <div key={t.category} className="rounded border border-steel bg-panel p-3">
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-semibold text-violet-light">
                  <span className="text-soon mr-2">{medal[i]}</span>
                  {t.category}
                </span>
                <span className="font-mono text-[11px] text-muted">{t.score}% match</span>
              </div>
              <div className="mt-2 h-1.5 rounded bg-steel/40 overflow-hidden">
                <div className="h-full bg-violet" style={{ width: `${t.score}%` }} />
              </div>
              <p className="mt-2 text-xs text-muted">{t.why}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-mono text-xs uppercase tracking-wider text-muted mb-3">Firms to look at first</h3>
        <div className="space-y-2">
          {result.topFirms.map((f, i) => (
            <a
              key={f.id}
              href={`#${f.id}`}
              className="block rounded border border-steel bg-panel p-3 hover:border-violet-light"
            >
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-semibold">
                  <span className="text-soon mr-2">{medal[i]}</span>
                  {f.name}
                </span>
                <span className="font-mono text-[11px] text-violet-light whitespace-nowrap">jump to profile ↓</span>
              </div>
              <p className="mt-1 text-[13px] leading-snug text-muted">{f.why}</p>
            </a>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={onRetake}
        className="rounded border border-steel px-4 py-2 font-mono text-xs uppercase tracking-wider text-muted hover:border-violet-light hover:text-fg"
      >
        Retake quiz
      </button>
    </div>
  );
}
