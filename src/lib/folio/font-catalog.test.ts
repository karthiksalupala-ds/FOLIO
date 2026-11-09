import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { FONT_CATALOG, catalogFont, catalogIdFor, fontFile, fontKindOf, isGenericFont } from "./font-catalog.ts";

test("every catalog font has all four style files on disk and a css family", () => {
  for (const f of FONT_CATALOG)
    for (const [b, i] of [[false, false], [true, false], [false, true], [true, true]] as const) {
      const file = fontFile(f.id, b, i);
      assert.ok(file && existsSync(new URL(`../../../public/fonts/${file}`, import.meta.url)), `${f.id} ${b} ${i}: ${file}`);
    }
  assert.equal(new Set(FONT_CATALOG.map((f) => f.id)).size, FONT_CATALOG.length);
});

test("old generic ids still work and map to metric-compatible fonts", () => {
  assert.ok(isGenericFont("serif") && !isGenericFont("carlito"));
  assert.equal(catalogFont("sans")?.id, "liberation-sans");
  assert.equal(catalogFont("mono")?.id, "liberation-mono");
  assert.equal(fontKindOf("caladea"), "serif");
  assert.equal(fontKindOf(undefined), "sans");
  assert.equal(fontFile("unknown-font", false, false), null);
});

test("real PDF font names pick the closest bundled font", () => {
  assert.equal(catalogIdFor("ABCDEF+Calibri-Bold", "sans"), "carlito");
  assert.equal(catalogIdFor("Cambria", "serif"), "caladea");
  assert.equal(catalogIdFor("TimesNewRomanPS-BoldMT", "serif"), "liberation-serif");
  assert.equal(catalogIdFor("Arial-BoldMT", "sans"), "liberation-sans");
  assert.equal(catalogIdFor("CourierNewPSMT", "mono"), "liberation-mono");
  assert.equal(catalogIdFor("DejaVuSerif-Bold", "serif"), "dejavu-serif");
  assert.equal(catalogIdFor("g_d0_f3", "sans"), "liberation-sans");
});
