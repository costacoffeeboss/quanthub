import { H, KeyIdea, Example, InterviewAngle, prose } from '../lessonKit';

export default function Hedging() {
  return (
    <div className="space-y-12">
      <section className="space-y-3 max-w-3xl">
        <H>From a formula to a living strategy</H>
        <p className={prose}>
          Chapter 4 said an option’s price is the cost of a recipe that <em>copies</em> its payoff out of shares
          and cash. This chapter is about cooking that recipe in real time. The technique is called{' '}
          <strong>delta-hedging</strong>, and understanding it turns the Greeks from abstract numbers into a
          concrete money-making (and money-losing) machine.
        </p>
        <p className={prose}>
          It also closes a loop: by the end you will see <em>why</em> a delta-hedged option position makes or
          loses money, and why that depends on the tug-of-war between realised and implied volatility you met
          in Chapter 5.
        </p>
      </section>

      <section className="space-y-4 max-w-3xl">
        <H>Cancelling out direction</H>
        <p className={prose}>
          Recall delta is the share-equivalent of an option. If you own a call with delta 0.5, you behave like
          someone holding half a share — you make money when the stock rises, lose when it falls. To remove
          that directional exposure, you hold the opposite in stock: <strong>short 0.5 shares</strong>. Now a
          small move up gains on the option but loses on the short shares, roughly cancelling. You are{' '}
          <strong>delta-neutral</strong>.
        </p>
        <Example title="The hedge is only momentary">
          <p>Long a call, delta 0.5, hedged by shorting 0.5 shares. The stock jumps £100 → £102.</p>
          <p>Option gains ≈ 0.5 × £2 = +£1.00. Short shares lose ≈ 0.5 × £2 = −£1.00.</p>
          <p>First-order profit ≈ <strong>£0</strong>. So far, so pointless — the hedge cancelled everything. The magic is in what happens <em>next</em>.</p>
        </Example>
      </section>

      <section className="space-y-4 max-w-3xl">
        <H>Gamma scalping: where the profit hides</H>
        <p className={prose}>
          Here is the subtlety. After the stock rose to £102, your call’s delta is no longer 0.5 — because you
          are long gamma, the delta has grown, say to 0.6. But you are still only short 0.5 shares, so you are
          now <em>net long</em> 0.1 deltas. To get back to neutral you <strong>sell 0.1 more shares at the high
          price of £102</strong>.
        </p>
        <p className={prose}>
          Now imagine the stock falls back to £100. Delta drops back toward 0.5, leaving you <em>over-hedged</em>,
          so you <strong>buy 0.1 shares back — at the lower price</strong>. You sold high and bought low, and
          pocketed the difference. Repeat this every time the stock wiggles and the small profits add up. This
          is <strong>gamma scalping</strong>: positive gamma forces you to trade in the profitable direction.
        </p>
        <KeyIdea>
          A delta-hedged long-option position is a machine that automatically buys low and sells high as the
          stock oscillates. The more the stock actually moves, the more you scalp. Your profit is powered by{' '}
          <strong>realised volatility</strong>.
        </KeyIdea>
      </section>

      <section className="space-y-4 max-w-3xl">
        <H>The catch: you’re paying rent</H>
        <p className={prose}>
          If gamma scalping were free money, everyone would do it forever. It is not — because every day you
          hold that long option, you pay <strong>theta</strong> (time decay). The option you bought is quietly
          losing value as expiry approaches. So the position is a race:
        </p>
        <ul className="space-y-1.5 text-sm text-muted list-disc pl-5">
          <li>Scalping profits grow with how much the stock <strong>actually moves</strong> (realised vol).</li>
          <li>Theta costs are fixed by how much movement was <strong>priced in</strong> when you bought (implied vol).</li>
        </ul>
        <KeyIdea>
          A delta-hedged long-option position makes money overall precisely when <strong>realised volatility
          exceeds the implied volatility you paid</strong>. You bought movement at the “implied” price; you get
          paid back at the “realised” rate. Beat the spread and you win.
        </KeyIdea>
      </section>

      <section className="space-y-4 max-w-3xl">
        <H>The mirror image: being short gamma</H>
        <p className={prose}>
          Sell options and delta-hedge, and everything flips. You <em>collect</em> theta every day — pleasant in
          a quiet market. But you are now <strong>short gamma</strong>, which means re-hedging forces you to do
          the opposite of scalping: as the stock rises your delta gets more negative, so you must{' '}
          <strong>buy shares high</strong>; as it falls you <strong>sell low</strong>. A big move bleeds you
          badly. Short-gamma traders earn small, steady income and live in fear of the day the market gaps —
          “picking up pennies in front of a steamroller.”
        </p>
      </section>

      <section className="space-y-4 max-w-3xl">
        <H>Why the textbook hedge is never perfect</H>
        <p className={prose}>
          Black-Scholes assumes you re-hedge <em>continuously</em>. In reality you rebalance at intervals — once
          a day, or when delta drifts past a threshold. Between rebalances the stock can move a lot, and a big
          gap (think a profit warning overnight) can blow straight through your stale hedge. That residual is
          called <strong>hedging error</strong>, and it is the gap between the clean theory and messy practice.
          The smoother and more frequent your hedging, the closer you get to the Black-Scholes ideal — at the
          cost of more transactions.
        </p>
      </section>

      <section className="space-y-4 max-w-3xl">
        <H>Closing the loop: why replication justifies the price</H>
        <p className={prose}>
          Step back and admire the whole structure. Because a delta-hedging strategy can <em>manufacture</em> the
          option’s payoff, the option’s fair price must equal the cost of running that strategy — no more, no
          less, or arbitrage appears. That is what makes the Black-Scholes price legitimate, and what makes
          “risk-neutral pricing” more than a trick: the hedge removes risk, so risk preferences cannot enter the
          price. Hedging is the bridge between the messy real world and the clean formula.
        </p>
      </section>

      <section className="max-w-3xl">
        <InterviewAngle>
          A favourite question: “You buy an option and delta-hedge it — when do you make money?” The crisp
          answer is “when realised vol beats the implied vol I paid,” followed by the gamma-scalping mechanism
          (long gamma forces buy-low/sell-high; theta is the cost). Be ready to flip it to the short-gamma side,
          and to mention that discrete hedging leaves residual risk. This question separates people who
          memorised the Greeks from people who understand them.
        </InterviewAngle>
      </section>
    </div>
  );
}
