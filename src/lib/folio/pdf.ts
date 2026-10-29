import { PDFDocument, StandardFonts, rgb, degrees, LineCapStyle, type PDFFont, type PDFPage, type RGB } from "pdf-lib";
import type { Annot, FolioDoc, PageMeta, Point } from "./types";
import { uid, asArrayBuffer } from "@/lib/utils";

export type PdfJs = typeof import("pdfjs-dist");
export type PdfDocProxy = import("pdfjs-dist").PDFDocumentProxy;
export type PdfPageProxy = import("pdfjs-dist").PDFPageProxy;

let pdfjsMod: PdfJs | null = null;

export async function loadPdfjs(): Promise<PdfJs> {
  if (pdfjsMod) return pdfjsMod;
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdfjs/pdf.worker.min.mjs";
  pdfjsMod = pdfjs;
  return pdfjs;
}

export async function openPdfJs(
  bytes: ArrayBuffer,
  password?: string,
): Promise<PdfDocProxy> {
  const pdfjs = await loadPdfjs();
  const data = new Uint8Array(bytes.slice(0));
  const task = pdfjs.getDocument({
    data,
    password,
    cMapUrl: "/pdfjs/cmaps/",
    cMapPacked: true,
    standardFontDataUrl: "/pdfjs/standard_fonts/",
    wasmUrl: "/pdfjs/wasm/",
    useSystemFonts: true,
    verbosity: 0,
  });
  return task.promise;
}

export type TextItem = {
  str: string;
  left: number;
  top: number;
  width: number;
  height: number;
  fontSize: number;
  nx: number;
  ny: number;
  nw: number;
  nh: number;
};

export async function extractPageText(
  page: PdfPageProxy,
  viewportWidth: number,
  viewportHeight: number,
  viewportTransform: number[],
): Promise<TextItem[]> {
  const pdfjs = await loadPdfjs();
  const content = await page.getTextContent();
  const items: TextItem[] = [];
  for (const raw of content.items) {
    if (!("str" in raw) || !raw.str) continue;
    const it = raw as {
      str: string;
      transform: number[];
      width: number;
      height: number;
    };
    const tx = pdfjs.Util.transform(viewportTransform, it.transform) as number[];
    const fontSize = Math.hypot(tx[2] ?? 0, tx[3] ?? 0) || 12;
    const left = tx[4] ?? 0;
    const top = (tx[5] ?? 0) - fontSize;
    const native = Math.hypot(it.transform[2] ?? 0, it.transform[3] ?? 12) || 12;
    const width = (it.width || it.str.length * native * 0.5) * (fontSize / native);
    const height = fontSize * 1.15;
    items.push({
      str: it.str,
      left,
      top,
      width,
      height,
      fontSize,
      nx: left / viewportWidth,
      ny: top / viewportHeight,
      nw: width / viewportWidth,
      nh: height / viewportHeight,
    });
  }
  return items;
}

export async function pagePlainText(page: PdfPageProxy): Promise<string> {
  const content = await page.getTextContent();
  const parts: string[] = [];
  let line = "";
  let lastY: number | null = null;
  for (const raw of content.items) {
    if (!("str" in raw)) continue;
    const it = raw as { str: string; transform: number[] };
    const y = it.transform[5];
    if (lastY !== null && Math.abs(lastY - y) > 4) {
      parts.push(line);
      line = it.str;
    } else {
      line += it.str;
    }
    lastY = y;
  }
  if (line) parts.push(line);
  return parts.join("\n");
}

export async function renderPageToCanvas(
  page: PdfPageProxy,
  canvas: HTMLCanvasElement,
  scale: number,
  rotation: number,
): Promise<{ width: number; height: number }> {
  const viewport = page.getViewport({ scale, rotation });
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);
  canvas.style.width = `${viewport.width}px`;
  canvas.style.height = `${viewport.height}px`;
  const task = page.render({
    canvas,
    canvasContext: ctx,
    viewport,
  });
  await task.promise;
  return { width: viewport.width, height: viewport.height };
}

function hexToRgb(hex: string): RGB {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
}

function nToPdf(page: PDFPage, x: number, y: number, w: number, h: number) {
  const { width, height } = page.getSize();
  return {
    x: x * width,
    y: height - (y + h) * height,
    width: w * width,
    height: h * height,
  };
}

async function embedImage(pdf: PDFDocument, src: string) {
  const res = await fetch(src);
  const buf = await res.arrayBuffer();
  const bytes = new Uint8Array(buf);
  if (src.startsWith("data:image/jpeg") || src.includes("image/jpeg")) {
    return pdf.embedJpg(bytes);
  }
  return pdf.embedPng(bytes);
}

function drawArrow(page: PDFPage, from: Point, to: Point, color: RGB, thickness: number) {
  const { width, height } = page.getSize();
  const x1 = from.x * width;
  const y1 = height - from.y * height;
  const x2 = to.x * width;
  const y2 = height - to.y * height;
  page.drawLine({
    start: { x: x1, y: y1 },
    end: { x: x2, y: y2 },
    thickness,
    color,
  });
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const head = 10;
  page.drawLine({
    start: { x: x2, y: y2 },
    end: { x: x2 - head * Math.cos(angle - Math.PI / 6), y: y2 - head * Math.sin(angle - Math.PI / 6) },
    thickness,
    color,
  });
  page.drawLine({
    start: { x: x2, y: y2 },
    end: { x: x2 - head * Math.cos(angle + Math.PI / 6), y: y2 - head * Math.sin(angle + Math.PI / 6) },
    thickness,
    color,
  });
}

export async function bakePdf(doc: FolioDoc): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(doc.bytes, { ignoreEncryption: true });
  const helv = await pdf.embedFont(StandardFonts.Helvetica);
  const helvBold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const times = await pdf.embedFont(StandardFonts.TimesRoman);

  const keep = doc.pages.filter((p) => p.source >= 0 && p.source < pdf.getPageCount());
  if (keep.length && keep.length !== pdf.getPageCount()) {
    const rebuilt = await PDFDocument.create();
    const indices = keep.map((p) => p.source);
    const copied = await rebuilt.copyPages(pdf, indices);
    copied.forEach((pg) => rebuilt.addPage(pg));
    const saved = await rebuilt.save();
    return bakePdf({
      ...doc,
      bytes: asArrayBuffer(saved),
      pages: keep.map((p, i) => ({ ...p, source: i })),
    });
  }

  const pages = pdf.getPages();
  for (const meta of doc.pages) {
    const page = pages[meta.source];
    if (!page) continue;
    if (meta.rotation) page.setRotation(degrees(meta.rotation));
  }

  for (const a of doc.annotations) {
    const page = pages[a.page];
    if (!page) continue;
    await drawAnnot(pdf, page, a, { helv, helvBold, times });
  }

  if (doc.watermark?.text) {
    for (const page of pages) {
      const { width, height } = page.getSize();
      page.drawText(doc.watermark.text, {
        x: width * 0.18,
        y: height * 0.4,
        size: 42,
        font: helvBold,
        color: rgb(0.6, 0.6, 0.62),
        opacity: doc.watermark.opacity ?? 0.16,
        rotate: degrees(32),
      });
    }
  }

  if (doc.pageNumbers) {
    pages.forEach((page, i) => {
      const { width } = page.getSize();
      const label = `${i + 1} / ${pages.length}`;
      page.drawText(label, {
        x: width / 2 - helv.widthOfTextAtSize(label, 9) / 2,
        y: 18,
        size: 9,
        font: helv,
        color: rgb(0.4, 0.4, 0.4),
      });
    });
  }

  return pdf.save({ useObjectStreams: true });
}

async function drawAnnot(
  pdf: PDFDocument,
  page: PDFPage,
  a: Annot,
  fonts: { helv: PDFFont; helvBold: PDFFont; times: PDFFont },
) {
  const { width: pw, height: ph } = page.getSize();
  switch (a.type) {
    case "highlight": {
      const r = nToPdf(page, a.x, a.y, a.w, a.h);
      page.drawRectangle({ ...r, color: hexToRgb(a.color), opacity: 0.38 });
      break;
    }
    case "redact": {
      const r = nToPdf(page, a.x, a.y, a.w, a.h);
      page.drawRectangle({ ...r, color: rgb(0, 0, 0) });
      break;
    }
    case "underline":
    case "strike": {
      const y = a.type === "underline" ? a.y + a.h * 0.85 : a.y + a.h * 0.5;
      page.drawLine({
        start: { x: a.x * pw, y: ph - y * ph },
        end: { x: (a.x + a.w) * pw, y: ph - y * ph },
        thickness: 1.4,
        color: hexToRgb(a.color),
      });
      break;
    }
    case "rect": {
      const r = nToPdf(page, a.x, a.y, a.w, a.h);
      page.drawRectangle({
        ...r,
        borderColor: hexToRgb(a.color),
        borderWidth: a.strokeWidth,
        color: a.fill ? hexToRgb(a.color) : undefined,
        opacity: a.fill ? 0.18 : 1,
      });
      break;
    }
    case "ellipse": {
      const r = nToPdf(page, a.x, a.y, a.w, a.h);
      page.drawEllipse({
        x: r.x + r.width / 2,
        y: r.y + r.height / 2,
        xScale: Math.abs(r.width) / 2,
        yScale: Math.abs(r.height) / 2,
        borderColor: hexToRgb(a.color),
        borderWidth: a.strokeWidth,
        color: a.fill ? hexToRgb(a.color) : undefined,
        opacity: a.fill ? 0.18 : 1,
      });
      break;
    }
    case "line": {
      page.drawLine({
        start: { x: a.x * pw, y: ph - a.y * ph },
        end: { x: (a.x + a.w) * pw, y: ph - (a.y + a.h) * ph },
        thickness: a.strokeWidth,
        color: hexToRgb(a.color),
      });
      break;
    }
    case "arrow": {
      drawArrow(page, { x: a.x, y: a.y }, { x: a.x + a.w, y: a.y + a.h }, hexToRgb(a.color), a.strokeWidth);
      break;
    }
    case "pen": {
      if (a.points.length < 2) break;
      for (let i = 1; i < a.points.length; i++) {
        const p0 = a.points[i - 1];
        const p1 = a.points[i];
        page.drawLine({
          start: { x: p0.x * pw, y: ph - p0.y * ph },
          end: { x: p1.x * pw, y: ph - p1.y * ph },
          thickness: a.strokeWidth,
          color: hexToRgb(a.color),
          lineCap: LineCapStyle.Round,
        });
      }
      break;
    }
    case "text":
    case "replace": {
      if (a.type === "replace") {
        const r = nToPdf(page, a.x, a.y, a.w, a.h);
        page.drawRectangle({ ...r, color: rgb(1, 1, 1) });
      }
      const font = a.type === "text" && a.bold ? fonts.helvBold : fonts.helv;
      const size = a.fontSize;
      const lines = a.text.split("\n");
      lines.forEach((line, i) => {
        const x = a.x * pw + 2;
        const y = ph - a.y * ph - size * (i + 0.9);
        try {
          page.drawText(winAnsi(line), {
            x,
            y,
            size,
            font,
            color: hexToRgb(a.color),
          });
        } catch {
          page.drawText(winAnsi(line), { x, y, size, font: fonts.helv, color: hexToRgb(a.color) });
        }
      });
      break;
    }
    case "image":
    case "sign": {
      try {
        const img = await embedImage(pdf, a.src);
        const r = nToPdf(page, a.x, a.y, a.w, a.h);
        page.drawImage(img, r);
      } catch {
        /* skip broken image */
      }
      break;
    }
    case "stamp": {
      const r = nToPdf(page, a.x, a.y, a.w, a.h);
      const label = a.stamp.toUpperCase();
      page.drawRectangle({
        ...r,
        borderColor: hexToRgb(a.color),
        borderWidth: 3,
      });
      const size = Math.min(18, r.height * 0.4);
      const tw = fonts.helvBold.widthOfTextAtSize(label, size);
      page.drawText(label, {
        x: r.x + (r.width - tw) / 2,
        y: r.y + r.height / 2 - size / 3,
        size,
        font: fonts.helvBold,
        color: hexToRgb(a.color),
      });
      break;
    }
    case "note": {
      const r = nToPdf(page, a.x, a.y, 0.18, 0.08);
      page.drawRectangle({ ...r, color: rgb(0.95, 0.84, 0.42) });
      page.drawText(winAnsi(a.text.slice(0, 80)), {
        x: r.x + 4,
        y: r.y + r.height - 14,
        size: 8,
        font: fonts.helv,
        color: rgb(0.15, 0.12, 0.1),
        maxWidth: r.width - 8,
      });
      break;
    }
  }
}

function winAnsi(s: string): string {
  return s.replace(/[^\x00-\x7E]/g, (ch) => {
    const map: Record<string, string> = {
      "’": "'",
      "‘": "'",
      "“": '"',
      "”": '"',
      "–": "-",
      "—": "-",
      "…": "...",
      "•": "*",
    };
    return map[ch] ?? "?";
  });
}

export async function mergePdfs(buffers: ArrayBuffer[]): Promise<Uint8Array> {
  const out = await PDFDocument.create();
  for (const buf of buffers) {
    const src = await PDFDocument.load(buf, { ignoreEncryption: true });
    const pages = await out.copyPages(src, src.getPageIndices());
    pages.forEach((p) => out.addPage(p));
  }
  return out.save({ useObjectStreams: true });
}

export async function pdfFromImages(images: { bytes: ArrayBuffer; mime: string }[]): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  for (const img of images) {
    const bytes = new Uint8Array(img.bytes);
    const embedded =
      img.mime.includes("jpeg") || img.mime.includes("jpg")
        ? await pdf.embedJpg(bytes)
        : await pdf.embedPng(bytes);
    const page = pdf.addPage([embedded.width, embedded.height]);
    page.drawImage(embedded, { x: 0, y: 0, width: embedded.width, height: embedded.height });
  }
  return pdf.save();
}

export async function blankPdf(title = "Untitled"): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([612, 792]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  page.drawText(winAnsi(title), {
    x: 56,
    y: 730,
    size: 18,
    font,
    color: rgb(0.12, 0.11, 0.1),
  });
  return pdf.save();
}

export function defaultPages(count: number): PageMeta[] {
  return Array.from({ length: count }, (_, i) => ({
    id: uid("pg"),
    source: i,
    rotation: 0 as const,
  }));
}

export async function canvasToJpeg(canvas: HTMLCanvasElement, quality = 0.86): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("encode failed"))), "image/jpeg", quality);
  });
}

export async function canvasToPng(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("encode failed"))), "image/png");
  });
}
