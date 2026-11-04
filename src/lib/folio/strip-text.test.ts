import test from "node:test";
import assert from "node:assert/strict";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { decodePDFRawStream } from "pdf-lib/cjs/core/streams/decode.js";
import { stripContentString, stripTextInRects } from "./strip-text.ts";

function decodedPage(page: { node: { Contents: () => unknown } }): string {
  const contents = page.node.Contents() as
    | { contents?: Uint8Array; getContentsString?: () => string; size?: () => number; lookup?: (i: number) => unknown }
    | undefined;
  if (!contents) return "";
  if (typeof contents.getContentsString === "function" && !(contents.contents instanceof Uint8Array)) {
    return contents.getContentsString();
  }
  const streams: unknown[] = contents.contents instanceof Uint8Array ? [contents] : [];
  if (typeof contents.size === "function" && contents.lookup) {
    for (let i = 0; i < contents.size(); i++) streams.push(contents.lookup(i));
  }
  return streams
    .map((stream) => {
      const s = stream as { contents?: Uint8Array; getContentsString?: () => string };
      if (s.contents instanceof Uint8Array) {
        return Buffer.from(decodePDFRawStream(s as never).decode()).toString("latin1");
      }
      return s.getContentsString?.() ?? "";
    })
    .join("\n");
}

test("stripContentString removes only the line inside the rect", () => {
  const src = `BT
/F1 32 Tf
1 0 0 1 50 250 Tm
(Shiva) Tj
1 0 0 1 50 200 Tm
(Hello) Tj
ET`;
  const pageW = 600;
  const pageH = 400;
  const size = 32;
  const rect = {
    x: 40 / pageW,
    y: (pageH - (250 + size)) / pageH,
    w: 160 / pageW,
    h: (size * 1.3) / pageH,
  };
  const out = stripContentString(src, pageW, pageH, [rect]);
  assert.equal(out.removed, 1);
  assert.equal(out.content.includes("(Shiva)"), false);
  assert.equal(out.content.includes("(Hello)"), true);
  assert.match(out.content, /\(\) Tj/);
});

test("stripContentString removes both parts of a TJ name", () => {
  const src = "BT /F1 24 Tf 1 0 0 1 72 500 Tm [(Shi) -10 (va)] TJ ET";
  const pageW = 612;
  const pageH = 792;
  const rect = { x: 60 / pageW, y: (pageH - 530) / pageH, w: 140 / pageW, h: 40 / pageH };
  const out = stripContentString(src, pageW, pageH, [rect]);
  assert.equal(out.removed, 2);
  assert.equal(out.content.includes("(Shi)"), false);
  assert.equal(out.content.includes("(va)"), false);
});

test("stripTextInRects deletes real page text and leaves the other line", async () => {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([600, 400]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  page.drawText("Certificate", { x: 50, y: 300, size: 24, font });
  page.drawText("Shiva", { x: 50, y: 250, size: 32, font });
  const width = font.widthOfTextAtSize("Shiva", 32);
  const removed = stripTextInRects(page, [
    {
      x: 45 / 600,
      y: (400 - (250 + 32)) / 400,
      w: (width + 16) / 600,
      h: 40 / 400,
    },
  ]);
  assert.ok(removed >= 1);
  const saved = await pdf.save();
  const again = await PDFDocument.load(saved);
  const text = decodedPage(again.getPage(0));
  assert.equal(/5368697661/i.test(text), false);
  assert.equal(/4365727469666963617465/i.test(text), true);
});
