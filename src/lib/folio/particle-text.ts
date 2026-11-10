// Splash screen: particles stream in from every side of the screen and settle into the word "Folio".
// Pure maths only (no DOM), so it can be unit tested.

export type Pt = { x: number; y: number };

const frac = (x: number) => x - Math.floor(x);
export const easeOutCubic = (t: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);
export const easeInOutCubic = (t: number) => {
  const x = Math.min(1, Math.max(0, t));
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};

/** Pixels of an RGBA image whose alpha is solid, sampled on a grid of `step` pixels. */
export function sampleMask(data: ArrayLike<number>, width: number, height: number, step: number): Pt[] {
  const pts: Pt[] = [];
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      if ((data[(y * width + x) * 4 + 3] ?? 0) > 128) pts.push({ x, y });
    }
  }
  return pts;
}

/** `count` of the points, spread evenly through the shape (deterministic shuffle, so every run looks the same). */
export function pickPoints(pts: Pt[], count: number): Pt[] {
  if (pts.length <= count) return pts.slice();
  const keyed = pts.map((p, i) => ({ p, k: frac(Math.sin(i * 12.9898) * 43758.5453) }));
  keyed.sort((a, b) => a.k - b.k);
  return keyed.slice(0, count).map((e) => e.p);
}

/** Timeline in seconds. */
export const WORD = {
  gather: 2.0, // how long one particle takes to fly in
  delayMax: 0.8, // spread of start times, so it arrives as a swarm
  textAt: 2.6, // the crisp word starts to fade in over the particles
  textFor: 0.8,
  total: 4.4,
};

export type WordLook = { text: string; font: string; letterSpacing: number; x: number; y: number };

export type WordState = {
  targets: Pt[];
  seeds: { sx: number; sy: number; delay: number; swirl: number; phase: number }[];
  w: number;
  h: number;
  reach: number;
  reduce: boolean;
  word: WordLook;
};

export function makeWordIntro(targets: Pt[], w: number, h: number, reduce: boolean, word: WordLook): WordState {
  const reach = Math.hypot(w, h) / 2;
  const seeds = targets.map((_, i) => {
    const a = frac(Math.sin(i * 12.9898) * 43758.5453) * Math.PI * 2;
    // start beyond the screen edges so particles arrive from every side (and corner)
    const d = reach * (0.9 + 0.45 * frac(Math.sin(i * 39.3468) * 24634.6345));
    return {
      sx: w / 2 + Math.cos(a) * d,
      sy: h / 2 + Math.sin(a) * d,
      delay: frac(Math.sin(i * 78.233) * 12345.6789) * WORD.delayMax,
      swirl: frac(Math.sin(i * 5.123) * 9871.321) * 2 - 1,
      phase: frac(Math.sin(i * 3.917) * 4375.123) * Math.PI * 2,
    };
  });
  return { targets, seeds, w, h, reach, reduce, word };
}

export type WordContext = {
  clearRect(x: number, y: number, w: number, h: number): void;
  beginPath(): void;
  arc(x: number, y: number, r: number, a0: number, a1: number): void;
  fill(): void;
  fillText(text: string, x: number, y: number): void;
  fillStyle: unknown;
  globalAlpha: number;
  font: string;
  textAlign: string;
  textBaseline: string;
  globalCompositeOperation: string;
  letterSpacing?: string;
};

/** Draw one frame. Returns how many particles were drawn. */
export function drawWordIntro(ctx: WordContext, st: WordState, tSeconds: number): number {
  const t = st.reduce ? WORD.total : tSeconds;
  ctx.clearRect(0, 0, st.w, st.h);

  const textA = easeInOutCubic((t - WORD.textAt) / WORD.textFor);
  ctx.globalCompositeOperation = "lighter";
  let drawn = 0;
  for (let i = 0; i < st.targets.length; i++) {
    const s = st.seeds[i];
    const tg = st.targets[i];
    const k = easeOutCubic((t - s.delay) / WORD.gather); // 0 = off screen, 1 = in place
    // fly in a gentle curve, then shimmer a little once in place
    const dx = tg.x - s.sx;
    const dy = tg.y - s.sy;
    const len = Math.hypot(dx, dy) || 1;
    const bend = (1 - k) * k * 4 * s.swirl * st.reach * 0.18;
    const shimmer = k >= 1 && !st.reduce ? 0.7 : 0;
    const x = s.sx + dx * k + (-dy / len) * bend + Math.sin(t * 3 + s.phase) * shimmer;
    const y = s.sy + dy * k + (dx / len) * bend + Math.cos(t * 2.6 + s.phase * 1.7) * shimmer;
    if (!(x > -6 && x < st.w + 6 && y > -6 && y < st.h + 6)) continue;
    const a = (0.3 + 0.7 * k) * (1 - 0.9 * textA);
    if (a <= 0.01) continue;
    // red while flying, warm white once settled
    const r = Math.round(229 + 26 * k);
    const g = Math.round(50 + 190 * k * k);
    const b = Math.round(45 + 195 * k * k);
    ctx.fillStyle = `rgba(${r},${g},${b},${a.toFixed(3)})`;
    ctx.beginPath();
    ctx.arc(x, y, 0.9 + 0.8 * k, 0, Math.PI * 2);
    ctx.fill();
    drawn++;
  }

  // the crisp word fades in as the particles dissolve into it
  ctx.globalCompositeOperation = "source-over";
  if (textA > 0.01) {
    ctx.globalAlpha = textA;
    ctx.font = st.word.font;
    if ("letterSpacing" in ctx) ctx.letterSpacing = `${st.word.letterSpacing}px`;
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "#f5f5f8";
    ctx.fillText(st.word.text, st.word.x, st.word.y);
    ctx.globalAlpha = 1;
  }
  return drawn;
}
