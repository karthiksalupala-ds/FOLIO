import "regenerator-runtime/runtime.js";
import { degrees, type PDFDocument, type PDFFont, type PDFPage, type RGB } from "pdf-lib";
import { splitRuns, toWinAnsi, type Script } from "./text-utils.ts";

const FILES: Partial<Record<Script, string>> = {
  telugu: "telugu.ttf",
  devanagari: "devanagari.ttf",
  tamil: "tamil.ttf",
  kannada: "kannada.ttf",
  "latin-ext": "latin-ext.ttf",
  cyrillic: "cyrillic.ttf",
  greek: "greek.ttf",
};

type Loader = (file: string) => Promise<ArrayBuffer>;

let loader: Loader = async (file) => {
  const res = await fetch(`/fonts/${file}`);
  if (!res.ok) throw new Error(`font ${file} unavailable`);
  return res.arrayBuffer();
};

/** Tests (or non-browser callers) can provide their own font source. */
export function setFontLoader(next: Loader) {
  loader = next;
}

const bytesCache = new Map<string, Promise<ArrayBuffer>>();
const embedded = new WeakMap<PDFDocument, Map<string, Promise<PDFFont | null>>>();

function embedFor(doc: PDFDocument, script: Script): Promise<PDFFont | null> {
  const file = FILES[script];
  if (!file) return Promise.resolve(null);
  let perDoc = embedded.get(doc);
  if (!perDoc) embedded.set(doc, (perDoc = new Map()));
  let p = perDoc.get(file);
  if (!p) {
    p = (async () => {
      try {
        let bytes = bytesCache.get(file);
        if (!bytes) bytesCache.set(file, (bytes = loader(file)));
        const fontkit = (await import("@pdf-lib/fontkit")).default;
        doc.registerFontkit(fontkit);
        return await doc.embedFont(await bytes, { subset: false });
      } catch {
        bytesCache.delete(file);
        return null;
      }
    })();
    perDoc.set(file, p);
  }
  return p;
}

export type DrawOpts = {
  x: number;
  y: number;
  size: number;
  color: RGB;
  helv: PDFFont;
  opacity?: number;
  rotateDeg?: number;
};

/**
 * Draw one line of text, switching to an embedded Noto font for Telugu / Hindi / Tamil /
 * Kannada / Cyrillic / Greek / Latin-extended runs. Anything still unsupported becomes "?".
 * Returns the total drawn width in points.
 */
export async function drawRuns(doc: PDFDocument, page: PDFPage, text: string, o: DrawOpts): Promise<number> {
  const rad = ((o.rotateDeg ?? 0) * Math.PI) / 180;
  let adv = 0;
  for (const run of splitRuns(text)) {
    const font = (run.script === "latin" ? null : await embedFor(doc, run.script)) ?? o.helv;
    const t = font === o.helv ? toWinAnsi(run.text) : run.text;
    if (!t) continue;
    page.drawText(t, {
      x: o.x + adv * Math.cos(rad),
      y: o.y + adv * Math.sin(rad),
      size: o.size,
      font,
      color: o.color,
      opacity: o.opacity,
      rotate: o.rotateDeg ? degrees(o.rotateDeg) : undefined,
    });
    adv += font.widthOfTextAtSize(t, o.size);
  }
  return adv;
}

export function needsUnicodeFont(text: string): boolean {
  return splitRuns(text).some((r) => r.script !== "latin");
}
