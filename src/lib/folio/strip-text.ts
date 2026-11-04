import type { PDFPage } from "pdf-lib";
import { decodePDFRawStream } from "pdf-lib/cjs/core/streams/decode.js";
import PDFName from "pdf-lib/cjs/core/objects/PDFName.js";

export type NormRect = { x: number; y: number; w: number; h: number };

type M = [number, number, number, number, number, number];

type GS = {
  ctm: M;
  tm: M;
  tlm: M;
  fs: number;
  th: number;
};

type RawStream = {
  contents: Uint8Array;
  dict: {
    delete: (key: unknown) => void;
    lookup: (key: unknown) => unknown;
    get: (key: unknown) => unknown;
    entries: () => [unknown, unknown][];
  };
};

type Tok =
  | { t: "n"; v: number }
  | { t: "s"; chars: number; a: number; b: number }
  | { t: "name"; v: string }
  | { t: "op"; v: string }
  | { t: "arr"; items: Tok[] };

const ID: M = [1, 0, 0, 1, 0, 0];

/** Remove text-showing operators whose glyphs sit inside normalized page rects. Returns how many runs were removed. */
export function stripTextInRects(page: PDFPage, rects: NormRect[]): number {
  if (!rects.length) return 0;
  try {
    const rot = page.getRotation().angle % 360;
    if (rot !== 0) return 0;
    const { width, height } = page.getSize();
    if (width < 1 || height < 1) return 0;
    const resources = page.node.Resources() as { lookup: (key: unknown) => unknown } | undefined;
    const streams = collectStreams(page.node.Contents());
    let removed = 0;
    let gs = fresh();
    const stack: GS[] = [];
    for (const stream of streams) {
      const step = rewriteStream(stream, width, height, rects, gs, stack, resources, 0);
      removed += step.removed;
      gs = step.gs;
    }
    return removed;
  } catch {
    return 0;
  }
}

/** Pure content-stream edit, exported for tests. Coordinates are PDF user space (origin bottom-left). */
export function stripContentString(
  content: string,
  pageW: number,
  pageH: number,
  rects: NormRect[],
): { content: string; removed: number } {
  const gs = fresh();
  const blanks: { a: number; b: number }[] = [];
  walk(content, gs, [], (g, chars, span) => {
    if (hits(g, chars, pageW, pageH, rects)) blanks.push(span);
  });
  return { content: applyBlanks(content, blanks), removed: blanks.length };
}

function fresh(): GS {
  return { ctm: [...ID], tm: [...ID], tlm: [...ID], fs: 12, th: 100 };
}

type Editable = {
  read: () => string;
  write: (next: string) => void;
};

function collectStreams(contents: unknown): Editable[] {
  const one = asEditable(contents);
  if (one) return [one];
  if (isArr(contents)) {
    const out: Editable[] = [];
    for (let i = 0; i < contents.size(); i++) {
      const item = asEditable(contents.lookup(i));
      if (item) out.push(item);
    }
    return out;
  }
  return [];
}

function asEditable(obj: unknown): Editable | null {
  if (isRaw(obj)) {
    return {
      read: () => latin1(decodePDFRawStream(obj as never).decode()),
      write: (next) => writeRaw(obj, next),
    };
  }
  if (isContent(obj)) {
    return {
      read: () => obj.getContentsString(),
      write: (next) => {
        obj.operators = [textOperator(next)];
      },
    };
  }
  return null;
}

function isContent(obj: unknown): obj is { getContentsString: () => string; operators: unknown[] } {
  if (!obj || typeof obj !== "object") return false;
  const o = obj as { getContentsString?: unknown; operators?: unknown };
  return typeof o.getContentsString === "function" && Array.isArray(o.operators);
}

function textOperator(text: string) {
  const bytes = new Uint8Array(text.length);
  for (let i = 0; i < text.length; i++) bytes[i] = text.charCodeAt(i) & 0xff;
  return {
    toString: () => text,
    clone() {
      return textOperator(text);
    },
    sizeInBytes: () => bytes.length,
    copyBytesInto(buffer: Uint8Array, offset: number) {
      buffer.set(bytes, offset);
      return bytes.length;
    },
  };
}

function isRaw(obj: unknown): obj is RawStream {
  if (!obj || typeof obj !== "object") return false;
  const o = obj as RawStream;
  return o.contents instanceof Uint8Array && !!o.dict && typeof o.dict.lookup === "function";
}

function isArr(obj: unknown): obj is { size: () => number; lookup: (i: number) => unknown } {
  if (!obj || typeof obj !== "object") return false;
  const o = obj as { size?: unknown; lookup?: unknown; contents?: unknown };
  return typeof o.size === "function" && typeof o.lookup === "function" && !(o.contents instanceof Uint8Array);
}

function rewriteStream(
  stream: Editable | RawStream,
  pageW: number,
  pageH: number,
  rects: NormRect[],
  gs: GS,
  gsStack: GS[],
  resources: { lookup: (key: unknown) => unknown } | undefined,
  depth: number,
): { removed: number; gs: GS } {
  const editable = "read" in stream ? stream : asEditable(stream);
  if (!editable) return { removed: 0, gs };
  const text = editable.read();
  const blanks: { a: number; b: number }[] = [];
  const end = walk(text, gs, gsStack, (g, chars, span) => {
    if (hits(g, chars, pageW, pageH, rects)) blanks.push(span);
  }, (name, g) => {
    if (depth >= 4 || !resources) return;
    const form = findForm(resources, name);
    if (!form) return;
    const matrix = formMatrix(form);
    const inner = fresh();
    inner.ctm = mul(g.ctm, matrix);
    const nested = form.dict.lookup(PDFName.of("Resources"));
    const res = isDict(nested) ? nested : resources;
    rewriteStream(form, pageW, pageH, rects, inner, [], res, depth + 1);
  });
  if (blanks.length) editable.write(applyBlanks(text, blanks));
  return { removed: blanks.length, gs: end };
}

function walk(
  content: string,
  gs: GS,
  gsStack: GS[],
  onShow: (gs: GS, chars: number, span: { a: number; b: number }) => void,
  onDo?: (name: string, gs: GS) => void,
): GS {
  const toks = tokenize(content);
  const stack: Tok[] = [];
  for (const tok of toks) {
    if (tok.t !== "op") {
      stack.push(tok);
      continue;
    }
    const op = tok.v;
    if (op === "q") {
      gsStack.push(clone(gs));
    } else if (op === "Q") {
      const prev = gsStack.pop();
      if (prev) gs = prev;
    } else if (op === "cm") {
      const m = popMatrix(stack);
      if (m) gs.ctm = mul(gs.ctm, m);
    } else if (op === "BT") {
      gs.tm = [...ID];
      gs.tlm = [...ID];
    } else if (op === "ET") {
      /* text object ends; matrix no longer used */
    } else if (op === "Tm") {
      const m = popMatrix(stack);
      if (m) {
        gs.tm = m;
        gs.tlm = [...m];
      }
    } else if (op === "Td" || op === "TD") {
      const ty = popNum(stack) ?? 0;
      const tx = popNum(stack) ?? 0;
      const next = mul(gs.tlm, [1, 0, 0, 1, tx, ty]);
      gs.tlm = next;
      gs.tm = [...next];
    } else if (op === "T*") {
      const next = mul(gs.tlm, [1, 0, 0, 1, 0, -gs.fs]);
      gs.tlm = next;
      gs.tm = [...next];
    } else if (op === "Tf") {
      gs.fs = Math.abs(popNum(stack) ?? gs.fs) || gs.fs;
      popName(stack);
    } else if (op === "Tz") {
      gs.th = popNum(stack) ?? gs.th;
    } else if (op === "Tj" || op === "'" || op === '"') {
      if (op === "'") {
        const next = mul(gs.tlm, [1, 0, 0, 1, 0, -gs.fs]);
        gs.tlm = next;
        gs.tm = [...next];
      }
      if (op === '"') {
        popNum(stack);
        popNum(stack);
      }
      const s = popStr(stack);
      if (s) {
        onShow(gs, s.chars, s);
        advance(gs, s.chars, 0);
      }
    } else if (op === "TJ") {
      const arr = popArr(stack);
      if (arr) {
        for (const item of arr.items) {
          if (item.t === "n") advance(gs, 0, item.v);
          else if (item.t === "s") {
            onShow(gs, item.chars, item);
            advance(gs, item.chars, 0);
          }
        }
      }
    } else if (op === "Do") {
      const name = popName(stack);
      if (name) onDo?.(name, gs);
    }
    stack.length = 0;
  }
  return gs;
}

function hits(gs: GS, _chars: number, pageW: number, pageH: number, rects: NormRect[]): boolean {
  const trm = mul(gs.ctm, gs.tm);
  const px = trm[4] / pageW;
  const py = (pageH - trm[5]) / pageH;
  const slopX = 0.015;
  const slopY = 0.02;
  for (const r of rects) {
    if (px >= r.x - slopX && px <= r.x + r.w + slopX && py >= r.y - slopY && py <= r.y + r.h + slopY) return true;
  }
  return false;
}

function advance(gs: GS, chars: number, tjNumber: number) {
  const tx = (chars * gs.fs * 0.5 - (tjNumber / 1000) * gs.fs) * (gs.th / 100);
  gs.tm = mul(gs.tm, [1, 0, 0, 1, tx, 0]);
}

function mul(m2: M, m1: M): M {
  const [a1, b1, c1, d1, e1, f1] = m1;
  const [a2, b2, c2, d2, e2, f2] = m2;
  return [
    a2 * a1 + c2 * b1,
    b2 * a1 + d2 * b1,
    a2 * c1 + c2 * d1,
    b2 * c1 + d2 * d1,
    a2 * e1 + c2 * f1 + e2,
    b2 * e1 + d2 * f1 + f2,
  ];
}

function clone(gs: GS): GS {
  return { ctm: [...gs.ctm], tm: [...gs.tm], tlm: [...gs.tlm], fs: gs.fs, th: gs.th };
}

function popNum(stack: Tok[]): number | undefined {
  const t = stack.pop();
  return t && t.t === "n" ? t.v : undefined;
}

function popStr(stack: Tok[]): Extract<Tok, { t: "s" }> | undefined {
  const t = stack.pop();
  return t && t.t === "s" ? t : undefined;
}

function popName(stack: Tok[]): string | undefined {
  const t = stack.pop();
  return t && t.t === "name" ? t.v : undefined;
}

function popArr(stack: Tok[]): Extract<Tok, { t: "arr" }> | undefined {
  const t = stack.pop();
  return t && t.t === "arr" ? t : undefined;
}

function popMatrix(stack: Tok[]): M | undefined {
  const f = popNum(stack);
  const e = popNum(stack);
  const d = popNum(stack);
  const c = popNum(stack);
  const b = popNum(stack);
  const a = popNum(stack);
  if (a === undefined || b === undefined || c === undefined || d === undefined || e === undefined || f === undefined) return undefined;
  return [a, b, c, d, e, f];
}

function applyBlanks(content: string, blanks: { a: number; b: number }[]): string {
  const ordered = [...blanks].sort((p, q) => q.a - p.a);
  let out = content;
  for (const b of ordered) {
    const empty = out[b.a] === "<" ? "<>" : "()";
    out = out.slice(0, b.a) + empty + out.slice(b.b);
  }
  return out;
}

function findForm(
  resources: { lookup: (key: unknown) => unknown },
  name: string,
): RawStream | undefined {
  const xo = resources.lookup(PDFName.XObject);
  if (!isDict(xo)) return undefined;
  for (const [key, value] of xo.entries()) {
    const label = nameOf(key);
    if (label !== name && label !== `/${name}` && label.slice(1) !== name) continue;
    const stream = isRaw(value) ? value : undefined;
    if (!stream) continue;
    const sub = stream.dict.lookup(PDFName.of("Subtype"));
    const subName = nameOf(sub);
    if (subName === "Form" || subName === "/Form") return stream;
  }
  return undefined;
}

function formMatrix(stream: RawStream): M {
  const m = stream.dict.lookup(PDFName.of("Matrix"));
  if (!isArr(m) || m.size() < 6) return [...ID];
  const nums: number[] = [];
  for (let i = 0; i < 6; i++) {
    const n = m.lookup(i) as { asNumber?: () => number } | undefined;
    nums.push(typeof n?.asNumber === "function" ? n.asNumber() : 0);
  }
  return nums as M;
}

function isDict(obj: unknown): obj is { lookup: (key: unknown) => unknown; entries: () => [unknown, unknown][] } {
  if (!obj || typeof obj !== "object") return false;
  const o = obj as { entries?: unknown; lookup?: unknown; contents?: unknown };
  return typeof o.entries === "function" && typeof o.lookup === "function" && !(o.contents instanceof Uint8Array);
}

function nameOf(obj: unknown): string {
  if (!obj || typeof obj !== "object") return "";
  const o = obj as { asString?: () => string };
  return typeof o.asString === "function" ? o.asString() : "";
}

function writeRaw(stream: RawStream, text: string) {
  const bytes = new Uint8Array(text.length);
  for (let i = 0; i < text.length; i++) bytes[i] = text.charCodeAt(i) & 0xff;
  stream.contents = bytes;
  stream.dict.delete(PDFName.of("Filter"));
  stream.dict.delete(PDFName.of("DecodeParms"));
}

function latin1(bytes: Uint8Array): string {
  let s = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    s += String.fromCharCode(...bytes.subarray(i, Math.min(bytes.length, i + 0x8000)));
  }
  return s;
}

function tokenize(s: string): Tok[] {
  return scan(s, 0, false).toks;
}

function scan(s: string, start: number, inArray: boolean): { toks: Tok[]; i: number } {
  const out: Tok[] = [];
  let i = start;
  const n = s.length;
  while (i < n) {
    const c = s.charCodeAt(i);
    if (c === 93 && inArray) return { toks: out, i: i + 1 };
    if (c === 37) {
      while (i < n && s.charCodeAt(i) !== 10 && s.charCodeAt(i) !== 13) i++;
      continue;
    }
    if (c <= 32) {
      i++;
      continue;
    }
    if (c === 40) {
      const a = i;
      i++;
      let depth = 1;
      while (i < n && depth > 0) {
        const ch = s.charCodeAt(i);
        if (ch === 92) {
          i += 2;
          continue;
        }
        if (ch === 40) depth++;
        else if (ch === 41) depth--;
        i++;
      }
      const raw = s.slice(a, i);
      out.push({ t: "s", chars: literalChars(raw), a, b: i });
      continue;
    }
    if (c === 60) {
      if (s.charCodeAt(i + 1) === 60) {
        i = skipDict(s, i);
        continue;
      }
      const a = i;
      i++;
      while (i < n && s.charCodeAt(i) !== 62) i++;
      i++;
      const raw = s.slice(a, i);
      out.push({ t: "s", chars: hexChars(raw), a, b: i });
      continue;
    }
    if (c === 91) {
      const inner = scan(s, i + 1, true);
      out.push({ t: "arr", items: inner.toks });
      i = inner.i;
      continue;
    }
    if (c === 47) {
      const a = i + 1;
      i++;
      while (i < n && !isDelim(s.charCodeAt(i))) i++;
      out.push({ t: "name", v: s.slice(a, i) });
      continue;
    }
    if (isNumStart(c, s.charCodeAt(i + 1))) {
      const a = i;
      i++;
      while (i < n && /[0-9.eE+-]/.test(s[i])) i++;
      out.push({ t: "n", v: Number(s.slice(a, i)) });
      continue;
    }
    const a = i;
    while (i < n && !isDelim(s.charCodeAt(i))) i++;
    const word = s.slice(a, i);
    if (word === "BI") {
      const end = s.indexOf("EI", i);
      i = end === -1 ? n : end + 2;
      continue;
    }
    out.push({ t: "op", v: word });
  }
  return { toks: out, i };
}

function skipDict(s: string, start: number): number {
  let i = start + 2;
  let depth = 1;
  while (i < s.length && depth > 0) {
    if (s.startsWith("<<", i)) {
      depth++;
      i += 2;
      continue;
    }
    if (s.startsWith(">>", i)) {
      depth--;
      i += 2;
      continue;
    }
    const c = s.charCodeAt(i);
    if (c === 40) {
      i++;
      let d = 1;
      while (i < s.length && d > 0) {
        if (s.charCodeAt(i) === 92) i += 2;
        else {
          if (s.charCodeAt(i) === 40) d++;
          else if (s.charCodeAt(i) === 41) d--;
          i++;
        }
      }
      continue;
    }
    i++;
  }
  return i;
}

function isDelim(c: number): boolean {
  return c <= 32 || c === 37 || c === 40 || c === 41 || c === 47 || c === 60 || c === 62 || c === 91 || c === 93 || c === 123 || c === 125;
}

function isNumStart(c: number, next: number | undefined): boolean {
  if (c >= 48 && c <= 57) return true;
  if (c === 46 && next !== undefined && next >= 48 && next <= 57) return true;
  if ((c === 43 || c === 45) && next !== undefined && ((next >= 48 && next <= 57) || next === 46)) return true;
  return false;
}

function literalChars(raw: string): number {
  let n = 0;
  for (let i = 1; i < raw.length - 1; i++) {
    if (raw[i] === "\\") {
      const e = raw[i + 1];
      if (e >= "0" && e <= "7") {
        i++;
        let k = 1;
        while (k < 3 && raw[i + 1] >= "0" && raw[i + 1] <= "7") {
          i++;
          k++;
        }
      } else i++;
    }
    n++;
  }
  return Math.max(n, 1);
}

function hexChars(raw: string): number {
  const hex = raw.slice(1, -1).replace(/\s+/g, "");
  return Math.max(1, Math.floor(hex.length / 2));
}
