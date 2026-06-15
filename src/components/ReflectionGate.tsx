import { useState } from 'react';

/**
 * Shared "explain your move" reflection prompt used by the market-making games.
 * The game pauses at a significant action, shows the relevant state, and asks
 * the player why they did it. The player picks the rationale(s) that match
 * their thinking (and may add a note); revealing shows which rationales are
 * actually justified by the state, plus a state-aware verdict on the action.
 */

export interface ReflectChip {
  id: string;
  label: string;
  /** Is this rationale actually justified by the current state? */
  sound: boolean;
}

export type ReflectTier = 'sound' | 'mixed' | 'mistake';

export interface ReflectSpec {
  question: string;
  facts: { label: string; value: string }[];
  chips: ReflectChip[];
  verdict: { tier: ReflectTier; headline: string; points: string[] };
}

const tierMeta: Record<ReflectTier, { label: string; color: string; border: string; bg: string }> = {
  sound: { label: 'Sound', color: 'text-open', border: 'border-open/50', bg: 'bg-open/10' },
  mixed: { label: 'Defensible — with caveats', color: 'text-soon', border: 'border-soon/50', bg: 'bg-soon/10' },
  mistake: { label: 'Questionable', color: 'text-closed', border: 'border-closed/50', bg: 'bg-closed/10' },
};

const btn =
  'font-mono text-sm px-4 py-2 rounded bg-violet text-white hover:bg-violet-light hover:text-bg transition-colors';

export default function ReflectionGate({ spec, onContinue }: { spec: ReflectSpec; onContinue: () => void }) {
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [note, setNote] = useState('');
  const [revealed, setRevealed] = useState(false);
  const m = tierMeta[spec.verdict.tier];

  const toggle = (id: string) =>
    setPicked((p) => {
      const n = new Set(p);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const missed = spec.chips.filter((c) => c.sound && !picked.has(c.id));

  return (
    <div className="rounded-lg border border-violet/50 bg-violet/5 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <span className="font-mono text-[11px] uppercase tracking-wider text-violet-light">Reflection</span>
        <span className="font-mono text-[11px] text-muted">the interviewer pauses you</span>
      </div>
      <p className="text-sm font-semibold">{spec.question}</p>

      {spec.facts.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {spec.facts.map((f) => (
            <span key={f.label} className="font-mono text-[11px] rounded border border-steel bg-bg px-2 py-0.5">
              <span className="text-muted">{f.label} </span>
              {f.value}
            </span>
          ))}
        </div>
      )}

      <div className="space-y-1.5">
        <p className="font-mono text-[11px] text-muted">Pick the reason(s) that match your thinking:</p>
        {spec.chips.map((c) => {
          const sel = picked.has(c.id);
          return (
            <button
              key={c.id}
              type="button"
              disabled={revealed}
              onClick={() => toggle(c.id)}
              className={`flex w-full items-center gap-2 rounded border px-3 py-2 text-left text-sm transition-colors ${
                revealed
                  ? c.sound
                    ? 'border-open/50 bg-open/5'
                    : sel
                    ? 'border-closed/50 bg-closed/5'
                    : 'border-steel opacity-60'
                  : sel
                  ? 'border-violet-light bg-violet/15'
                  : 'border-steel hover:border-violet-light'
              }`}
            >
              <span className="shrink-0 font-mono text-[11px] w-4 text-violet-light">{sel ? '✓' : ''}</span>
              <span className="flex-1">{c.label}</span>
              {revealed && (
                <span className={`font-mono text-[10px] ${c.sound ? 'text-open' : 'text-closed'}`}>
                  {c.sound ? 'sound' : 'shaky'}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {!revealed ? (
        <div className="space-y-2">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Optional — say it in your own words, as you would to the interviewer…"
            className="w-full bg-bg border border-steel rounded px-3 py-2 text-sm min-h-[60px]"
          />
          <button type="button" onClick={() => setRevealed(true)} className={btn}>Reveal feedback</button>
        </div>
      ) : (
        <div className={`rounded border ${m.border} ${m.bg} p-3 space-y-2`}>
          <p className={`font-mono text-xs uppercase tracking-wider ${m.color}`}>{m.label} — {spec.verdict.headline}</p>
          <ul className="text-sm space-y-1">
            {spec.verdict.points.map((p, i) => (
              <li key={i} className="flex gap-2"><span className="text-violet shrink-0">▸</span>{p}</li>
            ))}
          </ul>
          {missed.length > 0 && (
            <p className="text-[12px] text-muted">
              Also worth noting: {missed.map((c) => `“${c.label}”`).join(', ')}.
            </p>
          )}
          {note.trim() && <p className="text-[11px] text-muted border-t border-steel/60 pt-2">Your note: “{note.trim()}”</p>}
          <button type="button" onClick={onContinue} className={btn}>Continue →</button>
        </div>
      )}
    </div>
  );
}

/** Small reusable toggle for turning reflection mode on/off in a game's setup screen. */
export function ReflectToggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 font-mono text-[11px] text-muted cursor-pointer">
      <input type="checkbox" checked={on} onChange={(e) => onChange(e.target.checked)} className="accent-[#6d4aff]" />
      Reflection mode — pause occasionally to explain your moves and get coached
    </label>
  );
}
