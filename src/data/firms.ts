export type ProgrammeType = 'Internship' | 'Graduate' | 'Spring Week';
export type RoleFamily = 'Trading' | 'Research' | 'Development' | 'Risk' | 'Multiple';

export interface Programme {
  id: string;
  firm: string;
  type: ProgrammeType;
  role: RoleFamily;
  location: string;
  /** Typical window in which applications have opened in recent cycles. Approximate. */
  window: string;
  /** Practical apply-by guidance. Most quant firms recruit on a rolling basis. Approximate. */
  closes: string;
  /** Approximate graduate/intern total comp. Self-reported, cycle-dependent — orders of magnitude, not offers. */
  comp: string;
  careersUrl: string;
}

export const APPLICATION_STAGES = [
  'Not applied',
  'Applied',
  'Online assessment',
  'Interview',
  'Offer',
  'Rejected',
] as const;

export type ApplicationStage = (typeof APPLICATION_STAGES)[number];

/**
 * UK-relevant quant programmes plus the wider offices these same firms recruit
 * graduates into. Locations, windows, apply-by guidance and comp are all
 * APPROXIMATE and change every cycle — this is a planning aid, not live data.
 * Comp is self-reported (forums), expressed as a hedged range / monthly figure.
 */
export const programmes: Programme[] = [
  // ---- Jane Street ----
  { id: 'janestreet-intern', firm: 'Jane Street', type: 'Internship', role: 'Trading', location: 'London', window: 'Aug–Oct', closes: 'Rolling (early)', comp: '≈£8–12k / month', careersUrl: 'https://www.janestreet.com/join-jane-street/open-roles/' },
  { id: 'janestreet-grad', firm: 'Jane Street', type: 'Graduate', role: 'Trading', location: 'London', window: 'Aug–Nov', closes: 'Rolling (early)', comp: '≈£150–225k', careersUrl: 'https://www.janestreet.com/join-jane-street/open-roles/' },
  { id: 'janestreet-grad-ny', firm: 'Jane Street', type: 'Graduate', role: 'Trading', location: 'New York', window: 'Aug–Nov', closes: 'Rolling (early)', comp: '≈$400–600k', careersUrl: 'https://www.janestreet.com/join-jane-street/open-roles/' },
  { id: 'janestreet-grad-hk', firm: 'Jane Street', type: 'Graduate', role: 'Trading', location: 'Hong Kong', window: 'Aug–Nov', closes: 'Rolling (early)', comp: '≈US$200k+ equiv', careersUrl: 'https://www.janestreet.com/join-jane-street/open-roles/' },
  { id: 'janestreet-swe', firm: 'Jane Street', type: 'Graduate', role: 'Development', location: 'London', window: 'Aug–Nov', closes: 'Rolling (early)', comp: '≈£130–190k', careersUrl: 'https://www.janestreet.com/join-jane-street/open-roles/' },

  // ---- Citadel (hedge fund) ----
  { id: 'citadel-intern', firm: 'Citadel', type: 'Internship', role: 'Research', location: 'London', window: 'Aug–Oct', closes: 'Rolling (early)', comp: '≈£10–14k / month', careersUrl: 'https://www.citadel.com/careers/' },
  { id: 'citadel-grad-ny', firm: 'Citadel', type: 'Graduate', role: 'Research', location: 'New York', window: 'Aug–Nov', closes: 'Rolling (early)', comp: '≈$300–500k', careersUrl: 'https://www.citadel.com/careers/' },
  { id: 'citadel-swe', firm: 'Citadel', type: 'Graduate', role: 'Development', location: 'London', window: 'Aug–Nov', closes: 'Rolling (early)', comp: '≈£120–180k', careersUrl: 'https://www.citadel.com/careers/' },

  // ---- Citadel Securities (market maker) ----
  { id: 'citsec-grad', firm: 'Citadel Securities', type: 'Graduate', role: 'Trading', location: 'London', window: 'Aug–Nov', closes: 'Rolling (early)', comp: '≈£140–200k', careersUrl: 'https://www.citadelsecurities.com/careers/' },
  { id: 'citsec-grad-ny', firm: 'Citadel Securities', type: 'Graduate', role: 'Trading', location: 'New York', window: 'Aug–Nov', closes: 'Rolling (early)', comp: '≈$350–600k', careersUrl: 'https://www.citadelsecurities.com/careers/' },
  { id: 'citsec-qr', firm: 'Citadel Securities', type: 'Graduate', role: 'Research', location: 'London', window: 'Aug–Nov', closes: 'Rolling (early)', comp: '≈£130–190k', careersUrl: 'https://www.citadelsecurities.com/careers/' },

  // ---- Optiver ----
  { id: 'optiver-intern', firm: 'Optiver', type: 'Internship', role: 'Trading', location: 'Amsterdam', window: 'Sep–Nov', closes: '~Dec (rolling)', comp: '≈€4–6k / month', careersUrl: 'https://optiver.com/working-at-optiver/career-opportunities/' },
  { id: 'optiver-grad', firm: 'Optiver', type: 'Graduate', role: 'Trading', location: 'Amsterdam', window: 'Sep–Dec', closes: '~Dec (rolling)', comp: '≈€100–140k', careersUrl: 'https://optiver.com/working-at-optiver/career-opportunities/' },
  { id: 'optiver-grad-chi', firm: 'Optiver', type: 'Graduate', role: 'Trading', location: 'Chicago', window: 'Aug–Nov', closes: 'Rolling (early)', comp: '≈$300–500k', careersUrl: 'https://optiver.com/working-at-optiver/career-opportunities/' },
  { id: 'optiver-grad-syd', firm: 'Optiver', type: 'Graduate', role: 'Trading', location: 'Sydney', window: 'Feb–Apr', closes: 'Rolling (early)', comp: '≈A$150–220k', careersUrl: 'https://optiver.com/working-at-optiver/career-opportunities/' },
  { id: 'optiver-swe', firm: 'Optiver', type: 'Graduate', role: 'Development', location: 'Amsterdam', window: 'Sep–Dec', closes: '~Dec (rolling)', comp: '≈€90–120k', careersUrl: 'https://optiver.com/working-at-optiver/career-opportunities/' },

  // ---- SIG (Susquehanna) ----
  { id: 'sig-grad', firm: 'SIG (Susquehanna)', type: 'Graduate', role: 'Trading', location: 'Dublin', window: 'Sep–Dec', closes: '~Dec', comp: '≈€90–130k', careersUrl: 'https://careers.sig.com/' },
  { id: 'sig-grad-lon', firm: 'SIG (Susquehanna)', type: 'Graduate', role: 'Trading', location: 'London', window: 'Sep–Dec', closes: '~Dec', comp: '≈£90–140k', careersUrl: 'https://careers.sig.com/' },

  // ---- IMC Trading ----
  { id: 'imc-intern', firm: 'IMC Trading', type: 'Internship', role: 'Trading', location: 'Amsterdam', window: 'Sep–Nov', closes: '~Dec (rolling)', comp: '≈€3.5–5k / month', careersUrl: 'https://careers.imc.com/' },
  { id: 'imc-grad-chi', firm: 'IMC Trading', type: 'Graduate', role: 'Trading', location: 'Chicago', window: 'Aug–Nov', closes: 'Rolling (early)', comp: '≈$250–400k', careersUrl: 'https://careers.imc.com/' },

  // ---- Jump Trading ----
  { id: 'jump-intern', firm: 'Jump Trading', type: 'Internship', role: 'Research', location: 'London', window: 'Aug–Oct', closes: 'Rolling (early)', comp: '≈£8–12k / month', careersUrl: 'https://www.jumptrading.com/careers/' },
  { id: 'jump-grad-chi', firm: 'Jump Trading', type: 'Graduate', role: 'Research', location: 'Chicago', window: 'Aug–Oct', closes: 'Rolling (early)', comp: '≈$250–450k', careersUrl: 'https://www.jumptrading.com/careers/' },
  { id: 'jump-sg', firm: 'Jump Trading', type: 'Graduate', role: 'Research', location: 'Singapore', window: 'Aug–Oct', closes: 'Rolling (early)', comp: '≈US$180k+ equiv', careersUrl: 'https://www.jumptrading.com/careers/' },

  // ---- Hudson River Trading ----
  { id: 'hrt-intern', firm: 'Hudson River Trading', type: 'Internship', role: 'Research', location: 'London', window: 'Aug–Oct', closes: 'Rolling (early)', comp: '≈£9–13k / month', careersUrl: 'https://www.hudsonrivertrading.com/careers/' },
  { id: 'hrt-grad-ny', firm: 'Hudson River Trading', type: 'Graduate', role: 'Development', location: 'New York', window: 'Aug–Oct', closes: 'Rolling (early)', comp: '≈$300–450k', careersUrl: 'https://www.hudsonrivertrading.com/careers/' },
  { id: 'hrt-sg', firm: 'Hudson River Trading', type: 'Graduate', role: 'Research', location: 'Singapore', window: 'Aug–Oct', closes: 'Rolling (early)', comp: '≈US$180k+ equiv', careersUrl: 'https://www.hudsonrivertrading.com/careers/' },

  // ---- DRW ----
  { id: 'drw-grad', firm: 'DRW', type: 'Graduate', role: 'Trading', location: 'London', window: 'Sep–Nov', closes: '~Nov', comp: '≈£100–160k', careersUrl: 'https://www.drw.com/work-at-drw' },
  { id: 'drw-grad-chi', firm: 'DRW', type: 'Graduate', role: 'Trading', location: 'Chicago', window: 'Aug–Nov', closes: '~Nov', comp: '≈$250–450k', careersUrl: 'https://www.drw.com/work-at-drw' },

  // ---- Two Sigma ----
  { id: 'twosigma-intern', firm: 'Two Sigma', type: 'Internship', role: 'Research', location: 'London', window: 'Aug–Oct', closes: 'Rolling (early)', comp: '≈£9–13k / month', careersUrl: 'https://careers.twosigma.com/' },
  { id: 'twosigma-grad-ny', firm: 'Two Sigma', type: 'Graduate', role: 'Research', location: 'New York', window: 'Aug–Oct', closes: 'Rolling (early)', comp: '≈$250–450k', careersUrl: 'https://careers.twosigma.com/' },

  // ---- D. E. Shaw ----
  { id: 'deshaw-intern', firm: 'D. E. Shaw', type: 'Internship', role: 'Research', location: 'London', window: 'Aug–Oct', closes: 'Rolling (early)', comp: '≈£10–14k / month', careersUrl: 'https://www.deshaw.com/careers' },
  { id: 'deshaw-grad-ny', firm: 'D. E. Shaw', type: 'Graduate', role: 'Research', location: 'New York', window: 'Aug–Oct', closes: 'Rolling (early)', comp: '≈$300–500k', careersUrl: 'https://www.deshaw.com/careers' },

  // ---- XTX Markets ----
  { id: 'xtx-grad', firm: 'XTX Markets', type: 'Graduate', role: 'Research', location: 'London', window: 'Sep–Jan', closes: '~Jan (rolling)', comp: '≈£150–250k', careersUrl: 'https://www.xtxmarkets.com/careers/' },
  { id: 'xtx-paris', firm: 'XTX Markets', type: 'Graduate', role: 'Research', location: 'Paris', window: 'Sep–Jan', closes: '~Jan (rolling)', comp: '≈€120–180k', careersUrl: 'https://www.xtxmarkets.com/careers/' },
  { id: 'xtx-swe', firm: 'XTX Markets', type: 'Graduate', role: 'Development', location: 'London', window: 'Sep–Jan', closes: '~Jan (rolling)', comp: '≈£130–200k', careersUrl: 'https://www.xtxmarkets.com/careers/' },

  // ---- G-Research ----
  { id: 'gresearch-grad', firm: 'G-Research', type: 'Graduate', role: 'Research', location: 'London', window: 'Year-round', closes: 'Year-round', comp: '≈£150–250k', careersUrl: 'https://www.gresearch.com/vacancies/' },
  { id: 'gresearch-swe', firm: 'G-Research', type: 'Graduate', role: 'Development', location: 'London', window: 'Year-round', closes: 'Year-round', comp: '≈£120–180k', careersUrl: 'https://www.gresearch.com/vacancies/' },

  // ---- Qube Research & Technologies ----
  { id: 'qube-grad', firm: 'Qube Research & Technologies', type: 'Graduate', role: 'Research', location: 'London', window: 'Sep–Dec', closes: '~Dec', comp: '≈£110–170k', careersUrl: 'https://www.qube-rt.com/careers' },
  { id: 'qube-hk', firm: 'Qube Research & Technologies', type: 'Graduate', role: 'Research', location: 'Hong Kong', window: 'Sep–Dec', closes: '~Dec', comp: '≈US$160k+ equiv', careersUrl: 'https://www.qube-rt.com/careers' },

  // ---- Flow Traders ----
  { id: 'flow-grad', firm: 'Flow Traders', type: 'Graduate', role: 'Trading', location: 'Amsterdam', window: 'Year-round', closes: 'Year-round', comp: '≈€80–120k', careersUrl: 'https://www.flowtraders.com/careers' },
  { id: 'flow-ny', firm: 'Flow Traders', type: 'Graduate', role: 'Trading', location: 'New York', window: 'Year-round', closes: 'Year-round', comp: '≈$200–350k', careersUrl: 'https://www.flowtraders.com/careers' },

  // ---- Da Vinci ----
  { id: 'davinci-grad', firm: 'Da Vinci', type: 'Graduate', role: 'Trading', location: 'Amsterdam', window: 'Year-round', closes: 'Year-round', comp: '≈€80–120k', careersUrl: 'https://www.davincitrading.com/jobs/' },

  // ---- Five Rings ----
  { id: 'fiverings-intern', firm: 'Five Rings', type: 'Internship', role: 'Trading', location: 'New York', window: 'Aug–Oct', closes: 'Rolling (early)', comp: '≈$15–25k / month', careersUrl: 'https://fiverings.com/careers/' },

  // ---- Squarepoint Capital ----
  { id: 'squarepoint-grad', firm: 'Squarepoint Capital', type: 'Graduate', role: 'Development', location: 'London', window: 'Sep–Dec', closes: '~Dec', comp: '≈£100–160k', careersUrl: 'https://www.squarepoint-capital.com/careers' },
  { id: 'squarepoint-hk', firm: 'Squarepoint Capital', type: 'Graduate', role: 'Research', location: 'Hong Kong', window: 'Sep–Dec', closes: '~Dec', comp: '≈US$150k+ equiv', careersUrl: 'https://www.squarepoint-capital.com/careers' },

  // ---- Maven Securities ----
  { id: 'maven-grad', firm: 'Maven Securities', type: 'Graduate', role: 'Trading', location: 'London', window: 'Sep–Dec', closes: '~Nov', comp: '≈£90–140k', careersUrl: 'https://www.mavensecurities.com/careers/' },
  { id: 'maven-hk', firm: 'Maven Securities', type: 'Graduate', role: 'Trading', location: 'Hong Kong', window: 'Sep–Dec', closes: '~Nov', comp: '≈US$140k+ equiv', careersUrl: 'https://www.mavensecurities.com/careers/' },

  // ---- Mako Trading ----
  { id: 'mako-grad', firm: 'Mako Trading', type: 'Graduate', role: 'Trading', location: 'London', window: 'Sep–Nov', closes: '~Nov', comp: '≈£80–130k', careersUrl: 'https://www.mako.com/careers' },

  // ---- Tower Research Capital ----
  { id: 'tower-intern', firm: 'Tower Research Capital', type: 'Internship', role: 'Research', location: 'London', window: 'Sep–Nov', closes: 'Rolling (early)', comp: '≈£8–12k / month', careersUrl: 'https://tower-research.com/open-positions/' },
  { id: 'tower-ny', firm: 'Tower Research Capital', type: 'Graduate', role: 'Development', location: 'New York', window: 'Aug–Nov', closes: 'Rolling (early)', comp: '≈$200–350k', careersUrl: 'https://tower-research.com/open-positions/' },

  // ---- Banks ----
  { id: 'jpm-spring', firm: 'J.P. Morgan', type: 'Spring Week', role: 'Multiple', location: 'London', window: 'Sep–Nov', closes: 'Fixed (~Jan)', comp: 'Paid ≈£400–500 / week', careersUrl: 'https://careers.jpmorgan.com/uk/en/students' },
  { id: 'jpm-intern', firm: 'J.P. Morgan (Quant Research)', type: 'Internship', role: 'Research', location: 'London', window: 'Aug–Nov', closes: 'Fixed (~Nov–Jan)', comp: '≈£4–5k / month', careersUrl: 'https://careers.jpmorgan.com/uk/en/students' },
  { id: 'jpm-ny', firm: 'J.P. Morgan (Quant Research)', type: 'Internship', role: 'Research', location: 'New York', window: 'Aug–Oct', closes: 'Fixed (~Nov)', comp: '≈$10–12k / month', careersUrl: 'https://careers.jpmorgan.com/uk/en/students' },
  { id: 'gs-intern', firm: 'Goldman Sachs (Strats)', type: 'Internship', role: 'Multiple', location: 'London', window: 'Aug–Oct', closes: 'Fixed (~Nov)', comp: '≈£4.5–5.5k / month', careersUrl: 'https://www.goldmansachs.com/careers/students/' },
  { id: 'gs-ny', firm: 'Goldman Sachs (Strats)', type: 'Internship', role: 'Multiple', location: 'New York', window: 'Jul–Sep', closes: 'Fixed (~Oct)', comp: '≈$10–12k / month', careersUrl: 'https://www.goldmansachs.com/careers/students/' },
  { id: 'ms-intern', firm: 'Morgan Stanley (Quant Finance)', type: 'Internship', role: 'Research', location: 'London', window: 'Aug–Nov', closes: 'Fixed (~Nov–Jan)', comp: '≈£4–5k / month', careersUrl: 'https://www.morganstanley.com/careers/students-graduates' },
  { id: 'ms-glasgow', firm: 'Morgan Stanley (Quant Finance)', type: 'Internship', role: 'Development', location: 'Glasgow', window: 'Aug–Nov', closes: 'Fixed (~Nov–Jan)', comp: '≈£3–4k / month', careersUrl: 'https://www.morganstanley.com/careers/students-graduates' },
];
