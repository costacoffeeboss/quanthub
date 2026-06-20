import { useState, type ReactNode } from 'react';
import { Premium, Paywall, LockBadge, useEntitlement } from '../lib/premium';

// ─────────────────────────────────────────────────────────────────────────
// The roadmap — a staged plan from a year out to signing
// ─────────────────────────────────────────────────────────────────────────
const stages = [
  {
    when: '12+ months out',
    title: 'Build the raw material',
    blurb:
      'Nothing here is urgent yet, which is exactly why it is the most valuable time you have. The people who look effortless in interviews mostly just started early.',
    items: [
      'Get genuinely quick at mental arithmetic. Ten minutes a day for a term beats a frantic week before the Optiver test — speed is a trained reflex, not a talent. The Games tab is built for this.',
      'Take probability seriously at university. It is the single highest-yield subject for every quant role, trader or researcher. Work problems with a pen; passively reading lecture notes feels like progress and mostly is not.',
      'Learn one language properly — Python for almost everyone, plus C++ if you are aiming at low-latency dev. One project you can defend under questioning beats five tutorials you half-remember.',
      'First-years: this is spring-week and insight-season territory already. The deadlines are absurdly early — see the section near the bottom before you assume you have time.',
    ],
  },
  {
    when: 'Summer before applications',
    title: 'Get ready to fire',
    blurb:
      'The goal of the summer is that when applications open you are loading, not building. Everything below is easier in July than in a panicked October.',
    items: [
      'Finalise a one-page CV now, not the night before a deadline. Use the template further down to get the format right, then spend your energy on the words.',
      'Build a target list in the Tracker: 10–20 firms across tiers, with their typical application windows noted. A spread of reaches, matches and safeties — same logic as university applications.',
      'Start a brainteaser habit — a few questions a week from the Questions tab, done properly on paper before you peek at the solution. The struggle is the part that sticks.',
      'Ship one real project (see below). It is the single best summer investment: it gives you something to talk about, proves you can finish things, and quietly teaches you the material.',
    ],
  },
  {
    when: 'Applications open (Aug–Oct)',
    title: 'Apply early — it genuinely matters',
    blurb:
      'This is the part people get wrong by being perfectionists. Quant recruiting rewards the prompt over the polished.',
    items: [
      'Most firms review on a rolling basis. The same application is strictly stronger in week one than week eight, because seats are still open and the bar has not crept up. Submitting early is free alpha.',
      'Apply in waves: a couple of lower-stakes firms first as warm-ups, then your top choices once you have a real process or two under your belt and know how you come across.',
      'Log every application in the Tracker the moment you send it. By December you will not remember which CV version went where, or what stage you are at with whom.',
      'Do not agonise over cover letters for prop shops — most never read them. Banks care more, so keep one solid, lightly-tailored paragraph in reserve for those.',
    ],
  },
  {
    when: 'Online tests (rolling, Sep–Dec)',
    title: 'The numerical gauntlet',
    blurb:
      'The most preventable rejection in the whole pipeline lives here. These tests filter brutally, and almost entirely on preparation you could have done.',
    items: [
      'Optiver-style: roughly 80 arithmetic questions in 8 minutes, no calculator. Accuracy matters as much as speed — many versions penalise wrong answers, so reckless guessing is worse than skipping.',
      'Others lean on sequence and pattern tests (Zap-N style), short probability quizzes, or HackerRank coding for dev and research roles. Know which kind your target firm uses before test day.',
      'Practise under real time pressure. Untimed practice barely transfers — the clock is the actual skill being tested. Recreate the constraint, not just the questions.',
      'Sit them fresh, in the morning, on a wired connection if you can. Losing a seat to a dropped connection or a 2am attempt is the most avoidable mistake in this entire process.',
    ],
  },
  {
    when: 'Interviews (Oct–Mar)',
    title: 'Where the prep pays off',
    blurb:
      'By now the work is mostly done; interviews reward composure and honesty more than last-minute cramming. They are watching how you think, not whether you already know the answer.',
    items: [
      'Phone and video rounds: brainteasers and probability with a trader or researcher. Think out loud — to the person on the other end, silence is indistinguishable from being stuck, even when you are flying.',
      'Trading interviews: market-making games ("make me a market on…"), sequential betting, sizing under uncertainty. Play the games here until quoting a two-sided market feels like a reflex rather than a calculation.',
      'Research interviews: statistics past the brainteaser level, and your own projects. Expect "how would you test whether this signal is real?" — and be ready to be wrong gracefully and update on the spot.',
      '"I don\'t know, but here is how I\'d work it out" — followed by an honest attempt — is often exactly the sentence they are hoping to hear. Confident bluffing is the fastest way to lose a sharp interviewer.',
    ],
  },
  {
    when: 'Offer (Nov onwards)',
    title: 'Decide like a quant',
    blurb:
      'You spent a year optimising to get the offer. Spend a week optimising the decision — it compounds for the rest of your career.',
    items: [
      'Exploding offers happen, and you can almost always ask for more time politely; firms expect it and rarely rescind over a reasonable request. Get every deadline in writing.',
      'Compare seats, not headline numbers. Who trains you, what you would actually work on day to day, and how recent grads have progressed matter far more than £10k of year-one comp.',
      'Ask to speak to a grad on the team before you sign. Good firms always say yes, and the conversation tells you something useful whether the answer is warm or oddly guarded.',
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────
// Build something real — two step-by-step Python projects
// ─────────────────────────────────────────────────────────────────────────
type Step = { title: string; body: string; code?: string; checkpoint?: string };
type Project = {
  id: string;
  name: string;
  tagline: string;
  meta: { lang: string; time: string; level: string };
  why: string;
  steps: Step[];
  stretch: string[];
  interview: string;
};

const projects: Project[] = [
  {
    id: 'options-pricer',
    name: 'An options pricing model',
    tagline: 'Price an option three independent ways, watch them agree, then back out the market’s implied volatility.',
    meta: { lang: 'Python', time: '2–4 weekends', level: 'Intermediate' },
    why:
      'This is the canonical quant first project for a reason. It forces you to actually understand Black–Scholes rather than recite it, it touches probability, numerical methods and a little finance, and it gives you a dozen natural interview questions you can answer from memory because you built the thing. Aim for three pricing methods that agree to within numerical noise — when a closed form, a tree and a simulation all spit out the same number, you understand the object.',
    steps: [
      {
        title: 'Set up and scope it honestly',
        body:
          'Make a fresh virtual environment and install numpy, scipy and matplotlib. Keep the scope tight for v1: European call and put options on a single non-dividend-paying stock. Resist adding features until the core is correct — a small thing that works beats a sprawling thing that almost does.',
        code: `python -m venv .venv && source .venv/bin/activate
pip install numpy scipy matplotlib
# project layout
#   pricer/black_scholes.py
#   pricer/binomial.py
#   pricer/monte_carlo.py
#   tests/test_pricer.py`,
        checkpoint: 'You can import numpy in a fresh shell and your folders exist. That is the whole checkpoint — do not skip the boring setup.',
      },
      {
        title: 'Closed form: Black–Scholes',
        body:
          'Implement the closed-form price for a European call and put. The only subtlety is d1 and d2; everything else is plugging in. Use scipy’s normal CDF. Then sanity-check with put–call parity: C − P should equal S − K·e^(−rT). If it does not, your formula is wrong, not the market.',
        code: `import numpy as np
from scipy.stats import norm

def bs_price(S, K, T, r, sigma, kind="call"):
    d1 = (np.log(S / K) + (r + 0.5 * sigma**2) * T) / (sigma * np.sqrt(T))
    d2 = d1 - sigma * np.sqrt(T)
    if kind == "call":
        return S * norm.cdf(d1) - K * np.exp(-r * T) * norm.cdf(d2)
    return K * np.exp(-r * T) * norm.cdf(-d2) - S * norm.cdf(-d1)`,
        checkpoint: 'Price a call and put with the same inputs and confirm put–call parity holds to ~1e-10.',
      },
      {
        title: 'The Greeks — and check them numerically',
        body:
          'Add analytic delta, gamma, vega, theta and rho. Then verify each one with a finite difference: bump the input by a tiny amount, re-price, and compare the slope to your formula. This single habit — analytic value cross-checked against a numerical bump — is most of what numerical quant work actually is, and it impresses interviewers because it shows you do not trust your own algebra blindly.',
        code: `def delta_fd(S, K, T, r, sigma, h=1e-4, kind="call"):
    up = bs_price(S + h, K, T, r, sigma, kind)
    dn = bs_price(S - h, K, T, r, sigma, kind)
    return (up - dn) / (2 * h)          # compare to analytic norm.cdf(d1)`,
        checkpoint: 'Every analytic Greek matches its finite-difference estimate to ~4 significant figures.',
      },
      {
        title: 'A binomial tree (and why it must converge)',
        body:
          'Build a Cox–Ross–Rubinstein tree: at each step the price moves up by u or down by d, with risk-neutral probability p. Price by working backwards from the payoffs at expiry. As you increase the number of steps, the tree price should march towards your Black–Scholes number — seeing that convergence happen is the moment the maths stops being symbols. As a bonus, a tree handles American early exercise, which the closed form cannot.',
        code: `def crr_price(S, K, T, r, sigma, steps=500, kind="call"):
    dt = T / steps
    u = np.exp(sigma * np.sqrt(dt)); d = 1 / u
    p = (np.exp(r * dt) - d) / (u - d)
    j = np.arange(steps + 1)
    ST = S * u**j * d**(steps - j)
    val = np.maximum(ST - K, 0) if kind == "call" else np.maximum(K - ST, 0)
    for _ in range(steps):
        val = np.exp(-r * dt) * (p * val[1:] + (1 - p) * val[:-1])
    return val[0]`,
        checkpoint: 'crr_price with 1,000 steps lands within a cent of bs_price for the same inputs. Plot price vs steps to see the convergence.',
      },
      {
        title: 'Monte Carlo — and quantify your own error',
        body:
          'Simulate the stock’s terminal price under geometric Brownian motion, average the discounted payoff, and you have a third independent price. The important professional habit here is reporting the standard error, not just the estimate — a Monte Carlo number without an error bar is meaningless. Then add antithetic variates (pair each random draw with its negative) and watch the error shrink for free.',
        code: `def mc_price(S, K, T, r, sigma, n=200_000, kind="call", seed=0):
    rng = np.random.default_rng(seed)
    z = rng.standard_normal(n // 2)
    z = np.concatenate([z, -z])                 # antithetic variates
    ST = S * np.exp((r - 0.5 * sigma**2) * T + sigma * np.sqrt(T) * z)
    payoff = np.maximum(ST - K, 0) if kind == "call" else np.maximum(K - ST, 0)
    disc = np.exp(-r * T) * payoff
    return disc.mean(), disc.std(ddof=1) / np.sqrt(n)   # price, standard error`,
        checkpoint: 'Your MC price sits within ~2 standard errors of the Black–Scholes price, and the error visibly falls as n grows.',
      },
      {
        title: 'Invert it: implied volatility and the smile',
        body:
          'Real markets quote prices, not volatilities — so the genuinely useful skill is going backwards: given a market price, find the sigma that reproduces it. Use a root-finder (Brent’s method) on "model price minus market price". Then pull a real option chain with yfinance and plot implied vol against strike. You will see the volatility smile, the single clearest piece of evidence that the Black–Scholes assumption of constant volatility is wrong — which is a fantastic thing to be able to discuss.',
        code: `from scipy.optimize import brentq

def implied_vol(price, S, K, T, r, kind="call"):
    f = lambda sig: bs_price(S, K, T, r, sig, kind) - price
    return brentq(f, 1e-6, 5.0)         # search vol in (0%, 500%)`,
        checkpoint: 'Price an option at a known sigma, feed that price back in, and recover the original sigma. Then plot a real smile from live data.',
      },
      {
        title: 'Validate, visualise, and write it up',
        body:
          'Turn it into something a stranger can run. Add a few pytest tests (parity, cross-method agreement, IV round-trip). Produce three or four clean plots: price vs spot, the Greeks across strikes, MC convergence, and the vol smile. Write a README that states your assumptions and — crucially — where the model breaks. A project that names its own limitations reads as far more mature than one that claims to be perfect.',
        checkpoint: 'A new person can clone the repo, run the tests green, and regenerate every plot with one command.',
      },
    ],
    stretch: [
      'Add continuous dividends (or discrete dividend dates) and re-verify parity.',
      'Price American options by least-squares Monte Carlo (Longstaff–Schwartz) and compare to the tree.',
      'Build a full implied-vol surface across strikes and maturities and render it as a 3D plot.',
      'Calibrate a simple stochastic-vol or local-vol model to a real smile and discuss the fit.',
    ],
    interview:
      'Be ready to explain why three different methods land on the same number (they are all computing a risk-neutral expectation), state put–call parity from memory, and say precisely which Black–Scholes assumptions the volatility smile violates. If you added variance reduction, explain why antithetic variates work. The point of the project is that every one of these answers is something you discovered yourself, not something you memorised.',
  },
  {
    id: 'live-trader',
    name: 'A live trading game (adverse selection)',
    tagline: 'Build the market-making sim that teaches the lesson every trading interview probes: why making markets to informed counterparties is dangerous.',
    meta: { lang: 'Python', time: '2–3 weekends', level: 'Intermediate' },
    why:
      'Play the Adverse Selection game in the Games tab first — this project is you building your own version of it, which is the fastest way to truly internalise the dynamic. You will end up understanding, in your hands rather than in the abstract, why a spread exists, why you widen it against informed flow, and why inventory is a risk in itself. That understanding is the entire substance of a trading interview, and "I built a market-making simulator to study adverse selection" is a sentence that earns follow-up questions you will be delighted to get.',
    steps: [
      {
        title: 'Model the world and one round',
        body:
          'Each round, draw a hidden "true value" for an asset. There are two kinds of counterparty: informed traders, who see the true value (or a noisy signal of it), and noise traders, who trade for reasons unrelated to value. You are the market maker: you must quote a two-sided price that both kinds can trade against. Start by writing just the data structures and a single round on paper, in code.',
        code: `from dataclasses import dataclass
import numpy as np

@dataclass
class Round:
    true_value: float
    informed: bool          # is this round's taker informed?

def new_round(rng, p_informed=0.4):
    return Round(true_value=rng.normal(100, 10),
                 informed=rng.random() < p_informed)`,
        checkpoint: 'You can generate a round and print whether the incoming trader is informed and what the asset is really worth.',
      },
      {
        title: 'Your quote: a two-sided market',
        body:
          'You publish a bid and an ask around your best estimate of value. The distance between them — the spread — is your compensation for risk. Quote too tight and you get picked off; quote too wide and nobody trades with you and you earn nothing. This tension is the whole game.',
        code: `@dataclass
class Quote:
    bid: float
    ask: float
    size: int = 1

def make_quote(estimate, half_spread):
    return Quote(bid=estimate - half_spread, ask=estimate + half_spread)`,
        checkpoint: 'Given an estimate and a half-spread you produce a sane bid/ask with bid < ask.',
      },
      {
        title: 'The counterparty logic — this is the heart of it',
        body:
          'Informed traders trade only when your quote is wrong in their favour: they lift your ask when it sits below the true value, and hit your bid when it sits above. That means every informed trade moves against you the instant it happens — that is adverse selection, in one sentence. Noise traders, by contrast, buy or sell at random, indifferent to value. Your edge comes entirely from noise traders; informed traders are a tax you manage but cannot avoid.',
        code: `def counterparty_trade(round_, quote):
    if round_.informed:
        if quote.ask < round_.true_value:
            return "buy"      # they lift your cheap offer — you're now short below value
        if quote.bid > round_.true_value:
            return "sell"     # they hit your rich bid — you're now long above value
        return None           # quote straddles value: informed sees no edge, passes
    return "buy" if np.random.random() < 0.5 else "sell"  # noise: coin flip`,
        checkpoint: 'Informed traders only ever trade when it hurts you; noise traders trade regardless. Verify by printing many rounds.',
      },
      {
        title: 'Fills, inventory and PnL',
        body:
          'When a trade happens, update your inventory (you bought or sold a unit) and your cash. At the end of each round, mark your inventory to the true value to see your real profit and loss. Track inventory separately from cash — carrying a big position into the next round is a risk even before you have lost anything on it.',
        code: `class Book:
    def __init__(self): self.inv = 0; self.cash = 0.0
    def fill(self, side, price, size=1):
        if side == "buy":   self.inv += size; self.cash -= price * size   # they bought -> you sold
        elif side == "sell":self.inv -= size; self.cash += price * size
    def pnl(self, true_value):
        return self.cash + self.inv * true_value`,
        checkpoint: 'After a sequence of trades your PnL equals captured spread minus what adverse selection cost you. Reconcile it by hand for three rounds.',
      },
      {
        title: 'The game loop',
        body:
          'Wire it together: run N rounds, show the player the state, take a bid/ask (and size) from input, resolve the trade, and report running PnL and inventory. Seed the random number generator so a run is reproducible — you will thank yourself when debugging, and it lets you compare strategies on identical sequences.',
        code: `def play(rounds=20, seed=0):
    rng = np.random.default_rng(seed)
    book, est = Book(), 100.0
    for i in range(rounds):
        r = new_round(rng)
        bid = float(input(f"[{i}] inv={book.inv} pnl={book.pnl(est):.1f}  bid> "))
        ask = float(input("ask> "))
        side = counterparty_trade(r, Quote(bid, ask))
        if side: book.fill(side, ask if side == "buy" else bid)
        print(f"   traded={side}  true={r.true_value:.1f}  pnl={book.pnl(r.true_value):.1f}")`,
        checkpoint: 'You can play twenty rounds end to end and your PnL feels punishing when you quote tight — that feeling is the lesson landing.',
      },
      {
        title: 'Skew your quotes to manage inventory',
        body:
          'Once you are carrying inventory, a symmetric quote is a mistake. If you are long, you want to sell more than you buy, so shade both your bid and ask downward to make selling to you less attractive and buying from you more so. Add an inventory penalty to your estimate and watch your PnL stabilise — you have just reinvented the core of real market-making.',
        code: `def skewed_quote(fair, half_spread, inventory, k=0.5):
    skew = -k * inventory               # long -> quote lower to shed risk
    mid = fair + skew
    return Quote(bid=mid - half_spread, ask=mid + half_spread)`,
        checkpoint: 'With skewing on, your inventory mean-reverts toward zero instead of drifting, and large drawdowns get rarer.',
      },
      {
        title: 'Attribute your PnL — where did the money come from?',
        body:
          'Add a stats layer that splits your result into spread captured (the good part, mostly from noise traders) versus adverse selection paid (the bad part, from informed traders). Seeing the two numbers separately is the single most clarifying thing you can build here: it shows in black and white that widening your spread trades volume for protection. Plot both as you vary your half-spread and you have an optimisation story for your README.',
        checkpoint: 'You can produce a chart of PnL vs half-spread with a clear interior maximum — too tight and adverse selection eats you, too wide and you trade nothing.',
      },
    ],
    stretch: [
      'Add several informed bots with different signal quality and watch how their mix changes your optimal spread.',
      'Replace single quotes with a small limit order book and let multiple participants rest orders.',
      'Write an automated market-making bot using your skew rule and have it play thousands of rounds to estimate the optimal half-spread numerically.',
      'Let the true value follow a random walk within a round so you must update your estimate from the order flow itself.',
    ],
    interview:
      'You can now define adverse selection cleanly, explain why the bid–ask spread is compensation for both inventory risk and informed flow, and describe exactly how you would skew quotes given a position — with a concrete example from your own sim. When an interviewer says "make me a market," you will be quoting from a place of having felt the consequences, not guessing. That difference is audible.',
  },
];

// ─────────────────────────────────────────────────────────────────────────
// Books — with honest notes and a per-role focus map
// ─────────────────────────────────────────────────────────────────────────
const books = [
  {
    title: 'A Practical Guide to Quantitative Finance Interviews',
    author: 'Xinfeng Zhou',
    tag: 'The green book',
    note: 'The closest thing to a canon for quant interview prep — brainteasers through probability, stochastic calculus and a little finance. Dense and not always gently explained, but comprehensive. Work it with a pen and solve before reading the solution, or it teaches you nothing.',
  },
  {
    title: 'Heard on the Street',
    author: 'Timothy Falcon Crack',
    tag: 'The classic',
    note: 'The original question collection, strongest on the probability and derivatives questions banks actually ask. The "thinking" and "logic" sections are great warm-ups; the quantitative finance section is more bank- than prop-flavoured.',
  },
  {
    title: 'Fifty Challenging Problems in Probability',
    author: 'Frederick Mosteller',
    tag: 'Short and brutal',
    note: 'Tiny, cheap, and merciless in the best way. Fifty problems, no padding. If you can do all of them cold, probability interviews will hold very little fear. The best value-per-page on this list.',
  },
  {
    title: 'Introduction to Probability',
    author: 'Blitzstein & Hwang',
    tag: 'The foundation',
    note: 'The book to fix shaky probability, intuition-first rather than proof-first. Pairs with the free Harvard Stat 110 lectures (see the courses section). If brainteasers feel like magic tricks rather than consequences, start here and they stop being mysterious.',
  },
  {
    title: 'Option Volatility and Pricing',
    author: 'Sheldon Natenberg',
    tag: 'Trader intuition',
    note: 'The options book traders recommend to each other. On a first read, chase the intuition — what the Greeks mean, how volatility behaves — and let the formulas wash over you. It is about how options actually feel to trade, not about passing a maths exam.',
  },
  {
    title: 'Quant Job Interview Questions and Answers',
    author: 'Mark Joshi',
    tag: 'Derivatives-heavy',
    note: 'Especially good for bank and derivatives-flavoured research roles, and refreshingly honest about what different desks actually ask. Heavier on C++ and stochastic calculus than a pure prop trader needs.',
  },
];

const bookFocus = [
  {
    role: 'Trader',
    text: 'Live in Mosteller and the probability/brainteaser sections of Heard on the Street and the green book. Read Natenberg for options intuition. You do not need the stochastic-calculus chapters of Joshi for prop interviews — spend that time playing the market-making games instead.',
  },
  {
    role: 'Researcher',
    text: 'Blitzstein & Hwang cover to cover is the foundation; then the probability and statistics depth in the green book. Mosteller keeps you sharp. Add a proper statistics or machine-learning text from your degree — research interviews go deeper than any interview-prep book will take you.',
  },
  {
    role: 'Developer',
    text: 'Joshi is the most relevant of these for derivatives-dev roles, but honestly your time is better spent on algorithms (think Cracking the Coding Interview / competitive programming) and C++ depth. Skim the green book for the brainteasers that still show up, and otherwise treat this list as secondary.',
  },
];

// ─────────────────────────────────────────────────────────────────────────
// Free courses & lectures
// ─────────────────────────────────────────────────────────────────────────
const courses = [
  {
    title: 'Harvard Stat 110: Probability',
    who: 'Joe Blitzstein',
    note: 'The single best free probability course for this path — the lectures that pair with Blitzstein & Hwang. Watch it before grinding brainteasers and the brainteasers start to feel inevitable rather than clever.',
    href: 'https://projects.iq.harvard.edu/stat110',
  },
  {
    title: 'MIT 6.041 / 6.431: Probabilistic Systems Analysis',
    who: 'MIT OpenCourseWare',
    note: 'A rigorous, well-taught alternative or complement to Stat 110, with full problem sets and exams. Free on OCW. Heavier on engineering applications, which some people find clarifying.',
    href: 'https://ocw.mit.edu',
  },
  {
    title: 'Essence of Linear Algebra / Calculus',
    who: '3Blue1Brown',
    note: 'Not interview prep, but the fastest way to repair geometric intuition for the maths underneath everything else. Worth it for the visual model of what a matrix or a derivative actually does.',
    href: 'https://www.3blue1brown.com',
  },
  {
    title: 'QuantEcon',
    who: 'Sargent & Stachurski',
    note: 'Free, high-quality lectures on quantitative economics and the scientific Python stack (NumPy, simulation, dynamic programming). Excellent for turning "I know Python" into "I can model things in Python".',
    href: 'https://quantecon.org',
  },
];

// ─────────────────────────────────────────────────────────────────────────
// Honest advice by track
// ─────────────────────────────────────────────────────────────────────────
const honestAdvice = [
  {
    title: 'Trader track',
    text: 'Your prep is probability, expected-value instincts, mental speed and game-theoretic thinking. You do not need to grind LeetCode, and you do not need stochastic calculus for prop-shop interviews. What you do need is to be comfortable making decisions with incomplete information, out loud, at speed — and being wrong without it rattling you. The market-making and EV games here are the most direct practice that exists short of the real interview.',
  },
  {
    title: 'Dev track',
    text: 'Your prep is algorithms, systems, and — for low-latency firms — genuine C++ depth. Brainteasers turn up but are secondary. Competitive programming is the single strongest signal for HFT dev roles; a good Codeforces or ICPC record opens doors a CV cannot. You do not need finance knowledge going in (firms teach it), but visible curiosity about markets sets you apart from generic software candidates.',
  },
  {
    title: 'Research track',
    text: 'Your prep is statistics and probability well beyond the brainteaser level, plus the ability to discuss your own projects with total honesty about their limitations. Overclaiming a result is the fastest way to fail a research interview — researchers are professionally suspicious people, and "the backtest looked great" without caveats is a red flag, not a selling point. Know how you would try to break your own findings.',
  },
];

// ─────────────────────────────────────────────────────────────────────────
// CV advice
// ─────────────────────────────────────────────────────────────────────────
const cvTips = [
  'One page. No exceptions at graduate level — a second page reads as an inability to prioritise, which is precisely the trait the job punishes.',
  'Lead with what the filters select on: degree, university, grades, and any maths-competition results. A quant CV gets about twenty seconds on a first pass, almost all of it the top third. Front-load accordingly.',
  'Quantify everything you can. "Improved simulation runtime 40×" beats "optimised code" every time — numbers are the native language of the people reading it, and a CV full of them signals you think the right way.',
  'Projects: one or two, each described as what you built, what was genuinely hard, and what the result was. An honest trading bot with documented limitations reads far better than an overfit "200% return" claim — and you will be probed on the claim, so make sure it survives contact.',
  'Cut the filler skills. "Microsoft Word" and four languages listed at "basic" actively cost you credibility. List only what you would happily take an interview question on, because you might.',
  'For traders, concrete game achievements — poker, chess, bridge, anything with a rating or a placing — are genuinely relevant signals; include them. For devs, open-source contributions and competitive-programming handles do the same job.',
  'No photo, no date of birth, no eight-line personal statement. The UK convention is lean and factual; anything decorative just delays the reader getting to your grades.',
];

// ─────────────────────────────────────────────────────────────────────────
// Glossary
// ─────────────────────────────────────────────────────────────────────────
const glossary = [
  { term: 'Edge', def: 'A genuine, repeatable advantage that makes a bet or trade positive expected value. The whole job is finding edge and sizing it sensibly; "no edge" means you should not be trading.' },
  { term: 'Expected value (EV)', def: 'The probability-weighted average outcome of a decision. The atomic unit of quant thinking — you make a decision by comparing EVs, not by chasing the best or fearing the worst case.' },
  { term: 'Market making', def: 'Quoting a price you will buy at (bid) and a price you will sell at (ask), and earning the spread between them by providing liquidity to others who want to trade now.' },
  { term: 'Bid / ask / spread', def: 'The bid is the most you will pay; the ask is the least you will accept; the spread is the gap. The spread is your compensation for inventory risk and for trading against people who may know more than you.' },
  { term: 'Adverse selection', def: 'The tendency for your trades to fill precisely when you are wrong, because better-informed counterparties only trade with you when your price is off. The reason spreads exist and the core lesson of the Live Trader project.' },
  { term: 'Inventory / position', def: 'The net amount of an asset you are holding. Carrying inventory is a risk in itself — even before you lose anything, the position can move against you — so traders skew quotes to keep it near zero.' },
  { term: 'Implied volatility', def: 'The volatility that, plugged into an option pricing model, reproduces the option’s market price. The market’s forecast of future movement, read backwards out of prices rather than measured from history.' },
  { term: 'The Greeks', def: 'The sensitivities of an option’s price to its inputs: delta (spot), gamma (delta’s own change), vega (volatility), theta (time), rho (rates). How traders describe and hedge their risk.' },
  { term: 'Risk-neutral pricing', def: 'A pricing trick: value a derivative as the discounted expected payoff in an imaginary world where everyone is indifferent to risk. It is why Black–Scholes, trees and Monte Carlo all agree.' },
  { term: 'Kelly criterion', def: 'A formula for bet sizing that maximises long-run growth of your bankroll. Betting more than Kelly increases risk of ruin; most practitioners bet a fraction of it for safety.' },
  { term: 'Brainteaser', def: 'A short logic or probability puzzle used in interviews to watch how you think under mild pressure. The reasoning out loud matters more than landing the answer.' },
  { term: 'Prop shop', def: 'A proprietary trading firm that trades its own capital rather than clients’ money (Jane Street, Optiver, IMC, SIG and similar). Distinct from a bank’s trading desk in culture, comp and interview style.' },
  { term: 'Signal', def: 'A measurable quantity that predicts future returns, however weakly. Research is largely the hunt for signals and the careful, sceptical testing of whether they are real or noise.' },
  { term: 'Backtest', def: 'Simulating a strategy on historical data to estimate how it would have performed. Easy to fool yourself with — overfitting and lookahead bias are the classic traps interviewers will probe.' },
];

// ─────────────────────────────────────────────────────────────────────────
// Spring weeks
// ─────────────────────────────────────────────────────────────────────────
const springWeeks = [
  'Spring weeks are 3–5 day insight programmes that banks run for first-years (penultimate-years on four-year or Scottish courses), usually over the Easter break. Applications open in September–November of first year — far earlier than most freshers realise, which is exactly why so many miss them.',
  'They matter because most banks convert strong spring-week attendees straight into summer-internship offers, letting you skip a year of the main gauntlet. It is the closest thing to a shortcut the industry offers.',
  'For quant specifically, apply to the markets/trading or technology streams and write "quant" in every preference box you are given. J.P. Morgan, Goldman Sachs and Morgan Stanley all run streams that feed quant roles.',
  'Prop firms mostly do not run spring weeks, but several run first-year events, early-insight days, and even first-year internships that function as early pipelines — Jane Street and Optiver among them. Check careers pages in autumn, and ask your university maths and trading societies, which often host firm visits and hear about these first.',
  'And if you miss the whole cycle: it is genuinely fine. Plenty of people enter quant with no spring week at all. It is an accelerator, not a gate — do not let one missed deadline convince you the door has closed.',
];

// ─────────────────────────────────────────────────────────────────────────
// Components
// ─────────────────────────────────────────────────────────────────────────
function Drop({ title, meta, defaultOpen, children }: { title: ReactNode; meta?: ReactNode; defaultOpen?: boolean; children: ReactNode }) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  return (
    <div className="rounded-lg border border-steel bg-panel overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex items-start justify-between gap-4 p-4 text-left hover:bg-steel/30 transition-colors"
      >
        <div className="min-w-0">{title}{meta}</div>
        <span className={`text-violet shrink-0 mt-1 transition-transform ${open ? 'rotate-90' : ''}`} aria-hidden="true">▸</span>
      </button>
      {open && <div className="px-4 pb-5 border-t border-steel">{children}</div>}
    </div>
  );
}

function CodeBlock({ code }: { code: string }) {
  return (
    <pre className="mt-2 overflow-x-auto rounded border border-steel bg-bg p-3 text-[11px] leading-relaxed">
      <code className="font-mono text-fg/90 whitespace-pre">{code}</code>
    </pre>
  );
}

function ProjectGuide({ p }: { p: Project }) {
  return (
    <Drop
      title={<h3 className="font-semibold text-base">{p.name}</h3>}
      meta={
        <>
          <p className="text-sm text-muted mt-1 pr-2">{p.tagline}</p>
          <div className="flex flex-wrap gap-2 mt-2">
            <Tag>{p.meta.lang}</Tag>
            <Tag>{p.meta.time}</Tag>
            <Tag>{p.meta.level}</Tag>
          </div>
        </>
      }
    >
      <p className="text-sm leading-relaxed mt-4 text-muted">{p.why}</p>

      <ol className="mt-5 space-y-5">
        {p.steps.map((s, i) => (
          <li key={i} className="relative pl-9">
            <span className="absolute left-0 top-0 flex h-6 w-6 items-center justify-center rounded-full border border-violet/50 bg-plum/40 font-mono text-[11px] text-violet-light">
              {i + 1}
            </span>
            <h4 className="font-semibold text-sm">{s.title}</h4>
            <p className="text-sm leading-relaxed mt-1 text-fg/90">{s.body}</p>
            {s.code && <CodeBlock code={s.code} />}
            {s.checkpoint && (
              <p className="mt-2 text-[13px] flex gap-2">
                <span className="text-open font-mono shrink-0">✓ checkpoint</span>
                <span className="text-muted">{s.checkpoint}</span>
              </p>
            )}
          </li>
        ))}
      </ol>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded border border-steel p-3">
          <p className="font-mono text-[11px] uppercase tracking-wider text-violet-light">Stretch goals</p>
          <ul className="mt-2 space-y-1.5 text-[13px]">
            {p.stretch.map((s, i) => (
              <li key={i} className="flex gap-2"><span className="text-violet shrink-0">▸</span>{s}</li>
            ))}
          </ul>
        </div>
        <div className="rounded border border-steel p-3">
          <p className="font-mono text-[11px] uppercase tracking-wider text-soon">Talking about it in interview</p>
          <p className="mt-2 text-[13px] leading-relaxed text-muted">{p.interview}</p>
        </div>
      </div>
    </Drop>
  );
}

function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="font-mono text-[10px] uppercase tracking-wider text-muted border border-steel rounded px-2 py-0.5">
      {children}
    </span>
  );
}

function SectionIntro({ kicker, children }: { kicker: string; children: ReactNode }) {
  return (
    <>
      <p className="font-mono text-[11px] uppercase tracking-wider text-violet-light">{kicker}</p>
      <p className="mt-1 text-muted text-sm max-w-2xl leading-relaxed">{children}</p>
    </>
  );
}

const cvUrl = '/quant-cv-template.docx';

export default function Resources() {
  const { premium } = useEntitlement();
  const [cvPay, setCvPay] = useState(false);
  return (
    <div className="space-y-16">
      <header>
        <h1 className="text-2xl font-bold">Prep Roadmap &amp; Resources</h1>
        <p className="mt-3 text-muted max-w-2xl text-sm leading-relaxed">
          Everything here is written by someone who went through this recently, kept the things that
          worked, and is honest about the things that did not. It is deliberately specific over
          comprehensive — a staged plan from a year out to signing, two real projects to build, the
          books worth your time and which ones matter for your track, a CV template you can actually
          download, and a glossary for when a word on this site is doing more work than it explains.
          Read the roadmap stage you are in; bookmark the rest.
        </p>
      </header>

      {/* Roadmap */}
      <section>
        <h2 className="text-xl font-bold">The roadmap</h2>
        <p className="mt-1 mb-6 text-muted text-sm max-w-2xl leading-relaxed">
          Recruiting runs on a calendar, and most avoidable mistakes are really timing mistakes —
          building a CV in October, applying in week eight, practising arithmetic untimed. Find the
          stage you are in and work backwards from there.
        </p>
        <ol className="relative border-l border-steel ml-2 space-y-8">
          {stages.map((s) => (
            <li key={s.when} className="pl-6 relative">
              <span className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-violet" aria-hidden="true" />
              <p className="font-mono text-[11px] uppercase tracking-wider text-violet-light">{s.when}</p>
              <h3 className="font-semibold mt-0.5">{s.title}</h3>
              <p className="text-sm text-muted mt-1 leading-relaxed max-w-2xl">{s.blurb}</p>
              <ul className="mt-2.5 space-y-1.5 text-sm">
                {s.items.map((it, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-violet shrink-0">▸</span>
                    {it}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </section>

      {/* Projects */}
      <section>
        <h2 className="text-xl font-bold">Build something real</h2>
        <SectionIntro kicker="The highest-leverage thing on this page">
          A finished project is the rare CV line that is simultaneously proof you can code, proof you
          can finish, and a teacher of the actual material — and it hands you interview answers you
          own rather than memorised. Both guides below are in Python, assume you can write a loop and
          install a package, and explain the maths and the design as they go. Expand one and work
          through it end to end; the checkpoints tell you when a step is genuinely done.
        </SectionIntro>
        <Premium feature="The coding project guides">
          <div className="mt-6 space-y-4">
            {projects.map((p) => (
              <ProjectGuide key={p.id} p={p} />
            ))}
          </div>
        </Premium>
        <p className="mt-4 text-[13px] text-muted max-w-2xl leading-relaxed">
          More projects (a signal-research notebook, a low-latency order-book exercise) are on the way.
          Two done properly beats six abandoned — finish one before you start the next.
        </p>
      </section>

      {/* Books */}
      <section>
        <h2 className="text-xl font-bold">Books worth your time</h2>
        <SectionIntro kicker="Read fewer, deeper">
          You do not need a shelf of these — you need one or two worked properly. The notes below are
          honest about what each book is good and bad at; the focus map underneath tells you which to
          reach for given the track you are targeting.
        </SectionIntro>
        <div className="grid gap-4 sm:grid-cols-2 mt-6">
          {books.map((b) => (
            <article key={b.title} className="rounded-lg border border-steel bg-panel p-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-sm">{b.title}</h3>
                <span className="font-mono text-[10px] uppercase tracking-wider text-violet-light border border-violet/30 rounded px-1.5 py-0.5 shrink-0">{b.tag}</span>
              </div>
              <p className="font-mono text-[11px] text-muted mt-0.5">{b.author}</p>
              <p className="text-sm text-muted mt-2 leading-relaxed">{b.note}</p>
            </article>
          ))}
        </div>
        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          {bookFocus.map((f) => (
            <div key={f.role} className="rounded-lg border border-steel bg-plum/15 p-4">
              <p className="font-mono text-sm text-violet-light">Focus — {f.role}</p>
              <p className="text-[13px] mt-2 leading-relaxed text-fg/90">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Free courses */}
      <section>
        <h2 className="text-xl font-bold">Free courses &amp; lectures</h2>
        <SectionIntro kicker="Structured, and costs nothing">
          When a book is not clicking, a good lecturer often is. These are the free resources actually
          worth the hours, mapped loosely to the early roadmap stages — foundations first, polish later.
        </SectionIntro>
        <div className="grid gap-4 sm:grid-cols-2 mt-6">
          {courses.map((c) => (
            <a
              key={c.title}
              href={c.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-lg border border-steel bg-panel p-4 hover:border-violet/50 transition-colors"
            >
              <h3 className="font-semibold text-sm group-hover:text-violet-light transition-colors">{c.title} <span className="text-muted font-normal">↗</span></h3>
              <p className="font-mono text-[11px] text-muted mt-0.5">{c.who}</p>
              <p className="text-sm text-muted mt-2 leading-relaxed">{c.note}</p>
            </a>
          ))}
        </div>
      </section>

      {/* Advice by track */}
      <section>
        <h2 className="text-xl font-bold">Honest advice by track</h2>
        <SectionIntro kicker="Prep for the job you actually want">
          The three quant tracks reward genuinely different preparation, and the most common waste of a
          summer is grinding the wrong one. Read the track you are aiming at — and skim the others, so
          you can speak to why you chose yours.
        </SectionIntro>
        <div className="grid gap-4 lg:grid-cols-3 mt-6">
          {honestAdvice.map((a) => (
            <article key={a.title} className="rounded-lg border border-steel bg-panel p-4">
              <h3 className="font-mono text-sm text-violet-light">{a.title}</h3>
              <p className="text-sm mt-2 leading-relaxed">{a.text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* CV */}
      <section>
        <h2 className="text-xl font-bold">The CV</h2>
        <SectionIntro kicker="Twenty seconds, mostly the top third">
          A quant CV is not a place for personality — it is a place for evidence, arranged so a tired
          recruiter finds the important things without hunting. The template below is the exact one-page
          UK format these notes assume: download it, replace the placeholders, and put your energy into
          the words rather than the layout.
        </SectionIntro>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
          <ul className="space-y-2.5 text-sm">
            {cvTips.map((t, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-violet shrink-0">▸</span>
                {t}
              </li>
            ))}
          </ul>

          <aside className="rounded-lg border border-steel bg-panel p-5 h-fit">
            <p className="font-mono text-[11px] uppercase tracking-wider text-violet-light">Downloadable template</p>
            <h3 className="font-semibold mt-1">One-page quant CV (.docx)</h3>
            <p className="text-[13px] text-muted mt-2 leading-relaxed">
              Editable Word file in the house format — Arial, bold section headers, right-aligned dates,
              tight bullets. Pre-filled with neutral placeholders (John Doe, Example University) so you
              can see exactly what goes where, then overwrite it line by line.
            </p>
            {premium ? (
              <a
                href={cvUrl}
                download
                className="mt-4 inline-flex items-center gap-2 rounded-md bg-violet px-4 py-2 text-sm font-medium text-white hover:bg-violet/90 transition-colors"
              >
                ↓ Download template
              </a>
            ) : (
              <button
                type="button"
                onClick={() => setCvPay(true)}
                className="mt-4 inline-flex items-center gap-2 rounded-md border border-violet/50 px-4 py-2 text-sm font-medium text-violet-light hover:bg-violet/10 transition-colors"
              >
                <LockBadge /> Unlock the template
              </button>
            )}
            <p className="text-[11px] text-muted mt-3">
              Keep it to one page. If it spills over, cut — the discipline is part of the signal.
            </p>
            {cvPay && !premium && (
              <div className="mt-4">
                <Paywall feature="The CV template" />
              </div>
            )}
          </aside>
        </div>
      </section>

      {/* Glossary */}
      <section>
        <h2 className="text-xl font-bold">Glossary</h2>
        <SectionIntro kicker="The words this site assumes">
          Plain-English definitions for the terms that turn up across the games, questions and notes.
          None of them are as complicated as they first sound.
        </SectionIntro>
        <dl className="mt-6 grid gap-x-8 gap-y-4 sm:grid-cols-2">
          {glossary.map((g) => (
            <div key={g.term} className="border-l-2 border-steel pl-3">
              <dt className="font-semibold text-sm text-fg">{g.term}</dt>
              <dd className="text-[13px] text-muted mt-0.5 leading-relaxed">{g.def}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Spring weeks */}
      <section className="max-w-3xl">
        <h2 className="text-xl font-bold">Spring weeks &amp; insight days</h2>
        <SectionIntro kicker="UK first-years — read this in September, not March">
          The earliest and most overlooked opportunity in the calendar. If you are in your first year,
          this section is the most time-sensitive thing on the page.
        </SectionIntro>
        <div className="space-y-3 text-sm leading-relaxed mt-5">
          {springWeeks.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </section>
    </div>
  );
}
