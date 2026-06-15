import { SubSection, Formula, KeyIdea, Example, PlainEnglish, InterviewAngle, Table, prose } from '../lessonKit';
import type { QuizQuestion } from '../../../data/optionsCourse';

const checks_2_1: QuizQuestion[] = [
  {
    id: 'chk-parity-1a',
    type: 'mcq',
    prompt: 'What makes put-call parity so powerful compared with other options results?',
    choices: [
      'It holds no matter the volatility, view, or pricing model used.',
      'It only works when the stock is very volatile.',
      'It requires the Black-Scholes model to be true.',
      'It depends on correctly forecasting where the stock will go.',
    ],
    answerIndex: 0,
    explanation:
      'Parity comes purely from the fact that you cannot get something for nothing — it is true regardless of volatility, your view, or any pricing model.',
  },
  {
    id: 'chk-parity-1b',
    type: 'mcq',
    prompt: 'You buy a 100 call and sell a 100 put (same expiry). On expiry day, what do you end up with?',
    choices: [
      'You own the stock, having effectively paid 100 for it, in every case.',
      'You own the stock only if it finishes above 100.',
      'You never own the stock; both options expire worthless.',
      'You owe the difference between the call and put premiums.',
    ],
    answerIndex: 0,
    explanation:
      'In every case you end up owning the stock having paid £100 — above 100 you exercise the call, below 100 the put is exercised against you. That is a synthetic forward purchase.',
  },
];

const checks_2_2: QuizQuestion[] = [
  {
    id: 'chk-parity-2a',
    type: 'numeric',
    prompt:
      'Zero rates. Stock = £100, strike = £100, and the call trades at £8. Using parity, what must the put be worth (in £)?',
    answer: 8,
    tolerance: 0.01,
    unit: '£',
    explanation:
      'Call − Put = Spot − Strike = 100 − 100 = 0, so Put = Call = £8. You priced the put with arithmetic alone — no volatility, no model.',
  },
  {
    id: 'chk-parity-2b',
    type: 'mcq',
    prompt: 'In the parity formula Call − Put = Spot − PV(Strike), why is PV used rather than the raw strike?',
    choices: [
      'Because the strike is paid in the future, so it must be discounted to today’s value.',
      'Because the call premium grows with interest over time.',
      'Because the put is always worth more than the call.',
      'Because volatility reduces the value of the strike.',
    ],
    answerIndex: 0,
    explanation:
      'PV means present value: £100 paid a year from now is worth a bit less than £100 today, so the strike is discounted back. When rates are zero, PV(Strike) = Strike.',
  },
];

const checks_2_3: QuizQuestion[] = [
  {
    id: 'chk-parity-3a',
    type: 'numeric',
    prompt:
      'Zero rates, stock at £100. The 100-call costs £8 and the 100-put £6. You sell the call, buy the put, and buy the stock. How much do you spend today (in £)?',
    answer: 98,
    tolerance: 0.01,
    unit: '£',
    explanation:
      'Net spent = 100 (stock) + 6 (put) − 8 (call) = £98. At expiry you sell the stock for £100, locking in a risk-free £2.',
  },
  {
    id: 'chk-parity-3b',
    type: 'mcq',
    prompt: 'Why does parity hold in real markets despite the conversion arbitrage existing in theory?',
    choices: [
      'Any risk-free profit is hoovered up by traders in seconds, forcing prices back into line.',
      'Regulators set the call and put prices to be equal.',
      'Exchanges ban trading when parity is violated.',
      'The arbitrage requires owning the company, which is impossible.',
    ],
    answerIndex: 0,
    explanation:
      'A conversion turns any parity gap into a guaranteed risk-free profit, so traders pounce instantly and the gap closes — which is precisely why parity holds.',
  },
];

const checks_2_4: QuizQuestion[] = [
  {
    id: 'chk-parity-4a',
    type: 'numeric',
    prompt:
      'Zero rates. The 100-call is £7 and the 100-put is £5. What does parity say the stock (spot) is worth (in £)?',
    answer: 102,
    tolerance: 0.01,
    unit: '£',
    explanation: 'Rearranging parity: Spot = Call − Put + Strike = 7 − 5 + 100 = £102.',
  },
  {
    id: 'chk-parity-4b',
    type: 'mcq',
    prompt: 'According to this sub-chapter, what does parity imply about the implied volatility of a matched call and put?',
    choices: [
      'A single implied volatility number must price both, because they are locked together.',
      'The call always has higher implied volatility than the put.',
      'Implied volatility is irrelevant to parity.',
      'Each leg requires its own independent volatility model.',
    ],
    answerIndex: 0,
    explanation:
      'Because the call and put are locked together by parity, one volatility number must price both.',
  },
];

const checks_2_5: QuizQuestion[] = [
  {
    id: 'chk-parity-5a',
    type: 'mcq',
    prompt: 'Which of these is NOT listed as a reason parity can appear to "break" in the real world?',
    choices: [
      'The stock’s realised volatility rising sharply.',
      'Dividends paid before expiry.',
      'Borrow costs on hard-to-short stocks.',
      'Early-exercise rights on American options.',
    ],
    answerIndex: 0,
    explanation:
      'The listed causes are dividends, borrow costs, early exercise, and funding/frictions. Realised volatility is not one of them — parity is model- and volatility-independent.',
  },
  {
    id: 'chk-parity-5b',
    type: 'mcq',
    prompt: 'What is the professional reflex when a parity relationship looks off in live markets?',
    choices: [
      'Ask what the gap is secretly compensating for before assuming it is free money.',
      'Immediately execute the conversion for guaranteed profit.',
      'Assume the exchange has made a pricing error.',
      'Ignore it, since parity can never look off.',
    ],
    answerIndex: 0,
    explanation:
      'A standing "violation" is almost never a gift — it usually compensates for a dividend, borrow cost, early-exercise right, or funding. Only after ruling those out is it a trade.',
  },
];

export default function Parity() {
  return (
    <div className="space-y-12">
      <SubSection n="2.1" title="The most useful equation in options" check={checks_2_1}>
        <p className={prose}>
          Put-call parity is a relationship that ties together four things: the price of a call, the price of a
          put, the price of the stock, and the strike. It is the first “aha” of options theory because it is{' '}
          <strong>true no matter what</strong> — it does not depend on how volatile the stock is, where you
          think it is going, or any pricing model. It comes purely from the fact that you cannot get something
          for nothing.
        </p>
        <p className={prose}>
          Before the equation, the idea in words: <strong>a call and a put can be combined to perfectly
          recreate owning the stock.</strong> If two recipes produce the same result, they must cost the same —
          and that single sentence is the whole chapter.
        </p>
        <p className={prose}>
          Do this trade: <strong>buy a call</strong> and <strong>sell a put</strong>, both with strike £100 and
          the same expiry. What do you end up with on expiry day? Let us check every possibility by where the
          stock (S) lands.
        </p>
        <Table
          headers={['At expiry', 'Your call', 'Your short put', 'Net result']}
          rows={[
            ['S above 100 (e.g. 120)', 'You exercise: buy at 100', 'Expires worthless', 'You own stock, paid 100'],
            ['S below 100 (e.g. 80)', 'Expires worthless', 'Buyer exercises it against you: you must buy at 100', 'You own stock, paid 100'],
            ['S exactly 100', 'Worthless either way', 'Worthless either way', 'You can buy at 100'],
          ]}
        />
        <p className={prose}>
          Look at the right-hand column: <strong>in every single case you end up owning the stock, having paid
          £100 for it.</strong> That is exactly what a <em>forward contract</em> to buy the stock at £100 does.
          So “long call + short put” is a synthetic forward purchase of the stock. The options have rebuilt the
          stock out of spare parts.
        </p>
        <KeyIdea>
          Long call + short put (same strike, same expiry) = an agreement to buy the stock at the strike. The
          options package behaves identically to a forward on the stock.
        </KeyIdea>
      </SubSection>

      <SubSection n="2.2" title="Turning the idea into the formula" check={checks_2_2}>
        <p className={prose}>
          If buying the call and selling the put guarantees you buy the stock at the strike later, then the
          cost of that options package today must equal the cost of arranging to buy the stock at the strike
          today. That cost is: the stock’s price now, minus the value today of the £100 you will pay later.
        </p>
        <Formula>Call − Put = Spot − PV(Strike)</Formula>
        <PlainEnglish>
          “PV” means present value. £100 paid a year from now is worth a bit less than £100 today, because £100
          today could earn interest in the meantime. PV(Strike) is just the strike discounted back to today.
          When interest rates are zero (a common simplifying assumption in interviews), PV(Strike) = Strike and
          the formula becomes the clean <strong>Call − Put = Spot − Strike</strong>.
        </PlainEnglish>
        <Example title="Pricing a put you cannot see">
          <p>Zero rates. Stock = £100, strike = £100, and the call trades at £8. What must the put be worth?</p>
          <p>Parity: Call − Put = Spot − Strike = 100 − 100 = 0. So Put = Call = <strong>£8</strong>.</p>
          <p>
            You just priced a put using only the call price and arithmetic — no volatility, no model. That is
            the everyday magic of parity.
          </p>
        </Example>
      </SubSection>

      <SubSection n="2.3" title="Why it can’t be violated: the arbitrage" check={checks_2_3}>
        <p className={prose}>
          Suppose parity were broken. With zero rates, stock at £100, say the 100-call costs £8 but the 100-put
          only £6. The formula demands Call − Put = 0, but here it is +2 — the call is £2 “too rich.” A trader
          would pounce with a trade called a <strong>conversion</strong>:
        </p>
        <ul className="space-y-1.5 text-sm text-muted list-disc pl-5">
          <li><strong className="text-fg">Sell</strong> the expensive call: receive £8.</li>
          <li><strong className="text-fg">Buy</strong> the cheap put: pay £6.</li>
          <li><strong className="text-fg">Buy</strong> the stock: pay £100.</li>
          <li>Net spent today: 100 + 6 − 8 = <strong>£98</strong>.</li>
        </ul>
        <p className={prose}>
          At expiry you are <em>certain</em> to sell the stock for £100 — above 100 the call you sold is
          exercised against you (you deliver at 100); below 100 you exercise your put (you sell at 100). Either
          way: £100 in, £98 out, a <strong>risk-free £2</strong>. Free money like this gets hoovered up in
          seconds, which is precisely why, in real markets, parity holds.
        </p>
      </SubSection>

      <SubSection n="2.4" title="What parity is good for" check={checks_2_4}>
        <ul className="space-y-2 text-sm text-muted list-disc pl-5">
          <li><strong className="text-fg">Price one from the other.</strong> Know a call price, get the put price (and vice versa) instantly.</li>
          <li><strong className="text-fg">Spot mispricings.</strong> If the relationship looks broken, either there is free money or — far more often — something you have not accounted for.</li>
          <li><strong className="text-fg">Same implied volatility.</strong> Because the call and put are locked together, a single volatility number must price both. (More on implied vol in Chapter 5.)</li>
          <li><strong className="text-fg">Build synthetics.</strong> Long call + short put = long stock; rearrange to manufacture whatever leg you need.</li>
        </ul>
        <Example title="A synthetic stock">
          <p>Zero rates. The 100-call is £7, the 100-put is £5. What does parity say the stock is worth?</p>
          <p>Rearrange: Spot = Call − Put + Strike = 7 − 5 + 100 = <strong>£102</strong>.</p>
        </Example>
      </SubSection>

      <SubSection n="2.5" title="When parity “breaks” in the real world" check={checks_2_5}>
        <p className={prose}>
          Occasionally the relationship really does look off in live markets. The professional reflex is{' '}
          <em>not</em> “free money!” but “what is this gap secretly paying for?” Usually it is one of:
        </p>
        <ul className="space-y-1.5 text-sm text-muted list-disc pl-5">
          <li><strong className="text-fg">Dividends.</strong> If the stock pays a dividend before expiry, the holder of the stock (not the options) collects it, which shifts the relationship.</li>
          <li><strong className="text-fg">Borrow costs.</strong> Hard-to-short stocks are expensive or impossible to borrow, so the arbitrage that enforces parity cannot be done cheaply.</li>
          <li><strong className="text-fg">Early exercise.</strong> American options carry extra optionality that European parity does not capture.</li>
          <li><strong className="text-fg">Funding and frictions.</strong> Real traders pay to finance positions and cross bid-ask spreads.</li>
        </ul>
        <KeyIdea>
          A standing parity “violation” is almost never a gift — it is compensation for a dividend, a borrow
          cost, an early-exercise right, or funding. Only once you have ruled all of those out is it a trade.
        </KeyIdea>
        <InterviewAngle>
          Parity is a classic warm-up: “Given the call, what is the put?” or “Here is a relationship that looks
          arbitrageable — is it?” The strong answer states the synthetic-forward intuition first (“buying the
          call and selling the put just locks in buying the stock at the strike”), writes the formula, and then —
          crucially — asks what a real-world gap is compensating for. That last move signals you think like a
          trader, not a textbook.
        </InterviewAngle>
      </SubSection>
    </div>
  );
}
