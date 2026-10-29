import type { ExportFormat, FolioDoc } from "./types";
import { mimeFor } from "./types";
import { stemOf } from "@/lib/utils";
import {
  bakePdf,
  canvasToJpeg,
  canvasToPng,
  loadPdfjs,
  openPdfJs,
  pagePlainText,
  pdfFromImages,
  renderPageToCanvas,
} from "./pdf";
import {
  csvFromSheet,
  docxFromHtml,
  htmlToMd,
  htmlToPdfBytes,
  htmlToText,
  mdToHtml,
  pptxFromSlides,
  sheetsFromXlsx,
  textOfDoc,
  xlsxFromSheets,
} from "./office";

export async function convertDoc(
  doc: FolioDoc,
  format: ExportFormat,
): Promise<{ blob: Blob; filename: string }> {
  const stem = stemOf(doc.name) || "document";
  const filename = `${stem}.${format === "jpg" ? "jpg" : format}`;
  const blob = await toBlob(doc, format);
  return { blob, filename };
}

async function toBlob(doc: FolioDoc, format: ExportFormat): Promise<Blob> {
  switch (format) {
    case "pdf":
      return new Blob([await toPdf(doc)] as BlobPart[], { type: mimeFor("pdf") });
    case "docx":
      return docxFromHtml(await toHtml(doc), stemOf(doc.name));
    case "pptx":
      return pptxFromSlides(await toSlides(doc), stemOf(doc.name));
    case "xlsx":
      return xlsxFromSheets(await toSheets(doc));
    case "csv":
      return new Blob([csvFromSheet((await toSheets(doc))[0])], { type: mimeFor("csv") });
    case "txt":
      return new Blob([await toText(doc)], { type: mimeFor("txt") });
    case "md":
      return new Blob([await toMd(doc)], { type: mimeFor("md") });
    case "html":
      return new Blob([wrapHtml(await toHtml(doc), stemOf(doc.name))], {
        type: mimeFor("html"),
      });
    case "png":
      return toImage(doc, "png");
    case "jpg":
      return toImage(doc, "jpg");
  }
}

async function toPdf(doc: FolioDoc): Promise<Uint8Array> {
  if (doc.kind === "pdf") return bakePdf(doc);
  if (doc.kind === "image") {
    const mime = guessImageMime(doc.name);
    return pdfFromImages([{ bytes: doc.bytes, mime }]);
  }
  if (doc.html) return htmlToPdfBytes(doc.html);
  if (doc.slides) {
    const html = doc.slides
      .map(
        (s) =>
          `<section style="page-break-after:always;padding:48px 32px"><h1>${esc(s.title)}</h1><p>${esc(s.body).replace(/\n/g, "<br/>")}</p></section>`,
      )
      .join("");
    return htmlToPdfBytes(html);
  }
  if (doc.sheets) {
    const html = doc.sheets
      .map((s) => {
        const rows = s.rows
          .map(
            (r) =>
              `<tr>${r.map((c) => `<td style="border:1px solid #d6d0c6;padding:6px 8px">${esc(c)}</td>`).join("")}</tr>`,
          )
          .join("");
        return `<h2>${esc(s.name)}</h2><table style="border-collapse:collapse;width:100%">${rows}</table>`;
      })
      .join("");
    return htmlToPdfBytes(html);
  }
  return htmlToPdfBytes(`<pre>${esc(textOfDoc(doc))}</pre>`);
}

async function toHtml(doc: FolioDoc): Promise<string> {
  if (doc.html) return doc.html;
  if (doc.kind === "md" && doc.text) return mdToHtml(doc.text);
  if (doc.slides) {
    return doc.slides
      .map((s) => `<h1>${esc(s.title)}</h1><p>${esc(s.body).replace(/\n/g, "<br/>")}</p>`)
      .join("");
  }
  if (doc.kind === "pdf") {
    const text = await extractPdfText(doc);
    return text
      .split("\n\n")
      .map((p) => `<p>${esc(p).replace(/\n/g, "<br/>")}</p>`)
      .join("");
  }
  return `<p>${esc(textOfDoc(doc)).replace(/\n/g, "<br/>")}</p>`;
}

async function toText(doc: FolioDoc): Promise<string> {
  if (doc.kind === "pdf") return extractPdfText(doc);
  return textOfDoc(doc);
}

async function toMd(doc: FolioDoc): Promise<string> {
  if (doc.kind === "md" && doc.text) return doc.text;
  if (doc.html) return htmlToMd(doc.html);
  return await toText(doc);
}

async function toSlides(doc: FolioDoc) {
  if (doc.slides?.length) return doc.slides;
  const text = await toText(doc);
  const chunks = text.split(/\n{2,}/).filter(Boolean);
  if (!chunks.length) {
    return [{ id: "s1", title: stemOf(doc.name), body: "", notes: "", bg: "#f3eee4" }];
  }
  return chunks.slice(0, 24).map((c, i) => {
    const [title, ...rest] = c.split("\n");
    return {
      id: `s${i}`,
      title: title.slice(0, 80),
      body: rest.join("\n") || c,
      notes: "",
      bg: "#f3eee4",
    };
  });
}

async function toSheets(doc: FolioDoc) {
  if (doc.sheets?.length) return doc.sheets;
  if (doc.kind === "xlsx" || doc.kind === "csv") {
    try {
      return await sheetsFromXlsx(doc.bytes);
    } catch {
      /* fall through */
    }
  }
  const text = await toText(doc);
  const rows = text.split("\n").map((line) => {
    const cells = line.split(/\t|,/).map((c) => c.trim());
    while (cells.length < 8) cells.push("");
    return cells;
  });
  return [{ name: "Sheet1", rows }];
}

async function extractPdfText(doc: FolioDoc): Promise<string> {
  const pdf = await openPdfJs(doc.bytes);
  const parts: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    parts.push(await pagePlainText(page));
  }
  await pdf.cleanup();
  return parts.join("\n\n");
}

async function toImage(doc: FolioDoc, kind: "png" | "jpg"): Promise<Blob> {
  const canvas = document.createElement("canvas");
  if (doc.kind === "pdf") {
    const pdf = await openPdfJs(doc.bytes);
    const page = await pdf.getPage(1);
    await renderPageToCanvas(page, canvas, 2, doc.pages[0]?.rotation ?? 0);
    await pdf.cleanup();
  } else if (doc.kind === "image") {
    const url = URL.createObjectURL(new Blob([doc.bytes]));
    await drawUrl(canvas, url);
    URL.revokeObjectURL(url);
  } else if (doc.slides?.[0]) {
    await drawSlide(canvas, doc.slides[0].title, doc.slides[0].body);
  } else {
    await drawSlide(canvas, stemOf(doc.name), (await toText(doc)).slice(0, 800));
  }
  return kind === "png" ? canvasToPng(canvas) : canvasToJpeg(canvas, 0.9);
}

function drawUrl(canvas: HTMLCanvasElement, url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("canvas"));
      ctx.drawImage(img, 0, 0);
      resolve();
    };
    img.onerror = () => reject(new Error("image"));
    img.src = url;
  });
}

async function drawSlide(canvas: HTMLCanvasElement, title: string, body: string) {
  canvas.width = 1600;
  canvas.height = 900;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.fillStyle = "#f3eee4";
  ctx.fillRect(0, 0, 1600, 900);
  ctx.fillStyle = "#1c1917";
  ctx.font = "600 54px Georgia, serif";
  ctx.fillText(title.slice(0, 48), 96, 180);
  ctx.fillStyle = "#44403c";
  ctx.font = "28px IBM Plex Sans, sans-serif";
  wrapFill(ctx, body, 96, 260, 1400, 36);
}

function wrapFill(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxW: number,
  lh: number,
) {
  const words = text.split(/\s+/);
  let line = "";
  let yy = y;
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxW) {
      ctx.fillText(line, x, yy);
      line = w;
      yy += lh;
      if (yy > 820) break;
    } else line = test;
  }
  if (line) ctx.fillText(line, x, yy);
}

function wrapHtml(body: string, title: string) {
  return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(title)}</title>
  <style>body{font:16px/1.55 IBM Plex Sans,sans-serif;color:#1c1917;background:#f3eee4;margin:48px auto;max-width:720px;padding:0 24px}h1{font-family:Fraunces,Georgia,serif}</style>
  </head><body>${body}</body></html>`;
}

function esc(s: string) {
  return s
    .replace(/&/g, "&" + "amp;")
    .replace(/</g, "&" + "lt;")
    .replace(/>/g, "&" + "gt;");
}

function guessImageMime(name: string) {
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
  if (ext === "webp") return "image/webp";
  if (ext === "gif") return "image/gif";
  return "image/png";
}

export { loadPdfjs };
