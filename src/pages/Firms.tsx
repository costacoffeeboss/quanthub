import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  firmProfiles,
  FIRM_CATEGORIES,
  type FirmCategory,
  type FirmProfile,
} from '../data/firms-detail';
import { firmTypeGuides } from '../data/firmTypes';
import FirmQuiz from '../components/FirmQuiz';

const catColor: Record<FirmCategory, string> = {
  'Prop / Market Maker': 'text-open',
  HFT: 'text-soon',
  'Quant Hedge Fund': 'text-violet-light',
  Bank: 'text-fg',
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="font-mono text-[11px] uppercase tracking-wider text-muted mb-1">{label}</p>
      {children}
    </div>
  );
}

function bullets(items: string[]) {
  return (
    <ul className="space-y-1.5 text-sm">
      {items.map((s, i) => (
        <li key={i} className="flex gap-2">
          <span className="text-violet shrink-0">▸</span>
          {s}
        </li>
      ))}
    </ul>
  );
}

function MiniList({ label, items }: { label: string; items: string[] }) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-wider text-muted mb-1">{label}</p>
      <ul className="space-y-1 text-[13px] leading-snug">
        {items.map((s, i) => (
          <li key={i} className="flex gap-1.5">
            <span className="text-violet shrink-0">▸</span>
            {s}
          </li>
        ))}
      </ul>
    </div>
  );
}

function TypeGuides() {
  return (
    <section aria-labelledby="firm-types-heading" className="space-y-3">
      <h2 id="firm-types-heading" className="text-lg font-bold">
        The four firm types
      </h2>
      <p className="text-sm text-muted max-w-3xl">
        Quant employers fall into a few broad families. They differ in what they do, how they hire,
        culture and pace. Read these first, then take the quiz below if you&apos;re unsure where you
        fit. Culture, comp and lifestyle notes are aggregated, subjective and approximate.
      </p>
      <div className="grid gap-4 lg:grid-cols-2">
        {firmTypeGuides.map((g) => (
          <article key={g.category} className="rounded-lg border border-steel bg-panel p-5 space-y-4">
            <header className="space-y-1">
              <div className="flex flex-wrap items-baseline gap-x-2">
                <h3 className={`text-base font-bold ${catColor[g.category]}`}>{g.category}</h3>
                <span className="font-mono text-[11px] text-muted">— {g.nick}</span>
              </div>
              <p className="text-[13px] leading-snug text-fg">{g.blurb}</p>
            </header>

            <p className="rounded border border-violet/30 bg-violet/5 px-3 py-2 text-[13px]">
              <span className="font-mono text-[10px] uppercase tracking-wider text-violet-light">Suits you if </span>
              {g.suitsYouIf}
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <MiniList label="Culture" items={g.culture} />
              <MiniList label="Skills to build" items={g.skills} />
              <MiniList label="Interview focus" items={g.interviewFocus} />
              <div className="space-y-3">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-muted mb-1">Comp (approx)</p>
                  <p className="text-[13px] leading-snug">
                    <span className="text-soon font-mono text-[10px] uppercase tracking-wider">approx · </span>
                    {g.comp}
                  </p>
                </div>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-muted mb-1">Lifestyle</p>
                  <p className="text-[13px] leading-snug">{g.lifestyle}</p>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function FirmCard({ firm }: { firm: FirmProfile }) {
  return (
    <article id={firm.id} className="rounded-lg border border-steel bg-panel p-6 scroll-mt-20 space-y-5">
      <header className="space-y-1">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h2 className="text-xl font-bold text-violet-light">{firm.name}</h2>
          <span className={`font-mono text-[11px] uppercase tracking-wider ${catColor[firm.category]}`}>
            {firm.category}
          </span>
        </div>
        <p className="text-sm text-fg">{firm.oneLiner}</p>
        <p className="font-mono text-[11px] text-muted">
          Founded {firm.founded}
          {firm.founders ? ` · ${firm.founders}` : ''} · HQ {firm.hq}
        </p>
      </header>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="space-y-5">
          <Field label="What they do">{bullets(firm.whatTheyDo)}</Field>
          <Field label="Known for">{bullets(firm.knownFor)}</Field>
          <Field label="Scale">
            <p className="text-sm">{firm.scale}</p>
          </Field>
          <Field label="UK presence">
            <p className="text-sm">{firm.ukPresence}</p>
          </Field>
        </div>

        <div className="space-y-5">
          <Field label="Graduate roles">
            <div className="flex flex-wrap gap-1.5">
              {firm.roles.map((r) => (
                <span key={r} className="font-mono text-[11px] text-fg border border-steel rounded px-2 py-0.5">
                  {r}
                </span>
              ))}
            </div>
          </Field>
          {firm.stack && (
            <Field label="Tech stack (public)">
              <p className="text-sm font-mono text-muted">{firm.stack}</p>
            </Field>
          )}
          <Field label="Interview process (commonly reported)">{bullets(firm.interview)}</Field>
          <Field label="Graduate comp (approximate)">
            <p className="text-sm">
              <span className="text-soon font-mono text-[11px] uppercase tracking-wider">approx · </span>
              {firm.comp}
            </p>
          </Field>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2 border-t border-steel pt-5">
        <Field label="Culture (aggregated impressions)">{bullets(firm.culture)}</Field>
        <Field label="Your edge as an applicant">
          <p className="text-sm">{firm.applicantEdge}</p>
        </Field>
      </div>

      <a
        href={firm.careersUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block font-mono text-xs text-violet-light hover:underline"
      >
        Official careers page ↗
      </a>
    </article>
  );
}

export default function Firms() {
  const [cat, setCat] = useState<FirmCategory | 'All'>('All');
  const { hash } = useLocation();

  // deep-link: scroll to #firmId when arriving from the Tracker
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1));
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [hash]);

  const shown = cat === 'All' ? firmProfiles : firmProfiles.filter((f) => f.category === cat);

  const selectCls =
    'bg-panel border border-steel rounded px-3 py-1.5 font-mono text-xs text-fg hover:border-violet-light';

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Firm Profiles</h1>
        <p className="mt-2 text-muted max-w-3xl text-sm">
          Dense, cross-referenced profiles of the firms in the Tracker — what they do, how they hire,
          and what they&apos;re known for, compiled to help you target and prepare.
        </p>
        <div className="mt-3 rounded border border-soon/40 bg-soon/10 px-4 py-3 text-[12px] text-soon leading-relaxed">
          <strong>How to read these.</strong> Founding facts, locations and &quot;what they do&quot; are
          well-established. <strong>Compensation is approximate</strong> and drawn from self-reported
          forum data — orders of magnitude, not offers. Interview processes are <em>commonly
          reported</em>, not official, and change yearly. Culture notes are aggregated, subjective
          impressions. Always verify specifics on the firm&apos;s own careers page before relying on
          anything here.
        </div>
      </header>

      <TypeGuides />

      <FirmQuiz />

      <div className="border-t border-steel pt-2">
        <h2 className="text-lg font-bold">All firm profiles</h2>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <select aria-label="Firm category" className={selectCls} value={cat} onChange={(e) => setCat(e.target.value as FirmCategory | 'All')}>
          <option>All</option>
          {FIRM_CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <span className="font-mono text-xs text-muted">{shown.length} firms</span>
        <nav className="ml-auto flex flex-wrap gap-x-3 gap-y-1 font-mono text-[11px]">
          {FIRM_CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCat(c)}
              className={`hover:text-violet-light ${cat === c ? 'text-violet-light' : 'text-muted'}`}
            >
              {c}
            </button>
          ))}
        </nav>
      </div>

      <div className="space-y-5">
        {shown.map((firm) => (
          <FirmCard key={firm.id} firm={firm} />
        ))}
      </div>
    </div>
  );
}
