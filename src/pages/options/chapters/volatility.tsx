import { H, Formula, KeyIdea, Example, PlainEnglish, InterviewAngle, SkewChart, prose } from '../lessonKit';

export default function Volatility() {
  return (
    <div className="space-y-12">
      <section className="space-y-3 max-w-3xl">
        <H>What “volatility” actually means</H>
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
      </section>

      <section className="space-y-4 max-w-3xl">
        <H>Two flavours: realised and implied</H>
        <ul className="space-y-2 text-sm text-muted list-disc pl-5">
          <li><strong className="text-fg">Realised (or historical) volatility</strong> looks <em>backward</em>: it is the actual, measured wobbliness of past returns. It already happened.</li>
          <li><strong className="text-fg">Implied volatility</strong> looks <em>forward</em>: it is the market’s expectation of future wobbliness, backed out of today’s option prices (the “run-it-backwards” trick from Chapter 4).</li>
        </ul>
        <PlainEnglish>
          Realised vol is the weather report for yesterday. Implied vol is today’s forecast for tomorrow,
          expressed through what people are willing to pay for options right now. The gap between them is where
          a lot of options trading lives.
        </PlainEnglish>
      </section>

      <section className="space-y-4 max-w-3xl">
        <H>A trader’s shortcut: from yearly to daily</H>
        <p className={prose}>
          Volatility scales with the square root of time, so to turn an annual figure into a daily one you
          divide by the square root of the number of trading days (≈ 252). Conveniently, √252 ≈ 16.
        </p>
        <Formula>daily move ≈ annual vol ÷ 16</Formula>
        <Example>
          <p>A stock has 16% annualised volatility. Its typical daily move is about 16% ÷ 16 = <strong>1%</strong>.</p>
          <p>A 32%-vol stock? Roughly 2% a day. This “divide by 16” trick is a genuine desk reflex.</p>
        </Example>
      </section>

      <section className="space-y-4 max-w-3xl">
        <H>Implied vol is the price of movement</H>
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
      </section>

      <section className="space-y-4">
        <div className="max-w-3xl space-y-3">
          <H>The smile and the skew</H>
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
      </section>

      <section className="space-y-4 max-w-3xl">
        <H>Why equities skew downward</H>
        <p className={prose}>
          Two forces, working together:
        </p>
        <ul className="space-y-2 text-sm text-muted list-disc pl-5">
          <li><strong className="text-fg">Demand for crash protection.</strong> Big investors are structurally long stocks and buy downside puts as insurance. That persistent demand bids up the price — and therefore the implied vol — of low-strike puts.</li>
          <li><strong className="text-fg">The leverage effect.</strong> When a company’s share price falls, its debt becomes larger relative to its equity, making the equity riskier and more volatile. So down-moves genuinely tend to be more violent than up-moves — markets take the stairs up and the lift down.</li>
        </ul>
      </section>

      <section className="space-y-4 max-w-3xl">
        <H>The whole surface, and its term structure</H>
        <p className={prose}>
          Add a second dimension — time to expiry — and the skew becomes the <strong>volatility surface</strong>:
          implied vol as a function of both strike and expiry. Slicing it the other way gives the{' '}
          <strong>term structure</strong>: how implied vol varies with maturity. In calm markets it usually
          slopes gently upward (“contango”). When something scary is imminent, near-dated vol spikes above
          long-dated vol and the curve inverts (“backwardation”) — the market is saying the danger is{' '}
          <em>now</em>.
        </p>
      </section>

      <section className="space-y-4 max-w-3xl">
        <H>How you actually trade a volatility view</H>
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
      </section>

      <section className="max-w-3xl">
        <InterviewAngle>
          Expect “what is the difference between realised and implied vol?”, “why do equity options skew?”, and
          quick mental-maths like “a 32-vol stock — what is a one-day move?” Strong answers nail the
          forward/backward distinction, give <em>both</em> reasons for skew (insurance demand and the leverage
          effect), and reach instinctively for the ÷16 rule. Bonus points for mentioning that the VIX is just
          S&amp;P implied vol.
        </InterviewAngle>
      </section>
    </div>
  );
}
