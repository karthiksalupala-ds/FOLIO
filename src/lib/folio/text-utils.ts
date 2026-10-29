// Pure text helpers (no DOM / no aliases) so they can be unit-tested with node --test.

export type Script = "latin" | "telugu" | "devanagari" | "tamil" | "kannada" | "latin-ext" | "cyrillic" | "greek" | "unsupported";

const PUNCT_MAP: Record<string, string> = {
  "’": "'",
  "‘": "'",
  "“": '"',
  "”": '"',
  "–": "-",
  "—": "-",
  "…": "...",
  "•": "*",
  "\u00a0": " ",
};

/** Characters Helvetica (WinAnsi, ASCII subset) can draw directly. */
export function isBasic(ch: string): boolean {
  const c = ch.codePointAt(0) ?? 0;
  return c >= 0x20 && c <= 0x7e;
}

export function scriptOf(ch: string): Script {
  if (PUNCT_MAP[ch] !== undefined || isBasic(ch)) return "latin";
  const c = ch.codePointAt(0) ?? 0;
  if (c >= 0x0c00 && c <= 0x0c7f) return "telugu";
  if (c >= 0x0900 && c <= 0x097f) return "devanagari";
  if (c >= 0x0b80 && c <= 0x0bff) return "tamil";
  if (c >= 0x0c80 && c <= 0x0cff) return "kannada";
  if (c >= 0x0400 && c <= 0x04ff) return "cyrillic";
  if (c >= 0x0370 && c <= 0x03ff) return "greek";
  if ((c >= 0x00a0 && c <= 0x024f) || (c >= 0x1e00 && c <= 0x1eff)) return "latin-ext";
  if (c === 0x200c || c === 0x200d) return "latin"; // joiners travel with the surrounding run
  return "unsupported";
}

export type Run = { text: string; script: Script };

/** Split text into runs of the same script. ASCII-ish punctuation/spaces stick to the neighbouring run. */
export function splitRuns(input: string): Run[] {
  const runs: Run[] = [];
  for (const ch of input.replace(/\t/g, "    ")) {
    const sc = scriptOf(ch);
    const last = runs[runs.length - 1];
    if ((ch === "\u200c" || ch === "\u200d") && last) {
      last.text += ch; // joiners always stay with the preceding run
      continue;
    }
    const neutral = ch === " " || ch === "\t";
    if (last && (last.script === sc || (neutral && last.script !== "latin"))) {
      last.text += ch;
    } else {
      runs.push({ text: ch, script: sc });
    }
  }
  return runs;
}

/** Map typographic punctuation to ASCII; anything else outside ASCII becomes "?". */
export function toWinAnsi(s: string): string {
  let out = "";
  for (const ch of s) {
    if (isBasic(ch)) out += ch;
    else if (PUNCT_MAP[ch] !== undefined) out += PUNCT_MAP[ch];
    else if (ch === "\n" || ch === "\r") out += " ";
    else if (ch === "\t") out += "    ";
    else out += "?";
  }
  return out;
}

/**
 * Split text into chunks of at most `max` characters, preferring paragraph, then sentence boundaries.
 * Never returns an empty chunk.
 */
export function chunkText(text: string, max = 9000): string[] {
  const clean = text.replace(/\r\n/g, "\n").trim();
  if (!clean) return [];
  if (clean.length <= max) return [clean];
  const chunks: string[] = [];
  let cur = "";
  const push = () => {
    if (cur.trim()) chunks.push(cur.trim());
    cur = "";
  };
  const pieces = clean.split(/\n{2,}/).flatMap((p) => {
    if (p.length <= max) return [p];
    const sentences = p.split(/(?<=[.!?।])\s+/);
    const out: string[] = [];
    let buf = "";
    for (const s of sentences) {
      if (s.length > max) {
        if (buf) out.push(buf);
        buf = "";
        for (let i = 0; i < s.length; i += max) out.push(s.slice(i, i + max));
      } else if ((buf + " " + s).length > max) {
        out.push(buf);
        buf = s;
      } else buf = buf ? `${buf} ${s}` : s;
    }
    if (buf) out.push(buf);
    return out;
  });
  for (const p of pieces) {
    if (cur && (cur + "\n\n" + p).length > max) push();
    cur = cur ? `${cur}\n\n${p}` : p;
  }
  push();
  return chunks;
}
