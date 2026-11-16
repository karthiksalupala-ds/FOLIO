import { extractPageImages, extractPageText, openPdfJs, renderPageToCanvas } from "./pdf";
import { groupLines } from "./lines";
import { buildBlocks, type Block, type LineBox } from "./pdf-layout";
import { stemOf } from "@/lib/utils";

const FONT_NAMES = { sans: "Arial", serif: "Times New Roman", mono: "Courier New" } as const;

export type PdfDocx = { blob: Blob; previewText: string; images: number; tables: number };

/** Word document built from the PDF's real content: headings, paragraphs, tables and pictures, in reading order. */
export async function pdfToDocx(bytes: ArrayBuffer, name: string, onProgress?: (pct: number, label: string) => void): Promise<PdfDocx> {
  const D = await import("docx");
  const pdf = await openPdfJs(bytes);
  const children: unknown[] = [];
  const preview: string[] = [];
  let images = 0;
  let tables = 0;
  let pageW = 612;
  let pageH = 792;
  const px = (pt: number) => Math.round((pt * 96) / 72);

  for (let p = 1; p <= pdf.numPages; p++) {
    onProgress?.(10 + (80 * (p - 1)) / pdf.numPages, `Page ${p} of ${pdf.numPages}`);
    const page = await pdf.getPage(p);
    const vp = page.getViewport({ scale: 1 });
    if (p === 1) {
      pageW = vp.width;
      pageH = vp.height;
    }
    const items = await extractPageText(page, vp.width, vp.height, vp.transform);
    const lines: LineBox[] = groupLines(items).map((l) => ({
      text: l.text,
      left: l.left,
      top: l.top,
      width: l.width,
      height: l.height,
      fontSize: l.fontSize,
      bold: l.look?.bold,
      italic: l.look?.italic,
      font: l.look?.font,
    }));
    let imgs = await extractPageImages(page);
    let blocks: Block[] = buildBlocks(lines, imgs, vp.width);
    // A page that is only a picture (a scan): keep it as the page picture so nothing is lost.
    if (!lines.length && !imgs.length) {
      const canvas = document.createElement("canvas");
      await renderPageToCanvas(page, canvas, 1.5, 0, 1);
      const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/png"));
      if (blob) {
        imgs = [{ left: 0, top: 0, width: vp.width, height: vp.height, png: new Uint8Array(await blob.arrayBuffer()) }];
        blocks = buildBlocks([], imgs, vp.width);
      }
    }
    let first = true;
    const maxW = px(pageW - 72);
    for (const b of blocks) {
      const pageBreakBefore = first && p > 1;
      first = false;
      if (b.kind === "para") {
        preview.push(b.text);
        const heading = [undefined, D.HeadingLevel.HEADING_1, D.HeadingLevel.HEADING_2, D.HeadingLevel.HEADING_3][b.heading];
        children.push(
          new D.Paragraph({
            heading,
            pageBreakBefore,
            spacing: { after: 120 },
            children: [new D.TextRun({ text: b.text, bold: b.bold || b.heading > 0, italics: b.italic, size: Math.round(b.fontSize * 2), font: FONT_NAMES[b.font] })],
          }),
        );
      } else if (b.kind === "table") {
        tables++;
        preview.push(b.rows.map((r) => r.join(" | ")).join("\n"));
        if (pageBreakBefore) children.push(new D.Paragraph({ pageBreakBefore: true, children: [] }));
        children.push(
          new D.Table({
            width: { size: 100, type: D.WidthType.PERCENTAGE },
            rows: b.rows.map((r) => new D.TableRow({ children: r.map((c) => new D.TableCell({ children: [new D.Paragraph({ children: [new D.TextRun({ text: c, size: 22 })] })] })) })),
          }),
          new D.Paragraph({ children: [] }),
        );
      } else {
        images++;
        const w = Math.min(px(b.width), maxW);
        const h = Math.round((w * b.height) / Math.max(1, b.width));
        children.push(new D.Paragraph({ pageBreakBefore, spacing: { after: 120 }, children: [new D.ImageRun({ type: "png", data: b.png, transformation: { width: w, height: h } })] }));
      }
    }
    if (!blocks.length && p > 1) children.push(new D.Paragraph({ pageBreakBefore: true, children: [] }));
  }
  await pdf.cleanup();
  const doc = new D.Document({
    title: stemOf(name),
    sections: [{ properties: { page: { size: { width: Math.round(pageW * 20), height: Math.round(pageH * 20) }, margin: { top: 720, bottom: 720, left: 720, right: 720 } } }, children: children as never[] }],
  });
  const blob = await D.Packer.toBlob(doc);
  return { blob, previewText: preview.join("\n").slice(0, 1600), images, tables };
}

/** Text of every page as spreadsheet rows: tables become multi-column rows, other text one cell per line. */
export async function pdfPageRows(bytes: ArrayBuffer): Promise<string[][][]> {
  const pdf = await openPdfJs(bytes);
  const pages: string[][][] = [];
  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const vp = page.getViewport({ scale: 1 });
    const items = await extractPageText(page, vp.width, vp.height, vp.transform);
    const lines: LineBox[] = groupLines(items).map((l) => ({ text: l.text, left: l.left, top: l.top, width: l.width, height: l.height, fontSize: l.fontSize, bold: l.look?.bold, italic: l.look?.italic, font: l.look?.font }));
    const rows: string[][] = [];
    for (const b of buildBlocks(lines, [], vp.width)) {
      if (b.kind === "table") rows.push(...b.rows);
      else if (b.kind === "para") rows.push([b.text]);
    }
    pages.push(rows);
  }
  await pdf.cleanup();
  return pages;
}
