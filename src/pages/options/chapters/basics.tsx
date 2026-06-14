import PayoffBuilder from '../../../components/options/PayoffBuilder';
import { SubSection, H3, Formula, KeyIdea, Example, PlainEnglish, InterviewAngle, Table, prose } from '../lessonKit';
import type { QuizQuestion } from '../../../data/optionsCourse';

const checks_1_1: QuizQuestion[] = [
  {
    id: 'chk-basics-1a',
    type: 'mcq',
    prompt: 'In the flat example, you pay £5,000 today for the ability to buy the flat for £300,000 within three months "if you choose to". What does this make the £5,000?',
    choices: [
      'The strike price you must pay for the flat',
      'The premium — the up-front price of the right',
      'A deposit that is returned if you walk away',
      'The payoff you receive at expiry',
    ],
    answerIndex: 1,
    explanation: 'The £5,000 paid up front for the right (not the obligation) is the premium. The £300,000 is the strike, and the premium is not returned if you walk away.',
  },
  {
    id: 'chk-basics-1b',
    type: 'mcq',
    prompt: 'An option gives its owner the right, but not the obligation, to transact. Which statement about the buyer’s risk is correct?',
    choices: [
      'Both the downside and the upside are capped',
      'The downside is capped at the premium paid; the upside is not capped',
      'The downside is unlimited; the upside is capped',
      'There is no downside because the right can simply be discarded for free',
    ],
    answerIndex: 1,
    explanation: 'Because it is a right and not an obligation, the buyer’s loss is capped at the premium paid, while the upside is left open.',
  },
];

const checks_1_2: QuizQuestion[] = [
  {
    id: 'chk-basics-2a',
    type: 'mcq',
    prompt: 'You believe a stock is going to fall and want to profit from (or protect against) that move. Which option fits?',
    choices: [
      'A call — the right to buy',
      'A put — the right to sell',
      'Either, since calls and puts behave identically',
      'Neither — options only profit from rising prices',
    ],
    answerIndex: 1,
    explanation: 'A put is the right to sell at the strike, so it is the bet/hedge that the price falls. A call is the right to buy, used when you expect a rise.',
  },
  {
    id: 'chk-basics-2b',
    type: 'mcq',
    prompt: 'For every option that is bought, someone has written (sold) it. Which describes the writer (short) of an option?',
    choices: [
      'They pay the premium and gain the right to transact',
      'They receive the premium and take on the obligation to deliver if the holder exercises',
      'They have unlimited gain and limited loss',
      'They can never lose more than the premium',
    ],
    answerIndex: 1,
    explanation: 'The writer receives the premium and takes on the matching obligation. Their gain is capped at the premium received, while their loss can be large.',
  },
];

const checks_1_3: QuizQuestion[] = [
  {
    id: 'chk-basics-3a',
    type: 'numeric',
    prompt: 'You buy a £100-strike call for a £5 premium. At expiry the stock is £112. What is your profit (payoff minus premium), in £?',
    answer: 7,
    tolerance: 0.01,
    unit: '£',
    explanation: 'Payoff = max(112 − 100, 0) = £12. Profit = payoff − premium = 12 − 5 = £7.',
  },
  {
    id: 'chk-basics-3b',
    type: 'mcq',
    prompt: 'Among the four building blocks, which position has unlimited maximum loss?',
    choices: [
      'Long call',
      'Long put',
      'Short call',
      'Short put',
    ],
    answerIndex: 2,
    explanation: 'A short call has limited gain (the premium received) but unlimited loss, because the underlying can rise without a ceiling. Long positions only risk the premium paid.',
  },
];

const checks_1_4: QuizQuestion[] = [
  {
    id: 'chk-basics-4a',
    type: 'mcq',
    prompt: 'The stock is trading at £105. How is the 100-strike call described in terms of moneyness?',
    choices: [
      'Out of the money (OTM)',
      'At the money (ATM)',
      'In the money (ITM)',
      'It has no moneyness label for calls',
    ],
    answerIndex: 2,
    explanation: 'A call is in the money when the stock is above its strike. At £105 versus a £100 strike, exercising now would pay off, so it is ITM.',
  },
  {
    id: 'chk-basics-4b',
    type: 'mcq',
    prompt: 'An at-the-money option premium splits into intrinsic value + time value. What is true of an at-the-money option?',
    choices: [
      'Its whole premium is intrinsic value',
      'Its whole premium is time value, because intrinsic value is zero',
      'It has neither intrinsic value nor time value',
      'Its time value stays constant right up to expiry',
    ],
    answerIndex: 1,
    explanation: 'At the money, S = K, so intrinsic value is zero and the entire premium is time value. Time value then decays to zero by expiry.',
  },
];

const checks_1_5: QuizQuestion[] = [
  {
    id: 'chk-basics-5a',
    type: 'mcq',
    prompt: 'On the payoff builder, why does dragging the premium up or down shift the whole profit-and-loss line vertically?',
    choices: [
      'Because the premium changes the strike price',
      'Because the premium is the cost subtracted from the payoff, which moves the breakeven',
      'Because a higher premium changes a call into a put',
      'Because the premium alters the underlying price at expiry',
    ],
    answerIndex: 1,
    explanation: 'Profit = payoff − premium, so changing the premium shifts the entire P&L line up or down and moves your breakeven.',
  },
  {
    id: 'chk-basics-5b',
    type: 'mcq',
    prompt: 'The interview angle stresses one habit above all. Which is it?',
    choices: [
      'Memorising the textbook definition of a call',
      'Reasoning in payoff diagrams and always separating payoff from profit',
      'Computing implied volatility by hand',
      'Quoting the Black–Scholes formula from memory',
    ],
    answerIndex: 1,
    explanation: 'Strong candidates think in pictures (payoff diagrams) and keep payoff distinct from profit, rather than reciting definitions.',
  },
];

export default function Basics() {
  return (
    <div className="space-y-12">
      <SubSection n="1.1" title="Options, in plain English" check={checks_1_1}>
        <div className="max-w-3xl space-y-3">
          <p className={prose}>
            Imagine you find a flat you love, on sale for £300,000. You are fairly sure you want it, but you
            need three months to sort out your mortgage — and you are worried the price will jump before then.
            So you strike a deal with the seller: you pay them £5,000 today, and in return they promise to sell
            you the flat for £300,000 any time in the next three months, <em>if you choose to</em>.
          </p>
          <p className={prose}>
            Notice the shape of that deal. If prices boom and the flat is suddenly worth £350,000, you happily
            pay the agreed £300,000 — you have bagged a £50,000 bargain (minus your £5,000 fee). If prices crash
            to £250,000, you simply walk away: you are out only the £5,000, not the full loss. You bought a{' '}
            <strong>right</strong>, not an <strong>obligation</strong>. That is exactly what a financial option
            is — and the whole subject is just this idea, applied to stocks, with precise vocabulary.
          </p>
          <KeyIdea>
            An option is a contract that gives its owner the <strong>right, but not the obligation</strong>, to
            buy or sell something at a fixed price by a fixed date. You pay up front for that right. Your
            downside is capped at what you paid; your upside is not.
          </KeyIdea>
          <H3>The vocabulary, one word at a time</H3>
          <p className={prose}>
            Every option contract is described by the same handful of terms. Using the flat example as a
            translation guide:
          </p>
        </div>
        <div className="max-w-3xl space-y-4">
          <Table
            headers={['Term', 'What it means', 'In the flat deal']}
            rows={[
              ['Underlying', 'The thing the option is written on (a stock, index, etc.)', 'The flat'],
              ['Strike (K)', 'The fixed price you can transact at', '£300,000'],
              ['Expiry', 'The date the right runs out', 'Three months from now'],
              ['Premium', 'The price you pay up front for the option', '£5,000'],
              ['Exercise', 'Choosing to use your right', 'Going ahead and buying'],
              ['Holder / long', 'The buyer of the option, who owns the right', 'You'],
              ['Writer / short', 'The seller, who takes on the obligation', 'The flat’s seller'],
            ]}
          />
          <PlainEnglish>
            “Long” just means you <em>bought</em> it (you own the right). “Short” means you <em>sold</em> it (you
            took the other side and now have an obligation if the holder exercises). These words are everywhere
            in finance and mean nothing more than bought / sold.
          </PlainEnglish>
        </div>
      </SubSection>

      <SubSection n="1.2" title="Calls, puts, and the two sides" check={checks_1_2}>
        <div className="max-w-3xl space-y-4">
          <p className={prose}>
            There are exactly two basic options, and everything else is built from them.
          </p>
          <H3>A call — the right to BUY</H3>
          <p className={prose}>
            A <strong>call</strong> gives you the right to buy the underlying at the strike. You buy a call when
            you think the price is going <strong>up</strong>: you lock in a low purchase price now, and if the
            market rises above it, you can buy cheaply and pocket the difference. The flat deal above was a call.
          </p>
          <H3>A put — the right to SELL</H3>
          <p className={prose}>
            A <strong>put</strong> gives you the right to <em>sell</em> the underlying at the strike. You buy a
            put when you think the price is going <strong>down</strong>, or to protect something you own. A put
            is essentially an <strong>insurance policy</strong>: if you own a stock at £100 and buy the right to
            sell it at £100, then no matter how far it falls you can still get £100 for it. You pay a premium for
            that peace of mind, exactly like an insurance excess.
          </p>
          <KeyIdea>
            Call = right to buy = a bet (or hope) that the price <strong>rises</strong>. Put = right to sell = a
            bet (or hedge) that the price <strong>falls</strong>. If you only remember one sentence from this
            chapter, make it this one.
          </KeyIdea>
          <H3>Every option has two sides</H3>
          <p className={prose}>
            For every option bought, someone sold it. The buyer (long) pays the premium and gets the right. The
            seller (short, or “writer”) <em>receives</em> the premium and takes on the matching obligation: if
            the holder exercises, the writer must deliver. This is the source of the famous asymmetry.
          </p>
          <p className={prose}>
            The buyer’s worst case is losing the premium — that is it. The seller’s best case is keeping the
            premium — that is it. So the option buyer has limited loss and large potential gain; the seller has
            limited gain and potentially large loss. Sellers accept that lopsided risk because, most of the time,
            options expire worthless and they keep the premium. They are, in effect, running an insurance
            business: collect small premiums often, pay out rarely but sometimes badly.
          </p>
        </div>
      </SubSection>

      <SubSection n="1.3" title="Payoffs at expiry and the four building blocks" check={checks_1_3}>
        <div className="max-w-3xl space-y-5">
          <p className={prose}>
            The clearest way to understand an option is to ask: <em>on the final day, what is it worth?</em> That
            number is called the <strong>payoff</strong>, and it depends only on where the underlying price (call
            it S) ends up relative to the strike (K).
          </p>
          <H3>Walking through a long call</H3>
          <p className={prose}>
            Suppose you own a call with strike £100. On expiry day:
          </p>
          <ul className="space-y-1.5 text-sm text-muted list-disc pl-5">
            <li>If the stock is at £100 or below, your right to buy at £100 is useless — you would not pay £100 for something worth less. You let it expire. Payoff = £0.</li>
            <li>If the stock is at £112, you exercise: buy at £100, instantly worth £112. Payoff = £12.</li>
            <li>If the stock is at £130, payoff = £30. And so on, with no ceiling.</li>
          </ul>
          <p className={prose}>
            In one line, a call’s payoff is the bigger of zero and (S − K):
          </p>
          <Formula>call payoff = max(S − K, 0)</Formula>
          <p className={prose}>
            A put is the mirror image — it pays off when the stock falls <em>below</em> the strike:
          </p>
          <Formula>put payoff = max(K − S, 0)</Formula>

          <H3>Payoff vs profit (P&amp;L)</H3>
          <p className={prose}>
            Payoff ignores what you paid. To get your actual <strong>profit and loss</strong>, subtract the
            premium you spent up front. That shift is why the <strong>breakeven</strong> price is above the strike
            for a call: the stock has to rise enough to first repay your premium.
          </p>
          <Example>
            <p>You buy the £100-strike call for a <strong>£5</strong> premium.</p>
            <p>• At expiry the stock is £112. Payoff = max(112 − 100, 0) = £12. Profit = 12 − 5 = <strong>£7</strong>.</p>
            <p>• At expiry the stock is £103. Payoff = £3, but you paid £5, so profit = <strong>−£2</strong>.</p>
            <p>• Breakeven = strike + premium = 100 + 5 = <strong>£105</strong>. Above £105 you are in profit; below £100 you lose the full £5.</p>
          </Example>
          <H3>The four building blocks</H3>
          <p className={prose}>
            You can be long or short, a call or a put — that is four positions, and <em>every</em> strategy in
            this course is just a combination of them. Here is how each one behaves.
          </p>
          <Table
            headers={['Position', 'Your view', 'Max profit', 'Max loss']}
            rows={[
              ['Long call', 'Strongly up', 'Unlimited', 'Premium paid'],
              ['Short call', 'Flat to down', 'Premium received', 'Unlimited'],
              ['Long put', 'Strongly down', 'Large (strike − 0)', 'Premium paid'],
              ['Short put', 'Flat to up', 'Premium received', 'Large (strike − 0)'],
            ]}
          />
          <PlainEnglish>
            Buying an option (long) always means a known, limited cost and an open-ended payoff. Selling one
            (short) always means a known, limited reward and an open-ended risk. Long = pay for optionality;
            short = get paid to provide it.
          </PlainEnglish>
        </div>
      </SubSection>

      <SubSection n="1.4" title="Moneyness, time value, and exercise style" check={checks_1_4}>
        <div className="max-w-3xl space-y-4">
          <H3>Moneyness: in, at, or out of the money</H3>
          <p className={prose}>
            Traders constantly describe options by how their strike compares to the current price. The jargon is
            simple once you map it back to “would exercising right now make money?”
          </p>
          <ul className="space-y-1.5 text-sm text-muted list-disc pl-5">
            <li><strong className="text-fg">In the money (ITM)</strong> — exercising now would pay off. A call is ITM when the stock is above its strike; a put is ITM when the stock is below.</li>
            <li><strong className="text-fg">At the money (ATM)</strong> — the stock is right at the strike.</li>
            <li><strong className="text-fg">Out of the money (OTM)</strong> — exercising now would be pointless. A call is OTM below its strike; a put is OTM above.</li>
          </ul>
          <p className={prose}>
            Example: stock at £105. The 100-strike call is ITM (you could buy at 100, worth 105). The 100-strike
            put is OTM (why sell at 100 something worth 105?). Flip the stock to £95 and the labels swap.
          </p>
          <H3>Why options cost more than their intrinsic value</H3>
          <p className={prose}>
            An option’s premium splits into two pieces:
          </p>
          <Formula>premium = intrinsic value + time value</Formula>
          <p className={prose}>
            <strong>Intrinsic value</strong> is the payoff if expiry were right now — max(S − K, 0) for a call.
            <strong> Time value</strong> is everything left over. Why would anyone pay extra? Because before
            expiry there is still <em>time for good things to happen</em>. A call that is barely out of the money
            today still has a real chance of finishing deep in the money, and that hope has a price.
          </p>
          <p className={prose}>
            Two consequences worth burning in: an <strong>at-the-money option has zero intrinsic value</strong> —
            its whole premium is time value (a frequent interview gotcha). And time value <strong>decays to zero
            by expiry</strong>, because once there is no time left, there is no hope left — only intrinsic value
            remains. That decay is the “theta” you will meet in Chapter 3.
          </p>
          <H3>One last distinction: European vs American</H3>
          <p className={prose}>
            A <strong>European</strong> option can be exercised only <em>on</em> the expiry date. An{' '}
            <strong>American</strong> option can be exercised <em>any time</em> up to expiry. The names are pure
            convention — nothing to do with geography. Almost all the intuition in this course is built on
            European options because they are simpler; we return to when early exercise actually matters in the
            final chapter.
          </p>
        </div>
      </SubSection>

      <SubSection n="1.5" title="See it for yourself: the payoff builder" check={checks_1_5}>
        <div className="max-w-3xl space-y-3">
          <p className={prose}>
            This is the single most useful habit in options: when in doubt, draw the payoff. The tool below
            plots profit and loss at expiry against where the underlying lands. Try this, in order:
          </p>
          <ul className="space-y-1.5 text-sm text-muted list-disc pl-5">
            <li>Select <strong>Long call</strong> — see the flat loss (the premium) that kinks upward at the strike.</li>
            <li>Switch to <strong>Long put</strong> — the mirror image, sloping up as the price falls.</li>
            <li>Try <strong>Short call</strong> and <strong>Short put</strong> — notice they are the first two flipped upside down (your gain is the buyer’s loss).</li>
            <li>Drag the <strong>premium</strong> up and down and watch the whole line shift vertically — that is the cost moving your breakeven.</li>
          </ul>
        </div>
        <PayoffBuilder />
        <div className="max-w-3xl">
          <InterviewAngle>
            Interviewers rarely ask “define a call.” They ask you to <em>reason</em> with payoffs: “draw the P&amp;L
            of a short put,” or “you own this option and the stock gaps up — what happens?” The candidates who
            shine think in pictures (payoff diagrams) and always separate <em>payoff</em> from{' '}
            <em>profit</em>. Master the four building blocks here and the rest of the course is assembly.
          </InterviewAngle>
        </div>
      </SubSection>
    </div>
  );
}
