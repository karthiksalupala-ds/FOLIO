// Pure helpers used to make edited text look like the text it replaces.

export type FontFamily = "sans" | "serif" | "mono";
export type FontLook = { font: FontFamily; bold: boolean; italic: boolean };

/** Guess family / weight / slant from a PDF font name such as "ABCDEF+Arial-BoldMT" or a CSS family. */
export function fontStyleFrom(name?: string, cssFamily?: string): FontLook {
  const n = `${name ?? ""} ${cssFamily ?? ""}`.toLowerCase();
  const mono = /courier|mono|consolas|menlo|lucida console|typewriter/.test(n);
  const sans = /sans|arial|helvet|calibri|verdana|tahoma|roboto|segoe|inter|noto sans|open sans|gothic|futura/.test(n);
  const serif = !sans && /serif|times|georgia|garamond|palatino|cambria|minion|book antiqua|century|baskerville|didot/.test(n);
  return {
    font: mono ? "mono" : serif ? "serif" : "sans",
    bold: /bold|black|heavy|semibold|demi(?!-?light)|extrabold/.test(n),
    italic: /italic|oblique|-it\b|ital\b/.test(n),
  };
}

const hex = (r: number, g: number, b: number) => "#" + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");

/**
 * Find the background (most common colour) and the ink colour (average of the pixels
 * furthest from the background) inside an RGBA pixel block.
 */
export function analyzeColors(data: ArrayLike<number>, width: number, height: number): { bg: string; fg: string } {
  const total = width * height;
  if (!total) return { bg: "#ffffff", fg: "#1c1917" };
  const buckets = new Map<number, { n: number; r: number; g: number; b: number }>();
  for (let i = 0; i < total; i++) {
    const o = i * 4;
    if ((data[o + 3] ?? 255) < 128) continue;
    const r = data[o],
      g = data[o + 1],
      b = data[o + 2];
    const key = ((r >> 4) << 8) | ((g >> 4) << 4) | (b >> 4);
    const e = buckets.get(key);
    if (e) {
      e.n++;
      e.r += r;
      e.g += g;
      e.b += b;
    } else buckets.set(key, { n: 1, r, g, b });
  }
  let top: { n: number; r: number; g: number; b: number } | undefined;
  for (const e of buckets.values()) if (!top || e.n > top.n) top = e;
  if (!top) return { bg: "#ffffff", fg: "#1c1917" };
  const bgR = top.r / top.n,
    bgG = top.g / top.n,
    bgB = top.b / top.n;
  const far: { d: number; r: number; g: number; b: number }[] = [];
  for (let i = 0; i < total; i++) {
    const o = i * 4;
    const d = Math.abs(data[o] - bgR) + Math.abs(data[o + 1] - bgG) + Math.abs(data[o + 2] - bgB);
    if (d > 150) far.push({ d, r: data[o], g: data[o + 1], b: data[o + 2] });
  }
  if (far.length < 3) {
    // No visible ink: pick black or white for contrast with the background.
    const lum = 0.299 * bgR + 0.587 * bgG + 0.114 * bgB;
    return { bg: hex(bgR, bgG, bgB), fg: lum < 128 ? "#ffffff" : "#1c1917" };
  }
  far.sort((a, b) => b.d - a.d);
  const take = far.slice(0, Math.max(3, Math.ceil(far.length * 0.2)));
  const avg = (k: "r" | "g" | "b") => take.reduce((s, p) => s + p[k], 0) / take.length;
  return { bg: hex(bgR, bgG, bgB), fg: hex(avg("r"), avg("g"), avg("b")) };
}
