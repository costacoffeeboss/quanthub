/**
 * Firm profiles compiled from public sources: company career sites, press
 * coverage, and the cross-referenced consensus of interview-prep forums
 * (Wall Street Oasis, Glassdoor, Blind, university society notes).
 *
 * IMPORTANT honesty notes baked into the data and surfaced in the UI:
 *  - Founding years, founders, HQs and "what they do" are well-established fact.
 *  - Compensation figures are APPROXIMATE, cycle- and role-dependent, and drawn
 *    from self-reported forum data — treat as orders of magnitude, not offers.
 *  - Interview-process descriptions are "commonly reported", not official, and
 *    change year to year.
 *  - Culture notes are aggregated impressions, inherently subjective.
 * Always verify specifics on the firm's own careers page.
 */

export type FirmCategory =
  | 'Prop / Market Maker'
  | 'HFT'
  | 'Quant Hedge Fund'
  | 'Bank';

export interface FirmProfile {
  id: string;
  name: string;
  category: FirmCategory;
  founded: string;
  founders?: string;
  hq: string;
  ukPresence: string;
  scale: string;
  oneLiner: string;
  whatTheyDo: string[];
  knownFor: string[];
  roles: string[];
  stack?: string;
  /** Commonly-reported interview stages. */
  interview: string[];
  /** Approximate UK graduate total comp, clearly hedged. */
  comp: string;
  /** Aggregated, subjective culture impressions. */
  culture: string[];
  /** Practical edge for an applicant. */
  applicantEdge: string;
  careersUrl: string;
}

export const firmProfiles: FirmProfile[] = [
  // ---------------- PROP / MARKET MAKERS ----------------
  {
    id: 'janestreet',
    name: 'Jane Street',
    category: 'Prop / Market Maker',
    founded: '2000',
    founders: 'A small group of ex-Susquehanna traders/technologists',
    hq: 'New York',
    ukPresence: 'Large London office (EMEA hub); also Hong Kong, Amsterdam, Singapore.',
    scale:
      'Privately held and secretive about figures, but disclosed bond-prospectus numbers put trading revenue in the many billions/year and net trading revenue of ~$10bn+ in strong years; one of the largest ETF liquidity providers in the world.',
    oneLiner: 'The cult-favourite quant prop firm — functional programming, puzzles, and team-based trading.',
    whatTheyDo: [
      'Market making and proprietary trading across ETFs, equities, bonds, options, commodities and crypto — Jane Street is one of the dominant authorised participants in the global ETF ecosystem, continuously pricing and arbitraging baskets against their constituents.',
      'Trading is highly automated but human-supervised: traders own pricing logic and risk, technologists build the systems, and researchers find structure — the three tracks collaborate closely rather than sitting in silos.',
    ],
    knownFor: [
      'OCaml: famously runs almost its entire stack on the functional language OCaml, and is the language\'s biggest industrial champion (open-source libraries, compiler funding).',
      'A puzzle-and-games culture — monthly public puzzles, in-house trading/estimation games, and an interview style built around probability, EV and "make a market".',
      'Team-based P&L with no individual attribution, which shapes a collaborative, low-ego reputation.',
      'Among the highest graduate compensation in the entire industry.',
    ],
    roles: ['Quantitative Trader', 'Software Engineer', 'Quantitative Researcher'],
    stack: 'OCaml everywhere (trading systems, research tooling), plus Python for analysis; heavy investment in developer tooling.',
    interview: [
      'Online: a probability/mental-math/logic screen; for SWE, a coding/algorithms screen.',
      'Phone/video rounds: probability and EV brainteasers, "think out loud" market-making and betting games, and sequential decision problems — less LeetCode-grind, more reasoning under uncertainty.',
      'Final / on-site ("super day"): multiple rounds mixing trading games (quoting markets, adverse-selection scenarios), deeper probability, and for SWE, system/design and OCaml-friendly coding. They probe how you update on new information and handle being wrong.',
    ],
    comp:
      'Reportedly the top of the market: US new-grad trader packages have been reported around $400–600k all-in (base + sign-on + bonus); London graduate packages are high six figures in GBP terms but typically below US levels. Approximate, heavily bonus- and cycle-dependent.',
    culture: [
      'Reputation for being intellectually intense but collaborative and relatively non-hierarchical; strong mentorship of juniors.',
      'Generalist-friendly: prizes raw reasoning and curiosity over finance background — many hires have no prior markets knowledge.',
      'Lower-key and less "macho" than the prop-trading stereotype, by repeated forum accounts.',
    ],
    applicantEdge:
      'The single best firm to target with this site\'s exact toolkit — drill the brainteasers, mental-math and market-making games hardest. No need for OCaml going in; they teach it. Being articulate while uncertain matters more than getting every puzzle.',
    careersUrl: 'https://www.janestreet.com/join-jane-street/open-roles/',
  },
  {
    id: 'optiver',
    name: 'Optiver',
    category: 'Prop / Market Maker',
    founded: '1986',
    founders: 'Johann Kaemingk (and early Amsterdam options floor traders)',
    hq: 'Amsterdam',
    ukPresence: 'Offices include Amsterdam (HQ), Chicago, Sydney, Shanghai; recruiting reaches UK universities heavily. (Confirm current London footprint on their site.)',
    scale: 'One of the oldest and largest independent options market makers; thousands of staff globally; trades on virtually every major derivatives exchange.',
    oneLiner: 'The options market-making pioneer — and the origin of the legendary 80-questions-in-8-minutes maths test.',
    whatTheyDo: [
      'Continuous options and derivatives market making: providing two-sided quotes on listed options, futures and ETFs across global exchanges, managing the resulting Greeks/inventory in real time.',
      'Began on the Amsterdam options floor and industrialised electronic options pricing; now a fully systematic, low-latency operation with human traders supervising and intervening.',
    ],
    knownFor: [
      'The infamous numerical reasoning test: ~80 arithmetic questions (including decimals, fractions, negatives) in 8 minutes, no calculator — a hard cutoff most candidates fail.',
      'A relentless focus on mental-math speed and accuracy as a trading-aptitude proxy.',
      'Strong, structured graduate trader and SWE programmes with serious training.',
    ],
    roles: ['Trader (Graduate)', 'Software Engineer', 'Quantitative Researcher'],
    stack: 'C++ for low-latency systems; Python for research/analysis.',
    interview: [
      'Online: the 80-in-8 mental-math test (and/or a sequencing test) — the famous filter. Practice under genuine time pressure; many tests penalise wrong answers.',
      'Follow-up rounds: probability/EV brainteasers, market-making games, and "explain your reasoning" exercises; SWE candidates get algorithms/C++.',
      'Final / assessment centre: more trading games, group exercises, and behavioural fit; they want fast, accurate, composed decision-makers.',
    ],
    comp:
      'Competitive European prop comp; graduate trader packages in Amsterdam reported around €100k+ first-year all-in with strong bonus potential, plus relocation. Approximate and cycle-dependent.',
    culture: [
      'Performance-driven and fast-paced, with a strong training cohort/"class" feel for graduates.',
      'Amsterdam base appeals to those wanting continental Europe; English-speaking workplace.',
      'Reputation for valuing speed and decisiveness — a good fit for people who enjoy timed pressure.',
    ],
    applicantEdge:
      'Train the Mental Math Sprint here relentlessly — the 80-in-8 test is the gate and is exactly replicable. Then the market-making games. If your arithmetic is shaky, Optiver is the firm most likely to reject you on that alone.',
    careersUrl: 'https://optiver.com/working-at-optiver/career-opportunities/',
  },
  {
    id: 'sig',
    name: 'SIG (Susquehanna International Group)',
    category: 'Prop / Market Maker',
    founded: '1987',
    founders: 'Jeff Yass and a group of friends (several poker players)',
    hq: 'Bala Cynwyd, Pennsylvania',
    ukPresence: 'Dublin is the main European hub for graduate trading; London office exists too.',
    scale: 'Large global derivatives market maker and prop firm; significant venture arm (early ByteDance/TikTok investor, famously).',
    oneLiner: 'The poker-playing options shop — decision theory and EV as a way of life.',
    whatTheyDo: [
      'Options and derivatives market making and proprietary trading, with deep roots in quantitative options pricing.',
      'A notable venture-capital arm; the founders\' poker background permeates how the firm thinks about edge, sizing and uncertainty.',
    ],
    knownFor: [
      'Teaching new traders POKER as core training — explicitly using it to instil thinking in probabilities, EV, position sizing and emotional control.',
      'A rigorous decision-science culture: the question is always "what\'s the EV and how should I size it?"',
      'Founder Jeff Yass\'s reputation as a serious game-theorist and poker player.',
    ],
    roles: ['Assistant Trader (Graduate)', 'Quantitative Researcher', 'Software Developer'],
    stack: 'C++ and Python typical for trading/quant systems.',
    interview: [
      'Online: numerical/sequence tests and probability screens.',
      'Rounds heavy on EV, betting and poker-style decision problems, mental math, and "would you take this bet?" sizing questions.',
      'Final stages often include game-playing (sometimes literal card/dice games), market-making exercises, and fit.',
    ],
    comp:
      'Strong; Dublin graduate trader packages competitive within European prop. Approximate and bonus-driven.',
    culture: [
      'Distinctive EV/poker mindset; sociable, game-oriented cohort culture.',
      'Dublin hub gives a strong graduate-class community.',
      'Values temperament and bet-sizing discipline as much as raw maths.',
    ],
    applicantEdge:
      'Lean into the Dice EV game and Kelly sizing here — SIG specifically screens for sound EV reasoning and bet sizing under uncertainty. Knowing basic poker/EV concepts and articulating sizing is a genuine edge.',
    careersUrl: 'https://careers.sig.com/',
  },
  {
    id: 'imc',
    name: 'IMC Trading',
    category: 'Prop / Market Maker',
    founded: '1989',
    hq: 'Amsterdam',
    ukPresence: 'Amsterdam (HQ), Chicago, Sydney, Mumbai; recruits UK STEM grads.',
    scale: 'Large global market maker across options, ETFs, equities, bonds; thousands of employees.',
    oneLiner: 'Amsterdam tech-forward market maker with a strong engineering culture.',
    whatTheyDo: [
      'Market making across listed options, ETFs, equities and fixed income on exchanges worldwide.',
      'Heavy technology and FPGA/low-latency investment; trading and engineering are tightly coupled.',
    ],
    knownFor: [
      'Engineering-led market making with serious low-latency tech (FPGAs).',
      'Structured graduate programmes for both trading and tech, with strong training.',
      'A collaborative, less-cutthroat reputation among the Amsterdam prop scene.',
    ],
    roles: ['Trader (Graduate)', 'Software Engineer', 'FPGA/Hardware Engineer', 'Quant'],
    stack: 'C++, Python; FPGA/hardware for ultra-low-latency.',
    interview: [
      'Online numerical/logical tests (mental-math style).',
      'Probability, market-making games and technical rounds; SWE gets algorithms/C++ and sometimes hardware questions.',
      'Assessment centre with trading games and fit.',
    ],
    comp: 'Competitive Amsterdam prop comp, similar ballpark to Optiver for graduates. Approximate.',
    culture: [
      'Tech-respecting and collaborative; good for engineering-minded traders and dev-track candidates.',
      'Amsterdam lifestyle draw; international cohort.',
    ],
    applicantEdge:
      'Strong choice if you straddle trading and engineering. Same mental-math/market-making prep as Optiver/IMC peers; for tech roles, sharpen C++ and systems.',
    careersUrl: 'https://careers.imc.com/',
  },
  {
    id: 'drw',
    name: 'DRW',
    category: 'Prop / Market Maker',
    founded: '1992',
    founders: 'Don Wilson',
    hq: 'Chicago',
    ukPresence: 'London office is a significant European hub.',
    scale: 'Large diversified principal trading firm; activities span traditional markets, real estate, and crypto (via Cumberland, a major crypto liquidity provider).',
    oneLiner: 'Chicago principal trading firm with unusually broad asset reach, including crypto and real estate.',
    whatTheyDo: [
      'Proprietary trading across fixed income, options, futures, energy and equities; market making and relative-value strategies.',
      'Diversified into crypto (Cumberland is one of the larger institutional crypto liquidity providers) and even real estate and venture — broader than a pure options shop.',
    ],
    knownFor: [
      'Breadth of asset classes and a founder (Don Wilson) who still leads and is a well-known markets figure.',
      'Crypto presence via Cumberland — a genuine early institutional mover.',
      'A trader-led, entrepreneurial culture.',
    ],
    roles: ['Trader (Graduate)', 'Software Engineer', 'Quantitative Researcher'],
    stack: 'C++, Python, Java across teams.',
    interview: [
      'Online aptitude/coding screens.',
      'Probability, markets and brainteaser rounds; technical rounds for dev/quant.',
      'Final rounds with trading games and fit.',
    ],
    comp: 'Competitive prop comp; London graduate packages strong. Approximate.',
    culture: [
      'Entrepreneurial and trader-driven; teams have autonomy.',
      'Broad asset exposure means varied desks and paths.',
    ],
    applicantEdge:
      'Good for candidates wanting asset breadth (incl. crypto). Standard prop prep — probability, markets, mental math — plus genuine curiosity about a specific asset class reads well.',
    careersUrl: 'https://www.drw.com/work-at-drw',
  },
  {
    id: 'flow',
    name: 'Flow Traders',
    category: 'Prop / Market Maker',
    founded: '2004',
    hq: 'Amsterdam',
    ukPresence: 'Amsterdam HQ, plus Cluj, New York, Hong Kong, Singapore; UK recruiting.',
    scale: 'Publicly listed (Euronext Amsterdam) — a rare window into a prop firm\'s numbers; a leading ETP (exchange-traded product) market maker.',
    oneLiner: 'Listed ETP specialist market maker — the prop firm whose financials you can actually read.',
    whatTheyDo: [
      'Specialist market maker in ETPs (ETFs/ETNs/ETCs) and increasingly other asset classes including crypto and fixed income.',
      'As a listed company, publishes regular financials — unusual transparency for the sector.',
    ],
    knownFor: [
      'ETP market-making specialism and being publicly listed.',
      'Performance highly correlated with market volatility (good vol = good revenue), visible in its reported results.',
    ],
    roles: ['Trader (Graduate)', 'Software Engineer', 'Quant'],
    stack: 'C++, Python.',
    interview: [
      'Numerical/logic online tests.',
      'Probability, markets and ETF-mechanics-flavoured rounds; technical for dev.',
      'Assessment centre.',
    ],
    comp: 'Competitive Amsterdam comp; structure partly tied to firm performance given listed status. Approximate.',
    culture: ['Amsterdam-based, internationally staffed; performance-linked.', 'Transparency from being public.'],
    applicantEdge:
      'Understanding ETF/ETP creation-redemption mechanics is a genuine, specific edge here. Otherwise standard prop prep.',
    careersUrl: 'https://www.flowtraders.com/careers',
  },
  {
    id: 'davinci',
    name: 'Da Vinci Derivatives',
    category: 'Prop / Market Maker',
    founded: '2015',
    hq: 'Amsterdam',
    ukPresence: 'Amsterdam-based; recruits internationally including UK.',
    scale: 'Younger, fast-growing options/derivatives prop firm; smaller than Optiver/IMC but expanding.',
    oneLiner: 'Newer Amsterdam derivatives prop shop with a quantitative, collaborative bent.',
    whatTheyDo: [
      'Derivatives and options market making and proprietary trading.',
      'Quant-and-tech-driven for a relatively young firm.',
    ],
    knownFor: [
      'Being a newer entrant with a strong growth trajectory and quant focus.',
      'A flatter, startup-ier feel than the incumbents.',
    ],
    roles: ['Trader', 'Quantitative Researcher', 'Software Engineer'],
    stack: 'C++, Python.',
    interview: [
      'Numerical and probability screening.',
      'Markets/EV and technical rounds.',
      'Final fit and games.',
    ],
    comp: 'Competitive for its size; equity/bonus upside emphasised at growing firms. Approximate.',
    culture: ['Younger, entrepreneurial, quant-leaning.', 'Smaller cohorts, more individual visibility.'],
    applicantEdge:
      'A growing firm can mean faster responsibility. Standard derivatives/markets prep; show genuine interest in options pricing.',
    careersUrl: 'https://www.davincitrading.com/jobs/',
  },
  {
    id: 'maven',
    name: 'Maven Securities',
    category: 'Prop / Market Maker',
    founded: '2011',
    hq: 'London',
    ukPresence: 'London-headquartered — one of the notable UK-born prop firms; also Hong Kong, Amsterdam.',
    scale: 'Mid-sized independent prop firm; options/derivatives focus, expanding into systematic.',
    oneLiner: 'London-grown derivatives prop firm — a home-grown alternative to the Amsterdam/US giants.',
    whatTheyDo: [
      'Options and derivatives market making and proprietary trading; growing systematic/quant strategies.',
      'One of the more prominent London-headquartered prop shops.',
    ],
    knownFor: [
      'Being UK-based with a strong London graduate presence.',
      'Derivatives and volatility trading focus.',
    ],
    roles: ['Trader (Graduate)', 'Quantitative Researcher', 'Software Engineer'],
    stack: 'Python, C++.',
    interview: [
      'Online numerical/probability tests.',
      'Markets, EV and brainteaser rounds; technical for quant/dev.',
      'Final assessment with trading games.',
    ],
    comp: 'Competitive London prop comp; bonus-driven. Approximate.',
    culture: ['London-centric, mid-sized; more individual visibility than the giants.', 'Derivatives/vol culture.'],
    applicantEdge:
      'If you want to stay in London specifically, Maven is a strong target. Standard prop prep with an options/vol slant.',
    careersUrl: 'https://www.mavensecurities.com/careers/',
  },
  {
    id: 'mako',
    name: 'Mako Trading',
    category: 'Prop / Market Maker',
    founded: '1999',
    hq: 'London',
    ukPresence: 'London-headquartered.',
    scale: 'Established London options/derivatives market maker.',
    oneLiner: 'Long-standing London options market maker.',
    whatTheyDo: [
      'Options and derivatives market making across asset classes, with roots in European listed options.',
    ],
    knownFor: ['Being one of the older London-based options market makers.', 'Derivatives/vol focus.'],
    roles: ['Trader', 'Quantitative Analyst', 'Developer'],
    stack: 'Python, C++.',
    interview: [
      'Numerical/probability screens.',
      'Markets and options-flavoured rounds.',
      'Final fit and games.',
    ],
    comp: 'Competitive London prop comp. Approximate.',
    culture: ['London-based, established; derivatives focus.'],
    applicantEdge: 'Options knowledge and London focus help. Standard prop prep.',
    careersUrl: 'https://www.mako.com/careers',
  },
  {
    id: 'fiverings',
    name: 'Five Rings',
    category: 'Prop / Market Maker',
    founded: '2017',
    hq: 'New York',
    ukPresence: 'US-based; recruits internationally including from UK universities.',
    scale: 'Younger but well-regarded prop firm; competitive comp reputation.',
    oneLiner: 'Newer US prop firm punching above its weight on graduate comp and rigour.',
    whatTheyDo: [
      'Proprietary trading and market making across asset classes; quant and tech driven.',
    ],
    knownFor: [
      'A reputation for very competitive graduate offers despite its youth.',
      'Heavy emphasis on probability, games and aptitude in hiring.',
    ],
    roles: ['Trader', 'Software Engineer', 'Quantitative Researcher'],
    stack: 'C++, Python.',
    interview: [
      'Online aptitude (probability, math, sometimes sequences).',
      'Multiple rounds of probability/EV, market-making and games; coding for SWE.',
      'Final / super-day.',
    ],
    comp: 'Reported to be among the higher US graduate packages, competitive with the top tier. Approximate.',
    culture: ['Young, intense, meritocratic; small cohorts.'],
    applicantEdge:
      'Probability and games are central — this site\'s core prep maps directly. Strong aptitude can land an outsized offer.',
    careersUrl: 'https://fiverings.com/careers/',
  },

  // ---------------- HFT ----------------
  {
    id: 'hrt',
    name: 'Hudson River Trading (HRT)',
    category: 'HFT',
    founded: '2002',
    hq: 'New York',
    ukPresence: 'London office is a significant hub; also Singapore, others.',
    scale: 'Major HFT/algorithmic firm; reportedly responsible for a meaningful share of US equity volume; thousands of staff.',
    oneLiner: 'Math-and-science HFT — closer to a research lab than a trading floor.',
    whatTheyDo: [
      'Automated, high-frequency and mid-frequency trading across global markets; everything is algorithmic, with research and engineering at the centre.',
      'Quantitative researchers ("algo devs") design signals and strategies; core engineers build ultra-low-latency systems.',
    ],
    knownFor: [
      'A strongly academic, math/CS-olympiad-friendly hiring bar.',
      'Treating trading as a research-and-engineering problem rather than a discretionary one.',
    ],
    roles: ['Algorithm Developer / Quant Researcher', 'Core/Software Engineer', 'Quantitative Trader'],
    stack: 'C++ (performance-critical), Python (research); deep systems work.',
    interview: [
      'Online: hard coding and/or math/probability screens.',
      'Algorithms and data-structures rounds (tougher and more performance-aware than Big Tech), probability/brainteasers, and systems questions.',
      'On-site: deep technical rounds; for researchers, statistics and signal-reasoning; for core, low-level systems/C++.',
    ],
    comp: 'Top-tier tech/quant comp; strong for both research and engineering tracks. Approximate, bonus-driven.',
    culture: [
      'Academic, low-ego, research-lab atmosphere by repeated accounts.',
      'Engineering is first-class, not support — a draw for strong CS candidates.',
    ],
    applicantEdge:
      'Competitive-programming strength (Codeforces/ICPC) is a real signal here. For research, statistics depth and clean coding; for core, C++ and systems. Less mental-math-game-focused than the options shops.',
    careersUrl: 'https://www.hudsonrivertrading.com/careers/',
  },
  {
    id: 'jump',
    name: 'Jump Trading',
    category: 'HFT',
    founded: '1999',
    founders: 'Bill Disomma and Paul Gurinas (Chicago floor traders)',
    hq: 'Chicago',
    ukPresence: 'London office; also Singapore, others.',
    scale: 'Major secretive HFT firm; significant crypto and research activity (Jump Crypto).',
    oneLiner: 'Secretive Chicago HFT giant with deep low-latency and crypto research arms.',
    whatTheyDo: [
      'High-frequency and systematic trading across global futures, equities, FX and crypto.',
      'Heavy low-latency infrastructure (FPGA, networking, microwave links) and a notable crypto/research division.',
    ],
    knownFor: [
      'Extreme secrecy — very low public profile for its size.',
      'Cutting-edge latency tech and a serious research bench.',
    ],
    roles: ['Quant Researcher', 'Software Engineer', 'Hardware/FPGA Engineer', 'Trader'],
    stack: 'C++, FPGA/hardware, Python.',
    interview: [
      'Hard technical screens (coding/math).',
      'Algorithms, systems and probability rounds; research candidates get statistics/signals.',
      'On-site deep dives.',
    ],
    comp: 'Top-tier HFT comp. Approximate.',
    culture: ['Secretive, autonomous teams ("pods"); strong engineering.', 'Low external visibility.'],
    applicantEdge:
      'Engineering and research rigour over markets trivia. Competitive programming and systems depth help; expect little hand-holding given the secrecy.',
    careersUrl: 'https://www.jumptrading.com/careers/',
  },
  {
    id: 'tower',
    name: 'Tower Research Capital',
    category: 'HFT',
    founded: '1998',
    founders: 'Mark Gorton',
    hq: 'New York',
    ukPresence: 'London and global offices; trades worldwide markets.',
    scale: 'Long-standing HFT firm operating many semi-autonomous trading teams; significant global footprint.',
    oneLiner: 'Veteran HFT firm structured around many independent low-latency trading teams.',
    whatTheyDo: [
      'High-frequency and automated trading across global markets, run through numerous semi-autonomous teams sharing core infrastructure.',
    ],
    knownFor: [
      'A multi-team model with shared low-latency infrastructure.',
      'Longevity in the HFT space (founded in the late 1990s).',
    ],
    roles: ['Software Engineer', 'Quant Trader/Researcher', 'FPGA Engineer'],
    stack: 'C++, FPGA, Python.',
    interview: [
      'Coding/math online screens.',
      'Algorithms, systems and probability rounds.',
      'On-site technical.',
    ],
    comp: 'Competitive HFT comp. Approximate.',
    culture: ['Team-autonomy model; engineering-heavy.'],
    applicantEdge: 'Systems/latency engineering and clean algorithms. Standard HFT technical prep.',
    careersUrl: 'https://tower-research.com/open-positions/',
  },
  {
    id: 'xtx',
    name: 'XTX Markets',
    category: 'HFT',
    founded: '2015',
    founders: 'Alexander Gerko (and co-founders)',
    hq: 'London',
    ukPresence: 'London-headquartered — a UK quant champion; also Paris, Singapore, others.',
    scale:
      'One of the largest FX market makers in the world and a top liquidity provider across equities and other asset classes; famously high revenue-per-employee; investing heavily in large GPU compute clusters.',
    oneLiner: 'London\'s algorithmic-trading powerhouse — no human traders, pure quant/ML and enormous compute.',
    whatTheyDo: [
      'Purely algorithmic market making across FX, equities, fixed income, commodities and crypto — XTX is consistently ranked among the very top FX liquidity providers globally.',
      'No discretionary traders: machine-learning models, built and supervised by researchers and engineers, do the trading; the firm invests heavily in GPU supercomputing for model training.',
    ],
    knownFor: [
      'Being a pure quant/ML market maker with no human traders — unusual even among quants.',
      'Extraordinary revenue per head and a massive compute investment (one of the larger private GPU clusters).',
      'Founder Alex Gerko\'s public profile (and his Olympiad/maths background).',
    ],
    roles: ['Quantitative Researcher', 'Software Engineer', 'Research/ML Engineer', 'Core Infrastructure'],
    stack: 'C++, Python, large-scale ML/GPU infrastructure.',
    interview: [
      'Hard quantitative and/or coding screens.',
      'Statistics, probability, ML and coding rounds; strong emphasis on research ability for researcher roles.',
      'On-site technical and research discussion.',
    ],
    comp: 'Among the highest in London quant; researcher/engineer packages strong, with notable bonus upside given firm profitability. Approximate.',
    culture: [
      'Research- and engineering-driven; quietly prestigious in the London quant scene.',
      'Heavy ML focus; PhD-friendly but hires exceptional grads.',
    ],
    applicantEdge:
      'Statistics/ML depth and strong coding beat markets trivia. A genuine ML or research project you can defend is valuable. Ideal for the research-track candidate who wants to stay in London.',
    careersUrl: 'https://www.xtxmarkets.com/careers/',
  },

  // ---------------- QUANT HEDGE FUNDS ----------------
  {
    id: 'citadel',
    name: 'Citadel',
    category: 'Quant Hedge Fund',
    founded: '1990',
    founders: 'Kenneth C. Griffin',
    hq: 'Miami (relocated from Chicago)',
    ukPresence: 'Large London office; global presence.',
    scale:
      'One of the world\'s largest and most successful multi-strategy hedge funds, managing tens of billions (reported $60bn+ AUM) and among the most profitable funds in history by total gains.',
    oneLiner: 'The elite multi-strategy hedge fund — pod-based, intense, and famously hard to get into.',
    whatTheyDo: [
      'Multi-strategy hedge fund running many specialised teams ("pods") across equities, fixed income, commodities, credit and quant strategies, under tight centralised risk management.',
      'Distinct from Citadel Securities (the market maker) — same founder, separate companies.',
    ],
    knownFor: [
      'Elite reputation and selectivity; a flagship multi-manager platform.',
      'A demanding, performance-driven pod model with real accountability.',
      'The Citadel/Citadel Securities joint internship — one of the most sought-after in finance.',
    ],
    roles: ['Quantitative Researcher', 'Software Engineer', 'Quant Trader', 'Investment Analyst'],
    stack: 'Python, C++, KDB/Q (common in quant finance), large data infrastructure.',
    interview: [
      'Online: quantitative and/or coding assessments (sometimes HackerRank-style; quant roles get probability/stats).',
      'Multiple rounds: probability, statistics, brainteasers, coding, and role-specific depth; researchers face serious stats/ML and a project discussion.',
      'Final / super-day: technical plus behavioural; the bar is high and the process thorough.',
    ],
    comp: 'Among the highest in the industry; graduate quant researcher/SWE packages are top-tier, with large bonus potential. Approximate, performance-driven.',
    culture: [
      'High-performance and demanding by repeated accounts; strong resources and data.',
      'Pod structure means accountability and pressure, but also rapid learning.',
    ],
    applicantEdge:
      'Statistics and probability depth plus clean coding are essential. The joint internship is a premier route — apply early. Be ready for a rigorous, multi-stage process.',
    careersUrl: 'https://www.citadel.com/careers/',
  },
  {
    id: 'citsec',
    name: 'Citadel Securities',
    category: 'HFT',
    founded: '2002',
    founders: 'Kenneth C. Griffin',
    hq: 'Miami',
    ukPresence: 'Large London office; global.',
    scale:
      'One of the world\'s largest market makers — reportedly handles a very large share of US retail equity order flow and a major fraction of US-listed volume; a dominant electronic liquidity provider.',
    oneLiner: 'The market-making sister to Citadel — a dominant force in US equity liquidity.',
    whatTheyDo: [
      'Electronic market making across equities, options, FX, treasuries and more; a leading provider of liquidity to retail brokers and institutions.',
      'Separate company from the Citadel hedge fund, though both founded/owned by Ken Griffin.',
    ],
    knownFor: [
      'Its scale in US retail order-flow execution and overall market-making dominance.',
      'Top-tier comp and a hard technical/quant bar.',
    ],
    roles: ['Quantitative Researcher', 'Software Engineer', 'Quantitative Trader'],
    stack: 'C++, Python, low-latency systems.',
    interview: [
      'Hard online coding/quant screens.',
      'Algorithms, probability/statistics, and systems rounds; trading games for trader roles.',
      'On-site / super-day.',
    ],
    comp: 'Top-tier, comparable to the elite prop/HFT firms. Approximate.',
    culture: ['High-performance, engineering-and-quant-driven; resourced like a tech giant.'],
    applicantEdge:
      'Treat like an HFT + quant hybrid: strong coding, probability and (for trading) games. The joint internship with Citadel is the marquee route.',
    careersUrl: 'https://www.citadelsecurities.com/careers/',
  },
  {
    id: 'twosigma',
    name: 'Two Sigma',
    category: 'Quant Hedge Fund',
    founded: '2001',
    founders: 'John Overdeck and David Siegel',
    hq: 'New York',
    ukPresence: 'London office; also Houston, Hong Kong, others.',
    scale: 'Major systematic/quant hedge fund managing tens of billions; data-science and technology centric.',
    oneLiner: 'Data-science-first systematic hedge fund — closer to a tech/ML company than a trading floor.',
    whatTheyDo: [
      'Systematic, data-driven investment management: building models from vast and varied datasets to trade across asset classes.',
      'Strong technology and machine-learning culture; also has venture and other arms.',
    ],
    knownFor: [
      'Treating investing as a large-scale data-science and engineering problem.',
      'A research/engineering culture and (historically) data-science competitions/branding.',
    ],
    roles: ['Quantitative Researcher', 'Software Engineer', 'Data Scientist'],
    stack: 'Python, C++, Java; large data/ML platforms.',
    interview: [
      'Online coding and/or quant screens.',
      'Statistics, probability, ML, and coding rounds; project discussion for researchers.',
      'On-site technical and fit.',
    ],
    comp: 'Top-tier quant comp. Approximate.',
    culture: ['Engineering/ML-driven, academic; values data rigour.'],
    applicantEdge:
      'Statistics/ML and software engineering are central. A defensible data/ML project and clean coding help; less mental-math-game focus.',
    careersUrl: 'https://careers.twosigma.com/',
  },
  {
    id: 'deshaw',
    name: 'D. E. Shaw & Co.',
    category: 'Quant Hedge Fund',
    founded: '1988',
    founders: 'David E. Shaw',
    hq: 'New York',
    ukPresence: 'London office; global.',
    scale: 'Pioneering quantitative hedge fund managing tens of billions; storied history and computer-science pedigree.',
    oneLiner: 'The original computational hedge fund — academic, secretive, and intellectually elite.',
    whatTheyDo: [
      'Quantitative and qualitative investment across many strategies; a pioneer of computational finance (David Shaw is a computer scientist; alumni include notable tech founders).',
      'Mixes systematic quant strategies with discretionary and hybrid approaches.',
    ],
    knownFor: [
      'Its place in quant history and a famously high, academic hiring bar.',
      'A puzzle/aptitude-heavy interview reputation.',
      'Alumni network (e.g. Jeff Bezos worked there early).',
    ],
    roles: ['Quantitative Analyst/Researcher', 'Software Developer', 'Quant Trader'],
    stack: 'C++, Python; strong CS culture.',
    interview: [
      'Hard online aptitude/coding tests.',
      'Probability, brainteasers, statistics and coding rounds — known for difficulty and rigour.',
      'On-site multiple rounds.',
    ],
    comp: 'Top-tier; intern and graduate packages highly competitive. Approximate.',
    culture: ['Academic, intellectual, selective; CS-heritage prestige.'],
    applicantEdge:
      'Brainteasers, probability and clean coding are central — this site\'s probability/combinatorics/logic banks are well-aimed. Expect a hard, puzzle-rich process.',
    careersUrl: 'https://www.deshaw.com/careers',
  },
  {
    id: 'gresearch',
    name: 'G-Research',
    category: 'Quant Hedge Fund',
    founded: 'Late 2000s (≈2008–2010)',
    hq: 'London',
    ukPresence: 'London-headquartered — one of the UK\'s premier quant research employers.',
    scale: 'Leading London-based quantitative research firm; secretive about figures but widely regarded as a top-paying quant research shop in Europe.',
    oneLiner: 'London\'s flagship quant-research house — PhD-dense, secretive, and very well paid.',
    whatTheyDo: [
      'Quantitative research and systematic trading: building predictive models of financial markets using machine learning, statistics and big data.',
      'Research and engineering centric, with a strong academic bench.',
    ],
    knownFor: [
      'A research-lab culture with many PhDs and a serious ML focus.',
      'A reputation for top-of-market compensation for quant researchers in London.',
      'Sponsorship of ML academia and competitions.',
    ],
    roles: ['Quantitative Researcher', 'Software Engineer', 'Machine Learning Engineer'],
    stack: 'Python, C++, large-scale ML/data platforms.',
    interview: [
      'Hard online: maths, statistics and/or coding tests.',
      'Probability, statistics, ML and coding rounds; research depth and a project discussion for researchers.',
      'On-site technical and research interviews.',
    ],
    comp: 'Reported among the highest London quant-research packages; strong base plus large bonus. Approximate.',
    culture: ['Academic, research-driven, secretive; PhD-friendly.', 'London-centric prestige.'],
    applicantEdge:
      'Statistics/ML and research ability dominate. Strong mathematical maturity and a defensible research project matter more than markets trivia. A top London target for the research track.',
    careersUrl: 'https://www.gresearch.com/vacancies/',
  },
  {
    id: 'qube',
    name: 'Qube Research & Technologies (QRT)',
    category: 'Quant Hedge Fund',
    founded: '2018 (as independent; roots in Credit Suisse QIS/systematic teams)',
    hq: 'London',
    ukPresence: 'London-headquartered; also global offices.',
    scale: 'Fast-growing systematic/quantitative manager; spun out of Credit Suisse\'s quantitative strategies group and grown rapidly.',
    oneLiner: 'Bank-spinout quant manager that has grown fast into a serious systematic player.',
    whatTheyDo: [
      'Systematic and quantitative investment across asset classes, combining research, data and technology.',
      'Originated in Credit Suisse\'s quant strategies (QIS) before becoming independent.',
    ],
    knownFor: [
      'Rapid growth as an independent quant firm with a bank-strategies heritage.',
      'Technology-and-research focus.',
    ],
    roles: ['Quantitative Researcher', 'Software Engineer', 'Quant Developer'],
    stack: 'Python, C++.',
    interview: [
      'Quant/coding online screens.',
      'Probability, statistics and coding rounds; research discussion for researchers.',
      'On-site technical.',
    ],
    comp: 'Competitive London quant comp; growth-firm upside. Approximate.',
    culture: ['Research/tech-driven; growth-stage energy.'],
    applicantEdge: 'Statistics and coding focus. Good for research/dev candidates wanting a fast-growing London quant.',
    careersUrl: 'https://www.qube-rt.com/careers',
  },
  {
    id: 'squarepoint',
    name: 'Squarepoint Capital',
    category: 'Quant Hedge Fund',
    founded: '2014',
    hq: 'London / New York',
    ukPresence: 'London is a major hub; global offices.',
    scale: 'Sizeable systematic/quantitative multi-strategy manager; technology-heavy.',
    oneLiner: 'Global systematic multi-strategy fund with heavy engineering needs.',
    whatTheyDo: [
      'Systematic, data-driven trading across many strategies and asset classes.',
      'Large technology and data-engineering organisation supporting research.',
    ],
    knownFor: ['A broad systematic platform with strong engineering demand.', 'Global multi-hub presence.'],
    roles: ['Quantitative Researcher', 'Software Engineer', 'Quant Developer', 'Data Engineer'],
    stack: 'Python, C++, KDB/Q, data platforms.',
    interview: [
      'Coding/quant online screens.',
      'Algorithms, probability/statistics and systems rounds.',
      'On-site technical and fit.',
    ],
    comp: 'Competitive quant comp. Approximate.',
    culture: ['Engineering-and-research-driven; multi-hub.'],
    applicantEdge: 'Strong fit for engineering-leaning quants and quant devs. Coding plus stats prep.',
    careersUrl: 'https://www.squarepoint-capital.com/careers',
  },

  // ---------------- BANKS ----------------
  {
    id: 'jpm',
    name: 'J.P. Morgan',
    category: 'Bank',
    founded: 'Bank with 19th-century roots; modern JPMorgan Chase formed 2000',
    hq: 'New York',
    ukPresence: 'Major London operations (EMEA hub) with large graduate/intern intake; Bournemouth, Glasgow tech hubs.',
    scale: 'One of the largest banks in the world; vast markets, quant research and technology divisions.',
    oneLiner: 'Bulge-bracket bank with deep quant-research, strats and technology graduate routes.',
    whatTheyDo: [
      'Full-service investment bank: sales & trading, quantitative research, structuring, risk, and a huge technology organisation.',
      'Quant roles span QR (quantitative research — pricing models, risk), strats, and markets technology.',
    ],
    knownFor: [
      'Scale, structured graduate programmes, spring weeks and serious training.',
      'A strong quantitative research division and respected derivatives/markets franchise.',
      'A common, well-regarded entry point that many later parlay into buy-side quant roles.',
    ],
    roles: ['Quantitative Research', 'Markets/Sales & Trading', 'Technology/Strats', 'Risk'],
    stack: 'Python, C++, Java; Athena (its large cross-asset Python platform) is well known.',
    interview: [
      'Online: numerical tests, situational/behavioural assessments, sometimes HireVue video and coding.',
      'For quant: probability, stochastic-calculus basics, derivatives and coding; structured competency interviews throughout.',
      'Assessment centre / superday: technical plus behavioural rounds.',
    ],
    comp: 'Bank pay scale — lower base and smaller bonuses than top prop/HFT/funds, but solid and more predictable; London graduate packages typically £50–85k all-in. Approximate.',
    culture: [
      'Structured, programme-driven, more hierarchical than prop firms; strong training and brand.',
      'More predictable hours in quant/strats than front-office S&T, generally.',
    ],
    applicantEdge:
      'Spring weeks (first years) and summer internships are the main pipeline — apply very early. For quant, prepare stochastic-calculus basics and derivatives alongside probability. A strong springboard if prop/funds don\'t land first time.',
    careersUrl: 'https://careers.jpmorgan.com/uk/en/students',
  },
  {
    id: 'gs',
    name: 'Goldman Sachs',
    category: 'Bank',
    founded: '1869',
    hq: 'New York',
    ukPresence: 'Major London operations; large graduate/intern and spring intake.',
    scale: 'Premier global investment bank; renowned "Strats" (strategists) function bridging quant, trading and technology.',
    oneLiner: 'The bank whose "Strats" role effectively invented the bank-quant career path.',
    whatTheyDo: [
      'Investment banking, markets/sales & trading, asset management and a large engineering division.',
      'The Strats (strategists) group is its signature quant route — building pricing models, risk and trading tools embedded with desks.',
    ],
    knownFor: [
      'The Strats function — a prestigious, long-standing bank-quant track.',
      'Brand prestige, structured programmes and a strong markets franchise.',
    ],
    roles: ['Strats (Quantitative)', 'Markets/Sales & Trading', 'Engineering', 'Risk'],
    stack: 'Slang (Goldman\'s proprietary language) historically central to Strats; plus Python, Java, C++.',
    interview: [
      'Online: numerical and behavioural assessments, sometimes coding/HireVue.',
      'For Strats: probability, maths, problem-solving and coding; structured behavioural rounds.',
      'Assessment centre / superday.',
    ],
    comp: 'Bank scale; London graduate packages broadly £50–85k all-in, role-dependent. Approximate.',
    culture: ['Prestigious, structured, demanding; strong brand and network.', 'Strats sit close to trading desks.'],
    applicantEdge:
      'Target the Strats/quant streams explicitly; spring weeks for first years. Probability plus some derivatives/stochastic-calculus basics and clean problem-solving. Prestigious springboard to the buy-side.',
    careersUrl: 'https://www.goldmansachs.com/careers/students/',
  },
  {
    id: 'ms',
    name: 'Morgan Stanley',
    category: 'Bank',
    founded: '1935',
    hq: 'New York',
    ukPresence: 'Major London operations; Glasgow and Budapest tech/quant hubs; large graduate intake.',
    scale: 'Bulge-bracket investment bank with strong quantitative finance, modelling and technology divisions.',
    oneLiner: 'Bulge-bracket bank with respected quant-finance and modelling graduate routes.',
    whatTheyDo: [
      'Investment banking, sales & trading, wealth/asset management, and large technology and quantitative divisions.',
      'Quant roles in modelling, risk, strats and markets technology.',
    ],
    knownFor: [
      'A solid quantitative finance and risk-modelling reputation and structured graduate programmes.',
      'Tech/quant hubs outside London (e.g. Glasgow) broadening UK entry points.',
    ],
    roles: ['Quantitative Finance / Modelling', 'Sales & Trading', 'Technology', 'Risk'],
    stack: 'Python, Java, C++.',
    interview: [
      'Online numerical/behavioural assessments, sometimes coding.',
      'Probability, derivatives/stochastic-calculus basics and coding for quant; structured behavioural rounds.',
      'Assessment centre / superday.',
    ],
    comp: 'Bank scale; London graduate packages broadly £50–85k all-in. Approximate.',
    culture: ['Structured, programme-driven; strong training and brand.'],
    applicantEdge:
      'Apply to quant-finance/modelling streams and spring weeks early. Standard bank-quant prep: probability plus derivatives basics and coding.',
    careersUrl: 'https://www.morganstanley.com/careers/students-graduates',
  },
];

export const FIRM_CATEGORIES: FirmCategory[] = [
  'Prop / Market Maker',
  'HFT',
  'Quant Hedge Fund',
  'Bank',
];

/**
 * Map a Trackr programme's firm display-name to a profile id.
 * Ordered so more-specific names (Citadel Securities) match before broader ones.
 */
const NAME_TO_ID: Array<[RegExp, string]> = [
  [/jane street/i, 'janestreet'],
  [/citadel securities/i, 'citsec'],
  [/citadel/i, 'citadel'],
  [/optiver/i, 'optiver'],
  [/sig|susquehanna/i, 'sig'],
  [/\bimc\b/i, 'imc'],
  [/jump/i, 'jump'],
  [/hudson river/i, 'hrt'],
  [/\bdrw\b/i, 'drw'],
  [/two sigma/i, 'twosigma'],
  [/shaw/i, 'deshaw'],
  [/xtx/i, 'xtx'],
  [/g-research/i, 'gresearch'],
  [/qube/i, 'qube'],
  [/flow traders/i, 'flow'],
  [/da vinci/i, 'davinci'],
  [/five rings/i, 'fiverings'],
  [/squarepoint/i, 'squarepoint'],
  [/maven/i, 'maven'],
  [/mako/i, 'mako'],
  [/tower/i, 'tower'],
  [/j\.?p\.? morgan|jpmorgan/i, 'jpm'],
  [/goldman/i, 'gs'],
  [/morgan stanley/i, 'ms'],
];

const PROFILE_IDS = new Set(firmProfiles.map((f) => f.id));

export function profileIdForFirm(firm: string): string | undefined {
  for (const [re, id] of NAME_TO_ID) {
    if (re.test(firm) && PROFILE_IDS.has(id)) return id;
  }
  return undefined;
}
