import { useEffect, useReducer, useRef, useState } from 'react';
import { usePersistentState } from '../lib/storage';

/**
 * Live market-making under adverse selection. You quote a two-way market in
 * "spice" whose true price is a hidden random walk with jumping volatility.
 *
 * The market is a real limit order book. Bots post depth around a noisy, laggy
 * view of true; you rest your own bid/ask inside it. Market orders consume the
 * book inside-out — big ones pay through several levels at once — and you only
 * trade when your quote is at the best price, with priority at your own level.
 * Quote on the wrong side of true and informed flow eats through you in size;
 * leave a stale quote and a fast move runs you over (your bid gets bought as
 * the market gaps down). Cross the spread yourself and you trade as the taker.
 *
 * Controls (hold the letter, tap an arrow — bare arrows move fair):
 *   F + up/down  — fair value  (+/- 0.1)
 *   S + up/down  — spread       (up wider, down tighter)
 *   Q + up/down  — quote size   (+/- 1, also reloads)
 *   R            — reload both sides to full quoted size
 * Lean your fair to flatten inventory — no position limit, but you're scored
 * on the risk you ran (inventory weighted by volatility).
 */

const DT = 100;
const TICK = 0.1;
const START_PRICE = 100;
const DEPTH = 14; // bot levels maintained each side
const VIEW = 9; // ladder levels shown each side of the inside

type Diff = 'easy' | 'med' | 'hard';

interface Cfg {
  phi: number; // informed fraction
  sigmaMax: number; // top-of-range true vol (units/sec)
  lamMax: number; // taker arrivals/sec at vol 1
  mBase: number; // bot half-spread floor
  mK: number; // extra bot half-spread per unit vol
  sizeK: number; // informed size = edge / sizeK
  maxInf: number; // informed cap per order
  noiseScale: number; // book read noise
  baseSize: number; // inside bot depth
  refill: number; // lots replenished per level per tick
}

const CFG: Record<Diff, Cfg> = {
  easy: { phi: 0.3, sigmaMax: 0.5, lamMax: 1.5, mBase: 0.2, mK: 0.5, sizeK: 0.18, maxInf: 10, noiseScale: 0.15, baseSize: 8, refill: 2 },
  med: { phi: 0.45, sigmaMax: 0.8, lamMax: 2.0, mBase: 0.2, mK: 0.6, sizeK: 0.15, maxInf: 12, noiseScale: 0.2, baseSize: 7, refill: 1 },
  hard: { phi: 0.6, sigmaMax: 1.2, lamMax: 2.5, mBase: 0.15, mK: 0.7, sizeK: 0.12, maxInf: 15, noiseScale: 0.28, baseSize: 6, refill: 1 },
};

const SIGMA_MIN = 0.05;
const LAM_MIN = 0.1;

const btnCls =
  'font-mono text-sm px-5 py-2.5 rounded bg-violet text-white hover:bg-violet-light hover:text-bg transition-colors disabled:opacity-40';
const btn2Cls = 'font-mono text-sm px-4 py-2 rounded border border-violet/60 text-violet-light hover:bg-violet/15';

const r1 = (v: number) => Math.round(v * 10) / 10;
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const ti = (px: number) => Math.round(px * 10); // price → tick index
const px = (t: number) => t / 10;

let _spare: number | null = null;
function randn(): number {
  if (_spare !== null) { const s = _spare; _spare = null; return s; }
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  const mag = Math.sqrt(-2 * Math.log(u));
  _spare = mag * Math.sin(2 * Math.PI * v);
  return mag * Math.cos(2 * Math.PI * v);
}
function poisson(lam: number): number {
  if (lam <= 0) return 0;
  const L = Math.exp(-lam);
  let k = 0, p = 1;
  do { k++; p *= Math.random(); } while (p > L);
  return k - 1;
}
const noiseSize = () => 1 + Math.floor(Math.random() * Math.random() * 5);

type Control = 'fair' | 'spread' | 'size';

interface TapeRow { id: number; t: number; side: 'buy' | 'sell'; price: number; size: number; mine: boolean; }
interface Dot { t: number; price: number; mine: boolean; }

interface Engine {
  cfg: Cfg;
  duration: number;
  elapsed: number;
  truePx: number;
  prevTrue: number;
  botAnchor: number;
  bookNoise: number;
  volLevel: number;
  dwellLeft: number;
  bid: Map<number, number>; // tick → bot bid size
  ask: Map<number, number>; // tick → bot ask size
  fair: number;
  hs: number;
  size: number;
  bidRem: number;
  askRem: number;
  cash: number;
  pos: number;
  spreadPnl: number;
  adversePnl: number;
  carryPnl: number;
  riskExp: number;
  peakPos: number;
  absErrSum: number;
  absErrN: number;
  fairHist: number[];
  trueHist: number[];
  tHist: number[];
  dots: Dot[];
  tape: TapeRow[];
  armed: Control | null;
  nextId: number;
}

function buildBook(e: Engine, mid: number, M: number) {
  const base = e.cfg.baseSize;
  const askStart = Math.round((mid + M) / TICK);
  const bidStart = Math.round((mid - M) / TICK);
  for (let k = 0; k < DEPTH; k++) {
    const sz = Math.max(1, Math.round(base * Math.pow(0.8, k)));
    e.ask.set(askStart + k, sz);
    e.bid.set(bidStart - k, sz);
  }
}

function freshEngine(diff: Diff, durationMs: number): Engine {
  const e: Engine = {
    cfg: CFG[diff], duration: durationMs, elapsed: 0,
    truePx: START_PRICE, prevTrue: START_PRICE, botAnchor: START_PRICE, bookNoise: 0,
    volLevel: 0.3, dwellLeft: 8000 + Math.random() * 12000,
    bid: new Map(), ask: new Map(),
    fair: START_PRICE, hs: 0.3, size: 5, bidRem: 5, askRem: 5,
    cash: 0, pos: 0, spreadPnl: 0, adversePnl: 0, carryPnl: 0,
    riskExp: 0, peakPos: 0, absErrSum: 0, absErrN: 0,
    fairHist: [START_PRICE], trueHist: [START_PRICE], tHist: [0],
    dots: [], tape: [], armed: null, nextId: 1,
  };
  buildBook(e, START_PRICE, CFG[diff].mBase + CFG[diff].mK * 0.3);
  return e;
}

// best bot levels (exclude the user)
function bestBotAskTick(e: Engine): number | null {
  let m = Infinity;
  for (const [k, v] of e.ask) if (v >= 1 && k < m) m = k;
  return isFinite(m) ? m : null;
}
function bestBotBidTick(e: Engine): number | null {
  let m = -Infinity;
  for (const [k, v] of e.bid) if (v >= 1 && k > m) m = k;
  return isFinite(m) ? m : null;
}
// best including the user's resting quote
function bestAskTickC(e: Engine): number | null {
  let m = bestBotAskTick(e) ?? Infinity;
  if (e.askRem >= 1) m = Math.min(m, ti(e.fair + e.hs));
  return isFinite(m) ? m : null;
}
function bestBidTickC(e: Engine): number | null {
  let m = bestBotBidTick(e) ?? -Infinity;
  if (e.bidRem >= 1) m = Math.max(m, ti(e.fair - e.hs));
  return isFinite(m) ? m : null;
}

function pushTape(e: Engine, side: 'buy' | 'sell', price: number, size: number, mine: boolean) {
  if (size <= 0) return;
  e.tape.push({ id: e.nextId++, t: e.elapsed, side, price, size, mine });
  if (e.tape.length > 140) e.tape.splice(0, e.tape.length - 140);
  e.dots.push({ t: e.elapsed, price, mine });
  if (e.dots.length > 500) e.dots.splice(0, e.dots.length - 500);
}

function bucket(e: Engine, ex: number) {
  if (ex >= 0) e.spreadPnl += ex; else e.adversePnl += ex;
}

// external market order matches the combined book inside-out (user has priority at their level)
function matchExternal(e: Engine, side: 'buy' | 'sell', size: number, limit: number) {
  let rem = size, guard = 0;
  while (rem > 0 && guard++ < 60) {
    if (side === 'buy') {
      const t = bestAskTickC(e); if (t === null) break;
      const p = px(t); if (p > limit + 1e-9) break;
      const botSz = e.ask.get(t) ?? 0;
      const userHere = e.askRem >= 1 && ti(e.fair + e.hs) === t ? e.askRem : 0;
      const avail = botSz + userHere; if (avail < 1) break;
      const take = Math.min(rem, avail);
      const userFill = Math.min(userHere, take);
      if (userFill > 0) {
        e.cash += userFill * p; e.pos -= userFill; e.askRem -= userFill;
        bucket(e, userFill * (p - e.truePx));
      }
      const botFill = take - userFill;
      if (botFill > 0) { const nv = botSz - botFill; if (nv < 1) e.ask.delete(t); else e.ask.set(t, nv); }
      pushTape(e, 'buy', p, take, userFill > 0);
      rem -= take;
    } else {
      const t = bestBidTickC(e); if (t === null) break;
      const p = px(t); if (p < limit - 1e-9) break;
      const botSz = e.bid.get(t) ?? 0;
      const userHere = e.bidRem >= 1 && ti(e.fair - e.hs) === t ? e.bidRem : 0;
      const avail = botSz + userHere; if (avail < 1) break;
      const take = Math.min(rem, avail);
      const userFill = Math.min(userHere, take);
      if (userFill > 0) {
        e.cash -= userFill * p; e.pos += userFill; e.bidRem -= userFill;
        bucket(e, userFill * (e.truePx - p));
      }
      const botFill = take - userFill;
      if (botFill > 0) { const nv = botSz - botFill; if (nv < 1) e.bid.delete(t); else e.bid.set(t, nv); }
      pushTape(e, 'sell', p, take, userFill > 0);
      rem -= take;
    }
  }
}

// resolve the case where the user's resting quote is (or becomes) marketable — they trade as taker
function resolveUserCross(e: Engine) {
  let guard = 0;
  while (e.bidRem >= 1 && guard++ < 60) {
    const ut = ti(e.fair - e.hs);
    const bt = bestBotAskTick(e); if (bt === null || bt > ut) break;
    const p = px(bt); const botSz = e.ask.get(bt) ?? 0;
    if (botSz < 1) { e.ask.delete(bt); continue; }
    const take = Math.min(e.bidRem, botSz);
    e.cash -= take * p; e.pos += take; e.bidRem -= take;
    bucket(e, take * (e.truePx - p));
    const nv = botSz - take; if (nv < 1) e.ask.delete(bt); else e.ask.set(bt, nv);
    pushTape(e, 'buy', p, take, true);
  }
  guard = 0;
  while (e.askRem >= 1 && guard++ < 60) {
    const ut = ti(e.fair + e.hs);
    const bt = bestBotBidTick(e); if (bt === null || bt < ut) break;
    const p = px(bt); const botSz = e.bid.get(bt) ?? 0;
    if (botSz < 1) { e.bid.delete(bt); continue; }
    const take = Math.min(e.askRem, botSz);
    e.cash += take * p; e.pos -= take; e.askRem -= take;
    bucket(e, take * (p - e.truePx));
    const nv = botSz - take; if (nv < 1) e.bid.delete(bt); else e.bid.set(bt, nv);
    pushTape(e, 'sell', p, take, true);
  }
}

function takerOrder(e: Engine) {
  const informed = Math.random() < e.cfg.phi;
  const aTick = bestAskTickC(e), bTick = bestBidTickC(e);
  if (aTick === null || bTick === null) return;
  const bestAsk = px(aTick), bestBid = px(bTick);
  if (informed) {
    const buyEdge = e.truePx - bestAsk;
    const sellEdge = bestBid - e.truePx;
    if (buyEdge <= 0.05 && sellEdge <= 0.05) return;
    if (buyEdge >= sellEdge) {
      const want = clamp(Math.round(buyEdge / e.cfg.sizeK), 1, e.cfg.maxInf);
      matchExternal(e, 'buy', want, e.truePx);
    } else {
      const want = clamp(Math.round(sellEdge / e.cfg.sizeK), 1, e.cfg.maxInf);
      matchExternal(e, 'sell', want, e.truePx);
    }
  } else {
    if (Math.random() < 0.5) matchExternal(e, 'buy', noiseSize(), bestAsk + 0.4);
    else matchExternal(e, 'sell', noiseSize(), bestBid - 0.4);
  }
}

function refreshBook(e: Engine, M: number) {
  const mid = e.botAnchor + e.bookNoise;
  const base = e.cfg.baseSize, ref = e.cfg.refill;
  const askStart = Math.round((mid + M) / TICK);
  const bidStart = Math.round((mid - M) / TICK);
  const wantAsk = new Map<number, number>(), wantBid = new Map<number, number>();
  for (let k = 0; k < DEPTH; k++) {
    wantAsk.set(askStart + k, Math.max(1, Math.round(base * Math.pow(0.8, k))));
    wantBid.set(bidStart - k, Math.max(1, Math.round(base * Math.pow(0.8, k))));
  }
  const reconcile = (cur: Map<number, number>, want: Map<number, number>) => {
    for (const [k, target] of want) {
      const c = cur.get(k) ?? 0;
      if (c < target) cur.set(k, Math.min(target, c + ref));
      else if (c > target) cur.set(k, Math.max(target, c - 1));
    }
    for (const k of [...cur.keys()]) {
      if (!want.has(k)) { const nv = (cur.get(k) ?? 0) - 2; if (nv < 1) cur.delete(k); else cur.set(k, nv); }
    }
  };
  reconcile(e.ask, wantAsk);
  reconcile(e.bid, wantBid);
}

function step(e: Engine) {
  const dt = DT / 1000;
  e.elapsed += DT;
  const c = e.cfg;

  e.dwellLeft -= DT;
  if (e.dwellLeft <= 0) { e.volLevel = clamp(0.1 + Math.random() * 0.9, 0.1, 1); e.dwellLeft = 8000 + Math.random() * 22000; }
  const sigma = SIGMA_MIN + e.volLevel * (c.sigmaMax - SIGMA_MIN);
  const M = c.mBase + c.mK * e.volLevel;

  e.truePx = r1(e.truePx + randn() * sigma * Math.sqrt(dt));
  e.carryPnl += e.pos * (e.truePx - e.prevTrue);
  e.prevTrue = e.truePx;

  e.botAnchor += (e.truePx - e.botAnchor) * 0.06;
  e.bookNoise = e.bookNoise * 0.9 + randn() * (0.05 + 0.25 * e.volLevel) * c.noiseScale * 2;
  refreshBook(e, M);

  e.riskExp += Math.abs(e.pos) * e.volLevel * dt;
  e.peakPos = Math.max(e.peakPos, Math.abs(e.pos));
  e.absErrSum += Math.abs(e.fair - e.truePx);
  e.absErrN += 1;

  e.fairHist.push(e.fair);
  e.trueHist.push(e.truePx);
  e.tHist.push(e.elapsed);

  resolveUserCross(e); // market may have moved through a stale quote

  const lam = LAM_MIN + e.volLevel * (c.lamMax - LAM_MIN);
  const n = poisson(lam * dt);
  for (let i = 0; i < n; i++) takerOrder(e);
}

const fmtT = (ms: number) => { const s = Math.floor(ms / 1000); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };

// ── Order book ladder (price-axis DOM) ──
function Ladder({ e }: { e: Engine }) {
  const aT = bestAskTickC(e), bT = bestBidTickC(e);
  if (aT === null || bT === null) return null;
  const gap = aT - bT;
  const collapse = gap > 13;
  const userBidT = e.bidRem >= 1 ? ti(e.fair - e.hs) : null;
  const userAskT = e.askRem >= 1 ? ti(e.fair + e.hs) : null;

  type Row = { t: number; bidBot: number; bidYou: number; askBot: number; askYou: number; inside: boolean };
  const rows: Array<Row | { gap: true; spread: number }> = [];
  for (let t = aT + VIEW; t >= bT - VIEW; t--) {
    if (collapse && t < aT && t > bT) {
      if (t === aT - 1) rows.push({ gap: true, spread: px(aT) - px(bT) });
      continue;
    }
    rows.push({
      t,
      bidBot: e.bid.get(t) ?? 0,
      bidYou: userBidT === t ? e.bidRem : 0,
      askBot: e.ask.get(t) ?? 0,
      askYou: userAskT === t ? e.askRem : 0,
      inside: t === aT || t === bT,
    });
  }
  const maxSz = Math.max(8, ...rows.flatMap((r) => ('gap' in r ? [] : [r.bidBot + r.bidYou, r.askBot + r.askYou])));

  return (
    <div className="rounded-lg border border-steel bg-panel overflow-hidden">
      <div className="grid grid-cols-3 px-2 py-1 border-b border-steel font-mono text-[10px] uppercase tracking-wide text-muted">
        <span>Bid</span><span className="text-center">Price</span><span className="text-right">Ask</span>
      </div>
      <div className="font-mono text-[10px] leading-none">
        {rows.map((r, i) => {
          if ('gap' in r) {
            return (
              <div key={`g${i}`} className="grid grid-cols-3 items-center px-2 py-[3px] text-muted bg-bg/40">
                <span /><span className="text-center text-[9px]">spread {r.spread.toFixed(1)}</span><span />
              </div>
            );
          }
          const bidTot = r.bidBot + r.bidYou, askTot = r.askBot + r.askYou;
          return (
            <div key={r.t} className={`grid grid-cols-3 items-stretch ${r.inside ? 'bg-steel/40' : ''}`}>
              <div className="relative flex items-center justify-end pr-2 py-[2px]">
                {bidTot > 0 && <div className="absolute inset-y-0 right-0" style={{ width: `${(bidTot / maxSz) * 100}%`, background: '#3ddc97', opacity: 0.12 }} />}
                <span className="relative">
                  {r.bidBot > 0 && <span className="text-open">{r.bidBot}</span>}
                  {r.bidYou > 0 && <span className="text-violet-light font-bold">{r.bidBot > 0 ? ' +' : ''}{r.bidYou}</span>}
                </span>
              </div>
              <div className={`text-center py-[2px] ${r.inside ? 'text-fg' : 'text-muted'}`}>{px(r.t).toFixed(1)}</div>
              <div className="relative flex items-center pl-2 py-[2px]">
                {askTot > 0 && <div className="absolute inset-y-0 left-0" style={{ width: `${(askTot / maxSz) * 100}%`, background: '#e5484d', opacity: 0.12 }} />}
                <span className="relative">
                  {r.askYou > 0 && <span className="text-violet-light font-bold">{r.askYou}{r.askBot > 0 ? '+ ' : ''}</span>}
                  {r.askBot > 0 && <span className="text-closed">{r.askBot}</span>}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LiveChart({ e }: { e: Engine }) {
  const W = 560, H = 220, pad = { l: 42, r: 10, t: 10, b: 16 };
  const now = e.elapsed, span = 60_000, t0 = Math.max(0, now - span);
  const start = e.tHist.findIndex((t) => t >= t0);
  const s = start < 0 ? e.tHist.length : start;
  const ts = e.tHist.slice(s), fs = e.fairHist.slice(s);
  const dots = e.dots.filter((d) => d.t >= t0);
  const bid = r1(e.fair - e.hs), ask = r1(e.fair + e.hs);
  const ys = [...fs, bid, ask, ...dots.map((d) => d.price)];
  let lo = Math.min(...ys), hi = Math.max(...ys);
  if (!isFinite(lo) || !isFinite(hi)) { lo = e.fair - 2; hi = e.fair + 2; }
  const py = Math.max(0.6, (hi - lo) * 0.15); lo -= py; hi += py;
  const xMin = t0, xMax = Math.max(now, t0 + 1);
  const x = (t: number) => pad.l + ((t - xMin) / (xMax - xMin)) * (W - pad.l - pad.r);
  const y = (v: number) => pad.t + (1 - (v - lo) / (hi - lo)) * (H - pad.t - pad.b);
  const fairPath = fs.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(ts[i]).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  const yb = y(bid), ya = y(ask), xr = x(now);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Your fair value and quotes over the last minute">
      {[0.25, 0.5, 0.75].map((f) => {
        const v = lo + (hi - lo) * f;
        return (<g key={f}><line x1={pad.l} x2={W - pad.r} y1={y(v)} y2={y(v)} stroke="#23252c" /><text x={pad.l - 6} y={y(v) + 3} textAnchor="end" fill="#7e838f" fontSize="10" fontFamily="JetBrains Mono, monospace">{v.toFixed(1)}</text></g>);
      })}
      {dots.map((d, i) => (<circle key={i} cx={x(d.t)} cy={y(d.price)} r={d.mine ? 2.4 : 1.5} fill={d.mine ? '#a78bfa' : '#3a3d46'} />))}
      <rect x={pad.l} y={Math.min(ya, yb)} width={W - pad.l - pad.r} height={Math.abs(yb - ya)} fill="#6d4aff" opacity="0.07" />
      <line x1={pad.l} x2={W - pad.r} y1={ya} y2={ya} stroke="#3ddc97" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
      <line x1={pad.l} x2={W - pad.r} y1={yb} y2={yb} stroke="#e5484d" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
      <path d={fairPath} fill="none" stroke="#6d4aff" strokeWidth="2.5" />
      {fs.length > 0 && <circle cx={xr} cy={y(fs[fs.length - 1])} r="3.5" fill="#a78bfa" />}
    </svg>
  );
}

function ResultChart({ e }: { e: Engine }) {
  const W = 660, H = 280, pad = { l: 46, r: 12, t: 12, b: 24 };
  const n = e.tHist.length;
  const stepN = Math.max(1, Math.floor(n / 480));
  const idxs: number[] = [];
  for (let i = 0; i < n; i += stepN) idxs.push(i);
  if (idxs[idxs.length - 1] !== n - 1) idxs.push(n - 1);
  const ys = [...e.fairHist, ...e.trueHist];
  let lo = Math.min(...ys), hi = Math.max(...ys);
  const py = Math.max(0.6, (hi - lo) * 0.08); lo -= py; hi += py;
  const tMax = e.tHist[n - 1] || 1;
  const x = (t: number) => pad.l + (t / tMax) * (W - pad.l - pad.r);
  const y = (v: number) => pad.t + (1 - (v - lo) / (hi - lo)) * (H - pad.t - pad.b);
  const path = (arr: number[]) => idxs.map((i, k) => `${k === 0 ? 'M' : 'L'}${x(e.tHist[i]).toFixed(1)},${y(arr[i]).toFixed(1)}`).join(' ');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Your fair value versus the true spice price">
      {[0, 0.5, 1].map((f) => { const v = lo + (hi - lo) * f; return (<g key={f}><line x1={pad.l} x2={W - pad.r} y1={y(v)} y2={y(v)} stroke="#23252c" /><text x={pad.l - 6} y={y(v) + 3} textAnchor="end" fill="#7e838f" fontSize="10" fontFamily="JetBrains Mono, monospace">{v.toFixed(1)}</text></g>); })}
      <path d={path(e.trueHist)} fill="none" stroke="#3ddc97" strokeWidth="2" opacity="0.85" />
      <path d={path(e.fairHist)} fill="none" stroke="#6d4aff" strokeWidth="2.5" />
      <g fontFamily="JetBrains Mono, monospace" fontSize="11">
        <rect x={W - 180} y={14} width="10" height="10" fill="#6d4aff" /><text x={W - 165} y={23} fill="#a78bfa">your fair</text>
        <rect x={W - 62} y={14} width="10" height="10" fill="#3ddc97" /><text x={W - 47} y={23} fill="#3ddc97">true</text>
      </g>
    </svg>
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

export default function AdverseSelection() {
  const [best, setBest] = usePersistentState<number | null>('qh:hiscore:adverse', null);
  const [phase, setPhase] = useState<'idle' | 'play' | 'done'>('idle');
  const [diff, setDiff] = useState<Diff>('med');
  const [minutes, setMinutes] = useState(2);
  const eng = useRef<Engine | null>(null);
  const [, force] = useReducer((x) => x + 1, 0);

  useEffect(() => {
    if (phase !== 'play') return;
    const id = setInterval(() => {
      const e = eng.current; if (!e) return;
      step(e);
      if (e.elapsed >= e.duration) { finish(); return; }
      force();
    }, DT);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  useEffect(() => {
    if (phase !== 'play') return;
    const adjust = (dir: 1 | -1) => {
      const e = eng.current; if (!e) return;
      const c = e.armed ?? 'fair';
      if (c === 'fair') e.fair = r1(e.fair + dir * TICK);
      else if (c === 'spread') e.hs = clamp(r1(e.hs + dir * TICK), TICK, 10);
      else if (c === 'size') { e.size = clamp(e.size + dir, 1, 50); e.bidRem = e.size; e.askRem = e.size; }
      resolveUserCross(e);
      force();
    };
    const onDown = (ev: KeyboardEvent) => {
      const e = eng.current; if (!e) return;
      const k = ev.key.toLowerCase();
      if (k === 'f' || k === 's' || k === 'q') { e.armed = k === 'f' ? 'fair' : k === 's' ? 'spread' : 'size'; ev.preventDefault(); force(); }
      else if (k === 'r') { e.bidRem = e.size; e.askRem = e.size; resolveUserCross(e); ev.preventDefault(); force(); }
      else if (ev.key === 'ArrowUp') { ev.preventDefault(); adjust(1); }
      else if (ev.key === 'ArrowDown') { ev.preventDefault(); adjust(-1); }
    };
    const onUp = (ev: KeyboardEvent) => {
      const e = eng.current; if (!e) return;
      const map: Record<string, Control> = { f: 'fair', s: 'spread', q: 'size' };
      const c = map[ev.key.toLowerCase()];
      if (c && e.armed === c) { e.armed = null; force(); }
    };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => { window.removeEventListener('keydown', onDown); window.removeEventListener('keyup', onUp); };
  }, [phase]);

  function start() { eng.current = freshEngine(diff, minutes * 60_000); setPhase('play'); }
  function finish() {
    const e = eng.current; if (!e) return;
    const finalPnl = e.cash + e.pos * e.truePx;
    setBest((b) => (b === null || finalPnl > b ? Math.round(finalPnl) : b));
    setPhase('done');
  }
  function nudge(c: Control, dir: 1 | -1) {
    const e = eng.current; if (!e) return;
    if (c === 'fair') e.fair = r1(e.fair + dir * TICK);
    else if (c === 'spread') e.hs = clamp(r1(e.hs + dir * TICK), TICK, 10);
    else if (c === 'size') { e.size = clamp(e.size + dir, 1, 50); e.bidRem = e.size; e.askRem = e.size; }
    resolveUserCross(e); force();
  }
  function reload() { const e = eng.current; if (!e) return; e.bidRem = e.size; e.askRem = e.size; resolveUserCross(e); force(); }

  const e = eng.current;

  if (phase === 'idle' || !e) {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap gap-x-6 gap-y-1 font-mono text-xs text-muted"><span>Best P&amp;L: {best ?? '—'}</span></div>
        <div className="rounded-lg border border-steel bg-panel p-5 space-y-4">
          <h3 className="font-mono text-lg text-violet-light">Adverse Selection — Live</h3>
          <div className="text-sm text-muted space-y-2 leading-relaxed">
            <p>
              You make a live market in <strong>spice</strong> on a real order book. Its true price is
              hidden and its volatility jumps without warning. Read where the market is from the{' '}
              <strong>book</strong> and the <strong>tape</strong>, keep your{' '}
              <span className="text-violet-light">fair</span> honest, and pick a spread that fits the regime.
            </p>
            <ul className="space-y-1">
              <li><span className="text-violet">▸</span> You only trade when your quote is at the best price — and you get priority at your own level.</li>
              <li><span className="text-violet">▸</span> Quote on the wrong side of true and informed flow pays through your size; leave a stale quote and a fast move runs you over.</li>
              <li><span className="text-violet">▸</span> Calm: tighten to capture flow. Storm: widen, or get swept. No position limit — but you're scored on the risk you ran.</li>
            </ul>
            <p className="font-mono text-xs text-fg/90">Hold <kbd className="text-violet-light">F</kbd>/<kbd className="text-violet-light">S</kbd>/<kbd className="text-violet-light">Q</kbd> + <kbd className="text-violet-light">↑</kbd>/<kbd className="text-violet-light">↓</kbd> — fair · spread · size. <kbd className="text-violet-light">R</kbd> reloads.</p>
          </div>
          <div className="space-y-3 max-w-md">
            <div>
              <span className="font-mono text-[11px] text-muted">Difficulty</span>
              <div className="mt-1 flex gap-2">
                {(['easy', 'med', 'hard'] as Diff[]).map((d) => (
                  <button key={d} type="button" onClick={() => setDiff(d)} className={`font-mono text-xs px-3 py-1.5 rounded border capitalize ${diff === d ? 'border-violet text-violet-light' : 'border-steel text-muted hover:text-fg'}`}>{d === 'med' ? 'medium' : d}</button>
                ))}
              </div>
              <p className="mt-1 font-mono text-[10px] text-muted">{Math.round(CFG[diff].phi * 100)}% informed flow · vol up to {CFG[diff].sigmaMax}/s</p>
            </div>
            <label className="block">
              <span className="font-mono text-[11px] text-muted">Length: <span className="text-violet-light">{minutes} min</span></span>
              <input type="range" min={1} max={5} value={minutes} onChange={(ev) => setMinutes(Number(ev.target.value))} className="w-full accent-[#6d4aff]" />
            </label>
          </div>
          <button type="button" className={btnCls} onClick={start}>Start →</button>
        </div>
      </div>
    );
  }

  const bid = r1(e.fair - e.hs), ask = r1(e.fair + e.hs);
  const livePnl = e.cash + e.pos * e.fair;
  const remain = Math.max(0, e.duration - e.elapsed);

  if (phase === 'done') {
    const finalPnl = e.cash + e.pos * e.truePx;
    const avgErr = e.absErrN ? e.absErrSum / e.absErrN : 0;
    const isBest = best !== null && Math.round(finalPnl) >= best;
    const risk = e.riskExp;
    let coach: string;
    if (e.adversePnl < -e.spreadPnl)
      coach = 'Adverse selection beat your spread capture — informed flow paid through the stale side of your quote. Re-centre fair faster as the tape walks, and widen when prints start bursting (that’s vol rising).';
    else if (risk > Math.abs(finalPnl) * 4 && e.peakPos > 12)
      coach = 'Decent edge but you ran a lot of risk — big inventory carried through volatile patches. Lean your fair (or cross to flatten) to bleed the position back, especially once the book gets jumpy.';
    else if (finalPnl > 0)
      coach = 'Net positive with risk in check — you captured spread, kept fair near true, and didn’t carry size into the storms. That balance is the whole job.';
    else
      coach = 'Close. Every fill on the wrong side of true costs you; every fill near true pays the spread. Keep fair tracking the book, tighten in calm, widen in storms, and reload only when your quote is right.';
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap gap-x-6 gap-y-1 font-mono text-xs text-muted"><span>Best P&amp;L: {best ?? '—'}</span></div>
        <div className="rounded-lg border border-steel bg-panel p-5 space-y-4">
          <p className="font-mono text-lg">
            Final P&amp;L: <span className={finalPnl >= 0 ? 'text-open' : 'text-closed'}>{finalPnl >= 0 ? '+' : ''}{finalPnl.toFixed(1)}</span>
            {isBest && <span className="text-soon"> ★ best</span>}
            <span className="text-muted text-sm"> (inventory {e.pos > 0 ? '+' : ''}{e.pos} marked at true {e.truePx.toFixed(1)})</span>
          </p>
          <ResultChart e={e} />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            <Stat label="Spread won" value={`${e.spreadPnl >= 0 ? '+' : ''}${e.spreadPnl.toFixed(1)}`} hint="fills near true" />
            <Stat label="Adverse" value={`${e.adversePnl >= 0 ? '+' : ''}${e.adversePnl.toFixed(1)}`} hint="wrong-side fills" />
            <Stat label="Carry" value={`${e.carryPnl >= 0 ? '+' : ''}${e.carryPnl.toFixed(1)}`} hint="price × position" />
            <Stat label="Risk run" value={risk.toFixed(0)} hint="|pos| × vol × time" />
            <Stat label="Peak position" value={`${e.peakPos}`} hint="max |inventory|" />
            <Stat label="Avg |fair−true|" value={avgErr.toFixed(2)} hint="tracking error" />
          </div>
          <p className="text-sm text-muted leading-relaxed">{coach}</p>
          <button type="button" className={btnCls} onClick={() => setPhase('idle')}>Play again</button>
        </div>
      </div>
    );
  }

  const armed = e.armed;
  const ControlRow = ({ c, label, value, hot }: { c: Control; label: string; value: string; hot: string }) => (
    <div className={`rounded border px-3 py-2 ${armed === c ? 'border-violet bg-violet/10' : 'border-steel'}`}>
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-wide text-muted">{label} <span className="text-violet-light">{hot}</span></span>
        <div className="flex gap-1">
          <button type="button" onClick={() => nudge(c, -1)} className="font-mono text-xs w-6 h-6 rounded border border-steel text-muted hover:text-fg leading-none">−</button>
          <button type="button" onClick={() => nudge(c, 1)} className="font-mono text-xs w-6 h-6 rounded border border-steel text-muted hover:text-fg leading-none">+</button>
        </div>
      </div>
      <p className="font-mono text-base mt-0.5">{value}</p>
    </div>
  );

  const tape = [...e.tape].reverse().slice(0, 12);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-x-6 gap-y-1 font-mono text-xs text-muted">
        <span>Time <span className="text-fg">{fmtT(remain)}</span></span>
        <span>Inventory <span className={e.pos === 0 ? 'text-open' : 'text-soon'}>{e.pos > 0 ? '+' : ''}{e.pos}</span></span>
        <span>P&amp;L <span className={livePnl >= 0 ? 'text-open' : 'text-closed'}>{livePnl >= 0 ? '+' : ''}{livePnl.toFixed(1)}</span> <span className="text-muted">@ your fair</span></span>
        <span>Best {best ?? '—'}</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-3">
        <div className="flex-1 min-w-0 space-y-3">
          <div className="rounded-lg border border-steel bg-panel overflow-hidden">
            <div className="grid grid-cols-[1fr_1fr_1fr] px-3 py-1 border-b border-steel font-mono text-[10px] uppercase tracking-wide text-muted">
              <span>Time</span><span className="text-right">Price</span><span className="text-right">Size</span>
            </div>
            <div className="h-[150px] overflow-hidden">
              {tape.map((r) => (
                <div key={r.id} className={`grid grid-cols-[1fr_1fr_1fr] px-3 py-[3px] font-mono text-xs ${r.mine ? 'bg-violet/15' : ''}`}>
                  <span className={r.mine ? 'text-violet-light' : 'text-muted'}>{r.mine ? '● ' : ''}{fmtT(r.t)}</span>
                  <span className={`text-right ${r.side === 'buy' ? 'text-open' : 'text-closed'}`}>{r.side === 'buy' ? '▲' : '▼'} {r.price.toFixed(1)}</span>
                  <span className={`text-right ${r.mine ? 'text-violet-light font-bold' : 'text-fg'}`}>{r.size}</span>
                </div>
              ))}
              {tape.length === 0 && <p className="px-3 py-4 font-mono text-xs text-muted">Quiet… watch the book.</p>}
            </div>
          </div>
          <div className="rounded-lg border border-steel bg-panel p-3"><LiveChart e={e} /></div>
        </div>
        <div className="lg:w-56 shrink-0"><Ladder e={e} /></div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="rounded border border-closed/40 bg-bg px-3 py-2">
          <p className="font-mono text-[10px] uppercase tracking-wide text-muted">Your bid</p>
          <p className="font-mono text-lg text-closed">{e.bidRem > 0 ? bid.toFixed(1) : '—'}</p>
          <p className="font-mono text-[10px] text-muted">{e.bidRem > 0 ? `${e.bidRem} left` : 'press R to reload'}</p>
        </div>
        <div className="rounded border border-violet/50 bg-violet/10 px-3 py-2 text-center">
          <p className="font-mono text-[10px] uppercase tracking-wide text-muted">Your fair</p>
          <p className="font-mono text-lg text-violet-light">{e.fair.toFixed(1)}</p>
          <p className="font-mono text-[10px] text-muted">spread {(2 * e.hs).toFixed(1)}</p>
        </div>
        <div className="rounded border border-open/40 bg-bg px-3 py-2 text-right">
          <p className="font-mono text-[10px] uppercase tracking-wide text-muted">Your ask</p>
          <p className="font-mono text-lg text-open">{e.askRem > 0 ? ask.toFixed(1) : '—'}</p>
          <p className="font-mono text-[10px] text-muted">{e.askRem > 0 ? `${e.askRem} left` : 'press R to reload'}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <ControlRow c="fair" label="Fair" hot="F" value={e.fair.toFixed(1)} />
        <ControlRow c="spread" label="Spread" hot="S" value={(2 * e.hs).toFixed(1)} />
        <ControlRow c="size" label="Quote size" hot="Q" value={`${e.size}`} />
        <button type="button" onClick={reload} className="rounded border border-violet/60 text-violet-light hover:bg-violet/15 font-mono text-sm px-3 py-2">Reload <span className="text-violet-light">R</span></button>
      </div>

      <button type="button" className={btn2Cls} onClick={finish}>End run</button>
    </div>
  );
}
