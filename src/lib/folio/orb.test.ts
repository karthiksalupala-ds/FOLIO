import test from "node:test";
import assert from "node:assert/strict";
import { drawOrb, easeOutCubic, fibonacciSphere, makeOrb, project, rotate, type OrbContext } from "./orb.ts";

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

function fakeCtx(): OrbContext & { arcs: number } {
  const ctx = {
    arcs: 0,
    fillStyle: "" as unknown,
    globalCompositeOperation: "source-over",
    clearRect() {},
    createRadialGradient: () => ({ addColorStop() {} }),
    fillRect() {},
    beginPath() {},
    fill() {},
    arc(_x: number, _y: number, r: number) {
      // a real canvas throws IndexSizeError for a negative radius: that killed the first splash frame
      if (!(r >= 0)) throw new RangeError(`bad radius ${r}`);
      ctx.arcs++;
    },
  };
  return ctx;
}

test("projection never divides by zero for far-scattered particles", () => {
  for (const z of [2.9, 3, 3.1, 5, 12]) {
    const q = project({ x: 0.3, y: 0.2, z }, 100, 0, 0);
    assert.ok(Number.isFinite(q.x) && Number.isFinite(q.y) && q.scale > 0, `z=${z}`);
  }
});

test("every frame of the intro draws without throwing, and the orb is complete once gathered", () => {
  for (const reduce of [false, true]) {
    const orb = makeOrb(1000, 560, 2, reduce);
    for (let t = 0; t <= 2.5; t += 1 / 30) {
      const ctx = fakeCtx();
      const visible = drawOrb(ctx, orb, t); // must not throw
      assert.equal(ctx.arcs, visible);
      if (t === 0) assert.ok(visible >= 0);
    }
    const ctx = fakeCtx();
    assert.ok(drawOrb(ctx, orb, 2.5) >= 990, "almost every particle is on the canvas once gathered");
  }
});

test("some particles are already visible in the first frames", () => {
  const orb = makeOrb(1000, 560, 2, false);
  assert.ok(drawOrb(fakeCtx(), orb, 0.05) > 20);
});
