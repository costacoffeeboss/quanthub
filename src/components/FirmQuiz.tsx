import { useMemo, useState } from 'react';
import {
  quizQuestions,
  scoreQuiz,
  type QuizResult,
} from '../data/firmTypes';
import { usePersistentState } from '../lib/storage';

export default function FirmQuiz() {
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = usePersistentState<QuizResult | null>('qh:firmquiz', null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [retaking, setRetaking] = useState(false);

  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === quizQuestions.length;
  const showQuestions = !saved || retaking;

  const result = useMemo(() => (saved && !retaking ? saved : null), [saved, retaking]);

  const submit = () => {
    const r = scoreQuiz(answers);
    setSaved(r);
    setRetaking(false);
    setOpen(true);
  };

  const retake = () => {
    setAnswers({});
    setRetaking(true);
  };

  return (
    <section className="rounded-lg border border-violet/40 bg-violet/5">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
      >
        <span className="flex items-center gap-2">
          <span className="font-mono text-[11px] uppercase tracking-wider text-violet-light">Quiz</span>
          <span className="font-semibold">Which quant firm suits you?</span>
          {saved && (
            <span className="font-mono text-[11px] text-soon">· result saved</span>
          )}
        </span>
        <span className="font-mono text-xs text-muted">{open ? '▲ hide' : '▼ start'}</span>
      </button>

      {open && (
        <div className="border-t border-violet/30 px-5 py-5 space-y-5">
          <p className="text-sm text-muted">
            15 quick questions. We score the four firm <em>types</em> plus your work style,
            location and pace preferences, then suggest your top 3 types and top 3 firms. It&apos;s a
            self-reflection aid, not careers advice — answers stay in this browser.
          </p>

          {result ? (
            <ResultView result={result} onRetake={retake} />
          ) : showQuestions ? (
            <>
              <ol className="space-y-5">
                {quizQuestions.map((q, qi) => (
                  <li key={q.id} className="space-y-2">
                    <p className="text-sm font-medium">
                      <span className="font-mono text-violet-light mr-2">{qi + 1}.</span>
                      {q.prompt}
                    </p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {q.options.map((opt, oi) => {
                        const selected = answers[q.id] === oi;
                        return (
                          <button
                            key={oi}
                            type="button"
                            aria-pressed={selected}
                            onClick={() => setAnswers((p) => ({ ...p, [q.id]: oi }))}
                            className={`rounded border px-3 py-2 text-left text-sm transition-colors ${
                              selected
                                ? 'border-violet-light bg-violet/15 text-fg'
                                : 'border-steel bg-panel text-muted hover:border-violet-light hover:text-fg'
                            }`}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </li>
                ))}
              </ol>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={!allAnswered}
                  onClick={submit}
                  className={`rounded px-4 py-2 font-mono text-xs uppercase tracking-wider transition-colors ${
                    allAnswered
                      ? 'bg-violet text-white hover:bg-violet-light'
                      : 'bg-steel/40 text-muted cursor-not-allowed'
                  }`}
                >
                  See my results
                </button>
                <span className="font-mono text-xs text-muted">
                  {answeredCount}/{quizQuestions.length} answered
                </span>
              </div>
            </>
          ) : null}
        </div>
      )}
    </section>
  );
}

function ResultView({ result, onRetake }: { result: QuizResult; onRetake: () => void }) {
  const medal = ['①', '②', '③'];
  return (
    <div className="space-y-6">
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
                <span className="font-mono text-[11px] text-violet-light">jump to profile ↓</span>
              </div>
              <p className="mt-1 font-mono text-[11px] text-muted capitalize">{f.why}</p>
            </a>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onRetake}
          className="rounded border border-steel px-4 py-2 font-mono text-xs uppercase tracking-wider text-muted hover:border-violet-light hover:text-fg"
        >
          Retake quiz
        </button>
        <span className="font-mono text-[11px] text-muted">
          Results are a starting point — read the profiles and verify everything yourself.
        </span>
      </div>
    </div>
  );
}
