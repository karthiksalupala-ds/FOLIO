import test from "node:test";
import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { drawRuns, setFontLoader } from "./fonts.ts";
import { chunkText, splitRuns, toWinAnsi } from "./text-utils.ts";
import { isBlockedHostname, isPrivateAddress } from "./ssrf.ts";

test("splitRuns separates scripts and keeps joiners", () => {
  const runs = splitRuns("Hello నమస్తే world");
  assert.deepEqual(runs.map((r) => r.script), ["latin", "telugu", "latin"]);
  assert.equal(splitRuns("क\u200dष")[0].text, "क\u200dष");
});

test("toWinAnsi maps typographic punctuation and unknowns", () => {
  assert.equal(toWinAnsi("“hi” – ok…\t"), '"hi" - ok...    ');
  assert.equal(toWinAnsi("日本"), "??");
});

test("chunkText respects the limit and loses nothing", () => {
  const para = "Sentence one is here. Sentence two is here! Sentence three? ".repeat(40);
  const text = Array.from({ length: 12 }, () => para).join("\n\n");
  const chunks = chunkText(text, 3000);
  assert.ok(chunks.length > 1);
  assert.ok(chunks.every((c) => c.length <= 3000 && c.length > 0));
  const norm = (s: string) => s.replace(/\s+/g, " ").trim();
  assert.equal(norm(chunks.join(" ")), norm(text));
  assert.deepEqual(chunkText("short"), ["short"]);
  assert.deepEqual(chunkText("   "), []);
  assert.ok(chunkText("x".repeat(25000), 9000).every((c) => c.length <= 9000));
});

test("ssrf: private and metadata addresses are blocked", () => {
  for (const ip of ["127.0.0.1", "10.1.2.3", "172.16.0.1", "172.31.255.1", "192.168.1.1", "169.254.169.254", "0.0.0.0", "100.64.0.1", "::1", "fd00::1", "fe80::1", "::ffff:127.0.0.1"])
    assert.equal(isPrivateAddress(ip), true, ip);
  for (const ip of ["8.8.8.8", "1.1.1.1", "172.32.0.1", "93.184.216.34", "2606:4700:4700::1111"])
    assert.equal(isPrivateAddress(ip), false, ip);
  assert.equal(isBlockedHostname("localhost"), true);
  assert.equal(isBlockedHostname("foo.internal"), true);
  assert.equal(isBlockedHostname("example.com"), false);
});

test("drawRuns embeds Telugu glyphs into a real PDF", async () => {
  setFontLoader(async (f) => {
    const b = await readFile(new URL(`../../../public/fonts/${f}`, import.meta.url));
    return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength) as ArrayBuffer;
  });
  const doc = await PDFDocument.create();
  const helv = await doc.embedFont(StandardFonts.Helvetica);
  const page = doc.addPage([400, 200]);
  const w = await drawRuns(doc, page, "Hello నమస్తే भारत", { x: 20, y: 100, size: 20, color: rgb(0, 0, 0), helv });
  assert.ok(w > 50);
  await writeFile("/tmp/t/telugu.pdf", await doc.save());
});
