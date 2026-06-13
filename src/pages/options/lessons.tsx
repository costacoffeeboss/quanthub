import type { ReactNode } from 'react';
import PayoffBuilder from '../../components/options/PayoffBuilder';
import GreeksGrid from '../../components/options/GreeksGrid';
import BlackScholesLab from '../../components/options/BlackScholesLab';

/** A formula shown in the site's mono callout style. */
function Formula({ children }: { children: ReactNode }) {
  return (
    <p className="font-mono text-sm text-violet-light bg-panel border border-steel rounded px-4 py-3">
      {children}
    </p>
  );
}

function H({ children }: { children: ReactNode }) {
  return <h2 className="text-xl font-bold">{children}</h2>;
}

/** A downward equity skew, drawn schematically. */
function SkewChart() {
  const W = 480;
  const H = 200;
  const pad = { l: 40, r: 16, t: 16, b: 28 };
  const pts: string[] = [];
  for (let i = 0; i <= 60; i++) {
    const t = i / 60; // moneyness left(low strike)→right(high strike)
    // higher IV on the downside (left), flattening up; a touch of smile on the far right
    const iv = 0.34 - 0.22 * t + 0.06 * t * t;
    const x = pad.l + t * (W - pad.l - pad.r);
    const y = pad.t + (1 - (iv - 0.15) / 0.25) * (H - pad.t - pad.b);
    pts.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Equity implied-volatility skew" className="w-full h-auto">
      <line x1={pad.l} x2={W - pad.r} y1={H - pad.b} y2={H - pad.b} stroke="#23252c" strokeWidth="1" />
      <path d={pts.join(' ')} fill="none" stroke="#6d4aff" strokeWidth="2.5" />
      <text x={pad.l} y={H - 8} fill="#7e838f" fontSize="11" fontFamily="JetBrains Mono, monospace">
        low strikes (puts)
      </text>
      <text x={W - pad.r} y={H - 8} textAnchor="end" fill="#7e838f" fontSize="11" fontFamily="JetBrains Mono, monospace">
        high strikes (calls)
      </text>
      <text x={pad.l - 6} y={pad.t + 8} textAnchor="end" fill="#7e838f" fontSize="11" fontFamily="JetBrains Mono, monospace">
        IV
      </text>
    </svg>
  );
}

const P = 'text-sm leading-relaxed';

export const lessons: Record<string, ReactNode> = {
  // ── Chapter 1 ──────────────────────────────────────────────────────────
  basics: (
    <div className="space-y-10">
      <section className="space-y-3 max-w-3xl">
        <H>What an option is</H>
        <p className={P}>
          An option is a contract giving its <strong>holder a right, not an obligation</strong>. A{' '}
          <strong>call</strong> is the right to <em>buy</em> the underlying at a fixed{' '}
          <strong>strike</strong> price; a <strong>put</strong> is the right to <em>sell</em> at the
          strike. The holder pays a <strong>premium</strong> up front for this right; the{' '}
          <strong>writer</strong> (the seller) collects that premium and takes on the obligation to
          deliver if the holder exercises.
        </p>
        <p className={P}>
          That asymmetry is the whole point: the buyer’s loss is capped at the premium, while the
          payoff can be large. The seller’s position is the mirror — limited gain (the premium),
          potentially large loss. Every position has a <strong>long</strong> side (bought it) and a{' '}
          <strong>short</strong> side (sold it).
        </p>
      </section>

      <section className="space-y-3 max-w-3xl">
        <H>Moneyness, intrinsic value, and time value</H>
        <p className={P}>
          An option is <strong>in the money (ITM)</strong> if exercising it now would pay off,{' '}
          <strong>at the money (ATM)</strong> if spot equals the strike, and{' '}
          <strong>out of the money (OTM)</strong> otherwise. Its premium splits cleanly:
        </p>
        <Formula>premium = intrinsic value + time value</Formula>
        <p className={P}>
          <strong>Intrinsic value</strong> is what you’d get exercising right now — max(S − K, 0) for
          a call, max(K − S, 0) for a put. Everything left over is <strong>time value</strong>: the
          market’s price for the chance the option moves further into the money before expiry. Time
          value is largest at the money and decays to zero by expiry.
        </p>
        <p className={P}>
          One more axis: a <strong>European</strong> option can be exercised only at expiry; an{' '}
          <strong>American</strong> option, any time up to it. Most of the intuition here is built on
          European options — we return to early exercise in the final chapter.
        </p>
      </section>

      <section className="space-y-4">
        <H>The four building blocks — and the payoff builder</H>
        <p className={`${P} max-w-3xl`}>
          Long call, short call, long put, short put: every structure you’ll meet is a combination of
          these. The clearest way to internalise them is the <strong>payoff diagram</strong> — P&amp;L
          at expiry as a function of where the underlying lands. Pick a strategy below and drag the
          strikes and premiums to see the shape respond. Start with the four singles, then try the
          straddle and the bull call spread.
        </p>
        <PayoffBuilder />
      </section>
    </div>
  ),

  // ── Chapter 2 ──────────────────────────────────────────────────────────
  parity: (
    <div className="space-y-10">
      <section className="space-y-3 max-w-3xl">
        <H>The relationship</H>
        <Formula>Call − Put = Spot − PV(Strike)</Formula>
        <p className={P}>
          Buy a call and sell a put at the same strike and expiry, and look at what you hold at
          expiry: above the strike you exercise the call; below it the put is exercised against you.
          Either way <strong>you end up owning the stock at the strike price</strong>. So
          call-minus-put is exactly a forward purchase of the stock — and a forward’s value today is
          spot minus the discounted strike.
        </p>
        <p className={P}>
          This is an <strong>arbitrage relationship, not a model</strong>: it assumes nothing about
          volatility or distributions. If it breaks, you can buy the cheap side, sell the rich side,
          and lock in riskless profit — which is why it doesn’t break. Interviewers love it because it
          lets you price a put from a call (or spot a mispriced one) with no Black-Scholes at all, and
          because it explains why calls and puts at the same strike must carry the{' '}
          <em>same implied volatility</em>.
        </p>
      </section>

      <section className="space-y-3 max-w-3xl">
        <H>The conversion trade</H>
        <p className={P}>
          Suppose, with zero rates, a 100-strike call trades at £8 and the put at £6. Parity demands
          C − P = S − K = 0, so the call is £2 rich. The arbitrage (a <strong>conversion</strong>):
          sell the call (+8), buy the put (−6), buy the stock (−100). Net outlay £98. At expiry you
          deliver the stock at 100 whatever happens — certain £100 against £98 spent, a riskless £2.
        </p>
        <p className={P}>
          The professional reflex when you see an apparent parity violation: <em>what is it actually
          charging for?</em> Real deviations usually pay for borrow costs (hard-to-short stock),
          dividend uncertainty, early-exercise value (American options), or funding friction. Only
          once that list is exhausted is it a trade.
        </p>
      </section>
    </div>
  ),

  // ── Chapter 3 ──────────────────────────────────────────────────────────
  greeks: (
    <div className="space-y-10">
      <section className="space-y-3 max-w-3xl">
        <H>Sensitivities, not formulas</H>
        <p className={P}>
          The Greeks are partial derivatives of the option price — each answers “if <em>one</em> thing
          moves, how does my position respond?” You don’t need the closed forms to trade them; you need
          the intuition and the signs. The two that matter most in interviews are delta and gamma, with
          vega close behind.
        </p>
        <p className={P}>
          Crucial habit: <strong>track the sign for long vs short</strong>. Long options are long
          gamma and long vega but pay theta (negative theta). Short options flip all three. A position
          isn’t “risky” or “safe” in the abstract — it’s long or short each Greek.
        </p>
      </section>

      <section className="space-y-4">
        <H>The five Greeks, plainly</H>
        <GreeksGrid />
      </section>

      <section className="space-y-3 max-w-3xl">
        <H>Delta does double duty</H>
        <p className={P}>
          Delta is both your <strong>hedge ratio</strong> — short delta units of stock to neutralise
          first-order spot risk — and a rough <strong>risk-neutral probability</strong> of finishing in
          the money. The two readings coincide at the level of intuition but diverge in precision: delta
          is N(d₁) while the probability is N(d₂), and the gap σ√T grows with time and volatility. Trust
          the “25-delta put” as shorthand; know it’s a few points loose for long-dated, high-vol options.
        </p>
      </section>
    </div>
  ),

  // ── Chapter 4 ──────────────────────────────────────────────────────────
  'black-scholes': (
    <div className="space-y-10">
      <section className="space-y-3 max-w-3xl">
        <H>Pricing by replication</H>
        <p className={P}>
          Forget the PDE for a moment. Black-Scholes says: an option’s payoff can be{' '}
          <strong>manufactured</strong> by continuously trading the stock — hold delta shares, adjust as
          delta changes. If you can manufacture it, its price must equal the manufacturing cost, or
          someone arbitrages the difference. The formula is just that cost, computed under the assumption
          that prices diffuse smoothly with a known volatility.
        </p>
        <p className={P}>
          The replication view explains the Greeks in one stroke: delta is your hedge ratio; gamma is how
          often the hedge needs adjusting; theta is the rent you pay (or collect) for convexity; vega is
          sensitivity to the volatility number you plugged in. It also explains the famous result that the
          expected <em>direction</em> of the stock doesn’t appear in the formula — the hedge removes
          direction, leaving only the cost of rebalancing, which depends on volatility alone.
        </p>
      </section>

      <section className="space-y-4">
        <H>The calculator</H>
        <p className={`${P} max-w-3xl`}>
          Drag the inputs and watch price and Greeks move. Things worth noticing: at the money the call
          ≈ 0.4·S·σ·√T; with zero rates the ATM call and put are equal (parity); gamma spikes at the
          money and as T → 0; and the gap between the value curve and the intrinsic “hockey stick” is the
          time value.
        </p>
        <BlackScholesLab />
      </section>

      <section className="space-y-3 max-w-3xl">
        <H>What to actually say in an interview</H>
        <p className={P}>
          Price ≈ expected discounted payoff under <strong>risk-neutral</strong> probabilities; hedging
          is what makes risk-neutral pricing legitimate; and in practice traders quote{' '}
          <strong>implied vol</strong>, not price — the formula is a translation device between the two.
          Knowing its assumptions fail (volatility isn’t constant, prices jump, hedging isn’t free) and
          that the vol surface exists to patch this is worth more than reciting the derivation.
        </p>
      </section>
    </div>
  ),

  // ── Chapter 5 ──────────────────────────────────────────────────────────
  volatility: (
    <div className="space-y-10">
      <section className="space-y-3 max-w-3xl">
        <H>Two volatilities</H>
        <p className={P}>
          <strong>Realised volatility</strong> is measured looking backward — the standard deviation of
          actual returns. <strong>Implied volatility</strong> is the number you back out of an option’s
          market price through Black-Scholes; it’s the market’s forward-looking estimate of how much the
          underlying will move. Options are bets on movement, so an option’s price <em>is</em> a quote on
          volatility — which is why desks talk in vol, not pounds.
        </p>
        <p className={P}>
          A useful unit trick: divide annualised vol by √252 ≈ 16 to get a daily move. A 16%-vol stock
          moves about 1% a day; a 32%-vol stock about 2%. The trade that expresses a vol view is a
          delta-hedged option position — long if you think realised will beat implied, short if not.
        </p>
      </section>

      <section className="space-y-4">
        <H>The smile and the skew</H>
        <p className={`${P} max-w-3xl`}>
          If Black-Scholes were literally true, every strike would imply the same volatility. It doesn’t.
          Plotting implied vol against strike reveals a <strong>smile</strong> (FX, commodities) or, for
          equity indices, a downward <strong>skew</strong>: low-strike puts trade at markedly higher
          implied vol than high-strike calls.
        </p>
        <div className="rounded-lg border border-steel bg-panel p-4 max-w-2xl">
          <SkewChart />
          <p className="mt-1 font-mono text-[10px] text-muted">
            Equity skew: downside (put) strikes carry richer implied vol.
          </p>
        </div>
        <p className={`${P} max-w-3xl`}>
          Why? Demand for crash protection bids up downside puts, and the <em>leverage effect</em> — falling
          prices raise a firm’s leverage and thus its volatility — means down-moves really are more
          violent than up-moves. Add the second dimension, expiry, and the smile becomes the{' '}
          <strong>vol surface</strong>: implied vol as a function of both strike and time. Its term
          structure usually slopes up in calm markets (contango) and inverts (backwardation) around events
          or stress.
        </p>
      </section>
    </div>
  ),

  // ── Chapter 6 ──────────────────────────────────────────────────────────
  hedging: (
    <div className="space-y-10">
      <section className="space-y-3 max-w-3xl">
        <H>Hedging away direction</H>
        <p className={P}>
          To <strong>delta-hedge</strong> an option you hold −delta units of the underlying, cancelling
          first-order spot exposure. But delta isn’t static — it changes as spot moves (that’s gamma), so
          the hedge must be rebalanced. This dynamic rebalancing is the bridge between the messy real world
          and the clean Black-Scholes price.
        </p>
        <p className={P}>
          The deep point: because the payoff can be <strong>replicated</strong> by this hedging strategy,
          its fair price is just the cost of the strategy — no assumption about anyone’s risk appetite
          required. That’s why risk-neutral pricing is legitimate, not a leap of faith.
        </p>
      </section>

      <section className="space-y-3 max-w-3xl">
        <H>Gamma scalping and the theta you pay</H>
        <p className={P}>
          Hold a delta-hedged <strong>long</strong> option. Positive gamma means your delta grows as spot
          rises and shrinks as it falls, so re-hedging forces you to <strong>sell into rallies and buy
          dips</strong> — locking in small profits from oscillation. This is <strong>gamma scalping</strong>.
        </p>
        <p className={P}>
          It isn’t free money: every day you hold the option you pay <strong>theta</strong>. The position
          wins overall only when <strong>realised volatility exceeds the implied volatility you paid</strong> —
          gamma P&amp;L scales with realised variance, the theta cost with implied. A <em>short</em>-gamma
          book is the mirror: it collects theta in quiet markets but bleeds when moves are large, because
          re-hedging forces it to buy high and sell low.
        </p>
        <p className={P}>
          One caveat the model ignores: you rebalance <strong>discretely</strong>, not continuously, so a big
          intra-period jump leaves a residual P&amp;L — the hedging error. Continuous hedging is the
          idealisation that makes the Black-Scholes price exact.
        </p>
      </section>
    </div>
  ),

  // ── Chapter 7 ──────────────────────────────────────────────────────────
  structures: (
    <div className="space-y-10">
      <section className="space-y-3 max-w-3xl">
        <H>Combining the building blocks</H>
        <p className={P}>
          Once you can read single-leg payoffs, structures are just sums. A <strong>vertical spread</strong>{' '}
          (long one strike, short another of the same type) caps both profit and cost — a bull call spread
          is the standard defined-risk bullish bet. A <strong>straddle</strong> (long call + long put, same
          strike) and the cheaper <strong>strangle</strong> are pure long-volatility bets that need a big
          move either way. A <strong>butterfly</strong> (long the wings, short twice the body) is a cheap bet
          that the underlying <em>pins</em> the middle strike. Revisit the payoff builder in Chapter 1 to see
          each shape.
        </p>
        <p className={P}>
          Worked example: a 95/105 bull call spread costs £7 − £3 = £4. Max profit is the £10 strike width
          minus the £4 cost = £6; max loss is the £4 paid. Defined risk, defined reward.
        </p>
      </section>

      <section className="space-y-3 max-w-3xl">
        <H>American options and early exercise</H>
        <p className={P}>
          American options add the right to exercise early — but when is it worth it? For a{' '}
          <strong>call on a non-dividend stock, never</strong>: exercising throws away remaining time value
          and pays the strike early, so selling the option always beats exercising. The exception is to
          capture a <strong>dividend</strong> just before it goes ex.
        </p>
        <p className={P}>
          For a <strong>put</strong>, early exercise <em>can</em> be optimal: a deep-in-the-money put behaves
          like a short forward, and exercising lets you collect the strike now and earn interest on it. The
          higher the rates and the deeper the put, the stronger the case.
        </p>
      </section>

      <section className="space-y-3 max-w-3xl">
        <H>A first look at exotics</H>
        <p className={P}>
          Beyond vanillas lie path- and payoff-dependent options. A <strong>digital (binary)</strong> pays a
          fixed amount if it finishes in the money and nothing otherwise — a step function, all-or-nothing.
          A <strong>barrier</strong> option adds a trigger: a <em>knock-out</em> ceases to exist if the
          underlying touches the barrier, a <em>knock-in</em> only springs to life if it does. Barriers are
          cheaper than the equivalent vanilla because the path condition can extinguish the payoff. An{' '}
          <strong>Asian</strong> option settles on the <em>average</em> price over a window, damping
          end-of-life manipulation and lowering effective volatility. The common thread: each tweak to the
          payoff is a tweak to the price, and the Greeks intuition you’ve built still guides the risk.
        </p>
      </section>
    </div>
  ),
};
