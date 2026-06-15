import { roles, firmComparison, sideComparison } from '../data/roles';
import RoleQuiz from '../components/RoleQuiz';

export default function Roles() {
  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-2xl font-bold">Role Explainers</h1>
        <p className="mt-2 text-muted max-w-2xl text-sm">
          Five jobs hide behind the word &quot;quant&quot;. They differ enormously in daily work,
          interview style, and pay. All compensation figures below are approximate UK graduate
          ranges and shift year to year.
        </p>
      </header>

      <RoleQuiz />

      <div className="space-y-6">
        {roles.map((r) => (
          <article key={r.slug} id={r.slug} className="rounded-lg border border-steel bg-panel p-6 scroll-mt-20">
            <header className="flex flex-wrap items-baseline gap-x-3">
              <h2 className="text-xl font-semibold text-violet-light">{r.title}</h2>
              <p className="text-sm text-muted">{r.tagline}</p>
            </header>

            <div className="mt-4 grid gap-6 lg:grid-cols-2">
              <section>
                <h3 className="font-mono text-xs uppercase tracking-wider text-muted mb-2">
                  Day to day
                </h3>
                <div className="space-y-3 text-sm leading-relaxed">
                  {r.dayToDay.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </section>

              <div className="space-y-5">
                <section>
                  <h3 className="font-mono text-xs uppercase tracking-wider text-muted mb-2">
                    Skills
                  </h3>
                  <ul className="text-sm space-y-1.5">
                    {r.skills.map((s, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-violet shrink-0">▸</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </section>
                <section>
                  <h3 className="font-mono text-xs uppercase tracking-wider text-muted mb-2">
                    Background
                  </h3>
                  <p className="text-sm">{r.background}</p>
                </section>
                <section>
                  <h3 className="font-mono text-xs uppercase tracking-wider text-muted mb-2">
                    UK graduate comp <span className="text-soon">(approximate)</span>
                  </h3>
                  <p className="text-sm font-mono">{r.comp}</p>
                </section>
                <section>
                  <h3 className="font-mono text-xs uppercase tracking-wider text-muted mb-2">
                    How the interview differs
                  </h3>
                  <div className="space-y-2 text-sm">
                    {r.interview.map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          </article>
        ))}
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-bold">Prop shop vs hedge fund vs bank</h2>
        <div className="overflow-x-auto rounded-lg border border-steel">
          <table className="w-full text-sm bg-panel">
            <thead>
              <tr className="font-mono text-xs uppercase tracking-wider text-muted text-left">
                <th className="p-3 border-b border-steel"></th>
                <th className="p-3 border-b border-steel text-violet-light">Prop shop</th>
                <th className="p-3 border-b border-steel text-violet-light">Hedge fund</th>
                <th className="p-3 border-b border-steel text-violet-light">Bank</th>
              </tr>
            </thead>
            <tbody>
              {firmComparison.map((row) => (
                <tr key={row.dimension} className="align-top border-b border-steel last:border-0">
                  <th scope="row" className="p-3 font-mono text-xs text-muted text-left whitespace-nowrap">
                    {row.dimension}
                  </th>
                  <td className="p-3">{row.prop}</td>
                  <td className="p-3">{row.hedgeFund}</td>
                  <td className="p-3">{row.bank}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold">Buy-side vs sell-side</h2>
        <div className="overflow-x-auto rounded-lg border border-steel">
          <table className="w-full text-sm bg-panel">
            <thead>
              <tr className="font-mono text-xs uppercase tracking-wider text-muted text-left">
                <th className="p-3 border-b border-steel"></th>
                <th className="p-3 border-b border-steel text-violet-light">Buy-side</th>
                <th className="p-3 border-b border-steel text-violet-light">Sell-side</th>
              </tr>
            </thead>
            <tbody>
              {sideComparison.map((row) => (
                <tr key={row.dimension} className="align-top border-b border-steel last:border-0">
                  <th scope="row" className="p-3 font-mono text-xs text-muted text-left whitespace-nowrap">
                    {row.dimension}
                  </th>
                  <td className="p-3">{row.hedgeFund}</td>
                  <td className="p-3">{row.bank}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
