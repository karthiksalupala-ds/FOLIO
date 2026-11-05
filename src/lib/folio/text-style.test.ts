import test from "node:test";
import assert from "node:assert/strict";
import { analyzeColors, fontStyleFrom } from "./text-style.ts";

function block(w: number, h: number, bg: [number, number, number], ink: [number, number, number], inkEvery = 7) {
  const d = new Uint8ClampedArray(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    const c = i % inkEvery === 0 ? ink : bg;
    d.set([c[0], c[1], c[2], 255], i * 4);
  }
  return d;
}

test("analyzeColors finds white page + black ink", () => {
  const r = analyzeColors(block(40, 12, [255, 255, 255], [0, 0, 0]), 40, 12);
  assert.equal(r.bg, "#ffffff");
  assert.equal(r.fg, "#000000");
});

test("analyzeColors finds a coloured background and its ink", () => {
  const r = analyzeColors(block(40, 12, [20, 40, 120], [250, 250, 250]), 40, 12);
  assert.equal(r.bg, "#142878");
  assert.equal(r.fg, "#fafafa");
});

test("analyzeColors falls back sensibly with no ink or no pixels", () => {
  assert.deepEqual(analyzeColors(block(10, 4, [255, 255, 255], [255, 255, 255]), 10, 4), { bg: "#ffffff", fg: "#1c1917" });
  assert.deepEqual(analyzeColors(block(10, 4, [10, 10, 10], [10, 10, 10]), 10, 4), { bg: "#0a0a0a", fg: "#ffffff" });
  assert.deepEqual(analyzeColors([], 0, 0), { bg: "#ffffff", fg: "#1c1917" });
});

test("fontStyleFrom reads real PDF font names", () => {
  assert.deepEqual(fontStyleFrom("ABCDEF+Arial-BoldMT"), { font: "sans", bold: true, italic: false });
  assert.deepEqual(fontStyleFrom("TimesNewRomanPS-ItalicMT"), { font: "serif", bold: false, italic: true });
  assert.deepEqual(fontStyleFrom("CourierNewPS-BoldItalicMT"), { font: "mono", bold: true, italic: true });
  assert.deepEqual(fontStyleFrom("g_d0_f1", "sans-serif"), { font: "sans", bold: false, italic: false });
  assert.deepEqual(fontStyleFrom("g_d0_f2", "serif"), { font: "serif", bold: false, italic: false });
  assert.equal(fontStyleFrom("Calibri-Light").bold, false);
  // the real name beats a generic css fallback
  assert.deepEqual(fontStyleFrom("DejaVuSerif-Bold-7572", "sans-serif"), { font: "serif", bold: true, italic: false });
  assert.deepEqual(fontStyleFrom("Poppins-Bold-9750", "sans-serif"), { font: "sans", bold: true, italic: false });
  assert.deepEqual(fontStyleFrom("g_d0_f9", "monospace"), { font: "mono", bold: false, italic: false });
});

test("fitFontSize matches the original width within safe limits", async () => {
  const { fitFontSize } = await import("./text-style.ts");
  const measure = (sz: number) => sz * 10; // 10 units wide per point
  assert.equal(fitFontSize(12, 120, measure), 12); // already the right width
  assert.equal(fitFontSize(12, 108, measure), 10.8); // 10% too wide, so shrink
  assert.equal(fitFontSize(12, 20, measure), 12 * 0.6); // never shrink more than 40%
  assert.equal(fitFontSize(12, 900, measure), 12 * 1.15); // never grow more than 15%
  assert.equal(fitFontSize(12, 100, () => 0), 12); // bad measurement: leave alone
});
