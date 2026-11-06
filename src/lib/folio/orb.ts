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
  const k = focal / (focal - p.z);
  return { x: cx + p.x * radius * k, y: cy + p.y * radius * k, scale: k, depth: (p.z + 1) / 2 };
}

export const easeOutCubic = (t: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);
