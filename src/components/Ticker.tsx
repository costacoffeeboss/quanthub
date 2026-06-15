import { programmes } from '../data/firms';

/**
 * Slow market-quote-style ticker of firms and their typical opening windows.
 * One entry per firm (distinct names, not repeated listings) to show variety.
 * Content is duplicated once so the -50% translate loops seamlessly.
 * Decorative only — hidden from assistive tech (the real data is in the Tracker).
 */
const normalise = (firm: string) => firm.replace(/\s*\(.*\)\s*$/, '').trim();

export default function Ticker() {
  // collapse multiple listings of the same firm down to one entry
  const seen = new Set<string>();
  const firms = programmes.filter((p) => {
    const key = normalise(p.firm);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const items = firms.map((p) => (
    <span key={p.firm} className="inline-flex items-baseline gap-2 px-6">
      <span className="text-fg font-semibold">{p.firm.toUpperCase()}</span>
      <span className="text-soon">{p.window}</span>
      <span className="text-violet">◆</span>
    </span>
  ));

  return (
    <div
      aria-hidden="true"
      className="overflow-hidden border-y border-steel bg-panel font-mono text-xs whitespace-nowrap select-none"
    >
      <div className="animate-ticker flex w-max py-2">
        <div>{items}</div>
        <div>{items}</div>
      </div>
    </div>
  );
}
