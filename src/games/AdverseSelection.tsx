import { useState } from 'react';
import { usePersistentState } from '../lib/storage';

/**
 * Market-making under adverse selection. You quote a two-way market around a
 * shown fair value. After you quote, the value jumps and a counterparty trades:
 * informed flow (probability rises by level) trades WITH the jump — picking you
 * off — while noise flow trades randomly. P&L decomposes into spread captured
 * minus adverse selection.
 */

const ROUNDS = 15;
const btnCls =
  'font-mono text-sm px-5 py-2.5 rounded bg-violet text-white hover:bg-violet-light hover:text-bg transition-colors disabled:opacity-40';
const btn2Cls = 'font-mono text-sm px-4 py-2 rounded border border-violet/60 text-violet-light hover:bg-violet/15';
const inputCls = 'bg-bg border border-steel rounded px-3 py-2 font-mono text-sm w-full';

function informedFraction(round: number): number {
  if (round < 5) return 0.25;
  if (round < 10) return 0.45;
  return 0.65;
}

function jump(): number {
  // integer jump, fat-ish tails
  const r = Math.random();
  const mag = r < 0.4 ? 0 : r < 0.7 ? 1 : r < 0.9 ? 2 : 3;
  return mag * (Math.random() < 0.5 ? -1 : 1);
}

interface RoundLog {
  fair: number;
  bid: number;
  ask: number;
  j: number;
  counterparty: 'informed' | 'noise' | 'none';
  side: 'bought' | 'sold' | 'none'; // from your perspective
  spreadPnl: number;
  adversePnl: number;
}

export default function AdverseSelection() {
  const [best, setBest] = usePersistentState<number | null>('qh:hiscore:adverse', null);
  const [phase, setPhase] = useState<'idle' | 'quote' | 'reveal' | 'done'>('idle');
  const [round, setRound] = useState(0);
  const [fair, setFair] = useState(100);
  const [inventory, setInventory] = useState(0);
  const [cash, setCash] = useState(0);
  const [spreadTotal, setSpreadTotal] = useState(0);
  const [adverseTotal, setAdverseTotal] = useState(0);
  const [bid, setBid] = useState('99');
  const [ask, setAsk] = useState('101');
  const [last, setLast] = useState<RoundLog | null>(null);
  const [err, setErr] = useState('');

  const pnl = cash + inventory * fair;

  function startGame() {
    setRound(0);
    setFair(100);
    setInventory(0);
    setCash(0);
    setSpreadTotal(0);
    setAdverseTotal(0);
    setLast(null);
    setBid('99');
    setAsk('101');
    setErr('');
    setPhase('quote');
  }

  function submitQuote() {
    const b = Number(bid), a = Number(ask);
    if (Number.isNaN(b) || Number.isNaN(a)) return setErr('Enter numeric bid and ask.');
    if (a <= b) return setErr('Ask must be above bid.');
    setErr('');

    const phi = informedFraction(round);
    const j = jump();
    const post = fair + j;
    const isInformed = Math.random() < phi;

    let side: RoundLog['side'] = 'none';
    let counterparty: RoundLog['counterparty'] = 'none';
    let newInv = inventory;
    let newCash = cash;

    if (isInformed) {
      counterparty = 'informed';
      // informed trades only when profitable for them (against you)
      if (post >= a) { side = 'sold'; newInv -= 1; newCash += a; }
      else if (post <= b) { side = 'bought'; newInv += 1; newCash -= b; }
      // else informed declines — your quote straddled the move
    } else {
      counterparty = 'noise';
      if (Math.random() < 0.5) { side = 'sold'; newInv -= 1; newCash += a; }
      else { side = 'bought'; newInv += 1; newCash -= b; }
    }

    // P&L decomposition for this round
    const spreadPnl = side === 'sold' ? a - fair : side === 'bought' ? fair - b : 0;
    const adversePnl = j * newInv; // the position you carry through the jump

    const rec: RoundLog = { fair, bid: b, ask: a, j, counterparty, side, spreadPnl, adversePnl };
    setLast(rec);
    setInventory(newInv);
    setCash(newCash);
    setSpreadTotal((s) => s + spreadPnl);
    setAdverseTotal((s) => s + adversePnl);
    setFair(post);
    // default next quote around the new fair, nudged to flatten inventory
    setBid(String(post - 1 - (newInv > 0 ? 1 : 0)));
    setAsk(String(post + 1 + (newInv < 0 ? 1 : 0)));
    setPhase('reveal');
  }

  function next() {
    if (round + 1 >= ROUNDS) {
      const finalPnl = cash + inventory * fair;
      setBest((b) => (b === null || finalPnl > b ? Math.round(finalPnl) : b));
      setPhase('done');
    } else {
      setRound((r) => r + 1);
      setPhase('quote');
    }
  }

  const phi = informedFraction(round);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-x-6 gap-y-1 font-mono text-xs text-muted">
        {phase !== 'idle' && phase !== 'done' && <span>Round {round + 1}/{ROUNDS}</span>}
        {phase !== 'idle' && (
          <>
            <span>Inventory: <span className={inventory === 0 ? 'text-open' : 'text-soon'}>{inventory > 0 ? '+' : ''}{inventory}</span></span>
            <span>P&amp;L: <span className={pnl >= 0 ? 'text-open' : 'text-closed'}>{pnl >= 0 ? '+' : ''}{pnl.toFixed(1)}</span></span>
          </>
        )}
        <span>Best: {best ?? '—'}</span>
      </div>

      {phase === 'idle' && (
        <div className="rounded-lg border border-steel bg-panel p-5 space-y-4">
          <h3 className="font-mono text-lg text-violet-light">Adverse Selection</h3>
          <div className="text-sm text-muted space-y-2 leading-relaxed">
            <p>
              You make a two-way market around a fair value. After you quote, the value moves and
              one counterparty trades against you:
            </p>
            <ul className="space-y-1">
              <li><span className="text-violet">▸</span> <strong>Informed</strong> traders know which way the value jumped and only trade when it pays them — they pick off quotes that are too tight on the wrong side.</li>
              <li><span className="text-violet">▸</span> <strong>Noise</strong> traders buy or sell at random — they pay you the spread.</li>
            </ul>
            <p>
              The informed share rises each level (25% → 45% → 65%). Quote tight to capture noise
              spread, wide to avoid being run over, and skew your market to flatten inventory. Final
              P&amp;L marks your position at the last fair value.
            </p>
          </div>
          <button type="button" className={btnCls} onClick={startGame}>Start →</button>
        </div>
      )}

      {(phase === 'quote' || phase === 'reveal') && (
        <div className="rounded-lg border border-steel bg-panel p-5 space-y-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="font-mono text-sm">Fair value: <span className="text-violet-light text-lg">{fair.toFixed(0)}</span></p>
            <p className="font-mono text-[11px] text-muted">Informed flow this level: <span className="text-soon">{Math.round(phi * 100)}%</span></p>
          </div>

          {phase === 'quote' && (
            <form className="space-y-3 max-w-md" onSubmit={(e) => { e.preventDefault(); submitQuote(); }}>
              <p className="text-sm text-muted">Make your market (you buy at your bid, sell at your ask):</p>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="font-mono text-[11px] text-muted">Bid</span>
                  <input className={inputCls} inputMode="decimal" value={bid} onChange={(e) => setBid(e.target.value)} />
                </label>
                <label className="block">
                  <span className="font-mono text-[11px] text-muted">Ask</span>
                  <input className={inputCls} inputMode="decimal" value={ask} onChange={(e) => setAsk(e.target.value)} />
                </label>
              </div>
              {err && <p className="font-mono text-xs text-closed">{err}</p>}
              <button type="submit" className={btnCls}>Quote</button>
            </form>
          )}

          {phase === 'reveal' && last && (
            <div className="rounded border border-steel bg-bg p-4 space-y-2 font-mono text-sm">
              <p>
                You quoted {last.bid} / {last.ask}. Value jumped {last.j >= 0 ? '+' : ''}{last.j} to {(last.fair + last.j).toFixed(0)}.
              </p>
              <p>
                {last.counterparty === 'informed' && <span className="text-closed">Informed</span>}
                {last.counterparty === 'noise' && <span className="text-soon">Noise</span>}
                {' '}counterparty —{' '}
                {last.side === 'sold' && 'they lifted your offer (you sold 1).'}
                {last.side === 'bought' && 'they hit your bid (you bought 1).'}
                {last.side === 'none' && 'declined to trade (your market straddled the move).'}
              </p>
              <p className="text-xs text-muted">
                Spread captured: <span className={last.spreadPnl >= 0 ? 'text-open' : 'text-closed'}>{last.spreadPnl >= 0 ? '+' : ''}{last.spreadPnl.toFixed(1)}</span>
                {'  ·  '}
                Inventory move through jump: <span className={last.adversePnl >= 0 ? 'text-open' : 'text-closed'}>{last.adversePnl >= 0 ? '+' : ''}{last.adversePnl.toFixed(1)}</span>
              </p>
              <button type="button" className={btn2Cls} onClick={next}>
                {round + 1 >= ROUNDS ? 'See results' : 'Next round →'}
              </button>
            </div>
          )}
        </div>
      )}

      {phase === 'done' && (
        <div className="rounded-lg border border-steel bg-panel p-5 space-y-3">
          <p className="font-mono text-lg">
            Final P&amp;L: <span className={pnl >= 0 ? 'text-open' : 'text-closed'}>{pnl >= 0 ? '+' : ''}{pnl.toFixed(1)}</span>
            {best !== null && Math.round(pnl) >= best && <span className="text-soon"> ★ best</span>}
          </p>
          <div className="font-mono text-sm space-y-1">
            <p>Spread captured: <span className="text-open">+{spreadTotal.toFixed(1)}</span></p>
            <p>Adverse selection: <span className={adverseTotal >= 0 ? 'text-open' : 'text-closed'}>{adverseTotal >= 0 ? '+' : ''}{adverseTotal.toFixed(1)}</span></p>
            <p className="text-muted text-xs">(Final inventory {inventory > 0 ? '+' : ''}{inventory} marked at fair {fair.toFixed(0)}.)</p>
          </div>
          <p className="text-sm text-muted leading-relaxed">
            {adverseTotal < -spreadTotal
              ? 'Adverse selection swamped your spread capture — your quotes were too tight for the informed flow. Widen as the informed share rises, and skew to avoid carrying inventory into jumps.'
              : spreadTotal > 0 && pnl > 0
                ? 'You captured more spread than you bled to informed flow — the market-maker’s goal. Notice how the same width that prints money at 25% informed flow bleeds at 65%.'
                : 'Close. The lever is width vs informed share: every fill from an informed trader costs you the jump; every fill from noise pays you the spread. Quote width to keep that trade positive.'}
          </p>
          <button type="button" className={btnCls} onClick={startGame}>Play again</button>
        </div>
      )}
    </div>
  );
}
