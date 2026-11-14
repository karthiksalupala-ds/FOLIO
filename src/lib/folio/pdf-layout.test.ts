import test from "node:test";
import assert from "node:assert/strict";
import { buildBlocks, type LineBox } from "./pdf-layout.ts";

const L = (text: string, left: number, top: number, fontSize = 12, extra: Partial<LineBox> = {}): LineBox => ({ text, left, top, width: text.length * fontSize * 0.5, height: fontSize, fontSize, ...extra });
const png = new Uint8Array([1, 2, 3]);

test("a big bold line becomes a heading and wrapped lines join into one paragraph", () => {
  const blocks = buildBlocks([L("Annual Report", 50, 40, 28, { bold: true }), L("Revenue grew eighteen percent and", 50, 100), L("margins improved everywhere.", 50, 114), L("Second paragraph", 50, 160)], [], 612);
  assert.equal((blocks[0] as { heading: number }).heading, 1);
  assert.equal((blocks[1] as { text: string }).text, "Revenue grew eighteen percent and margins improved everywhere.");
  assert.equal((blocks[2] as { text: string }).text, "Second paragraph");
  assert.equal(blocks.length, 3);
});

test("rows with the same columns become a table", () => {
  const rows = [["Quarter", "Revenue", "Profit"], ["Q1", "120", "30"], ["Q2", "150", "42"]];
  const blocks = buildBlocks(rows.flatMap((r, i) => r.map((c, j) => L(c, 50 + j * 120, 200 + i * 30))), [], 612);
  assert.equal(blocks.length, 1);
  assert.deepEqual((blocks[0] as { rows: string[][] }).rows, rows);
});

test("a single two-column row is not a table", () => {
  assert.equal(buildBlocks([L("Name:", 50, 100), L("Karthik", 200, 100)], [], 612)[0].kind, "para");
});

test("images keep their place in reading order", () => {
  const blocks = buildBlocks([L("Before", 50, 50), L("After", 50, 400)], [{ left: 50, top: 150, width: 300, height: 180, png }], 612);
  assert.deepEqual(blocks.map((b) => b.kind), ["para", "image", "para"]);
});
