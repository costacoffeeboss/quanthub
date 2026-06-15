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
    prompt: 'Your ideal day-to-day looks most like…',
    options: [
      { label: 'Quoting markets and managing live risk in real time', types: { [PROP]: 2 }, styles: ['Trading'], highPace: true },
      { label: 'Researching signals and models from data', types: { [FUND]: 2, [HFT]: 1 }, styles: ['Research'] },
      { label: 'Building fast, reliable trading systems', types: { [HFT]: 2 }, styles: ['Engineering'] },
      { label: 'Structured projects across a big org with mentorship', types: { [BANK]: 2 } },
    ],
  },
  {
    id: 'q2',
    prompt: 'How do you feel about timed mental-math tests (e.g. 80 questions in 8 minutes)?',
    options: [
      { label: 'Bring it on — I\'m fast and accurate', types: { [PROP]: 2 }, styles: ['Trading'] },
      { label: 'Fine, but I prefer deeper problems', types: { [FUND]: 1, [HFT]: 1 } },
      { label: 'I\'d rather be coding', types: { [HFT]: 1 }, styles: ['Engineering'] },
      { label: 'I prefer structured aptitude tests', types: { [BANK]: 1 } },
    ],
  },
  {
    id: 'q3',
    prompt: 'Which problem would you most enjoy?',
    options: [
      { label: '"Make a market on…" — an EV/betting game', types: { [PROP]: 2 }, styles: ['Trading'] },
      { label: 'Find predictive structure in a noisy dataset', types: { [FUND]: 2 }, styles: ['Research'] },
      { label: 'Optimise a hot code path to shave microseconds', types: { [HFT]: 2 }, styles: ['Engineering'] },
      { label: 'Price a derivative with stochastic calculus', types: { [BANK]: 2, [FUND]: 1 }, styles: ['Research'] },
    ],
  },
  {
    id: 'q4',
    prompt: 'Which team structure appeals most?',
    options: [
      { label: 'Small collaborative trading team with shared P&L', types: { [PROP]: 2 }, styles: ['Trading'] },
      { label: 'Pod/desk with clear individual accountability', types: { [FUND]: 2 }, highPace: true },
      { label: 'Research-lab atmosphere', types: { [HFT]: 1, [FUND]: 1 }, styles: ['Research'] },
      { label: 'Large, structured graduate cohort', types: { [BANK]: 2 } },
    ],
  },
  {
    id: 'q5',
    prompt: 'On pace and pressure, you…',
    options: [
      { label: 'Thrive in high-pressure, volatile moments', types: { [PROP]: 1, [FUND]: 1 }, highPace: true },
      { label: 'Prefer steady, deep focus', types: { [HFT]: 1, [FUND]: 1 } },
      { label: 'Value predictable hours', types: { [BANK]: 2 } },
      { label: 'Love fast, high-stakes decisions', types: { [PROP]: 2 }, styles: ['Trading'], highPace: true },
    ],
  },
  {
    id: 'q6',
    prompt: 'How deep is your programming?',
    options: [
      { label: 'I love low-level/systems and performance', types: { [HFT]: 2 }, styles: ['Engineering'] },
      { label: 'I use code as a research tool (Python/ML)', types: { [FUND]: 2 }, styles: ['Research'] },
      { label: 'Some coding, but mostly markets reasoning', types: { [PROP]: 1 }, styles: ['Trading'] },
      { label: 'Coding is one part of a broader role', types: { [BANK]: 1 } },
    ],
  },
  {
    id: 'q7',
    prompt: 'Which academic background is closest to you?',
    options: [
      { label: 'Maths / olympiad / competitions', types: { [PROP]: 1, [HFT]: 1, [FUND]: 1 } },
      { label: 'CS / competitive programming', types: { [HFT]: 2 }, styles: ['Engineering'] },
      { label: 'Statistics / ML / PhD-track', types: { [FUND]: 2 }, styles: ['Research'] },
      { label: 'Finance / economics / engineering generalist', types: { [BANK]: 2 } },
    ],
  },
  {
    id: 'q8',
    prompt: 'Where would you most like to be based?',
    options: [
      { label: 'London', locale: 'London' },
      { label: 'New York / US (incl. Chicago)', locale: 'New York' },
      { label: 'Amsterdam / continental Europe', locale: 'Amsterdam' },
      { label: 'Asia (Hong Kong / Singapore)', locale: 'Asia' },
    ],
  },
  {
    id: 'q9',
    prompt: 'What draws you most to a firm?',
    options: [
      { label: 'Top-of-market compensation', types: { [PROP]: 1, [FUND]: 1 } },
      { label: 'Cutting-edge tech and latency', types: { [HFT]: 2 }, styles: ['Engineering'] },
      { label: 'An intellectual research culture', types: { [FUND]: 2 }, styles: ['Research'] },
      { label: 'Brand, training and long-term options', types: { [BANK]: 2 } },
    ],
  },
  {
    id: 'q10',
    prompt: 'Which phrase resonates most?',
    options: [
      { label: '"Edge, EV and bet sizing" (a poker mindset)', types: { [PROP]: 2 }, styles: ['Trading'] },
      { label: '"The data is the alpha"', types: { [FUND]: 2 }, styles: ['Research'] },
      { label: '"Speed is the product"', types: { [HFT]: 2 }, styles: ['Engineering'] },
      { label: '"Models and risk frameworks"', types: { [BANK]: 1, [FUND]: 1 } },
    ],
  },
  {
    id: 'q11',
    prompt: 'How much do you want to be client/desk-facing?',
    options: [
      { label: 'Not at all — pure proprietary', types: { [PROP]: 1, [HFT]: 1 } },
      { label: 'Some structuring/desk interaction is good', types: { [BANK]: 2 } },
      { label: 'I prefer focused research', types: { [FUND]: 1 }, styles: ['Research'] },
      { label: 'It doesn\'t matter much to me', types: { [HFT]: 1 } },
    ],
  },
  {
    id: 'q12',
    prompt: 'Your reaction to being wrong or losing money?',
    options: [
      { label: 'Update fast and move on — it\'s part of trading', types: { [PROP]: 2 }, styles: ['Trading'], highPace: true },
      { label: 'Analyse the model and iterate', types: { [FUND]: 1, [HFT]: 1 }, styles: ['Research'] },
      { label: 'I prefer roles less directly tied to live P&L', types: { [BANK]: 1 } },
      { label: 'Stay calm under fire — high stakes are fine', types: { [PROP]: 1, [HFT]: 1 }, highPace: true },
    ],
  },
  {
    id: 'q13',
    prompt: 'Company size preference?',
    options: [
      { label: 'Boutique / smaller, with more visibility', types: { [PROP]: 1 } },
      { label: 'Mid-large specialist', types: { [HFT]: 1, [FUND]: 1 } },
      { label: 'Massive multi-strategy platform', types: { [FUND]: 2 }, highPace: true },
      { label: 'Global bank', types: { [BANK]: 2 } },
    ],
  },
  {
    id: 'q14',
    prompt: 'Which interview prep would you enjoy most?',
    options: [
      { label: 'Market-making and probability games', types: { [PROP]: 2 }, styles: ['Trading'] },
      { label: 'Statistics/ML and defending a research project', types: { [FUND]: 2 }, styles: ['Research'] },
      { label: 'Hard algorithms and systems design', types: { [HFT]: 2 }, styles: ['Engineering'] },
      { label: 'Derivatives, stochastic calculus and competency rounds', types: { [BANK]: 2 } },
    ],
  },
  {
    id: 'q15',
    prompt: 'Your long-term ambition?',
    options: [
      { label: 'Become a senior trader running a book', types: { [PROP]: 2 }, styles: ['Trading'] },
      { label: 'Lead quant research / publish models', types: { [FUND]: 2 }, styles: ['Research'] },
      { label: 'Architect trading infrastructure', types: { [HFT]: 2 }, styles: ['Engineering'] },
      { label: 'A broad finance career with optionality', types: { [BANK]: 2 } },
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

      const reasons: string[] = [];
      if (typeNorm >= 0.75) reasons.push(`strong ${guideByCat.get(f.category)?.nick ?? f.category} fit`);
      else if (typeNorm >= 0.4) reasons.push(`${f.category} fit`);
      if (primaryStyle && t.styles.includes(primaryStyle)) reasons.push(`${primaryStyle.toLowerCase()} focus`);
      if (localeMatch) reasons.push(`${locale} office`);
      if (paceMatch && userPace === 'High') reasons.push('high-intensity');

      return {
        id: f.id,
        name: f.name,
        category: f.category,
        score,
        why: reasons.length ? reasons.join(' · ') : 'broad match',
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return { topTypes, topFirms: firmResults };
}
