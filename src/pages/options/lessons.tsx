import type { ReactNode } from 'react';
import Basics from './chapters/basics';
import Parity from './chapters/parity';
import Greeks from './chapters/greeks';
import BlackScholes from './chapters/blackScholes';
import Volatility from './chapters/volatility';
import Hedging from './chapters/hedging';
import Structures from './chapters/structures';

/**
 * Registry mapping a chapter id to its lesson body. Each chapter lives in its
 * own file under ./chapters for readability; this file just wires them up to
 * the ids declared in src/data/optionsCourse.ts.
 */
export const lessons: Record<string, ReactNode> = {
  basics: <Basics />,
  parity: <Parity />,
  greeks: <Greeks />,
  'black-scholes': <BlackScholes />,
  volatility: <Volatility />,
  hedging: <Hedging />,
  structures: <Structures />,
};
