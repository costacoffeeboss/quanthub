import { useEffect, useReducer, useRef, useState } from 'react';
import { usePersistentState } from '../lib/storage';

/**
 * Hold'em Market Maker. Four seats (you + three bots) each get two private hole
 * cards; five community cards reveal poker-style (flop / turn / river). Everyone
 * trades a market on the SUM of all 13 cards in play. Card values: A=1, pips at
 * face value, J/Q/K = 11/12/13 — but RED pictures (♥♦ J/Q/K) score negative; all
 * other cards positive. Expected settlement ≈ 55.
 *
 * Each betting round goes once around the table from a rotating button. On a
 * bot's turn you reveal their market and get 5 seconds to make one trade; on
 * your turn you post a market and the bots choose whether to trade on it. After
 * the table's been around, you open 20s of live outcry. At the river every card
 * is revealed and you book cash + position × the true sum.
 */

// ── card model ──
type Suit = 'c' | 'd' | 'h' | 'a';
interface Card { r: number; s: Suit }
const SUITS: Suit[] = ['c', 'd', 'h', 'a'];
const isRed = (s: Suit) => s === 'd' || s === 'h';
const SUIT_SYM: Record<Suit, string> = { c: '♣', d: '♦', h: '♥', a: '♠' };
const RANK_LBL = ['', 'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const cardVal = (c: Card) => (c.r >= 11 && isRed(c.s) ? -c.r : c.r);

const FULL_DECK: Card[] = SUITS.flatMap((s) => Array.from({ length: 13 }, (_, i) => ({ r: i + 1, s })));
const FULL_SUM = FULL_DECK.reduce((a, c) => a + cardVal(c), 0); // 220
const MEAN = FULL_SUM / 52;
const CARD_STD = Math.sqrt(FULL_DECK.reduce((a, c) => a + (cardVal(c) - MEAN) ** 2, 0) / 52);

function fairValue(known: Card[]): number {
  const ks = known.reduce((a, c) => a + cardVal(c), 0);
  const eU = (FULL_SUM - ks) / (52 - known.length);
  return ks + (13 - known.length) * eU;
}
function uncertainty(knownCount: number): number {
  return Math.sqrt(Math.max(0, 13 - knownCount)) * CARD_STD;
}

// ── difficulty ──
type Diff = 'easy' | 'med' | 'hard';
interface BotCfg { noise: number; spreadMult: number; edge: number; size: number; name: string }
const BOTS: Record<Diff, BotCfg[]> = {
  easy: [
    { noise: 8, spreadMult: 1.9, edge: 5, size: 3, name: 'Ned' },
    { noise: 7, spreadMult: 1.7, edge: 4.5, size: 4, name: 'Lou' },
    { noise: 6, spreadMult: 1.6, edge: 4, size: 4, name: 'Cleo' },
  ],
  med: [
    { noise: 4, spreadMult: 1.2, edge: 2.5, size: 5, name: 'Sam' },
    { noise: 3.5, spreadMult: 1.1, edge: 2, size: 5, name: 'Sara' },
    { noise: 3, spreadMult: 1.0, edge: 1.8, size: 6, name: 'Quinn' },
  ],
  hard: [
    { noise: 1.5, spreadMult: 0.7, edge: 0.9, size: 7, name: 'Sasha' },
    { noise: 1.2, spreadMult: 0.6, edge: 0.7, size: 8, name: 'Ivan' },
    { noise: 1.0, spreadMult: 0.55, edge: 0.6, size: 8, name: 'Vex' },
  ],
};

const ROUND_NAMES = ['Pre-flop', 'Flop', 'Turn', 'River'];
const REVEALED = [0, 3, 4, 5];
const BOT_LIMIT = 15;
const WINDOW_MS = 5000;
const OUTCRY_MS = 20000;

const btnCls =
  'font-mono text-sm px-5 py-2.5 rounded bg-violet text-white hover:bg-violet-light hover:text-bg transition-colors disabled:opacity-40 disabled:hover:bg-violet disabled:hover:text-white';
const ghostBtn = 'font-mono text-sm px-4 py-2 rounded border border-violet/60 text-violet-light hover:bg-violet/15 disabled:opacity-30';

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
let _spare: number | null = null;
function randn(): number {
  if (_spare !== null) { const s = _spare; _spare = null; return s; }
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  const m = Math.sqrt(-2 * Math.log(u));
  _spare = m * Math.sin(2 * Math.PI * v);
  return m * Math.cos(2 * Math.PI * v);
}

interface Quote { bid: number; ask: number; bidSz: number; askSz: number; live: boolean }
interface Trade { id: number; price: number; size: number; buyer: number; seller: number; mine: boolean }
type Sub = 'see' | 'window' | 'post' | 'resolved' | 'outcry-wait' | 'outcry';

interface Engine {
  cfg: BotCfg[];
  hole: Card[][];
  community: Card[];
  roundIdx: number;
  dealer: number;
  order: number[];
  turnIdx: number;
  sub: Sub;
  windowLeft: number;
  outcryLeft: number;
  tradedWindow: boolean;
  shown: boolean[];
  lastFills: string[];
  quotes: Quote[];
  est: number[];
  cash: number[];
  pos: number[];
  tape: Trade[];
  risk: number;
  peakPos: number;
  nextId: number;
  uBid: number;
  uAsk: number;
  uSize: number;
}

function buildBotQuote(cfg: BotCfg, known: Card[], pos: number): { q: Quote; est: number } {
  const est = fairValue(known) + randn() * cfg.noise;
  const half = clamp(Math.round(cfg.spreadMult * 0.22 * uncertainty(known.length)), 1, 30);
  return {
    q: { bid: Math.round(est - half), ask: Math.round(est + half), bidSz: clamp(BOT_LIMIT - pos, 0, cfg.size), askSz: clamp(BOT_LIMIT + pos, 0, cfg.size), live: true },
    est,
  };
}
function clampBotSize(e: Engine, buyer: number, seller: number, size: number): number {
  let s = size;
  if (buyer !== 0) s = Math.min(s, Math.max(0, BOT_LIMIT - e.pos[buyer]));
  if (seller !== 0) s = Math.min(s, Math.max(0, BOT_LIMIT + e.pos[seller]));
  return s;
}
function seatKnown(e: Engine, seat: number): Card[] {
  return [...e.hole[seat], ...e.community.slice(0, REVEALED[e.roundIdx])];
}
function doTrade(e: Engine, buyer: number, seller: number, price: number, size: number) {
  if (size <= 0) return;
  e.cash[buyer] -= price * size; e.pos[buyer] += size;
  e.cash[seller] += price * size; e.pos[seller] -= size;
  e.tape.push({ id: e.nextId++, price, size, buyer, seller, mine: buyer === 0 || seller === 0 });
  if (e.tape.length > 60) e.tape.splice(0, e.tape.length - 60);
}
function bestBid(e: Engine, seats: number[]) {
  let r: { seat: number; price: number } | null = null;
  for (const s of seats) { const q = e.quotes[s]; if (q.live && q.bidSz > 0 && (!r || q.bid > r.price)) r = { seat: s, price: q.bid }; }
  return r;
}
function bestAsk(e: Engine, seats: number[]) {
  let r: { seat: number; price: number } | null = null;
  for (const s of seats) { const q = e.quotes[s]; if (q.live && q.askSz > 0 && (!r || q.ask < r.price)) r = { seat: s, price: q.ask }; }
  return r;
}
function botAct(e: Engine, bot: number) {
  const others = [0, 1, 2, 3].filter((s) => s !== bot);
  for (let i = 0; i < 3; i++) {
    const bb = bestBid(e, others), ba = bestAsk(e, others), cfg = e.cfg[bot - 1];
    if (bb && bb.price > e.est[bot] + cfg.edge) {
      const sz = clampBotSize(e, bb.seat, bot, Math.min(cfg.size, e.quotes[bb.seat].bidSz));
      if (sz > 0) { doTrade(e, bb.seat, bot, bb.price, sz); e.quotes[bb.seat].bidSz -= sz; continue; }
    }
    if (ba && ba.price < e.est[bot] - cfg.edge) {
      const sz = clampBotSize(e, bot, ba.seat, Math.min(cfg.size, e.quotes[ba.seat].askSz));
      if (sz > 0) { doTrade(e, bot, ba.seat, ba.price, sz); e.quotes[ba.seat].askSz -= sz; continue; }
    }
    break;
  }
}

function startRound(e: Engine) {
  e.order = [0, 1, 2, 3].map((i) => (e.dealer + i) % 4);
  e.turnIdx = 0;
  e.shown = [false, false, false, false];
  e.lastFills = [];
  for (let b = 1; b < 4; b++) { const { q, est } = buildBotQuote(e.cfg[b - 1], seatKnown(e, b), e.pos[b]); e.quotes[b] = q; e.est[b] = est; }
  const fair = fairValue(seatKnown(e, 0));
  const half = clamp(Math.round(0.22 * uncertainty(REVEALED[e.roundIdx] + 2)), 2, 14);
  e.uBid = Math.round(fair - half); e.uAsk = Math.round(fair + half);
  e.quotes[0] = { bid: e.uBid, ask: e.uAsk, bidSz: e.uSize, askSz: e.uSize, live: false };
  enterTurn(e);
}
function enterTurn(e: Engine) {
  const seat = e.order[e.turnIdx];
  if (seat === 0) { e.sub = 'post'; } else { e.sub = 'see'; }
}
function advanceTurn(e: Engine) {
  e.turnIdx += 1;
  if (e.turnIdx < 4) enterTurn(e);
  else e.sub = 'outcry-wait';
}
function freshEngine(diff: Diff): Engine {
  const deck = [...FULL_DECK];
  for (let i = deck.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [deck[i], deck[j]] = [deck[j], deck[i]]; }
  const e: Engine = {
    cfg: BOTS[diff], hole: [0, 1, 2, 3].map((p) => [deck[p * 2], deck[p * 2 + 1]]), community: deck.slice(8, 13),
    roundIdx: 0, dealer: Math.floor(Math.random() * 4), order: [], turnIdx: 0, sub: 'see',
    windowLeft: 0, outcryLeft: 0, tradedWindow: false, shown: [false, false, false, false], lastFills: [],
    quotes: [0, 1, 2, 3].map(() => ({ bid: 0, ask: 0, bidSz: 0, askSz: 0, live: false })),
    est: [0, 0, 0, 0], cash: [0, 0, 0, 0], pos: [0, 0, 0, 0], tape: [], risk: 0, peakPos: 0, nextId: 1,
    uBid: 0, uAsk: 0, uSize: 5,
  };
  startRound(e);
  return e;
}

export default function HoldemMarket() {
  const [best, setBest] = usePersistentState<number | null>('qh:hiscore:holdem', null);
  const [phase, setPhase] = useState<'idle' | 'play' | 'settle'>('idle');
  const [diff, setDiff] = useState<Diff>('med');
  const [hint, setHint] = useState(false);
  const g = useRef<Engine | null>(null);
  const [, force] = useReducer((x) => x + 1, 0);
  const [running, setRunning] = useState(false); // a timed phase (window/outcry) is live

  // the clock only ticks during the 5s windows and the 20s outcry — idle otherwise
  useEffect(() => {
    if (phase !== 'play' || !running) return;
    const id = setInterval(() => {
      const e = g.current; if (!e) return;
      if (e.sub === 'window') {
        e.windowLeft -= 100;
        if (e.windowLeft <= 0) { advanceTurn(e); setRunning(false); }
        force();
      } else if (e.sub === 'outcry') {
        e.outcryLeft -= 120;
        const b = 1 + Math.floor(Math.random() * 3);
        if (Math.random() < 0.4) { const { q, est } = buildBotQuote(e.cfg[b - 1], seatKnown(e, b), e.pos[b]); e.quotes[b] = q; e.est[b] = est; }
        botAct(e, b);
        if (e.outcryLeft <= 0) { endOutcry(e); setRunning(false); }
        force();
      }
    }, 100);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, running]);

  function startGame() { g.current = freshEngine(diff); setPhase('play'); }

  function seeMarket() { const e = g.current; if (!e) return; e.shown[e.order[e.turnIdx]] = true; e.sub = 'window'; e.windowLeft = WINDOW_MS; e.tradedWindow = false; setRunning(true); force(); }
  function windowHit() { // sell into the active bot's bid
    const e = g.current; if (!e || e.tradedWindow) return;
    const seat = e.order[e.turnIdx], q = e.quotes[seat];
    if (!q.live || q.bidSz < 1) return;
    const sz = clampBotSize(e, seat, 0, Math.min(e.uSize, q.bidSz));
    if (sz <= 0) return;
    doTrade(e, seat, 0, q.bid, sz); q.bidSz -= sz; e.tradedWindow = true; force();
  }
  function windowLift() { // buy the active bot's offer
    const e = g.current; if (!e || e.tradedWindow) return;
    const seat = e.order[e.turnIdx], q = e.quotes[seat];
    if (!q.live || q.askSz < 1) return;
    const sz = clampBotSize(e, 0, seat, Math.min(e.uSize, q.askSz));
    if (sz <= 0) return;
    doTrade(e, 0, seat, q.ask, sz); q.askSz -= sz; e.tradedWindow = true; force();
  }
  function doneWindow() { const e = g.current; if (!e) return; advanceTurn(e); setRunning(false); force(); }

  function postMarket() {
    const e = g.current; if (!e) return;
    if (e.uAsk <= e.uBid) return;
    e.quotes[0] = { bid: e.uBid, ask: e.uAsk, bidSz: e.uSize, askSz: e.uSize, live: true };
    e.shown[0] = true;
    const fills: string[] = [];
    for (let seat = 1; seat < 4; seat++) {
      const cfg = e.cfg[seat - 1], q0 = e.quotes[0];
      if (e.uBid > e.est[seat] + cfg.edge && q0.bidSz > 0) {
        const sz = clampBotSize(e, 0, seat, Math.min(cfg.size, q0.bidSz));
        if (sz > 0) { doTrade(e, 0, seat, e.uBid, sz); q0.bidSz -= sz; fills.push(`${cfg.name} sold ×${sz} into your ${e.uBid} bid`); }
      } else if (e.uAsk < e.est[seat] - cfg.edge && q0.askSz > 0) {
        const sz = clampBotSize(e, seat, 0, Math.min(cfg.size, q0.askSz));
        if (sz > 0) { doTrade(e, seat, 0, e.uAsk, sz); q0.askSz -= sz; fills.push(`${cfg.name} lifted your ${e.uAsk} offer ×${sz}`); }
      }
    }
    e.lastFills = fills; e.sub = 'resolved'; force();
  }
  function continueResolved() { const e = g.current; if (!e) return; advanceTurn(e); force(); }
  function openOutcry() { const e = g.current; if (!e) return; e.sub = 'outcry'; e.outcryLeft = OUTCRY_MS; setRunning(true); force(); }

  function outcryHit() {
    const e = g.current; if (!e) return;
    const bb = bestBid(e, [1, 2, 3]); if (!bb) return;
    const sz = clampBotSize(e, bb.seat, 0, Math.min(e.uSize, e.quotes[bb.seat].bidSz)); if (sz <= 0) return;
    doTrade(e, bb.seat, 0, bb.price, sz); e.quotes[bb.seat].bidSz -= sz; force();
  }
  function outcryLift() {
    const e = g.current; if (!e) return;
    const ba = bestAsk(e, [1, 2, 3]); if (!ba) return;
    const sz = clampBotSize(e, 0, ba.seat, Math.min(e.uSize, e.quotes[ba.seat].askSz)); if (sz <= 0) return;
    doTrade(e, 0, ba.seat, ba.price, sz); e.quotes[ba.seat].askSz -= sz; force();
  }

  function endOutcry(e: Engine) {
    e.risk += Math.abs(e.pos[0]) * uncertainty(REVEALED[e.roundIdx] + 2);
    e.peakPos = Math.max(e.peakPos, Math.abs(e.pos[0]));
    if (e.roundIdx < 3) { e.roundIdx += 1; e.dealer = (e.dealer + 1) % 4; startRound(e); }
    else settle(e);
  }
  function skipOutcry() { const e = g.current; if (!e) return; endOutcry(e); setRunning(false); force(); }

  function settle(e: Engine) {
    const total = e.community.reduce((a, c) => a + cardVal(c), 0) + e.hole.flat().reduce((a, c) => a + cardVal(c), 0);
    const finalPnl = e.cash[0] + e.pos[0] * total;
    setBest((b) => (b === null || finalPnl > b ? Math.round(finalPnl) : b));
    setPhase('settle');
  }

  const e = g.current;

  // ── idle ──
  if (phase === 'idle' || !e) {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap gap-x-6 gap-y-1 font-mono text-xs text-muted"><span>Best P&amp;L: {best ?? '—'}</span></div>
        <div className="rounded-lg border border-steel bg-panel p-5 space-y-4">
          <h3 className="font-mono text-lg text-violet-light">Hold'em Market Maker</h3>
          <div className="text-sm text-muted space-y-2 leading-relaxed">
            <p>Four seats (you + three bots) each get two private cards; five community cards reveal poker-style. You all trade a market on the <strong>sum of every card in play</strong>.</p>
            <ul className="space-y-1">
              <li><span className="text-violet">▸</span> A = 1, pips at face value, J/Q/K = 11/12/13 — but <strong className="text-closed">red pictures (♥♦) score negative</strong>. Everything else positive.</li>
              <li><span className="text-violet">▸</span> Each street goes once around the table: reveal each bot's market and get 5s to trade it, then post your own market for the bots to trade, then open outcry.</li>
              <li><span className="text-violet">▸</span> Bots see only their own two cards. At the river it all settles to the true sum.</li>
            </ul>
          </div>
          <div className="space-y-3 max-w-md">
            <div>
              <span className="font-mono text-[11px] text-muted">Bot difficulty</span>
              <div className="mt-1 flex gap-2">
                {(['easy', 'med', 'hard'] as Diff[]).map((d) => (
                  <button key={d} type="button" onClick={() => setDiff(d)} className={`font-mono text-xs px-3 py-1.5 rounded border capitalize ${diff === d ? 'border-violet text-violet-light' : 'border-steel text-muted hover:text-fg'}`}>{d === 'med' ? 'medium' : d}</button>
                ))}
              </div>
              <p className="mt-1 font-mono text-[10px] text-muted">{BOTS[diff].map((b) => b.name).join(' · ')}</p>
            </div>
            <label className="flex items-center gap-2 font-mono text-[11px] text-muted">
              <input type="checkbox" checked={hint} onChange={(ev) => setHint(ev.target.checked)} className="accent-[#6d4aff]" />
              Show fair-value hint (your conditional EV)
            </label>
          </div>
          <button type="button" className={btnCls} onClick={startGame}>Deal →</button>
        </div>
      </div>
    );
  }

  const userFair = fairValue(seatKnown(e, 0));
  const livePnl = e.cash[0] + e.pos[0] * userFair;
  const seatName = (s: number) => (s === 0 ? 'You' : e.cfg[s - 1].name);

  // ── settle ──
  if (phase === 'settle') {
    const total = e.community.reduce((a, c) => a + cardVal(c), 0) + e.hole.flat().reduce((a, c) => a + cardVal(c), 0);
    const pnls = [0, 1, 2, 3].map((p) => ({ seat: p, pnl: e.cash[p] + e.pos[p] * total, pos: e.pos[p] }));
    const board = [...pnls].sort((a, b) => b.pnl - a.pnl);
    const youRank = board.findIndex((b) => b.seat === 0) + 1;
    const my = pnls[0].pnl;
    const coach = youRank === 1
      ? 'Top of the table — you read the value better than the bots and traded the right way into settlement.'
      : my > 0 ? 'Green, but not the sharpest seat. Tighten your fair as the board fills in and lean on bots whose markets drift from value.'
      : 'Underwater — likely quoted the wrong side of the true sum or carried a position into a bad river. Trust your conditional EV.';
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap gap-x-6 gap-y-1 font-mono text-xs text-muted"><span>Best P&amp;L: {best ?? '—'}</span></div>
        <div className="rounded-lg border border-steel bg-panel p-5 space-y-4">
          <p className="font-mono text-lg">
            Settled at <span className="text-violet-light">{total}</span><span className="text-muted text-sm"> — your P&amp;L </span>
            <span className={my >= 0 ? 'text-open' : 'text-closed'}>{my >= 0 ? '+' : ''}{my.toFixed(0)}</span>
            {youRank === 1 && <span className="text-soon"> ★ won the table</span>}
          </p>
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3"><span className="font-mono text-[11px] text-muted w-16">Board</span><div className="flex gap-1">{e.community.map((c, i) => <Card key={i} c={c} />)}</div></div>
            {[0, 1, 2, 3].map((s) => (
              <div key={s} className="flex flex-wrap items-center gap-3">
                <span className={`font-mono text-[11px] w-16 ${s === 0 ? 'text-violet-light' : 'text-muted'}`}>{seatName(s)}</span>
                <div className="flex gap-1">{e.hole[s].map((c, i) => <Card key={i} c={c} />)}</div>
                <span className="font-mono text-[10px] text-muted">hand {e.hole[s].reduce((a, c) => a + cardVal(c), 0)}</span>
              </div>
            ))}
          </div>
          <div className="space-y-1">
            <p className="font-mono text-[11px] uppercase tracking-wide text-muted">Leaderboard</p>
            {board.map((row, i) => (
              <div key={row.seat} className={`flex items-center justify-between rounded border px-3 py-1.5 font-mono text-sm ${row.seat === 0 ? 'border-violet/60 bg-violet/10' : 'border-steel'}`}>
                <span><span className="text-muted">{i + 1}.</span> {seatName(row.seat)} <span className="text-muted text-[11px]">({row.pos > 0 ? '+' : ''}{row.pos})</span></span>
                <span className={row.pnl >= 0 ? 'text-open' : 'text-closed'}>{row.pnl >= 0 ? '+' : ''}{row.pnl.toFixed(0)}</span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Stat label="Your rank" value={`${youRank} / 4`} />
            <Stat label="Risk run" value={e.risk.toFixed(0)} hint="|pos| × uncertainty" />
            <Stat label="Peak position" value={`${e.peakPos}`} hint="max |inventory|" />
          </div>
          <p className="text-sm text-muted leading-relaxed">{coach}</p>
          <button type="button" className={btnCls} onClick={() => setPhase('idle')}>New hand</button>
        </div>
      </div>
    );
  }

  // ── play ──
  const activeSeat = e.sub === 'outcry' || e.sub === 'outcry-wait' ? -1 : e.order[e.turnIdx];
  const obb = bestBid(e, [1, 2, 3]), oba = bestAsk(e, [1, 2, 3]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 font-mono text-xs text-muted">
        <span className="text-violet-light">{ROUND_NAMES[e.roundIdx]}</span>
        <span>Position <span className={e.pos[0] === 0 ? 'text-open' : 'text-soon'}>{e.pos[0] > 0 ? '+' : ''}{e.pos[0]}</span></span>
        <span>P&amp;L <span className={livePnl >= 0 ? 'text-open' : 'text-closed'}>{livePnl >= 0 ? '+' : ''}{livePnl.toFixed(0)}</span></span>
        {hint && <span>Fair <span className="text-violet-light">{userFair.toFixed(1)}</span></span>}
        <button type="button" onClick={() => setHint((h) => !h)} className="font-mono text-[11px] px-2 py-0.5 rounded border border-steel text-muted hover:text-fg">{hint ? 'hide hint' : 'show hint'}</button>
        <span className="ml-auto">Best {best ?? '—'}</span>
      </div>

      {/* the table */}
      <div
        className="relative mx-auto rounded-[46%] border border-violet/25"
        style={{ height: 360, maxWidth: 680, background: 'radial-gradient(ellipse at center, #241a3d 0%, #1a1426 65%, #130f1b 100%)', boxShadow: 'inset 0 0 70px rgba(0,0,0,.55), 0 0 0 7px #0e0c14, 0 0 26px rgba(109,74,255,.22)' }}
      >
        {/* community cards */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1">
          <span className="font-mono text-[10px] uppercase tracking-widest text-violet-light/70">{ROUND_NAMES[e.roundIdx]}</span>
          <div className="flex gap-1.5">{[0, 1, 2, 3, 4].map((i) => <FlipCard key={i} c={e.community[i]} up={i < REVEALED[e.roundIdx]} />)}</div>
        </div>
        {/* seats */}
        {[0, 1, 2, 3].map((s) => (
          <Seat key={s} e={e} seat={s} active={activeSeat === s} name={seatName(s)} />
        ))}
      </div>

      {/* action / controls */}
      <div className="rounded-lg border border-steel bg-panel p-3 space-y-3">
        {e.sub === 'see' && (
          <div className="flex flex-wrap items-center gap-3">
            <p className="font-mono text-sm">It's <span className="text-violet-light">{seatName(activeSeat)}</span>'s turn.</p>
            <button type="button" className={btnCls} onClick={seeMarket}>See market →</button>
          </div>
        )}

        {e.sub === 'window' && (() => {
          const q = e.quotes[activeSeat];
          return (
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-4">
                <p className="font-mono text-sm"><span className="text-violet-light">{seatName(activeSeat)}</span> shows <span className="text-open">{q.bid}</span> / <span className="text-closed">{q.ask}</span></p>
                <span className="font-mono text-[11px] text-muted">trade {e.uSize}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" disabled={e.tradedWindow || q.bidSz < 1} onClick={windowHit} className={`${ghostBtn} border-open/50 text-open hover:bg-open/10`}>Hit {q.bid} (sell)</button>
                <button type="button" disabled={e.tradedWindow || q.askSz < 1} onClick={windowLift} className={`${ghostBtn} border-closed/50 text-closed hover:bg-closed/10`}>Lift {q.ask} (buy)</button>
                <button type="button" onClick={doneWindow} className={ghostBtn}>Done →</button>
                <div className="ml-auto flex items-center gap-2 w-40">
                  <div className="flex-1 h-1.5 rounded-full bg-steel overflow-hidden"><div className="h-full bg-violet" style={{ width: `${(e.windowLeft / WINDOW_MS) * 100}%` }} /></div>
                  <span className="font-mono text-[11px] text-muted">{(e.windowLeft / 1000).toFixed(1)}s</span>
                </div>
              </div>
              {e.tradedWindow && <p className="font-mono text-[11px] text-violet-light">Traded — click Done to continue.</p>}
            </div>
          );
        })()}

        {e.sub === 'post' && (
          <div className="space-y-2">
            <p className="font-mono text-sm">Your turn — <span className="text-violet-light">make your market</span>{hint && <span className="text-muted"> (fair ≈ {userFair.toFixed(0)})</span>}.</p>
            <div className="flex flex-wrap items-end gap-4">
              <Spin label="Bid" value={e.uBid} onDec={() => { e.uBid -= 1; force(); }} onInc={() => { e.uBid += 1; force(); }} color="text-open" />
              <Spin label="Ask" value={e.uAsk} onDec={() => { e.uAsk -= 1; force(); }} onInc={() => { e.uAsk += 1; force(); }} color="text-closed" />
              <Spin label="Size" value={e.uSize} onDec={() => { e.uSize = Math.max(1, e.uSize - 1); force(); }} onInc={() => { e.uSize += 1; force(); }} color="text-fg" />
              <button type="button" className={btnCls} onClick={postMarket} disabled={e.uAsk <= e.uBid}>Post market →</button>
            </div>
          </div>
        )}

        {e.sub === 'resolved' && (
          <div className="space-y-2">
            <p className="font-mono text-sm text-violet-light">You posted {e.uBid} / {e.uAsk}.</p>
            {e.lastFills.length ? e.lastFills.map((f, i) => <p key={i} className="font-mono text-xs text-fg">▸ {f}</p>) : <p className="font-mono text-xs text-muted">No one traded your market.</p>}
            <button type="button" className={btnCls} onClick={continueResolved}>Continue →</button>
          </div>
        )}

        {e.sub === 'outcry-wait' && (
          <div className="flex flex-wrap items-center gap-3">
            <p className="font-mono text-sm text-muted">Once around the table done.</p>
            <button type="button" className={btnCls} onClick={openOutcry}>Open outcry (20s) →</button>
          </div>
        )}

        {e.sub === 'outcry' && (
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm text-violet-light">Open outcry</span>
              <div className="flex-1 h-1.5 rounded-full bg-steel overflow-hidden"><div className="h-full bg-violet" style={{ width: `${(e.outcryLeft / OUTCRY_MS) * 100}%` }} /></div>
              <span className="font-mono text-[11px] text-muted">{(e.outcryLeft / 1000).toFixed(1)}s</span>
              <button type="button" onClick={skipOutcry} className={ghostBtn}>{e.roundIdx < 3 ? 'Skip →' : 'Settle →'}</button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" disabled={!obb} onClick={outcryHit} className={`${ghostBtn} border-open/50 text-open hover:bg-open/10`}>Hit {obb ? `${obb.price} (${seatName(obb.seat)})` : '—'}</button>
              <button type="button" disabled={!oba} onClick={outcryLift} className={`${ghostBtn} border-closed/50 text-closed hover:bg-closed/10`}>Lift {oba ? `${oba.price} (${seatName(oba.seat)})` : '—'}</button>
              <Spin label="Size" value={e.uSize} onDec={() => { e.uSize = Math.max(1, e.uSize - 1); force(); }} onInc={() => { e.uSize += 1; force(); }} color="text-fg" inline />
            </div>
          </div>
        )}
      </div>

      {/* tape */}
      <div className="rounded-lg border border-steel bg-panel p-2">
        <p className="font-mono text-[10px] uppercase tracking-wide text-muted mb-1 px-1">Trade tape</p>
        <div className="h-20 overflow-hidden font-mono text-[11px] space-y-0.5">
          {[...e.tape].reverse().slice(0, 5).map((t) => (
            <div key={t.id} className={`px-1 ${t.mine ? 'text-violet-light' : 'text-muted'}`}>{seatName(t.buyer)} bought {t.size} @ {t.price} from {seatName(t.seller)}</div>
          ))}
          {e.tape.length === 0 && <p className="px-1 text-muted">No trades yet.</p>}
        </div>
      </div>
    </div>
  );
}

// seat positions around the oval
const SEAT_POS: Record<number, string> = {
  0: 'left-1/2 -translate-x-1/2 bottom-3',
  1: 'left-3 top-1/2 -translate-y-1/2',
  2: 'left-1/2 -translate-x-1/2 top-3',
  3: 'right-3 top-1/2 -translate-y-1/2',
};
function Seat({ e, seat, active, name }: { e: Engine; seat: number; active: boolean; name: string }) {
  const q = e.quotes[seat];
  const showMkt = e.shown[seat] && q.live;
  const isUser = seat === 0;
  return (
    <div className={`absolute ${SEAT_POS[seat]} w-[120px] flex flex-col items-center gap-1 rounded-lg px-2 py-1.5 transition-shadow ${active ? 'ring-2 ring-violet shadow-[0_0_16px_rgba(109,74,255,.5)] bg-violet/10' : ''}`}>
      <div className="flex items-center gap-1">
        <span className={`font-mono text-[11px] ${isUser ? 'text-violet-light' : 'text-fg'}`}>{name}</span>
        {e.dealer === seat && <span className="font-mono text-[8px] w-3.5 h-3.5 flex items-center justify-center rounded-full bg-soon/20 text-soon">D</span>}
      </div>
      <div className="flex gap-1">
        {isUser ? e.hole[0].map((c, i) => <Card key={i} c={c} sm />) : [0, 1].map((i) => <CardBack key={i} sm />)}
      </div>
      <div className="font-mono text-[10px] leading-tight text-center">
        {showMkt ? (
          <span><span className="text-open">{q.bid}</span><span className="text-steel"> / </span><span className="text-closed">{q.ask}</span></span>
        ) : <span className="text-muted/50">— —</span>}
        <div className="text-muted">pos {e.pos[seat] > 0 ? '+' : ''}{e.pos[seat]}</div>
      </div>
    </div>
  );
}

// ── card visuals ──
function cardSize(sm?: boolean) { return sm ? { w: 30, h: 42, f: 12 } : { w: 38, h: 54, f: 15 }; }
function CardFace({ c, sm }: { c: Card; sm?: boolean }) {
  const red = isRed(c.s); const { w, h, f } = cardSize(sm);
  return (
    <div className="rounded-[4px] bg-[#eef0f5] border border-[#c9cdd6] flex flex-col items-center justify-center leading-none shadow" style={{ width: w, height: h }}>
      <span className="font-mono font-bold" style={{ color: red ? '#d2333a' : '#1a1c22', fontSize: f }}>{RANK_LBL[c.r]}</span>
      <span style={{ color: red ? '#d2333a' : '#1a1c22', fontSize: f }}>{SUIT_SYM[c.s]}</span>
    </div>
  );
}
function Card({ c, sm }: { c: Card; sm?: boolean }) { return <CardFace c={c} sm={sm} />; }
function CardBack({ sm }: { sm?: boolean }) {
  const { w, h } = cardSize(sm);
  return <div className="rounded-[4px] border border-violet/40" style={{ width: w, height: h, background: 'repeating-linear-gradient(45deg, #2a1b4d, #2a1b4d 4px, #3a2670 4px, #3a2670 8px)' }} />;
}
function FlipCard({ c, up }: { c: Card; up: boolean }) {
  const { w, h } = cardSize(false);
  return (
    <div style={{ width: w, height: h, perspective: 600 }}>
      <div style={{ position: 'relative', width: '100%', height: '100%', transformStyle: 'preserve-3d', transition: 'transform .5s ease', transform: up ? 'rotateY(0deg)' : 'rotateY(180deg)' }}>
        <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden' }}><CardFace c={c} /></div>
        <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}><CardBack /></div>
      </div>
    </div>
  );
}
function Spin({ label, value, onDec, onInc, color, inline }: { label: string; value: number; onDec: () => void; onInc: () => void; color: string; inline?: boolean }) {
  return (
    <div className={inline ? 'flex items-center gap-2' : ''}>
      <p className="font-mono text-[10px] uppercase tracking-wide text-muted">{label}</p>
      <div className="flex items-center gap-1 mt-0.5">
        <button type="button" onClick={onDec} className="font-mono text-sm w-7 h-7 rounded border border-steel text-muted hover:text-fg leading-none">−</button>
        <span className={`font-mono text-lg w-10 text-center ${color}`}>{value}</span>
        <button type="button" onClick={onInc} className="font-mono text-sm w-7 h-7 rounded border border-steel text-muted hover:text-fg leading-none">+</button>
      </div>
    </div>
  );
}
function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded border border-steel bg-bg px-3 py-2">
      <p className="font-mono text-[10px] uppercase tracking-wide text-muted">{label}</p>
      <p className="font-mono text-base">{value}</p>
      {hint && <p className="font-mono text-[10px] text-muted">{hint}</p>}
    </div>
  );
}
