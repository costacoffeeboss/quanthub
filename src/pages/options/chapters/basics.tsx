import PayoffBuilder from '../../../components/options/PayoffBuilder';
import { H, H3, Formula, KeyIdea, Example, PlainEnglish, InterviewAngle, Table, prose } from '../lessonKit';

export default function Basics() {
  return (
    <div className="space-y-12">
      <section className="space-y-3 max-w-3xl">
        <H>Start with something you already understand</H>
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
      </section>

      <section className="space-y-4 max-w-3xl">
        <H>The vocabulary, one word at a time</H>
        <p className={prose}>
          Every option contract is described by the same handful of terms. Using the flat example as a
          translation guide:
        </p>
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
      </section>

      <section className="space-y-4 max-w-3xl">
        <H>Two kinds of option: calls and puts</H>
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
      </section>

      <section className="space-y-4 max-w-3xl">
        <H>Every option has two sides</H>
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
      </section>

      <section className="space-y-5 max-w-3xl">
        <H>What happens at expiry — the payoff</H>
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
      </section>

      <section className="space-y-4 max-w-3xl">
        <H>The four building blocks</H>
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
      </section>

      <section className="space-y-4 max-w-3xl">
        <H>Moneyness: in, at, or out of the money</H>
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
      </section>

      <section className="space-y-4 max-w-3xl">
        <H>Why options cost more than their intrinsic value</H>
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
      </section>

      <section className="space-y-3 max-w-3xl">
        <H>One last distinction: European vs American</H>
        <p className={prose}>
          A <strong>European</strong> option can be exercised only <em>on</em> the expiry date. An{' '}
          <strong>American</strong> option can be exercised <em>any time</em> up to expiry. The names are pure
          convention — nothing to do with geography. Almost all the intuition in this course is built on
          European options because they are simpler; we return to when early exercise actually matters in the
          final chapter.
        </p>
      </section>

      <section className="space-y-4">
        <div className="max-w-3xl space-y-3">
          <H>See it for yourself: the payoff builder</H>
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
      </section>

      <section className="max-w-3xl">
        <InterviewAngle>
          Interviewers rarely ask “define a call.” They ask you to <em>reason</em> with payoffs: “draw the P&amp;L
          of a short put,” or “you own this option and the stock gaps up — what happens?” The candidates who
          shine think in pictures (payoff diagrams) and always separate <em>payoff</em> from{' '}
          <em>profit</em>. Master the four building blocks here and the rest of the course is assembly.
        </InterviewAngle>
      </section>
    </div>
  );
}
