import { useMemo, useState } from 'react';
import type { QuizQuestion } from '../../data/optionsCourse';
import { PASS_PCT } from '../../data/optionsCourse';

interface Props {
  questions: QuizQuestion[];
  /** Called on every submission with the score so progress can be persisted. */
  onComplete: (pct: number, passed: boolean) => void;
}

function isCorrect(q: QuizQuestion, raw: string | undefined): boolean {
  if (raw === undefined || raw === '') return false;
  if (q.type === 'mcq') return Number(raw) === q.answerIndex;
  const n = Number(raw);
  return Number.isFinite(n) && Math.abs(n - q.answer) <= q.tolerance;
}

export default function Quiz({ questions, onComplete }: Props) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const { correct, pct, passed } = useMemo(() => {
    const c = questions.filter((q) => isCorrect(q, answers[q.id])).length;
    const p = Math.round((c / questions.length) * 100);
    return { correct: c, pct: p, passed: p >= PASS_PCT };
  }, [answers, questions]);

  const allAnswered = questions.every((q) => {
    const v = answers[q.id];
    return v !== undefined && v !== '';
  });

  function submit() {
    setSubmitted(true);
    onComplete(pct, passed);
  }

  function reset() {
    setAnswers({});
    setSubmitted(false);
  }

  return (
    <div className="space-y-5">
      {submitted && (
        <div
          className={`rounded-lg border p-4 ${
            passed ? 'border-open/50 bg-open/10' : 'border-closed/50 bg-closed/10'
          }`}
        >
          <p className="font-mono text-sm">
            <span className={passed ? 'text-open' : 'text-closed'}>
              {correct}/{questions.length} correct · {pct}%
            </span>{' '}
            <span className="text-muted">— pass mark {PASS_PCT}%.</span>
          </p>
          <p className="mt-1 text-sm text-muted">
            {passed
              ? 'Chapter passed — the next chapter is unlocked. Review any misses below.'
              : 'Not quite — review the explanations below and retake when ready.'}
          </p>
        </div>
      )}

      <ol className="space-y-5">
        {questions.map((q, i) => {
          const raw = answers[q.id];
          const ok = isCorrect(q, raw);
          return (
            <li
              key={q.id}
              className={`rounded-lg border bg-panel p-4 ${
                submitted ? (ok ? 'border-open/40' : 'border-closed/40') : 'border-steel'
              }`}
            >
              <p className="text-sm font-medium">
                <span className="font-mono text-muted mr-2">{i + 1}.</span>
                {q.prompt}
              </p>

              {q.type === 'mcq' ? (
                <div className="mt-3 space-y-2">
                  {q.choices.map((choice, ci) => {
                    const selected = Number(raw) === ci;
                    const showCorrect = submitted && ci === q.answerIndex;
                    const showWrong = submitted && selected && ci !== q.answerIndex;
                    return (
                      <label
                        key={ci}
                        className={`flex items-start gap-2 rounded border px-3 py-2 text-sm cursor-pointer transition-colors ${
                          showCorrect
                            ? 'border-open/60 bg-open/10'
                            : showWrong
                              ? 'border-closed/60 bg-closed/10'
                              : selected
                                ? 'border-violet/60'
                                : 'border-steel hover:border-violet-light'
                        }`}
                      >
                        <input
                          type="radio"
                          name={q.id}
                          checked={selected}
                          disabled={submitted}
                          onChange={() => setAnswers((a) => ({ ...a, [q.id]: String(ci) }))}
                          className="mt-0.5 accent-[#6d4aff]"
                        />
                        <span>{choice}</span>
                      </label>
                    );
                  })}
                </div>
              ) : (
                <div className="mt-3 flex items-center gap-2">
                  {q.unit && <span className="font-mono text-sm text-muted">{q.unit}</span>}
                  <input
                    type="number"
                    inputMode="decimal"
                    step="any"
                    value={raw ?? ''}
                    disabled={submitted}
                    onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                    className="w-40 bg-bg border border-steel rounded px-3 py-1.5 font-mono text-sm"
                    placeholder="your answer"
                  />
                  {submitted && (
                    <span className={`font-mono text-xs ${ok ? 'text-open' : 'text-closed'}`}>
                      {ok ? '✓ correct' : `✗ answer: ${q.answer}${q.unit ?? ''}`}
                    </span>
                  )}
                </div>
              )}

              {submitted && (
                <p className="mt-3 border-t border-steel pt-3 text-sm leading-relaxed text-muted">
                  {q.explanation}
                </p>
              )}
            </li>
          );
        })}
      </ol>

      <div className="flex items-center gap-3">
        {!submitted ? (
          <>
            <button
              type="button"
              onClick={submit}
              disabled={!allAnswered}
              className="font-mono text-xs px-4 py-2 rounded border border-violet/60 text-violet-light hover:bg-violet/15 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Submit quiz
            </button>
            {!allAnswered && (
              <span className="font-mono text-xs text-muted">Answer every question to submit.</span>
            )}
          </>
        ) : (
          <button
            type="button"
            onClick={reset}
            className="font-mono text-xs px-4 py-2 rounded border border-steel text-fg hover:border-violet-light transition-colors"
          >
            Retake quiz
          </button>
        )}
      </div>
    </div>
  );
}
