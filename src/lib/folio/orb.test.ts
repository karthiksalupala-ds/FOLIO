import test from "node:test";
import assert from "node:assert/strict";
import { easeOutCubic, fibonacciSphere, project, rotate } from "./orb.ts";

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
