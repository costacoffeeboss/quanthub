import { useEffect, useRef, useState } from 'react';
import { allQuestions, CATEGORIES, type Category, type Question } from '../data/questionBank';
import { usePersistentState } from '../lib/storage';
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

type Phase = 'config' | 'running' | 'grading' | 'report';
type Backend = 'self' | 'webllm' | 'api';

interface Result {
  q: Question;
  answer: string;
  grade?: Grade;
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
  'font-mono text-sm px-4 py-2 rounded border border-violet/60 text-violet-light hover:bg-violet/15 transition-colors';
const inputCls = 'bg-bg border border-steel rounded px-3 py-2 font-mono text-sm';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function Mock() {
  const [phase, setPhase] = useState<Phase>('config');

  // config
  const [count, setCount] = useState(5);
  const [cat, setCat] = useState<Category | 'Mixed'>('Mixed');
  const [minutes, setMinutes] = useState(15);
  const [settings, setSettings] = usePersistentState<GradingSettings>('qh:grading-settings', defaultSettings);

  // run
  const [results, setResults] = useState<Result[]>([]);
  const [idx, setIdx] = useState(0);
  const [answer, setAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const taRef = useRef<HTMLTextAreaElement>(null);

  // grading
  const [gradeProgress, setGradeProgress] = useState(0);
  const [loadStatus, setLoadStatus] = useState('');
  const [gradeError, setGradeError] = useState('');
  const [selfMode, setSelfMode] = useState(false);

  const [bestScore, setBestScore] = usePersistentState<number | null>('qh:hiscore:mock', null);

  const [caps, setCaps] = useState<GpuCaps>({ available: false, f16: false });
  const set = (patch: Partial<GradingSettings>) => setSettings((s) => ({ ...s, ...patch }));

  // models this GPU can actually run (f16 models need the shader-f16 feature)
  const availableModels = WEBLLM_MODELS.filter((m) => caps.f16 || !m.f16);

  // detect WebGPU capabilities once; keep the selected model to one that will run
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

  // total timer
  useEffect(() => {
    if (phase !== 'running') return;
    const t = window.setInterval(() => {
      setTimeLeft((s) => {
        if (s <= 1) {
          window.clearInterval(t);
          finishRun();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => window.clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  function start() {
    const pool = cat === 'Mixed' ? allQuestions : allQuestions.filter((q) => q.category === cat);
    const picked = shuffle(pool).slice(0, Math.min(count, pool.length));
    setResults(picked.map((q) => ({ q, answer: '' })));
    setIdx(0);
    setAnswer('');
    setTimeLeft(minutes * 60);
    setGradeError('');
    setPhase('running');
    setTimeout(() => taRef.current?.focus(), 0);
  }

  function go(to: number) {
    setResults((rs) => rs.map((r, i) => (i === idx ? { ...r, answer } : r)));
    setIdx(to);
    setAnswer(results[to]?.answer ?? '');
    setTimeout(() => taRef.current?.focus(), 0);
  }

  function finishRun() {
    setResults((rs) => {
      const updated = rs.map((r, i) => (i === idx ? { ...r, answer } : r));
      void runGrading(updated);
      return updated;
    });
  }

  async function runGrading(toGrade: Result[]) {
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
      let grade: (inp: Result) => Promise<Grade>;
      if (settings.backend === 'webllm') {
        setLoadStatus('Preparing model… the first run downloads weights (cached afterwards).');
        const engine = await loadEngine(settings.webllmModel, (p) =>
          setLoadStatus(p.text || `Loading model… ${Math.round(p.progress * 100)}%`),
        );
        setLoadStatus('');
        grade = (r) =>
          gradeWithEngine(engine, {
            question: r.q.prompt,
            referenceAnswer: r.q.answer,
            referenceSolution: r.q.solution.join('\n\n'),
            candidateAnswer: r.answer,
          });
      } else {
        grade = (r) =>
          gradeWithApi(
            { provider: settings.apiProvider, baseUrl: settings.apiBaseUrl, model: settings.apiModel, key: settings.apiKey },
            {
              question: r.q.prompt,
              referenceAnswer: r.q.answer,
              referenceSolution: r.q.solution.join('\n\n'),
              candidateAnswer: r.answer,
            },
          );
      }

      const graded: Result[] = [];
      for (let i = 0; i < toGrade.length; i++) {
        const g = await grade(toGrade[i]);
        graded.push({ ...toGrade[i], grade: g });
        setGradeProgress(i + 1);
      }
      setResults(graded);
      const total = graded.reduce((a, r) => a + (r.grade?.score ?? 0), 0);
      const pct = Math.round((total / (graded.length * 5)) * 100);
      setBestScore((b) => (b === null || pct > b ? pct : b));
      setPhase('report');
    } catch (e) {
      const raw = e instanceof Error ? e.message : 'Grading failed.';
      const msg =
        settings.backend === 'webllm' && isShaderError(raw)
          ? `Your GPU couldn't compile this model (${raw}). Try a "compatible" (f32) model in the list, a smaller one, or a key/self-grade.`
          : raw;
      setGradeError(msg);
      setSelfMode(true);
      setResults(toGrade);
      setPhase('report');
    }
  }

  function setSelfScore(id: string, score: number) {
    setResults((rs) => rs.map((r) => (r.q.id === id ? { ...r, grade: { score, verdict: 'Self-assessed', feedback: '' } } : r)));
  }

  const mm = Math.floor(timeLeft / 60);
  const ss = String(timeLeft % 60).padStart(2, '0');

  // ---------- config ----------
  if (phase === 'config') {
    const webllmDisabled = !caps.available;
    return (
      <div className="space-y-6 max-w-2xl">
        <header>
          <h1 className="text-2xl font-bold">Mock Interview</h1>
          <p className="mt-2 text-muted text-sm">
            A timed gauntlet of brainteasers. Type your reasoning as you would speak it, then get
            graded. Choose how: a free model that runs in your browser, your own API key, or
            self-grade against the worked solutions.
          </p>
          {bestScore !== null && <p className="mt-1 font-mono text-xs text-muted">Best graded score: {bestScore}%</p>}
        </header>

        <section className="rounded-lg border border-steel bg-panel p-5 space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="block">
              <span className="font-mono text-xs text-muted">Questions</span>
              <select className={`${inputCls} mt-1 w-full`} value={count} onChange={(e) => setCount(Number(e.target.value))}>
                {[3, 5, 8, 10].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="font-mono text-xs text-muted">Category</span>
              <select className={`${inputCls} mt-1 w-full`} value={cat} onChange={(e) => setCat(e.target.value as Category | 'Mixed')}>
                <option>Mixed</option>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="font-mono text-xs text-muted">Time (minutes)</span>
              <select className={`${inputCls} mt-1 w-full`} value={minutes} onChange={(e) => setMinutes(Number(e.target.value))}>
                {[5, 10, 15, 20, 30].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </label>
          </div>
          <button type="button" className={btnCls} onClick={start}>Begin interview →</button>
        </section>

        <section className="rounded-lg border border-steel bg-panel p-5 space-y-4">
          <h2 className="font-mono text-xs uppercase tracking-wider text-muted">How to grade</h2>

          <div className="space-y-2">
            {/* WebLLM */}
            <label className={`flex gap-3 items-start cursor-pointer rounded border p-3 ${settings.backend === 'webllm' ? 'border-violet bg-violet/5' : 'border-steel'} ${webllmDisabled ? 'opacity-60' : ''}`}>
              <input type="radio" name="backend" className="mt-1 accent-[#6d4aff]" disabled={webllmDisabled} checked={settings.backend === 'webllm'} onChange={() => set({ backend: 'webllm' })} />
              <span className="text-sm">
                <span className="font-semibold">Free — in-browser model</span> <span className="font-mono text-[11px] text-open">no key</span>
                <span className="block text-muted text-xs mt-0.5">
                  Runs an open model on your device via WebGPU. First run downloads weights (~1–2 GB, then cached). No key, no server, fully private.
                  {webllmDisabled && <span className="text-soon"> Your browser lacks WebGPU — use Chrome/Edge on desktop, or pick another option. Self-grade is used as fallback.</span>}
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
                {!caps.f16 && (
                  <p className="font-mono text-[10px] text-soon">
                    Your GPU doesn&apos;t support half-precision (f16) shaders, so only full-precision (f32) models are shown — they&apos;re a bit larger but run reliably here.
                  </p>
                )}
              </div>
            )}

            {/* API key */}
            <label className={`flex gap-3 items-start cursor-pointer rounded border p-3 ${settings.backend === 'api' ? 'border-violet bg-violet/5' : 'border-steel'}`}>
              <input type="radio" name="backend" className="mt-1 accent-[#6d4aff]" checked={settings.backend === 'api'} onChange={() => set({ backend: 'api' })} />
              <span className="text-sm">
                <span className="font-semibold">Your own API key</span> <span className="font-mono text-[11px] text-violet-light">best quality</span>
                <span className="block text-muted text-xs mt-0.5">
                  Anthropic, or any OpenAI-compatible provider (OpenRouter has free models, Groq, OpenAI, local Ollama). Key is stored only in this browser and sent directly to the provider.
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
                  <span className="font-mono text-[11px] text-muted">API key {settings.apiBaseUrl.includes('localhost') && settings.apiProvider === 'openai' ? '(optional for local)' : ''}</span>
                  <input type="password" className={`${inputCls} mt-1 w-full`} placeholder="sk-…" value={settings.apiKey} onChange={(e) => set({ apiKey: e.target.value })} />
                </label>
                <p className="font-mono text-[10px] text-muted">
                  Note: some providers block direct browser calls (CORS). OpenRouter, Groq, Anthropic, and local Ollama work; OpenAI may not.
                </p>
              </div>
            )}

            {/* Self */}
            <label className={`flex gap-3 items-start cursor-pointer rounded border p-3 ${settings.backend === 'self' ? 'border-violet bg-violet/5' : 'border-steel'}`}>
              <input type="radio" name="backend" className="mt-1 accent-[#6d4aff]" checked={settings.backend === 'self'} onChange={() => set({ backend: 'self' })} />
              <span className="text-sm">
                <span className="font-semibold">Self-grade</span> <span className="font-mono text-[11px] text-muted">instant, any device</span>
                <span className="block text-muted text-xs mt-0.5">No model. You score each answer 0–5 against the worked solution. Always available.</span>
              </span>
            </label>
          </div>
        </section>
      </div>
    );
  }

  // ---------- running ----------
  if (phase === 'running') {
    const r = results[idx];
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between font-mono text-xs">
          <span className="text-muted">Question {idx + 1} / {results.length}</span>
          <span className={timeLeft <= 30 ? 'text-closed' : 'text-soon'} aria-live="polite">{mm}:{ss}</span>
        </div>
        <article className="rounded-lg border border-steel bg-panel p-5 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[11px] text-muted border border-steel rounded px-2 py-0.5">{r.q.category}</span>
            <span className="font-mono text-[11px] text-muted border border-steel rounded px-2 py-0.5">{r.q.difficulty}</span>
            {r.q.firms && r.q.firms.length > 0 && <span className="font-mono text-[10px] text-violet-light">{r.q.firms.join(', ')}</span>}
          </div>
          <p className="text-sm leading-relaxed">{r.q.prompt}</p>
          <textarea
            ref={taRef}
            className={`${inputCls} w-full min-h-[160px] leading-relaxed`}
            placeholder="Talk through your reasoning — method, steps, and final answer…"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
          />
        </article>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className={btn2Cls} disabled={idx === 0} onClick={() => go(idx - 1)}>← Previous</button>
          {idx < results.length - 1 ? (
            <button type="button" className={btnCls} onClick={() => go(idx + 1)}>Next →</button>
          ) : (
            <button type="button" className={btnCls} onClick={finishRun}>Finish &amp; grade</button>
          )}
          <span className="ml-auto font-mono text-[11px] text-muted">
            {results.filter((x, i) => (i === idx ? answer.trim() : x.answer.trim())).length}/{results.length} answered
          </span>
        </div>
      </div>
    );
  }

  // ---------- grading ----------
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
                Grading answer {gradeProgress} / {results.length}
                {settings.backend === 'webllm' ? ' on your device' : ` with ${settings.apiModel}`}…
              </p>
              <div className="h-1.5 rounded-full bg-steel overflow-hidden">
                <div className="h-full bg-violet rounded-full transition-all" style={{ width: `${(gradeProgress / results.length) * 100}%` }} />
              </div>
            </>
          )}
          {settings.backend === 'webllm' && (
            <p className="font-mono text-[10px] text-muted">In-browser models are slower than cloud APIs — a few seconds per answer is normal.</p>
          )}
        </div>
      </div>
    );
  }

  // ---------- report ----------
  const allScored = results.every((r) => r.grade);
  const total = results.reduce((a, r) => a + (r.grade?.score ?? 0), 0);
  const pct = allScored ? Math.round((total / (results.length * 5)) * 100) : null;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Interview Report</h1>
        {gradeError && (
          <p className="mt-2 font-mono text-xs text-closed">Automated grading failed ({gradeError}) — falling back to self-grading below.</p>
        )}
        {selfMode ? (
          <p className="mt-2 text-sm text-muted">Self-grade each answer against the model solution (0–5), then read your total.</p>
        ) : (
          <p className="mt-2 font-mono text-sm">
            Score: <span className={pct! >= 70 ? 'text-open' : pct! >= 45 ? 'text-soon' : 'text-closed'}>{total}/{results.length * 5} ({pct}%)</span>
            {pct !== null && bestScore !== null && pct >= bestScore && <span className="text-soon"> ★ best</span>}
          </p>
        )}
      </header>

      <div className="space-y-4">
        {results.map((r) => (
          <article key={r.q.id} className="rounded-lg border border-steel bg-panel p-5 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold mr-auto">{r.q.title}</h3>
              <span className="font-mono text-[11px] text-muted border border-steel rounded px-2 py-0.5">{r.q.category}</span>
              {r.grade && !selfMode && (
                <span className={`font-mono text-xs ${r.grade.score >= 4 ? 'text-open' : r.grade.score >= 2 ? 'text-soon' : 'text-closed'}`}>
                  {r.grade.score}/5 · {r.grade.verdict}
                </span>
              )}
            </div>
            <p className="text-sm leading-relaxed">{r.q.prompt}</p>
            <div className="rounded border border-steel bg-bg p-3">
              <p className="font-mono text-[11px] text-muted mb-1">Your answer</p>
              <p className="text-sm whitespace-pre-wrap">{r.answer.trim() || '(left blank)'}</p>
            </div>
            {r.grade && !selfMode && r.grade.feedback && (
              <div className="rounded border border-violet/40 bg-violet/10 p-3">
                <p className="font-mono text-[11px] text-violet-light mb-1">Interviewer feedback</p>
                <p className="text-sm leading-relaxed">{r.grade.feedback}</p>
              </div>
            )}
            <details className="text-sm">
              <summary className="cursor-pointer font-mono text-xs text-violet-light hover:underline">Reference: {r.q.answer}</summary>
              <div className="mt-2 space-y-2 leading-relaxed border-t border-steel pt-2">
                {r.q.solution.map((p, i) => <p key={i}>{p}</p>)}
              </div>
            </details>
            {selfMode && (
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] text-muted">Self-grade:</span>
                {[0, 1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSelfScore(r.q.id, s)}
                    className={`font-mono text-xs w-7 h-7 rounded border ${r.grade?.score === s ? 'border-violet bg-violet text-white' : 'border-steel text-muted hover:border-violet-light'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </article>
        ))}
      </div>

      {selfMode && allScored && (
        <p className="font-mono text-sm">
          Self-graded total: <span className="text-violet-light">{total}/{results.length * 5} ({Math.round((total / (results.length * 5)) * 100)}%)</span>
        </p>
      )}

      <button type="button" className={btnCls} onClick={() => setPhase('config')}>New interview</button>
    </div>
  );
}
