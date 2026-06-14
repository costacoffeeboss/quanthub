import BlackScholesLab from '../../../components/options/BlackScholesLab';
import { H, Formula, KeyIdea, Example, PlainEnglish, InterviewAngle, prose } from '../lessonKit';

export default function BlackScholes() {
  return (
    <div className="space-y-12">
      <section className="space-y-3 max-w-3xl">
        <H>The question Black-Scholes answers</H>
        <p className={prose}>
          We can now read payoffs and Greeks, but one question remains: <strong>what is the fair price of an
          option today?</strong> A call might pay off anywhere from zero to a fortune depending on an unknown
          future — so how could there possibly be a single correct price? The Black-Scholes model, which won a
          Nobel Prize, gives a startling answer. You do not need to forecast the future at all. You need only
          notice that an option can be <strong>copied</strong>.
        </p>
        <p className={prose}>
          We will skip the differential equations entirely. The intuition is what interviewers want, and it is
          genuinely beautiful.
        </p>
      </section>

      <section className="space-y-4 max-w-3xl">
        <H>The core idea: pricing by replication</H>
        <p className={prose}>
          Here is the trick. Suppose you have <em>sold</em> a call and you are nervous about it. You could
          protect yourself by holding some shares — and we know from Chapter 3 how many: <strong>delta</strong>{' '}
          shares. As the stock rises, delta rises, so you buy a few more shares; as it falls, delta falls, so
          you sell some. By continuously adjusting your share holding to match delta, you can manufacture a
          portfolio that <strong>tracks the option’s payoff exactly</strong>.
        </p>
        <KeyIdea>
          If you can build a recipe out of shares and cash that reproduces the option’s payoff in every
          scenario, then the option must cost exactly what that recipe costs. Otherwise someone buys the cheap
          one, sells the dear one, and earns a risk-free profit. Black-Scholes is simply the cost of that
          recipe.
        </KeyIdea>
        <PlainEnglish>
          “Replication” means rebuilding the option from simpler ingredients (shares + borrowing). “Delta
          hedging” is the act of continuously adjusting those ingredients. The option’s fair price is the
          running cost of that hedging strategy from now until expiry. That is the whole model in one breath.
        </PlainEnglish>
      </section>

      <section className="space-y-4 max-w-3xl">
        <H>The famous surprise: direction doesn’t matter</H>
        <p className={prose}>
          Common sense says a call should be worth more if you expect the stock to soar. Black-Scholes says{' '}
          <strong>no — the expected return of the stock does not appear in the formula at all.</strong> This
          stuns people, so here is why it is true.
        </p>
        <p className={prose}>
          The hedging strategy cancels out direction. Whatever the stock does, the delta-hedged position
          responds the same way; what is left over is not about <em>where</em> the stock goes but{' '}
          <em>how much it wobbles</em> on the way — its volatility. So the price depends on volatility, not on
          your bullish or bearish opinion. Two traders who violently disagree about a stock’s future must still
          agree on its option price, or one of them is leaving free money on the table.
        </p>
      </section>

      <section className="space-y-4 max-w-3xl">
        <H>What goes into the formula</H>
        <p className={prose}>
          Black-Scholes takes five inputs. Four are observable; the interesting one is volatility.
        </p>
        <ul className="space-y-1.5 text-sm text-muted list-disc pl-5">
          <li><strong className="text-fg">Spot (S)</strong> — the current stock price.</li>
          <li><strong className="text-fg">Strike (K)</strong> — the option’s fixed price.</li>
          <li><strong className="text-fg">Time to expiry (T)</strong> — how long is left, in years.</li>
          <li><strong className="text-fg">Risk-free rate (r)</strong> — the interest rate, for discounting.</li>
          <li><strong className="text-fg">Volatility (σ)</strong> — how much the stock is expected to move. The one number you cannot simply read off a screen — and therefore the one everything hinges on.</li>
        </ul>
        <p className={prose}>
          You do not need to memorise the equation, but one rule of thumb is worth knowing because it impresses
          and it is accurate: an <strong>at-the-money option is worth roughly 0.4 × S × σ × √T</strong>.
        </p>
        <Example>
          <p>Stock = £100, volatility = 20% (0.20), one year to expiry.</p>
          <p>ATM value ≈ 0.4 × 100 × 0.20 × √1 = <strong>£8</strong>.</p>
          <p>The exact Black-Scholes value here is about £7.97 — the shortcut is excellent at the money.</p>
        </Example>
      </section>

      <section className="space-y-4 max-w-3xl">
        <H>Risk-neutral pricing, demystified</H>
        <p className={prose}>
          You will hear that options are priced “in a risk-neutral world” — as if everyone were indifferent to
          risk and every asset grew at the risk-free rate. That is <em>not</em> a claim about reality. It is a
          calculation shortcut that the replication argument makes legitimate.
        </p>
        <p className={prose}>
          Because the payoff can be hedged away, the price cannot depend on anyone’s appetite for risk. And if
          it does not depend on risk appetite, we are free to <em>pretend</em> investors are risk-neutral when
          we compute it — because we will get the same answer as in the real world, and the pretend world is
          far easier to calculate in. So: price ≈ the expected payoff computed with “risk-neutral”
          probabilities, discounted back at the risk-free rate.
        </p>
        <Formula>price ≈ discounted expected payoff (under risk-neutral probabilities)</Formula>
      </section>

      <section className="space-y-4">
        <div className="max-w-3xl space-y-3">
          <H>Play with the model</H>
          <p className={prose}>
            The calculator below is a real Black-Scholes engine. Drag the inputs and watch the price and Greeks
            respond. A few experiments that build intuition:
          </p>
          <ul className="space-y-1.5 text-sm text-muted list-disc pl-5">
            <li>Set spot = strike and push <strong>rate to 0</strong>: the call and put prices become equal — that is put-call parity from Chapter 2, live.</li>
            <li>Crank <strong>volatility</strong> up: every option gets more expensive (you are watching vega).</li>
            <li>Shrink <strong>time to expiry</strong> toward zero: prices collapse toward pure intrinsic value as time value evaporates (that is theta).</li>
            <li>Watch the curve: the gap between the purple <em>value</em> line and the dashed <em>intrinsic</em> line is the time value — fattest at the money, thin in the wings.</li>
          </ul>
        </div>
        <BlackScholesLab />
      </section>

      <section className="space-y-4 max-w-3xl">
        <H>Implied volatility: the model run backwards</H>
        <p className={prose}>
          Here is the twist that turns a pricing formula into the language of an entire industry. In practice,
          nobody knows the “true” volatility to plug in. Instead, traders observe the option’s{' '}
          <em>market price</em> and run Black-Scholes <strong>in reverse</strong>: they ask “what volatility
          would the formula need in order to output this price?” That number is the{' '}
          <strong>implied volatility</strong>.
        </p>
        <KeyIdea>
          Implied volatility is the volatility that makes the Black-Scholes price equal the actual market price.
          Because price and implied vol are interchangeable, traders quote and think in vol — it is a more
          stable, comparable language than pounds. “The option is trading at 22 vol” says more than “the option
          costs £6.10.”
        </KeyIdea>
      </section>

      <section className="space-y-4 max-w-3xl">
        <H>Where the model breaks (and why that’s fine)</H>
        <p className={prose}>
          Black-Scholes rests on assumptions that are not quite true: that volatility is constant and known,
          that prices drift smoothly without sudden jumps, and that you can hedge continuously and for free.
          Reality disagrees — vol changes, prices gap on news, and trading costs money.
        </p>
        <p className={prose}>
          The model survives anyway because traders treat it as a <em>translation device</em>, not gospel. They
          feed in different implied volatilities for different strikes and expiries to patch over its flaws —
          and the pattern of those patches is the “volatility surface,” the subject of the next chapter.
        </p>
      </section>

      <section className="max-w-3xl">
        <InterviewAngle>
          You will rarely be asked to derive Black-Scholes — and reciting the formula impresses nobody. What
          lands is the story: <em>an option can be replicated by delta-hedging; therefore its price is the cost
          of that hedge; therefore direction drops out and only volatility matters; and in practice we quote the
          answer as implied volatility.</em> Add that you know the assumptions fail and why the vol surface
          exists, and you are comfortably ahead of most candidates.
        </InterviewAngle>
      </section>
    </div>
  );
}
