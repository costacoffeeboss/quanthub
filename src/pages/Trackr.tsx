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

const stageColor: Record<ApplicationStage, string> = {
  'Not applied': 'text-muted',
  Applied: 'text-violet-light',
  'Online assessment': 'text-soon',
  Interview: 'text-violet-light',
  Offer: 'text-open',
  Rejected: 'text-closed',
};

type Statuses = Record<string, ApplicationStage>;

export default function Trackr() {
  const [statuses, setStatuses] = usePersistentState<Statuses>('qh:trackr', {});
  const [typeFilter, setTypeFilter] = useState('All');
  const [roleFilter, setRoleFilter] = useState('All');
  const [locFilter, setLocFilter] = useState('All');
  const [stageFilter, setStageFilter] = useState('All');

  const locations = useMemo(
    () => ['All', ...Array.from(new Set(programmes.map((p) => p.location))).sort()],
    [],
  );

  const stageOf = (p: Programme): ApplicationStage => statuses[p.id] ?? 'Not applied';

  const rows = programmes.filter(
    (p) =>
      (typeFilter === 'All' || p.type === typeFilter) &&
      (roleFilter === 'All' || p.role === roleFilter) &&
      (locFilter === 'All' || p.location === locFilter) &&
      (stageFilter === 'All' || stageOf(p) === stageFilter),
  );

  const counts = APPLICATION_STAGES.filter((s) => s !== 'Not applied').map((s) => ({
    stage: s,
    n: programmes.filter((p) => stageOf(p) === s).length,
  }));

  const selectCls =
    'bg-panel border border-steel rounded px-2 py-1.5 font-mono text-xs text-fg hover:border-violet-light';

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Trackr</h1>
        <p className="mt-2 text-muted max-w-2xl text-sm">
          UK-relevant quant programmes and the windows in which they have{' '}
          <em>typically</em> opened in recent cycles. Set your own status per row — it stays in
          this browser.
        </p>
        <p className="mt-2 inline-block rounded border border-soon/40 bg-soon/10 px-3 py-1.5 font-mono text-[11px] text-soon">
          ⚠ Windows are approximate, not live status — verify on each firm&apos;s careers page.
        </p>
      </header>

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
              <th className="p-3 border-b border-steel">Firm</th>
              <th className="p-3 border-b border-steel">Programme</th>
              <th className="p-3 border-b border-steel">Role</th>
              <th className="p-3 border-b border-steel">Location</th>
              <th className="p-3 border-b border-steel">
                Typical window<span className="text-soon">*</span>
              </th>
              <th className="p-3 border-b border-steel">Careers</th>
              <th className="p-3 border-b border-steel">My status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id} className="border-b border-steel last:border-0 hover:bg-bg/40">
                <td className="p-3 font-medium whitespace-nowrap">
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
                <td className="p-3 font-mono text-xs whitespace-nowrap">{p.type}</td>
                <td className="p-3 font-mono text-xs">{p.role}</td>
                <td className="p-3 font-mono text-xs whitespace-nowrap">{p.location}</td>
                <td className="p-3 font-mono text-xs text-soon whitespace-nowrap">{p.window}</td>
                <td className="p-3">
                  <a
                    href={p.careersUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-xs text-violet-light hover:underline whitespace-nowrap"
                  >
                    visit ↗
                  </a>
                </td>
                <td className="p-3">
                  <select
                    aria-label={`Status for ${p.firm} ${p.type}`}
                    className={`bg-bg border border-steel rounded px-2 py-1 font-mono text-xs ${stageColor[stageOf(p)]}`}
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
                <td colSpan={7} className="p-6 text-center text-muted font-mono text-xs">
                  No programmes match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="font-mono text-[11px] text-muted">
        * Typical of recent application cycles; firms change dates every year and some roles open or
        close early. This table is a planning aid, not live data.
      </p>
    </div>
  );
}
