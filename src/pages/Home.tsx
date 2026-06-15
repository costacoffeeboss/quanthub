import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import Ticker from '../components/Ticker';
import { allQuestions, dailyQuestion } from '../data/questionBank';

const sections = [
  {
    to: '/roles',
    title: 'Role Explainers',
    blurb: 'Trader vs researcher vs dev vs risk — what each job actually is, and how interviews differ.',
    label: 'ROLES',
  },
  {
    to: '/trackr',
    title: 'Tracker',
    blurb: 'Quant internships and graduate programmes with typical opening windows and your own application pipeline.',
    label: 'TRACKER',
  },
  {
    to: '/firms',
    title: 'Firm Profiles',
    blurb: 'Dense, cross-referenced profiles of 24 firms — what they do, how they hire, what they pay.',
    label: 'FIRMS',
  },
  {
    to: '/questions',
    title: 'Interview Questions',
    blurb: `${allQuestions.length} brainteasers with full worked solutions across eight categories, with progress tracking.`,
    label: 'QUESTIONS',
  },
  {
    to: '/mock',
    title: 'Mock Interview',
    blurb: 'A timed gauntlet with LLM grading and written feedback — the closest thing to the real thing.',
    label: 'MOCK',
  },
  {
    to: '/options',
    title: 'Options Theory',
    blurb: 'Build payoff diagrams live, get the Greeks intuitively, and see why put-call parity must hold.',
    label: 'OPTIONS',
  },
  {
    to: '/games',
    title: 'Market Making Games',
    blurb: 'Nine games: counting, market making, calibration, EV, Kelly sizing, and Optiver-style speed.',
    label: 'GAMES',
  },
  {
    to: '/resources',
    title: 'Prep Roadmap',
    blurb: 'What to do 12 months out, which books are worth it, and CV advice that is actually specific.',
    label: 'PREP',
  },
];

export default function Home() {
  const today = useMemo(() => dailyQuestion(), []);
  return (
    <div className="space-y-10">
      <section className="-mx-4 -mt-8">
        <div className="bg-gradient-to-b from-plum/60 via-plum/20 to-transparent px-4 pt-14 pb-10 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-violet-light mb-4">
            Free · independent · built by people who&apos;ve done it
          </p>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight">
            Everything you need to <span className="wordmark">break into quant</span>
          </h1>
          <p className="mt-4 text-muted max-w-xl mx-auto">
            Roles, openings, interview prep, and trading games — built by people who&apos;ve been
            through quant recruiting, for the people about to.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              to="/trackr"
              className="font-mono text-sm px-5 py-2.5 rounded bg-violet text-white hover:bg-violet-light hover:text-bg transition-colors"
            >
              Open your Tracker →
            </Link>
            <Link
              to="/games"
              className="font-mono text-sm px-5 py-2.5 rounded border border-steel text-fg hover:border-violet-light transition-colors"
            >
              Play the games
            </Link>
          </div>
        </div>
        <Ticker />
        <p className="px-4 pt-2 text-center font-mono text-[10px] text-muted">
          Typical opening windows from recent cycles — always verify on the firm&apos;s careers page.
        </p>
      </section>

      <section className="rounded-lg border border-violet/40 bg-plum/20 p-5">
        <div className="flex items-center justify-between mb-2">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-violet-light">
            Question of the day
          </p>
          <span className="font-mono text-[10px] text-muted">{today.category} · {today.difficulty}</span>
        </div>
        <p className="text-sm leading-relaxed">{today.prompt}</p>
        <Link to="/questions" className="mt-3 inline-block font-mono text-xs text-violet-light hover:underline">
          Reveal it and {allQuestions.length - 1} more in Questions →
        </Link>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((s) => (
          <Link
            key={s.to}
            to={s.to}
            className="group block rounded-lg border border-steel bg-panel p-5 hover:border-violet transition-colors"
          >
            <p className="font-mono text-[10px] tracking-[0.25em] text-violet-light">{s.label}</p>
            <h2 className="mt-2 text-lg font-semibold group-hover:text-violet-light transition-colors">
              {s.title}
            </h2>
            <p className="mt-2 text-sm text-muted">{s.blurb}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
