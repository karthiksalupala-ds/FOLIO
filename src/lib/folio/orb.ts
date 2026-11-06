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

export const easeOutCubic = (t: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);

export type OrbContext = {
  clearRect(x: number, y: number, w: number, h: number): void;
  createRadialGradient(x0: number, y0: number, r0: number, x1: number, y1: number, r1: number): { addColorStop(o: number, c: string): void };
  fillRect(x: number, y: number, w: number, h: number): void;
  beginPath(): void;
  arc(x: number, y: number, r: number, a0: number, a1: number): void;
  fill(): void;
  fillStyle: unknown;
  globalCompositeOperation: string;
};

export type OrbState = {
  points: Vec3[];
  seeds: { dist: number; delay: number }[];
  size: number; // canvas size in device pixels (square)
  dpr: number;
  reduce: boolean;
};

export function makeOrb(count: number, size: number, dpr: number, reduce: boolean): OrbState {
  const points = fibonacciSphere(count);
  const seeds = points.map((_, i) => {
    const a = Math.sin(i * 12.9898) * 43758.5453;
    const b = Math.sin(i * 78.233) * 12345.6789;
    return { dist: 1.6 + (a - Math.floor(a)) * 2.4, delay: (b - Math.floor(b)) * 0.35 };
  });
  return { points, seeds, size, dpr, reduce };
}

/** Draw one frame at time `t` seconds. Returns how many particles landed inside the canvas. */
export function drawOrb(ctx: OrbContext, o: OrbState, tSeconds: number): number {
  const t = o.reduce ? 3 : tSeconds;
  const c = o.size / 2;
  const radius = o.size / 2 / 1.55;
  ctx.clearRect(0, 0, o.size, o.size);
  const glow = ctx.createRadialGradient(c, c, 0, c, c, radius * 1.45);
  glow.addColorStop(0, "rgba(229,50,45,0.20)");
  glow.addColorStop(1, "rgba(229,50,45,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, o.size, o.size);

  ctx.globalCompositeOperation = "lighter";
  const breathe = 1 + Math.sin(t * 2.2) * 0.025;
  const ry = t * 0.55;
  const rx = 0.38 + Math.sin(t * 0.4) * 0.08;
  let visible = 0;
  for (let i = 0; i < o.points.length; i++) {
    const s = o.seeds[i];
    const k = easeOutCubic((t - s.delay) / 1.15); // 0 = scattered, 1 = on the sphere
    const out = 1 + (1 - k) * s.dist;
    const b = o.points[i];
    const p = rotate({ x: b.x * out, y: b.y * out, z: b.z * out }, ry, rx);
    const q = project(p, radius * breathe, c, c);
    if (!(q.x > -4 && q.x < o.size + 4 && q.y > -4 && q.y < o.size + 4)) continue; // off canvas (also skips NaN)
    const near = Math.min(1, Math.max(0, q.depth));
    const alpha = (0.18 + near * 0.8) * (0.25 + 0.75 * k);
    const size = Math.max(0.4, (0.7 + near * 1.5) * Math.min(q.scale, 2.5) * o.dpr * 0.75);
    const r = 229 + Math.round(26 * near);
    const g = 50 + Math.round(120 * near * near);
    const bl = 45 + Math.round(95 * near * near);
    ctx.fillStyle = `rgba(${r},${g},${bl},${alpha.toFixed(3)})`;
    ctx.beginPath();
    ctx.arc(q.x, q.y, size, 0, Math.PI * 2);
    ctx.fill();
    visible++;
  }
  ctx.globalCompositeOperation = "source-over";
  return visible;
}
