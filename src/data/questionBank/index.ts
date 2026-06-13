import { questions as legacyQuestions } from '../questions';
import type { Question } from './types';
import { probabilityQuestions } from './probability';
import { expectedValueQuestions } from './expectedValue';
import { combinatoricsQuestions } from './combinatorics';
import { mentalMathQuestions } from './mentalMath';
import { logicQuestions } from './logic';
import { marketMakingQuestions } from './marketMaking';
import { statisticsQuestions } from './statistics';
import { optionsFinanceQuestions } from './optionsFinance';

export type { Category, Difficulty, Question } from './types';

/** Topic + short answer (+ firm tags) for the original 30 questions. */
const legacyMeta: Record<string, { topic: string; answer: string; firms?: string[] }> = {
  'p-ht-before-hh': { topic: 'Coins', answer: '1/2 — both patterns share the prefix H; the flip after the first H decides the race.' },
  'p-three-dice-six': { topic: 'Dice', answer: '1 − (5/6)³ = 91/216 ≈ 42%.' },
  'p-birthday': { topic: 'Collisions', answer: '23 people.' },
  'p-semicircle': { topic: 'Geometric probability', answer: '3/4 (general n: n·(1/2)ⁿ⁻¹).' },
  'p-three-doors': { topic: 'Bayes & conditioning', answer: 'Switch — it wins 2/3 of the time.' },
  'p-rare-disease': { topic: 'Bayes & conditioning', answer: '≈ 1% — the base rate dominates the test accuracy.' },
  'p-two-children': { topic: 'Bayes & conditioning', answer: '1/3.' },
  'ev-first-six': { topic: 'Geometric waiting', answer: '6 rolls.' },
  'ev-max-two-dice': { topic: 'Order statistics', answer: '161/36 ≈ 4.47.' },
  'ev-die-reroll': { topic: 'Optimal stopping', answer: '4.25 with one reroll; 14/3 ≈ 4.67 with two.', firms: ['Jane Street', 'SIG (Susquehanna)'] },
  'ev-coupon': { topic: 'Coupon collector', answer: '6·H₆ = 14.7 rolls.' },
  'ev-hh-wait': { topic: 'Markov chains', answer: '6 flips.' },
  'ev-stick-break': { topic: 'Order statistics', answer: 'E[shorter] = 1/4; E[shorter/longer] = 2ln2 − 1 ≈ 0.386.' },
  'c-handshakes': { topic: 'Selection', answer: 'C(10,2) = 45.' },
  'c-grid-paths': { topic: 'Paths', answer: 'C(10,5) = 252.' },
  'c-staircase': { topic: 'Recurrences', answer: '89 (Fibonacci).' },
  'c-trailing-zeros': { topic: 'Number theory', answer: '24 (count factors of 5: 20 + 4).' },
  'c-round-table': { topic: 'Circular arrangements', answer: '5! = 120; with the pair glued, 2·4! = 48.' },
  'm-17x24': { topic: 'Multiplication tricks', answer: '408.' },
  'm-square-95': { topic: 'Squares', answer: '9025.' },
  'm-sevenths': { topic: 'Decimals & fractions', answer: '0.428571 repeating.' },
  'm-percent-chain': { topic: 'Compounding', answer: '−4% — volatility drag: (1+x)(1−x) = 1 − x².' },
  'l-lockers': { topic: 'Invariants', answer: 'The perfect squares 1, 4, 9, …, 100 — ten lockers (odd divisor counts).' },
  'l-ropes': { topic: 'Lateral thinking', answer: 'Light rope A at both ends and B at one end; when A finishes (30 min), light B\'s other end (+15 min).' },
  'l-eight-balls': { topic: 'Weighing puzzles', answer: 'Two weighings: 3v3, then 1v1 within the implicated group.' },
  'l-hat-line': { topic: 'Information encoding', answer: '99 guaranteed — the back prisoner broadcasts the parity of red hats.' },
  'mm-piano-tuners': { topic: 'Fermi estimation', answer: '~100 tuners (defensible range 75–150).' },
  'mm-seconds-year': { topic: 'Fermi estimation', answer: '31,536,000 ≈ π × 10⁷.' },
  'mm-make-market-747': { topic: 'Quoting & spreads', answer: 'Estimate ≈ 400t and quote around it (e.g. 350/450), updating on their flow.', firms: ['Optiver'] },
  'mm-two-dice-market': { topic: 'Quoting & spreads', answer: 'Fair 7 by linearity; buy at 6.50 (+0.50 EV); quote ~6.80/7.20.' },
};

const upgradedLegacy: Question[] = legacyQuestions.map((q) => {
  const meta = legacyMeta[q.id];
  return {
    ...q,
    topic: meta?.topic ?? 'General',
    answer: meta?.answer ?? '',
    firms: meta?.firms,
  };
});

export const allQuestions: Question[] = [
  ...upgradedLegacy,
  ...probabilityQuestions,
  ...expectedValueQuestions,
  ...combinatoricsQuestions,
  ...mentalMathQuestions,
  ...logicQuestions,
  ...marketMakingQuestions,
  ...statisticsQuestions,
  ...optionsFinanceQuestions,
];

export const CATEGORIES = [
  'Probability',
  'Expected value',
  'Combinatorics',
  'Mental math',
  'Logic',
  'Market making',
  'Statistics',
  'Options & finance',
] as const;

/** Distinct topics within a category, in first-appearance order. */
export function topicsFor(category: string): string[] {
  const seen = new Set<string>();
  for (const q of allQuestions) {
    if (q.category === category) seen.add(q.topic);
  }
  return [...seen];
}

/** Questions with firm tags, for the "asked at firms" view. */
export const firmTaggedQuestions = allQuestions.filter((q) => q.firms && q.firms.length > 0);

/** Deterministic daily question: hash the ISO date into the bank. */
export function dailyQuestion(date = new Date()): Question {
  const key = date.toISOString().slice(0, 10);
  let h = 0;
  for (let i = 0; i < key.length; i++) {
    h = (h * 31 + key.charCodeAt(i)) >>> 0;
  }
  return allQuestions[h % allQuestions.length];
}
