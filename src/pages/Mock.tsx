import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { allQuestions, type Question } from '../data/questionBank';
import { usePersistentState } from '../lib/storage';
import { Premium } from '../lib/premium';
import HoldemMarket, { type HoldemSummary } from '../games/HoldemMarket';
import {
  gradeWithApi,
  gradeWithEngine,
  loadEngine,
  gpuCapabilities,
  recommendedModel,
  isShaderError,
  WEBLLM_MODELS,
  OPENAI_PRESETS,
  ANTHROPIC_MODELS,
  type ApiProvider,
  type GpuCaps,
  type Grade,
} from '../lib/grading';

type Phase = 'config' | 'interview' | 'grading' | 'report';
type Backend = 'self' | 'webllm' | 'api';

/** The staged follow-ups the interviewer walks the candidate through per teaser. */
const PROBES = [
  {
    key: 'initial',
    label: 'Initial thoughts',
    ask: 'First reactions — what is your gut read, and what makes this one tricky?',
    placeholder: 'Think out loud: what kind of problem is this, what jumps out, where might it trap people…',
  },
  {
    key: 'approach',
    label: 'Your approach',
    ask: 'Which approach or route will you take — and why that one over the alternatives?',
    placeholder: 'Name the method (casework, symmetry, Bayes, a recurrence, linearity of expectation…) and justify it.',
  },
  {
    key: 'work',
    label: 'Working',
    ask: 'Walk me through it, step by step.',
    placeholder: 'Show the actual steps and arithmetic…',
  },
  {
    key: 'final',
    label: 'Final answer',
    ask: 'Your final answer — and a quick sanity check on it.',
    placeholder: 'State the answer cleanly, then sanity-check the magnitude / edge cases.',
  },
] as const;

type ProbeKey = (typeof PROBES)[number]['key'];

interface Slot {
  q: Question;
  role: 'Warm-up 1' | 'Warm-up 2' | 'Final question';
  probes: Partial<Record<ProbeKey, string>>;
  grade?: Grade; // LLM grade
  selfScore?: number; // self-grade
}

interface GradingSettings {
  backend: Backend;
  webllmModel: string;
  apiProvider: ApiProvider;
  apiBaseUrl: string;
  apiModel: string;
  apiKey: string;
}

const defaultSettings: GradingSettings = {
  backend: 'self',
  webllmModel: WEBLLM_MODELS[0].id,
  apiProvider: 'anthropic',
  apiBaseUrl: OPENAI_PRESETS[0].baseUrl,
  apiModel: ANTHROPIC_MODELS[0].id,
  apiKey: '',
};

const btnCls =
  'font-mono text-sm px-5 py-2.5 rounded bg-violet text-white hover:bg-violet-light hover:text-bg transition-colors disabled:opacity-40 disabled:cursor-not-allowed';
const btn2Cls =
  'font-mono text-sm px-4 py-2 rounded border border-violet/60 text-violet-light hover:bg-violet/15 transition-colors disabled:opacity-40 disabled:cursor-not-allowed';
const inputCls = 'bg-bg border border-steel rounded px-3 py-2 font-mono text-sm';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
const clamp = (x: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, x));

/** Pick two distinct-category warm-ups (not Hard) and one harder final, avoiding the MM/mental-math banks. */
function pickSlots(): Slot[] {
  const pool = allQuestions.filter(
    (q) => q.category !== 'Market making' && q.category !== 'Mental math',
  );
  const shuffled = shuffle(pool);
  const warmups: Question[] = [];
  for (const q of shuffled) {
    if (warmups.length >= 2) break;
    if (q.difficulty === 'Hard') continue;
    if (warmups.some((w) => w.category === q.category)) continue;
    warmups.push(q);
  }
  while (warmups.length < 2) {
    const q = shuffled.find((x) => !warmups.includes(x) && x.difficulty !== 'Hard');
    if (!q) break;
    warmups.push(q);
  }
  const final =
    shuffled.find((q) => q.difficulty !== 'Easy' && !warmups.includes(q)) ??
    shuffled.find((q) => !warmups.includes(q))!;
  return [
    { q: warmups[0], role: 'Warm-up 1', probes: {} },
    { q: warmups[1], role: 'Warm-up 2', probes: {} },
    { q: final, role: 'Final question', probes: {} },
  ];
}

interface GameResult {
  pnl: number;
  rank: number;
  total: number; // settled sum
  quality: number; // 0..1, used for the market-making dimension
}

function combineProbes(slot: Slot): string {
  return PROBES.map((p) => `${p.label}: ${slot.probes[p.key]?.trim() || '(blank)'}`).join('\n\n');
}
const getScore = (s: Slot): number | undefined => s.grade?.score ?? s.selfScore;

// stageIdx 0,1 → warm-up slots; 2 → game; 3 → final slot
const slotIdxForStage = (stage: number) => (stage === 3 ? 2 : stage);

export default function Mock() {
  return (
    <Premium feature="The mock interview">
      <MockInner />
    </Premium>
  );
}

function MockInner() {
  const [phase, setPhase] = useState<Phase>('config');
  const [settings, setSettings] = usePersistentState<GradingSettings>('qh:grading-settings', defaultSettings);

  const [slots, setSlots] = useState<Slot[]>([]);
  const [game, setGame] = useState<GameResult | null>(null);
  const [stage, setStage] = useState(0); // 0..3
  const [probeStep, setProbeStep] = useState(0); // 0..3 within a teaser
  const [cur, setCur] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const taRef = useRef<HTMLTextAreaElement>(null);

  const [gradeProgress, setGradeProgress] = useState(0);
  const [loadStatus, setLoadStatus] = useState('');
  const [gradeError, setGradeError] = useState('');
  const [selfMode, setSelfMode] = useState(false);
  const [bestScore, setBestScore] = usePersistentState<number | null>('qh:hiscore:mock', null);

  const [caps, setCaps] = useState<GpuCaps>({ available: false, f16: false });
  const set = (patch: Partial<GradingSettings>) => setSettings((s) => ({ ...s, ...patch }));
  const availableModels = WEBLLM_MODELS.filter((m) => caps.f16 || !m.f16);

  useEffect(() => {
    let cancelled = false;
    gpuCapabilities().then((c) => {
      if (cancelled) return;
      setCaps(c);
      const runnable: string[] = WEBLLM_MODELS.filter((m) => c.f16 || !m.f16).map((m) => m.id);
      setSettings((s) => (runnable.includes(s.webllmModel) ? s : { ...s, webllmModel: recommendedModel(c) }));
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // count-up timer (soft — informational only)
  useEffect(() => {
    if (phase !== 'interview') return;
    const t = window.setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => window.clearInterval(t);
  }, [phase]);

  // load the active probe's saved text whenever we move within/between teasers
  useEffect(() => {
    if (phase !== 'interview' || stage === 2) return;
    const slot = slots[slotIdxForStage(stage)];
    setCur(slot?.probes[PROBES[probeStep].key] ?? '');
    setTimeout(() => taRef.current?.focus(), 0);
  }, [phase, stage, probeStep, slots]);

  function begin() {
    setSlots(pickSlots());
    setGame(null);
    setStage(0);
    setProbeStep(0);
    setCur('');
    setElapsed(0);
    setGradeError('');
    setPhase('interview');
  }

  function saveCur(): Slot[] {
    const si = slotIdxForStage(stage);
    const key = PROBES[probeStep].key;
    const next = slots.map((s, i) => (i === si ? { ...s, probes: { ...s.probes, [key]: cur } } : s));
    setSlots(next);
    return next;
  }

  function probeForward() {
    saveCur();
    if (probeStep < PROBES.length - 1) {
      setProbeStep((p) => p + 1);
    } else {
      // teaser done → advance stage
      setProbeStep(0);
      setStage((s) => s + 1);
    }
  }
  function probeBack() {
    if (probeStep === 0) return;
    saveCur();
    setProbeStep((p) => p - 1);
  }

  function onGameDone(s: HoldemSummary) {
    const rankScore = (4 - s.rank) / 3; // rank 1 → 1, rank 4 → 0
    const quality = clamp(0.7 * rankScore + (s.pnl >= 0 ? 0.3 : 0), 0, 1);
    setGame({ pnl: s.pnl, rank: s.rank, total: s.total, quality });
    setStage(3);
    setProbeStep(0);
  }

  async function runGrading(finalSlots: Slot[]) {
    if (settings.backend === 'self' || (settings.backend === 'webllm' && !caps.available)) {
      setSelfMode(true);
      setPhase('report');
      return;
    }
    setSelfMode(false);
    setPhase('grading');
    setGradeProgress(0);
    setGradeError('');
    setLoadStatus('');
    try {
      let grade: (s: Slot) => Promise<Grade>;
      if (settings.backend === 'webllm') {
        setLoadStatus('Preparing model… the first run downloads weights (cached afterwards).');
        const engine = await loadEngine(settings.webllmModel, (p) =>
          setLoadStatus(p.text || `Loading model… ${Math.round(p.progress * 100)}%`),
        );
        setLoadStatus('');
        grade = (s) =>
          gradeWithEngine(engine, {
            question: s.q.prompt,
            referenceAnswer: s.q.answer,
            referenceSolution: s.q.solution.join('\n\n'),
            candidateAnswer: combineProbes(s),
          });
      } else {
        grade = (s) =>
          gradeWithApi(
            { provider: settings.apiProvider, baseUrl: settings.apiBaseUrl, model: settings.apiModel, key: settings.apiKey },
            {
              question: s.q.prompt,
              referenceAnswer: s.q.answer,
              referenceSolution: s.q.solution.join('\n\n'),
              candidateAnswer: combineProbes(s),
            },
          );
      }
      const graded: Slot[] = [];
      for (let i = 0; i < finalSlots.length; i++) {
        const g = await grade(finalSlots[i]);
        graded.push({ ...finalSlots[i], grade: g });
        setGradeProgress(i + 1);
      }
      setSlots(graded);
      setPhase('report');
    } catch (e) {
      const raw = e instanceof Error ? e.message : 'Grading failed.';
      setGradeError(
        settings.backend === 'webllm' && isShaderError(raw)
          ? `Your GPU couldn't compile this model (${raw}). Try a "compatible" (f32) model, a smaller one, or self-grade.`
          : raw,
      );
      setSelfMode(true);
      setPhase('report');
    }
  }

  function finishInterview() {
    const finalSlots = saveCur();
    void runGrading(finalSlots);
  }

  function setSelfScore(i: number, score: number) {
    setSlots((ss) => ss.map((s, j) => (j === i ? { ...s, selfScore: score } : s)));
  }

  const mm = Math.floor(elapsed / 60);
  const ss = String(elapsed % 60).padStart(2, '0');

  // ───────────────────────── config ─────────────────────────
  if (phase === 'config') {
    const webllmDisabled = !caps.available;
    return (
      <div className="space-y-6 max-w-2xl">
        <header>
          <h1 className="text-2xl font-bold">Mock Interview</h1>
          <p className="mt-2 text-muted text-sm">
            A structured quant interview, the way the real thing runs: two warm-up brainteasers where
            the interviewer pushes you on your <em>thinking</em> — not just the answer — then a live
            market-making round, then a tougher closer. At the end you get a hire verdict, scores
            across four dimensions, and specific feedback on what to drill next.
          </p>
          {bestScore !== null && <p className="mt-1 font-mono text-xs text-muted">Best overall: {bestScore}%</p>}
        </header>

        <section className="rounded-lg border border-steel bg-panel p-5 space-y-3">
          <h2 className="font-mono text-xs uppercase tracking-wider text-muted">The format</h2>
          <ol className="space-y-2 text-sm">
            {[
              ['1', 'Warm-up brainteaser', 'Staged follow-ups: initial thoughts → approach → working → final answer.'],
              ['2', 'Warm-up brainteaser', 'A second one, different topic — same probing.'],
              ['3', 'Market-making round', 'Quote two-sided markets under fire. P&L and hit-rate count.'],
              ['4', 'Final brainteaser', 'A harder closer to finish on.'],
              ['★', 'Verdict & feedback', 'Hire tier, four dimension scores, and what to work on.'],
            ].map(([n, t, d]) => (
              <li key={t} className="flex gap-3">
                <span className="font-mono text-violet-light shrink-0 w-5">{n}</span>
                <span>
                  <span className="font-semibold">{t}.</span> <span className="text-muted">{d}</span>
                </span>
              </li>
            ))}
          </ol>
          <button type="button" className={btnCls} onClick={begin}>Begin interview →</button>
        </section>

        <section className="rounded-lg border border-steel bg-panel p-5 space-y-4">
          <h2 className="font-mono text-xs uppercase tracking-wider text-muted">How to grade your brainteasers</h2>
          <div className="space-y-2">
            <label className={`flex gap-3 items-start cursor-pointer rounded border p-3 ${settings.backend === 'webllm' ? 'border-violet bg-violet/5' : 'border-steel'} ${webllmDisabled ? 'opacity-60' : ''}`}>
              <input type="radio" name="backend" className="mt-1 accent-[#6d4aff]" disabled={webllmDisabled} checked={settings.backend === 'webllm'} onChange={() => set({ backend: 'webllm' })} />
              <span className="text-sm">
                <span className="font-semibold">Free — in-browser model</span> <span className="font-mono text-[11px] text-open">no key</span>
                <span className="block text-muted text-xs mt-0.5">
                  Runs an open model on your device via WebGPU. First run downloads weights (~1–2 GB, then cached). No key, no server, fully private.
                  {webllmDisabled && <span className="text-soon"> Your browser lacks WebGPU — self-grade is used as fallback.</span>}
                </span>
              </span>
            </label>
            {settings.backend === 'webllm' && !webllmDisabled && (
              <div className="pl-9 space-y-1">
                <label className="block">
                  <span className="font-mono text-[11px] text-muted">Model</span>
                  <select className={`${inputCls} mt-1`} value={settings.webllmModel} onChange={(e) => set({ webllmModel: e.target.value })}>
                    {availableModels.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
                  </select>
                </label>
              </div>
            )}

            <label className={`flex gap-3 items-start cursor-pointer rounded border p-3 ${settings.backend === 'api' ? 'border-violet bg-violet/5' : 'border-steel'}`}>
              <input type="radio" name="backend" className="mt-1 accent-[#6d4aff]" checked={settings.backend === 'api'} onChange={() => set({ backend: 'api' })} />
              <span className="text-sm">
                <span className="font-semibold">Your own API key</span> <span className="font-mono text-[11px] text-violet-light">best quality</span>
                <span className="block text-muted text-xs mt-0.5">
                  Anthropic, or any OpenAI-compatible provider. Key is stored only in this browser and sent directly to the provider.
                </span>
              </span>
            </label>
            {settings.backend === 'api' && (
              <div className="pl-9 space-y-3">
                <div className="flex gap-2">
                  {(['anthropic', 'openai'] as ApiProvider[]).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => set({ apiProvider: p, apiModel: p === 'anthropic' ? ANTHROPIC_MODELS[0].id : OPENAI_PRESETS[0].model, apiBaseUrl: OPENAI_PRESETS[0].baseUrl })}
                      className={`font-mono text-[11px] px-3 py-1.5 rounded border ${settings.apiProvider === p ? 'border-violet text-violet-light' : 'border-steel text-muted hover:text-fg'}`}
                    >
                      {p === 'anthropic' ? 'Anthropic' : 'OpenAI-compatible'}
                    </button>
                  ))}
                </div>
                {settings.apiProvider === 'anthropic' ? (
                  <label className="block">
                    <span className="font-mono text-[11px] text-muted">Model</span>
                    <select className={`${inputCls} mt-1 w-full`} value={settings.apiModel} onChange={(e) => set({ apiModel: e.target.value })}>
                      {ANTHROPIC_MODELS.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
                    </select>
                  </label>
                ) : (
                  <>
                    <label className="block">
                      <span className="font-mono text-[11px] text-muted">Provider preset</span>
                      <select
                        className={`${inputCls} mt-1 w-full`}
                        value={settings.apiBaseUrl}
                        onChange={(e) => {
                          const preset = OPENAI_PRESETS.find((p) => p.baseUrl === e.target.value);
                          set({ apiBaseUrl: e.target.value, apiModel: preset?.model ?? settings.apiModel });
                        }}
                      >
                        {OPENAI_PRESETS.map((p) => <option key={p.baseUrl} value={p.baseUrl}>{p.label}</option>)}
                      </select>
                    </label>
                    <label className="block">
                      <span className="font-mono text-[11px] text-muted">Base URL</span>
                      <input className={`${inputCls} mt-1 w-full`} value={settings.apiBaseUrl} onChange={(e) => set({ apiBaseUrl: e.target.value })} />
                    </label>
                    <label className="block">
                      <span className="font-mono text-[11px] text-muted">Model</span>
                      <input className={`${inputCls} mt-1 w-full`} value={settings.apiModel} onChange={(e) => set({ apiModel: e.target.value })} />
                    </label>
                  </>
                )}
                <label className="block">
                  <span className="font-mono text-[11px] text-muted">API key</span>
                  <input type="password" className={`${inputCls} mt-1 w-full`} placeholder="sk-…" value={settings.apiKey} onChange={(e) => set({ apiKey: e.target.value })} />
                </label>
              </div>
            )}

            <label className={`flex gap-3 items-start cursor-pointer rounded border p-3 ${settings.backend === 'self' ? 'border-violet bg-violet/5' : 'border-steel'}`}>
              <input type="radio" name="backend" className="mt-1 accent-[#6d4aff]" checked={settings.backend === 'self'} onChange={() => set({ backend: 'self' })} />
              <span className="text-sm">
                <span className="font-semibold">Self-grade</span> <span className="font-mono text-[11px] text-muted">instant, any device</span>
                <span className="block text-muted text-xs mt-0.5">No model. You score each brainteaser 0–5 against the worked solution; the verdict and dimensions are computed from that plus your market-making round.</span>
              </span>
            </label>
          </div>
        </section>
      </div>
    );
  }

  // ───────────────────────── interview ─────────────────────────
  if (phase === 'interview') {
    const stageLabels = ['Warm-up 1', 'Warm-up 2', 'Market making', 'Final question'];
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between font-mono text-xs">
          <div className="flex flex-wrap gap-1.5">
            {stageLabels.map((l, i) => (
              <span
                key={l}
                className={`rounded px-2 py-0.5 border ${
                  i === stage ? 'border-violet text-violet-light' : i < stage ? 'border-steel text-muted' : 'border-steel/40 text-muted/40'
                }`}
              >
                {i < stage ? '✓ ' : ''}{l}
              </span>
            ))}
          </div>
          <span className="text-muted" aria-live="off">⏱ {mm}:{ss}</span>
        </div>

        {stage === 2 ? (
          <article className="rounded-lg border border-steel bg-panel p-5 space-y-3">
            <h2 className="font-semibold">Market-making round — Hold&apos;em</h2>
            <p className="text-sm text-muted">
              Now the interviewer wants to watch you trade. Make two-sided markets against three bots
              over four streets, manage your inventory, and settle to the true sum. Play the hand out
              — when it settles, submit the round to continue.
            </p>
            <HoldemMarket embedded onComplete={onGameDone} />
          </article>
        ) : (
          (() => {
            const slot = slots[slotIdxForStage(stage)];
            return (
              <>
                <article className="rounded-lg border border-steel bg-panel p-5 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[11px] text-violet-light">{slot.role}</span>
                    <span className="font-mono text-[11px] text-muted border border-steel rounded px-2 py-0.5">{slot.q.category}</span>
                    <span className="font-mono text-[11px] text-muted border border-steel rounded px-2 py-0.5">{slot.q.difficulty}</span>
                    {slot.q.firms && slot.q.firms.length > 0 && <span className="font-mono text-[10px] text-violet-light">{slot.q.firms.join(', ')}</span>}
                  </div>
                  <p className="text-sm leading-relaxed">{slot.q.prompt}</p>
                </article>

                {/* answered probes (read-only) */}
                {PROBES.slice(0, probeStep).map((p) => (
                  <div key={p.key} className="rounded-lg border border-steel bg-bg p-4 space-y-1">
                    <p className="font-mono text-[11px] text-violet-light">{p.label}</p>
                    <p className="text-xs text-muted italic">“{p.ask}”</p>
                    <p className="text-sm whitespace-pre-wrap mt-1">{slot.probes[p.key]?.trim() || '(left blank)'}</p>
                  </div>
                ))}

                {/* active probe */}
                <div className="rounded-lg border border-violet/50 bg-violet/5 p-4 space-y-2">
                  <p className="font-mono text-[11px] uppercase tracking-wider text-violet-light">
                    Interviewer · {PROBES[probeStep].label} <span className="text-muted">({probeStep + 1}/{PROBES.length})</span>
                  </p>
                  <p className="text-sm font-medium">{PROBES[probeStep].ask}</p>
                  <textarea
                    ref={taRef}
                    className={`${inputCls} w-full min-h-[120px] leading-relaxed`}
                    placeholder={PROBES[probeStep].placeholder}
                    value={cur}
                    onChange={(e) => setCur(e.target.value)}
                  />
                  <div className="flex items-center gap-2">
                    <button type="button" className={btn2Cls} disabled={probeStep === 0} onClick={probeBack}>← Back</button>
                    {probeStep < PROBES.length - 1 ? (
                      <button type="button" className={btnCls} onClick={probeForward}>Continue →</button>
                    ) : stage < 3 ? (
                      <button type="button" className={btnCls} onClick={probeForward}>Next stage →</button>
                    ) : (
                      <button type="button" className={btnCls} onClick={finishInterview}>Finish &amp; get verdict →</button>
                    )}
                    <span className="ml-auto font-mono text-[11px] text-muted">Narrate as you would out loud</span>
                  </div>
                </div>
              </>
            );
          })()
        )}
      </div>
    );
  }

  // ───────────────────────── grading ─────────────────────────
  if (phase === 'grading') {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Grading…</h1>
        <div className="rounded-lg border border-steel bg-panel p-5 space-y-3">
          {loadStatus ? (
            <p className="font-mono text-sm text-muted">{loadStatus}</p>
          ) : (
            <>
              <p className="font-mono text-sm text-muted">
                Grading brainteaser {gradeProgress} / {slots.length}
                {settings.backend === 'webllm' ? ' on your device' : ` with ${settings.apiModel}`}…
              </p>
              <div className="h-1.5 rounded-full bg-steel overflow-hidden">
                <div className="h-full bg-violet rounded-full transition-all" style={{ width: `${(gradeProgress / slots.length) * 100}%` }} />
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // ───────────────────────── report ─────────────────────────
  return <Report
    slots={slots}
    game={game}
    selfMode={selfMode}
    gradeError={gradeError}
    setSelfScore={setSelfScore}
    onSaveBest={(pct) => setBestScore((b) => (b === null || pct > b ? pct : b))}
    bestScore={bestScore}
    onRestart={() => setPhase('config')}
  />;
}

// ───────────────────────── report component ─────────────────────────

interface Dimension { label: string; pct: number; note: string; }

function Report({
  slots,
  game,
  selfMode,
  gradeError,
  setSelfScore,
  onSaveBest,
  bestScore,
  onRestart,
}: {
  slots: Slot[];
  game: GameResult | null;
  selfMode: boolean;
  gradeError: string;
  setSelfScore: (i: number, s: number) => void;
  onSaveBest: (pct: number) => void;
  bestScore: number | null;
  onRestart: () => void;
}) {
  const scores = slots.map(getScore);
  const allScored = scores.every((s) => s != null) && game != null;

  // ---- dimensions ----
  const meanScore = scores.reduce<number>((a, s) => a + (s ?? 0), 0) / Math.max(1, slots.length);
  const problemSolving = Math.round((meanScore / 5) * 100);

  const commPer = slots.map((s) => {
    let m = 0;
    if ((s.probes.initial?.trim().length ?? 0) >= 15) m++;
    if ((s.probes.approach?.trim().length ?? 0) >= 15) m++;
    if ((s.probes.work?.trim().length ?? 0) >= 15) m++;
    if ((s.probes.final?.trim().length ?? 0) >= 1) m++;
    return m / 4;
  });
  const communication = Math.round((commPer.reduce((a, b) => a + b, 0) / Math.max(1, slots.length)) * 100);

  const gameQ = game ? game.quality : 0;
  const mmEv = Math.round(gameQ * 100);

  const finalsAnswered = slots.filter((s) => (s.probes.final?.trim().length ?? 0) > 0).length / Math.max(1, slots.length);
  const completion =
    slots.reduce((a, s) => a + PROBES.filter((p) => (s.probes[p.key]?.trim().length ?? 0) > 0).length / 4, 0) /
    Math.max(1, slots.length);
  const composure = Math.round((completion * 0.4 + finalsAnswered * 0.3 + gameQ * 0.3) * 100);

  const overall = Math.round(0.4 * problemSolving + 0.25 * communication + 0.25 * mmEv + 0.1 * composure);

  const tier =
    overall >= 80 ? { label: 'Strong hire', color: 'text-open' }
    : overall >= 65 ? { label: 'Hire', color: 'text-open' }
    : overall >= 50 ? { label: 'Lean hire', color: 'text-soon' }
    : { label: 'No hire', color: 'text-closed' };

  useEffect(() => {
    if (allScored) onSaveBest(overall);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allScored, overall]);

  const dims: Dimension[] = [
    { label: 'Problem-solving & rigour', pct: problemSolving, note: 'Correctness and soundness of method across the three brainteasers.' },
    { label: 'Communication & structure', pct: communication, note: 'How fully you narrated initial thoughts, approach and working — not just the answer.' },
    { label: 'Market-making & EV', pct: mmEv, note: `Hold'em round: ${game ? `finished rank ${game.rank}/4, P&L ${game.pnl >= 0 ? '+' : ''}${Math.round(game.pnl)}` : '—'}.` },
    { label: 'Composure & completeness', pct: composure, note: 'Did you finish every part and commit to final answers under time.' },
  ];

  // ---- what to drill ----
  const weakest = slots.reduce((lo, s) => ((getScore(s) ?? 0) < (getScore(lo) ?? 0) ? s : lo), slots[0]);
  const drills: { text: string; to: string }[] = [];
  if (problemSolving < 70 && weakest) drills.push({ text: `Drill ${weakest.q.category} in the question bank`, to: '/questions' });
  if (mmEv < 65) drills.push({ text: 'Sharpen quoting in the Market Maker & Hidden Dice games', to: '/games' });
  if (communication < 65) drills.push({ text: 'Practise narrating method-first; re-run a mock and fill every probe', to: '/mock' });
  if (drills.length === 0) drills.push({ text: 'Keep your edge — try a harder mixed set in the question bank', to: '/questions' });

  const strengths = dims.filter((d) => d.pct >= 70).map((d) => d.label);
  const improvements = dims.filter((d) => d.pct < 55).map((d) => d.label);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">Interview Verdict</h1>
        {gradeError && (
          <p className="font-mono text-xs text-closed">Automated grading failed ({gradeError}) — self-grade your brainteasers below to unlock the verdict.</p>
        )}
        {selfMode && !allScored && (
          <p className="text-sm text-muted">Self-grade each brainteaser (0–5) against its worked solution to compute your verdict.</p>
        )}
        {allScored && (
          <div className="rounded-lg border border-steel bg-panel p-5">
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <span className={`text-2xl font-bold ${tier.color}`}>{tier.label}</span>
              <span className="font-mono text-sm text-muted">overall {overall}%</span>
              {bestScore !== null && overall >= bestScore && <span className="font-mono text-xs text-soon">★ best</span>}
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {dims.map((d) => (
                <div key={d.label}>
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm font-medium">{d.label}</span>
                    <span className="font-mono text-[11px] text-muted">{d.pct}%</span>
                  </div>
                  <div className="mt-1 h-1.5 rounded bg-steel/40 overflow-hidden">
                    <div className={`h-full ${d.pct >= 70 ? 'bg-open' : d.pct >= 50 ? 'bg-soon' : 'bg-closed'}`} style={{ width: `${d.pct}%` }} />
                  </div>
                  <p className="mt-1 text-[11px] text-muted leading-snug">{d.note}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2 border-t border-steel pt-4">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-wider text-muted mb-1">Strengths</p>
                {strengths.length ? (
                  <ul className="text-sm space-y-1">{strengths.map((s) => <li key={s} className="flex gap-2"><span className="text-open">▸</span>{s}</li>)}</ul>
                ) : <p className="text-sm text-muted">No dimension cleared 70% — see what to drill.</p>}
              </div>
              <div>
                <p className="font-mono text-[11px] uppercase tracking-wider text-muted mb-1">Biggest gaps</p>
                {improvements.length ? (
                  <ul className="text-sm space-y-1">{improvements.map((s) => <li key={s} className="flex gap-2"><span className="text-closed">▸</span>{s}</li>)}</ul>
                ) : <p className="text-sm text-muted">No glaring weaknesses — solid across the board.</p>}
              </div>
            </div>

            <div className="mt-4 border-t border-steel pt-4">
              <p className="font-mono text-[11px] uppercase tracking-wider text-muted mb-2">What to drill next</p>
              <ul className="space-y-1.5 text-sm">
                {drills.map((d) => (
                  <li key={d.text} className="flex gap-2">
                    <span className="text-violet">▸</span>
                    <Link to={d.to} className="text-violet-light hover:underline">{d.text} →</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </header>

      {/* per-brainteaser breakdown */}
      <div className="space-y-4">
        {slots.map((s, i) => (
          <article key={s.q.id} className="rounded-lg border border-steel bg-panel p-5 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[11px] text-violet-light">{s.role}</span>
              <h3 className="font-semibold mr-auto">{s.q.title}</h3>
              <span className="font-mono text-[11px] text-muted border border-steel rounded px-2 py-0.5">{s.q.category}</span>
              {getScore(s) != null && (
                <span className={`font-mono text-xs ${(getScore(s) ?? 0) >= 4 ? 'text-open' : (getScore(s) ?? 0) >= 2 ? 'text-soon' : 'text-closed'}`}>
                  {getScore(s)}/5{s.grade?.verdict ? ` · ${s.grade.verdict}` : ''}
                </span>
              )}
            </div>
            <p className="text-sm leading-relaxed">{s.q.prompt}</p>

            <div className="space-y-2">
              {PROBES.map((p) => (
                <div key={p.key} className="rounded border border-steel bg-bg p-3">
                  <p className="font-mono text-[11px] text-muted">{p.label}</p>
                  <p className="text-sm whitespace-pre-wrap">{s.probes[p.key]?.trim() || '(left blank)'}</p>
                </div>
              ))}
            </div>

            {s.grade && !selfMode && s.grade.feedback && (
              <div className="rounded border border-violet/40 bg-violet/10 p-3">
                <p className="font-mono text-[11px] text-violet-light mb-1">Interviewer feedback</p>
                <p className="text-sm leading-relaxed">{s.grade.feedback}</p>
              </div>
            )}

            <details className="text-sm">
              <summary className="cursor-pointer font-mono text-xs text-violet-light hover:underline">Reference: {s.q.answer}</summary>
              <div className="mt-2 space-y-2 leading-relaxed border-t border-steel pt-2">
                {s.q.solution.map((p, j) => <p key={j}>{p}</p>)}
              </div>
            </details>

            {selfMode && (
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] text-muted">Self-grade:</span>
                {[0, 1, 2, 3, 4, 5].map((sc) => (
                  <button
                    key={sc}
                    type="button"
                    onClick={() => setSelfScore(i, sc)}
                    className={`font-mono text-xs w-7 h-7 rounded border ${s.selfScore === sc ? 'border-violet bg-violet text-white' : 'border-steel text-muted hover:border-violet-light'}`}
                  >
                    {sc}
                  </button>
                ))}
              </div>
            )}
          </article>
        ))}

        {/* market-making round summary */}
        {game && (
          <article className="rounded-lg border border-steel bg-panel p-5 space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold mr-auto">Market-making round — Hold&apos;em</h3>
              <span className={`font-mono text-xs ${mmEv >= 70 ? 'text-open' : mmEv >= 50 ? 'text-soon' : 'text-closed'}`}>{mmEv}%</span>
            </div>
            <p className="font-mono text-sm">
              Finished rank <span className="text-violet-light">{game.rank}/4</span> · settled {game.total} · P&amp;L{' '}
              <span className={game.pnl >= 0 ? 'text-open' : 'text-closed'}>{game.pnl >= 0 ? '+' : ''}{Math.round(game.pnl)}</span>
            </p>
            <p className="text-sm text-muted">
              {game.rank === 1
                ? 'Won the table — you read the conditional value better than the bots and traded the right way into settlement.'
                : game.pnl >= 0
                ? 'Green, but not the sharpest seat. Tighten your fair as the board fills in and lean on bots whose markets drift from value.'
                : 'Underwater — likely quoted the wrong side of the true sum or carried a position into a bad river. Trust your conditional EV.'}
            </p>
          </article>
        )}
      </div>

      <button type="button" className={btnCls} onClick={onRestart}>New interview</button>
    </div>
  );
}
