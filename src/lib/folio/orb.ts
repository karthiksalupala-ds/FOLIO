// Pure maths for the splash-screen particle orb (kept free of DOM so it can be unit tested).

export type Vec3 = { x: number; y: number; z: number };

/** `n` points spread evenly over the surface of a unit sphere (Fibonacci / golden-angle lattice). */
export function fibonacciSphere(n: number): Vec3[] {
  const pts: Vec3[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = n === 1 ? 0 : 1 - (i / (n - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const a = golden * i;
    pts.push({ x: Math.cos(a) * r, y, z: Math.sin(a) * r });
  }
  return pts;
}

/** Rotate around Y by `ry`, then around X by `rx`. */
export function rotate(p: Vec3, ry: number, rx: number): Vec3 {
  const cy = Math.cos(ry),
    sy = Math.sin(ry);
  const x1 = p.x * cy + p.z * sy;
  const z1 = -p.x * sy + p.z * cy;
  const cx = Math.cos(rx),
    sx = Math.sin(rx);
  return { x: x1, y: p.y * cx - z1 * sx, z: p.y * sx + z1 * cx };
}

/** Perspective projection. `depth` is 0 (far side) to 1 (near side) for shading. */
export function project(p: Vec3, radius: number, cx: number, cy: number, focal = 3) {
  // Scattered particles can sit far beyond the focal plane; never let the divisor reach zero or go negative.
  const k = focal / Math.max(0.6, focal - p.z);
  return { x: cx + p.x * radius * k, y: cy + p.y * radius * k, scale: k, depth: (p.z + 1) / 2 };
}

export const easeInOutCubic = (t: number) => {
  const x = Math.min(1, Math.max(0, t));
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};

export const easeOutCubic = (t: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);

export type OrbContext = {
  clearRect(x: number, y: number, w: number, h: number): void;
  createRadialGradient(x0: number, y0: number, r0: number, x1: number, y1: number, r1: number): { addColorStop(o: number, c: string): void };
  beginPath(): void;
  arc(x: number, y: number, r: number, a0: number, a1: number): void;
  fill(): void;
  fillStyle: unknown;
  globalCompositeOperation: string;
};

/** Timeline of the intro, in seconds. */
export const INTRO = {
  gather: 2.0, // particles fly in from every side and form a big orb
  delayMax: 0.7, // spread of start times so it feels like a swarm
  shrinkAt: 1.9, // the big orb starts shrinking towards its resting place
  shrinkFor: 1.5,
  total: 4.6,
};

export type IntroState = {
  points: Vec3[];
  seeds: { sx: number; sy: number; delay: number; swirl: number }[];
  /** Screen size in CSS pixels. */
  w: number;
  h: number;
  /** Where the small orb ends up (CSS pixels): under the wordmark. */
  rest: { cx: number; cy: number; r: number };
  /** Radius of the big orb that fills the screen. */
  big: number;
  reduce: boolean;
};

const frac = (x: number) => x - Math.floor(x);

export function makeIntro(count: number, w: number, h: number, rest: { cx: number; cy: number; r: number }, reduce: boolean): IntroState {
  const points = fibonacciSphere(count);
  const reach = Math.hypot(w, h) / 2;
  const seeds = points.map((_, i) => {
    const a = frac(Math.sin(i * 12.9898) * 43758.5453) * Math.PI * 2;
    const d = reach * (0.85 + 0.4 * frac(Math.sin(i * 39.3468) * 24634.6345)); // beyond the screen edges: arrives from all sides
    return {
      sx: w / 2 + Math.cos(a) * d,
      sy: h / 2 + Math.sin(a) * d,
      delay: frac(Math.sin(i * 78.233) * 12345.6789) * INTRO.delayMax,
      swirl: frac(Math.sin(i * 5.123) * 9871.321) * 2 - 1,
    };
  });
  return { points, seeds, w, h, rest, big: Math.max(w, h) * 0.4, reduce };
}

/**
 * Draw one frame at `tSeconds`. Particles fly in from all sides and gather into an orb that fills the screen,
 * then the orb shrinks and settles at `rest`, turning all the time.
 * Returns how many particles were drawn inside the screen.
 */
export function drawIntro(ctx: OrbContext, o: IntroState, tSeconds: number): number {
  const t = o.reduce ? INTRO.total - 0.4 : tSeconds;
  const shrink = easeInOutCubic((t - INTRO.shrinkAt) / INTRO.shrinkFor);
  const R = o.big + (o.rest.r - o.big) * shrink;
  const cx = o.w / 2 + (o.rest.cx - o.w / 2) * shrink;
  const cy = o.h / 2 + (o.rest.cy - o.h / 2) * shrink;
  const grow = Math.min(1, Math.max(1, R / o.rest.r)); // >= 1
  const sizeBoost = Math.pow(Math.min(2.6, R / o.rest.r), 0.55) * (grow || 1);

  ctx.clearRect(0, 0, o.w, o.h);
  // Soft glow, drawn as a circle (never a rectangle) so it cannot show a box edge on any screen.
  ctx.globalCompositeOperation = "source-over";
  const glowR = R * 1.35;
  const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
  glow.addColorStop(0, "rgba(229,50,45,0.20)");
  glow.addColorStop(0.7, "rgba(229,50,45,0.05)");
  glow.addColorStop(1, "rgba(229,50,45,0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(cx, cy, glowR, 0, Math.PI * 2);
  ctx.fill();

  ctx.globalCompositeOperation = "lighter";
  const ry = t * 0.9;
  const rx = 0.35 + Math.sin(t * 0.5) * 0.07;
  const breathe = 1 + Math.sin(t * 2.4) * 0.02;
  let drawn = 0;
  for (let i = 0; i < o.points.length; i++) {
    const s = o.seeds[i];
    const k = easeOutCubic((t - s.delay) / INTRO.gather);
    const q = project(rotate(o.points[i], ry, rx), R * breathe, cx, cy);
    // Fly from the start point to the particle's place on the orb, curving a little on the way.
    const bend = (1 - k) * k * 4 * s.swirl * o.big * 0.22;
    const dx = q.x - s.sx;
    const dy = q.y - s.sy;
    const len = Math.hypot(dx, dy) || 1;
    const x = s.sx + dx * k + (-dy / len) * bend;
    const y = s.sy + dy * k + (dx / len) * bend;
    if (!(x > -6 && x < o.w + 6 && y > -6 && y < o.h + 6)) continue;
    const near = Math.min(1, Math.max(0, q.depth));
    const alpha = (0.2 + near * 0.75) * (0.2 + 0.8 * k);
    const size = Math.max(0.5, (0.7 + near * 1.4) * Math.min(q.scale, 2.2) * 0.8 * sizeBoost);
    ctx.fillStyle = `rgba(${229 + Math.round(26 * near)},${50 + Math.round(120 * near * near)},${45 + Math.round(95 * near * near)},${alpha.toFixed(3)})`;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
    drawn++;
  }
  ctx.globalCompositeOperation = "source-over";
  return drawn;
}
