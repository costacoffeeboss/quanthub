/**
 * Mock-interview answer grading with three backends:
 *  - 'self'   : no model; the user grades against the worked solution (UI-side).
 *  - 'webllm' : an open model (Qwen2.5 / Llama-3.2) run entirely in the browser
 *               via WebGPU — free, no key, no server, private. First run downloads
 *               weights (cached thereafter).
 *  - 'api'    : the user's own key against Anthropic OR any OpenAI-compatible
 *               endpoint (OpenRouter, Groq, OpenAI, local Ollama, …).
 *
 * web-llm is dynamically imported so its weight never lands in the initial bundle.
 */

export interface Grade {
  score: number; // 0–5
  verdict: string;
  feedback: string;
}

export interface GradeInput {
  question: string;
  referenceAnswer: string;
  referenceSolution: string;
  candidateAnswer: string;
}

export const SYSTEM_PROMPT = `You are a senior quantitative-trading interviewer grading a candidate's spoken-style answer to a brainteaser, in the manner of a Jane Street / Optiver / Citadel interviewer.

You are given the QUESTION, the REFERENCE ANSWER, the full REFERENCE SOLUTION, and the CANDIDATE ANSWER.

Grade on a 0–5 scale:
5 = correct answer with sound, well-explained reasoning.
4 = correct answer, reasoning mostly sound but thin or a minor gap.
3 = right method but an arithmetic slip or incomplete conclusion.
2 = partial insight, significant gaps or a wrong final answer.
1 = largely incorrect, a flicker of relevant thinking.
0 = blank, irrelevant, or fundamentally wrong.

Reward correct REASONING and method even if the final number is slightly off. Penalise confidently-stated wrong reasoning. If the candidate gave only a final answer with no working, cap at 3 even if correct.

Respond with ONLY a JSON object, no prose before or after:
{"score": <integer 0-5>, "verdict": "<=10 word summary>", "feedback": "<2-4 sentences: what was right, what was missing, the single most useful improvement>"}`;

function buildUser(input: GradeInput): string {
  return `QUESTION:
${input.question}

REFERENCE ANSWER:
${input.referenceAnswer}

REFERENCE SOLUTION:
${input.referenceSolution}

CANDIDATE ANSWER:
${input.candidateAnswer || '(left blank)'}`;
}

function parseGrade(text: string): Grade {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start !== -1 && end > start) {
    try {
      const obj = JSON.parse(text.slice(start, end + 1));
      const score = Math.max(0, Math.min(5, Math.round(Number(obj.score))));
      if (!Number.isNaN(score)) {
        return {
          score,
          verdict: String(obj.verdict ?? '').slice(0, 120),
          feedback: String(obj.feedback ?? '').slice(0, 1000),
        };
      }
    } catch {
      /* fall through */
    }
  }
  // tolerant fallback for small models that don't emit clean JSON
  const m = text.match(/\b([0-5])\s*\/\s*5\b/) || text.match(/score\D*([0-5])/i);
  const score = m ? Number(m[1]) : 3;
  return { score, verdict: 'Grader output unclear', feedback: text.slice(0, 600) };
}

// ---------------- WebLLM (in-browser) ----------------

/**
 * f16 models are smaller/faster but require the WebGPU `shader-f16` feature,
 * which many GPUs/drivers lack (→ "Invalid ShaderModule" compile errors).
 * f32 models are larger but run on essentially any WebGPU device.
 */
export const WEBLLM_MODELS = [
  { id: 'Qwen2.5-3B-Instruct-q4f16_1-MLC', label: 'Qwen2.5 3B · fast (~2 GB, needs f16 GPU)', f16: true },
  { id: 'Llama-3.2-3B-Instruct-q4f16_1-MLC', label: 'Llama 3.2 3B (~1.8 GB, needs f16 GPU)', f16: true },
  { id: 'Qwen2.5-1.5B-Instruct-q4f32_1-MLC', label: 'Qwen2.5 1.5B · most compatible (~1.9 GB)', f16: false },
  { id: 'Llama-3.2-3B-Instruct-q4f32_1-MLC', label: 'Llama 3.2 3B · compatible (~2.3 GB)', f16: false },
  { id: 'Llama-3.2-1B-Instruct-q4f32_1-MLC', label: 'Llama 3.2 1B · smallest (~1.1 GB)', f16: false },
] as const;

export interface GpuCaps {
  available: boolean;
  f16: boolean;
}

export function webgpuAvailable(): boolean {
  return typeof navigator !== 'undefined' && 'gpu' in navigator;
}

/** Probe the WebGPU adapter for shader-f16 support. */
export async function gpuCapabilities(): Promise<GpuCaps> {
  if (!webgpuAvailable()) return { available: false, f16: false };
  try {
    // @ts-expect-error navigator.gpu typing varies by lib version
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) return { available: false, f16: false };
    return { available: true, f16: adapter.features.has('shader-f16') };
  } catch {
    return { available: false, f16: false };
  }
}

/** The model to default to given GPU capabilities. */
export function recommendedModel(caps: GpuCaps): string {
  if (caps.f16) return 'Qwen2.5-3B-Instruct-q4f16_1-MLC';
  return 'Qwen2.5-1.5B-Instruct-q4f32_1-MLC';
}

export function isShaderError(msg: string): boolean {
  return /shader|f16|ShaderModule|compute stage/i.test(msg);
}

interface ChatEngine {
  chat: {
    completions: {
      create(opts: {
        messages: { role: string; content: string }[];
        temperature?: number;
        max_tokens?: number;
      }): Promise<{ choices: { message: { content: string } }[] }>;
    };
  };
}

export interface LoadProgress {
  progress: number; // 0..1
  text: string;
}

const engineCache = new Map<string, ChatEngine>();

export async function loadEngine(
  modelId: string,
  onProgress: (p: LoadProgress) => void,
): Promise<ChatEngine> {
  const cached = engineCache.get(modelId);
  if (cached) return cached;
  const webllm = await import('@mlc-ai/web-llm');
  const engine = (await webllm.CreateMLCEngine(modelId, {
    initProgressCallback: (r: { progress: number; text: string }) =>
      onProgress({ progress: r.progress ?? 0, text: r.text ?? '' }),
  })) as unknown as ChatEngine;
  engineCache.set(modelId, engine);
  return engine;
}

export async function gradeWithEngine(engine: ChatEngine, input: GradeInput): Promise<Grade> {
  const res = await engine.chat.completions.create({
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: buildUser(input) },
    ],
    temperature: 0,
    max_tokens: 512,
  });
  return parseGrade(res.choices?.[0]?.message?.content ?? '');
}

// ---------------- API (bring your own key) ----------------

export type ApiProvider = 'anthropic' | 'openai';

export const OPENAI_PRESETS = [
  { label: 'OpenRouter (has free models)', baseUrl: 'https://openrouter.ai/api/v1', model: 'meta-llama/llama-3.3-70b-instruct:free' },
  { label: 'Groq', baseUrl: 'https://api.groq.com/openai/v1', model: 'llama-3.3-70b-versatile' },
  { label: 'OpenAI', baseUrl: 'https://api.openai.com/v1', model: 'gpt-4o-mini' },
  { label: 'Local (Ollama)', baseUrl: 'http://localhost:11434/v1', model: 'llama3.1' },
] as const;

export const ANTHROPIC_MODELS = [
  { id: 'claude-opus-4-8', label: 'Opus 4.8 (best)' },
  { id: 'claude-haiku-4-5', label: 'Haiku 4.5 (faster, cheaper)' },
] as const;

export interface ApiConfig {
  provider: ApiProvider;
  baseUrl: string; // openai only
  model: string;
  key: string;
}

export async function gradeWithApi(cfg: ApiConfig, input: GradeInput): Promise<Grade> {
  const user = buildUser(input);

  if (cfg.provider === 'anthropic') {
    if (!cfg.key) throw new Error('No Anthropic key set.');
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': cfg.key,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: cfg.model || 'claude-opus-4-8',
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: user }],
      }),
    });
    if (!res.ok) throw new Error(await apiError(res));
    const data = await res.json();
    const text = Array.isArray(data.content)
      ? data.content.filter((b: { type: string }) => b.type === 'text').map((b: { text: string }) => b.text).join('')
      : '';
    return parseGrade(text);
  }

  // OpenAI-compatible
  const base = cfg.baseUrl.replace(/\/$/, '');
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (cfg.key) headers['authorization'] = `Bearer ${cfg.key}`;
  const res = await fetch(`${base}/chat/completions`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: cfg.model,
      temperature: 0,
      max_tokens: 1024,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: user },
      ],
    }),
  });
  if (!res.ok) throw new Error(await apiError(res));
  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content ?? '';
  return parseGrade(text);
}

async function apiError(res: Response): Promise<string> {
  let detail = `${res.status}`;
  try {
    const err = await res.json();
    detail = err?.error?.message ?? err?.message ?? detail;
  } catch {
    /* ignore */
  }
  if (res.status === 401) return `Auth failed (401): ${detail}`;
  if (res.status === 429) return `Rate limited (429): ${detail}`;
  return `Request failed: ${detail}`;
}
