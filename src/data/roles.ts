export interface RoleInfo {
  slug: string;
  title: string;
  tagline: string;
  dayToDay: string[];
  skills: string[];
  background: string;
  /** UK graduate comp, clearly approximate. */
  comp: string;
  interview: string[];
}

export const roles: RoleInfo[] = [
  {
    slug: 'trader',
    title: 'Quant Trader',
    tagline: 'Prices risk and manages positions in real time.',
    dayToDay: [
      'You spend the trading day watching markets, adjusting quotes and positions, and deciding when the firm should take or shed risk. At a market maker this means owning the bid–ask spread in your products: where to quote, how wide, how much size.',
      'Outside market hours you do post-mortems on the day’s P&L, improve pricing parameters, and work with researchers and devs on the systems you trade with. Modern quant trading is far more "monitor, tune, and intervene" than shouting into phones — most quoting is automated and your edge is knowing when the model is wrong.',
      'The honest part: it is stressful in bursts, the feedback loop is brutal and immediate, and your value is measured in P&L. Some people find that energising; plenty don’t.',
    ],
    skills: [
      'Fast, accurate mental arithmetic under pressure',
      'Probability and expected value as reflexes, not formulas',
      'Decision-making with incomplete information',
      'Calm risk management — sizing, cutting losers, knowing your max loss',
      'Basic Python for analysis (you rarely build production systems)',
    ],
    background:
      'Maths, physics, engineering, economics or CS from a strong programme. Top prop shops genuinely care more about raw aptitude (tests and games) than your specific degree title.',
    comp: 'Approx. £100k–£250k+ total first-year comp at top prop firms (base £60–100k plus bonus); £60–90k at smaller shops. Highly variable, bonus-driven, and not guaranteed — treat every figure as a rough sketch.',
    interview: [
      'Heaviest emphasis of any role on mental maths (Optiver-style 80-in-8 tests), probability brainteasers, and market making games where you quote bids and asks on quantities.',
      'Expect sequential betting/EV games, "make me a market" exercises, and discussion of how you size bets when uncertain. Coding rounds are light or absent at many prop shops.',
    ],
  },
  {
    slug: 'researcher',
    title: 'Quant Researcher',
    tagline: 'Finds and validates the signals strategies trade on.',
    dayToDay: [
      'Your core loop: form a hypothesis about predictable structure in markets, test it against historical data, and try very hard to prove yourself wrong before anyone risks money on it. Most ideas die. That’s the job.',
      'Practically it looks like applied statistics and ML engineering: cleaning messy data, building features, fitting and validating models, fighting overfitting, and writing up results others can challenge. At many firms you also follow your signal into production and monitor its live performance.',
      'It rewards patience and intellectual honesty. If you need daily adrenaline, trading is a better fit; if you like deep problems with delayed payoffs, research is.',
    ],
    skills: [
      'Strong probability, statistics, and linear algebra',
      'Solid Python (numpy/pandas, an ML framework) — research code must be correct, not just fast to write',
      'Experimental discipline: out-of-sample thinking, scepticism about your own results',
      'Clear written communication of quantitative results',
    ],
    background:
      'Often a Master’s or PhD in maths, statistics, physics or ML, though top firms hire exceptional undergraduates directly. Olympiad or research experience helps.',
    comp: 'Approx. £100k–£200k+ total at top hedge funds and prop firms for graduates; £60–100k elsewhere. PhD hires typically land at the upper end. Approximate and firm-dependent.',
    interview: [
      'Probability and statistics in depth — not just brainteasers but estimators, regression assumptions, bias/variance, and "how would you test whether this signal is real?"',
      'Usually includes coding (data manipulation, sometimes ML) and a research discussion of a past project. Fewer speed-arithmetic rounds than trading.',
    ],
  },
  {
    slug: 'developer',
    title: 'Quant Developer',
    tagline: 'Builds the systems that price, trade, and move data fast.',
    dayToDay: [
      'You build and maintain the infrastructure everything else stands on: exchange connectivity, order management, market data pipelines, research platforms, and the low-latency path where nanoseconds genuinely matter at HFT firms.',
      'Day to day it is real software engineering — design, code review, testing, profiling — but with unusual constraints: correctness bugs lose money within minutes, and performance work goes deeper (cache lines, lock-free queues, kernel bypass) than almost anywhere else in industry.',
      'You are not a second-class citizen at good firms: at HFTs the speed *is* the strategy, and quant devs are paid accordingly. But know that at some funds "quant dev" means maintaining researchers’ tooling — ask hard questions about the team in interviews.',
    ],
    skills: [
      'Strong C++ (HFT) and/or Python (platform/research infra); Java/Rust at some firms',
      'Data structures, algorithms, and complexity as working knowledge',
      'Systems understanding: memory, networking, concurrency, Linux',
      'Pragmatic engineering judgement — testing, debugging, simplicity',
    ],
    background:
      'CS or a maths-adjacent degree with serious programming evidence. Competitive programming (Codeforces, ICPC) is a strong signal for the low-latency shops.',
    comp: 'Approx. £65k–£120k total for graduates at trading firms (top HFTs higher); £50k–£75k in bank technology roles. Approximate; varies widely with firm and team.',
    interview: [
      'Algorithms and data structures coding rounds (closer to Big Tech style but harder on performance), plus systems questions: concurrency, networking, memory layout, "what happens when you type…".',
      'C++ specifics at low-latency firms (move semantics, virtual dispatch cost, cache behaviour). Light probability may appear but it is not the focus.',
    ],
  },
  {
    slug: 'risk',
    title: 'Risk Quant',
    tagline: 'Measures and challenges the risk the firm is running.',
    dayToDay: [
      'You build and run the models that say how much the firm can lose: VaR and stress testing, counterparty exposure, model validation. At a bank you sit in an independent function whose job is to challenge the front office — your "no" has regulatory weight behind it.',
      'The work mixes statistics, regulatory frameworks (Basel, FRTB), and a lot of careful documentation. Model validation in particular is intellectually real: you re-derive and attack someone else’s pricing model looking for where it breaks.',
      'Hours are more predictable than front office and the seat is more stable. The trade-off is lower comp and distance from P&L. It is also a common, perfectly respectable entry point that people later move from into front-office quant roles.',
    ],
    skills: [
      'Statistics and probability, especially tail behaviour and dependence',
      'Derivatives pricing fundamentals (you cannot validate what you do not understand)',
      'Python/R plus often legacy code reading (C++, even VBA)',
      'Precise writing — validation reports are scrutinised by regulators',
    ],
    background:
      'Maths, statistics, financial engineering or physics; an MSc in quant finance is common and useful here (more so than for prop trading).',
    comp: 'Approx. £45k–£70k total for graduates at London banks. Narrower range and smaller bonuses than front office, but more predictable. Approximate.',
    interview: [
      'Probability and statistics questions at moderate depth, derivatives basics (what is delta, why does vega matter), and stochastic calculus fundamentals for some teams.',
      'More conventional competency interviews than prop shops — expect "tell me about a time…" alongside the technicals. Little to no speed arithmetic.',
    ],
  },
  {
    slug: 'analyst',
    title: 'Quant Analyst',
    tagline: 'The broad church: pricing, desk support, and analytics.',
    dayToDay: [
      '"Quant analyst" is the least standardised title in the industry — read the actual job description twice. At banks it usually means desk quants and strats: building pricing models, calibration, and tooling that traders use directly.',
      'A desk quant’s day mixes implementing model changes, investigating why a price looks off, automating desk workflows, and fielding urgent questions from traders. You are close to the action without holding the risk yourself.',
      'It is one of the best learning seats in finance: you see how models meet reality. The frustration is that priorities are set by the desk, so deep projects get interrupted by whatever broke today.',
    ],
    skills: [
      'Derivatives pricing and stochastic calculus basics (banks still ask)',
      'Solid programming — Python everywhere, C++ for pricing libraries',
      'Numerical methods: Monte Carlo, finite differences, calibration',
      'Communication with non-quants under time pressure',
    ],
    background:
      'Maths, physics or engineering; MSc Financial Engineering / Mathematical Finance is a common route into bank strat roles in particular.',
    comp: 'Approx. £50k–£85k total for graduates in London bank strat/quant programmes. Approximate; team-dependent.',
    interview: [
      'The most "classical" quant interviews: stochastic calculus (Brownian motion, Itô basics), Black-Scholes reasoning, probability brainteasers, and some coding.',
      'Banks run structured processes — online tests, then superdays mixing technical and behavioural rounds. Preparation maps well onto the standard interview books.',
    ],
  },
];

export interface ComparisonRow {
  dimension: string;
  prop: string;
  hedgeFund: string;
  bank: string;
}

export const firmComparison: ComparisonRow[] = [
  {
    dimension: 'What the business is',
    prop: 'Trades the firm’s own capital, mostly market making and short-horizon strategies.',
    hedgeFund: 'Manages external investors’ money across many strategies and horizons.',
    bank: 'Serves clients: market making for customers, structuring, lending — heavily regulated.',
  },
  {
    dimension: 'Graduate comp (approx.)',
    prop: 'Highest variance; top firms £100k–£250k+ total.',
    hedgeFund: 'High; £80k–£200k+ at top funds.',
    bank: 'Lower but solid; £50k–£85k total.',
  },
  {
    dimension: 'Interview style',
    prop: 'Mental maths, games, brainteasers, EV instincts.',
    hedgeFund: 'Research depth, stats/ML, coding, past projects.',
    bank: 'Structured: online tests, stochastic calculus, behaviourals.',
  },
  {
    dimension: 'Day-one responsibility',
    prop: 'High — small teams, fast ownership.',
    hedgeFund: 'Medium — depends heavily on the pod/team.',
    bank: 'Lower — structured programmes, rotations, training.',
  },
  {
    dimension: 'Job security',
    prop: 'Performance-driven; weaker years mean real cuts.',
    hedgeFund: 'Pod model can be hire-and-fire; platform roles steadier.',
    bank: 'Most stable, with the slowest comp growth.',
  },
];

export const sideComparison: ComparisonRow[] = [
  {
    dimension: 'Who they are',
    prop: '—',
    hedgeFund: 'Buy-side: funds, asset managers, prop firms investing/trading capital.',
    bank: 'Sell-side: banks and brokers providing liquidity and products to clients.',
  },
  {
    dimension: 'Where quants sit',
    prop: '—',
    hedgeFund: 'Alpha research, portfolio construction, execution.',
    bank: 'Pricing models, desk strats, risk, structuring.',
  },
  {
    dimension: 'Success metric',
    prop: '—',
    hedgeFund: 'Returns: P&L and Sharpe of strategies.',
    bank: 'Client flow captured, accurate pricing, regulatory soundness.',
  },
  {
    dimension: 'Typical path',
    prop: '—',
    hedgeFund: 'Direct from strong degrees; PhD common for research.',
    bank: 'Graduate programme → desk; common springboard to buy-side later.',
  },
];
