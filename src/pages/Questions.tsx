import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  allQuestions,
  CATEGORIES,
  dailyQuestion,
  type Category,
  type Difficulty,
} from '../data/questionBank';
import { usePersistentState } from '../lib/storage';
import QuestionCard from '../components/QuestionCard';

type DoneMap = Record<string, boolean>;
type BookmarkMap = Record<string, boolean>;

const difficulties: Array<Difficulty | 'All'> = ['All', 'Easy', 'Medium', 'Hard'];

function ProgressBar({ done, total }: { done: number; total: number }) {
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 flex-1 rounded-full bg-steel overflow-hidden">
        <div className="h-full bg-violet rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="font-mono text-[11px] text-muted tabular-nums w-16 text-right">
        {done}/{total}
      </span>
    </div>
  );
}

export default function Questions() {
  const [done, setDone] = usePersistentState<DoneMap>('qh:questions-done', {});
  const [bookmarked, setBookmarked] = usePersistentState<BookmarkMap>('qh:questions-bookmarked', {});

  const [search, setSearch] = useState('');
  const [cat, setCat] = useState<Category | 'All'>('All');
  const [diff, setDiff] = useState<Difficulty | 'All'>('All');
  const [view, setView] = useState<'All' | 'Done' | 'Not done' | 'Bookmarked'>('All');
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggleDone = (id: string) => setDone((d) => ({ ...d, [id]: !d[id] }));
  const toggleBookmark = (id: string) => setBookmarked((b) => ({ ...b, [id]: !b[id] }));

  const today = useMemo(() => dailyQuestion(), []);

  const doneCount = allQuestions.filter((q) => done[q.id]).length;
  const bookmarkCount = allQuestions.filter((q) => bookmarked[q.id]).length;

  const perCategory = useMemo(
    () =>
      CATEGORIES.map((c) => {
        const inCat = allQuestions.filter((q) => q.category === c);
        return { category: c, done: inCat.filter((q) => done[q.id]).length, total: inCat.length };
      }),
    [done],
  );

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return allQuestions.filter((q) => {
      if (cat !== 'All' && q.category !== cat) return false;
      if (diff !== 'All' && q.difficulty !== diff) return false;
      if (view === 'Done' && !done[q.id]) return false;
      if (view === 'Not done' && done[q.id]) return false;
      if (view === 'Bookmarked' && !bookmarked[q.id]) return false;
      if (needle) {
        const hay = `${q.title} ${q.prompt} ${q.topic} ${q.category} ${(q.firms ?? []).join(' ')}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
  }, [search, cat, diff, view, done, bookmarked]);

  // group filtered questions by category → topic
  const grouped = useMemo(() => {
    const byCat = new Map<string, Map<string, typeof allQuestions>>();
    for (const q of filtered) {
      if (!byCat.has(q.category)) byCat.set(q.category, new Map());
      const topics = byCat.get(q.category)!;
      if (!topics.has(q.topic)) topics.set(q.topic, []);
      topics.get(q.topic)!.push(q);
    }
    return byCat;
  }, [filtered]);

  const selectCls =
    'bg-panel border border-steel rounded px-2 py-1.5 font-mono text-xs text-fg hover:border-violet-light';

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold">Interview Questions</h1>
        <p className="mt-2 text-muted max-w-2xl text-sm">
          {allQuestions.length} brainteasers across eight categories, each with a one-line answer and a
          full worked solution. Attempt before revealing — the struggle is the training. Progress and
          bookmarks persist in this browser.
        </p>
      </header>

      {/* progress dashboard */}
      <section className="rounded-lg border border-steel bg-panel p-5 space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-mono text-xs uppercase tracking-wider text-muted">Your progress</h2>
          <span className="font-mono text-xs text-muted">
            {doneCount}/{allQuestions.length} done · {bookmarkCount} bookmarked
          </span>
        </div>
        <ProgressBar done={doneCount} total={allQuestions.length} />
        <div className="grid gap-x-6 gap-y-2 sm:grid-cols-2 pt-2">
          {perCategory.map((c) => (
            <button
              key={c.category}
              type="button"
              onClick={() => {
                setCat(c.category);
                setView('All');
                setSearch('');
              }}
              className="text-left group"
            >
              <p className="font-mono text-[11px] text-muted group-hover:text-violet-light mb-1">
                {c.category}
              </p>
              <ProgressBar done={c.done} total={c.total} />
            </button>
          ))}
        </div>
      </section>

      {/* daily question */}
      <section className="rounded-lg border border-violet/40 bg-plum/20 p-5">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-violet-light">
            Question of the day
          </h2>
          <span className="font-mono text-[10px] text-muted">{new Date().toISOString().slice(0, 10)}</span>
        </div>
        <QuestionCard
          q={today}
          done={Boolean(done[today.id])}
          bookmarked={Boolean(bookmarked[today.id])}
          onToggleDone={toggleDone}
          onToggleBookmark={toggleBookmark}
        />
      </section>

      {/* filters */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="search"
            placeholder="Search questions…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-panel border border-steel rounded px-3 py-1.5 font-mono text-xs text-fg hover:border-violet-light min-w-[180px] flex-1"
            aria-label="Search questions"
          />
          <select aria-label="Category" className={selectCls} value={cat} onChange={(e) => setCat(e.target.value as Category | 'All')}>
            <option>All</option>
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <select aria-label="Difficulty" className={selectCls} value={diff} onChange={(e) => setDiff(e.target.value as Difficulty | 'All')}>
            {difficulties.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
          <select aria-label="View" className={selectCls} value={view} onChange={(e) => setView(e.target.value as typeof view)}>
            {['All', 'Not done', 'Done', 'Bookmarked'].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs text-muted">{filtered.length} shown</span>
          <Link to="/mock" className="font-mono text-xs text-violet-light hover:underline">
            Test yourself in a timed mock interview →
          </Link>
        </div>
      </section>

      {/* grouped browser */}
      <div className="space-y-8">
        {[...grouped.entries()].map(([category, topics]) => {
          const catTotal = [...topics.values()].reduce((a, t) => a + t.length, 0);
          const isCollapsed = collapsed[category];
          return (
            <section key={category}>
              <button
                type="button"
                onClick={() => setCollapsed((c) => ({ ...c, [category]: !c[category] }))}
                className="w-full flex items-center gap-2 mb-3 text-left"
              >
                <span className="font-mono text-xs text-violet-light">{isCollapsed ? '▸' : '▾'}</span>
                <h2 className="text-lg font-bold">{category}</h2>
                <span className="font-mono text-[11px] text-muted">{catTotal}</span>
              </button>
              {!isCollapsed && (
                <div className="space-y-6">
                  {[...topics.entries()].map(([topic, qs]) => (
                    <div key={topic}>
                      <h3 className="font-mono text-[11px] uppercase tracking-wider text-muted mb-2 pl-1">
                        {topic} · {qs.length}
                      </h3>
                      <div className="space-y-3">
                        {qs.map((q) => (
                          <QuestionCard
                            key={q.id}
                            q={q}
                            done={Boolean(done[q.id])}
                            bookmarked={Boolean(bookmarked[q.id])}
                            onToggleDone={toggleDone}
                            onToggleBookmark={toggleBookmark}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-center font-mono text-xs text-muted py-8">Nothing matches these filters.</p>
        )}
      </div>
    </div>
  );
}
