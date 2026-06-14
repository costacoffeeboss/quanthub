import { Link } from 'react-router-dom';
import { chapters, PASS_PCT } from '../data/optionsCourse';
import {
  isUnlocked,
  passedCount,
  useOptionsProgress,
  useUnlockAll,
} from '../lib/optionsProgress';

function ProgressBar({ pct }: { pct: number }) {
  return (
    <div className="h-1.5 flex-1 rounded-full bg-steel overflow-hidden">
      <div className="h-full bg-violet rounded-full transition-all" style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function Options() {
  const [progress] = useOptionsProgress();
  const [unlockAll, setUnlockAll] = useUnlockAll();

  const passed = passedCount(progress);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold">Options Theory</h1>
        <p className="mt-2 text-muted max-w-2xl text-sm">
          A seven-chapter course from first principles to the vol surface. Each chapter is split into
          short sub-chapters, each ending with a quick understanding check; clear the chapter’s final
          exam ({PASS_PCT}% to pass) and the next unlocks. Light on formulas on purpose — interviews
          reward understanding over recall. Progress is saved in this browser.
        </p>
      </header>

      {/* progress + unlock control */}
      <section className="rounded-lg border border-steel bg-panel p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs uppercase tracking-wider text-muted">Your progress</span>
            <span className="font-mono text-xs text-violet-light">
              {passed}/{chapters.length} chapters passed
            </span>
          </div>
          <label className="flex items-center gap-2 font-mono text-xs text-muted hover:text-fg cursor-pointer">
            <input
              type="checkbox"
              checked={unlockAll}
              onChange={(e) => setUnlockAll(e.target.checked)}
              className="accent-[#6d4aff]"
            />
            Unlock all chapters (skip the gate)
          </label>
        </div>
        <div className="flex items-center gap-2">
          <ProgressBar pct={Math.round((passed / chapters.length) * 100)} />
          <span className="font-mono text-[11px] text-muted tabular-nums w-12 text-right">
            {Math.round((passed / chapters.length) * 100)}%
          </span>
        </div>
      </section>

      {/* chapter list */}
      <ol className="space-y-3">
        {chapters.map((c) => {
          const unlocked = isUnlocked(c.id, progress, unlockAll);
          const result = progress[c.id];
          const card = (
            <div
              className={`rounded-lg border bg-panel p-5 transition-colors ${
                unlocked ? 'border-steel hover:border-violet-light' : 'border-steel opacity-60'
              }`}
            >
              <div className="flex items-start gap-4">
                <span
                  className={`font-mono text-sm shrink-0 w-7 h-7 rounded-full grid place-items-center border ${
                    result?.passed
                      ? 'border-open/60 text-open'
                      : unlocked
                        ? 'border-violet/60 text-violet-light'
                        : 'border-steel text-muted'
                  }`}
                >
                  {result?.passed ? '✓' : c.number}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold">{c.title}</h2>
                    {result?.passed && (
                      <span className="font-mono text-[10px] text-open border border-open/40 rounded px-2 py-0.5">
                        passed · best {result.bestPct}%
                      </span>
                    )}
                    {!result?.passed && result && (
                      <span className="font-mono text-[10px] text-soon border border-steel rounded px-2 py-0.5">
                        best {result.bestPct}%
                      </span>
                    )}
                    {!unlocked && (
                      <span className="font-mono text-[10px] text-muted border border-steel rounded px-2 py-0.5">
                        🔒 locked
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted">{c.summary}</p>
                  {!unlocked && (
                    <p className="mt-2 font-mono text-[11px] text-muted">
                      Pass chapter {c.number - 1} to unlock — or flip the toggle above.
                    </p>
                  )}
                </div>
                {unlocked && (
                  <span className="font-mono text-xs text-violet-light shrink-0 self-center">→</span>
                )}
              </div>
            </div>
          );

          return (
            <li key={c.id}>
              {unlocked ? (
                <Link to={`/options/${c.id}`} className="block">
                  {card}
                </Link>
              ) : (
                card
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
