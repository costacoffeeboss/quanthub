/**
 * Black-Scholes-Merton pricing for European options on a non-dividend-paying
 * underlying. Kept dependency-free so it can run in the chapter calculator and
 * back the numeric quiz answers with the same numbers a user would compute.
 */

/** Standard normal PDF. */
export function normPdf(x: number): number {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

/**
 * Standard normal CDF via the Abramowitz & Stegun 7.1.26 erf approximation.
 * Accurate to ~1e-7 — far tighter than anything the quizzes need.
 */
export function normCdf(x: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = normPdf(x);
  const p =
    d *
    t *
    (0.319381530 +
      t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  return x >= 0 ? 1 - p : p;
}

export interface BsInputs {
  spot: number;
  strike: number;
  /** Years to expiry. */
  t: number;
  /** Continuously-compounded risk-free rate (e.g. 0.05 for 5%). */
  r: number;
  /** Annualised volatility (e.g. 0.2 for 20%). */
  vol: number;
}

export interface BsResult {
  d1: number;
  d2: number;
  call: number;
  put: number;
  callDelta: number;
  putDelta: number;
  gamma: number;
  /** Vega per 1.00 (100 vol points) change in vol. Divide by 100 for per-point. */
  vega: number;
  /** Call theta per year. Divide by 365 for per-calendar-day. */
  callTheta: number;
  putTheta: number;
}

export function blackScholes({ spot, strike, t, r, vol }: BsInputs): BsResult {
  const sqrtT = Math.sqrt(Math.max(t, 1e-9));
  const sig = Math.max(vol, 1e-9);
  const d1 = (Math.log(spot / strike) + (r + 0.5 * sig * sig) * t) / (sig * sqrtT);
  const d2 = d1 - sig * sqrtT;
  const disc = Math.exp(-r * t);
  const Nd1 = normCdf(d1);
  const Nd2 = normCdf(d2);

  const call = spot * Nd1 - strike * disc * Nd2;
  const put = strike * disc * normCdf(-d2) - spot * normCdf(-d1);

  const gamma = normPdf(d1) / (spot * sig * sqrtT);
  const vega = spot * normPdf(d1) * sqrtT; // per 1.00 vol
  const callTheta =
    -(spot * normPdf(d1) * sig) / (2 * sqrtT) - r * strike * disc * Nd2;
  const putTheta =
    -(spot * normPdf(d1) * sig) / (2 * sqrtT) + r * strike * disc * normCdf(-d2);

  return {
    d1,
    d2,
    call,
    put,
    callDelta: Nd1,
    putDelta: Nd1 - 1,
    gamma,
    vega,
    callTheta,
    putTheta,
  };
}
