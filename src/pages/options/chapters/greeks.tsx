import GreeksGrid from '../../../components/options/GreeksGrid';
import { H, KeyIdea, Example, PlainEnglish, InterviewAngle, Table, prose } from '../lessonKit';

export default function Greeks() {
  return (
    <div className="space-y-12">
      <section className="space-y-3 max-w-3xl">
        <H>Why we need the Greeks at all</H>
        <p className={prose}>
          An option’s price moves around for several different reasons at once: the underlying ticks up or down,
          time passes, the market gets more or less jittery, interest rates shift. If you trade options, you
          need to know <em>how much</em> your position reacts to each of these, separately. The{' '}
          <strong>Greeks</strong> are exactly that — a set of numbers, each answering one question of the form
          “if <em>this one thing</em> changes by a little, how much does my option move?”
        </p>
        <PlainEnglish>
          Each Greek is a sensitivity — in calculus terms, a derivative (rate of change). You do not need the
          calculus to use them. You need the story each one tells and, just as importantly, its sign for a long
          versus a short position.
        </PlainEnglish>
        <KeyIdea>
          A position is never simply “risky.” It is long or short <em>each</em> Greek. The skill is knowing
          which sensitivities you are carrying and whether you want them.
        </KeyIdea>
      </section>

      <section className="space-y-4 max-w-3xl">
        <H>Delta (Δ): sensitivity to the stock price</H>
        <p className={prose}>
          Delta is the most important Greek. It answers: <em>if the underlying moves £1, how much does my
          option move?</em> A call with a delta of 0.6 gains about £0.60 when the stock rises £1. Delta runs
          from 0 to 1 for calls (and 0 to −1 for puts, since puts fall when the stock rises).
        </p>
        <Example>
          <p>You own a call with delta 0.4. The stock rises £2.</p>
          <p>Estimated change in the option’s value ≈ delta × move = 0.4 × 2 = <strong>£0.80</strong>.</p>
        </Example>
        <p className={prose}>Delta wears three hats at once, and interviewers love all three:</p>
        <ul className="space-y-2 text-sm text-muted list-disc pl-5">
          <li><strong className="text-fg">A rate of change</strong> — £ moved per £1 of underlying, as above.</li>
          <li><strong className="text-fg">A share-equivalent (the hedge ratio)</strong> — a 0.5-delta call behaves like holding half a share. To cancel the option’s price risk you would hold the opposite: short 0.5 shares. This is the seed of Chapter 6.</li>
          <li><strong className="text-fg">A rough probability</strong> — delta is approximately the chance the option finishes in the money. An at-the-money option sits near 0.5 because it is roughly a coin flip; deep in-the-money calls approach 1 (almost certain), deep out-of-the-money calls approach 0.</li>
        </ul>
        <PlainEnglish>
          The probability reading is a brilliant shortcut but not exact — the true figure differs by an amount
          that grows with time and volatility. Use “the 25-delta put” as shorthand for “roughly 25% chance,”
          and know it is a few points loose for long-dated, high-volatility options.
        </PlainEnglish>
      </section>

      <section className="space-y-4 max-w-3xl">
        <H>Gamma (Γ): how fast delta itself changes</H>
        <p className={prose}>
          Delta is not constant — as the stock moves, delta moves too. <strong>Gamma</strong> measures that:
          it is the rate of change of delta. If delta is your speed, gamma is your acceleration.
        </p>
        <p className={prose}>
          Why care? Because gamma is <strong>curvature</strong>, and curvature is what makes options special.
          If you are <em>long</em> gamma, your delta automatically grows as the market moves your way and
          shrinks as it moves against you — the position keeps tilting in your favour. Gamma is largest for
          options that are <strong>at the money and close to expiry</strong>, where delta can swing violently
          from near 0 to near 1 on a small move. That is exactly where hedging gets frantic.
        </p>
      </section>

      <section className="space-y-4 max-w-3xl">
        <H>Theta (Θ): the cost of time passing</H>
        <p className={prose}>
          <strong>Theta</strong> is how much value the option loses per day, all else equal — the “time decay”
          you met in Chapter 1, now given a name. For someone who is <em>long</em> an option, theta is{' '}
          <strong>negative</strong>: every day that passes with nothing happening, a little time value bleeds
          away.
        </p>
        <KeyIdea>
          Gamma and theta are two sides of one coin. Being long options gives you helpful curvature (long
          gamma) but you pay <em>rent</em> for it every day (negative theta). Being short options collects that
          rent (positive theta) but saddles you with dangerous curvature (short gamma). You cannot have the
          good side without the bad.
        </KeyIdea>
      </section>

      <section className="space-y-4 max-w-3xl">
        <H>Vega (ν): sensitivity to volatility</H>
        <p className={prose}>
          <strong>Vega</strong> tells you how much the option price changes when the market’s expectation of
          future movement — its <em>implied volatility</em> — changes. Options are fundamentally bets on
          movement, so if the market suddenly expects bigger swings, options get more valuable. Owning options
          means you are <strong>long vega</strong>: you profit if volatility is repriced upward, even if the
          stock itself has not moved. A whole style of trading lives here — making money from changes in vol
          rather than direction. (Chapter 5 is devoted to volatility.)
        </p>
      </section>

      <section className="space-y-4 max-w-3xl">
        <H>Rho (ρ): sensitivity to interest rates</H>
        <p className={prose}>
          <strong>Rho</strong> measures sensitivity to interest rates. For most short-dated equity options it
          is the least exciting Greek — rates barely move day to day. It matters for long-dated options, and it
          became newsworthy again when rates left zero. Higher rates lift call values (it is cheaper to defer
          paying the strike) and depress puts.
        </p>
      </section>

      <section className="space-y-4 max-w-3xl">
        <H>The sign cheat-sheet</H>
        <p className={prose}>
          When you buy options you get positive gamma and vega but negative theta; selling flips every sign.
          Burn this table in — it is the fastest way to answer “what risks am I carrying?”
        </p>
        <Table
          headers={['', 'Delta', 'Gamma', 'Theta', 'Vega']}
          rows={[
            ['Long call', '+ (0 to 1)', '+', '−', '+'],
            ['Long put', '− (−1 to 0)', '+', '−', '+'],
            ['Short call', '− ', '−', '+', '−'],
            ['Short put', '+', '−', '+', '−'],
          ]}
        />
        <p className={prose}>
          Notice the pattern: <strong>buying any option</strong> is long gamma, long vega, short theta. The
          direction (delta) depends on call vs put, but the gamma/theta/vega signs depend only on long vs short.
        </p>
      </section>

      <section className="space-y-4">
        <div className="max-w-3xl space-y-3">
          <H>The five Greeks at a glance</H>
          <p className={prose}>
            Each card below shows the rough shape of the sensitivity and a one-paragraph plain-English summary.
            Read them as a set — they are the working vocabulary of every options desk.
          </p>
        </div>
        <GreeksGrid />
      </section>

      <section className="max-w-3xl">
        <InterviewAngle>
          Greeks questions are everywhere: “You are short a straddle — what are your risks?” (short gamma, short
          vega, long theta: you bleed if the stock moves a lot or vol jumps, and you profit if it sits still).
          The winning habit is to answer in Greeks, not vibes — name the sign of each exposure and what would
          hurt you. And always link gamma and theta: anyone who treats them separately has not understood them.
        </InterviewAngle>
      </section>
    </div>
  );
}
