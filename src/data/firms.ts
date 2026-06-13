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

export const programmes: Programme[] = [
  { id: 'janestreet-intern', firm: 'Jane Street', type: 'Internship', role: 'Trading', location: 'London', window: 'Aug–Oct', careersUrl: 'https://www.janestreet.com/join-jane-street/open-roles/' },
  { id: 'janestreet-grad', firm: 'Jane Street', type: 'Graduate', role: 'Trading', location: 'London', window: 'Aug–Nov', careersUrl: 'https://www.janestreet.com/join-jane-street/open-roles/' },
  { id: 'citadel-intern', firm: 'Citadel', type: 'Internship', role: 'Research', location: 'London', window: 'Aug–Oct', careersUrl: 'https://www.citadel.com/careers/' },
  { id: 'citsec-grad', firm: 'Citadel Securities', type: 'Graduate', role: 'Trading', location: 'London', window: 'Aug–Nov', careersUrl: 'https://www.citadelsecurities.com/careers/' },
  { id: 'optiver-intern', firm: 'Optiver', type: 'Internship', role: 'Trading', location: 'Amsterdam', window: 'Sep–Nov', careersUrl: 'https://optiver.com/working-at-optiver/career-opportunities/' },
  { id: 'optiver-grad', firm: 'Optiver', type: 'Graduate', role: 'Trading', location: 'Amsterdam', window: 'Sep–Dec', careersUrl: 'https://optiver.com/working-at-optiver/career-opportunities/' },
  { id: 'sig-grad', firm: 'SIG (Susquehanna)', type: 'Graduate', role: 'Trading', location: 'Dublin', window: 'Sep–Dec', careersUrl: 'https://careers.sig.com/' },
  { id: 'imc-intern', firm: 'IMC Trading', type: 'Internship', role: 'Trading', location: 'Amsterdam', window: 'Sep–Nov', careersUrl: 'https://careers.imc.com/' },
  { id: 'jump-intern', firm: 'Jump Trading', type: 'Internship', role: 'Research', location: 'London', window: 'Aug–Oct', careersUrl: 'https://www.jumptrading.com/careers/' },
  { id: 'hrt-intern', firm: 'Hudson River Trading', type: 'Internship', role: 'Research', location: 'London', window: 'Aug–Oct', careersUrl: 'https://www.hudsonrivertrading.com/careers/' },
  { id: 'drw-grad', firm: 'DRW', type: 'Graduate', role: 'Trading', location: 'London', window: 'Sep–Nov', careersUrl: 'https://www.drw.com/work-at-drw' },
  { id: 'twosigma-intern', firm: 'Two Sigma', type: 'Internship', role: 'Research', location: 'London', window: 'Aug–Oct', careersUrl: 'https://careers.twosigma.com/' },
  { id: 'deshaw-intern', firm: 'D. E. Shaw', type: 'Internship', role: 'Research', location: 'London', window: 'Aug–Oct', careersUrl: 'https://www.deshaw.com/careers' },
  { id: 'xtx-grad', firm: 'XTX Markets', type: 'Graduate', role: 'Research', location: 'London', window: 'Sep–Jan', careersUrl: 'https://www.xtxmarkets.com/careers/' },
  { id: 'gresearch-grad', firm: 'G-Research', type: 'Graduate', role: 'Research', location: 'London', window: 'Year-round', careersUrl: 'https://www.gresearch.com/vacancies/' },
  { id: 'qube-grad', firm: 'Qube Research & Technologies', type: 'Graduate', role: 'Research', location: 'London', window: 'Sep–Dec', careersUrl: 'https://www.qube-rt.com/careers' },
  { id: 'flow-grad', firm: 'Flow Traders', type: 'Graduate', role: 'Trading', location: 'Amsterdam', window: 'Year-round', careersUrl: 'https://www.flowtraders.com/careers' },
  { id: 'davinci-grad', firm: 'Da Vinci', type: 'Graduate', role: 'Trading', location: 'Amsterdam', window: 'Year-round', careersUrl: 'https://www.davincitrading.com/jobs/' },
  { id: 'fiverings-intern', firm: 'Five Rings', type: 'Internship', role: 'Trading', location: 'New York', window: 'Aug–Oct', careersUrl: 'https://fiverings.com/careers/' },
  { id: 'squarepoint-grad', firm: 'Squarepoint Capital', type: 'Graduate', role: 'Development', location: 'London', window: 'Sep–Dec', careersUrl: 'https://www.squarepoint-capital.com/careers' },
  { id: 'maven-grad', firm: 'Maven Securities', type: 'Graduate', role: 'Trading', location: 'London', window: 'Sep–Dec', careersUrl: 'https://www.mavensecurities.com/careers/' },
  { id: 'mako-grad', firm: 'Mako Trading', type: 'Graduate', role: 'Trading', location: 'London', window: 'Sep–Nov', careersUrl: 'https://www.mako.com/careers' },
  { id: 'tower-intern', firm: 'Tower Research Capital', type: 'Internship', role: 'Research', location: 'London', window: 'Sep–Nov', careersUrl: 'https://tower-research.com/open-positions/' },
  { id: 'jpm-spring', firm: 'J.P. Morgan', type: 'Spring Week', role: 'Multiple', location: 'London', window: 'Sep–Nov', careersUrl: 'https://careers.jpmorgan.com/uk/en/students' },
  { id: 'jpm-intern', firm: 'J.P. Morgan (Quant Research)', type: 'Internship', role: 'Research', location: 'London', window: 'Aug–Nov', careersUrl: 'https://careers.jpmorgan.com/uk/en/students' },
  { id: 'gs-intern', firm: 'Goldman Sachs (Strats)', type: 'Internship', role: 'Multiple', location: 'London', window: 'Aug–Oct', careersUrl: 'https://www.goldmansachs.com/careers/students/' },
  { id: 'ms-intern', firm: 'Morgan Stanley (Quant Finance)', type: 'Internship', role: 'Research', location: 'London', window: 'Aug–Nov', careersUrl: 'https://www.morganstanley.com/careers/students-graduates' },
];
