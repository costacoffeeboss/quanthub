import { useEffect, useState } from 'react';
import { usePersistentState } from '../lib/storage';
import ReflectionGate, { ReflectToggle, type ReflectSpec } from '../components/ReflectionGate';

const r2 = (x: number) => Math.round(x * 100);

// ---------- deck ----------

const SUITS = ['♠', '♥', '♦', '♣'] as const;
type Suit = (typeof SUITS)[number];
const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'] as const;
type Rank = (typeof RANKS)[number];

interface PCard {
  rank: Rank;
  suit: Suit;
}

function hiLoValue(rank: Rank): number {
  if (['2', '3', '4', '5', '6'].includes(rank)) return 1;
  if (['7', '8', '9'].includes(rank)) return 0;
  return -1;
}

function dealHalfDeck(): PCard[] {
  const deck: PCard[] = [];
  for (const suit of SUITS) for (const rank of RANKS) deck.push({ rank, suit });
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck.slice(0, 26);
}

// ---------- interviewer model ----------
// Right 80% of the time. When wrong: true ±1 (70%) or ±2 (30%), never exact.

function interviewerOpinion(truth: number): number {
  if (Math.random() < 0.8) return truth;
  const mag = Math.random() < 0.7 ? 1 : 2;
  return truth + (Math.random() < 0.5 ? -mag : mag);
}

/** P(interviewer says x | true count t) under the model above. */
function likelihood(x: number, t: number): number {
  const d = Math.abs(x - t);
  if (d === 0) return 0.8;
  if (d === 1) return 0.07;
  if (d === 2) return 0.03;
  return 0.002; // model says never, but stay numerically safe
}

/**
 * Bayesian posterior over the five buckets c-2..c+2 given the player's prior
 * (as fractions, possibly summing < 1 with remainder = "somewhere else")
 * and the interviewer's statement x. "Somewhere else" gets a small flat likelihood.
 */
function bayesPosterior(c: number, prior: number[], x: number): number[] {
  const vals = [c - 2, c - 1, c, c + 1, c + 2];
  const pOther = Math.max(0, 1 - prior.reduce((a, b) => a + b, 0));
  const weights = vals.map((v, i) => prior[i] * likelihood(x, v));
  // "Something else" likelihood: if the interviewer named a count outside all
  // five buckets, that count lives in "something else" and he is right 80% of
  // the time — so the leftover mass gets a big weight, not a token one.
  const otherL = Math.abs(x - c) > 2 ? 0.5 : 0.02;
  const z = weights.reduce((a, b) => a + b, 0) + pOther * otherL;
  if (z <= 0) return prior;
  return weights.map((w) => w / z);
}

function aceOpinion(truth: number): number {
  if (Math.random() < 0.8) return truth;
  if (truth === 0) return 1;
  return truth + (Math.random() < 0.5 ? -1 : 1);
}

// ---------- card graphic ----------

function PlayingCard({ card }: { card: PCard }) {
  const red = card.suit === '♥' || card.suit === '♦';
  const ink = red ? '#d4383d' : '#1b1d24';
  return (
    <svg viewBox="0 0 140 196" className="w-32 sm:w-40 h-auto drop-shadow-lg" role="img" aria-label={`${card.rank} of ${card.suit}`}>
      <rect x="2" y="2" width="136" height="192" rx="12" fill="#eceef2" stroke="#9aa0ad" strokeWidth="2" />
      <text x="14" y="34" fontSize="26" fontWeight="700" fill={ink} fontFamily="JetBrains Mono, monospace">
        {card.rank}
      </text>
      <text x="14" y="58" fontSize="22" fill={ink}>
        {card.suit}
      </text>
      <text x="70" y="118" fontSize="64" fill={ink} textAnchor="middle">
        {card.suit}
      </text>
      <g transform="rotate(180 70 98)">
        <text x="14" y="34" fontSize="26" fontWeight="700" fill={ink} fontFamily="JetBrains Mono, monospace">
          {card.rank}
        </text>
        <text x="14" y="58" fontSize="22" fill={ink}>
          {card.suit}
        </text>
      </g>
    </svg>
  );
}

function CardBack() {
  return (
    <svg viewBox="0 0 140 196" className="w-16 h-auto opacity-80" aria-hidden="true">
      <rect x="2" y="2" width="136" height="192" rx="12" fill="#2a1b4d" stroke="#6d4aff" strokeWidth="2" />
      <rect x="14" y="14" width="112" height="168" rx="8" fill="none" stroke="#6d4aff" strokeWidth="1.5" opacity="0.6" />
      <text x="70" y="110" fontSize="40" fill="#a78bfa" textAnchor="middle" fontFamily="JetBrains Mono, monospace">
        Q
      </text>
    </svg>
  );
}

// ---------- round record ----------

interface RoundRec {
  mode: 'basic' | 'ace';
  trueCount: number;
  userCount: number;
  prior: number[]; // fractions on c-2..c+2
  interviewer: number;
  post: number[];
  bayes: number[];
  trueAces?: number;
  userAces?: number;
  aceMkt1?: [number, number];
  aceInterviewer?: number;
  aceMkt2?: [number, number];
}

type Phase =
  | 'intro'
  | 'ready'
  | 'dealing'
  | 'count'
  | 'market'
  | 'update'
  | 'aceCount'
  | 'aceMarket'
  | 'aceUpdate'
  | 'reveal'
  | 'feedback';

const TOTAL_ROUNDS = 5; // 3 basic + 2 ace
const CARDS_PER_ROUND = 26;

const inputCls = 'bg-bg border border-steel rounded px-3 py-2 font-mono text-sm w-full';
const btnCls =
  'font-mono text-sm px-5 py-2.5 rounded bg-violet text-white hover:bg-violet-light hover:text-bg transition-colors disabled:opacity-40 disabled:cursor-not-allowed';
// ---------- distribution input ----------

function DistInput({
  center,
  values,
  onChange,
}: {
  center: number;
  values: string[];
  onChange: (v: string[]) => void;
}) {
  const nums = values.map((v) => Number(v) || 0);
  const sum = nums.reduce((a, b) => a + b, 0);
  const over = sum > 100;
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-5 gap-2">
        {values.map((v, i) => (
          <label key={i} className="block text-center">
            <span className={`font-mono text-[11px] ${i === 2 ? 'text-violet-light' : 'text-muted'}`}>
              {center + i - 2 >= 0 ? '+' : ''}
              {center + i - 2}
              {i === 2 ? ' (yours)' : ''}
            </span>
            <input
              className={`${inputCls} text-center mt-1`}
              inputMode="numeric"
              value={v}
              aria-label={`Probability count is ${center + i - 2} percent`}
              onChange={(e) => onChange(values.map((x, j) => (j === i ? e.target.value : x)))}
            />
          </label>
        ))}
      </div>
      <p className={`font-mono text-xs ${over ? 'text-closed' : 'text-muted'}`}>
        Total: {sum}% {over ? '— must be ≤ 100%' : `(${100 - sum}% left for “something else”)`}
      </p>
    </div>
  );
}

// ---------- reflection: judging the Bayesian update ----------

function buildUpdateReflection(c: number, prior: number[], post: number[], bayes: number[], interviewer: number): ReflectSpec {
  const agree = interviewer === c;
  const priorOwn = prior[2] ?? 0;
  const postOwn = post[2] ?? 0;
  const bayesOwn = bayes[2] ?? 0;
  const move = postOwn - priorOwn;
  const ideal = bayesOwn - priorOwn;
  const gap = postOwn - bayesOwn;

  const chips = [
    { id: 'confirm', label: 'He agreed with me, so I raised my confidence', sound: agree && move > 0.02 },
    { id: 'discount', label: 'He named a different count, so I shifted weight his way', sound: !agree && move < -0.02 },
    { id: 'noover', label: "He's only right 80%, so I didn't overreact", sound: Math.abs(gap) <= 0.1 },
    { id: 'trust', label: 'I trust my own count and held basically firm', sound: Math.abs(move) < 0.05 && Math.abs(ideal) < 0.08 },
  ];

  let tier: ReflectSpec['verdict']['tier'];
  let headline: string;
  if (Math.abs(gap) <= 0.08) { tier = 'sound'; headline = 'your update tracked Bayes'; }
  else if (gap > 0.08) { tier = gap > 0.2 ? 'mistake' : 'mixed'; headline = 'you held too much on your own count'; }
  else { tier = gap < -0.2 ? 'mistake' : 'mixed'; headline = 'you moved more than the evidence warranted'; }

  const points: string[] = [];
  points.push(
    `${agree ? 'He agreed with you' : `He said a different count (${interviewer >= 0 ? '+' : ''}${interviewer})`} — an 80%-accurate source ${agree ? 'should push you up' : 'should pull some weight off your count'}.`,
  );
  points.push(`You moved P(your count) ${r2(priorOwn)}% → ${r2(postOwn)}%. A Bayesian with your prior lands ~${r2(bayesOwn)}%.`);
  if (gap > 0.08) points.push('Disagreement from a mostly-right interviewer must cost you probability; confirmation should add it. Size the move to his 80% reliability.');
  else if (gap < -0.08) points.push("He's wrong 20% of the time — don't torch a carefully built count (or over-pile on agreement) off one sentence.");
  else points.push('Well sized — you respected the evidence without crumbling or ignoring it.');

  return {
    question: agree
      ? 'The interviewer agreed with your count. Why did you update the way you did?'
      : 'The interviewer named a different count. Why did you update the way you did?',
    facts: [
      { label: 'Your count', value: `${c >= 0 ? '+' : ''}${c}` },
      { label: 'Interviewer', value: `${interviewer >= 0 ? '+' : ''}${interviewer}` },
      { label: 'P(yours)', value: `${r2(priorOwn)}%→${r2(postOwn)}%` },
      { label: 'Bayes', value: `~${r2(bayesOwn)}%` },
    ],
    chips,
    verdict: { tier, headline, points },
  };
}

// ---------- main component ----------

export default function CountingCards() {
  const [best, setBest] = usePersistentState<number | null>('qh:hiscore:counting-cards', null);
  const [reflect, setReflect] = usePersistentState<boolean>('qh:reflect', false);
  const [pendingReflect, setPendingReflect] = useState<ReflectSpec | null>(null);
  const [reflectThen, setReflectThen] = useState<Phase>('reveal');

  const [phase, setPhase] = useState<Phase>('intro');
  const [round, setRound] = useState(0);
  const [pace, setPace] = useState(2);
  const [cards, setCards] = useState<PCard[]>([]);
  const [dealt, setDealt] = useState(0);
  const [records, setRecords] = useState<RoundRec[]>([]);

  // per-round working state
  const [countIn, setCountIn] = useState('');
  const [dist, setDist] = useState<string[]>(['', '', '', '', '']);
  const [interviewer, setInterviewer] = useState(0);
  const [savedPrior, setSavedPrior] = useState<number[]>([]);
  const [acesIn, setAcesIn] = useState('');
  const [aceBid, setAceBid] = useState('');
  const [aceAsk, setAceAsk] = useState('');
  const [aceMkt1, setAceMkt1] = useState<[number, number]>([0, 0]);
  const [aceSay, setAceSay] = useState(0);
  const [err, setErr] = useState('');

  const mode: 'basic' | 'ace' = round < 3 ? 'basic' : 'ace';
  const trueCount = cards.slice(0, dealt).reduce((a, c) => a + hiLoValue(c.rank), 0);
  const trueAces = cards.slice(0, dealt).filter((c) => c.rank === 'A').length;

  // persist best rating when the final feedback is reached
  useEffect(() => {
    if (phase !== 'feedback') return;
    const { rating } = feedback();
    setBest((b) => (b === null || rating > b ? rating : b));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // dealing engine
  useEffect(() => {
    if (phase !== 'dealing') return;
    if (dealt >= CARDS_PER_ROUND) {
      setPhase('count');
      return;
    }
    const t = window.setTimeout(() => setDealt((d) => d + 1), pace * 1000);
    return () => window.clearTimeout(t);
  }, [phase, dealt, pace]);

  function startRound() {
    setCards(dealHalfDeck());
    setDealt(0);
    setCountIn('');
    setDist(['', '', '', '', '']);
    setAcesIn('');
    setAceBid('');
    setAceAsk('');
    setErr('');
    setPhase('dealing');
  }

  function submitCount() {
    const n = Number(countIn);
    if (countIn.trim() === '' || !Number.isInteger(n)) return setErr('Enter your running count as a whole number (can be negative).');
    setErr('');
    setPhase('market');
  }

  function distFractions(): number[] {
    return dist.map((v) => (Number(v) || 0) / 100);
  }

  function submitMarket() {
    const nums = dist.map((v) => Number(v) || 0);
    if (nums.some((n) => n < 0 || n > 100)) return setErr('Each probability must be between 0 and 100.');
    if (nums.reduce((a, b) => a + b, 0) > 100) return setErr('Your probabilities sum to more than 100% — that is a free lunch for the interviewer.');
    if (nums[2] <= 0) return setErr('You put 0% on your own count. Quote something you believe.');
    setErr('');
    setSavedPrior(distFractions());
    setInterviewer(interviewerOpinion(trueCount));
    setPhase('update');
  }

  function submitUpdate() {
    const nums = dist.map((v) => Number(v) || 0);
    if (nums.some((n) => n < 0 || n > 100)) return setErr('Each probability must be between 0 and 100.');
    if (nums.reduce((a, b) => a + b, 0) > 100) return setErr('Updated probabilities must still sum to ≤ 100%.');
    setErr('');
    const c = Number(countIn);
    const rec: RoundRec = {
      mode,
      trueCount,
      userCount: c,
      prior: savedPrior,
      interviewer,
      post: distFractions(),
      bayes: bayesPosterior(c, savedPrior, interviewer),
    };
    setRecords((r) => [...r, rec]);
    const nextPhase: Phase = mode === 'ace' ? 'aceCount' : 'reveal';
    // occasional reflection on the Bayesian-update step (first basic + first ace round)
    if (reflect && (round === 0 || round === 3)) {
      setReflectThen(nextPhase);
      setPendingReflect(buildUpdateReflection(c, savedPrior, rec.post, rec.bayes, interviewer));
    } else {
      setPhase(nextPhase);
    }
  }

  function submitAceCount() {
    const n = Number(acesIn);
    if (acesIn.trim() === '' || !Number.isInteger(n) || n < 0 || n > 8) return setErr('Enter the number of aces you counted (0–8).');
    setErr('');
    setAceBid('');
    setAceAsk('');
    setPhase('aceMarket');
  }

  function submitAceMarket(stage: 'first' | 'second') {
    const b = Number(aceBid);
    const a = Number(aceAsk);
    if (aceBid.trim() === '' || aceAsk.trim() === '' || Number.isNaN(b) || Number.isNaN(a)) return setErr('Enter both a bid and an ask.');
    if (a <= b) return setErr('Ask must be above bid.');
    if (b < 0) return setErr('There cannot be a negative number of aces.');
    setErr('');
    if (stage === 'first') {
      setAceMkt1([b, a]);
      setAceSay(aceOpinion(trueAces));
      setPhase('aceUpdate');
    } else {
      setRecords((r) => {
        const last = { ...r[r.length - 1] };
        last.trueAces = trueAces;
        last.userAces = Number(acesIn);
        last.aceMkt1 = aceMkt1;
        last.aceInterviewer = aceSay;
        last.aceMkt2 = [b, a];
        return [...r.slice(0, -1), last];
      });
      setPhase('reveal');
    }
  }

  function nextRound() {
    if (round + 1 >= TOTAL_ROUNDS) {
      setPhase('feedback');
    } else {
      setRound((r) => r + 1);
      setPhase('ready');
    }
  }

  function restart() {
    setRound(0);
    setRecords([]);
    setPhase('intro');
  }

  // ---------- feedback computation ----------

  function feedback() {
    const exact = records.filter((r) => r.userCount === r.trueCount).length;
    const avgErr = records.reduce((a, r) => a + Math.abs(r.userCount - r.trueCount), 0) / records.length;
    const avgPostOwn = records.reduce((a, r) => a + r.post[2], 0) / records.length;
    const acc = exact / records.length;
    const updGap = records.reduce((a, r) => a + Math.abs(r.post[2] - r.bayes[2]), 0) / records.length;

    const counting = Math.max(
      0,
      records.reduce((a, r) => {
        const d = Math.abs(r.userCount - r.trueCount);
        return a + (d === 0 ? 1 : d === 1 ? 0.5 : d === 2 ? 0.2 : 0);
      }, 0) / records.length,
    );
    const calibration = Math.max(0, 1 - Math.abs(avgPostOwn - acc) * 2);
    const updating = Math.max(0, 1 - updGap * 3);
    const rating = Math.round((counting * 0.4 + calibration * 0.3 + updating * 0.3) * 100);

    const lines: string[] = [];
    lines.push(
      `Counting: ${exact}/${records.length} exact, average miss ${avgErr.toFixed(1)}. ${
        exact >= 4 ? 'Genuinely solid under pressure.' : exact >= 2 ? 'Workable, but firms will push the pace up — drill until fast feels slow.' : 'The count came apart. Slow the dealer down and rebuild accuracy before speed.'
      }`,
    );
    if (avgPostOwn - acc > 0.15) {
      lines.push(
        `Calibration: overconfident. You averaged ${Math.round(avgPostOwn * 100)}% on your own count but were right ${Math.round(acc * 100)}% of the time. Interviewers forgive wrong counts; they do not forgive 90% confidence on coin-flip accuracy.`,
      );
    } else if (acc - avgPostOwn > 0.15) {
      lines.push(
        `Calibration: underconfident. You were right ${Math.round(acc * 100)}% of the time but only claimed ${Math.round(avgPostOwn * 100)}%. Leaving probability on the table is also a quoting error — own your edge.`,
      );
    } else {
      lines.push(
        `Calibration: good. Stated ${Math.round(avgPostOwn * 100)}% on average, right ${Math.round(acc * 100)}% of the time. That match is exactly what they are screening for.`,
      );
    }
    const agreeRounds = records.filter((r) => r.interviewer === r.userCount);
    const disagreeRounds = records.filter((r) => r.interviewer !== r.userCount);
    if (agreeRounds.length > 0) {
      const avgMove = agreeRounds.reduce((a, r) => a + (r.post[2] - r.prior[2]), 0) / agreeRounds.length;
      const avgIdeal = agreeRounds.reduce((a, r) => a + (r.bayes[2] - r.prior[2]), 0) / agreeRounds.length;
      if (avgIdeal - avgMove > 0.1) {
        lines.push(
          `Updating on agreement: too timid. When an 80%-accurate interviewer confirms your count, that is strong evidence — Bayes wanted you up ~${Math.round(avgIdeal * 100)} points, you moved ~${Math.round(avgMove * 100)}.`,
        );
      } else {
        lines.push('Updating on agreement: appropriate — you let confirmation from an 80%-accurate source move you up properly.');
      }
    }
    if (disagreeRounds.length > 0) {
      const avgMove = disagreeRounds.reduce((a, r) => a + (r.post[2] - r.prior[2]), 0) / disagreeRounds.length;
      const avgIdeal = disagreeRounds.reduce((a, r) => a + (r.bayes[2] - r.prior[2]), 0) / disagreeRounds.length;
      if (avgMove - avgIdeal > 0.1) {
        lines.push(
          `Updating on disagreement: too stubborn. When he named a different count, Bayes wanted you down ~${Math.abs(Math.round(avgIdeal * 100))} points; you barely moved. Disagreement from a mostly-right source must cost you probability.`,
        );
      } else if (avgIdeal - avgMove > 0.1) {
        lines.push(
          'Updating on disagreement: you capitulated harder than the evidence demanded. He is wrong 20% of the time — do not torch a carefully built count on one sentence.',
        );
      } else {
        lines.push('Updating on disagreement: well sized — you discounted without crumbling.');
      }
    }
    const aceRecs = records.filter((r) => r.mode === 'ace' && r.aceMkt2);
    if (aceRecs.length > 0) {
      const contained = aceRecs.filter((r) => r.aceMkt2![0] <= r.trueAces! && r.trueAces! <= r.aceMkt2![1]).length;
      const avgWidth = aceRecs.reduce((a, r) => a + (r.aceMkt2![1] - r.aceMkt2![0]), 0) / aceRecs.length;
      lines.push(
        `Ace markets: ${contained}/${aceRecs.length} final markets contained the true ace count, average width ${avgWidth.toFixed(1)}. ${
          contained === aceRecs.length && avgWidth <= 2 ? 'Tight and right — the ideal.' : contained < aceRecs.length ? 'A market that misses costs more than a wide one earns — when juggling two counts, widen the one you trust less.' : 'All contained but wide — earn more by tightening when your ace count felt certain.'
        }`,
      );
    }
    return { rating, lines };
  }

  // ---------- render ----------

  const roundLabel = `Round ${round + 1}/${TOTAL_ROUNDS} · ${mode === 'basic' ? 'BASIC' : 'ACE MODE'}`;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-x-6 gap-y-1 font-mono text-xs text-muted">
        {phase !== 'intro' && <span>{roundLabel}</span>}
        <span>Best rating: {best === null ? '—' : `${best}/100`}</span>
      </div>

      <div className="rounded-lg border border-steel bg-panel p-5 space-y-5">
        {pendingReflect ? (
          <ReflectionGate
            spec={pendingReflect}
            onContinue={() => {
              setPhase(reflectThen);
              setPendingReflect(null);
            }}
          />
        ) : (
        <>
        {phase === 'intro' && (
          <div className="space-y-4">
            <h3 className="font-mono text-lg text-violet-light">Counting Cards</h3>
            <div className="text-sm space-y-3 leading-relaxed">
              <p>
                26 cards will be dealt, one at a time. Keep the <strong>Hi-Lo running count</strong>:
              </p>
              <div className="grid grid-cols-3 gap-2 font-mono text-xs text-center">
                <div className="rounded border border-steel bg-bg p-2">
                  <p className="text-open">2 3 4 5 6</p>
                  <p className="text-muted mt-1">+1</p>
                </div>
                <div className="rounded border border-steel bg-bg p-2">
                  <p>7 8 9</p>
                  <p className="text-muted mt-1">0</p>
                </div>
                <div className="rounded border border-steel bg-bg p-2">
                  <p className="text-closed">10 J Q K A</p>
                  <p className="text-muted mt-1">−1</p>
                </div>
              </div>
              <p>
                When the deal stops you report your count, then put probabilities on it being right
                — and on the neighbouring values. An interviewer (right 80% of the time, near-miss
                when wrong) will state his own count, and you must update. Rounds 4–5 add a second
                job: track the number of <strong>aces</strong> too, and quote a bid/ask market on it.
              </p>
              <p className="text-muted">
                You are graded like an interview: counting accuracy, calibration, and whether your
                updates were Bayesian or emotional.
              </p>
            </div>
            <label className="block max-w-sm">
              <span className="font-mono text-xs text-muted">
                Seconds per card: <span className="text-violet-light">{pace.toFixed(1)}s</span>
              </span>
              <input
                type="range"
                min={0.3}
                max={5}
                step={0.1}
                value={pace}
                onChange={(e) => setPace(Number(e.target.value))}
                className="w-full accent-[#6d4aff]"
                aria-label="Seconds per card"
              />
              <span className="font-mono text-[10px] text-muted flex justify-between">
                <span>0.3s (savage)</span>
                <span>5.0s (gentle)</span>
              </span>
            </label>
            <ReflectToggle on={reflect} onChange={setReflect} />
            <button type="button" className={btnCls} onClick={() => { setRound(0); setRecords([]); setPhase('ready'); }}>
              Start →
            </button>
          </div>
        )}

        {phase === 'ready' && (
          <div className="space-y-4">
            <p className="font-mono text-sm text-violet-light">{roundLabel}</p>
            <p className="text-sm">
              {mode === 'basic'
                ? '26 cards. Keep the Hi-Lo count. Nothing else.'
                : '26 cards. Keep the Hi-Lo count AND the number of aces. Two ledgers, one brain.'}
            </p>
            <label className="block max-w-sm">
              <span className="font-mono text-xs text-muted">
                Seconds per card: <span className="text-violet-light">{pace.toFixed(1)}s</span>
              </span>
              <input
                type="range"
                min={0.3}
                max={5}
                step={0.1}
                value={pace}
                onChange={(e) => setPace(Number(e.target.value))}
                className="w-full accent-[#6d4aff]"
                aria-label="Seconds per card"
              />
            </label>
            <button type="button" className={btnCls} onClick={startRound}>
              Deal
            </button>
          </div>
        )}

        {phase === 'dealing' && (
          <div className="flex flex-col items-center gap-4 py-4">
            <p className="font-mono text-xs text-muted" aria-live="polite">
              Card {Math.min(dealt + 1, CARDS_PER_ROUND)} / {CARDS_PER_ROUND}
            </p>
            <div className="flex items-center gap-6">
              <CardBack />
              {dealt < CARDS_PER_ROUND && cards[dealt] ? <PlayingCard card={cards[dealt]} /> : null}
            </div>
            <p className="font-mono text-[11px] text-muted">No pausing. Keep the count in your head.</p>
          </div>
        )}

        {phase === 'count' && (
          <form className="space-y-3 max-w-sm" onSubmit={(e) => { e.preventDefault(); submitCount(); }}>
            <p className="font-mono text-sm">Deal complete. What is your running count?</p>
            <input className={inputCls} inputMode="numeric" autoFocus value={countIn} onChange={(e) => setCountIn(e.target.value)} aria-label="Your running count" />
            {err && <p className="font-mono text-xs text-closed">{err}</p>}
            <button type="submit" className={btnCls}>Lock it in</button>
          </form>
        )}

        {phase === 'market' && (
          <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); submitMarket(); }}>
            <p className="font-mono text-sm">
              You said <span className="text-violet-light">{Number(countIn) >= 0 ? '+' : ''}{countIn}</span>. Put probabilities (%) on the true count being each of these:
            </p>
            <DistInput center={Number(countIn)} values={dist} onChange={setDist} />
            {err && <p className="font-mono text-xs text-closed">{err}</p>}
            <button type="submit" className={btnCls}>Quote it</button>
          </form>
        )}

        {phase === 'update' && (
          <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); submitUpdate(); }}>
            <div className="rounded border border-violet/40 bg-violet/10 px-4 py-3 font-mono text-sm">
              Interviewer: “I think the count is{' '}
              <span className="text-violet-light">{interviewer >= 0 ? '+' : ''}{interviewer}</span>.”
              <span className="block text-[11px] text-muted mt-1">He is right about 80% of the time; when wrong he is off by 1 or 2.</span>
            </div>
            <p className="font-mono text-sm">Update your probabilities:</p>
            <DistInput center={Number(countIn)} values={dist} onChange={setDist} />
            {err && <p className="font-mono text-xs text-closed">{err}</p>}
            <button type="submit" className={btnCls}>Final answer</button>
          </form>
        )}

        {phase === 'aceCount' && (
          <form className="space-y-3 max-w-sm" onSubmit={(e) => { e.preventDefault(); submitAceCount(); }}>
            <p className="font-mono text-sm">Second ledger: how many aces did you count?</p>
            <input className={inputCls} inputMode="numeric" autoFocus value={acesIn} onChange={(e) => setAcesIn(e.target.value)} aria-label="Number of aces counted" />
            {err && <p className="font-mono text-xs text-closed">{err}</p>}
            <button type="submit" className={btnCls}>Lock it in</button>
          </form>
        )}

        {(phase === 'aceMarket' || phase === 'aceUpdate') && (
          <form className="space-y-3 max-w-md" onSubmit={(e) => { e.preventDefault(); submitAceMarket(phase === 'aceMarket' ? 'first' : 'second'); }}>
            {phase === 'aceUpdate' && (
              <div className="rounded border border-violet/40 bg-violet/10 px-4 py-3 font-mono text-sm">
                Interviewer: “I counted <span className="text-violet-light">{aceSay}</span> aces.”
                <span className="block text-[11px] text-muted mt-1">Your first market was {aceMkt1[0]} / {aceMkt1[1]}. Re-quote.</span>
              </div>
            )}
            <p className="font-mono text-sm">
              {phase === 'aceMarket'
                ? `You counted ${acesIn}. Make a market on the TRUE number of aces dealt:`
                : 'Updated market on the true number of aces:'}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="font-mono text-[11px] text-muted">Bid</span>
                <input className={inputCls} inputMode="decimal" value={aceBid} onChange={(e) => setAceBid(e.target.value)} />
              </label>
              <label className="block">
                <span className="font-mono text-[11px] text-muted">Ask</span>
                <input className={inputCls} inputMode="decimal" value={aceAsk} onChange={(e) => setAceAsk(e.target.value)} />
              </label>
            </div>
            {err && <p className="font-mono text-xs text-closed">{err}</p>}
            <button type="submit" className={btnCls}>{phase === 'aceMarket' ? 'Quote it' : 'Final market'}</button>
          </form>
        )}

        {phase === 'reveal' && records.length > 0 && (() => {
          const r = records[records.length - 1];
          const right = r.userCount === r.trueCount;
          return (
            <div className="space-y-3">
              <p className="font-mono text-lg">
                True count:{' '}
                <span className="text-violet-light">{r.trueCount >= 0 ? '+' : ''}{r.trueCount}</span>{' '}
                — you said {r.userCount >= 0 ? '+' : ''}{r.userCount}{' '}
                {right ? <span className="text-open">✓ exact</span> : <span className="text-closed">✗ off by {Math.abs(r.userCount - r.trueCount)}</span>}
              </p>
              <ul className="font-mono text-xs text-muted space-y-1">
                <li>
                  Interviewer said {r.interviewer >= 0 ? '+' : ''}{r.interviewer} ({r.interviewer === r.trueCount ? 'he was right' : 'he was wrong'}).
                </li>
                <li>
                  Your P(your count) went {Math.round(r.prior[2] * 100)}% → {Math.round(r.post[2] * 100)}%. A Bayesian with your prior would hold ~{Math.round(r.bayes[2] * 100)}%.
                </li>
                {r.trueAces !== undefined && (
                  <li>
                    Aces: true {r.trueAces}, you counted {r.userAces}. Final market {r.aceMkt2![0]}/{r.aceMkt2![1]}{' '}
                    {r.aceMkt2![0] <= r.trueAces && r.trueAces <= r.aceMkt2![1] ? <span className="text-open">contained ✓</span> : <span className="text-closed">missed ✗</span>}{' '}
                    (interviewer said {r.aceInterviewer}).
                  </li>
                )}
              </ul>
              <button type="button" className={btnCls} onClick={nextRound}>
                {round + 1 >= TOTAL_ROUNDS ? 'Get interview feedback →' : 'Next round →'}
              </button>
            </div>
          );
        })()}

        {phase === 'feedback' && (() => {
          const { rating, lines } = feedback();
          return (
            <div className="space-y-4">
              <p className="font-mono text-lg">
                Interview rating: <span className={rating >= 70 ? 'text-open' : rating >= 45 ? 'text-soon' : 'text-closed'}>{rating}/100</span>
                {(best === null || rating >= best) && <span className="text-soon"> ★ best</span>}
              </p>
              <div className="space-y-2 text-sm leading-relaxed">
                {lines.map((l, i) => (
                  <p key={i}>{l}</p>
                ))}
              </div>
              <div className="overflow-x-auto rounded border border-steel">
                <table className="w-full font-mono text-xs">
                  <thead>
                    <tr className="text-muted text-left uppercase tracking-wider">
                      <th className="p-2 border-b border-steel">Rd</th>
                      <th className="p-2 border-b border-steel">True</th>
                      <th className="p-2 border-b border-steel">You</th>
                      <th className="p-2 border-b border-steel">Interviewer</th>
                      <th className="p-2 border-b border-steel">P before→after</th>
                      <th className="p-2 border-b border-steel">Bayes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((r, i) => (
                      <tr key={i} className="border-b border-steel last:border-0">
                        <td className="p-2">{i + 1}{r.mode === 'ace' ? 'A' : ''}</td>
                        <td className={`p-2 ${r.userCount === r.trueCount ? 'text-open' : 'text-closed'}`}>{r.trueCount >= 0 ? '+' : ''}{r.trueCount}</td>
                        <td className="p-2">{r.userCount >= 0 ? '+' : ''}{r.userCount}</td>
                        <td className="p-2">{r.interviewer >= 0 ? '+' : ''}{r.interviewer}</td>
                        <td className="p-2">{Math.round(r.prior[2] * 100)}%→{Math.round(r.post[2] * 100)}%</td>
                        <td className="p-2 text-violet-light">{Math.round(r.bayes[2] * 100)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button type="button" className={btnCls} onClick={restart}>
                Run it again
              </button>
            </div>
          );
        })()}
        </>
        )}
      </div>
    </div>
  );
}
