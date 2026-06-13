/**
 * Independent verification of numeric answers in the question bank.
 * Exact enumeration where feasible, Monte Carlo elsewhere.
 * Run: node scripts/verify-questions.mjs
 */

let pass = 0;
let fail = 0;
const failures = [];

function check(id, label, got, expected, tol = 1e-9) {
  const ok = Math.abs(got - expected) <= tol;
  if (ok) pass++;
  else {
    fail++;
    failures.push(`${id} [${label}]: got ${got}, expected ${expected}`);
  }
}

const C = (n, k) => {
  if (k < 0 || k > n) return 0;
  let r = 1;
  for (let i = 0; i < k; i++) r = (r * (n - i)) / (i + 1);
  return Math.round(r);
};
const rand = Math.random;
const d6 = () => 1 + Math.floor(rand() * 6);

// ---------- PROBABILITY ----------
check('p2-sum-seven', 'P(sum 7)', 6 / 36, 1 / 6);
{
  // three coins ≥2 heads
  let n = 0;
  for (let m = 0; m < 8; m++) if (((m & 1) + ((m >> 1) & 1) + ((m >> 2) & 1)) >= 2) n++;
  check('p2-three-coins', 'count', n / 8, 0.5);
}
check('p2-exactly-three-rolls', 'geometric', (5 / 6) ** 2 * (1 / 6), 25 / 216);
{
  // no adjacent heads, n=3 → 5; n=10 → F(12)=144
  const noHH = (n) => {
    let count = 0;
    for (let m = 0; m < 1 << n; m++) {
      let ok = true;
      for (let i = 0; i + 1 < n; i++) if ((m >> i) & 1 && (m >> (i + 1)) & 1) ok = false;
      if (ok) count++;
    }
    return count;
  };
  check('p2-no-adjacent-heads', 'n=3', noHH(3), 5);
  check('c2-no-eleven', 'n=10', noHH(10), 144);
  // streak of ≥3 heads in 5 flips → 8/32
  let streak = 0;
  for (let m = 0; m < 32; m++) {
    for (let i = 0; i + 2 < 5; i++)
      if ((m >> i) & 1 && (m >> (i + 1)) & 1 && (m >> (i + 2)) & 1) {
        streak++;
        break;
      }
  }
  check('p2-streak-three', 'count', streak, 8);
}
check('p2-two-aces', 'cards', (4 / 52) * (3 / 51), 1 / 221);
check('p2-ace-king', 'cards', 2 * (4 / 52) * (4 / 51), 8 / 663);
check('p2-one-pair', 'poker', (13 * C(4, 2) * C(12, 3) * 64) / C(52, 5), 0.42256903, 1e-6);
{
  // gambler's ruin from 1 aiming 3 — exact linear solve says 1/3; MC confirm
  let wins = 0;
  const N = 200000;
  for (let t = 0; t < N; t++) {
    let x = 1;
    while (x > 0 && x < 3) x += rand() < 0.5 ? 1 : -1;
    if (x === 3) wins++;
  }
  check('p2-gamblers-ruin', 'MC', wins / N, 1 / 3, 0.01);
}
{
  // plane seat MC
  let ok = 0;
  const N = 100000;
  for (let t = 0; t < N; t++) {
    const free = new Set(Array.from({ length: 100 }, (_, i) => i));
    const first = Math.floor(rand() * 100);
    free.delete(first);
    let lastGetsOwn = true;
    for (let p = 1; p < 100; p++) {
      if (free.has(p)) {
        free.delete(p);
      } else {
        const arr = [...free];
        const pick = arr[Math.floor(rand() * arr.length)];
        free.delete(pick);
        if (p === 99) lastGetsOwn = pick === 99;
      }
    }
    if (free.size === 0 && lastGetsOwn) ok++;
  }
  check('p2-plane-seat', 'MC', ok / N, 0.5, 0.01);
}
check('p2-four-suits', 'suits', 13 ** 4 / C(52, 4), 0.105498, 1e-5);
{
  // Tuesday boy: enumerate 14x14 ordered pairs
  let cond = 0,
    both = 0;
  for (let a = 0; a < 14; a++)
    for (let b = 0; b < 14; b++) {
      const aTB = a === 0; // boy born Tuesday encoded as type 0; types 0-6 boys, 7-13 girls
      const bTB = b === 0;
      if (aTB || bTB) {
        cond++;
        if (a < 7 && b < 7) both++;
      }
    }
  check('p2-tuesday-boy', 'enumeration', both / cond, 13 / 27);
}
{
  // stick triangle MC
  let ok = 0;
  const N = 400000;
  for (let t = 0; t < N; t++) {
    const x = rand(),
      y = rand();
    const u = Math.min(x, y),
      v = Math.max(x, y);
    const a = u,
      b = v - u,
      c = 1 - v;
    if (a < 0.5 && b < 0.5 && c < 0.5) ok++;
  }
  check('p2-stick-triangle', 'MC', ok / N, 0.25, 0.005);
}
{
  let p = 1;
  for (let k = 0; k < 50; k++) p *= (365 - k) / 365;
  check('p2-fifty-birthday', 'exact', 1 - p, 0.9704, 1e-3);
  let p23 = 1;
  for (let k = 0; k < 23; k++) p23 *= (365 - k) / 365;
  check('p-birthday', 'n=23 over half', 1 - p23, 0.5073, 1e-3);
}
check('p2-all-faces-six', '6!/6^6', 720 / 46656, 0.01543, 1e-4);
check('p2-two-coin-bayes', 'odds', 4 / 5, 1 / (1 + 1 / 4));
check('p2-uniform-sum', 'P<1', 0.5, 0.5);
check('p2-uniform-sum', 'P<1/2', 0.5 * 0.5 * 0.5, 1 / 8);
check('p2-meeting', 'band area', 1 - (45 / 60) ** 2, 7 / 16);
check('p2-binomial-ten', 'C(10,5)/1024', C(10, 5) / 1024, 252 / 1024);
check('p2-three-girls', '1/(2^3-1)', 1 / 7, 1 / 7);
{
  // second card ace via conditioning
  const p = (4 / 52) * (3 / 51) + (48 / 52) * (4 / 51);
  check('p2-second-ace', 'conditioning', p, 1 / 13);
}
check('p2-higher-roll', 'ties', (36 - 6) / 2 / 36, 5 / 12);
check('p2-all-different', '3 dice', (6 * 5 * 4) / 216, 5 / 9);
check('p2-de-mere', '24 rolls', 1 - (35 / 36) ** 24, 0.4914, 1e-3);
{
  // Penney TH before HH — MC
  let th = 0;
  const N = 200000;
  for (let t = 0; t < N; t++) {
    let prev = rand() < 0.5 ? 'H' : 'T';
    let cur;
    for (;;) {
      cur = rand() < 0.5 ? 'H' : 'T';
      if (prev === 'T' && cur === 'H') {
        th++;
        break;
      }
      if (prev === 'H' && cur === 'H') break;
      prev = cur;
    }
  }
  check('p2-penney', 'MC', th / N, 0.75, 0.01);
}
check('p2-same-colour-urn', 'urn', (C(3, 2) + C(2, 2)) / C(5, 2), 2 / 5);
{
  // derangements via formula and brute force n=4, n=5
  const derange = (n) => {
    const perm = Array.from({ length: n }, (_, i) => i);
    let count = 0;
    const go = (arr, used, pos) => {
      if (pos === n) {
        count++;
        return;
      }
      for (const v of perm)
        if (!used.has(v) && v !== pos) {
          used.add(v);
          go(arr, used, pos + 1);
          used.delete(v);
        }
    };
    go([], new Set(), 0);
    return count;
  };
  check('p2-derangements', 'D4', derange(4), 9);
  check('c2-derangement-five', 'D5', derange(5), 44);
}
{
  // three dice sum 12 → 25 ways; sum 9 → 25 ways (symmetry)
  let w12 = 0,
    w9 = 0;
  for (let a = 1; a <= 6; a++)
    for (let b = 1; b <= 6; b++)
      for (let c = 1; c <= 6; c++) {
        if (a + b + c === 12) w12++;
        if (a + b + c === 9) w9++;
      }
  check('p2-three-dice-twelve', 'ways', w12, 25);
  check('p2-three-dice-twelve', 'symmetry', w9, 25);
}
{
  let n = 0;
  for (let i = 1; i <= 1000; i++) if (i % 3 === 0 || i % 5 === 0) n++;
  check('p2-div-three-five', 'count', n, 467);
}
{
  // even heads exact for n=1..8
  for (let n = 1; n <= 8; n++) {
    let even = 0;
    for (let m = 0; m < 1 << n; m++) {
      let bits = 0;
      for (let i = 0; i < n; i++) bits += (m >> i) & 1;
      if (bits % 2 === 0) even++;
    }
    check('p2-even-heads', `n=${n}`, even / (1 << n), 0.5);
  }
}
{
  // amoeba extinction MC (cap population/steps)
  let extinct = 0;
  const N = 50000;
  for (let t = 0; t < N; t++) {
    let pop = 1;
    let steps = 0;
    while (pop > 0 && pop < 500 && steps < 400) {
      let next = 0;
      for (let i = 0; i < pop; i++) next += rand() < 1 / 3 ? 0 : 2;
      pop = next;
      steps++;
    }
    if (pop === 0) extinct++;
  }
  check('p2-amoeba', 'MC', extinct / N, 0.5, 0.01);
}
check('p2-sock-pair', 'socks', 9 / 19, 9 / 19);
check('p2-two-sixes-four-rolls', 'binomial', (C(4, 2) * 25) / 1296, 150 / 1296);

// ---------- EXPECTED VALUE ----------
check('ev2-kth-head', 'negative binomial k=3', 3 / 0.5, 6);
check('ev2-distinct-faces', 'formula', 6 * (1 - (5 / 6) ** 6), 3.9906, 1e-3);
{
  // first ace position MC
  let sum = 0;
  const N = 100000;
  for (let t = 0; t < N; t++) {
    const deck = Array.from({ length: 52 }, (_, i) => i < 4);
    for (let i = 51; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    sum += deck.indexOf(true) + 1;
  }
  check('ev2-first-ace', 'MC', sum / N, 10.6, 0.05);
}
{
  // ant on cube MC
  // distance classes: 3 -> 2 -> {1,3} ...; simulate on coordinates
  let total = 0;
  const N = 100000;
  for (let t = 0; t < N; t++) {
    let v = [0, 0, 0];
    let steps = 0;
    while (!(v[0] === 1 && v[1] === 1 && v[2] === 1)) {
      const axis = Math.floor(rand() * 3);
      v[axis] ^= 1;
      steps++;
    }
    total += steps;
  }
  check('ev2-ant-cube', 'MC', total / N, 10, 0.1);
}
check('ev2-max-uniforms', 'n/(n+1), n=4', 4 / 5, 0.8);
check('ev2-birthday-pairs', 'C(23,2)/365', C(23, 2) / 365, 0.6932, 1e-3);
{
  // roll-fee game: threshold strategies
  const valueOfThreshold = (keepMin) => {
    // E[rolls] = 1/p where p = (7-keepMin)/6 ; E[kept | keep] = mean of keepMin..6
    const p = (7 - keepMin) / 6;
    const kept = (keepMin + 6) / 2;
    return kept - 1 / p;
  };
  check('ev2-roll-fee', 'keep>=4', valueOfThreshold(4), 3);
  check('ev2-roll-fee', 'keep>=3', valueOfThreshold(3), 3);
  check('ev2-roll-fee', 'keep>=5', valueOfThreshold(5), 2.5);
}
{
  // two consecutive sixes MC
  let total = 0;
  const N = 100000;
  for (let t = 0; t < N; t++) {
    let prevSix = false;
    let rolls = 0;
    for (;;) {
      rolls++;
      const six = d6() === 6;
      if (six && prevSix) break;
      prevSix = six;
    }
    total += rolls;
  }
  check('ev2-two-consec-sixes', 'MC', total / N, 42, 0.5);
}
{
  let s = 0;
  for (let i = 1; i <= 6; i++) for (let j = 1; j <= 6; j++) s += Math.abs(i - j);
  check('ev2-abs-diff', 'exact', s / 36, 35 / 18);
  // cross-check E[max]-E[min] identity
  let mx = 0,
    mn = 0;
  for (let i = 1; i <= 6; i++)
    for (let j = 1; j <= 6; j++) {
      mx += Math.max(i, j);
      mn += Math.min(i, j);
    }
  check('ev-max-two-dice', 'E[max]', mx / 36, 161 / 36);
  check('ev2-abs-diff', 'identity', (mx - mn) / 36, 35 / 18);
}
check('ev2-product-dice', 'independence', 3.5 * 3.5, 12.25);
{
  // fixed points MC n=10
  let total = 0;
  const N = 100000;
  for (let t = 0; t < N; t++) {
    const a = Array.from({ length: 10 }, (_, i) => i);
    for (let i = 9; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    total += a.filter((v, i) => v === i).length;
  }
  check('ev2-fixed-points', 'MC', total / N, 1, 0.02);
}
{
  // sum until first six MC
  let total = 0;
  const N = 200000;
  for (let t = 0; t < N; t++) {
    let s = 0;
    for (;;) {
      const r = d6();
      s += r;
      if (r === 6) break;
    }
    total += s;
  }
  check('ev2-sum-until-six', 'Wald MC', total / N, 21, 0.15);
}
{
  // records H_10
  let H = 0;
  for (let k = 1; k <= 10; k++) H += 1 / k;
  let total = 0;
  const N = 100000;
  for (let t = 0; t < N; t++) {
    let max = -Infinity,
      rec = 0;
    for (let k = 0; k < 10; k++) {
      const v = rand();
      if (v > max) {
        max = v;
        rec++;
      }
    }
    total += rec;
  }
  check('ev2-records', 'MC vs H_10', total / N, H, 0.02);
}
{
  const ev = (-125 + 75 + 2 * 15 + 3 * 1) / 216;
  check('ev2-chuck-a-luck', 'exact', ev, -17 / 216);
}
check('ev2-three-seen', 'coupon tail', 6 / 3 + 6 / 2 + 6 / 1, 11);
{
  const n = 100;
  check('ev2-empty-boxes', 'formula n=100', n * (1 - 1 / n) ** n, 36.6, 0.1);
}
check('ev2-die-square', 'E[X^2]', (1 + 4 + 9 + 16 + 25 + 36) / 6, 91 / 6);
{
  // HTH wait MC + Conway check
  let total = 0;
  const N = 100000;
  for (let t = 0; t < N; t++) {
    let s = '';
    let flips = 0;
    for (;;) {
      flips++;
      s = (s + (rand() < 0.5 ? 'H' : 'T')).slice(-3);
      if (s === 'HTH') break;
    }
    total += flips;
  }
  check('ev2-hth-wait', 'MC', total / N, 10, 0.1);
}
{
  // stick three pieces MC
  let mn = 0,
    md = 0,
    mx = 0;
  const N = 300000;
  for (let t = 0; t < N; t++) {
    const x = rand(),
      y = rand();
    const u = Math.min(x, y),
      v = Math.max(x, y);
    const parts = [u, v - u, 1 - v].sort((a, b) => a - b);
    mn += parts[0];
    md += parts[1];
    mx += parts[2];
  }
  check('ev2-stick-three-pieces', 'min', mn / N, 1 / 9, 0.003);
  check('ev2-stick-three-pieces', 'mid', md / N, 5 / 18, 0.003);
  check('ev2-stick-three-pieces', 'max', mx / N, 11 / 18, 0.003);
}
check('ev2-ht-count', '99/4', 99 / 4, 24.75);
{
  // expected people until birthday collision MC
  let total = 0;
  const N = 50000;
  for (let t = 0; t < N; t++) {
    const seen = new Set();
    let n = 0;
    for (;;) {
      n++;
      const b = Math.floor(rand() * 365);
      if (seen.has(b)) break;
      seen.add(b);
    }
    total += n;
  }
  check('ev2-expected-people-birthday', 'MC', total / N, 24.6, 0.2);
}
{
  // legacy reroll games MC
  const N = 300000;
  let v1 = 0,
    v2 = 0;
  for (let t = 0; t < N; t++) {
    const r1 = d6();
    v1 += r1 >= 4 ? r1 : d6();
    // two rerolls: keep first if >=5, else play one-reroll game
    const a = d6();
    if (a >= 5) v2 += a;
    else {
      const b = d6();
      v2 += b >= 4 ? b : d6();
    }
  }
  check('ev-die-reroll', 'one reroll MC', v1 / N, 4.25, 0.02);
  check('ev-die-reroll', 'two rerolls MC', v2 / N, 14 / 3, 0.02);
  // coupon collector 6 faces
  let total = 0;
  for (let t = 0; t < 100000; t++) {
    const seen = new Set();
    let rolls = 0;
    while (seen.size < 6) {
      seen.add(d6());
      rolls++;
    }
    total += rolls;
  }
  check('ev-coupon', 'MC', total / 100000, 14.7, 0.1);
  // stick break legacy
  let shorter = 0,
    ratio = 0;
  for (let t = 0; t < 300000; t++) {
    const u = rand();
    const s = Math.min(u, 1 - u);
    shorter += s;
    ratio += s / (1 - s);
  }
  check('ev-stick-break', 'E[shorter] MC', shorter / 300000, 0.25, 0.003);
  check('ev-stick-break', 'E[ratio] MC', ratio / 300000, 2 * Math.LN2 - 1, 0.005);
}

// ---------- COMBINATORICS ----------
{
  // MISSISSIPPI
  const f = (n) => {
    let r = 1;
    for (let i = 2; i <= n; i++) r *= i;
    return r;
  };
  check('c2-mississippi', 'multinomial', f(11) / (f(4) * f(4) * f(2)), 34650);
}
check('c2-stars-bars', 'free', C(12, 2), 66);
check('c2-stars-bars', 'positive', C(9, 2), 36);
check('c2-not-adjacent', 'complement', 120 - 2 * 24, 72);
{
  // committee enumeration
  let n = 0;
  // 7 men (bits 0-6), 5 women (bits 7-11)
  for (let m = 0; m < 1 << 12; m++) {
    let bits = 0,
      women = 0;
    for (let i = 0; i < 12; i++)
      if ((m >> i) & 1) {
        bits++;
        if (i >= 7) women++;
      }
    if (bits === 5 && women >= 2) n++;
  }
  check('c2-committee', 'enumeration', n, 596);
}
check('c2-catalan', 'C4', C(8, 4) / 5, 14);
check('c2-diagonals', '20-gon', (20 * 17) / 2, 170);
{
  // domino tiling 2xn
  const T = [0, 1, 2];
  for (let n = 3; n <= 10; n++) T[n] = T[n - 1] + T[n - 2];
  check('c2-domino-tiling', '2x10', T[10], 89);
  check('c-staircase', '10 stairs', T[10], 89);
}
{
  let lhs = 0;
  for (let k = 0; k <= 5; k++) lhs += k * C(5, k);
  check('c2-captain', 'identity n=5', lhs, 5 * 2 ** 4);
}
check('c2-functions', 'functions', 5 ** 3, 125);
check('c2-functions', 'injections', 5 * 4 * 3, 60);
{
  let n = 0;
  const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
  for (let i = 1; i <= 100; i++) if (gcd(i, 100) === 1) n++;
  check('c2-totient', 'phi(100)', n, 40);
}
{
  let ways = 0;
  for (let a = 0; a * 50 <= 100; a++)
    for (let b = 0; a * 50 + b * 20 <= 100; b++)
      if ((100 - a * 50 - b * 20) % 10 === 0) ways++;
  check('c2-make-a-pound', 'enumeration', ways, 10);
}
check('c2-two-teams', 'halved', C(10, 5) / 2, 126);
check('c2-dominoes', 'multichoose', C(7, 2) + 7, 28);
check('c2-dominoes', 'formula', C(8, 2), 28);
check('c2-eight-bits', 'exactly 3', C(8, 3), 56);
check('c2-eight-bits', 'at least 6', C(8, 6) + C(8, 7) + C(8, 8), 37);
check('c2-blocked-path', 'subtract', C(8, 4) - C(4, 2) ** 2, 34);
{
  // vowels together in QUANT: enumerate permutations
  const letters = ['Q', 'U', 'A', 'N', 'T'];
  let together = 0,
    total = 0;
  const permute = (arr, k) => {
    if (k === arr.length) {
      total++;
      const s = arr.join('');
      const iu = s.indexOf('U'),
        ia = s.indexOf('A');
      if (Math.abs(iu - ia) === 1) together++;
      return;
    }
    for (let i = k; i < arr.length; i++) {
      [arr[k], arr[i]] = [arr[i], arr[k]];
      permute(arr, k + 1);
      [arr[k], arr[i]] = [arr[i], arr[k]];
    }
  };
  permute([...letters], 0);
  check('c2-vowels-together', 'enumeration', together, 48);
  check('c2-vowels-together', 'total', total, 120);
}
{
  // surjections 5 -> 3 by enumeration
  let n = 0;
  for (let m = 0; m < 3 ** 5; m++) {
    let x = m;
    const hit = [false, false, false];
    for (let i = 0; i < 5; i++) {
      hit[x % 3] = true;
      x = Math.floor(x / 3);
    }
    if (hit[0] && hit[1] && hit[2]) n++;
  }
  check('c2-surjections', 'enumeration', n, 150);
}
{
  // trailing zeros of 100!
  let fives = 0;
  for (let i = 5; i <= 100; i += 5) {
    let x = i;
    while (x % 5 === 0) {
      fives++;
      x /= 5;
    }
  }
  check('c-trailing-zeros', 'count', fives, 24);
}
check('c-grid-paths', 'C(10,5)', C(10, 5), 252);
check('c-handshakes', 'C(10,2)', C(10, 2), 45);

// ---------- MENTAL MATH ----------
check('m2-25x48', '', 25 * 48, 1200);
check('m2-998x7', '', 998 * 7, 6986);
check('m2-45-squared', '', 45 * 45, 2025);
check('m2-near-twenty', '21x19', 21 * 19, 399);
check('m2-near-twenty', '32x28', 32 * 28, 896);
check('m2-1-25x88', '', 1.25 * 88, 110);
check('m2-144-16', '', 144 / 16, 9);
check('m2-35-percent', '', 0.35 * 80, 28);
check('m2-percent-swap', '', 0.18 * 50, 9);
check('m2-three-eighths', '', 3 / 8, 0.375);
check('m2-elevenths', '', 4 / 11, 0.363636, 1e-5);
check('m2-seven-twelfths', '', 7 / 12, 0.58333, 1e-4);
check('m2-rule-72', 'exact doubling at 8%', Math.log(2) / Math.log(1.08), 9.006, 1e-2);
check('m2-powers-of-two', '2^20', 2 ** 20, 1048576);
check('m2-root-estimates', 'sqrt50', Math.sqrt(50), 7.071, 1e-3);
check('m2-left-to-right', '', 4738 + 2659, 7397);
check('m2-subtraction-complement', '', 8421 - 3567, 4854);
check('m2-units-ten', '23x27', 23 * 27, 621);
check('m2-units-ten', '62x68', 62 * 68, 4216);
check('m2-units-ten', '91x99', 91 * 99, 9009);
check('m2-96x104', '', 96 * 104, 9984);
check('m2-96x104', '97x106', 97 * 106, 10282);
check('m2-divisibility', 'factorisation', 3 * 11 * 11 * 13, 4719);
check('m2-fraction-chain', '', (2 / 3) * (3 / 4) * 96, 48);
check('m2-compound-ten', '1.1^3', 1.1 ** 3, 1.331, 1e-9);
check('m2-compound-ten', '0.9^3', 0.9 ** 3, 0.729, 1e-9);
check('m2-point-two-percent', '', 0.002 * 45000, 90);
check('m2-17x6', '', 17 * 6, 102);
check('m2-estimate-product', 'exact', 412 * 39, 16068);
check('m2-decimal-times-decimal', '', 0.4 * 3.5, 1.4);
check('m2-time-zones', '', 3.5 * 3600, 12600);
check('m-17x24', '', 17 * 24, 408);
check('m-square-95', '', 95 * 95, 9025);
check('m-sevenths', '3/7', 3 / 7, 0.428571, 1e-5);
check('m-percent-chain', '', 1.2 * 0.8, 0.96);

// ---------- LOGIC ----------
{
  // two eggs: verify 14-drop plan covers 100 floors
  const drops = [14, 27, 39, 50, 60, 69, 77, 84, 90, 95, 99, 100];
  let worst = 0;
  for (let T = 1; T <= 101; T++) {
    // T = lowest breaking floor (101 = never breaks)
    let cost = 0;
    let prev = 0;
    let found = false;
    for (const f of drops) {
      cost++;
      if (f >= T) {
        // first egg broke at f; walk prev+1 .. f-1
        cost += Math.max(0, f - 1 - prev);
        found = true;
        break;
      }
      prev = f;
    }
    if (!found) {
      /* survived all: T=101, no extra cost */
    }
    worst = Math.max(worst, cost);
  }
  check('l2-two-eggs', 'worst case', worst, 14);
}
{
  // hundred boxes loop strategy MC
  let ok = 0;
  const N = 20000;
  for (let t = 0; t < N; t++) {
    const perm = Array.from({ length: 100 }, (_, i) => i);
    for (let i = 99; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [perm[i], perm[j]] = [perm[j], perm[i]];
    }
    // success iff no cycle longer than 50
    const seen = new Array(100).fill(false);
    let good = true;
    for (let i = 0; i < 100; i++) {
      if (seen[i]) continue;
      let len = 0,
        j = i;
      while (!seen[j]) {
        seen[j] = true;
        j = perm[j];
        len++;
      }
      if (len > 50) {
        good = false;
        break;
      }
    }
    if (good) ok++;
  }
  check('l2-hundred-boxes', 'MC', ok / N, 0.3118, 0.015);
}
check('l2-clock-hands', 'minutes past 3', 90 / 5.5, 180 / 11, 1e-9);
check('l2-fly-trains', 'distance', (150 / (50 + 25)) * 100, 200);
{
  // camel bananas phases
  const leg1 = 1000 / 5; // 200 km at 5/km burns 1000
  const leg2 = 1000 / 3; // 333.33 km at 3/km burns 1000
  const remaining = 1000 - leg1 - leg2;
  const delivered = 1000 - remaining;
  check('l2-camel-bananas', 'delivered', Math.floor(delivered), 533);
}
{
  // ages: factor triples of 36, find ambiguous sum
  const triples = [];
  for (let a = 1; a <= 36; a++)
    for (let b = a; b <= 36; b++)
      for (let c = b; c <= 36; c++) if (a * b * c === 36) triples.push([a, b, c]);
  const sums = {};
  for (const t of triples) {
    const s = t[0] + t[1] + t[2];
    sums[s] = (sums[s] || 0) + 1;
  }
  const ambiguous = Object.entries(sums).filter(([, n]) => n > 1);
  check('l2-ages-36', 'one ambiguous sum', ambiguous.length, 1);
  check('l2-ages-36', 'sum is 13', Number(ambiguous[0][0]), 13);
}
{
  // dark coins invariance: random states, protocol always equalises
  let allOk = 1;
  for (let t = 0; t < 1000; t++) {
    const coins = new Array(100).fill(false);
    // place 10 heads randomly
    const idx = Array.from({ length: 100 }, (_, i) => i);
    for (let i = 99; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [idx[i], idx[j]] = [idx[j], idx[i]];
    }
    for (let i = 0; i < 10; i++) coins[idx[i]] = true;
    // take first 10 positions (arbitrary), flip them
    const groupA = coins.slice(0, 10).map((c) => !c);
    const groupB = coins.slice(10);
    const headsA = groupA.filter(Boolean).length;
    const headsB = groupB.filter(Boolean).length;
    if (headsA !== headsB) allOk = 0;
  }
  check('l2-dark-coins', 'invariant', allOk, 1);
}
check('l2-poison-wine', '2^10', 2 ** 10 >= 1000 ? 1 : 0, 1);
check('l2-rope-earth', 'gap', 1 / (2 * Math.PI), 0.159, 1e-3);

// ---------- STATISTICS ----------
check('st-die-variance', 'Var', 91 / 6 - 3.5 ** 2, 35 / 12);
check('st-sd-coins', 'sigma', Math.sqrt(100 * 0.25), 5);
{
  // P(X >= 60) for Binomial(100, 0.5)
  let p = 0;
  // log-space for safety
  const logC = (n, k) => {
    let s = 0;
    for (let i = 0; i < k; i++) s += Math.log(n - i) - Math.log(i + 1);
    return s;
  };
  for (let k = 60; k <= 100; k++) p += Math.exp(logC(100, k) + 100 * Math.log(0.5));
  check('st-sixty-heads', 'P(>=60)', p, 0.0284, 5e-3);
}
check('st-portfolio-variance', 'rho 0', Math.sqrt(200), 14.142, 1e-2);
check('st-portfolio-variance', 'rho 0.5', Math.sqrt(300), 17.32, 1e-2);
{
  // german tank estimator MC: unbiased-ish for N=100, k=5
  let sum = 0;
  const N = 100,
    k = 5,
    T = 50000;
  for (let t = 0; t < T; t++) {
    const seen = new Set();
    while (seen.size < k) seen.add(1 + Math.floor(rand() * N));
    const m = Math.max(...seen);
    sum += m * (1 + 1 / k) - 1;
  }
  check('st-german-tank', 'MC mean ~ N', sum / T, 100, 0.5);
}
{
  // max of 100 normals MC (Box-Muller)
  let sum = 0;
  const T = 20000;
  for (let t = 0; t < T; t++) {
    let mx = -Infinity;
    for (let i = 0; i < 100; i++) {
      const z = Math.sqrt(-2 * Math.log(rand() || 1e-12)) * Math.cos(2 * Math.PI * rand());
      if (z > mx) mx = z;
    }
    sum += mx;
  }
  check('st-max-normals', 'MC n=100', sum / T, 2.5, 0.05);
}

// ---------- OPTIONS & FINANCE ----------
{
  // parity arb: conversion locks in 2 across terminal prices
  for (const S of [0, 50, 100, 150, 300]) {
    const callPayout = -Math.max(0, S - 100); // short call
    const putPayout = Math.max(0, 100 - S);
    const stock = S;
    const total = callPayout + putPayout + stock; // should be 100 always
    check('of-parity-arb', `S=${S}`, total, 100);
  }
  check('of-parity-arb', 'profit', 100 - (100 + 6 - 8), 2);
}
check('of-apr-apy', '12% monthly', (1.01 ** 12 - 1) * 100, 12.6825, 1e-3);
check('of-apr-apy', 'continuous', (Math.exp(0.12) - 1) * 100, 12.7497, 1e-3);
check('of-breakeven-vol', '0.4 S sigma', 8 / (0.4 * 100), 0.2);
check('of-vol-scaling', 'sqrt252', Math.sqrt(252), 15.87, 1e-2);
check('of-forward-price', '100e^0.05', 100 * Math.exp(0.05), 105.127, 1e-2);
check('of-bond-duration', 'linear', -10 * 0.005, -0.05);
check('of-leverage-margin', 'equity hit', (-0.1 * 100) / 20, -0.5);
{
  // acquirer's curse MC: bid 60, expected profit = -0.25 * 60 ... per accepted? per offer.
  let profit = 0;
  const T = 200000;
  const b = 60;
  for (let t = 0; t < T; t++) {
    const v = rand() * 100;
    if (v <= b) profit += 1.5 * v - b;
  }
  // expected per-offer profit = P(accept) * (0.75b - b) = (b/100)*(-0.25b) = -9 for b=60
  check('mm2-acquirer', 'MC bid 60', profit / T, -9, 0.3);
}
check('mm2-sum-three-dice', 'sigma', Math.sqrt(3 * (35 / 12)), 2.958, 1e-2);
check('mm2-100-coins-market', 'sigma', Math.sqrt(25), 5);
{
  // straddle expected |move| identity: E|Z| = sigma sqrt(2/pi)
  let s = 0;
  const T = 200000;
  for (let t = 0; t < T; t++) {
    const z = Math.sqrt(-2 * Math.log(rand() || 1e-12)) * Math.cos(2 * Math.PI * rand());
    s += Math.abs(z);
  }
  check('of-straddle-daily-move', 'E|Z|', s / T, Math.sqrt(2 / Math.PI), 0.01);
}
{
  // forward vol from term structure: sqrt((25^2*3 - 35^2*1)/2)
  check('of-vol-smile-read', 'forward vol', Math.sqrt((625 * 3 - 1225) / 2), 18.03, 0.1);
}

// ---------- REPORT ----------
console.log(`\n${pass} checks passed, ${fail} failed.`);
if (failures.length) {
  console.log('\nFAILURES:');
  for (const f of failures) console.log('  ✗ ' + f);
  process.exit(1);
}
