/**
 * "Which quant role suits you?" quiz — the Roles-page sibling of the Firms quiz.
 *
 * The 15 questions map onto the five role archetypes in roles.ts. Scoring is
 * deliberately simple: each answer points at one role, so a result is just
 * "which lane did your answers keep pulling towards". It's a self-reflection
 * aid, not careers advice.
 */
import { roles } from './roles';

export type RoleKey = 'trader' | 'researcher' | 'developer' | 'risk' | 'analyst';

interface RoleQuizOption {
  label: string;
  /** Points added to each role. */
  roles: Partial<Record<RoleKey, number>>;
}

export interface RoleQuizQuestion {
  id: string;
  prompt: string;
  options: RoleQuizOption[];
}

const T: RoleKey = 'trader';
const RS: RoleKey = 'researcher';
const D: RoleKey = 'developer';
const RK: RoleKey = 'risk';
const A: RoleKey = 'analyst';

export const roleQuizQuestions: RoleQuizQuestion[] = [
  {
    id: 'r1',
    prompt: 'Pick the screen you could happily stare at for ten hours straight.',
    options: [
      { label: 'A live order book — quotes, size, and your gut.', roles: { [T]: 2 } },
      { label: 'A research notebook, fighting overfitting.', roles: { [RS]: 2 } },
      { label: 'A profiler and a stack trace.', roles: { [D]: 2 } },
      { label: 'A VaR dashboard and a stress-test report.', roles: { [RK]: 2 } },
      { label: 'A pricing model a trader needs fixed by lunch.', roles: { [A]: 2 } },
    ],
  },
  {
    id: 'r2',
    prompt: '80 mental-arithmetic questions. 8 minutes. No calculator. Reaction?',
    options: [
      { label: 'Let\'s go — speed is my edge.', roles: { [T]: 2 } },
      { label: 'Fine, but I\'d rather test a hypothesis properly.', roles: { [RS]: 2 } },
      { label: 'I\'d rather solve a hard algorithm.', roles: { [D]: 2 } },
      { label: 'I prefer careful work over speed drills.', roles: { [RK]: 2 } },
      { label: 'Give me a stochastic-calculus question instead.', roles: { [A]: 2 } },
    ],
  },
  {
    id: 'r3',
    prompt: 'A genie grants you one problem to chew on all day. You pick:',
    options: [
      { label: '"When is the model wrong, and how do I trade it?"', roles: { [T]: 2 } },
      { label: '"Is this signal real, or am I fooling myself?"', roles: { [RS]: 2 } },
      { label: '"How do I make this 10× faster without breaking it?"', roles: { [D]: 2 } },
      { label: '"Where exactly does this blow up in the tail?"', roles: { [RK]: 2 } },
      { label: '"Why does this price look off — and how do I fix the model?"', roles: { [A]: 2 } },
    ],
  },
  {
    id: 'r4',
    prompt: 'Your relationship with being measured by P&L:',
    options: [
      { label: 'Put my number on the screen — I want the scoreboard.', roles: { [T]: 2 } },
      { label: 'Judge me on research that holds up out-of-sample.', roles: { [RS]: 2 } },
      { label: 'Judge me on systems that don\'t fall over.', roles: { [D]: 2 } },
      { label: 'I\'d rather sit independent of the desk\'s P&L.', roles: { [RK]: 2 } },
      { label: 'Close to the P&L is great; holding it isn\'t my job.', roles: { [A]: 2 } },
    ],
  },
  {
    id: 'r5',
    prompt: 'It\'s 9:31am and the market just gapped hard. You\'re…',
    options: [
      { label: 'In the thick of it, repricing fast.', roles: { [T]: 2 } },
      { label: 'Checking whether my signal predicted any of this.', roles: { [RS]: 2 } },
      { label: 'Making sure the systems and feeds all held up.', roles: { [D]: 2 } },
      { label: 'Re-running the stress scenarios.', roles: { [RK]: 2 } },
      { label: 'Fielding three trader questions at once.', roles: { [A]: 2 } },
    ],
  },
  {
    id: 'r6',
    prompt: 'Be honest about your relationship with code.',
    options: [
      { label: 'I can script, but markets are my real language.', roles: { [T]: 2 } },
      { label: 'Python and notebooks are basically how I think.', roles: { [RS]: 2 } },
      { label: 'I think in cache lines and concurrency.', roles: { [D]: 2 } },
      { label: 'I read more legacy code than I write.', roles: { [RK]: 2 } },
      { label: 'C++ pricing libraries and Python glue, daily.', roles: { [A]: 2 } },
    ],
  },
  {
    id: 'r7',
    prompt: 'Your origin story is closest to…',
    options: [
      { label: 'Competitive and fast; loves games and bets.', roles: { [T]: 2 } },
      { label: 'Master\'s/PhD-ish; lights up at a good dataset.', roles: { [RS]: 2 } },
      { label: 'CS / competitive programming.', roles: { [D]: 2 } },
      { label: 'Stats + finance; careful and precise.', roles: { [RK]: 2 } },
      { label: 'Maths/physics into financial engineering.', roles: { [A]: 2 } },
    ],
  },
  {
    id: 'r8',
    prompt: 'Which payoff structure suits you?',
    options: [
      { label: 'Brutal, immediate feedback — I want to know today.', roles: { [T]: 2 } },
      { label: 'Delayed payoffs on deep problems; most ideas die.', roles: { [RS]: 2 } },
      { label: 'Ship it, watch it run, iterate.', roles: { [D]: 2 } },
      { label: 'Steady and stable, with predictable hours.', roles: { [RK]: 2 } },
      { label: 'Constant variety — interrupted by whatever broke.', roles: { [A]: 2 } },
    ],
  },
  {
    id: 'r9',
    prompt: 'How much regulation can you stomach?',
    options: [
      { label: 'None, ideally — just me and the market.', roles: { [T]: 2 } },
      { label: 'I care about scientific rigour more than rules.', roles: { [RS]: 2 } },
      { label: 'I care about correctness and uptime.', roles: { [D]: 2 } },
      { label: 'Bring it on — Basel/FRTB is literally the job.', roles: { [RK]: 2 } },
      { label: 'Some — desk rules and model governance are fine.', roles: { [A]: 2 } },
    ],
  },
  {
    id: 'r10',
    prompt: 'Which bumper sticker would you actually put on your laptop?',
    options: [
      { label: '"It\'s all just EV and bet sizing."', roles: { [T]: 2 } },
      { label: '"Prove yourself wrong first."', roles: { [RS]: 2 } },
      { label: '"Speed is the strategy."', roles: { [D]: 2 } },
      { label: '"Respect the tail."', roles: { [RK]: 2 } },
      { label: '"See where the model meets reality."', roles: { [A]: 2 } },
    ],
  },
  {
    id: 'r11',
    prompt: 'Which interview loop sounds almost… fun?',
    options: [
      { label: 'Market-making games and EV puzzles.', roles: { [T]: 2 } },
      { label: 'Defending a research project; statistics in depth.', roles: { [RS]: 2 } },
      { label: 'Hard algorithms and a systems-design whiteboard.', roles: { [D]: 2 } },
      { label: 'Derivatives basics, tails, and a competency chat.', roles: { [RK]: 2 } },
      { label: 'Stochastic calculus and Black–Scholes reasoning.', roles: { [A]: 2 } },
    ],
  },
  {
    id: 'r12',
    prompt: 'Who do you want to sit next to?',
    options: [
      { label: 'Other traders — fast and loud.', roles: { [T]: 2 } },
      { label: 'Researchers arguing about methodology.', roles: { [RS]: 2 } },
      { label: 'Engineers who care about clean systems.', roles: { [D]: 2 } },
      { label: 'Independent risk folks who challenge the desk.', roles: { [RK]: 2 } },
      { label: 'Traders who\'ll ask you something urgent any second.', roles: { [A]: 2 } },
    ],
  },
  {
    id: 'r13',
    prompt: 'Your reaction to "most of your ideas won\'t work":',
    options: [
      { label: 'Fine — cut the losers fast and move on.', roles: { [T]: 2 } },
      { label: 'That\'s the research job; I\'m at peace with it.', roles: { [RS]: 2 } },
      { label: 'I\'d rather build things that definitely work.', roles: { [D]: 2 } },
      { label: 'I\'d rather prevent the big loss than chase wins.', roles: { [RK]: 2 } },
      { label: 'I like quick wins that help the desk right now.', roles: { [A]: 2 } },
    ],
  },
  {
    id: 'r14',
    prompt: 'Fast-forward ten years. You\'re the person who…',
    options: [
      { label: 'Runs a trading book and a tight team.', roles: { [T]: 2 } },
      { label: 'Leads research and ships models that move the needle.', roles: { [RS]: 2 } },
      { label: 'Architected the infrastructure everything runs on.', roles: { [D]: 2 } },
      { label: 'Owns the firm\'s entire risk framework.', roles: { [RK]: 2 } },
      { label: 'Is the desk\'s go-to quant who knows where everything\'s buried.', roles: { [A]: 2 } },
    ],
  },
  {
    id: 'r15',
    prompt: 'What would frustrate you most?',
    options: [
      { label: 'Slow feedback and no scoreboard.', roles: { [T]: 2 } },
      { label: 'Pressure to ship a signal I don\'t believe in.', roles: { [RS]: 2 } },
      { label: 'Flaky systems and tech debt nobody fixes.', roles: { [D]: 2 } },
      { label: 'Being ignored when I flag a real risk.', roles: { [RK]: 2 } },
      { label: 'Deep work constantly interrupted by fires.', roles: { [A]: 2 } },
    ],
  },
];

const TOTAL = roleQuizQuestions.length;

export interface RoleResult {
  slug: RoleKey;
  title: string;
  tagline: string;
  /** 0–100, relative to your best-matching role. */
  score: number;
  why: string;
}

const roleMeta = new Map(roles.map((r) => [r.slug as RoleKey, { title: r.title, tagline: r.tagline }]));

/** answers maps questionId -> selected option index. Returns the top 3 roles. */
export function scoreRoleQuiz(answers: Record<string, number>): RoleResult[] {
  const points: Record<RoleKey, number> = { trader: 0, researcher: 0, developer: 0, risk: 0, analyst: 0 };
  const leaned: Record<RoleKey, number> = { trader: 0, researcher: 0, developer: 0, risk: 0, analyst: 0 };

  for (const q of roleQuizQuestions) {
    const idx = answers[q.id];
    if (idx == null) continue;
    const opt = q.options[idx];
    if (!opt) continue;
    for (const [role, pts] of Object.entries(opt.roles)) {
      points[role as RoleKey] += pts ?? 0;
      if ((pts ?? 0) > 0) leaned[role as RoleKey] += 1;
    }
  }

  const maxPoints = Math.max(1, ...Object.values(points));

  return (Object.keys(points) as RoleKey[])
    .map((slug) => {
      const meta = roleMeta.get(slug);
      const n = leaned[slug];
      const strength =
        n >= 7 ? 'Your answers leaned here hard' : n >= 3 ? 'Several of your answers pointed here' : 'A few of your answers pointed here';
      return {
        slug,
        title: meta?.title ?? slug,
        tagline: meta?.tagline ?? '',
        score: Math.round((points[slug] / maxPoints) * 100),
        why: `${meta?.tagline ?? ''} ${strength} — ${n} of ${TOTAL} answers.`.trim(),
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

export { TOTAL as ROLE_QUIZ_TOTAL };
