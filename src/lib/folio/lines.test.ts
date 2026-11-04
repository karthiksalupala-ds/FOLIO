import test from "node:test";
import assert from "node:assert/strict";
import { groupLines } from "./lines.ts";

const W = 600;
const H = 800;
function item(str: string, left: number, top: number, width: number, fontSize = 12) {
  const height = fontSize;
  return { str, left, top, width, height, fontSize, nx: left / W, ny: top / H, nw: width / W, nh: height / H };
}

test("words on one line are joined, separate lines stay separate", () => {
  const lines = groupLines([item("Hello", 50, 100, 30), item("world", 85, 100, 32), item("Next line", 50, 130, 60)] as never);
  assert.equal(lines.length, 2);
  assert.equal(lines[0].text, "Hello world");
  assert.equal(lines[1].text, "Next line");
});

test("tightly stacked lines do not grow whiteout boxes into each other", () => {
  // Three lines 13pt apart with a 12pt font: a 1.35x box (16pt) would cover the next line.
  const items = [item("PRESENTED BY:", 40, 500, 90), item("Name", 40, 513, 60), item("Roll no", 40, 526, 60)];
  const lines = groupLines(items as never);
  assert.equal(lines.length, 3);
  for (let i = 0; i < 2; i++) {
    const bottom = (lines[i].ny + lines[i].nh) * H;
    const nextTop = lines[i + 1].ny * H;
    assert.ok(bottom <= nextTop + 0.5, `line ${i} box bottom ${bottom} overlaps next top ${nextTop}`);
  }
});

test("a lone line keeps the taller box that covers descenders", () => {
  const [line] = groupLines([item("Alone", 50, 300, 40)] as never);
  assert.ok(line.nh * H > 12 * 1.2);
});

test("lines in different columns do not limit each other", () => {
  const lines = groupLines([item("Left", 40, 100, 80), item("Right column", 400, 106, 100)] as never);
  const left = lines.find((l) => l.text === "Left")!;
  assert.ok(left.nh * H > 12 * 1.3);
});
