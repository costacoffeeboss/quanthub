import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  APPLICATION_STAGES,
  programmes,
  type ApplicationStage,
  type Programme,
} from '../data/firms';
import { profileIdForFirm } from '../data/firms-detail';
import { usePersistentState } from '../lib/storage';
import { useEntitlement, LockBadge } from '../lib/premium';

const stageColor: Record<ApplicationStage, string> = {
  'Not applied': 'text-muted',
  Applied: 'text-violet-light',
  'Online assessment': 'text-soon',
  Interview: 'text-violet-light',
  Offer: 'text-open',
  Rejected: 'text-closed',
};

type Statuses = Record<string, ApplicationStage>;
type Favourites = Record<string, boolean>;
type Notes = Record<string, string>;

export default function Trackr() {
  const [statuses, setStatuses] = usePersistentState<Statuses>('qh:trackr', {});
  const [favourites, setFavourites] = usePersistentState<Favourites>('qh:trackr:fav', {});
  const [notes, setNotes] = usePersistentState<Notes>('qh:trackr:notes', {});
  const [typeFilter, setTypeFilter] = useState('All');
  const [roleFilter, setRoleFilter] = useState('All');
  const [locFilter, setLocFilter] = useState('All');
  const [stageFilter, setStageFilter] = useState('All');
  const [favOnly, setFavOnly] = useState(false);
  const { premium } = useEntitlement();

  const locations = useMemo(
    () => ['All', ...Array.from(new Set(programmes.map((p) => p.location))).sort()],
    [],
  );

  const stageOf = (p: Programme): ApplicationStage => statuses[p.id] ?? 'Not applied';
  const isFav = (p: Programme): boolean => !!favourites[p.id];
  const favCount = programmes.filter((p) => favourites[p.id]).length;

  const rows = programmes
    .filter(
      (p) =>
        (typeFilter === 'All' || p.type === typeFilter) &&
        (roleFilter === 'All' || p.role === roleFilter) &&
        (locFilter === 'All' || p.location === locFilter) &&
        (stageFilter === 'All' || stageOf(p) === stageFilter) &&
        (!favOnly || isFav(p)),
    )
    // pin favourites to the top, otherwise keep the source order (stable)
    .sort((a, b) => Number(isFav(b)) - Number(isFav(a)));

  const counts = APPLICATION_STAGES.filter((s) => s !== 'Not applied').map((s) => ({
    stage: s,
    n: programmes.filter((p) => stageOf(p) === s).length,
  }));

  const toggleFav = (id: string) =>
    setFavourites((prev) => {
      const next = { ...prev };
      if (next[id]) delete next[id];
      else next[id] = true;
      return next;
    });

  const selectCls =
    'bg-panel border border-steel rounded px-2 py-1.5 font-mono text-xs text-fg hover:border-violet-light';

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Tracker</h1>
        <p className="mt-2 text-muted max-w-2xl text-sm">
          Quant internships and graduate programmes, and the wider offices these firms recruit into.
          Windows are <em>typical</em> of recent cycles. Star the roles you care about, jot a note,
          and set your status — everything stays in this browser.
        </p>
        <p className="mt-2 inline-block rounded border border-soon/40 bg-soon/10 px-3 py-1.5 font-mono text-[11px] text-soon">
          ⚠ Windows, deadlines and comp are approximate, not live — verify on each firm&apos;s careers page.
        </p>
      </header>

      {!premium && (
        <div className="flex items-center gap-2 rounded border border-violet/40 bg-plum/15 px-3 py-2 text-sm">
          <LockBadge />
          <span className="text-muted">
            Browsing is free. Saving your <span className="text-fg">status, stars and notes</span> is a Pro
            feature — upgrade to keep a personal tracker that follows you.
          </span>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filters">
        <select aria-label="Programme type" className={selectCls} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          {['All', 'Internship', 'Graduate', 'Spring Week'].map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
        <select aria-label="Role family" className={selectCls} value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          {['All', 'Trading', 'Research', 'Development', 'Risk', 'Multiple'].map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
        <select aria-label="Location" className={selectCls} value={locFilter} onChange={(e) => setLocFilter(e.target.value)}>
          {locations.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
        <select aria-label="My status" className={selectCls} value={stageFilter} onChange={(e) => setStageFilter(e.target.value)}>
          <option>All</option>
          {APPLICATION_STAGES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <button
          type="button"
          aria-pressed={favOnly}
          onClick={() => setFavOnly((v) => !v)}
          className={`rounded border px-2.5 py-1.5 font-mono text-xs transition-colors ${
            favOnly
              ? 'border-soon text-soon bg-soon/10'
              : 'border-steel text-muted hover:border-violet-light hover:text-fg'
          }`}
        >
          {favOnly ? '★' : '☆'} Favourites only{favCount > 0 ? ` (${favCount})` : ''}
        </button>
        <span className="font-mono text-xs text-muted ml-auto">
          {rows.length}/{programmes.length} shown
        </span>
      </div>

      <div className="flex flex-wrap gap-2" aria-label="My application summary">
        {counts.map(({ stage, n }) => (
          <span
            key={stage}
            className={`font-mono text-xs rounded border border-steel bg-panel px-2.5 py-1 ${n > 0 ? stageColor[stage] : 'text-muted/50'}`}
          >
            {stage}: {n}
          </span>
        ))}
      </div>

      <div className="overflow-x-auto rounded-lg border border-steel">
        <table className="w-full text-sm bg-panel">
          <thead>
            <tr className="font-mono text-[11px] uppercase tracking-wider text-muted text-left">
              <th className="p-3 border-b border-steel" aria-label="Favourite"></th>
              <th className="p-3 border-b border-steel">Firm</th>
              <th className="p-3 border-b border-steel">Programme</th>
              <th className="p-3 border-b border-steel">Role</th>
              <th className="p-3 border-b border-steel">Location</th>
              <th className="p-3 border-b border-steel">
                Window<span className="text-soon">*</span>
              </th>
              <th className="p-3 border-b border-steel">
                Comp<span className="text-soon">*</span>
              </th>
              <th className="p-3 border-b border-steel">Notes</th>
              <th className="p-3 border-b border-steel">Careers</th>
              <th className="p-3 border-b border-steel">My status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id} className="border-b border-steel last:border-0 hover:bg-bg/40">
                <td className="p-3 align-top">
                  <button
                    type="button"
                    disabled={!premium}
                    aria-label={isFav(p) ? `Unfavourite ${p.firm} ${p.type}` : `Favourite ${p.firm} ${p.type}`}
                    aria-pressed={isFav(p)}
                    title={premium ? (isFav(p) ? 'Remove from favourites' : 'Mark as favourite') : 'Favouriting is a Pro feature'}
                    onClick={() => toggleFav(p.id)}
                    className={`text-base leading-none transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                      isFav(p) ? 'text-soon' : 'text-muted/40 hover:text-soon'
                    }`}
                  >
                    {isFav(p) ? '★' : '☆'}
                  </button>
                </td>
                <td className="p-3 font-medium whitespace-nowrap align-top">
                  {profileIdForFirm(p.firm) ? (
                    <Link
                      to={`/firms#${profileIdForFirm(p.firm)}`}
                      className="hover:text-violet-light hover:underline"
                      title={`${p.firm} profile`}
                    >
                      {p.firm}
                    </Link>
                  ) : (
                    p.firm
                  )}
                </td>
                <td className="p-3 font-mono text-xs whitespace-nowrap align-top">{p.type}</td>
                <td className="p-3 font-mono text-xs align-top">{p.role}</td>
                <td className="p-3 font-mono text-xs whitespace-nowrap align-top">{p.location}</td>
                <td className="p-3 font-mono text-xs whitespace-nowrap align-top">
                  <span className="text-soon">{p.window}</span>
                  <span className="block text-muted">{p.closes}</span>
                </td>
                <td className="p-3 font-mono text-xs whitespace-nowrap align-top">{p.comp}</td>
                <td className="p-3 align-top">
                  <input
                    type="text"
                    disabled={!premium}
                    aria-label={`Notes for ${p.firm} ${p.type}`}
                    placeholder={premium ? 'add a note…' : 'Pro'}
                    value={notes[p.id] ?? ''}
                    onChange={(e) =>
                      setNotes((prev) => {
                        const next = { ...prev };
                        if (e.target.value) next[p.id] = e.target.value;
                        else delete next[p.id];
                        return next;
                      })
                    }
                    className="w-36 bg-bg border border-steel rounded px-2 py-1 text-xs placeholder:text-muted/50 focus:border-violet-light focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed"
                  />
                </td>
                <td className="p-3 align-top">
                  <a
                    href={p.careersUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-xs text-violet-light hover:underline whitespace-nowrap"
                  >
                    visit ↗
                  </a>
                </td>
                <td className="p-3 align-top">
                  <select
                    aria-label={`Status for ${p.firm} ${p.type}`}
                    disabled={!premium}
                    title={premium ? undefined : 'Saving your status is a Pro feature'}
                    className={`bg-bg border border-steel rounded px-2 py-1 font-mono text-xs disabled:opacity-40 disabled:cursor-not-allowed ${stageColor[stageOf(p)]}`}
                    value={stageOf(p)}
                    onChange={(e) =>
                      setStatuses((prev) => ({
                        ...prev,
                        [p.id]: e.target.value as ApplicationStage,
                      }))
                    }
                  >
                    {APPLICATION_STAGES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={10} className="p-6 text-center text-muted font-mono text-xs">
                  {favOnly ? 'No favourites match these filters — star some roles first.' : 'No programmes match these filters.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="font-mono text-[11px] text-muted">
        * Windows, deadlines and compensation are approximate — typical of recent cycles and
        self-reported, not offers. Firms change dates and pay every year and many recruit on a
        rolling basis, so apply early. This table is a planning aid, not live data.
      </p>
    </div>
  );
}
