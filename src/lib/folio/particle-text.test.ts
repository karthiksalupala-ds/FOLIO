import test from "node:test";
import assert from "node:assert/strict";
import { WORD, drawWordIntro, makeWordIntro, pickPoints, sampleMask, type WordContext } from "./particle-text.ts";

/** A solid 100x40 block of alpha in a 200x100 image. */
function block() {
  const w = 200, h = 100;
  const data = new Uint8ClampedArray(w * h * 4);
  for (let y = 30; y < 70; y++) for (let x = 50; x < 150; x++) data[(y * w + x) * 4 + 3] = 255;
  return { data, w, h };
}

test("sampleMask only returns solid pixels, on the grid", () => {
  const { data, w, h } = block();
  const pts = sampleMask(data, w, h, 2);
  assert.ok(pts.length > 900 && pts.length < 1100, `${pts.length}`);
  for (const p of pts) assert.ok(p.x >= 50 && p.x < 150 && p.y >= 30 && p.y < 70);
});

test("pickPoints is deterministic, limited, and covers the whole shape", () => {
  const { data, w, h } = block();
  const all = sampleMask(data, w, h, 1);
  const a = pickPoints(all, 500);
  const b = pickPoints(all, 500);
  assert.equal(a.length, 500);
  assert.deepEqual(a, b);
  assert.equal(pickPoints(all.slice(0, 10), 500).length, 10);
  const left = a.filter((p) => p.x < 100).length;
  assert.ok(left > 200 && left < 300, "both halves of the shape are represented");
});

function fakeCtx() {
  const ctx = {
    arcs: 0,
    texts: 0,
    xs: [] as number[],
    fillStyle: "" as unknown,
    globalAlpha: 1,
    font: "",
    textAlign: "",
    textBaseline: "",
    globalCompositeOperation: "",
    letterSpacing: "",
    clearRect() {},
    beginPath() {},
    fill() {},
    fillText() {
      ctx.texts++;
    },
    arc(x: number, _y: number, r: number) {
      if (!(r >= 0) || !Number.isFinite(r) || !Number.isFinite(x)) throw new RangeError(`bad arc ${x} ${r}`);
      ctx.arcs++;
      ctx.xs.push(x);
    },
  };
  return ctx as typeof ctx & WordContext;
}

const screens: [number, number][] = [
  [390, 844],
  [360, 640],
  [820, 1180],
  [1440, 900],
];
const word = (w: number, h: number) => ({ text: "Folio", font: "800 100px sans-serif", letterSpacing: -4, x: w / 2, y: h / 2 });

function targetsFor(w: number, h: number, n: number) {
  const { data, w: bw, h: bh } = block();
  const pts = pickPoints(sampleMask(data, bw, bh, 1), n);
  return pts.map((p) => ({ x: w / 2 - 100 + p.x, y: h / 2 - 50 + p.y }));
}

test("every frame draws without throwing on every screen, with and without reduced motion", () => {
  for (const [w, h] of screens)
    for (const reduce of [false, true]) {
      const st = makeWordIntro(targetsFor(w, h, 1500), w, h, reduce, word(w, h));
      for (let t = 0; t <= WORD.total + 0.5; t += 1 / 30) drawWordIntro(fakeCtx(), st, t);
    }
});

test("particles come from outside the screen, then all sit on the word", () => {
  for (const [w, h] of screens) {
    const targets = targetsFor(w, h, 1500);
    const st = makeWordIntro(targets, w, h, false, word(w, h));
    const start = drawWordIntro(fakeCtx(), st, 0);
    assert.ok(start < targets.length * 0.2, `most start off screen (${start} visible)`);
    const mid = drawWordIntro(fakeCtx(), st, 1.6);
    assert.ok(mid > start, "more particles arrive over time");
    // just before the crisp word takes over, every particle is close to its target
    const c = fakeCtx();
    const shown = drawWordIntro(c, st, WORD.textAt - 0.05);
    assert.ok(shown >= targets.length * 0.99, `all particles are on screen (${shown})`);
  }
});

test("the crisp word fades in at the end and the particles fade away", () => {
  const [w, h] = [390, 844];
  const st = makeWordIntro(targetsFor(w, h, 1000), w, h, false, word(w, h));
  assert.equal(drawWordIntro(fakeCtx(), st, WORD.textAt - 0.1) >= 0, true);
  const before = fakeCtx();
  drawWordIntro(before, st, WORD.textAt - 0.2);
  assert.equal(before.texts, 0, "no word yet");
  const after = fakeCtx();
  drawWordIntro(after, st, WORD.total);
  assert.equal(after.texts, 1, "word is drawn");
});

test("reduced motion shows the finished word straight away", () => {
  const [w, h] = [390, 844];
  const st = makeWordIntro(targetsFor(w, h, 800), w, h, true, word(w, h));
  const c = fakeCtx();
  drawWordIntro(c, st, 0);
  assert.equal(c.texts, 1);
});
