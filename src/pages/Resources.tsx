const stages = [
  {
    when: '12+ months out',
    title: 'Build the raw material',
    items: [
      'Get genuinely fast at mental arithmetic — ten minutes a day beats a panicked week before the Optiver test. Use the Games tab.',
      'Take probability seriously at university: it is the single highest-yield subject for every quant role. Work problems, not just lectures.',
      'Learn Python properly (and C++ if you are targeting dev roles). One real project you can defend beats five tutorials.',
      'First-years: this is spring week / insight season — see the section below, the deadlines come absurdly early.',
    ],
  },
  {
    when: 'Summer before applications (Jun–Aug)',
    title: 'Get ready to fire',
    items: [
      'Finalise a one-page CV now, not in October (tips below).',
      'Build your target list with the Trackr: pick 10–20 firms across tiers, note their typical windows.',
      'Start a brainteaser habit: a few questions a week from the Questions tab, done properly on paper before peeking.',
      'Read one interview prep book cover to cover (see books below) — slowly, solving before reading solutions.',
    ],
  },
  {
    when: 'Applications open (Aug–Oct)',
    title: 'Apply early — it genuinely matters',
    items: [
      'Most quant firms review on a rolling basis: the same application is strictly stronger in week 1 than week 8, because seats fill.',
      'Apply to firms in waves: a couple of warm-ups first, your top choices once you have had one or two real processes.',
      'Keep a record of every application in the Trackr — by December you will not remember what you sent where.',
      'Do not over-tailor cover letters for prop shops; most do not read them. Banks care more.',
    ],
  },
  {
    when: 'Online tests (rolling, Sep–Dec)',
    title: 'The numerical gauntlet',
    items: [
      'Optiver-style: ~80 arithmetic questions in 8 minutes, no calculator. Accuracy matters as much as speed — many tests penalise wrong answers.',
      'Others use sequence/pattern tests (think Zap-N style), probability quizzes, or HackerRank-style coding for dev and research roles.',
      'Practise under genuine time pressure — the constraint is the test. Untimed practice barely transfers.',
      'Take tests fresh, in the morning, wired ethernet if possible. A dumb loss here is the most preventable rejection in the pipeline.',
    ],
  },
  {
    when: 'Interviews (Oct–Mar)',
    title: 'Where the prep pays off',
    items: [
      'Phone/video rounds: brainteasers and probability with a trader or researcher. Think aloud — silence reads as being stuck even when you are not.',
      'Trading interviews: market making games ("make me a market on…"), sequential betting, sizing decisions. Play the games here until quoting feels natural.',
      'Research interviews: stats depth, your projects, "how would you test this signal?". Be ready to be wrong gracefully and update.',
      'It is fine to say "I don\'t know, but here is how I would work it out" — that sentence, followed by an honest attempt, is often exactly what they want.',
    ],
  },
  {
    when: 'Offer (Nov onwards)',
    title: 'Decide like a quant',
    items: [
      'Exploding offers happen. You can almost always ask for more time politely; firms expect it. Get deadlines in writing.',
      'Compare seats, not headline numbers: who trains you, what you would actually work on, and how past grads progressed matter more than £10k of year-one comp.',
      'Ask to speak to a recent grad on the team before signing — good firms always say yes, and the conversation is informative either way.',
    ],
  },
];

const books = [
  {
    title: 'A Practical Guide to Quantitative Finance Interviews',
    author: 'Xinfeng Zhou',
    note: '"The green book". The closest thing to a canon for quant interview prep — brainteasers through stochastic calculus. Work it with a pen.',
  },
  {
    title: 'Heard on the Street',
    author: 'Timothy Falcon Crack',
    note: 'The classic question collection, strongest on probability and derivatives questions banks actually ask.',
  },
  {
    title: 'Fifty Challenging Problems in Probability',
    author: 'Frederick Mosteller',
    note: 'Short, cheap, brutal in the best way. If you can do all fifty cold, probability interviews hold no fear.',
  },
  {
    title: 'Introduction to Probability',
    author: 'Blitzstein & Hwang',
    note: 'The best foundation text if your probability is shaky — intuition-first, with the famous Harvard Stat 110 lectures free online.',
  },
  {
    title: 'Option Volatility and Pricing',
    author: 'Sheldon Natenberg',
    note: 'The options intuition book traders recommend to each other. Skip the formulas on first read; absorb the way of thinking.',
  },
  {
    title: 'Quant Job Interview Questions and Answers',
    author: 'Mark Joshi',
    note: 'Especially good for bank/derivatives-flavoured roles; honest about what different firms ask.',
  },
];

const cvTips = [
  'One page. No exceptions at the graduate level — a second page signals you cannot prioritise.',
  'Lead with what filters select on: degree, university, grades, and any maths competition results. Quant CVs are read in about 20 seconds, mostly the top third.',
  'Quantify everything quantifiable: "improved simulation runtime 40×" beats "optimised code". Numbers are the native language of the people reading it.',
  'Projects: one or two, described with what you built, what was hard, and what the result was. A trading bot with honest backtesting caveats reads far better than an overfit "200% return" claim — they will probe it.',
  'Cut the filler skills list. "Microsoft Word" and four languages at "basic" level cost credibility. List what you would survive an interview question on.',
  'For traders: poker, chess, bridge or competitive games with concrete achievements are genuinely relevant signals — include them. For devs: open-source contributions and competitive programming handles.',
  'No photo, no age, no eight-line personal statement. UK convention is lean and factual.',
];

const springWeeks = [
  'Spring weeks are 3–5 day insight programmes at banks for first-years (penultimate-year students in Scotland/4-year courses), typically running over Easter. Applications open September–November of first year — far earlier than most freshers realise.',
  'They matter because most banks convert strong spring week attendees straight into summer internship offers, skipping the main gauntlet a year later.',
  'For quant specifically: apply to the markets/trading or technology streams, and say "quant" in every preference box they give you. J.P. Morgan, Goldman, and Morgan Stanley all run relevant streams.',
  'Prop firms mostly do not run spring weeks, but several run first-year events and early-insight days (and some, like Jane Street and Optiver, run first-year internships or programmes that function as early pipelines) — check careers pages in autumn, and ask university maths/trading societies, which often host firm visits.',
  'If you miss the spring week cycle, it is genuinely fine: plenty of people enter quant with no spring week. It is an accelerator, not a gate.',
];

const honestAdvice = [
  {
    title: 'Trader track',
    text: 'Your prep is probability, EV instincts, mental speed, and game-theoretic thinking. You do not need to grind LeetCode, and you do not need stochastic calculus for prop shop interviews. You do need to be comfortable making decisions with incomplete information, out loud, and being wrong without crumbling.',
  },
  {
    title: 'Dev track',
    text: 'Your prep is algorithms, systems, and (for HFT) C++ depth. Brainteasers appear but are secondary. Competitive programming is the single strongest signal for low-latency firms. You do not need finance knowledge going in — firms teach it — but curiosity about markets helps in interviews.',
  },
  {
    title: 'Research track',
    text: 'Your prep is statistics and probability beyond the brainteaser level, plus the ability to discuss your own projects with total honesty about their limitations. Overclaiming a project result is the fastest way to fail a research interview; researchers are professionally suspicious people.',
  },
];

export default function Resources() {
  return (
    <div className="space-y-12">
      <header>
        <h1 className="text-2xl font-bold">Prep Roadmap &amp; Resources</h1>
        <p className="mt-2 text-muted max-w-2xl text-sm">
          A staged plan from a year out to offer, plus the books and CV advice that actually move
          the needle. Specific over comprehensive.
        </p>
      </header>

      <section className="space-y-0">
        <h2 className="text-xl font-bold mb-4">The roadmap</h2>
        <ol className="relative border-l border-steel ml-2 space-y-8">
          {stages.map((s) => (
            <li key={s.when} className="pl-6 relative">
              <span className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-violet" aria-hidden="true" />
              <p className="font-mono text-[11px] uppercase tracking-wider text-violet-light">{s.when}</p>
              <h3 className="font-semibold mt-0.5">{s.title}</h3>
              <ul className="mt-2 space-y-1.5 text-sm">
                {s.items.map((it, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-violet shrink-0">▸</span>
                    {it}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4">Books worth your time</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {books.map((b) => (
            <article key={b.title} className="rounded-lg border border-steel bg-panel p-4">
              <h3 className="font-semibold text-sm">{b.title}</h3>
              <p className="font-mono text-[11px] text-muted mt-0.5">{b.author}</p>
              <p className="text-sm text-muted mt-2">{b.note}</p>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4">Honest advice by track</h2>
        <div className="grid gap-4 lg:grid-cols-3">
          {honestAdvice.map((a) => (
            <article key={a.title} className="rounded-lg border border-steel bg-panel p-4">
              <h3 className="font-mono text-sm text-violet-light">{a.title}</h3>
              <p className="text-sm mt-2 leading-relaxed">{a.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="max-w-3xl">
        <h2 className="text-xl font-bold mb-4">CV tips for quant applications</h2>
        <ul className="space-y-2 text-sm">
          {cvTips.map((t, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-violet shrink-0">▸</span>
              {t}
            </li>
          ))}
        </ul>
      </section>

      <section className="max-w-3xl">
        <h2 className="text-xl font-bold mb-4">Spring weeks &amp; insight days (UK first-years)</h2>
        <div className="space-y-3 text-sm leading-relaxed">
          {springWeeks.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </section>
    </div>
  );
}
