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

/** The word as drawn: `x0` is its left edge, `accentX` is where the last letter (drawn in the brand colour) starts. */
export type WordLook = { text: string; accent: string; font: string; letterSpacing: number; x0: number; accentX: number; y: number };

type RGB = [number, number, number];
const FLY: RGB[] = [[229, 50, 45], [255, 120, 40], [255, 196, 70]]; // red, orange, gold sparks
const WARM_WHITE: RGB = [255, 238, 220];
const ACCENT_REST: RGB = [240, 70, 55];
const mix = (a: RGB, b: RGB, t: number): RGB => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const spark = (t: number): RGB => (t < 0.5 ? mix(FLY[0], FLY[1], t * 2) : mix(FLY[1], FLY[2], (t - 0.5) * 2));

export type WordState = {
  targets: Pt[];
  seeds: { sx: number; sy: number; delay: number; swirl: number; phase: number; fly: RGB; rest: RGB }[];
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
      // each particle starts as a red / orange / gold spark...
      fly: spark(frac(Math.sin(i * 9.173) * 6421.77)),
      // ...and settles warm white, except the last letter which stays in the brand colour
      rest: targets[i].x >= word.accentX ? mix(ACCENT_REST, FLY[1], frac(Math.sin(i * 2.71) * 811.3) * 0.5) : mix(WARM_WHITE, FLY[2], frac(Math.sin(i * 4.31) * 933.1) * 0.35),
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
    // spark colours while flying, settled colour once in place (with a little twinkle)
    const c = mix(s.fly, s.rest, k * k);
    const twinkle = k >= 1 && !st.reduce ? 0.18 * Math.max(0, Math.sin(t * 4 + s.phase * 3)) : 0;
    const r = Math.round(Math.min(255, c[0] + 40 * twinkle));
    const g = Math.round(Math.min(255, c[1] + 60 * twinkle));
    const b = Math.round(Math.min(255, c[2] + 60 * twinkle));
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
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "#f5f5f8";
    ctx.fillText(st.word.text.slice(0, -1), st.word.x0, st.word.y);
    ctx.fillStyle = st.word.accent;
    ctx.fillText(st.word.text.slice(-1), st.word.accentX, st.word.y);
    ctx.globalAlpha = 1;
  }
  return drawn;
}
