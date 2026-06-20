import { useState } from 'react';
import { Premium, LockBadge, useEntitlement } from '../lib/premium';
import MarketMaker from '../games/MarketMaker';
import MentalMath from '../games/MentalMath';
import DiceEV from '../games/DiceEV';
import CountingCards from '../games/CountingCards';
import SequenceSprint from '../games/SequenceSprint';
import AdverseSelection from '../games/AdverseSelection';
import KellyGame from '../games/KellyGame';
import HiddenDice from '../games/HiddenDice';
import CalibrationDuel from '../games/CalibrationDuel';
import HoldemMarket from '../games/HoldemMarket';

const games = [
  {
    id: 'counting-cards',
    name: 'Counting Cards',
    blurb: 'Keep the Hi-Lo count, quote your confidence, survive the interviewer. Calibration is the score.',
  },
  {
    id: 'adverse-selection',
    name: 'Adverse Selection',
    blurb: 'Live-quote spice against informed and noise flow. Read the tape, steer your fair, beat the hidden walk.',
  },
  {
    id: 'holdem',
    name: "Hold'em Market Maker",
    blurb: 'Quote the sum of a poker-style deal against 3 bots. Read the cards, make markets, settle to the truth.',
  },
  {
    id: 'hidden-dice',
    name: 'Hidden Dice',
    blurb: 'Quote the sum of three hidden dice, re-quote as they reveal. Conditional expectation, live.',
  },
  {
    id: 'kelly',
    name: 'Kelly Criterion',
    blurb: 'A 60/40 edge — but how much do you bet? Race a Kelly bot; learn why all-in ruins you.',
  },
  {
    id: 'calibration',
    name: 'Calibration Duel',
    blurb: '80% confidence intervals on estimates. Aim to contain the truth exactly 80% of the time.',
  },
  {
    id: 'sequence',
    name: 'Sequence Sprint',
    blurb: 'Infer the rule, type the next number, fast. Optiver/SIG-style pattern test.',
  },
  {
    id: 'market-maker',
    name: 'Market Maker',
    blurb: 'Quote bid/ask markets on real-world quantities. Tight and right wins.',
  },
  {
    id: 'mental-math',
    name: 'Mental Math Sprint',
    blurb: 'Optiver-style timed arithmetic — 80 in 8, or shorter warm-up modes.',
  },
  {
    id: 'dice-ev',
    name: 'Dice EV',
    blurb: 'Take or pass dice bets. The score is P&L; the grade is your EV discipline.',
  },
] as const;

type GameId = (typeof games)[number]['id'];

// The complicated games are Pro; the rest stay free.
const PREMIUM_GAMES = new Set<GameId>(['counting-cards', 'adverse-selection', 'holdem']);

export default function Games() {
  const [active, setActive] = useState<GameId>('counting-cards');
  const { premium } = useEntitlement();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Market Making Games</h1>
        <p className="mt-2 text-muted max-w-2xl text-sm">
          Ten games drilling the exact skills quant interviews test — counting, market making,
          calibration, EV, sizing, and speed. High scores stay in this browser.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" role="tablist" aria-label="Choose a game">
        {games.map((g) => (
          <button
            key={g.id}
            role="tab"
            aria-selected={active === g.id}
            onClick={() => setActive(g.id)}
            className={`text-left rounded-lg border p-4 transition-colors ${
              active === g.id
                ? 'border-violet bg-panel'
                : 'border-steel bg-panel/50 hover:border-violet-light'
            }`}
          >
            <span className="flex items-center gap-2">
              <span className={`font-mono text-sm ${active === g.id ? 'text-violet-light' : 'text-fg'}`}>
                {g.name}
              </span>
              {!premium && PREMIUM_GAMES.has(g.id) && <LockBadge />}
            </span>
            <p className="mt-1 text-xs text-muted">{g.blurb}</p>
          </button>
        ))}
      </div>

      <div role="tabpanel">
        {active === 'counting-cards' && <Premium feature="Counting Cards"><CountingCards /></Premium>}
        {active === 'adverse-selection' && <Premium feature="Adverse Selection"><AdverseSelection /></Premium>}
        {active === 'holdem' && <Premium feature="Hold'em Market Maker"><HoldemMarket /></Premium>}
        {active === 'hidden-dice' && <HiddenDice />}
        {active === 'kelly' && <KellyGame />}
        {active === 'calibration' && <CalibrationDuel />}
        {active === 'sequence' && <SequenceSprint />}
        {active === 'market-maker' && <MarketMaker />}
        {active === 'mental-math' && <MentalMath />}
        {active === 'dice-ev' && <DiceEV />}
      </div>
    </div>
  );
}
