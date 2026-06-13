import { programmes } from '../data/firms';

/**
 * Slow market-quote-style ticker of firms and their typical opening windows.
 * Content is duplicated once so the -50% translate loops seamlessly.
 * Decorative only — hidden from assistive tech (the real data is in Trackr).
 */
export default function Ticker() {
  const items = programmes.map((p) => (
    <span key={p.id} className="inline-flex items-baseline gap-2 px-5">
      <span className="text-fg font-semibold">{p.firm.toUpperCase()}</span>
      <span className="text-muted">{p.type.toUpperCase()}</span>
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
