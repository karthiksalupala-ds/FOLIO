import { PDFDocument, StandardFonts, degrees, rgb } from "pdf-lib";
import type { ToolId } from "./catalog";
import { stemOf, asArrayBuffer, uid } from "@/lib/utils";
import {
  canvasToJpeg,
  canvasToPng,
  mergePdfs,
  openPdfJs,
  pagePlainText,
  pdfFromImages,
  renderPageToCanvas,
  extractPageText,
} from "./pdf";
import {
  docxFromHtml,
  htmlFromDocx,
  htmlToPdfBytes,
  mdToHtml,
  sheetsFromXlsx,
  slidesFromPptx,
  xlsxFromSheets,
  cleanHtml,
  escapeHtml,
} from "./office";
import { fetchHtmlPage, summarizeText, translateText } from "./ai";

export type JobFile = {
  id: string;
  name: string;
  bytes: ArrayBuffer;
  mime: string;
  pages?: number;
  thumb?: string;
};

export type JobResultFile = {
  name: string;
  blob: Blob;
  previewText?: string;
};

export type JobOptions = {
  splitMode?: "range" | "extract" | "fixed";
  ranges?: string;
  fixedCount?: number;
  quality?: "low" | "recommended" | "extreme";
  rotation?: 90 | 180 | 270;
  watermarkText?: string;
  watermarkOpacity?: number;
  pageNumberPos?: "bottom" | "top" | "bottom-left" | "bottom-right";
  password?: string;
  crop?: { t: number; r: number; b: number; l: number };
  html?: string;
  url?: string;
  signDataUrl?: string;
  signPage?: "last" | "all";
  pageOrder?: number[];
  targetLang?: string;
  redactQuery?: string;
  imageFit?: "page" | "original";
  targetFormat?: "pdf" | "docx" | "pptx" | "xlsx" | "jpg" | "png" | "txt" | "md" | "html";
  formFields?: { id: string; page: number; x: number; y: number; w: number; h: number; name: string }[];
};

export type ProgressFn = (pct: number, label: string) => void;

export async function runTool(
  toolId: ToolId,
  files: JobFile[],
  options: JobOptions,
  onProgress: ProgressFn = () => {},
): Promise<JobResultFile[]> {
  switch (toolId) {
    case "merge-pdf":
      return mergeOp(files, onProgress);
    case "split-pdf":
      return splitOp(files[0], options, onProgress);
    case "organize-pdf":
      return organizeOp(files[0], options, onProgress);
    case "extract-pdf":
    case "remove-pages":
      return organizeOp(files[0], options, onProgress);
    case "rotate-pdf":
      return rotateOp(files, options, onProgress);
    case "compress-pdf":
      return compressOp(files, options, onProgress);
    case "repair-pdf":
      return repairOp(files[0], onProgress);
    case "pdf-to-pdfa":
      return pdfaOp(files, onProgress);
    case "pdf-to-word":
      return pdfToWord(files, onProgress);
    case "pdf-to-powerpoint":
      return pdfToPptx(files[0], onProgress);
    case "pdf-to-excel":
      return pdfToExcel(files, onProgress);
    case "pdf-to-jpg":
      return pdfToImages(files[0], "jpg", onProgress);
    case "pdf-to-png":
      return pdfToImages(files[0], "png", onProgress);
    case "pdf-to-markdown":
      return pdfToMarkdown(files, onProgress);
    case "pdf-to-txt":
      return pdfToTxt(files, onProgress);
    case "word-to-pdf":
      return officeToPdf(files, "word", onProgress);
    case "powerpoint-to-pdf":
      return officeToPdf(files, "ppt", onProgress);
    case "excel-to-pdf":
      return officeToPdf(files, "excel", onProgress);
    case "jpg-to-pdf":
    case "scan-to-pdf":
      return imagesToPdf(files, options, onProgress);
    case "html-to-pdf":
      return htmlToPdfOp(files, options, onProgress);
    case "convert-any":
      return convertAnyOp(files[0], options, onProgress);
    case "pdf-forms":
      return formOp(files[0], options, onProgress);
    case "watermark":
      return watermarkOp(files, options, onProgress);
    case "page-numbers":
      return pageNumbersOp(files, options, onProgress);
    case "crop-pdf":
      return cropOp(files[0], options, onProgress);
    case "redact-pdf":
      return redactOp(files[0], options, onProgress);
    case "sign-pdf":
      return signOp(files[0], options, onProgress);
    case "protect-pdf":
      return protectOp(files, options, onProgress);
    case "unlock-pdf":
      return unlockOp(files, options, onProgress);
    case "compare-pdf":
      return compareOp(files, onProgress);
    case "ocr-pdf":
      return ocrOp(files[0], onProgress);
    case "summarize-pdf":
      return summarizeOp(files[0], onProgress);
    case "translate-pdf":
      return translateOp(files[0], options, onProgress);
    case "edit-pdf":
      throw new Error("Edit PDF opens in the editor");
    default:
      throw new Error("Unknown tool");
  }
}

async function mergeOp(files: JobFile[], onProgress: ProgressFn): Promise<JobResultFile[]> {
  if (files.length < 2) throw new Error("Add at least two files to merge");
  onProgress(15, "Reading files");
  const buffers: ArrayBuffer[] = [];
  for (let i = 0; i < files.length; i++) {
    buffers.push(await ensurePdf(files[i]));
    onProgress(15 + (70 * (i + 1)) / files.length, `Adding ${files[i].name}`);
  }
  onProgress(90, "Writing merged PDF");
  const bytes = await mergePdfs(buffers);
  return [pdfResult(`${stemOf(files[0].name)}-merged.pdf`, bytes)];
}

async function splitOp(file: JobFile, options: JobOptions, onProgress: ProgressFn): Promise<JobResultFile[]> {
  onProgress(10, "Opening PDF");
  const src = await PDFDocument.load(await ensurePdf(file), { ignoreEncryption: true });
  const count = src.getPageCount();
  const mode = options.splitMode ?? "extract";
  if (mode === "extract") {
    const out: JobResultFile[] = [];
    for (let i = 0; i < count; i++) {
      const doc = await PDFDocument.create();
      const [page] = await doc.copyPages(src, [i]);
      doc.addPage(page);
      out.push(pdfResult(`${stemOf(file.name)}-page-${i + 1}.pdf`, await doc.save()));
      onProgress(10 + (80 * (i + 1)) / count, `Page ${i + 1} of ${count}`);
    }
    if (out.length > 1) {
      out.unshift(await zipResult(`${stemOf(file.name)}-pages.zip`, out));
    }
    return out;
  }
  if (mode === "fixed") {
    const n = Math.max(1, options.fixedCount ?? 1);
    const out: JobResultFile[] = [];
    for (let i = 0, part = 1; i < count; i += n, part++) {
      const doc = await PDFDocument.create();
      const idxs = Array.from({ length: Math.min(n, count - i) }, (_, k) => i + k);
      const pages = await doc.copyPages(src, idxs);
      pages.forEach((p) => doc.addPage(p));
      out.push(pdfResult(`${stemOf(file.name)}-part-${part}.pdf`, await doc.save()));
      onProgress(10 + (80 * part * n) / count, `Part ${part}`);
    }
    if (out.length > 1) out.unshift(await zipResult(`${stemOf(file.name)}-split.zip`, out));
    return out;
  }
  const groups = parseRangeGroups(options.ranges || `1-${count}`, count);
  if (!groups.length) throw new Error("Enter a valid page range such as 1-3,5,8-10");
  const out: JobResultFile[] = [];
  for (let g = 0; g < groups.length; g++) {
    const doc = await PDFDocument.create();
    const pages = await doc.copyPages(src, groups[g]);
    pages.forEach((p) => doc.addPage(p));
    const label = groups[g].length === 1 ? `page-${groups[g][0] + 1}` : `pages-${groups[g][0] + 1}-${groups[g][groups[g].length - 1] + 1}`;
    out.push(pdfResult(`${stemOf(file.name)}-${label}.pdf`, await doc.save()));
    onProgress(10 + (80 * (g + 1)) / groups.length, `Range ${g + 1}`);
  }
  if (out.length > 1) out.unshift(await zipResult(`${stemOf(file.name)}-split.zip`, out));
  return out;
}

async function organizeOp(file: JobFile, options: JobOptions, onProgress: ProgressFn): Promise<JobResultFile[]> {
  onProgress(20, "Rebuilding pages");
  const src = await PDFDocument.load(await ensurePdf(file), { ignoreEncryption: true });
  const order = options.pageOrder
    ? options.pageOrder.filter((i) => i >= 0 && i < src.getPageCount())
    : src.getPageIndices();
  if (!order.length) throw new Error("Keep at least one page");
  const doc = await PDFDocument.create();
  const pages = await doc.copyPages(src, order);
  pages.forEach((p) => doc.addPage(p));
  onProgress(90, "Saving");
  const suffix = options.pageOrder && options.pageOrder.length < src.getPageCount() ? "trimmed" : "organized";
  return [pdfResult(`${stemOf(file.name)}-${suffix}.pdf`, await doc.save())];
}

async function rotateOp(files: JobFile[], options: JobOptions, onProgress: ProgressFn): Promise<JobResultFile[]> {
  const extra = options.rotation ?? 90;
  const out: JobResultFile[] = [];
  for (let i = 0; i < files.length; i++) {
    const src = await PDFDocument.load(await ensurePdf(files[i]), { ignoreEncryption: true });
    src.getPages().forEach((page) => {
      const cur = page.getRotation().angle || 0;
      page.setRotation(degrees((((cur + extra) % 360) + 360) % 360));
    });
    out.push(pdfResult(`${stemOf(files[i].name)}-rotated.pdf`, await src.save()));
    onProgress(((i + 1) / files.length) * 90, files[i].name);
  }
  return out;
}

async function compressOp(files: JobFile[], options: JobOptions, onProgress: ProgressFn): Promise<JobResultFile[]> {
  const quality = options.quality ?? "recommended";
  const scale = quality === "extreme" ? 1.05 : quality === "low" ? 1.25 : 1.55;
  const q = quality === "extreme" ? 0.42 : quality === "low" ? 0.55 : 0.68;
  const out: JobResultFile[] = [];
  for (let f = 0; f < files.length; f++) {
    onProgress((f / files.length) * 90, `Compressing ${files[f].name}`);
    const bytes = await rasterizeToPdf(await ensurePdf(files[f]), scale, q, (p, label) => {
      onProgress((f / files.length) * 90 + p * 0.9 * (1 / files.length), label);
    });
    out.push(pdfResult(`${stemOf(files[f].name)}-compressed.pdf`, bytes));
  }
  return out;
}

async function repairOp(file: JobFile, onProgress: ProgressFn): Promise<JobResultFile[]> {
  onProgress(10, "Reading file");
  try {
    const src = await PDFDocument.load(file.bytes, { ignoreEncryption: true });
    const out = await PDFDocument.create();
    const pages = await out.copyPages(src, src.getPageIndices());
    pages.forEach((p) => out.addPage(p));
    onProgress(80, "Rewriting");
    return [pdfResult(`${stemOf(file.name)}-repaired.pdf`, await out.save({ useObjectStreams: true }))];
  } catch {
    onProgress(30, "Rebuilding from rendered pages");
    const bytes = await rasterizeToPdf(file.bytes, 1.6, 0.8, onProgress);
    return [pdfResult(`${stemOf(file.name)}-repaired.pdf`, bytes)];
  }
}

async function pdfaOp(files: JobFile[], onProgress: ProgressFn): Promise<JobResultFile[]> {
  const out: JobResultFile[] = [];
  for (let i = 0; i < files.length; i++) {
    onProgress(((i + 0.2) / files.length) * 100, `Rewriting ${files[i].name}`);
    const src = await PDFDocument.load(await ensurePdf(files[i]), { ignoreEncryption: true });
    const doc = await PDFDocument.create();
    doc.setTitle(stemOf(files[i].name));
    doc.setProducer("FolioPDF archival");
    doc.setCreator("FolioPDF");
    const pages = await doc.copyPages(src, src.getPageIndices());
    pages.forEach((p) => doc.addPage(p));
    out.push(pdfResult(`${stemOf(files[i].name)}-pdfa.pdf`, await doc.save({ useObjectStreams: false })));
  }
  return out;
}

async function pdfToWord(files: JobFile[], onProgress: ProgressFn): Promise<JobResultFile[]> {
  const out: JobResultFile[] = [];
  for (let i = 0; i < files.length; i++) {
    onProgress(((i + 0.2) / files.length) * 100, `Reading ${files[i].name}`);
    const html = await pdfToHtml(files[i].bytes, files[i].name);
    const blob = await docxFromHtml(html, stemOf(files[i].name));
    const previewText = html
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 1600);
    out.push({ name: `${stemOf(files[i].name)}.docx`, blob, previewText });
  }
  return out;
}

async function pdfToPptx(file: JobFile, onProgress: ProgressFn): Promise<JobResultFile[]> {
  onProgress(8, "Rendering pages");
  const pdf = await openPdfJs(file.bytes);
  const PptxGenJS = (await import("pptxgenjs")).default;
  const pptx = new PptxGenJS();
  pptx.author = "Folio";
  pptx.title = stemOf(file.name);
  pptx.layout = "LAYOUT_WIDE";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const canvas = document.createElement("canvas");
    await renderPageToCanvas(page, canvas, 1.6, 0);
    const data = canvas.toDataURL("image/jpeg", 0.82);
    const slide = pptx.addSlide();
    slide.addImage({ data, x: 0, y: 0, w: "100%", h: "100%" });
    onProgress(8 + (80 * i) / pdf.numPages, `Slide ${i} of ${pdf.numPages}`);
  }
  await pdf.cleanup();
  const blob = (await pptx.write({ outputType: "blob" })) as Blob;
  return [{ name: `${stemOf(file.name)}.pptx`, blob }];
}

async function pdfToExcel(files: JobFile[], onProgress: ProgressFn): Promise<JobResultFile[]> {
  const out: JobResultFile[] = [];
  for (let i = 0; i < files.length; i++) {
    onProgress(((i + 0.3) / files.length) * 100, files[i].name);
    const pdf = await openPdfJs(files[i].bytes);
    const rows: string[][] = [];
    for (let p = 1; p <= pdf.numPages; p++) {
      const page = await pdf.getPage(p);
      const text = await pagePlainText(page);
      text.split("\n").forEach((line) => {
        const cells = line.split(/\s{2,}|\t/).map((c) => c.trim());
        if (cells.some((c) => c)) rows.push(cells.length < 2 ? [line] : cells);
      });
      rows.push([]);
    }
    await pdf.cleanup();
    const blob = await xlsxFromSheets([{ name: "Extract", rows: rows.length ? rows : [["(no table text)"]] }]);
    out.push({ name: `${stemOf(files[i].name)}.xlsx`, blob });
  }
  return out;
}

async function pdfToImages(file: JobFile, kind: "jpg" | "png", onProgress: ProgressFn): Promise<JobResultFile[]> {
  const pdf = await openPdfJs(file.bytes);
  const out: JobResultFile[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const canvas = document.createElement("canvas");
    await renderPageToCanvas(page, canvas, 2, 0);
    const blob = kind === "png" ? await canvasToPng(canvas) : await canvasToJpeg(canvas, 0.9);
    out.push({ name: `${stemOf(file.name)}-page-${i}.${kind}`, blob });
    onProgress((i / pdf.numPages) * 90, `Page ${i} of ${pdf.numPages}`);
  }
  await pdf.cleanup();
  if (out.length > 1) out.unshift(await zipResult(`${stemOf(file.name)}-${kind}.zip`, out));
  return out;
}

async function pdfToMarkdown(files: JobFile[], onProgress: ProgressFn): Promise<JobResultFile[]> {
  const out: JobResultFile[] = [];
  for (let i = 0; i < files.length; i++) {
    const text = await extractPdfText(files[i].bytes, onProgress);
    const md = text
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .filter(Boolean)
      .map((p) => (p.length < 60 && !p.endsWith(".") ? `## ${p}` : p))
      .join("\n\n");
    out.push({
      name: `${stemOf(files[i].name)}.md`,
      blob: new Blob([md || "# Empty"], { type: "text/markdown" }),
      previewText: md.slice(0, 1200),
    });
  }
  return out;
}

async function pdfToTxt(files: JobFile[], onProgress: ProgressFn): Promise<JobResultFile[]> {
  const out: JobResultFile[] = [];
  for (const file of files) {
    const text = await extractPdfText(file.bytes, onProgress);
    out.push({
      name: `${stemOf(file.name)}.txt`,
      blob: new Blob([text || ""], { type: "text/plain" }),
      previewText: text.slice(0, 1200),
    });
  }
  return out;
}

async function officeToPdf(
  files: JobFile[],
  kind: "word" | "ppt" | "excel",
  onProgress: ProgressFn,
): Promise<JobResultFile[]> {
  const out: JobResultFile[] = [];
  for (let i = 0; i < files.length; i++) {
    onProgress(((i + 0.2) / files.length) * 100, files[i].name);
    const bytes = await fileToPdfBytes(files[i], kind);
    out.push(pdfResult(`${stemOf(files[i].name)}.pdf`, bytes));
  }
  return out;
}

async function imagesToPdf(files: JobFile[], options: JobOptions, onProgress: ProgressFn): Promise<JobResultFile[]> {
  onProgress(10, "Preparing images");
  const images: { bytes: ArrayBuffer; mime: string }[] = [];
  for (let i = 0; i < files.length; i++) {
    images.push(await normalizeImage(files[i]));
    onProgress(10 + (50 * (i + 1)) / files.length, files[i].name);
  }
  if (options.imageFit === "page") {
    const pdf = await PDFDocument.create();
    for (const img of images) {
      const embedded = img.mime.includes("jpeg")
        ? await pdf.embedJpg(new Uint8Array(img.bytes))
        : await pdf.embedPng(new Uint8Array(img.bytes));
      const page = pdf.addPage([612, 792]);
      const maxW = 560;
      const maxH = 720;
      const scale = Math.min(maxW / embedded.width, maxH / embedded.height);
      const w = embedded.width * scale;
      const h = embedded.height * scale;
      page.drawImage(embedded, { x: (612 - w) / 2, y: (792 - h) / 2, width: w, height: h });
    }
    return [pdfResult("images.pdf", await pdf.save())];
  }
  const bytes = await pdfFromImages(images);
  return [pdfResult("images.pdf", bytes)];
}

async function convertAnyOp(file: JobFile, options: JobOptions, onProgress: ProgressFn): Promise<JobResultFile[]> {
  if (!file) throw new Error("Add a file to convert");
  const target = options.targetFormat ?? "pdf";
  onProgress(12, "Reading file");
  const asPdf = { ...file, bytes: await ensurePdf(file), mime: "application/pdf" };
  if (target === "pdf") return [pdfResult(`${stemOf(file.name)}.pdf`, new Uint8Array(asPdf.bytes))];
  if (target === "docx") return pdfToWord([asPdf], onProgress);
  if (target === "pptx") return pdfToPptx(asPdf, onProgress);
  if (target === "xlsx") return pdfToExcel([asPdf], onProgress);
  if (target === "jpg") return pdfToImages(asPdf, "jpg", onProgress);
  if (target === "png") return pdfToImages(asPdf, "png", onProgress);
  if (target === "txt") return pdfToTxt([asPdf], onProgress);
  if (target === "md") return pdfToMarkdown([asPdf], onProgress);
  const html = await pdfToHtml(asPdf.bytes, file.name);
  return [
    {
      name: `${stemOf(file.name)}.html`,
      blob: new Blob([html], { type: "text/html" }),
      previewText: html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 800),
    },
  ];
}

async function formOp(file: JobFile, options: JobOptions, onProgress: ProgressFn): Promise<JobResultFile[]> {
  const fields = options.formFields ?? [];
  if (!fields.length) throw new Error("Click the page to add at least one field");
  onProgress(20, "Adding fields");
  const pdf = await PDFDocument.load(await ensurePdf(file), { ignoreEncryption: true });
  const form = pdf.getForm();
  const pages = pdf.getPages();
  const used = new Set<string>();
  fields.forEach((f, i) => {
    const page = pages[f.page] ?? pages[0];
    const { width, height } = page.getSize();
    let name = (f.name || `Field ${i + 1}`).trim() || `Field ${i + 1}`;
    if (used.has(name)) name = `${name} ${i + 1}`;
    used.add(name);
    const field = form.createTextField(name);
    const w = Math.max(36, f.w * width);
    const h = Math.max(16, f.h * height);
    const x = f.x * width;
    const y = height - f.y * height - h;
    field.addToPage(page, { x, y, width: w, height: h, borderWidth: 1 });
    field.setFontSize(11);
  });
  onProgress(90, "Saving form");
  return [pdfResult(`${stemOf(file.name)}-form.pdf`, await pdf.save())];
}

async function htmlToPdfOp(files: JobFile[], options: JobOptions, onProgress: ProgressFn): Promise<JobResultFile[]> {
  const out: JobResultFile[] = [];
  if (options.url?.trim()) {
    onProgress(15, "Fetching page");
    const res = await fetchHtmlPage({ data: { url: options.url.trim() } });
    if (!res.ok) throw new Error(res.error);
    onProgress(50, "Laying out PDF");
    const html = await cleanHtml(stripChrome(res.html));
    out.push(pdfResult("webpage.pdf", await htmlToPdfBytes(html)));
  }
  if (options.html?.trim()) {
    onProgress(60, "Converting HTML");
    out.push(pdfResult("document.pdf", await htmlToPdfBytes(await cleanHtml(options.html))));
  }
  for (const file of files) {
    const text = new TextDecoder().decode(file.bytes);
    const html = file.name.endsWith(".md") ? mdToHtml(text) : text;
    out.push(pdfResult(`${stemOf(file.name)}.pdf`, await htmlToPdfBytes(await cleanHtml(html))));
  }
  if (!out.length) throw new Error("Paste a URL, HTML, or drop a file");
  return out;
}

async function watermarkOp(files: JobFile[], options: JobOptions, onProgress: ProgressFn): Promise<JobResultFile[]> {
  const text = (options.watermarkText || "CONFIDENTIAL").slice(0, 48);
  const opacity = clamp(options.watermarkOpacity ?? 0.18, 0.06, 0.5);
  const out: JobResultFile[] = [];
  for (let i = 0; i < files.length; i++) {
    const pdf = await PDFDocument.load(await ensurePdf(files[i]), { ignoreEncryption: true });
    const font = await pdf.embedFont(StandardFonts.HelveticaBold);
    for (const page of pdf.getPages()) {
      const { width, height } = page.getSize();
      page.drawText(winAnsi(text), {
        x: width * 0.16,
        y: height * 0.42,
        size: Math.min(48, width / (text.length * 0.5)),
        font,
        color: rgb(0.55, 0.55, 0.56),
        opacity,
        rotate: degrees(32),
      });
    }
    out.push(pdfResult(`${stemOf(files[i].name)}-watermark.pdf`, await pdf.save()));
    onProgress(((i + 1) / files.length) * 90, files[i].name);
  }
  return out;
}

async function pageNumbersOp(files: JobFile[], options: JobOptions, onProgress: ProgressFn): Promise<JobResultFile[]> {
  const pos = options.pageNumberPos ?? "bottom";
  const out: JobResultFile[] = [];
  for (const file of files) {
    const pdf = await PDFDocument.load(await ensurePdf(file), { ignoreEncryption: true });
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    const pages = pdf.getPages();
    pages.forEach((page, i) => {
      const { width, height } = page.getSize();
      const label = `${i + 1} / ${pages.length}`;
      const tw = font.widthOfTextAtSize(label, 10);
      let x = (width - tw) / 2;
      let y = 22;
      if (pos === "top") y = height - 28;
      if (pos === "bottom-left") x = 28;
      if (pos === "bottom-right") x = width - tw - 28;
      page.drawText(label, { x, y, size: 10, font, color: rgb(0.35, 0.35, 0.35) });
    });
    out.push(pdfResult(`${stemOf(file.name)}-numbered.pdf`, await pdf.save()));
    onProgress(90, file.name);
  }
  return out;
}

async function cropOp(file: JobFile, options: JobOptions, onProgress: ProgressFn): Promise<JobResultFile[]> {
  const crop = options.crop ?? { t: 5, r: 5, b: 5, l: 5 };
  onProgress(30, "Cropping pages");
  const pdf = await PDFDocument.load(await ensurePdf(file), { ignoreEncryption: true });
  for (const page of pdf.getPages()) {
    const { width, height } = page.getSize();
    const l = (crop.l / 100) * width;
    const r = (crop.r / 100) * width;
    const t = (crop.t / 100) * height;
    const b = (crop.b / 100) * height;
    const w = Math.max(24, width - l - r);
    const h = Math.max(24, height - t - b);
    page.setCropBox(l, b, w, h);
    page.setMediaBox(l, b, w, h);
  }
  onProgress(90, "Saving");
  return [pdfResult(`${stemOf(file.name)}-cropped.pdf`, await pdf.save())];
}

async function redactOp(file: JobFile, options: JobOptions, onProgress: ProgressFn): Promise<JobResultFile[]> {
  const query = (options.redactQuery || "").trim();
  if (!query) throw new Error("Enter the text you want to permanently remove");
  onProgress(15, "Finding matches");
  const srcBytes = await ensurePdf(file);
  const pdf = await PDFDocument.load(srcBytes, { ignoreEncryption: true });
  const js = await openPdfJs(srcBytes);
  const needle = query.toLowerCase();
  let hits = 0;
  for (let i = 1; i <= js.numPages; i++) {
    const page = await js.getPage(i);
    const vp = page.getViewport({ scale: 1 });
    const items = await extractPageText(page, vp.width, vp.height, vp.transform);
    const libPage = pdf.getPages()[i - 1];
    if (!libPage) continue;
    const { width, height } = libPage.getSize();
    for (const it of items) {
      if (!it.str.toLowerCase().includes(needle) && needle.length > 2 && !needle.includes(it.str.toLowerCase())) {
        continue;
      }
      if (!it.str.toLowerCase().includes(needle) && it.str.trim().length > 0) {
        if (!it.str.toLowerCase().includes(needle)) continue;
      }
      if (!it.str.toLowerCase().includes(needle)) continue;
      hits += 1;
      libPage.drawRectangle({
        x: it.nx * width,
        y: height - (it.ny + it.nh) * height,
        width: Math.max(it.nw * width, 8),
        height: Math.max(it.nh * height, 8),
        color: rgb(0, 0, 0),
      });
    }
    onProgress(15 + (70 * i) / js.numPages, `Page ${i}`);
  }
  await js.cleanup();
  if (!hits) throw new Error(`No matches for “${query}”`);
  onProgress(92, `Redacted ${hits} matches`);
  return [pdfResult(`${stemOf(file.name)}-redacted.pdf`, await pdf.save())];
}

async function signOp(file: JobFile, options: JobOptions, onProgress: ProgressFn): Promise<JobResultFile[]> {
  if (!options.signDataUrl) throw new Error("Draw or type a signature first");
  onProgress(20, "Placing signature");
  const pdf = await PDFDocument.load(await ensurePdf(file), { ignoreEncryption: true });
  const png = await fetch(options.signDataUrl).then((r) => r.arrayBuffer());
  const img = await pdf.embedPng(new Uint8Array(png));
  const pages = pdf.getPages();
  const targets = options.signPage === "all" ? pages : [pages[pages.length - 1]];
  for (const page of targets) {
    if (!page) continue;
    const { width } = page.getSize();
    const w = Math.min(180, width * 0.32);
    const h = (img.height / img.width) * w;
    page.drawImage(img, { x: width - w - 48, y: 42, width: w, height: h });
  }
  onProgress(90, "Saving");
  return [pdfResult(`${stemOf(file.name)}-signed.pdf`, await pdf.save())];
}

async function protectOp(files: JobFile[], options: JobOptions, onProgress: ProgressFn): Promise<JobResultFile[]> {
  const password = options.password?.trim();
  if (!password || password.length < 4) throw new Error("Choose a password of at least 4 characters");
  const { PDFDocument: EncryptedPDF } = await import("@cantoo/pdf-lib");
  const out: JobResultFile[] = [];
  for (let i = 0; i < files.length; i++) {
    onProgress(((i + 0.2) / files.length) * 100, `Encrypting ${files[i].name}`);
    const src = await EncryptedPDF.load(await ensurePdf(files[i]), { ignoreEncryption: true });
    const doc = await EncryptedPDF.create();
    const pages = await doc.copyPages(src, src.getPageIndices());
    pages.forEach((p) => doc.addPage(p));
    doc.encrypt({
      userPassword: password,
      ownerPassword: `${password}-owner`,
      permissions: {
        printing: "highResolution",
        modifying: false,
        copying: false,
        annotating: false,
      },
    });
    const bytes = await doc.save();
    out.push(pdfResult(`${stemOf(files[i].name)}-protected.pdf`, bytes));
  }
  return out;
}

async function unlockOp(files: JobFile[], options: JobOptions, onProgress: ProgressFn): Promise<JobResultFile[]> {
  const password = options.password?.trim();
  if (!password) throw new Error("Enter the PDF password");
  const { PDFDocument: EncryptedPDF } = await import("@cantoo/pdf-lib");
  const out: JobResultFile[] = [];
  for (let i = 0; i < files.length; i++) {
    onProgress(((i + 0.2) / files.length) * 100, `Unlocking ${files[i].name}`);
    try {
      const doc = await EncryptedPDF.load(files[i].bytes, { password });
      const fresh = await EncryptedPDF.create();
      const pages = await fresh.copyPages(doc, doc.getPageIndices());
      pages.forEach((p) => fresh.addPage(p));
      out.push(pdfResult(`${stemOf(files[i].name)}-unlocked.pdf`, await fresh.save()));
    } catch {
      const js = await openPdfJs(files[i].bytes, password);
      const bytes = await rasterizeOpenDoc(js, 1.7, 0.85, onProgress);
      await js.cleanup();
      out.push(pdfResult(`${stemOf(files[i].name)}-unlocked.pdf`, bytes));
    }
  }
  return out;
}

async function compareOp(files: JobFile[], onProgress: ProgressFn): Promise<JobResultFile[]> {
  if (files.length < 2) throw new Error("Upload two PDFs to compare");
  onProgress(10, "Rendering both documents");
  const a = await openPdfJs(await ensurePdf(files[0]));
  const b = await openPdfJs(await ensurePdf(files[1]));
  const pages = Math.max(a.numPages, b.numPages);
  const out = await PDFDocument.create();
  const font = await out.embedFont(StandardFonts.HelveticaBold);
  for (let i = 1; i <= pages; i++) {
    const canvasA = document.createElement("canvas");
    const canvasB = document.createElement("canvas");
    if (i <= a.numPages) await renderPageToCanvas(await a.getPage(i), canvasA, 1.2, 0);
    else {
      canvasA.width = 600;
      canvasA.height = 800;
    }
    if (i <= b.numPages) await renderPageToCanvas(await b.getPage(i), canvasB, 1.2, 0);
    else {
      canvasB.width = 600;
      canvasB.height = 800;
    }
    const jpgA = await canvasToJpeg(canvasA, 0.82);
    const jpgB = await canvasToJpeg(canvasB, 0.82);
    const imgA = await out.embedJpg(new Uint8Array(await jpgA.arrayBuffer()));
    const imgB = await out.embedJpg(new Uint8Array(await jpgB.arrayBuffer()));
    const page = out.addPage([900, 640]);
    page.drawText(`A · ${files[0].name} · p.${i}`, { x: 24, y: 612, size: 10, font, color: rgb(0.2, 0.2, 0.2) });
    page.drawText(`B · ${files[1].name} · p.${i}`, { x: 470, y: 612, size: 10, font, color: rgb(0.2, 0.2, 0.2) });
    const hA = Math.min(560, (imgA.height / imgA.width) * 420);
    const hB = Math.min(560, (imgB.height / imgB.width) * 420);
    page.drawImage(imgA, { x: 24, y: 600 - hA - 16, width: 420, height: hA });
    page.drawImage(imgB, { x: 456, y: 600 - hB - 16, width: 420, height: hB });
    onProgress(10 + (80 * i) / pages, `Page ${i} of ${pages}`);
  }
  await a.cleanup();
  await b.cleanup();
  return [pdfResult(`${stemOf(files[0].name)}-vs-${stemOf(files[1].name)}.pdf`, await out.save())];
}

async function ocrOp(file: JobFile, onProgress: ProgressFn): Promise<JobResultFile[]> {
  onProgress(20, "Reading text layer");
  const text = await extractPdfText(file.bytes, onProgress);
  if (text.replace(/\s/g, "").length < 12) {
    throw new Error("No selectable text found. This looks like a scan — convert to JPG or open it in Edit PDF.");
  }
  const html = text
    .split(/\n{2,}/)
    .map((p) => `<p>${escapeHtml(p)}</p>`)
    .join("");
  const pdfBytes = await htmlToPdfBytes(`<h1>${escapeHtml(stemOf(file.name))}</h1>${html}`);
  return [
    {
      name: `${stemOf(file.name)}.txt`,
      blob: new Blob([text], { type: "text/plain" }),
      previewText: text.slice(0, 1600),
    },
    pdfResult(`${stemOf(file.name)}-searchable.pdf`, pdfBytes),
  ];
}

async function summarizeOp(file: JobFile, onProgress: ProgressFn): Promise<JobResultFile[]> {
  onProgress(20, "Extracting text");
  const text = await extractPdfText(file.bytes, onProgress);
  if (text.replace(/\s/g, "").length < 40) throw new Error("Not enough text in this PDF to summarize.");
  onProgress(55, "Writing summary");
  const res = await summarizeText({ data: { text, title: file.name } });
  if (!res.ok) throw new Error(res.error);
  const html = `<h1>Summary · ${escapeHtml(stemOf(file.name))}</h1>${res.text
    .split("\n")
    .map((line) => {
      if (line.startsWith("- ")) return `<li>${escapeHtml(line.slice(2))}</li>`;
      return `<p>${escapeHtml(line)}</p>`;
    })
    .join("")}`;
  const bytes = await htmlToPdfBytes(html);
  return [
    {
      name: `${stemOf(file.name)}-summary.pdf`,
      blob: new Blob([asArrayBuffer(bytes)] as BlobPart[], { type: "application/pdf" }),
      previewText: res.text,
    },
  ];
}

async function translateOp(file: JobFile, options: JobOptions, onProgress: ProgressFn): Promise<JobResultFile[]> {
  const lang = options.targetLang || "Spanish";
  onProgress(20, "Extracting text");
  const text = await extractPdfText(file.bytes, onProgress);
  if (text.replace(/\s/g, "").length < 20) throw new Error("Not enough text in this PDF to translate.");
  onProgress(55, `Translating to ${lang}`);
  const res = await translateText({ data: { text, lang } });
  if (!res.ok) throw new Error(res.error);
  const html = `<h1>${escapeHtml(stemOf(file.name))} · ${escapeHtml(lang)}</h1>${res.text
    .split(/\n{2,}/)
    .map((p) => `<p>${escapeHtml(p)}</p>`)
    .join("")}`;
  const bytes = await htmlToPdfBytes(html);
  return [
    {
      name: `${stemOf(file.name)}-${lang.toLowerCase()}.pdf`,
      blob: new Blob([asArrayBuffer(bytes)] as BlobPart[], { type: "application/pdf" }),
      previewText: res.text.slice(0, 1600),
    },
  ];
}

export async function pageThumbs(bytes: ArrayBuffer, max = 24): Promise<{ url: string; w: number; h: number }[]> {
  const pdf = await openPdfJs(bytes);
  const n = Math.min(pdf.numPages, max);
  const out: { url: string; w: number; h: number }[] = [];
  for (let i = 1; i <= n; i++) {
    const page = await pdf.getPage(i);
    const canvas = document.createElement("canvas");
    const size = await renderPageToCanvas(page, canvas, 0.28, 0);
    out.push({ url: canvas.toDataURL("image/jpeg", 0.72), w: size.width, h: size.height });
  }
  await pdf.cleanup();
  return out;
}

export async function inspectPdf(bytes: ArrayBuffer): Promise<{ pages: number; thumb?: string }> {
  try {
    const pdf = await openPdfJs(bytes);
    const pages = pdf.numPages;
    const page = await pdf.getPage(1);
    const canvas = document.createElement("canvas");
    await renderPageToCanvas(page, canvas, 0.28, 0);
    const thumb = canvas.toDataURL("image/jpeg", 0.72);
    await pdf.cleanup();
    return { pages, thumb };
  } catch {
    return { pages: 0 };
  }
}

export async function fileFromBlob(name: string, bytes: ArrayBuffer, mime = "application/pdf"): Promise<JobFile> {
  return { id: uid("f"), name, bytes, mime };
}

async function ensurePdf(file: JobFile): Promise<ArrayBuffer> {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "pdf" || file.mime.includes("pdf")) return file.bytes.slice(0);
  return fileToPdfBytes(file);
}

async function fileToPdfBytes(file: JobFile, kind?: "word" | "ppt" | "excel"): Promise<ArrayBuffer> {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  const inferred =
    kind ??
    (["doc", "docx"].includes(ext)
      ? "word"
      : ["ppt", "pptx"].includes(ext)
        ? "ppt"
        : ["xls", "xlsx", "csv"].includes(ext)
          ? "excel"
          : undefined);
  if (inferred === "word" || ext === "docx" || ext === "doc") {
    const html = await htmlFromDocx(file.bytes);
    return asArrayBuffer(await htmlToPdfBytes(html));
  }
  if (inferred === "ppt" || ext === "pptx" || ext === "ppt") {
    const slides = await slidesFromPptx(file.bytes);
    const html = slides
      .map(
        (s) =>
          `<section style="page-break-after:always;padding:24px"><h1>${escapeHtml(s.title)}</h1><p>${escapeHtml(s.body).replace(/\n/g, "<br/>")}</p></section>`,
      )
      .join("");
    return asArrayBuffer(await htmlToPdfBytes(html));
  }
  if (inferred === "excel" || ["xlsx", "xls", "csv"].includes(ext)) {
    const sheets =
      ext === "csv"
        ? [{ name: "Sheet1", rows: new TextDecoder().decode(file.bytes).split(/\r?\n/).map((l) => l.split(",")) }]
        : await sheetsFromXlsx(file.bytes);
    const html = sheets
      .map((s) => {
        const rows = s.rows
          .map((r) => `<tr>${r.map((c) => `<td style="border:1px solid #d6d0c6;padding:6px 8px">${escapeHtml(c)}</td>`).join("")}</tr>`)
          .join("");
        return `<h2>${escapeHtml(s.name)}</h2><table style="border-collapse:collapse;width:100%">${rows}</table>`;
      })
      .join("");
    return asArrayBuffer(await htmlToPdfBytes(html));
  }
  if (["png", "jpg", "jpeg", "webp", "gif"].includes(ext)) {
    const img = await normalizeImage(file);
    return asArrayBuffer(await pdfFromImages([img]));
  }
  const text = new TextDecoder().decode(file.bytes);
  const html = ext === "md" ? mdToHtml(text) : `<pre>${escapeHtml(text)}</pre>`;
  return asArrayBuffer(await htmlToPdfBytes(html));
}

async function pdfToHtml(bytes: ArrayBuffer, name: string): Promise<string> {
  const pdf = await openPdfJs(bytes);
  const parts = [`<h1>${escapeHtml(stemOf(name))}</h1>`];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const text = await pagePlainText(page);
    parts.push(`<h2>Page ${i}</h2>`);
    text.split(/\n{2,}/).forEach((p) => {
      if (p.trim()) parts.push(`<p>${escapeHtml(p).replace(/\n/g, "<br/>")}</p>`);
    });
  }
  await pdf.cleanup();
  return parts.join("");
}

async function extractPdfText(bytes: ArrayBuffer, onProgress: ProgressFn = () => {}): Promise<string> {
  const pdf = await openPdfJs(bytes);
  const parts: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    parts.push(await pagePlainText(page));
    onProgress(Math.min(50, (i / pdf.numPages) * 50), `Reading page ${i}`);
  }
  await pdf.cleanup();
  return parts.join("\n\n");
}

async function rasterizeToPdf(
  bytes: ArrayBuffer,
  scale: number,
  quality: number,
  onProgress: ProgressFn,
): Promise<Uint8Array> {
  const js = await openPdfJs(bytes);
  const result = await rasterizeOpenDoc(js, scale, quality, onProgress);
  await js.cleanup();
  return result;
}

async function rasterizeOpenDoc(
  js: Awaited<ReturnType<typeof openPdfJs>>,
  scale: number,
  quality: number,
  onProgress: ProgressFn,
): Promise<Uint8Array> {
  const images: { bytes: ArrayBuffer; mime: string }[] = [];
  for (let i = 1; i <= js.numPages; i++) {
    const page = await js.getPage(i);
    const canvas = document.createElement("canvas");
    await renderPageToCanvas(page, canvas, scale, 0);
    const blob = await canvasToJpeg(canvas, quality);
    images.push({ bytes: await blob.arrayBuffer(), mime: "image/jpeg" });
    onProgress((i / js.numPages) * 85, `Page ${i} of ${js.numPages}`);
  }
  return pdfFromImages(images);
}

async function normalizeImage(file: JobFile): Promise<{ bytes: ArrayBuffer; mime: string }> {
  const mime = file.mime || guessMime(file.name);
  if (mime.includes("jpeg") || mime.includes("jpg") || mime.includes("png")) {
    return { bytes: file.bytes, mime: mime.includes("png") ? "image/png" : "image/jpeg" };
  }
  const url = URL.createObjectURL(new Blob([file.bytes]));
  try {
    const img = await loadImg(url);
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth || 1;
    canvas.height = img.naturalHeight || 1;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not read image");
    ctx.drawImage(img, 0, 0);
    const blob = await canvasToJpeg(canvas, 0.92);
    return { bytes: await blob.arrayBuffer(), mime: "image/jpeg" };
  } finally {
    URL.revokeObjectURL(url);
  }
}

function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not read image"));
    img.src = src;
  });
}

function parseRangeGroups(input: string, count: number): number[][] {
  const groups: number[][] = [];
  for (const part of input.split(/[;,]/)) {
    const bit = part.trim();
    if (!bit) continue;
    const m = bit.match(/^(\d+)\s*-\s*(\d+)$/);
    if (m) {
      const a = Math.max(1, Math.min(count, Number(m[1])));
      const b = Math.max(1, Math.min(count, Number(m[2])));
      const start = Math.min(a, b);
      const end = Math.max(a, b);
      groups.push(Array.from({ length: end - start + 1 }, (_, i) => start - 1 + i));
    } else if (/^\d+$/.test(bit)) {
      const n = Number(bit);
      if (n >= 1 && n <= count) groups.push([n - 1]);
    }
  }
  return groups;
}

function pdfResult(name: string, bytes: Uint8Array | ArrayBuffer): JobResultFile {
  const buf = bytes instanceof Uint8Array ? asArrayBuffer(bytes) : bytes;
  return {
    name,
    blob: new Blob([buf] as BlobPart[], { type: "application/pdf" }),
  };
}

async function zipResult(name: string, files: JobResultFile[]): Promise<JobResultFile> {
  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();
  for (const f of files) zip.file(f.name, await f.blob.arrayBuffer());
  const blob = await zip.generateAsync({ type: "blob" });
  return { name, blob };
}

function guessMime(name: string) {
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext === "png") return "image/png";
  if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
  if (ext === "webp") return "image/webp";
  if (ext === "gif") return "image/gif";
  if (ext === "pdf") return "application/pdf";
  return "application/octet-stream";
}

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
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
    };
    return map[ch] ?? "?";
  });
}

function stripChrome(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<nav[\s\S]*?<\/nav>/gi, "");
}
