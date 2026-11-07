import test from "node:test";
import assert from "node:assert/strict";
import { drawIntro, easeOutCubic, fibonacciSphere, INTRO, makeIntro, project, rotate } from "./orb.ts";

test("fibonacci sphere points all sit on the unit sphere and cover both poles", () => {
  const pts = fibonacciSphere(500);
  assert.equal(pts.length, 500);
  for (const p of pts) assert.ok(Math.abs(Math.hypot(p.x, p.y, p.z) - 1) < 1e-9);
  assert.ok(pts[0].y > 0.99 && pts[499].y < -0.99);
});

test("rotation preserves length", () => {
  for (const p of fibonacciSphere(50)) {
    const r = rotate(p, 1.234, 0.4);
    assert.ok(Math.abs(Math.hypot(r.x, r.y, r.z) - 1) < 1e-9);
  }
});

test("nearer points project larger and shade brighter", () => {
  const far = project({ x: 0.5, y: 0, z: -1 }, 100, 0, 0);
  const near = project({ x: 0.5, y: 0, z: 1 }, 100, 0, 0);
  assert.ok(near.scale > far.scale && near.x > far.x);
  assert.ok(near.depth > far.depth && near.depth <= 1 && far.depth >= 0);
});

test("ease is clamped and monotonic", () => {
  assert.equal(easeOutCubic(-1), 0);
  assert.equal(easeOutCubic(2), 1);
  assert.ok(easeOutCubic(0.3) < easeOutCubic(0.6));
});

function fakeCtx() {
  const ctx = {
    arcs: 0,
    fillStyle: "" as unknown,
    globalCompositeOperation: "source-over",
    clearRect() {},
    createRadialGradient: () => ({ addColorStop() {} }),
    beginPath() {},
    fill() {},
    arc(_x: number, _y: number, r: number) {
      // a real canvas throws IndexSizeError for a negative radius
      if (!(r >= 0) || !Number.isFinite(r)) throw new RangeError(`bad radius ${r}`);
      ctx.arcs++;
    },
  };
  return ctx;
}

const screens: [number, number][] = [
  [390, 844],
  [360, 640],
  [820, 1180],
  [1440, 900],
];

function restFor(w: number, h: number) {
  const r = Math.min(w * 0.27, 118);
  return { cx: w / 2, cy: h * 0.5 + 60, r };
}

test("projection never divides by zero for far-scattered particles", () => {
  for (const z of [2.9, 3, 3.1, 5, 12]) {
    const q = project({ x: 0.3, y: 0.2, z }, 100, 0, 0);
    assert.ok(Number.isFinite(q.x) && Number.isFinite(q.y) && q.scale > 0, `z=${z}`);
  }
});

test("every frame of the intro draws without throwing on every screen size", () => {
  for (const [w, h] of screens)
    for (const reduce of [false, true]) {
      const st = makeIntro(1200, w, h, restFor(w, h), reduce);
      for (let t = 0; t <= INTRO.total + 0.5; t += 1 / 30) {
        const ctx = fakeCtx();
        const drawn = drawIntro(ctx, st, t);
        assert.equal(ctx.arcs, drawn + 1); // every particle plus the glow circle
      }
    }
});

test("particles arrive from outside the screen, then the whole orb is on screen once settled", () => {
  for (const [w, h] of screens) {
    const st = makeIntro(1200, w, h, restFor(w, h), false);
    const start = drawIntro(fakeCtx(), st, 0);
    assert.ok(start < 1200 * 0.15, `most particles start outside the screen (${start} visible)`);
    const settled = drawIntro(fakeCtx(), st, INTRO.total - 0.2);
    assert.ok(settled >= 1190, `settled orb is complete on ${w}x${h} (${settled})`);
  }
});

test("the big orb fills the screen before it shrinks", () => {
  const [w, h] = [390, 844];
  const st = makeIntro(1200, w, h, restFor(w, h), false);
  assert.ok(st.big * 2 > w, "big orb is wider than the screen");
});

test("the orb ends up small and where we asked", () => {
  const [w, h] = [390, 844];
  const rest = restFor(w, h);
  const st = makeIntro(1200, w, h, rest, false);
  const xs: number[] = [];
  const ctx = { ...fakeCtx(), arc(x: number) { xs.push(x); } };
  drawIntro(ctx as never, st, INTRO.total - 0.2);
  const min = Math.min(...xs), max = Math.max(...xs);
  assert.ok(max - min < rest.r * 2.4 && max - min > rest.r * 1.6, `orb width ${max - min} vs 2r ${rest.r * 2}`);
  assert.ok(Math.abs((min + max) / 2 - rest.cx) < 6);
});
