/**
 * The Options mini-course: an ordered list of chapters, each with a quiz that
 * gates the next chapter. Lesson *content* (prose + interactive widgets) lives
 * in src/pages/options/lessons.tsx, keyed by chapter id; this file holds the
 * metadata and the auto-graded questions only.
 *
 * Quizzes are deliberately deterministic (multiple-choice + numeric) so the
 * unlock gate works for everyone, with no model or API key required.
 */

export type QuizQuestion =
  | {
      id: string;
      type: 'mcq';
      prompt: string;
      choices: string[];
      /** Index into `choices` of the correct answer. */
      answerIndex: number;
      explanation: string;
    }
  | {
      id: string;
      type: 'numeric';
      prompt: string;
      /** Correct numeric answer. */
      answer: number;
      /** Absolute tolerance for a correct mark. */
      tolerance: number;
      /** Optional unit hint shown next to the input, e.g. "£" or "%". */
      unit?: string;
      explanation: string;
    };

export interface Chapter {
  /** URL slug and storage key, e.g. 'greeks'. */
  id: string;
  number: number;
  title: string;
  /** One-line hook shown on the overview card. */
  summary: string;
  /** What the reader will be able to do, shown at the top of the chapter. */
  objectives: string[];
  quiz: QuizQuestion[];
}

export const PASS_PCT = 70;

export const chapters: Chapter[] = [
  // ──────────────────────────────────────────────────────────────────────
  {
    id: 'basics',
    number: 1,
    title: 'Basic options & payoffs',
    summary: 'Calls, puts, long vs short, and the four payoff shapes everything else is built from.',
    objectives: [
      'Define a call and a put, and the rights each side holds',
      'Read a payoff diagram and compute P&L at expiry',
      'Separate intrinsic value from time value',
    ],
    quiz: [
      {
        id: 'b1',
        type: 'mcq',
        prompt: 'A call option gives the holder the…',
        choices: [
          'right, but not the obligation, to buy the underlying at the strike',
          'obligation to buy the underlying at the strike',
          'right, but not the obligation, to sell the underlying at the strike',
          'right to receive a fixed cash payment at expiry',
        ],
        answerIndex: 0,
        explanation:
          'A call is the right (not obligation) to BUY at the strike. A put is the right to sell. Options are rights for the buyer and obligations for the seller (writer).',
      },
      {
        id: 'b2',
        type: 'mcq',
        prompt: 'Buying a put is fundamentally a bet that…',
        choices: [
          'the underlying price falls',
          'the underlying price rises',
          'volatility falls',
          'interest rates rise',
        ],
        answerIndex: 0,
        explanation:
          'A long put gains value as the underlying drops below the strike — it is a bearish (or protective) position.',
      },
      {
        id: 'b3',
        type: 'numeric',
        prompt:
          'You are long a 100-strike call bought for £5. At expiry the underlying is £112. What is your P&L (£)?',
        answer: 7,
        tolerance: 0.01,
        unit: '£',
        explanation:
          'Intrinsic value = max(112 − 100, 0) = 12. Subtract the £5 premium paid: 12 − 5 = £7 profit.',
      },
      {
        id: 'b4',
        type: 'numeric',
        prompt: 'At what underlying price does a 100-strike call bought for £5 break even at expiry?',
        answer: 105,
        tolerance: 0.01,
        unit: '£',
        explanation: 'Breakeven for a long call = strike + premium = 100 + 5 = £105.',
      },
      {
        id: 'b5',
        type: 'mcq',
        prompt: 'What is the risk profile of selling (writing) a naked call?',
        choices: [
          'Gain capped at the premium; loss is unlimited',
          'Gain unlimited; loss capped at the premium',
          'Both gain and loss are capped',
          'Both gain and loss are unlimited',
        ],
        answerIndex: 0,
        explanation:
          'The writer keeps the premium at best, but the underlying can rise without bound, so the short call’s loss is theoretically unlimited.',
      },
      {
        id: 'b6',
        type: 'numeric',
        prompt: 'What is the intrinsic value of a 100-strike put when the underlying is £90?',
        answer: 10,
        tolerance: 0.01,
        unit: '£',
        explanation: 'Put intrinsic value = max(strike − spot, 0) = max(100 − 90, 0) = £10.',
      },
      {
        id: 'b7',
        type: 'mcq',
        prompt: 'The underlying is £105. A 100-strike call is therefore…',
        choices: ['in the money', 'at the money', 'out of the money', 'worthless'],
        answerIndex: 0,
        explanation:
          'Spot (105) is above the call’s strike (100), so exercising would be profitable — the call is in the money.',
      },
      {
        id: 'b8',
        type: 'numeric',
        prompt:
          'Premium = intrinsic value + time value. What is the intrinsic value of an at-the-money option?',
        answer: 0,
        tolerance: 0.01,
        unit: '£',
        explanation:
          'At the money, spot equals strike, so intrinsic value is 0 — an ATM option’s premium is entirely time (extrinsic) value.',
      },
      {
        id: 'b9',
        type: 'numeric',
        prompt:
          'You SHORT a 100-strike put, collecting £4. At expiry the underlying is £97. What is your P&L (£)?',
        answer: 1,
        tolerance: 0.01,
        unit: '£',
        explanation:
          'The put’s intrinsic value is 100 − 97 = £3, which you owe as the writer. You kept the £4 premium: 4 − 3 = £1 profit.',
      },
      {
        id: 'b10',
        type: 'mcq',
        prompt: 'A European option differs from an American option in that it can be exercised…',
        choices: [
          'only at expiry',
          'only in Europe',
          'at any time, including early',
          'only when in the money',
        ],
        answerIndex: 0,
        explanation:
          'European options exercise only at expiry; American options can be exercised any time up to expiry. The names are conventions, not geography.',
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────
  {
    id: 'parity',
    number: 2,
    title: 'Put-call parity',
    summary: 'The model-free arbitrage tying calls, puts, spot and the discounted strike together.',
    objectives: [
      'State put-call parity and the synthetic-forward intuition behind it',
      'Price a put from a call (and spot a violation)',
      'Explain what real-world deviations actually compensate for',
    ],
    quiz: [
      {
        id: 'p1',
        type: 'mcq',
        prompt: 'Put-call parity is best described as…',
        choices: [
          'a model-free arbitrage relationship',
          'a consequence of the Black-Scholes formula',
          'an approximation that holds only for ATM options',
          'a rule that depends on the stock’s expected return',
        ],
        answerIndex: 0,
        explanation:
          'Parity follows from no-arbitrage alone — it assumes nothing about volatility, distributions, or drift. Black-Scholes must obey it, not the other way round.',
      },
      {
        id: 'p2',
        type: 'numeric',
        prompt:
          'Zero rates, no dividends. Spot = £100, strike = £100. The call trades at £8. What is the parity-consistent put price (£)?',
        answer: 8,
        tolerance: 0.01,
        unit: '£',
        explanation:
          'C − P = S − K = 100 − 100 = 0, so P = C = £8. With zero rates and an ATM strike, the call and put must be equal.',
      },
      {
        id: 'p3',
        type: 'mcq',
        prompt: 'C − P (long call, short put at the same strike) has the same payoff as…',
        choices: [
          'a forward contract to buy the stock at the strike',
          'owning a risk-free bond',
          'a short position in the stock',
          'a straddle',
        ],
        answerIndex: 0,
        explanation:
          'Above the strike you exercise the call; below it the short put is exercised against you — either way you buy the stock at K. That is a synthetic long forward.',
      },
      {
        id: 'p4',
        type: 'numeric',
        prompt:
          'Spot = £100 and the present value of the £100 strike is £95. The call trades at £8. What put price does parity imply (£)?',
        answer: 3,
        tolerance: 0.01,
        unit: '£',
        explanation: 'C − P = S − PV(K) = 100 − 95 = 5, so P = C − 5 = 8 − 5 = £3.',
      },
      {
        id: 'p5',
        type: 'mcq',
        prompt:
          'You observe C − P > S − PV(K): the call is rich relative to the put. The arbitrage (a "conversion") is to…',
        choices: [
          'sell the call, buy the put, buy the stock',
          'buy the call, sell the put, short the stock',
          'buy the call and the put',
          'sell both the call and the put',
        ],
        answerIndex: 0,
        explanation:
          'Sell the expensive side (call), buy the cheap side (put), and buy the stock to deliver at the strike — locking in the mispricing risk-free.',
      },
      {
        id: 'p6',
        type: 'mcq',
        prompt: 'A persistent real-world parity "violation" most often reflects…',
        choices: [
          'dividends, borrow costs, or early-exercise value — not free money',
          'a genuine risk-free profit left on the table',
          'an error in the parity relationship itself',
          'high implied volatility',
        ],
        answerIndex: 0,
        explanation:
          'In liquid markets true arbitrage vanishes in seconds. A standing gap usually pays for dividends, hard-to-borrow stock, funding, or American early-exercise value.',
      },
      {
        id: 'p7',
        type: 'mcq',
        prompt: 'Parity implies that a call and a put at the same strike and expiry must share the same…',
        choices: ['implied volatility', 'delta', 'premium', 'gamma'],
        answerIndex: 0,
        explanation:
          'Because the call and put are linked by a model-free identity, a single implied volatility prices both — otherwise the conversion arbitrage would exist.',
      },
      {
        id: 'p8',
        type: 'numeric',
        prompt:
          'Zero rates. A 100-strike call is £7 and the 100-strike put is £5. What spot price does parity imply (£)?',
        answer: 102,
        tolerance: 0.01,
        unit: '£',
        explanation: 'S = C − P + PV(K) = 7 − 5 + 100 = £102 (a synthetic long stock from the options).',
      },
      {
        id: 'p9',
        type: 'mcq',
        prompt: 'Long call + short put at the same strike and expiry creates a synthetic…',
        choices: ['long stock (forward)', 'short stock', 'long bond', 'covered call'],
        answerIndex: 0,
        explanation:
          'It replicates buying the stock forward at the strike — the foundation of the parity relationship.',
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────
  {
    id: 'greeks',
    number: 3,
    title: 'The Greeks',
    summary: 'Delta, gamma, vega, theta, rho — the sensitivities a trader actually manages.',
    objectives: [
      'Interpret each Greek as a sensitivity and a hedge ratio',
      'Reason about the sign of each Greek for long vs short positions',
      'Use delta as an approximate probability and a hedge',
    ],
    quiz: [
      {
        id: 'g1',
        type: 'mcq',
        prompt: 'The delta of an at-the-money call is approximately…',
        choices: ['0.5', '0', '1', '−0.5'],
        answerIndex: 0,
        explanation:
          'ATM, an upward or downward move is roughly a coin flip, so delta sits near 0.5 — the call behaves like holding half a share.',
      },
      {
        id: 'g2',
        type: 'mcq',
        prompt: 'Gamma measures…',
        choices: [
          'how fast delta changes as the underlying moves',
          'sensitivity to implied volatility',
          'time decay per day',
          'sensitivity to interest rates',
        ],
        answerIndex: 0,
        explanation:
          'Gamma is the rate of change of delta with respect to spot — the curvature (convexity) of the position.',
      },
      {
        id: 'g3',
        type: 'mcq',
        prompt: 'A long option position is…',
        choices: [
          'long gamma and short theta',
          'short gamma and long theta',
          'long gamma and long theta',
          'short gamma and short theta',
        ],
        answerIndex: 0,
        explanation:
          'Owning options gives you convexity (long gamma) but you pay for it through time decay (short/negative theta). The two are two sides of the same coin.',
      },
      {
        id: 'g4',
        type: 'mcq',
        prompt: 'Vega measures sensitivity to…',
        choices: ['implied volatility', 'the underlying price', 'time', 'dividends'],
        answerIndex: 0,
        explanation:
          'Vega is the change in option value per change in implied volatility. Long options are long vega.',
      },
      {
        id: 'g5',
        type: 'mcq',
        prompt: 'Gamma is largest for an option that is…',
        choices: [
          'at the money and close to expiry',
          'deep in the money with long to expiry',
          'deep out of the money',
          'far from expiry and at the money',
        ],
        answerIndex: 0,
        explanation:
          'Delta flips fastest from ~0 to ~1 right around the strike as expiry nears — exactly where gamma peaks and hedging gets frantic.',
      },
      {
        id: 'g6',
        type: 'numeric',
        prompt:
          'You are long one call with delta 0.6 (one contract = one share). How many shares do you SHORT to be delta-neutral?',
        answer: 0.6,
        tolerance: 0.01,
        explanation:
          'Delta-hedging neutralises first-order spot risk: short 0.6 shares against a +0.6 delta so the net delta is zero.',
      },
      {
        id: 'g7',
        type: 'mcq',
        prompt: 'The delta of a (long) put ranges over…',
        choices: ['−1 to 0', '0 to 1', '−1 to 1', '0 to 0.5'],
        answerIndex: 0,
        explanation:
          'A put loses value as spot rises, so its delta is negative — from 0 (deep OTM) to −1 (deep ITM).',
      },
      {
        id: 'g8',
        type: 'mcq',
        prompt: 'Delta is often read as the risk-neutral probability of finishing in the money. This approximation is loosest for…',
        choices: [
          'long-dated, high-volatility options',
          'short-dated, low-volatility options',
          'at-the-money options near expiry',
          'deep in-the-money options',
        ],
        answerIndex: 0,
        explanation:
          'Delta is N(d₁) while P(ITM) is N(d₂); they differ by σ√T, which is large precisely for long-dated, high-vol options.',
      },
      {
        id: 'g9',
        type: 'numeric',
        prompt:
          'A call has delta 0.4. The underlying rises £2. Approximately how much does the option’s value change (£)?',
        answer: 0.8,
        tolerance: 0.01,
        unit: '£',
        explanation: 'First-order change ≈ delta × move = 0.4 × 2 = £0.80 (ignoring gamma).',
      },
      {
        id: 'g10',
        type: 'mcq',
        prompt: 'Theta for a typical long option position is…',
        choices: [
          'negative — value bleeds away as time passes',
          'positive — value grows as time passes',
          'always zero',
          'positive only when in the money',
        ],
        answerIndex: 0,
        explanation:
          'All else equal, an option loses time value as expiry approaches, so the holder’s theta is negative (you pay rent to own convexity).',
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────
  {
    id: 'black-scholes',
    number: 4,
    title: 'The Black-Scholes model',
    summary: 'Replication, risk-neutral pricing, and why direction drops out of the formula.',
    objectives: [
      'Explain Black-Scholes as the cost of replicating an option',
      'Know which inputs matter — and which famously does not',
      'Read implied volatility as the model run in reverse',
    ],
    quiz: [
      {
        id: 'bs1',
        type: 'mcq',
        prompt: 'The central insight of Black-Scholes is that an option…',
        choices: [
          'can be replicated by continuously trading the underlying',
          'is always priced by supply and demand alone',
          'cannot be hedged',
          'pays the expected future payoff with no discounting',
        ],
        answerIndex: 0,
        explanation:
          'If you can manufacture the payoff by holding delta shares and rebalancing, the price must equal that manufacturing cost — or it is an arbitrage.',
      },
      {
        id: 'bs2',
        type: 'mcq',
        prompt: 'Which input does NOT appear in the Black-Scholes formula?',
        choices: [
          'the expected return (drift) of the stock',
          'the volatility of the stock',
          'the risk-free rate',
          'time to expiry',
        ],
        answerIndex: 0,
        explanation:
          'Hedging removes directional exposure, so the stock’s expected return cancels out. Only volatility, rates, time, spot and strike remain.',
      },
      {
        id: 'bs3',
        type: 'mcq',
        prompt: 'Black-Scholes assumes volatility is…',
        choices: [
          'constant and known',
          'random and mean-reverting',
          'zero',
          'equal to the stock’s expected return',
        ],
        answerIndex: 0,
        explanation:
          'The model assumes a single constant volatility. Reality (the vol surface) violates this, which is exactly why implied vol varies by strike and expiry.',
      },
      {
        id: 'bs4',
        type: 'numeric',
        prompt:
          'Rule of thumb: an ATM option ≈ 0.4·S·σ·√T. With S = £100, σ = 20%, T = 1 year, estimate the price (£).',
        answer: 8,
        tolerance: 0.5,
        unit: '£',
        explanation:
          '0.4 × 100 × 0.20 × √1 = £8. The exact Black-Scholes value here is about £7.97 — the approximation is excellent at the money.',
      },
      {
        id: 'bs5',
        type: 'mcq',
        prompt: 'In practice, options traders mostly quote and think in terms of…',
        choices: [
          'implied volatility',
          'the option’s cash price only',
          'the stock’s expected return',
          'gamma',
        ],
        answerIndex: 0,
        explanation:
          'Price and implied vol are interchangeable through the formula, but vol is the more stable, comparable language — so desks quote vol.',
      },
      {
        id: 'bs6',
        type: 'mcq',
        prompt: 'Which Black-Scholes assumption most clearly fails in real markets?',
        choices: [
          'prices move continuously with no jumps',
          'the strike is fixed',
          'time moves forward',
          'the option has a defined expiry',
        ],
        answerIndex: 0,
        explanation:
          'Real prices gap and jump (earnings, news, crashes), breaking the continuous-diffusion assumption — one reason skew exists.',
      },
      {
        id: 'bs7',
        type: 'numeric',
        prompt:
          'With zero interest rates and spot = strike, the ATM call is worth £7.97. By parity and symmetry, what is the ATM put worth (£)?',
        answer: 7.97,
        tolerance: 0.05,
        unit: '£',
        explanation:
          'With r = 0 and S = K, parity gives C − P = S − K = 0, so the put equals the call: £7.97.',
      },
      {
        id: 'bs8',
        type: 'mcq',
        prompt: 'Risk-neutral pricing is legitimate because…',
        choices: [
          'hedging/replication lets you manufacture the payoff regardless of investors’ risk preferences',
          'all investors are genuinely indifferent to risk',
          'stocks really do grow at the risk-free rate',
          'volatility is always zero',
        ],
        answerIndex: 0,
        explanation:
          'It is a pricing device, not a belief about the world: because the payoff can be replicated, its price is the same as if everyone were risk-neutral.',
      },
      {
        id: 'bs9',
        type: 'mcq',
        prompt: 'Implied volatility is…',
        choices: [
          'the volatility that makes the model price equal the market price',
          'the historical volatility of past returns',
          'always equal to realised volatility',
          'the volatility assumed by the stock’s management',
        ],
        answerIndex: 0,
        explanation:
          'You invert Black-Scholes: feed in the market price and solve for the σ that reproduces it. That σ is the implied volatility.',
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────
  {
    id: 'volatility',
    number: 5,
    title: 'Volatility & implied vol',
    summary: 'Realised vs implied, the smile and skew, term structure, and the vol surface.',
    objectives: [
      'Distinguish realised from implied volatility',
      'Explain the equity skew and why it exists',
      'Translate an annualised vol into a rough daily move',
    ],
    quiz: [
      {
        id: 'v1',
        type: 'mcq',
        prompt: 'Implied volatility differs from realised volatility in that implied vol is…',
        choices: [
          'forward-looking, backed out of option prices',
          'measured from past returns',
          'always larger',
          'set by the exchange',
        ],
        answerIndex: 0,
        explanation:
          'Realised vol is computed from historical returns; implied vol is the market’s forward-looking estimate, extracted from current option prices.',
      },
      {
        id: 'v2',
        type: 'mcq',
        prompt: 'Equity index options typically display a "skew", meaning…',
        choices: [
          'OTM puts carry higher implied vol than OTM calls',
          'all strikes share the same implied vol',
          'OTM calls carry higher implied vol than OTM puts',
          'implied vol falls to zero away from the money',
        ],
        answerIndex: 0,
        explanation:
          'Downside protection is in demand and crashes are faster than rallies, so low-strike puts trade at higher implied vol — a downward-sloping skew.',
      },
      {
        id: 'v3',
        type: 'mcq',
        prompt: 'Being long an option means you are long vega, so you profit if…',
        choices: [
          'implied volatility rises',
          'implied volatility falls',
          'the stock pays a dividend',
          'time passes with no move',
        ],
        answerIndex: 0,
        explanation:
          'Higher implied vol raises option prices; a long-vega position gains when the market reprices vol upward.',
      },
      {
        id: 'v4',
        type: 'mcq',
        prompt: 'The volatility surface plots implied volatility against…',
        choices: [
          'strike (moneyness) and time to expiry',
          'price and volume',
          'delta and gamma',
          'spot and the risk-free rate',
        ],
        answerIndex: 0,
        explanation:
          'The surface is implied vol as a function of two coordinates: moneyness/strike (the smile/skew) and expiry (the term structure).',
      },
      {
        id: 'v5',
        type: 'mcq',
        prompt: 'A commonly cited driver of equity skew is…',
        choices: [
          'demand for crash protection and the leverage effect',
          'options being European rather than American',
          'zero interest rates',
          'the absence of dividends',
        ],
        answerIndex: 0,
        explanation:
          'Investors pay up for downside puts (insurance), and falling prices raise leverage and volatility — both steepen the downside skew.',
      },
      {
        id: 'v6',
        type: 'mcq',
        prompt: 'If you believe realised vol will exceed the implied vol priced into options, you should…',
        choices: [
          'buy options (go long vol/gamma) and delta-hedge',
          'sell options (go short vol)',
          'do nothing — vol views are not tradeable',
          'buy the stock outright',
        ],
        answerIndex: 0,
        explanation:
          'A delta-hedged long-option position profits when realised vol beats the implied vol you paid — that is the core long-gamma trade.',
      },
      {
        id: 'v7',
        type: 'mcq',
        prompt: 'ATM implied vol is essentially the market’s expectation of the…',
        choices: [
          'magnitude of future moves, not their direction',
          'direction of the next move',
          'dividend yield',
          'risk-free rate',
        ],
        answerIndex: 0,
        explanation:
          'Options price movement, not direction. ATM IV is the market’s estimate of how much the underlying will move, either way.',
      },
      {
        id: 'v8',
        type: 'numeric',
        prompt:
          'Using √252 ≈ 16 trading days, a stock with 16% annualised volatility has a daily move of roughly what percent?',
        answer: 1,
        tolerance: 0.2,
        unit: '%',
        explanation:
          'Daily vol ≈ annual vol ÷ √252 ≈ 16% ÷ 16 = 1%. The "divide annual vol by 16" shortcut is a desk staple.',
      },
      {
        id: 'v9',
        type: 'mcq',
        prompt: 'A vol term structure in "backwardation" (short-dated IV above long-dated) typically signals…',
        choices: [
          'near-term stress or an imminent event',
          'a calm market with no catalysts',
          'that long-dated options are mispriced',
          'zero volatility',
        ],
        answerIndex: 0,
        explanation:
          'Elevated short-dated vol usually reflects an imminent event or acute stress; in calm markets the curve normally slopes up (contango).',
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────
  {
    id: 'hedging',
    number: 6,
    title: 'Delta-hedging & replication',
    summary: 'Dynamic hedging, gamma scalping, and the theta you pay for convexity.',
    objectives: [
      'Describe how a delta hedge is maintained as spot moves',
      'Explain gamma scalping and the gamma–theta trade-off',
      'Connect replication back to risk-neutral pricing',
    ],
    quiz: [
      {
        id: 'h1',
        type: 'mcq',
        prompt: 'To delta-hedge a long call you…',
        choices: [
          'short delta units of the underlying',
          'buy delta units of the underlying',
          'buy a second call',
          'sell a put',
        ],
        answerIndex: 0,
        explanation:
          'Hold −delta of the underlying against the +delta option so the combined first-order spot exposure is zero.',
      },
      {
        id: 'h2',
        type: 'mcq',
        prompt: 'A long-gamma, delta-hedged position makes money by…',
        choices: [
          'rebalancing the hedge — effectively buying low and selling high as spot oscillates',
          'collecting time decay',
          'holding the hedge fixed forever',
          'paying no transaction costs',
        ],
        answerIndex: 0,
        explanation:
          'Positive gamma means delta grows as spot rises and shrinks as it falls, so rebalancing forces you to sell into rallies and buy dips — "gamma scalping".',
      },
      {
        id: 'h3',
        type: 'mcq',
        prompt: 'The cost of holding a long-gamma position is…',
        choices: [
          'paying theta (time decay)',
          'collecting theta',
          'paying nothing',
          'unlimited downside in the stock',
        ],
        answerIndex: 0,
        explanation:
          'Convexity is not free: you pay theta each day. The long-gamma trade wins only if realised movement earns back more than the theta paid.',
      },
      {
        id: 'h4',
        type: 'mcq',
        prompt: 'A delta-hedged long-option book is profitable overall when realised volatility…',
        choices: [
          'exceeds the implied volatility paid',
          'is below the implied volatility paid',
          'is exactly zero',
          'equals the risk-free rate',
        ],
        answerIndex: 0,
        explanation:
          'Gamma scalping P&L scales with realised variance, while the cost scales with implied. Realised > implied ⇒ net profit.',
      },
      {
        id: 'h5',
        type: 'mcq',
        prompt: 'As spot rises, a long call’s delta increases (positive gamma). To stay delta-neutral you must…',
        choices: [
          'short more shares',
          'buy more shares',
          'do nothing',
          'buy more calls',
        ],
        answerIndex: 0,
        explanation:
          'Higher delta means more positive exposure, so you sell/short additional shares — selling into the rally, which is the source of the scalping profit.',
      },
      {
        id: 'h6',
        type: 'mcq',
        prompt: 'Hedging discretely (e.g. once a day) rather than continuously leaves…',
        choices: [
          'residual gamma/path risk — a hedging error',
          'a perfect, risk-free hedge',
          'no exposure to the underlying at all',
          'exposure only to interest rates',
        ],
        answerIndex: 0,
        explanation:
          'Black-Scholes assumes continuous rebalancing. In practice you rebalance discretely, so big intra-period moves leave a residual P&L (the hedging error).',
      },
      {
        id: 'h7',
        type: 'mcq',
        prompt: 'A short-gamma, delta-hedged book…',
        choices: [
          'collects theta but loses on large moves (forced to buy high, sell low)',
          'pays theta and profits from large moves',
          'has no exposure to realised volatility',
          'is identical to being long the stock',
        ],
        answerIndex: 0,
        explanation:
          'Short gamma is the mirror image: you earn theta in calm markets but rebalancing forces you to chase the move, bleeding money when realised vol is high.',
      },
      {
        id: 'h8',
        type: 'mcq',
        prompt: 'Why does replication legitimise risk-neutral pricing?',
        choices: [
          'the payoff can be manufactured, so its price must equal the manufacturing cost (no-arbitrage)',
          'investors are genuinely indifferent to risk',
          'the stock grows at the risk-free rate in reality',
          'volatility is constant in reality',
        ],
        answerIndex: 0,
        explanation:
          'Because a hedging strategy reproduces the payoff exactly, its fair price is the cost of that strategy — independent of anyone’s risk appetite.',
      },
      {
        id: 'h9',
        type: 'numeric',
        prompt:
          'You are long a call (delta 0.5) hedged by shorting 0.5 shares. Spot jumps from £100 to £102. What is the approximate FIRST-ORDER P&L of the hedged position (£)?',
        answer: 0,
        tolerance: 0.1,
        unit: '£',
        explanation:
          'Option ≈ +0.5 × 2 = +£1.00; short shares ≈ −0.5 × 2 = −£1.00. First-order P&L ≈ £0 — any actual profit comes from gamma (the second-order term).',
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────
  {
    id: 'structures',
    number: 7,
    title: 'Strategies, American options & exotics',
    summary: 'Spreads and combos, early-exercise logic, and a first look at exotic payoffs.',
    objectives: [
      'Build and reason about spreads, straddles, and butterflies',
      'Apply the early-exercise rules for American calls and puts',
      'Recognise digital and barrier option payoffs',
    ],
    quiz: [
      {
        id: 's1',
        type: 'mcq',
        prompt: 'A bull call spread (long a lower-strike call, short a higher-strike call) has…',
        choices: [
          'capped profit and capped loss',
          'unlimited profit and capped loss',
          'capped profit and unlimited loss',
          'unlimited profit and unlimited loss',
        ],
        answerIndex: 0,
        explanation:
          'The short higher-strike call caps the upside; the net premium caps the downside. Both ends are bounded.',
      },
      {
        id: 's2',
        type: 'numeric',
        prompt:
          'Bull call spread: long the 95 call at £7, short the 105 call at £3. What is the maximum profit (£)?',
        answer: 6,
        tolerance: 0.01,
        unit: '£',
        explanation:
          'Net cost = 7 − 3 = £4. Max payoff = strike width = 105 − 95 = £10. Max profit = 10 − 4 = £6.',
      },
      {
        id: 's3',
        type: 'numeric',
        prompt: 'For that same 95/105 bull call spread (net cost £4), what is the maximum loss (£)?',
        answer: 4,
        tolerance: 0.01,
        unit: '£',
        explanation:
          'If both calls expire worthless (spot ≤ 95) you lose only the £4 net premium paid.',
      },
      {
        id: 's4',
        type: 'mcq',
        prompt: 'A long straddle (long a call and a put at the same strike) profits when…',
        choices: [
          'the underlying makes a large move in either direction',
          'the underlying stays pinned at the strike',
          'implied volatility falls',
          'time passes quietly',
        ],
        answerIndex: 0,
        explanation:
          'A straddle is long volatility — it pays off on a big move up or down, and is hurt by a quiet market (theta) or falling IV.',
      },
      {
        id: 's5',
        type: 'numeric',
        prompt: 'You buy the 100-strike straddle for £10 total. What is the UPPER breakeven price (£)?',
        answer: 110,
        tolerance: 0.01,
        unit: '£',
        explanation:
          'Breakevens are strike ± total premium = 100 ± 10, i.e. 90 and 110. The upper breakeven is £110.',
      },
      {
        id: 's6',
        type: 'mcq',
        prompt: 'A long butterfly is essentially a bet that the underlying will…',
        choices: [
          'finish near the middle strike (low movement)',
          'make a large move in either direction',
          'trend strongly upward',
          'pay a large dividend',
        ],
        answerIndex: 0,
        explanation:
          'A butterfly (long the wings, short twice the body) is a cheap, defined-risk bet that the underlying pins the central strike.',
      },
      {
        id: 's7',
        type: 'mcq',
        prompt: 'For an American call on a NON-dividend-paying stock, early exercise is…',
        choices: [
          'never optimal — better to sell the option',
          'always optimal once in the money',
          'optimal only at the money',
          'optimal when rates are zero',
        ],
        answerIndex: 0,
        explanation:
          'Exercising early throws away remaining time value and pays the strike sooner. With no dividend to capture, selling the call always beats exercising.',
      },
      {
        id: 's8',
        type: 'mcq',
        prompt: 'Early exercise of an American PUT can be optimal when it is…',
        choices: [
          'deep in the money, especially when rates are high',
          'out of the money',
          'at the money with long to expiry',
          'never, under any circumstances',
        ],
        answerIndex: 0,
        explanation:
          'A deep-ITM put behaves like a short forward; exercising early lets you collect and reinvest the strike. Higher rates make that time-value-of-money benefit more compelling.',
      },
      {
        id: 's9',
        type: 'mcq',
        prompt: 'A digital (binary) option pays…',
        choices: [
          'a fixed amount if it finishes in the money, otherwise nothing',
          'the full intrinsic value, like a vanilla option',
          'a payment that grows linearly with the underlying',
          'only if the barrier is breached',
        ],
        answerIndex: 0,
        explanation:
          'A digital is all-or-nothing: a fixed cash (or asset) payout if ITM at expiry, zero otherwise — a step-function payoff.',
      },
      {
        id: 's10',
        type: 'mcq',
        prompt: 'A knock-out barrier option…',
        choices: [
          'ceases to exist if the underlying touches the barrier',
          'comes into existence only if the barrier is touched',
          'always pays double at expiry',
          'can never expire worthless',
        ],
        answerIndex: 0,
        explanation:
          'A knock-out is extinguished if the barrier is breached (its mirror, a knock-in, only activates on a breach). Barriers make options cheaper by adding a path condition.',
      },
    ],
  },
];

export const chapterById = (id: string): Chapter | undefined =>
  chapters.find((c) => c.id === id);

export const chapterIndex = (id: string): number => chapters.findIndex((c) => c.id === id);
