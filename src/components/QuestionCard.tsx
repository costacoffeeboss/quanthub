import { useState } from 'react';
import type { Difficulty, Question } from '../data/questionBank';

const diffColor: Record<Difficulty, string> = {
  Easy: 'text-open',
  Medium: 'text-soon',
  Hard: 'text-closed',
};

interface Props {
  q: Question;
  done: boolean;
  bookmarked: boolean;
  onToggleDone: (id: string) => void;
  onToggleBookmark: (id: string) => void;
  /** Start with the solution open (used when deep-linking the daily question). */
  defaultOpen?: boolean;
}

export default function QuestionCard({
  q,
  done,
  bookmarked,
  onToggleDone,
  onToggleBookmark,
  defaultOpen = false,
}: Props) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [showSolution, setShowSolution] = useState(defaultOpen);

  return (
    <article className={`rounded-lg border bg-panel p-5 ${done ? 'border-open/40' : 'border-steel'}`}>
      <header className="flex flex-wrap items-center gap-2">
        <h3 className="font-semibold mr-auto">{q.title}</h3>
        <span className="font-mono text-[11px] text-muted border border-steel rounded px-2 py-0.5">
          {q.topic}
        </span>
        <span className={`font-mono text-[11px] border border-steel rounded px-2 py-0.5 ${diffColor[q.difficulty]}`}>
          {q.difficulty}
        </span>
        {q.style && (
          <span className="font-mono text-[11px] text-violet-light border border-violet/40 rounded px-2 py-0.5">
            {q.style}
          </span>
        )}
      </header>

      {q.firms && q.firms.length > 0 && (
        <p className="mt-2 font-mono text-[10px] text-muted">
          Reported in this style at: <span className="text-violet-light">{q.firms.join(', ')}</span>
        </p>
      )}

      <p className="mt-3 text-sm leading-relaxed">{q.prompt}</p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {q.answer && (
          <button
            type="button"
            onClick={() => setShowAnswer((s) => !s)}
            className="font-mono text-xs px-3 py-1.5 rounded border border-steel text-fg hover:border-violet-light transition-colors"
          >
            {showAnswer ? 'Hide answer' : 'Quick answer'}
          </button>
        )}
        <button
          type="button"
          onClick={() => setShowSolution((s) => !s)}
          aria-expanded={showSolution}
          className="font-mono text-xs px-3 py-1.5 rounded border border-violet/60 text-violet-light hover:bg-violet/15 transition-colors"
        >
          {showSolution ? 'Hide solution' : 'Worked solution'}
        </button>
        <label className="font-mono text-xs flex items-center gap-2 cursor-pointer text-muted hover:text-fg ml-auto">
          <input
            type="checkbox"
            checked={done}
            onChange={() => onToggleDone(q.id)}
            className="accent-[#6d4aff]"
          />
          done
        </label>
        <button
          type="button"
          onClick={() => onToggleBookmark(q.id)}
          aria-pressed={bookmarked}
          aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark'}
          className={`font-mono text-sm leading-none px-1 ${bookmarked ? 'text-soon' : 'text-muted hover:text-fg'}`}
        >
          {bookmarked ? '★' : '☆'}
        </button>
      </div>

      {showAnswer && q.answer && (
        <p className="mt-3 rounded border border-steel bg-bg px-3 py-2 font-mono text-xs text-fg">
          {q.answer}
        </p>
      )}

      {showSolution && (
        <div className="mt-3 border-t border-steel pt-3 space-y-3 text-sm leading-relaxed">
          {q.solution.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      )}
    </article>
  );
}
