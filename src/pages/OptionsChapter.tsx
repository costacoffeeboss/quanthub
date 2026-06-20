import { Link, useParams } from 'react-router-dom';
import { chapters, chapterById, chapterIndex, PASS_PCT } from '../data/optionsCourse';
import { isUnlocked, useOptionsProgress, useUnlockAll } from '../lib/optionsProgress';
import { lessons } from './options/lessons';
import Quiz from '../components/options/Quiz';
import { Paywall, useEntitlement } from '../lib/premium';

export default function OptionsChapter() {
  const { chapterId = '' } = useParams();
  const [progress, setProgress] = useOptionsProgress();
  const [unlockAll] = useUnlockAll();
  const ent = useEntitlement();

  const chapter = chapterById(chapterId);

  if (!chapter) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted">That chapter doesn’t exist.</p>
        <Link to="/options" className="font-mono text-xs text-violet-light hover:underline">
          ← Back to the course
        </Link>
      </div>
    );
  }

  const unlocked = isUnlocked(chapter.id, progress, unlockAll);
  const idx = chapterIndex(chapter.id);
  const next = chapters[idx + 1];
  const prev = chapters[idx - 1];
  const result = progress[chapter.id];

  // Chapter 1 is free; everything after it is Pro.
  if (idx >= 1 && ent.loading) {
    return <p className="font-mono text-sm text-muted">Checking access…</p>;
  }
  if (idx >= 1 && !ent.premium) {
    return (
      <div className="space-y-4 max-w-2xl">
        <Link to="/options" className="font-mono text-xs text-violet-light hover:underline">
          ← Back to the course
        </Link>
        <Paywall feature={`Chapter ${chapter.number} of the options course`} />
      </div>
    );
  }

  if (!unlocked) {
    return (
      <div className="space-y-4 max-w-2xl">
        <Link to="/options" className="font-mono text-xs text-violet-light hover:underline">
          ← Back to the course
        </Link>
        <div className="rounded-lg border border-steel bg-panel p-6">
          <p className="font-mono text-sm text-muted">
            🔒 <strong className="text-fg">{chapter.title}</strong> is locked.
          </p>
          <p className="mt-2 text-sm text-muted">
            Pass the final exam at the end of chapter {chapter.number - 1} to unlock it — or enable “Unlock all
            chapters” on the course overview.
          </p>
        </div>
      </div>
    );
  }

  function handleComplete(pct: number, passed: boolean) {
    setProgress((p) => {
      const prevResult = p[chapter!.id];
      return {
        ...p,
        [chapter!.id]: {
          bestPct: Math.max(prevResult?.bestPct ?? 0, pct),
          passed: (prevResult?.passed ?? false) || passed,
        },
      };
    });
  }

  return (
    <div className="space-y-10">
      <div>
        <Link to="/options" className="font-mono text-xs text-violet-light hover:underline">
          ← Course overview
        </Link>
        <header className="mt-3">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
            Chapter {chapter.number} of {chapters.length}
          </p>
          <h1 className="mt-1 text-2xl font-bold">{chapter.title}</h1>
          <ul className="mt-3 space-y-1">
            {chapter.objectives.map((o) => (
              <li key={o} className="flex items-start gap-2 text-sm text-muted">
                <span className="text-violet-light">›</span>
                {o}
              </li>
            ))}
          </ul>
        </header>
      </div>

      {/* lesson */}
      <article>{lessons[chapter.id]}</article>

      {/* final exam */}
      <section className="space-y-4 border-t border-steel pt-8">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-xl font-bold">Chapter {chapter.number} final exam</h2>
          {result?.passed && (
            <span className="font-mono text-xs text-open">passed · best {result.bestPct}%</span>
          )}
        </div>
        <p className="text-sm text-muted max-w-2xl">
          {chapter.quiz.length} questions spanning every sub-chapter above. Score {PASS_PCT}% or better to mark
          the chapter complete and unlock the next. (The shorter checks within each sub-chapter are just for
          practice — only this exam counts.)
        </p>
        <Quiz questions={chapter.quiz} onComplete={handleComplete} />
      </section>

      {/* footer nav */}
      <nav className="flex items-center justify-between border-t border-steel pt-6">
        {prev ? (
          <Link
            to={`/options/${prev.id}`}
            className="font-mono text-xs text-muted hover:text-violet-light"
          >
            ← {prev.number}. {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next &&
          (result?.passed || unlockAll ? (
            <Link
              to={`/options/${next.id}`}
              className="font-mono text-xs px-4 py-2 rounded border border-violet/60 text-violet-light hover:bg-violet/15 transition-colors"
            >
              Next: {next.number}. {next.title} →
            </Link>
          ) : (
            <span className="font-mono text-xs text-muted">🔒 Pass the final exam to continue</span>
          ))}
      </nav>
    </div>
  );
}
