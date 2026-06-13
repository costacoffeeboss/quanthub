export type Category =
  | 'Probability'
  | 'Expected value'
  | 'Combinatorics'
  | 'Mental math'
  | 'Logic'
  | 'Market making';

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface Question {
  id: string;
  title: string;
  category: Category;
  difficulty: Difficulty;
  style?: string;
  prompt: string;
  /** Paragraphs of a full worked solution. */
  solution: string[];
}

export const questions: Question[] = [
  // ---------------- PROBABILITY ----------------
  {
    id: 'p-ht-before-hh',
    title: 'HT before HH',
    category: 'Probability',
    difficulty: 'Medium',
    style: 'Jane Street style',
    prompt:
      'You flip a fair coin repeatedly. What is the probability that the pattern HT appears before the pattern HH?',
    solution: [
      'Intuition first: both patterns need an H to get started, so condition on reaching the first H. From that H, look at the next flip. If it is T, the pattern HT has just completed — HT wins immediately. If it is H, the pattern HH has just completed — HH wins immediately. So far it looks symmetric, but it is not, because of what happens when a pattern "fails".',
      'Wait — with this framing both patterns finish on the flip after the first H, so the game ends at that flip with probability 1/2 each? Not quite: re-examine. After the first H, the next flip decides everything: T completes HT, H completes HH. That gives 1/2 each — but only because both patterns share the prefix H. The classic asymmetry appears with HT vs TT or HH vs the others, so let us be careful and just compute.',
      'States: S (no useful progress), and H (last flip was heads). From S: flip H (prob 1/2) → state H; flip T (prob 1/2) → stay in S (a T with no preceding H helps neither pattern… for HT we need an H first). From H: flip T → HT completes (HT wins); flip H → HH completes (HH wins). Each happens with probability 1/2.',
      'So once we first reach state H — which happens with probability 1 — the very next flip settles the race at 1/2 each. The answer is 1/2.',
      'The deeper lesson, and why interviewers ask it: change the target patterns and the answer stops being 1/2. For example, HT appears before TT with probability 3/4, and the expected waiting time to see HH (6 flips) is longer than to see HT (4 flips) even though HH vs HT race is fair. Patterns that can "reuse" a failed attempt as progress behave differently from patterns that must restart. Saying this unprompted is what separates a good answer from a correct one.',
    ],
  },
  {
    id: 'p-three-dice-six',
    title: 'At least one six',
    category: 'Probability',
    difficulty: 'Easy',
    prompt: 'You roll three fair dice. What is the probability that at least one shows a six?',
    solution: [
      'The phrase "at least one" should trigger the complement reflex: it is almost always easier to compute the probability of none and subtract from 1.',
      'P(no six on one die) = 5/6. The dice are independent, so P(no six on any of three dice) = (5/6)³ = 125/216.',
      'Therefore P(at least one six) = 1 − 125/216 = 91/216 ≈ 0.421.',
      'A common trap is to answer 3 × (1/6) = 1/2. That double-counts outcomes where two or three dice show sixes — and you can see it must be wrong because the same logic with seven dice would give probability 7/6. Adding probabilities is only valid for mutually exclusive events.',
      'For a sanity check, 91/216 is a little under 1/2, which feels right: three chances at a 1-in-6 event should get you close to, but not past, a coin flip.',
    ],
  },
  {
    id: 'p-birthday',
    title: 'The shared birthday threshold',
    category: 'Probability',
    difficulty: 'Medium',
    prompt:
      'How many people do you need in a room before the probability that some pair shares a birthday exceeds 50%? Ignore leap years and assume birthdays are uniform.',
    solution: [
      'Again use the complement: compute the probability that all n birthdays are distinct.',
      'Line people up. The first person takes some birthday. The second avoids it with probability 364/365. The third avoids both with probability 363/365, and so on. So P(all distinct) = (364/365) × (363/365) × … × ((365−n+1)/365).',
      'Rather than grinding the product, approximate. Using 1−x ≈ e^(−x) for small x, P(all distinct) ≈ exp(−(1+2+…+(n−1))/365) = exp(−n(n−1)/730).',
      'We want this below 1/2, i.e. n(n−1)/730 > ln 2 ≈ 0.693, so n(n−1) > 506. Since 22×23 = 506 sits right on the boundary, try n = 23: 23×22 = 506 — just over with the exact product. Exact computation confirms: at n = 23, P(shared) ≈ 50.7%.',
      'Why so few? Because what matters is the number of pairs, not the number of people: 23 people give C(23,2) = 253 pairs, each a 1/365 shot at a collision. 253/365 ≈ 0.69 ≈ ln 2 — the pair-counting heuristic lands you on the answer almost immediately, and it is exactly the mental model interviewers want: collisions scale with n², not n.',
    ],
  },
  {
    id: 'p-semicircle',
    title: 'Three points on a circle',
    category: 'Probability',
    difficulty: 'Hard',
    prompt:
      'Three points are chosen independently and uniformly at random on a circle. What is the probability that all three lie within some semicircle?',
    solution: [
      'The trick is to stop searching for "a" semicircle and instead anchor semicircles at the points themselves. For each point Pᵢ, consider the semicircle that starts at Pᵢ and sweeps clockwise. The three points all lie in some semicircle if and only if they all lie in one of these three anchored semicircles.',
      'Why? If all points fit in some semicircle, rotate that semicircle clockwise until its starting edge hits one of the points — everything still fits, and now it is anchored at a point. So the anchored semicircles cover all cases.',
      'Now compute P(all three points lie in the clockwise semicircle starting at P₁). Given P₁’s position, each of the other two points lands in that semicircle independently with probability 1/2, so this is (1/2)² = 1/4. The same holds for the semicircles anchored at P₂ and P₃.',
      'Crucially, these three events are mutually exclusive: if all points fit in the semicircle starting clockwise from P₁, then P₁ is the "first" point of the cluster going clockwise, and only one point can be first. So we can simply add: P = 3 × 1/4 = 3/4.',
      'The general result for n points falls out identically: n × (1/2)^(n−1). Checking n = 2 gives probability 1 (two points always share a semicircle — correct), which is a good way to validate the formula out loud.',
    ],
  },
  {
    id: 'p-three-doors',
    title: 'Three boxes, one prize, a peek',
    category: 'Probability',
    difficulty: 'Easy',
    prompt:
      'A prize sits in one of three boxes. You pick box A. The host — who knows where the prize is and will always open an empty box you did not pick — opens box B, showing it empty, and offers you a switch to box C. Should you switch?',
    solution: [
      'Yes — switching wins with probability 2/3, staying wins with 1/3.',
      'Cleanest argument: your original pick is right 1/3 of the time and wrong 2/3 of the time, and nothing the host does changes that — he can always open an empty other box, so his action carries no information about whether your pick was right. If your pick was wrong (2/3 of the time), the prize is in the one remaining box, so switching gets it.',
      'Where intuition goes wrong: people reason "two boxes left, so 50/50". That would be true if the host opened a random box that merely happened to be empty. The host’s constraint — he must avoid both your box and the prize — concentrates the missing probability onto box C rather than spreading it evenly.',
      'That distinction is checkable with the random-host variant: if the host opens B at random and it happens to be empty, then staying and switching are genuinely 50/50. Conditioning on how the information was generated, not just on what was revealed, is the entire content of the puzzle.',
      'If the 2/3 still feels wrong, scale it up: 100 boxes, you pick one, the host opens 98 empties he is required to avoid the prize with. Sticking is betting your original 1-in-100 guess was right; switching is betting it was wrong.',
    ],
  },
  {
    id: 'p-rare-disease',
    title: 'The 99% accurate test',
    category: 'Probability',
    difficulty: 'Medium',
    prompt:
      'A condition affects 1 in 10,000 people. A test for it is 99% accurate in both directions (99% sensitivity, 99% specificity). You test positive. What is the probability you actually have the condition?',
    solution: [
      'Work with a concrete population of 1,000,000 people — frequencies are much harder to fumble than Bayes’ formula under pressure.',
      'Of 1,000,000 people, 100 have the condition (1 in 10,000). The test catches 99% of them: 99 true positives. The other 999,900 people are healthy, and 1% of them test positive anyway: 9,999 false positives.',
      'You are one of the positives. Total positives = 99 + 9,999 = 10,098, of which 99 are real. P(condition | positive) = 99/10,098 ≈ 0.98% — under 1%.',
      'In formula form this is Bayes’ theorem: P(D|+) = P(+|D)P(D) / [P(+|D)P(D) + P(+|¬D)P(¬D)] = (0.99 × 0.0001) / (0.99 × 0.0001 + 0.01 × 0.9999), the same ≈ 0.0098.',
      'The takeaway interviewers are probing: when the base rate is tiny, even an accurate test produces mostly false positives, because the huge healthy population times a small error rate swamps the tiny sick population times a high hit rate. The posterior is driven by the ratio of those two streams (99 vs ~10,000), and you should be able to see that ratio before doing any precise arithmetic.',
    ],
  },
  {
    id: 'p-two-children',
    title: 'At least one boy',
    category: 'Probability',
    difficulty: 'Medium',
    prompt:
      'A family has two children. You learn that at least one of them is a boy. What is the probability both are boys? (Assume boys and girls are equally likely and independent.)',
    solution: [
      'List the equally likely orderings of two children: BB, BG, GB, GG — four outcomes at probability 1/4 each.',
      'The information "at least one is a boy" eliminates only GG. Three equally likely outcomes remain: BB, BG, GB. Exactly one of them is "both boys", so the answer is 1/3.',
      'The instinctive wrong answer is 1/2 — "the other child is a boy or a girl". The error is treating "the other child" as well-defined: when you only know at least one is a boy, there is no specific child singled out, and the families with one boy and one girl are twice as common as families with two boys.',
      'Contrast with: "the eldest child is a boy". That eliminates GB and GG, leaving BB and BG, and now the answer genuinely is 1/2. Identifying a specific child changes the conditioning event, and being able to articulate the difference between the two phrasings is the real test.',
      'In an interview, mention the famous ambiguity: if you learned the fact by meeting one child at random (and happened to meet a boy), that sampling process gives 1/2, not 1/3. The answer depends on how the information arrived — same lesson as the three-boxes problem.',
    ],
  },

  // ---------------- EXPECTED VALUE ----------------
  {
    id: 'ev-first-six',
    title: 'Rolls until a six',
    category: 'Expected value',
    difficulty: 'Easy',
    prompt: 'You roll a fair die repeatedly. What is the expected number of rolls until you see the first six?',
    solution: [
      'The answer is 6, and the slick derivation is one line of self-consistency. Let E be the expected number of rolls. The first roll always happens. With probability 1/6 you are done; with probability 5/6 you are back exactly where you started, expecting E more rolls.',
      'So E = 1 + (5/6)E. Solving: E − (5/6)E = 1, so E/6 = 1, giving E = 6.',
      'This is the geometric distribution: number of trials to the first success at success probability p has expectation 1/p. Here p = 1/6 so E = 6. The memorylessness of the situation — past failures tell you nothing about the future — is what makes the recursive equation valid.',
      'Worth saying aloud in an interview: even though the expected wait is 6 rolls, the distribution is skewed — the median is 4 (since (5/6)³ ≈ 0.58 > 1/2 but (5/6)⁴ ≈ 0.48 < 1/2). More than half the time you finish in 4 rolls or fewer; occasional long droughts pull the mean up. Distinguishing mean from median unprompted is cheap credibility.',
    ],
  },
  {
    id: 'ev-max-two-dice',
    title: 'Max of two dice',
    category: 'Expected value',
    difficulty: 'Medium',
    prompt: 'Roll two fair dice. What is the expected value of the larger of the two numbers?',
    solution: [
      'Use the tail trick: for the maximum M, P(M ≤ k) = P(both dice ≤ k) = (k/6)². This makes the distribution function trivial and the expectation mechanical.',
      'P(M = k) = P(M ≤ k) − P(M ≤ k−1) = (k² − (k−1)²)/36 = (2k − 1)/36. So the probabilities for k = 1…6 are 1/36, 3/36, 5/36, 7/36, 9/36, 11/36 — check: they sum to 36/36. ✓',
      'E[M] = Σ k(2k−1)/36 = (1·1 + 2·3 + 3·5 + 4·7 + 5·9 + 6·11)/36 = (1 + 6 + 15 + 28 + 45 + 66)/36 = 161/36 ≈ 4.47.',
      'Sanity checks: it must be above 3.5 (a max can only help) and below 6; 4.47 sits plausibly. Also, by symmetry E[min] + E[max] = E[die₁] + E[die₂] = 7, so E[min] = 7 − 161/36 = 91/36 ≈ 2.53 — a free second answer interviewers often follow up with, and quoting the symmetry beats recomputing.',
      'General pattern worth remembering: for the max of n dice (or any discrete uniform), compute P(max ≤ k) first. Distribution functions of maxima factor over independence; densities do not.',
    ],
  },
  {
    id: 'ev-die-reroll',
    title: 'Die with one reroll',
    category: 'Expected value',
    difficulty: 'Medium',
    style: 'Jane Street style',
    prompt:
      'You roll a fair die and get paid its face value in pounds, but you may discard the first roll and take a second roll instead (which you must keep). What is the fair value of this game? What if you had two rerolls?',
    solution: [
      'Work backwards from the end — this is a tiny dynamic programming problem, and the backwards habit is the entire lesson.',
      'With no rerolls left, the roll is worth its expectation: 3.5. So when holding the first roll, keep it only if it beats 3.5 — i.e. keep 4, 5, 6; reroll 1, 2, 3.',
      'Value with one reroll = (1/2) × E[roll | roll ≥ 4] + (1/2) × 3.5 = (1/2)(5) + (1/2)(3.5) = 4.25.',
      'With two rerolls: now your fallback after the first roll is the one-reroll game worth 4.25, so keep the first roll only if it beats 4.25 — keep 5 or 6 (mean 5.5), otherwise continue with probability 4/6 into a game worth 4.25. Value = (2/6)(5.5) + (4/6)(4.25) = 11/6 + 17/6 = 28/6 ≈ 4.67.',
      'Note the threshold moved: with more options remaining you become pickier (keep only 5–6, not 4–6). That is the general principle — option value raises your continuation value, which raises your standard for stopping. It is also why these games converge slowly toward 6 as rerolls pile up but never reach it.',
      'If asked to quote a market on this game: fair value 4.25 means you might quote 4.10 bid / 4.40 ask. Tying the EV back to a quote is exactly what trading interviewers hope you will do.',
    ],
  },
  {
    id: 'ev-coupon',
    title: 'Collecting all six faces',
    category: 'Expected value',
    difficulty: 'Medium',
    prompt: 'You roll a fair die repeatedly. What is the expected number of rolls until you have seen all six faces at least once?',
    solution: [
      'Split the task into stages and use linearity of expectation — the single most useful tool in this entire genre.',
      'Stage k = "I have seen k−1 distinct faces and am waiting for a new one." While in stage k, each roll shows a new face with probability (6−(k−1))/6, so the expected stay in stage k is 6/(7−k) (geometric waiting time, 1/p).',
      'Expected total = 6/6 + 6/5 + 6/4 + 6/3 + 6/2 + 6/1 = 1 + 1.2 + 1.5 + 2 + 3 + 6 = 14.7 rolls.',
      'Two things to articulate. First, why adding is legal: linearity of expectation needs no independence; the stage durations just add. Second, the structure of the answer: 6 × (1/6 + 1/5 + … + 1/1) = 6 H₆, where H₆ is the 6th harmonic number. The last face dominates — you spend 6 of your 14.7 expected rolls hunting the final one, which matches everyday experience with collecting anything.',
      'The general coupon-collector result n·Hₙ ≈ n ln n + 0.577n is worth memorising: it appears in disguise constantly (hash collisions, "how many random draws to cover everything", load balancing).',
    ],
  },
  {
    id: 'ev-hh-wait',
    title: 'Waiting for HH',
    category: 'Expected value',
    difficulty: 'Hard',
    prompt: 'You flip a fair coin repeatedly. What is the expected number of flips until you first see two heads in a row?',
    solution: [
      'Set up states by progress toward the target: state 0 (no progress — last flip was a tail or nothing yet) and state 1 (last flip was a head). Let E₀ and E₁ be expected flips to finish from each state.',
      'From state 0: one flip happens; heads (1/2) moves to state 1, tails (1/2) stays at 0. So E₀ = 1 + (1/2)E₁ + (1/2)E₀.',
      'From state 1: one flip happens; heads (1/2) finishes, tails (1/2) drops all the way back to 0 — this is the painful part of HH, a failed attempt wastes everything. So E₁ = 1 + (1/2)(0) + (1/2)E₀.',
      'Solve: from the first equation, (1/2)E₀ = 1 + (1/2)E₁, so E₀ = 2 + E₁. Substitute into the second: E₁ = 1 + (1/2)(2 + E₁) = 2 + (1/2)E₁, so E₁ = 4 and E₀ = 6. Expected flips: 6.',
      'Compare with HT, which takes only 4 flips on average: once you get the first H, you can never lose progress waiting for the T (another H just renews your position). HH can lose progress, so it waits longer. This asymmetry between patterns of equal length is the classic follow-up, and it connects to the HT-vs-HH race question: equal race odds, unequal waiting times — they measure different things.',
      'General tool worth naming: these are first-step (one-step conditioning) equations on a Markov chain, and the same template solves expected durations for almost any pattern or gambler’s-ruin style question.',
    ],
  },
  {
    id: 'ev-stick-break',
    title: 'Breaking a stick',
    category: 'Expected value',
    difficulty: 'Medium',
    style: 'Jane Street style',
    prompt: 'A stick of length 1 is broken at a point chosen uniformly at random. What is the expected length of the shorter piece? And the expected ratio of shorter to longer?',
    solution: [
      'Let U ~ Uniform(0,1) be the break point. The shorter piece has length S = min(U, 1−U).',
      'By symmetry, fold the problem in half: min(U, 1−U) is distributed like U/… more carefully, for s < 1/2, P(S > s) = P(s < U < 1−s) = 1 − 2s. So S is uniform on (0, 1/2): its density is 2 on that interval. Hence E[S] = 1/4.',
      'Quick intuition check: the break is uniform, the shorter piece is at most 1/2 and "uniformly" anywhere below it, so its mean is half of 1/2. The longer piece then has mean 3/4 — and means add to 1. ✓',
      'The ratio is the trap. E[S/(1−S)] is NOT E[S]/E[1−S] = (1/4)/(3/4) = 1/3 — expectations of ratios are not ratios of expectations. Compute honestly: with S uniform on (0,1/2), E[S/(1−S)] = ∫₀^{1/2} s/(1−s) · 2 ds = 2∫₀^{1/2} (−1 + 1/(1−s)) ds = 2(−1/2 + ln 2) = 2 ln 2 − 1 ≈ 0.386.',
      'Note 0.386 > 1/3: the ratio function is convex, so Jensen’s inequality pushes the expectation above the naive plug-in value. Naming Jensen here — and the general "don’t take functions inside expectations" warning — is precisely the kind of follow-through that earns the Hard-question credit on a Medium question.',
    ],
  },

  // ---------------- COMBINATORICS ----------------
  {
    id: 'c-handshakes',
    title: 'Handshakes at a meeting',
    category: 'Combinatorics',
    difficulty: 'Easy',
    prompt: 'Ten people each shake hands with every other person exactly once. How many handshakes happen?',
    solution: [
      'Each handshake is an unordered pair of people, so the count is C(10,2) = 10×9/2 = 45.',
      'Two other derivations worth having ready, since interviewers often push for them. Counting from the people: each of the 10 people shakes 9 hands, giving 90 hand-shakings, but each physical handshake was counted twice (once per participant), so 90/2 = 45.',
      'Incrementally: as each new person arrives they shake hands with everyone already present, giving 0 + 1 + 2 + … + 9 = 9×10/2 = 45. This shows the triangular-number identity 1+2+…+(n−1) = C(n,2) in action.',
      'The reflex being tested: when counting symmetric pairs, either divide by the symmetry (2) at the end or build the count so each object is constructed exactly once. Double-counting errors are the most common combinatorics mistake under pressure, and stating which discipline you are using inoculates you against it.',
    ],
  },
  {
    id: 'c-grid-paths',
    title: 'Paths through a grid',
    category: 'Combinatorics',
    difficulty: 'Medium',
    prompt: 'You walk from the bottom-left corner to the top-right corner of a 5×5 block grid, moving only right or up along the edges. How many distinct shortest paths are there?',
    solution: [
      'A shortest path on a 5×5 grid of blocks makes exactly 5 moves right (R) and 5 moves up (U) in some order — 10 moves total. Any such sequence of moves is a valid path and different sequences give different paths.',
      'So paths correspond exactly to arrangements of the word RRRRRUUUUU: choose which 5 of the 10 positions are R. That is C(10,5) = 252.',
      'Compute it cleanly: C(10,5) = 10!/(5!5!) = (10·9·8·7·6)/(5·4·3·2·1) = 30240/120 = 252.',
      'The transferable idea is the encoding: turn a geometric object (a path) into a string with fixed letter counts, and count strings. Most "how many ways" questions in interviews are one good bijection away from a binomial coefficient.',
      'Standard follow-ups to anticipate: forbid a corner (count paths through it — C(a,·)×C(b,·) — and subtract), or require never crossing the diagonal, which turns it into the Catalan number C(10,5)/6 = 42. Mentioning Catalan numbers when the diagonal constraint appears is a strong signal.',
    ],
  },
  {
    id: 'c-staircase',
    title: 'Climbing stairs',
    category: 'Combinatorics',
    difficulty: 'Medium',
    prompt: 'You climb a staircase of 10 steps, taking either 1 or 2 steps at a time. How many distinct ways can you reach the top?',
    solution: [
      'Condition on the last move. Any way of reaching step 10 ends with either a 1-step from step 9 or a 2-step from step 8. These cases are disjoint and exhaustive, so W(10) = W(9) + W(8).',
      'That is the Fibonacci recurrence. Seed it: W(1) = 1 (single step), W(2) = 2 (1+1 or 2). Then W(3)=3, W(4)=5, W(5)=8, W(6)=13, W(7)=21, W(8)=34, W(9)=55, W(10)=89.',
      'Answer: 89 ways.',
      'Alternative count for cross-checking: sum over the number of 2-steps. With k two-steps you make 10−2k+k = 10−k moves and choose which k of them are 2s: Σₖ C(10−k, k) = C(10,0)+C(9,1)+C(8,2)+C(7,3)+C(6,4)+C(5,5) = 1+9+28+35+15+1 = 89. ✓ (This diagonal-sum-equals-Fibonacci identity is a nice thing to know exists.)',
      'The interview skill on display: recognising when a counting problem decomposes by "last move" into a recurrence, then being disciplined about base cases — W(2) = 2, not 1, is where careless answers go wrong.',
    ],
  },
  {
    id: 'c-trailing-zeros',
    title: 'Trailing zeros of 100!',
    category: 'Combinatorics',
    difficulty: 'Medium',
    prompt: 'How many zeros does 100! end in?',
    solution: [
      'A trailing zero is a factor of 10 = 2 × 5. In 100! there are far more factors of 2 than 5 (every second number is even), so the number of trailing zeros equals the number of times 5 divides 100!.',
      'Count multiples of 5 up to 100: there are ⌊100/5⌋ = 20, each contributing at least one 5. But multiples of 25 contribute a second factor of 5: ⌊100/25⌋ = 4 of them (25, 50, 75, 100). Multiples of 125 would contribute a third, but ⌊100/125⌋ = 0.',
      'Total: 20 + 4 = 24 trailing zeros.',
      'The general statement is Legendre’s formula: the exponent of prime p in n! is Σ ⌊n/pᵏ⌋ over k ≥ 1. The "add the higher powers" step is what most people forget — answering 20 is the classic near-miss, so show the 25s explicitly.',
      'Common follow-up: how many zeros does 1000! end in? ⌊1000/5⌋ + ⌊1000/25⌋ + ⌊1000/125⌋ + ⌊1000/625⌋ = 200 + 40 + 8 + 1 = 249. Being able to run the formula again fast demonstrates you understood rather than memorised.',
    ],
  },
  {
    id: 'c-round-table',
    title: 'Seating around a table',
    category: 'Combinatorics',
    difficulty: 'Easy',
    prompt: 'Six people sit around a round table. Seatings that differ only by rotation count as the same. How many distinct seatings are there? What if two particular people insist on sitting together?',
    solution: [
      'Round-table counting: fix one person’s seat to kill the rotational symmetry (any rotation can move them to that seat, so this is legitimate, and each circular arrangement is now counted exactly once). The remaining 5 people fill 5 seats in 5! = 120 ways.',
      'In general n people around a round table: (n−1)! arrangements. Equivalent derivation: n! linear arrangements / n rotations = (n−1)!.',
      'For the pair who must sit together: glue them into one super-person. Now 5 units sit around the table: (5−1)! = 24 arrangements. The glued pair can sit in 2 internal orders (A left of B, or B left of A), so 24 × 2 = 48.',
      'Sanity check via probability: 48/120 = 2/5 should be the chance two specific people end up adjacent at a random round table of six. Direct check: seat person A anywhere; 2 of the remaining 5 seats are adjacent to A, so P = 2/5. ✓ Cross-validating a count with a probability argument is a habit that catches errors and impresses.',
      'The two tools here — fix an element to quotient out symmetry, and glue constrained items together — solve the majority of arrangement questions you will meet.',
    ],
  },

  // ---------------- MENTAL MATH ----------------
  {
    id: 'm-17x24',
    title: '17 × 24, fast',
    category: 'Mental math',
    difficulty: 'Easy',
    style: 'Optiver style',
    prompt: 'Compute 17 × 24 in your head, and describe a method that generalises.',
    solution: [
      'Answer: 408.',
      'Method 1 — distribute over a clean anchor: 17 × 24 = 17 × (25 − 1) = 425 − 17 = 408. Multiplying by 25 is easy (×100, ÷4: 1700/4 = 425), so steering toward 25 is the efficient route.',
      'Method 2 — split the smaller factor: 17 × 24 = 17 × 20 + 17 × 4 = 340 + 68 = 408. This left-to-right expansion is the workhorse: most two-digit products are two easy products and one addition.',
      'Method 3 — factor shuffling: 17 × 24 = 17 × 8 × 3 = 136 × 3 = 408. Useful when one factor is rich in small primes.',
      'For timed tests the meta-skills matter more than any single trick: always compute left-to-right so your first digits are likely right even if you must guess under time pressure; sanity-check magnitude (17×24 ≈ 17×25 ≈ 425, so 408 is plausible, 308 or 4080 are not); and check the last digit (7×4 = 28, so the answer must end in 8). The last-digit check takes under a second and catches a large share of slips.',
    ],
  },
  {
    id: 'm-square-95',
    title: 'Square 95 instantly',
    category: 'Mental math',
    difficulty: 'Easy',
    style: 'Optiver style',
    prompt: 'Compute 95² in your head. What is the general trick, and why does it work?',
    solution: [
      'Answer: 9025.',
      'Trick for any number ending in 5: write it as (10a + 5). Then (10a+5)² = 100a² + 100a + 25 = 100·a(a+1) + 25. So: multiply a by a+1, then append 25. For 95: a = 9, a(a+1) = 90, append 25 → 9025. For 65: 6×7 = 42 → 4225.',
      'A second route via difference of squares is more flexible: x² = (x+d)(x−d) + d². Pick d to make one factor round: 95² = 100 × 90 + 25 = 9025. Same answer, and this version squares anything near a round number: 97² = 100 × 94 + 9 = 9409; 102² = 104 × 100 + 4 = 10404.',
      'The identity behind both is just algebra you already know — (a+b)(a−b) = a² − b² rearranged — and that is the real lesson: fast mental math is not memorising party tricks, it is keeping three or four algebraic identities loaded and recognising which one makes the arithmetic collapse.',
      'In Optiver-style tests, squares of numbers ending in 5 and numbers near 100 appear constantly. Drill them until they cost you two seconds, because those seconds are what you spend on the genuinely hard items.',
    ],
  },
  {
    id: 'm-sevenths',
    title: 'Sevenths as decimals',
    category: 'Mental math',
    difficulty: 'Medium',
    prompt: 'What is 3/7 as a decimal to six places — quickly, without long division from scratch?',
    solution: [
      'Key fact: 1/7 = 0.142857 142857…, a repeating cycle of the six digits 142857. Every seventh shares the same cycle, just started at a different point.',
      'The cycle in order is 1, 4, 2, 8, 5, 7. The starting digits of k/7 follow the size order of the fractions: 1/7 starts with 1, 2/7 with 2, 3/7 with 4, 4/7 with 5, 5/7 with 7, 6/7 with 8 — i.e. each k/7 starts at the cycle position whose digit is the integer part of 10k/7.',
      'So 3/7 = 0.428571 428571… and the six places asked for are 0.428571.',
      'Why a cycle at all: long division by 7 can only produce remainders 1–6; after at most 6 steps a remainder repeats and the digits loop. 7 happens to use all six remainders, which is why 142857 is a "cyclic number" (multiply 142857 by 2…6 and you get rotations of itself — 142857 × 3 = 428571, which is exactly our answer).',
      'Practical value: sevenths appear in trading-firm arithmetic tests precisely because most candidates can only do them slowly. Memorise the cycle once and every x/7 conversion becomes instant. While you are at it: 1/6 = 0.1667, 1/8 = 0.125, 1/9 = 0.111…, 1/11 = 0.0909…, 1/13 = 0.076923… (another cyclic).',
    ],
  },
  {
    id: 'm-percent-chain',
    title: 'Up 20%, down 20%',
    category: 'Mental math',
    difficulty: 'Easy',
    prompt: 'A stock rises 20% one day and falls 20% the next. What is the net change? Generalise.',
    solution: [
      'Multiply the factors, never add the percentages: 1.20 × 0.80 = 0.96, a net loss of 4%.',
      'The general identity: up x then down x gives (1+x)(1−x) = 1 − x². You always end below where you started, by the square of the move. Up/down 10% → −1%. Up/down 50% → −25%. The order does not matter, since multiplication commutes.',
      'This is why volatility itself costs money for anything that compounds — the effect is called volatility drag. A position that alternates +20%/−20% forever loses about 4% per two-day cycle while its "average return" naively looks like zero. Connecting the arithmetic to the financial concept is precisely what a trading interviewer is fishing for.',
      'Related reflexes worth stating: a loss of x% needs a gain of x/(1−x) to recover (down 20% needs up 25%; down 50% needs up 100%); and for small moves, percentage changes approximately add (up 2%, down 2% ≈ down 0.04%, negligible) — the x² term is why the approximation works for small x and fails for large.',
    ],
  },

  // ---------------- LOGIC ----------------
  {
    id: 'l-lockers',
    title: 'The 100 lockers',
    category: 'Logic',
    difficulty: 'Medium',
    prompt:
      '100 closed lockers line a corridor. Person 1 toggles every locker, person 2 toggles every 2nd, person 3 every 3rd, … person 100 toggles locker 100. Which lockers end up open, and why?',
    solution: [
      'Locker n is toggled once for each divisor of n: person d touches locker n exactly when d divides n. Starting closed, locker n ends open iff it is toggled an odd number of times — iff n has an odd number of divisors.',
      'Divisors come in pairs (d, n/d): if d divides n, so does n/d, and they are distinct unless d = n/d, i.e. unless n is a perfect square. So only perfect squares have an odd divisor count.',
      'Therefore the open lockers are 1, 4, 9, 16, 25, 36, 49, 64, 81, 100 — ten lockers, the perfect squares up to 100.',
      'Worth verifying on a small case rather than trusting the cleverness: locker 12 has divisors 1,2,3,4,6,12 (six toggles → closed); locker 16 has 1,2,4,8,16 (five toggles → open, and note 4 pairs with itself). Running a concrete example is both a correctness check and a demonstration of good habits.',
      'The structure to remember: "how many times does X happen" often converts to a divisor/pairing argument, and "odd count" questions usually hinge on finding what breaks the pairing — here, the square root pairing with itself.',
    ],
  },
  {
    id: 'l-ropes',
    title: 'Two ropes, 45 minutes',
    category: 'Logic',
    difficulty: 'Medium',
    prompt:
      'You have two ropes and a lighter. Each rope burns completely in exactly 60 minutes, but burns unevenly (half the rope might burn in 5 minutes, the rest in 55). How do you measure exactly 45 minutes?',
    solution: [
      'The unusable idea is marking lengths — uneven burning makes length meaningless. The usable invariant: lighting a rope at both ends makes it finish in exactly half its remaining burn time, because the two flames together always consume burn-time at double rate, wherever they happen to be on the rope.',
      'Protocol: at time 0, light rope A at both ends and rope B at one end, simultaneously.',
      'Rope A, burning from both ends, is fully consumed at exactly 30 minutes. At that moment rope B has burned 30 minutes’ worth, so it has exactly 30 minutes of burn time left.',
      'The instant rope A finishes, light rope B’s other end. B’s remaining 30 minutes now burns at double rate: 15 more minutes. It finishes at 30 + 15 = 45 minutes. Done.',
      'The reasoning pattern worth naming: find what is conserved (total burn-time consumed per minute of clock time: one rope-end contributes 1× rate, two ends 2×) and build the measurement out of that, ignoring the seductive but unusable geometry. Follow-up they may ask: with two ropes you can construct 30, 45, plus various combos like 22.5 by burning the second rope at both ends from the start — showing you can enumerate the reachable times demonstrates mastery.',
    ],
  },
  {
    id: 'l-eight-balls',
    title: 'Eight balls, two weighings',
    category: 'Logic',
    difficulty: 'Easy',
    prompt:
      'You have 8 visually identical balls; one is slightly heavier. Using a balance scale only twice, find the heavy ball.',
    solution: [
      'The instinct is to split 4–4, but that wastes information: a balance has three outcomes (left heavy, right heavy, balanced), not two. Two weighings can distinguish 3² = 9 cases, so 8 balls should be doable — but only if every weighing has all three outcomes live.',
      'Weighing 1: put 3 balls on each pan, leave 2 aside. If one side drops, the heavy ball is among those 3. If the pans balance, it is one of the 2 set aside.',
      'Case A (narrowed to 3): weigh 1 vs 1 from those three, leaving the third aside. Left drops → that ball; right drops → that ball; balance → the one aside. Found in two weighings.',
      'Case B (narrowed to 2): weigh them against each other; the heavier side is the answer. Two weighings total again.',
      'The generalisable principle: with w weighings you can isolate one heavy ball among 3^w candidates, by splitting into three equal-as-possible groups each time. State the information-theoretic bound up front — "three outcomes per weighing, so 9 distinguishable states from two weighings" — because the bound is what the interviewer is really asking about; the 12-ball variant (where the odd ball may be heavy or light) is the standard harder follow-up.',
    ],
  },
  {
    id: 'l-hat-line',
    title: 'A line of 100 hats',
    category: 'Logic',
    difficulty: 'Hard',
    prompt:
      '100 prisoners stand in a line, each wearing a red or blue hat, each seeing only the hats in front of them. From the back, each must call out "red" or "blue"; a correct call frees that prisoner. They may agree a strategy beforehand. How many can be guaranteed freedom?',
    solution: [
      '99 guaranteed, and the 100th survives on a coin flip. The strategy is a parity code.',
      'Agreement: the rearmost prisoner (who sees all 99 hats ahead but not his own) counts the red hats he sees and calls "red" if that count is odd, "blue" if even. His call is a bet about his own hat — right with probability 1/2 — but it is really a broadcast of one bit: the parity of the 99 hats in front of him.',
      'Now prisoner 99 sees the 98 hats ahead. He knows the parity of hats 1–99 (announced) and can count the parity of hats 1–98 (visible). If the parities match, his own hat is not a red — it is blue; if they differ, his is red. He calls correctly with certainty.',
      'Each subsequent prisoner maintains a running parity: start from the announced bit, flip it for every "red" heard from behind (each freed prisoner’s call truthfully reveals their hat), compare with the reds still visible ahead, and the difference is their own hat. Induction: everyone except the first is exactly determined.',
      'Why you cannot beat 99: the rearmost prisoner has zero information about his own hat — no strategy changes his 50%. So 99-guaranteed is optimal, achieved by spending his guess as a parity broadcast.',
      'The transferable idea is error-correcting-code thinking: one shared bit of redundancy lets n−1 unknowns be reconstructed. The same skeleton solves the k-colour version (broadcast the sum mod k) — offering that generalisation unprompted is a strong finish.',
    ],
  },

  // ---------------- MARKET MAKING / FERMI ----------------
  {
    id: 'mm-piano-tuners',
    title: 'Piano tuners in London',
    category: 'Market making',
    difficulty: 'Medium',
    prompt: 'Estimate how many piano tuners work in London. Walk through the estimate as you would in an interview.',
    solution: [
      'Structure the estimate as supply equals demand for tuning work, and say the skeleton out loud before any numbers: (pianos in London × tunings per year) ÷ (tunings one tuner does per year).',
      'Pianos: London has roughly 9 million people, call it 3.5 million households. Perhaps 1 in 30 households has a piano — pianos are uncommon but not rare — giving ~120,000 home pianos. Add schools, churches, studios and venues: a few tens of thousands more, but only some are maintained; call it 150,000 pianos that exist, of which maybe half are actually tuned at all regularly, with a typical maintained piano tuned about once a year. Demand ≈ 75,000 tunings/year.',
      'Supply: a tuning takes ~1.5–2 hours including travel, so a full-time tuner does ~4 a day, ~5 days a week, ~48 weeks: roughly 1,000 tunings/year. Many tuners are part-time, so use 600–800 effective.',
      'Divide: 75,000 / 700 ≈ 100. So on the order of 100 piano tuners in London — I would quote a range of 75–150.',
      'What the interviewer is grading: a stated structure before numbers; every input justified with a one-line reason; aggressive rounding (no four-significant-figure theatre); a sensitivity check — the answer is most fragile to "fraction of households with a maintained piano", so flag that as the input you would refine first; and a final answer given as a range with the order of magnitude stated confidently. The number itself barely matters; auditable reasoning is the product.',
    ],
  },
  {
    id: 'mm-seconds-year',
    title: 'Seconds in a year',
    category: 'Market making',
    difficulty: 'Easy',
    prompt: 'How many seconds are in a year? Get a fast estimate and a usable exact-ish figure.',
    solution: [
      'Exact-ish: 365 × 24 × 3600. Do it in stages: 24 × 3600 = 86,400 seconds per day (a number worth knowing cold). Then 86,400 × 365 = 86,400 × 300 + 86,400 × 65 = 25,920,000 + 5,616,000 = 31,536,000. So ≈ 31.5 million seconds.',
      'The famous physicists’ mnemonic: a year is about π × 10⁷ seconds (31.4M vs the true 31.5M — accurate to 0.3%). Quoting this gets you the estimate instantly and signals you collect useful constants.',
      'Mid-calculation magnitude check: 86,400 ≈ 10⁵ seconds/day within a factor of ~1.2, and 365 days ≈ 3.65 × 10², so the answer must be ≈ 3 × 10⁷. Anchoring the exponent first means a slip in detailed arithmetic cannot take you off by ×10 — in trading interviews, order-of-magnitude errors are disqualifying while 2% errors are irrelevant.',
      'Derived numbers worth caching since quantity questions reuse them constantly: a day ≈ 86,400 s ≈ 1,440 minutes; a week ≈ 600,000 s; a fortnight ≈ 1.21 million s; a month ≈ 2.6 million s; a human life ≈ 2.5 × 10⁹ s (~80 years). When a market making game asks for "seconds in a fortnight", you want 14 × 86,400 = 1,209,600 to be retrieval, not computation.',
    ],
  },
  {
    id: 'mm-make-market-747',
    title: 'Make me a market: 747 weight',
    category: 'Market making',
    difficulty: 'Medium',
    style: 'Optiver style',
    prompt:
      'An interviewer says: "Make me a market on the maximum take-off weight of a Boeing 747, in tonnes." How do you respond, and what are they testing?',
    solution: [
      'A market is a bid and an ask: a price you would buy at and one you would sell at. Quoting "350 at 450" means you buy at 350 and sell at 450 — you are committing to take the opposite side of whatever the interviewer chooses, so your bid must be a level you would happily own and your ask one you would happily be short.',
      'First, estimate. A 747 carries ~400 passengers; people plus luggage ≈ 100 kg each → 40 t of payload. Add fuel for very long range — tens of thousands of litres; intuition says fuel is a huge fraction, call it 150–200 t. The airframe and engines: a structure that hauls 200+ tonnes of fuel and payload plausibly weighs 150–200 t empty. Total: roughly 350–450 t. (The true figure is around 400 t, but in the interview your reasoning is the deliverable, not the trivia.)',
      'Then quote around your estimate with width reflecting your confidence: centre 400, genuinely unsure within ±15%, so quote 350 bid / 450 ask. Critically, be ready to trade at your own prices — if the interviewer "sells to you at 350", you now own that position and should be able to say why you are comfortable.',
      'They will then tighten you: "390 at 410, now where?" The lesson being probed is adverse selection — if a better-informed counterparty eagerly lifts your offer, your offer was probably too low, and you should move your market in the direction of the trade. Update visibly and without ego.',
      'What is graded: that you know what a market is; spread width matched to your stated uncertainty (tight markets on things you know, wide on things you do not — never the reverse); willingness to be hit on either side; and updating on order flow. Quoting an absurdly wide market to avoid risk fails — they will tell you wide markets earn nothing — and quoting tight to look confident, then refusing to trade, fails worse.',
    ],
  },
  {
    id: 'mm-two-dice-market',
    title: 'A market on the sum of two dice',
    category: 'Market making',
    difficulty: 'Medium',
    prompt:
      'I will roll two fair dice and pay you the sum in pounds. What is the fair value? An interviewer offers you the chance to buy this for £6.50 — what do you do, and how do you quote a two-way market?',
    solution: [
      'Fair value: by linearity, E[sum] = E[die] + E[die] = 3.5 + 3.5 = 7. No need to touch the distribution for the mean — say that explicitly, it is the point.',
      'At £6.50 the game is 50p cheap: buy it, positive EV of +£0.50 per play. State the edge as a number. If allowed size, you would buy repeatedly — per-play variance is high (the payout ranges 2–12) but edge compounds and risk diversifies over many plays.',
      'A sensible market: 6.80 bid / 7.20 ask, tight because the fair value is known exactly; here uncertainty is pure variance, not ignorance of the mean. Against a counterparty with no possible information edge (dice are dice), your spread is compensation for variance and the cost of your capital, so it can be narrow.',
      'Know the distribution for the follow-ups: 36 equally likely ordered outcomes; the sum k has (6 − |k − 7|) ways for k = 2…12, peaking at 7 with 6/36 = 1/6. Expected questions: P(sum ≥ 10) = (3+2+1)/36 = 1/6; "would you pay 7 to play if you only play once?" — EV-neutral, so it depends on risk appetite, and saying "indifferent at 7, would pay 6.90 happily" shows you separate EV from utility.',
      'Variants to anticipate: paid the product (E = 3.5² = 12.25 by independence), paid max (≈4.47), paid |difference| (≈1.94). The skill is recognising which expectations factor (product over independence) and which require the distribution (max, absolute difference).',
    ],
  },
];
