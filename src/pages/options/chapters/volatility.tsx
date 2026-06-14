import { H3, Formula, KeyIdea, Example, PlainEnglish, InterviewAngle, SkewChart, SubSection, prose } from '../lessonKit';
import type { QuizQuestion } from '../../../data/optionsCourse';

const checks_5_1: QuizQuestion[] = [
  {
    id: 'chk-vol-1a',
    type: 'mcq',
    prompt: 'Which statement correctly distinguishes realised from implied volatility?',
    choices: [
      'Realised vol looks backward at actual past returns; implied vol looks forward and is backed out of today’s option prices.',
      'Realised vol is forward-looking; implied vol is the measured wobbliness of past returns.',
      'Both describe the same thing measured over different stocks.',
      'Implied vol is always larger than realised vol by definition.',
    ],
    answerIndex: 0,
    explanation:
      'Realised (historical) volatility measures past returns — it already happened. Implied volatility is the market’s forward expectation, extracted from current option prices.',
  },
  {
    id: 'chk-vol-1b',
    type: 'mcq',
    prompt: 'A stock is described as having 20% annual volatility. What does this most directly tell you?',
    choices: [
      'The stock will rise about 20% this year.',
      'The standard deviation of its returns is about 20% per year, so it tends to end within roughly ±20% of a calm path.',
      'The stock pays a 20% dividend.',
      'The stock will fall about 20% this year.',
    ],
    answerIndex: 1,
    explanation:
      'Volatility is the standard deviation of returns (quoted per year), a measure of how much the price bounces around — not a directional forecast.',
  },
];

const checks_5_2: QuizQuestion[] = [
  {
    id: 'chk-vol-2a',
    type: 'numeric',
    prompt: 'A stock has 32% annualised volatility. Using the desk “÷16” rule, roughly what is its typical daily move (in %)?',
    answer: 2,
    tolerance: 0.2,
    unit: '%',
    explanation:
      'Volatility scales with √time, and √252 ≈ 16, so daily move ≈ annual vol ÷ 16. Here 32% ÷ 16 = 2%.',
  },
  {
    id: 'chk-vol-2b',
    type: 'mcq',
    prompt: 'Why can implied vol — and therefore option prices — jump before an event even though the stock has not moved yet?',
    choices: [
      'Because the option’s price is a quote on expected future movement, so anticipated swings raise it now.',
      'Because dividends are paid before earnings.',
      'Because realised vol must always equal implied vol.',
      'Because the VIX forces all single-stock options higher.',
    ],
    answerIndex: 0,
    explanation:
      'Options pay off on movement, so their price is a quote on how much movement is expected. Fear before earnings or elections lifts implied vol — and option prices — before any move occurs. The VIX is just S&P 500 implied vol.',
  },
];

const checks_5_3: QuizQuestion[] = [
  {
    id: 'chk-vol-3a',
    type: 'mcq',
    prompt: 'For equity indices, the implied-vol curve plotted against strike typically shows what shape?',
    choices: [
      'A flat line, exactly as Black-Scholes assumes.',
      'A downward-sloping skew, where low-strike puts carry higher implied vol than high-strike calls.',
      'An upward-sloping skew, where high-strike calls carry the highest implied vol.',
      'A random scatter with no pattern.',
    ],
    answerIndex: 1,
    explanation:
      'If Black-Scholes held literally, every strike would imply one flat vol. In practice equity indices show a downward skew: low-strike (downside put) strikes trade at richer implied vol.',
  },
  {
    id: 'chk-vol-3b',
    type: 'mcq',
    prompt: 'Which pair of forces explains why equities skew downward?',
    choices: [
      'Dividend timing and stock buybacks.',
      'Demand for crash protection (downside put buying) and the leverage effect (falling prices make equity riskier).',
      'Interest-rate changes and inflation alone.',
      'High-strike call demand and contango.',
    ],
    answerIndex: 1,
    explanation:
      'Structurally-long investors buy downside puts as insurance, bidding up low-strike implied vol; and as a share price falls, debt grows relative to equity, making down-moves genuinely more violent.',
  },
];

const checks_5_4: QuizQuestion[] = [
  {
    id: 'chk-vol-4a',
    type: 'mcq',
    prompt: 'You believe a stock will realise more movement than its options are priced for. What do you do?',
    choices: [
      'Sell options to collect premium, because you are short vol.',
      'Buy options (long vol/vega/gamma) and delta-hedge to profit from the movement itself.',
      'Buy the stock outright and hold it.',
      'Do nothing — realised vol cannot beat implied vol.',
    ],
    answerIndex: 1,
    explanation:
      'Expecting realised to beat implied means going long volatility: buy options and neutralise direction by delta-hedging, so you profit from the size of moves, not their direction.',
  },
  {
    id: 'chk-vol-4b',
    type: 'mcq',
    prompt: 'What does being “short options / short volatility” mean for your view?',
    choices: [
      'You win if the world turns out calmer than the implied vol you sold at.',
      'You win only if the stock rises.',
      'You win if the world turns out wilder than implied.',
      'Your payoff does not depend on volatility at all.',
    ],
    answerIndex: 0,
    explanation:
      'Short options = short volatility: you collect premium and profit if realised movement comes in below the implied vol you bet against. Long options is the opposite — you win if it turns out wilder.',
  },
];

export default function Volatility() {
  return (
    <div className="space-y-12">
      <SubSection n="5.1" title="What volatility is, and its two flavours" check={checks_5_1}>
        <div className="max-w-3xl space-y-3">
          <p className={prose}>
            Volatility is a measure of how much a price bounces around — formally, the standard deviation of its
            returns, usually quoted per year as a percentage. A stock with 20% annual volatility tends to end the
            year within about ±20% of where a calm path would land. Low-vol names plod; high-vol names lurch.
          </p>
          <p className={prose}>
            Volatility is the heartbeat of options, because — as we saw in Chapter 4 — an option’s price depends
            on how much the underlying moves, not which way. Everything in options trading eventually comes back
            to a view on volatility.
          </p>
        </div>
        <div className="max-w-3xl space-y-4">
          <H3>Realised vs implied</H3>
          <ul className="space-y-2 text-sm text-muted list-disc pl-5">
            <li><strong className="text-fg">Realised (or historical) volatility</strong> looks <em>backward</em>: it is the actual, measured wobbliness of past returns. It already happened.</li>
            <li><strong className="text-fg">Implied volatility</strong> looks <em>forward</em>: it is the market’s expectation of future wobbliness, backed out of today’s option prices (the “run-it-backwards” trick from Chapter 4).</li>
          </ul>
          <PlainEnglish>
            Realised vol is the weather report for yesterday. Implied vol is today’s forecast for tomorrow,
            expressed through what people are willing to pay for options right now. The gap between them is where
            a lot of options trading lives.
          </PlainEnglish>
        </div>
      </SubSection>

      <SubSection n="5.2" title="Sizing moves and pricing them" check={checks_5_2}>
        <div className="max-w-3xl space-y-4">
          <H3>A trader’s shortcut: from yearly to daily</H3>
          <p className={prose}>
            Volatility scales with the square root of time, so to turn an annual figure into a daily one you
            divide by the square root of the number of trading days (≈ 252). Conveniently, √252 ≈ 16.
          </p>
          <Formula>daily move ≈ annual vol ÷ 16</Formula>
          <Example>
            <p>A stock has 16% annualised volatility. Its typical daily move is about 16% ÷ 16 = <strong>1%</strong>.</p>
            <p>A 32%-vol stock? Roughly 2% a day. This “divide by 16” trick is a genuine desk reflex.</p>
          </Example>
        </div>
        <div className="max-w-3xl space-y-4">
          <H3>Implied vol is the price of movement</H3>
          <p className={prose}>
            Because options pay off on movement, their price <em>is</em> a quote on how much movement the market
            expects. When fear spikes — before earnings, around elections, during crises — implied vol jumps and
            options get expensive, even if the stock has not moved yet. When calm returns, implied vol sags. The
            “VIX” index you hear about on the news is just the implied volatility of S&amp;P 500 options: the
            market’s fear gauge.
          </p>
          <KeyIdea>
            At-the-money implied vol is essentially the market’s estimate of the <strong>magnitude</strong> of
            future moves — not their direction. High IV means “expect big swings, either way.”
          </KeyIdea>
        </div>
      </SubSection>

      <SubSection n="5.3" title="The smile, the skew, and the surface" check={checks_5_3}>
        <div className="max-w-3xl space-y-3">
          <p className={prose}>
            If Black-Scholes were literally true, every strike on the same stock would imply the same
            volatility — one number, flat across all strikes. It does not. When you plot implied vol against
            strike, you get a curve: a <strong>smile</strong> in some markets (FX, commodities), and for equity
            indices a downward-sloping <strong>skew</strong>, where low-strike puts trade at noticeably higher
            implied vol than high-strike calls.
          </p>
        </div>
        <div className="rounded-lg border border-steel bg-panel p-4 max-w-2xl">
          <SkewChart />
          <p className="mt-1 font-mono text-[10px] text-muted">
            Equity skew: downside (put) strikes carry richer implied vol than upside (call) strikes.
          </p>
        </div>
        <div className="max-w-3xl space-y-4">
          <H3>Why equities skew downward</H3>
          <p className={prose}>
            Two forces, working together:
          </p>
          <ul className="space-y-2 text-sm text-muted list-disc pl-5">
            <li><strong className="text-fg">Demand for crash protection.</strong> Big investors are structurally long stocks and buy downside puts as insurance. That persistent demand bids up the price — and therefore the implied vol — of low-strike puts.</li>
            <li><strong className="text-fg">The leverage effect.</strong> When a company’s share price falls, its debt becomes larger relative to its equity, making the equity riskier and more volatile. So down-moves genuinely tend to be more violent than up-moves — markets take the stairs up and the lift down.</li>
          </ul>
        </div>
        <div className="max-w-3xl space-y-4">
          <H3>The whole surface, and its term structure</H3>
          <p className={prose}>
            Add a second dimension — time to expiry — and the skew becomes the <strong>volatility surface</strong>:
            implied vol as a function of both strike and expiry. Slicing it the other way gives the{' '}
            <strong>term structure</strong>: how implied vol varies with maturity. In calm markets it usually
            slopes gently upward (“contango”). When something scary is imminent, near-dated vol spikes above
            long-dated vol and the curve inverts (“backwardation”) — the market is saying the danger is{' '}
            <em>now</em>.
          </p>
        </div>
      </SubSection>

      <SubSection n="5.4" title="How you actually trade a volatility view" check={checks_5_4}>
        <div className="max-w-3xl space-y-4">
          <p className={prose}>
            Suppose you think a stock will move <em>more</em> than its options are priced for — i.e. realised vol
            will beat implied. You <strong>buy</strong> options (you are long vol, long vega, long gamma) and
            neutralise the directional bet by delta-hedging, so you profit from movement itself. Think the
            opposite — that the market is overpaying for fear? You <strong>sell</strong> options and collect the
            premium. Exactly how that pays off mechanically is the subject of the next chapter.
          </p>
          <KeyIdea>
            Long options = long volatility = you win if the world turns out wilder than the price implied. Short
            options = short volatility = you win if it turns out calmer. The number in the middle that you are
            betting against is implied vol.
          </KeyIdea>
          <InterviewAngle>
            Expect “what is the difference between realised and implied vol?”, “why do equity options skew?”, and
            quick mental-maths like “a 32-vol stock — what is a one-day move?” Strong answers nail the
            forward/backward distinction, give <em>both</em> reasons for skew (insurance demand and the leverage
            effect), and reach instinctively for the ÷16 rule. Bonus points for mentioning that the VIX is just
            S&amp;P implied vol.
          </InterviewAngle>
        </div>
      </SubSection>
    </div>
  );
}
