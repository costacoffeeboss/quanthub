import { Link } from 'react-router-dom';
import { H, H3, SubSection, KeyIdea, Example, PlainEnglish, InterviewAngle, Table, prose } from '../lessonKit';
import type { QuizQuestion } from '../../../data/optionsCourse';

const checks_7_1: QuizQuestion[] = [
  {
    id: 'chk-struct-1a',
    type: 'mcq',
    prompt: 'In a bull call spread, what is the role of the higher-strike call you sell?',
    choices: [
      'It increases your upside potential',
      'It caps your upside but lowers your cost',
      'It removes all risk from the position',
      'It is the same option you also buy',
    ],
    answerIndex: 1,
    explanation:
      'Selling the higher-strike call caps your maximum payoff at the strike width, but the premium it brings in slashes your net cost — a defined-risk bet on a moderate rise.',
  },
  {
    id: 'chk-struct-1b',
    type: 'numeric',
    prompt:
      'You buy the 95-strike call for £7 and sell the 105-strike call for £3. What is the maximum profit of this bull call spread?',
    answer: 6,
    tolerance: 0.01,
    unit: '£',
    explanation:
      'Net cost = 7 − 3 = £4 (the max loss). Max payoff = strike width = 105 − 95 = £10. Max profit = 10 − 4 = £6.',
  },
];

const checks_7_2: QuizQuestion[] = [
  {
    id: 'chk-struct-2a',
    type: 'numeric',
    prompt:
      'You pay £10 total for a 100-strike straddle (the 100 call plus the 100 put). What is the upper breakeven price?',
    answer: 110,
    tolerance: 0.01,
    unit: '£',
    explanation:
      'Breakevens = strike ± total premium = 100 ± 10, i.e. £90 and £110. Above £110 (or below £90) the move was big enough to pay for both options.',
  },
  {
    id: 'chk-struct-2b',
    type: 'mcq',
    prompt: 'Which structure is a bet that the stock will go nowhere and pins a middle strike?',
    choices: ['A straddle', 'A strangle', 'A butterfly', 'A bull call spread'],
    answerIndex: 2,
    explanation:
      'A butterfly buys the low and high "wings" and sells two of the middle "body" strike. It is the opposite of a straddle: it pays off best if the stock pins the middle strike at expiry.',
  },
];

const checks_7_3: QuizQuestion[] = [
  {
    id: 'chk-struct-3a',
    type: 'mcq',
    prompt: 'What does a covered call involve?',
    choices: [
      'Owning the stock and buying a put against it',
      'Owning the stock and selling a call against it',
      'Selling both a call and a put with no stock',
      'Buying a call and a put at the same strike',
    ],
    answerIndex: 1,
    explanation:
      'A covered call means you own the stock and sell a call against it: you pocket premium income and give up some upside — a way to earn yield on a holding you would be happy to sell at the strike.',
  },
  {
    id: 'chk-struct-3b',
    type: 'mcq',
    prompt: 'A protective put is best described as what?',
    choices: [
      'A way to earn extra yield on a stock you own',
      'Insurance — a floor under your position, paid for with the premium',
      'A pure bet that the stock will move a lot',
      'A bet that the stock will go nowhere',
    ],
    answerIndex: 1,
    explanation:
      'Owning the stock and buying a put is literally insurance: it places a floor under your position in exchange for the premium. (Recall stock + put behaves like a call.)',
  },
];

const checks_7_4: QuizQuestion[] = [
  {
    id: 'chk-struct-4a',
    type: 'mcq',
    prompt:
      'When, if ever, is it worth exercising an American call on a non-dividend stock early?',
    choices: [
      'Always, to lock in the intrinsic value',
      'Never — you are better off selling the call to recover its time value',
      'Whenever it goes in the money',
      'Only when interest rates are very high',
    ],
    answerIndex: 1,
    explanation:
      'Exercising early throws away remaining time value and forces you to pay the strike sooner (losing interest on the cash). You should sell the call instead. The only early-exercise case for calls is to capture a dividend.',
  },
  {
    id: 'chk-struct-4b',
    type: 'mcq',
    prompt: 'For an American put, early exercise becomes more attractive when:',
    choices: [
      'The put is far out of the money and rates are low',
      'The put is deep in the money and interest rates are high',
      'The stock pays no dividend',
      'There is a lot of time value remaining',
    ],
    answerIndex: 1,
    explanation:
      'Exercising a deep-ITM put hands you the strike in cash now, which you can reinvest. The higher interest rates are, the stronger that time-value-of-money benefit relative to the shrinking time value you give up.',
  },
];

const checks_7_5: QuizQuestion[] = [
  {
    id: 'chk-struct-5a',
    type: 'mcq',
    prompt: 'A digital (binary) option pays off how?',
    choices: [
      'A fixed amount if in the money, nothing otherwise',
      'The average price over a window',
      'Like a vanilla, but dies if a barrier is touched',
      'Springs into existence only if a barrier is touched',
    ],
    answerIndex: 0,
    explanation:
      'A digital / binary option is all-or-nothing: it pays a fixed amount if in the money and nothing otherwise — a step, not a slope.',
  },
  {
    id: 'chk-struct-5b',
    type: 'mcq',
    prompt: 'Why is a knock-out (barrier) option cheaper than the equivalent vanilla?',
    choices: [
      'Because it settles on an average price',
      'Because the price path can touch the barrier and extinguish the option',
      'Because it pays a fixed all-or-nothing amount',
      'Because it only exists once the barrier is touched',
    ],
    answerIndex: 1,
    explanation:
      'A knock-out behaves like a vanilla but dies if the price touches the barrier. That extra way to lose makes it cheaper — each tweak to the payoff rule is a tweak to the price.',
  },
];

export default function Structures() {
  return (
    <div className="space-y-12">
      <section className="space-y-3 max-w-3xl">
        <H>Putting the pieces together</H>
        <p className={prose}>
          You now have the whole toolkit. This final chapter spends it: combining options into{' '}
          <strong>strategies</strong> with tailored payoffs, understanding when <strong>American</strong>{' '}
          options should be exercised early, and meeting the <strong>exotic</strong> options that live beyond
          the vanilla call and put. Everything here is just the four building blocks from Chapter 1, recombined —
          so keep the{' '}
          <Link to="/options/basics" className="text-violet-light hover:underline">payoff builder</Link>{' '}
          in mind as your sketchpad.
        </p>
      </section>

      <SubSection n="7.1" title="Vertical spreads: cheaper, capped bets" check={checks_7_1}>
        <p className={prose}>
          A <strong>spread</strong> means buying one option and selling another of the same type to part-fund
          it. The classic is the <strong>bull call spread</strong>: buy a lower-strike call, sell a
          higher-strike call. The sold call caps your upside, but it also slashes your cost — a defined-risk way
          to bet on a moderate rise.
        </p>
        <Example title="A 95/105 bull call spread">
          <p>Buy the 95-strike call for £7; sell the 105-strike call for £3.</p>
          <p>• Net cost = 7 − 3 = <strong>£4</strong> (this is your maximum loss, if both expire worthless).</p>
          <p>• Maximum payoff = the strike width = 105 − 95 = £10 (reached when the stock is at or above 105).</p>
          <p>• Maximum profit = 10 − 4 = <strong>£6</strong>. Breakeven = 95 + 4 = £99.</p>
          <p>Defined risk (£4), defined reward (£6). You traded away the unlimited upside of a plain call for a much lower entry price.</p>
        </Example>
        <PlainEnglish>
          “Vertical” just means the two options differ only in strike, not expiry. Bull = you want it to rise;
          there is a matching bear put spread for the downside. Spreads are how traders express a{' '}
          <em>moderate</em> view without paying for unlimited upside they do not expect to use.
        </PlainEnglish>
      </SubSection>

      <SubSection n="7.2" title="Straddles, strangles and butterflies: betting on movement (or stillness)" check={checks_7_2}>
        <p className={prose}>
          Buy a call <em>and</em> a put at the same strike and you have a <strong>straddle</strong> — a pure bet
          that the stock will <strong>move a lot, in either direction</strong>. You do not care which way; you
          just need a big move to cover the two premiums you paid. A <strong>strangle</strong> is the cheaper
          cousin: use out-of-the-money strikes, pay less, but need an even bigger move.
        </p>
        <Example title="A 100 straddle for £10">
          <p>You pay £10 total for the 100-strike call plus the 100-strike put.</p>
          <p>Breakevens = strike ± total premium = 100 ± 10, i.e. <strong>£90 and £110</strong>.</p>
          <p>Outside that range you profit; inside it the move was too small to pay for the options. Your enemy is a quiet market (theta) and falling implied vol.</p>
        </Example>
        <H3>Butterflies: betting on stillness</H3>
        <p className={prose}>
          A <strong>butterfly</strong> is the opposite bet: that the stock will go <em>nowhere</em>. You buy the
          “wings” (a low and a high strike) and sell two of the middle “body” strike. It is cheap, with defined
          risk, and pays off best if the stock <strong>pins</strong> the middle strike at expiry. Straddle =
          “big move please”; butterfly = “please don’t move.”
        </p>
      </SubSection>

      <SubSection n="7.3" title="Two everyday hedger’s structures" check={checks_7_3}>
        <ul className="space-y-2 text-sm text-muted list-disc pl-5">
          <li><strong className="text-fg">Covered call.</strong> You own the stock and sell a call against it. You pocket premium income and give up some upside — a way to earn yield on a holding you would be happy to sell at the strike.</li>
          <li><strong className="text-fg">Protective put.</strong> You own the stock and buy a put. That is literally insurance: a floor under your position, paid for with the premium. (And recall from Chapter 2 that stock + put behaves like a call.)</li>
        </ul>
      </SubSection>

      <SubSection n="7.4" title="American options: when to exercise early" check={checks_7_4}>
        <p className={prose}>
          American options let you exercise any time. But <em>should</em> you? The answers are sharper than most
          people expect.
        </p>
        <H3>Calls on a non-dividend stock: never exercise early</H3>
        <p className={prose}>
          Exercising a call early throws away its remaining time value and forces you to pay the strike sooner
          than necessary (losing the interest you could have earned on that cash). You are always better off{' '}
          <strong>selling</strong> the call instead — you recover the time value the market is still willing to
          pay for. The one exception is to capture a <strong>dividend</strong>: it can be worth exercising just
          before the stock goes ex-dividend so you own the shares in time to collect it.
        </p>
        <H3>Puts: early exercise can be optimal</H3>
        <p className={prose}>
          A deep in-the-money put is different. Exercising it hands you the strike in cash <em>now</em>, which
          you can then earn interest on. For a put that is already deep in the money, that time-value-of-money
          benefit can outweigh the shrinking time value you give up — and the higher interest rates are, the
          stronger the case. So <strong>deep-ITM American puts, especially when rates are high, are candidates
          for early exercise</strong>.
        </p>
        <KeyIdea>
          American call on a non-dividend stock: <strong>never</strong> early-exercise — sell it instead.
          American put, deep in the money with high rates: early exercise <strong>can</strong> be worth it, to
          collect and reinvest the strike.
        </KeyIdea>
      </SubSection>

      <SubSection n="7.5" title="A first look at exotics" check={checks_7_5}>
        <p className={prose}>
          Beyond vanilla calls and puts lies a zoo of options with custom payoffs. You do not need to price them
          to recognise them — and the Greeks intuition you have built still guides the risk.
        </p>
        <Table
          headers={['Exotic', 'How it pays', 'The idea']}
          rows={[
            ['Digital / binary', 'A fixed amount if in the money, nothing otherwise', 'All-or-nothing — a step, not a slope'],
            ['Barrier (knock-out)', 'Like a vanilla, but dies if the price touches a barrier', 'Cheaper than vanilla: the path can extinguish it'],
            ['Barrier (knock-in)', 'Springs into existence only if the barrier is touched', 'The mirror of a knock-out'],
            ['Asian', 'Settles on the average price over a window', 'Averaging damps volatility and curbs manipulation'],
          ]}
        />
        <p className={prose}>
          The common thread: each tweak to the <em>payoff rule</em> is a tweak to the <em>price</em>. A barrier
          condition that can wipe out the option makes it cheaper; averaging that smooths the payoff lowers its
          effective volatility. Exotics are vanilla intuition plus a twist.
        </p>
      </SubSection>

      <section className="max-w-3xl">
        <InterviewAngle>
          Expect to build a payoff on the spot (“draw a bull call spread; what are the max profit, max loss and
          breakeven?”) and to reason about early exercise (“would you ever exercise an American call early?” —
          “only to grab a dividend”). The exotics rarely need pricing; you just need to explain a digital or a
          knock-out in one clean sentence. Sketch the payoff, state the numbers, name the view. That is the
          whole game — and it is the same game you started playing in Chapter 1.
        </InterviewAngle>
      </section>
    </div>
  );
}
