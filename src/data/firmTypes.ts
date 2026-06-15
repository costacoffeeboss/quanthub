/**
 * Firm-type explainers and the "which quant firm suits you?" quiz.
 *
 * Honesty note (consistent with firms-detail.ts): culture, comp and lifestyle
 * notes are aggregated, subjective impressions and approximate figures. The
 * quiz is a lightweight self-reflection aid, not careers advice — it nudges you
 * toward types/firms whose reputations match your stated preferences.
 */
import { firmProfiles, type FirmCategory } from './firms-detail';

// ---------------------------------------------------------------------------
// Type explainers
// ---------------------------------------------------------------------------

export interface FirmTypeGuide {
  category: FirmCategory;
  /** Plain-English nickname shown alongside the formal label. */
  nick: string;
  blurb: string;
  suitsYouIf: string;
  culture: string[];
  skills: string[];
  interviewFocus: string[];
  comp: string;
  lifestyle: string;
}

export const firmTypeGuides: FirmTypeGuide[] = [
  {
    category: 'Prop / Market Maker',
    nick: 'the "prop shop"',
    blurb:
      'Trade the firm\'s own capital — continuously making markets and arbitraging across options, ETFs, equities, futures and crypto. No outside clients; the P&L is the product.',
    suitsYouIf:
      'You love fast decisions and markets, and you thrive on mental-math, probability and games.',
    culture: [
      'Collaborative and often team-based P&L; the best shops are lower-ego than the stereotype.',
      'Decisive, fast-feedback environment — you find out quickly if you were right.',
      'Values temperament and bet-sizing discipline as much as raw maths.',
    ],
    skills: [
      'Lightning mental arithmetic (think Optiver\'s 80-in-8 test).',
      'Probability, expected value and Kelly-style position sizing.',
      'Calm, articulate reasoning while uncertain.',
      'Genuine curiosity about markets and options.',
    ],
    interviewFocus: [
      'Mental-math speed screens',
      'Probability & EV brainteasers',
      'Make-a-market / betting games',
      'Staying composed and articulate under uncertainty',
    ],
    comp:
      'Among the highest in the industry — London grads often ≈£100–200k+ all-in, US desks higher; heavily bonus-driven. Approximate.',
    lifestyle:
      'Fast, high-energy and tied to market hours; intense but frequently sociable cohort culture.',
  },
  {
    category: 'HFT',
    nick: 'high-frequency / low-latency',
    blurb:
      'Fully automated, ultra-low-latency trading across global markets. Closer to a research lab plus a hardcore engineering org than a trading floor — signals and systems do the trading.',
    suitsYouIf:
      'You\'re a strong engineer/CS or researcher who wants trading treated as a systems-and-research problem.',
    culture: [
      'Academic, low-ego, research-and-engineering led.',
      'Engineering is first-class, not a support function.',
      'Autonomous teams with little hand-holding.',
    ],
    skills: [
      'Strong CS: algorithms, data structures, systems.',
      'C++ and genuine performance awareness.',
      'Statistics and signal reasoning for research tracks.',
      'Competitive programming (Codeforces/ICPC) is a real signal.',
    ],
    interviewFocus: [
      'Hard algorithms & data structures',
      'Systems / low-latency design',
      'Probability & statistics',
      'Clean, performance-aware coding',
    ],
    comp:
      'Top-tier tech/quant pay; strong base plus bonus for both research and engineering tracks. Approximate.',
    lifestyle:
      'Research-lab / engineering pace with deep-focus work; generally saner hours than a discretionary trading desk.',
  },
  {
    category: 'Quant Hedge Fund',
    nick: 'systematic fund',
    blurb:
      'Manage outside capital with systematic, data-driven strategies across asset classes — building predictive models from large datasets, often in a pod/desk structure.',
    suitsYouIf:
      'You want deep, data-driven research with serious resources, and you accept high-performance pressure.',
    culture: [
      'High-performance and demanding, but well-resourced with strong data.',
      'Pod/desk accountability — real ownership of outcomes.',
      'Intellectual and data-rigorous; often PhD-friendly.',
    ],
    skills: [
      'Statistics and machine-learning depth.',
      'Clean Python plus some C++.',
      'A defensible research project you can discuss.',
      'Probability and careful data reasoning.',
    ],
    interviewFocus: [
      'Statistics, probability & ML',
      'Coding (commonly Python + C++)',
      'Research project deep-dive',
      'Brainteasers & data reasoning',
    ],
    comp:
      'Top-tier and performance-driven, with large bonus upside in strong years. Approximate.',
    lifestyle:
      'Demanding pod culture with accountability pressure, but excellent resources and rapid learning.',
  },
  {
    category: 'Bank',
    nick: 'bulge-bracket bank',
    blurb:
      'Full-service investment banks with quant research, "strats", modelling and markets-technology graduate routes — a structured, well-trodden entry point into quant finance.',
    suitsYouIf:
      'You value structure, training, brand and broad optionality, and prefer steadier hours.',
    culture: [
      'Structured and programme-driven; more hierarchical than prop firms.',
      'Strong training and brand recognition.',
      'Quant/strats hours generally more predictable than front-office S&T.',
    ],
    skills: [
      'Probability and maths fundamentals.',
      'Derivatives and stochastic-calculus basics.',
      'Solid general coding.',
      'Communication and competency answers.',
    ],
    interviewFocus: [
      'Probability & maths',
      'Derivatives & stochastic-calculus basics',
      'Coding screens',
      'Structured competency / behavioural rounds',
    ],
    comp:
      'Lower base and smaller bonus than top prop/HFT/funds but stable and predictable; London grads ≈£55–90k all-in. Approximate.',
    lifestyle:
      'Structured graduate programmes with strong training; broad internal mobility and long-term optionality.',
  },
];

// ---------------------------------------------------------------------------
// Quiz
// ---------------------------------------------------------------------------

export type WorkStyle = 'Trading' | 'Research' | 'Engineering';
export type Locale = 'London' | 'New York' | 'Amsterdam' | 'Asia';
type Pace = 'High' | 'Medium';

interface QuizOption {
  label: string;
  /** Points added to each firm type. */
  types?: Partial<Record<FirmCategory, number>>;
  styles?: WorkStyle[];
  locale?: Locale;
  /** Marks a preference for a high-intensity environment. */
  highPace?: boolean;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: QuizOption[];
}

const PROP: FirmCategory = 'Prop / Market Maker';
const HFT: FirmCategory = 'HFT';
const FUND: FirmCategory = 'Quant Hedge Fund';
const BANK: FirmCategory = 'Bank';

export const quizQuestions: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: 'Pick the screen you could happily stare at for ten hours straight.',
    options: [
      { label: 'A live order book you\'re quoting into — you against the flow.', types: { [PROP]: 2 }, styles: ['Trading'], highPace: true },
      { label: 'A research notebook, hunting for signal in a sea of noise.', types: { [FUND]: 2, [HFT]: 1 }, styles: ['Research'] },
      { label: 'A profiler, shaving microseconds off a hot code path.', types: { [HFT]: 2 }, styles: ['Engineering'] },
      { label: 'A tidy project plan with a mentor and a clear ladder up.', types: { [BANK]: 2 } },
    ],
  },
  {
    id: 'q2',
    prompt: '80 mental-arithmetic questions. 8 minutes. No calculator. Your gut reaction?',
    options: [
      { label: 'Finally — a chance to show off.', types: { [PROP]: 2 }, styles: ['Trading'] },
      { label: 'I\'ll pass it. Wake me when the real problems start.', types: { [FUND]: 1, [HFT]: 1 } },
      { label: 'Can I submit a script instead?', types: { [HFT]: 1 }, styles: ['Engineering'] },
      { label: 'I\'d take a structured aptitude test over this, thanks.', types: { [BANK]: 1 } },
    ],
  },
  {
    id: 'q3',
    prompt: 'A genie grants you exactly one problem to chew on all day. You pick:',
    options: [
      { label: 'Make a tight two-way market on something nobody can price.', types: { [PROP]: 2 }, styles: ['Trading'] },
      { label: 'Pull a faint, repeatable edge out of genuinely messy data.', types: { [FUND]: 2 }, styles: ['Research'] },
      { label: 'Make the whole system 10× faster without breaking it.', types: { [HFT]: 2 }, styles: ['Engineering'] },
      { label: 'Price a nasty exotic properly, with the maths to defend it.', types: { [BANK]: 2, [FUND]: 1 }, styles: ['Research'] },
    ],
  },
  {
    id: 'q4',
    prompt: 'Your ideal crew looks like…',
    options: [
      { label: 'A tight pod on one shared P&L — we win or lose together.', types: { [PROP]: 2 }, styles: ['Trading'] },
      { label: 'My own book, my own number, nowhere to hide.', types: { [FUND]: 2 }, highPace: true },
      { label: 'A quiet lab full of people slightly smarter than me.', types: { [HFT]: 1, [FUND]: 1 }, styles: ['Research'] },
      { label: 'A big cohort with a proper training programme.', types: { [BANK]: 2 } },
    ],
  },
  {
    id: 'q5',
    prompt: 'It\'s 9:31am and the market just gapped hard. You feel…',
    options: [
      { label: 'Alive. This is the fun part.', types: { [PROP]: 2 }, styles: ['Trading'], highPace: true },
      { label: 'Focused — let me see what the models are saying.', types: { [HFT]: 1, [FUND]: 1 } },
      { label: 'Quietly glad my role isn\'t tied to the next five minutes.', types: { [BANK]: 2 } },
      { label: 'Ice-cold. High stakes are where I do my best work.', types: { [PROP]: 1, [FUND]: 1 }, highPace: true },
    ],
  },
  {
    id: 'q6',
    prompt: 'Be honest about your relationship with code.',
    options: [
      { label: 'I think in cache lines and latency.', types: { [HFT]: 2 }, styles: ['Engineering'] },
      { label: 'Python and a notebook are basically how I think.', types: { [FUND]: 2 }, styles: ['Research'] },
      { label: 'I can code — but markets are my real first language.', types: { [PROP]: 1 }, styles: ['Trading'] },
      { label: 'It\'s one useful tool in a broader kit.', types: { [BANK]: 1 } },
    ],
  },
  {
    id: 'q7',
    prompt: 'Your origin story is closest to…',
    options: [
      { label: 'Maths-olympiad kid who never quite stopped competing.', types: { [PROP]: 1, [HFT]: 1, [FUND]: 1 } },
      { label: 'Competitive programmer who likes things fast and correct.', types: { [HFT]: 2 }, styles: ['Engineering'] },
      { label: 'Stats/ML person who lights up at a good dataset.', types: { [FUND]: 2 }, styles: ['Research'] },
      { label: 'Finance/econ/engineering all-rounder.', types: { [BANK]: 2 } },
    ],
  },
  {
    id: 'q8',
    prompt: 'Drop a pin. Where do you actually want to wake up for work?',
    options: [
      { label: 'London.', locale: 'London' },
      { label: 'New York / Chicago — the US grind.', locale: 'New York' },
      { label: 'Amsterdam / Europe — bikes and a bit of balance.', locale: 'Amsterdam' },
      { label: 'Hong Kong / Singapore — Asia hours.', locale: 'Asia' },
    ],
  },
  {
    id: 'q9',
    prompt: 'The thing that genuinely gets you out of bed:',
    options: [
      { label: 'A number on the paycheck that makes people choke on their coffee.', types: { [PROP]: 1, [FUND]: 1 } },
      { label: 'Tech so sharp it\'s basically sci-fi.', types: { [HFT]: 2 }, styles: ['Engineering'] },
      { label: 'Being surrounded by seriously good research.', types: { [FUND]: 2 }, styles: ['Research'] },
      { label: 'A brand and a network that opens every door later.', types: { [BANK]: 2 } },
    ],
  },
  {
    id: 'q10',
    prompt: 'Which bumper sticker would you actually put on your laptop?',
    options: [
      { label: '"It\'s all just EV and bet sizing."', types: { [PROP]: 2 }, styles: ['Trading'] },
      { label: '"The data is the alpha."', types: { [FUND]: 2 }, styles: ['Research'] },
      { label: '"Speed is the product."', types: { [HFT]: 2 }, styles: ['Engineering'] },
      { label: '"Trust the model, respect the risk."', types: { [BANK]: 1, [FUND]: 1 } },
    ],
  },
  {
    id: 'q11',
    prompt: 'How do you feel about having clients?',
    options: [
      { label: 'Hard pass — pure prop, just me and the market.', types: { [PROP]: 1, [HFT]: 1 } },
      { label: 'A little desk/structuring contact keeps it interesting.', types: { [BANK]: 2 } },
      { label: 'Leave me alone with my research, please.', types: { [FUND]: 1 }, styles: ['Research'] },
      { label: 'Genuinely don\'t mind either way.', types: { [HFT]: 1 } },
    ],
  },
  {
    id: 'q12',
    prompt: 'You just lost money on a trade you were certain about. Next move?',
    options: [
      { label: 'Cut it, shrug, re-rack. On to the next.', types: { [PROP]: 2 }, styles: ['Trading'], highPace: true },
      { label: 'Open the model and work out exactly what I missed.', types: { [FUND]: 1, [HFT]: 1 }, styles: ['Research'] },
      { label: 'Honestly? I\'d rather my name not be on a live P&L.', types: { [BANK]: 1 } },
      { label: 'Stay calm — tilt is how you actually go broke.', types: { [PROP]: 1, [HFT]: 1 }, highPace: true },
    ],
  },
  {
    id: 'q13',
    prompt: 'Pick your pond.',
    options: [
      { label: 'A boutique where everyone knows my name.', types: { [PROP]: 1 } },
      { label: 'A focused specialist that\'s world-class at one thing.', types: { [HFT]: 1, [FUND]: 1 } },
      { label: 'A giant multi-strat platform with near-infinite resources.', types: { [FUND]: 2 }, highPace: true },
      { label: 'A global bank with a flag on every other building.', types: { [BANK]: 2 } },
    ],
  },
  {
    id: 'q14',
    prompt: 'Which interview loop sounds almost… fun?',
    options: [
      { label: 'Market-making games and probability puzzles.', types: { [PROP]: 2 }, styles: ['Trading'] },
      { label: 'Defending a research project to sharp questioners.', types: { [FUND]: 2 }, styles: ['Research'] },
      { label: 'Hard algorithms and a systems-design whiteboard.', types: { [HFT]: 2 }, styles: ['Engineering'] },
      { label: 'Derivatives, a little stoch calc, and competency rounds.', types: { [BANK]: 2 } },
    ],
  },
  {
    id: 'q15',
    prompt: 'Fast-forward ten years. You\'re the person who…',
    options: [
      { label: 'Runs a trading book and a tight team.', types: { [PROP]: 2 }, styles: ['Trading'] },
      { label: 'Leads research and ships models that move the needle.', types: { [FUND]: 2 }, styles: ['Research'] },
      { label: 'Architected the infrastructure everything else runs on.', types: { [HFT]: 2 }, styles: ['Engineering'] },
      { label: 'Has optionality — and could go anywhere next.', types: { [BANK]: 2 } },
    ],
  },
];

// ---------------------------------------------------------------------------
// Firm traits (for the secondary-signal firm ranking)
// ---------------------------------------------------------------------------

interface FirmTraits {
  styles: WorkStyle[];
  locales: Locale[];
  pace: Pace;
}

/** Keyed by firmProfiles id. Reflects aggregated reputation, not gospel. */
const firmTraits: Record<string, FirmTraits> = {
  // Prop / Market Makers
  janestreet: { styles: ['Trading', 'Research', 'Engineering'], locales: ['London', 'New York', 'Amsterdam', 'Asia'], pace: 'High' },
  optiver: { styles: ['Trading', 'Engineering'], locales: ['Amsterdam', 'New York', 'Asia'], pace: 'High' },
  sig: { styles: ['Trading', 'Research'], locales: ['London', 'Asia'], pace: 'High' },
  imc: { styles: ['Trading', 'Engineering'], locales: ['Amsterdam', 'New York'], pace: 'Medium' },
  drw: { styles: ['Trading', 'Engineering'], locales: ['London', 'New York'], pace: 'High' },
  flow: { styles: ['Trading'], locales: ['Amsterdam', 'New York', 'Asia'], pace: 'Medium' },
  davinci: { styles: ['Trading', 'Research'], locales: ['Amsterdam'], pace: 'Medium' },
  maven: { styles: ['Trading', 'Research'], locales: ['London', 'Asia'], pace: 'Medium' },
  mako: { styles: ['Trading'], locales: ['London'], pace: 'Medium' },
  fiverings: { styles: ['Trading', 'Research'], locales: ['New York'], pace: 'High' },
  // HFT
  hrt: { styles: ['Research', 'Engineering'], locales: ['New York', 'London', 'Asia'], pace: 'High' },
  jump: { styles: ['Research', 'Engineering'], locales: ['London', 'New York', 'Asia'], pace: 'High' },
  tower: { styles: ['Engineering', 'Research'], locales: ['London', 'New York', 'Asia'], pace: 'Medium' },
  xtx: { styles: ['Research', 'Engineering'], locales: ['London', 'Asia'], pace: 'High' },
  citsec: { styles: ['Trading', 'Research', 'Engineering'], locales: ['London', 'New York', 'Asia'], pace: 'High' },
  // Quant Hedge Funds
  citadel: { styles: ['Research', 'Engineering', 'Trading'], locales: ['London', 'New York', 'Asia'], pace: 'High' },
  twosigma: { styles: ['Research', 'Engineering'], locales: ['London', 'New York', 'Asia'], pace: 'Medium' },
  deshaw: { styles: ['Research', 'Engineering'], locales: ['London', 'New York'], pace: 'High' },
  gresearch: { styles: ['Research', 'Engineering'], locales: ['London'], pace: 'Medium' },
  qube: { styles: ['Research', 'Engineering'], locales: ['London', 'Asia'], pace: 'Medium' },
  squarepoint: { styles: ['Research', 'Engineering'], locales: ['London', 'New York', 'Asia'], pace: 'Medium' },
  // Banks
  jpm: { styles: ['Research', 'Engineering'], locales: ['London', 'New York'], pace: 'Medium' },
  gs: { styles: ['Research', 'Trading', 'Engineering'], locales: ['London', 'New York'], pace: 'Medium' },
  ms: { styles: ['Research', 'Engineering'], locales: ['London'], pace: 'Medium' },
};

// ---------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------

export interface TypeResult {
  category: FirmCategory;
  score: number;
  why: string;
}
export interface FirmResult {
  id: string;
  name: string;
  category: FirmCategory;
  score: number;
  why: string;
}
export interface QuizResult {
  topTypes: TypeResult[];
  topFirms: FirmResult[];
}

/** Join clauses naturally: "a", "a and b", "a, b, and c". */
function joinReasons(parts: string[]): string {
  if (parts.length <= 1) return parts[0] ?? '';
  if (parts.length === 2) return `${parts[0]} and ${parts[1]}`;
  return `${parts.slice(0, -1).join(', ')}, and ${parts[parts.length - 1]}`;
}

/** answers maps questionId -> selected option index. */
export function scoreQuiz(answers: Record<string, number>): QuizResult {
  const typePoints: Record<FirmCategory, number> = {
    'Prop / Market Maker': 0,
    HFT: 0,
    'Quant Hedge Fund': 0,
    Bank: 0,
  };
  const styleCounts: Record<WorkStyle, number> = { Trading: 0, Research: 0, Engineering: 0 };
  let locale: Locale | undefined;
  let highPaceCount = 0;

  for (const q of quizQuestions) {
    const idx = answers[q.id];
    if (idx == null) continue;
    const opt = q.options[idx];
    if (!opt) continue;
    if (opt.types) {
      for (const [cat, pts] of Object.entries(opt.types)) {
        typePoints[cat as FirmCategory] += pts ?? 0;
      }
    }
    if (opt.styles) opt.styles.forEach((s) => (styleCounts[s] += 1));
    if (opt.locale) locale = opt.locale;
    if (opt.highPace) highPaceCount += 1;
  }

  const userPace: Pace = highPaceCount >= 3 ? 'High' : 'Medium';

  // ---- top types ----
  const maxType = Math.max(1, ...Object.values(typePoints));
  const guideByCat = new Map(firmTypeGuides.map((g) => [g.category, g]));
  const topTypes: TypeResult[] = (Object.keys(typePoints) as FirmCategory[])
    .map((category) => ({
      category,
      score: Math.round((typePoints[category] / maxType) * 100),
      why: guideByCat.get(category)?.suitsYouIf ?? '',
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  // ---- top firms ----
  const topStyles = (Object.keys(styleCounts) as WorkStyle[])
    .filter((s) => styleCounts[s] > 0)
    .sort((a, b) => styleCounts[b] - styleCounts[a]);
  const primaryStyle = topStyles[0];

  const firmResults: FirmResult[] = firmProfiles
    .filter((f) => firmTraits[f.id])
    .map((f) => {
      const t = firmTraits[f.id];
      const typeNorm = typePoints[f.category] / maxType; // 0..1
      const styleScore =
        t.styles.reduce((acc, s) => acc + styleCounts[s], 0) /
        Math.max(1, Object.values(styleCounts).reduce((a, b) => a + b, 0)); // 0..1
      const localeMatch = locale && t.locales.includes(locale) ? 1 : 0;
      const paceMatch = t.pace === userPace ? 1 : 0;

      const score = 3 * typeNorm + 1.5 * styleScore + 1.5 * localeMatch + 1 * paceMatch;

      // Build a proper "why this suits you" sentence from the firm's own
      // one-liner plus the signals that actually matched the user's answers.
      const reasons: string[] = [];
      if (typeNorm >= 0.6) reasons.push(`it’s squarely your top firm-type, ${guideByCat.get(f.category)?.nick ?? f.category}`);
      if (primaryStyle && t.styles.includes(primaryStyle)) reasons.push(`it plays to your ${primaryStyle.toLowerCase()} strengths`);
      if (localeMatch && locale) reasons.push(`it has a ${locale} office`);
      if (paceMatch && userPace === 'High') reasons.push('it matches your high-intensity streak');

      const why =
        reasons.length > 0
          ? `${f.oneLiner} Shortlisted because ${joinReasons(reasons)}.`
          : `${f.oneLiner} A solid all-round fit for your answers.`;

      return {
        id: f.id,
        name: f.name,
        category: f.category,
        score,
        why,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return { topTypes, topFirms: firmResults };
}
