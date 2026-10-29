import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { asArrayBuffer } from "@/lib/utils";
import type { ToolId } from "./catalog";

export type SampleFile = {
  name: string;
  bytes: ArrayBuffer;
  mime: string;
};

export type SampleBundle = {
  files: SampleFile[];
  html?: string;
  url?: string;
  redactQuery?: string;
  watermarkText?: string;
  signDataUrl?: string;
  password?: string;
};

export async function samplesForTool(toolId: ToolId): Promise<SampleBundle> {
  switch (toolId) {
    case "merge-pdf":
    case "compare-pdf":
      return {
        files: [
          await makeSamplePdfFile("folio-sample-a.pdf", "A"),
          await makeSamplePdfFile("folio-sample-b.pdf", "B"),
        ],
      };
    case "word-to-pdf":
      return { files: [await makeSampleDocx()] };
    case "powerpoint-to-pdf":
      return { files: [await makeSamplePptx()] };
    case "excel-to-pdf":
      return { files: [await makeSampleXlsx()] };
    case "jpg-to-pdf":
    case "scan-to-pdf":
      return {
        files: [await makeSampleJpeg("Scan 1", "#f4efe6"), await makeSampleJpeg("Scan 2", "#e8eef4")],
      };
    case "html-to-pdf":
      return {
        files: [
          {
            name: "folio-sample.html",
            bytes: asArrayBuffer(new TextEncoder().encode(SAMPLE_HTML)),
            mime: "text/html",
          },
        ],
        html: SAMPLE_HTML,
      };
    case "redact-pdf":
      return {
        files: [await makeSamplePdfFile("folio-sample.pdf", "A")],
        redactQuery: "Northwind",
      };
    case "watermark":
      return {
        files: [await makeSamplePdfFile("folio-sample.pdf", "A")],
        watermarkText: "CONFIDENTIAL",
      };
    case "sign-pdf":
      return {
        files: [await makeSamplePdfFile("folio-sample.pdf", "A")],
        signDataUrl: sampleSignature(),
      };
    case "protect-pdf":
      return {
        files: [await makeSamplePdfFile("folio-sample.pdf", "A")],
        password: "folio",
      };
    case "unlock-pdf":
      return {
        files: [await makeLockedPdf()],
        password: "folio",
      };
    default:
      return { files: [await makeSamplePdfFile("folio-sample.pdf", "A")] };
  }
}

export async function makeSamplePdf(): Promise<{ name: string; bytes: ArrayBuffer }> {
  const file = await makeSamplePdfFile("folio-sample.pdf", "A");
  return { name: file.name, bytes: file.bytes };
}

async function makeSamplePdfFile(name: string, variant: "A" | "B"): Promise<SampleFile> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.TimesRoman);
  const bold = await pdf.embedFont(StandardFonts.TimesRomanBold);
  const sans = await pdf.embedFont(StandardFonts.Helvetica);

  const page1 = pdf.addPage([612, 792]);
  page1.drawRectangle({ x: 0, y: 720, width: 612, height: 72, color: rgb(0.878, 0.235, 0.18) });
  page1.drawText("FOLIO", {
    x: 56,
    y: 748,
    size: 18,
    font: bold,
    color: rgb(1, 1, 1),
  });
  page1.drawText(variant === "A" ? "Sample document" : "Revised document", {
    x: 130,
    y: 750,
    size: 11,
    font: sans,
    color: rgb(1, 0.92, 0.9),
  });
  page1.drawText(
    variant === "A" ? "Quarterly operations brief" : "Quarterly operations brief  ·  v2",
    {
      x: 56,
      y: 660,
      size: 22,
      font: bold,
      color: rgb(0.11, 0.1, 0.09),
    },
  );
  page1.drawText("Prepared for the product team  ·  2026", {
    x: 56,
    y: 634,
    size: 11,
    font: sans,
    color: rgb(0.42, 0.4, 0.38),
  });

  const paras =
    variant === "A"
      ? [
          "This sample exists so you can try every Folio tool without hunting for a file. Merge it with another PDF, split the pages, compress it, convert it to Word or JPG, stamp a watermark, or open it in the editor and rewrite a line.",
          "Northwind closed the quarter with 128 closed tickets, a 94% on-time rate, and two delayed launches that have since shipped. Customer support volume rose 12% after the April release; average first reply stayed under four hours.",
          "Priorities for next quarter: finish the billing export, add password protection to shared decks, and cut the median PDF processing time below two seconds on a laptop.",
        ]
      : [
          "This is a second version of the same brief so Merge and Compare have two real files to work with.",
          "Northwind closed the quarter with 141 closed tickets, a 96% on-time rate, and no delayed launches. Customer support volume rose 8% after the April release; average first reply stayed under three hours.",
          "Priorities for next quarter: ship the billing export, keep password protection on shared decks, and hold PDF processing under two seconds on a laptop.",
        ];
  let y = 580;
  for (const p of paras) {
    const lines = wrap(p, 86);
    for (const line of lines) {
      page1.drawText(line, { x: 56, y, size: 12, font, color: rgb(0.16, 0.14, 0.13) });
      y -= 18;
    }
    y -= 10;
  }

  const page2 = pdf.addPage([612, 792]);
  page2.drawText(variant === "A" ? "Appendix  ·  Numbers" : "Appendix  ·  Updated numbers", {
    x: 56,
    y: 720,
    size: 18,
    font: bold,
    color: rgb(0.11, 0.1, 0.09),
  });
  const rows =
    variant === "A"
      ? [
          ["Metric", "Q1", "Q2", "Delta"],
          ["Closed tickets", "102", "128", "+26"],
          ["On-time rate", "91%", "94%", "+3 pts"],
          ["First reply", "4.8 h", "3.9 h", "-0.9 h"],
          ["NPS", "41", "47", "+6"],
        ]
      : [
          ["Metric", "Q1", "Q2", "Delta"],
          ["Closed tickets", "102", "141", "+39"],
          ["On-time rate", "91%", "96%", "+5 pts"],
          ["First reply", "4.8 h", "2.9 h", "-1.9 h"],
          ["NPS", "41", "51", "+10"],
        ];
  let ry = 670;
  rows.forEach((row, i) => {
    row.forEach((cell, c) => {
      page2.drawText(cell, {
        x: 56 + c * 120,
        y: ry,
        size: 12,
        font: i === 0 ? bold : font,
        color: rgb(0.16, 0.14, 0.13),
      });
    });
    ry -= 28;
  });
  page2.drawText("Page 2 of 2", {
    x: 270,
    y: 36,
    size: 10,
    font: sans,
    color: rgb(0.45, 0.42, 0.4),
  });

  const bytes = await pdf.save();
  return { name, bytes: asArrayBuffer(bytes), mime: "application/pdf" };
}

async function makeSampleDocx(): Promise<SampleFile> {
  const { Document, Packer, Paragraph, TextRun, HeadingLevel } = await import("docx");
  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({ text: "Quarterly operations brief", heading: HeadingLevel.HEADING_1 }),
          new Paragraph({ text: "Northwind  ·  2026", heading: HeadingLevel.HEADING_2 }),
          new Paragraph({
            children: [
              new TextRun(
                "This Word sample converts cleanly to PDF. Headings, body copy and a short list survive the round-trip.",
              ),
            ],
          }),
          new Paragraph({ text: "Closed 128 tickets this quarter" }),
          new Paragraph({ text: "On-time rate reached 94%" }),
          new Paragraph({ text: "First reply under four hours" }),
        ],
      },
    ],
  });
  const blob = await Packer.toBlob(doc);
  return {
    name: "folio-brief.docx",
    bytes: await blob.arrayBuffer(),
    mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  };
}

async function makeSamplePptx(): Promise<SampleFile> {
  const PptxGenJS = (await import("pptxgenjs")).default;
  const pptx = new PptxGenJS();
  pptx.author = "Folio";
  pptx.title = "Quarterly review";
  pptx.layout = "LAYOUT_WIDE";
  const s1 = pptx.addSlide();
  s1.addShape("rect", { x: 0, y: 0, w: "100%", h: "100%", fill: { color: "F6F3EE" } });
  s1.addText("Quarterly review", {
    x: 0.7,
    y: 2.1,
    w: 12,
    h: 1,
    fontSize: 36,
    fontFace: "Georgia",
    color: "1C1917",
    bold: true,
  });
  s1.addText("Northwind product team  ·  2026", {
    x: 0.7,
    y: 3.2,
    w: 12,
    h: 0.5,
    fontSize: 16,
    color: "6B6560",
  });
  const s2 = pptx.addSlide();
  s2.addShape("rect", { x: 0, y: 0, w: "100%", h: "100%", fill: { color: "FFFFFF" } });
  s2.addText("What shipped", {
    x: 0.7,
    y: 0.6,
    w: 12,
    h: 0.7,
    fontSize: 28,
    bold: true,
    color: "1C1917",
  });
  s2.addText("Billing export\nPassword-protected decks\nSub-2s PDF tools on a laptop", {
    x: 0.7,
    y: 1.6,
    w: 12,
    h: 3,
    fontSize: 20,
    color: "44403C",
  });
  const blob = (await pptx.write({ outputType: "blob" })) as Blob;
  return {
    name: "folio-review.pptx",
    bytes: await blob.arrayBuffer(),
    mime: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  };
}

async function makeSampleXlsx(): Promise<SampleFile> {
  const XLSX = await import("xlsx");
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([
    ["Metric", "Q1", "Q2", "Delta"],
    ["Closed tickets", 102, 128, "+26"],
    ["On-time rate", "91%", "94%", "+3 pts"],
    ["First reply (h)", 4.8, 3.9, -0.9],
    ["NPS", 41, 47, 6],
  ]);
  XLSX.utils.book_append_sheet(wb, ws, "Ops");
  const out = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const bytes = out instanceof ArrayBuffer ? out : asArrayBuffer(new Uint8Array(out as ArrayLike<number>));
  return {
    name: "folio-metrics.xlsx",
    bytes,
    mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  };
}

async function makeSampleJpeg(label: string, fill: string): Promise<SampleFile> {
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 1600;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not draw sample image");
  ctx.fillStyle = fill;
  ctx.fillRect(0, 0, 1200, 1600);
  ctx.fillStyle = "#e03c2e";
  ctx.fillRect(0, 0, 1200, 140);
  ctx.fillStyle = "#ffffff";
  ctx.font = "700 42px Plus Jakarta Sans, sans-serif";
  ctx.fillText("FOLIO", 64, 88);
  ctx.fillStyle = "#1c1917";
  ctx.font = "600 48px Plus Jakarta Sans, sans-serif";
  ctx.fillText(label, 64, 280);
  ctx.font = "400 28px Plus Jakarta Sans, sans-serif";
  ctx.fillStyle = "#6b6560";
  const lines = wrap(
    "A generated scan so JPG to PDF and Scan to PDF work without picking a photo. Drop your own images any time.",
    42,
  );
  lines.forEach((line, i) => ctx.fillText(line, 64, 360 + i * 40));
  const blob: Blob = await new Promise((res, rej) =>
    canvas.toBlob((b) => (b ? res(b) : rej(new Error("encode"))), "image/jpeg", 0.9),
  );
  const slug = label.toLowerCase().replace(/\s+/g, "-");
  return { name: `${slug}.jpg`, bytes: await blob.arrayBuffer(), mime: "image/jpeg" };
}

async function makeLockedPdf(): Promise<SampleFile> {
  const plain = await makeSamplePdfFile("folio-locked.pdf", "A");
  const { PDFDocument: EncryptedPDF } = await import("@cantoo/pdf-lib");
  const src = await EncryptedPDF.load(plain.bytes);
  const doc = await EncryptedPDF.create();
  const pages = await doc.copyPages(src, src.getPageIndices());
  pages.forEach((p) => doc.addPage(p));
  doc.encrypt({
    userPassword: "folio",
    ownerPassword: "folio-owner",
    permissions: {
      printing: "highResolution",
      modifying: false,
      copying: false,
      annotating: false,
    },
  });
  const bytes = await doc.save();
  return { name: "folio-locked.pdf", bytes: asArrayBuffer(bytes), mime: "application/pdf" };
}

function sampleSignature(): string {
  const c = document.createElement("canvas");
  c.width = 560;
  c.height = 160;
  const ctx = c.getContext("2d");
  if (!ctx) return "";
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, 560, 160);
  ctx.fillStyle = "#1a1917";
  ctx.font = "italic 54px Georgia, serif";
  ctx.fillText("A. Northwind", 36, 100);
  return c.toDataURL("image/png");
}

const SAMPLE_HTML = `<h1>Folio sample page</h1>
<p>Paste any HTML, drop an .html file, or convert this starter page.</p>
<ul>
  <li>Headings and lists keep their structure</li>
  <li>The result is a real PDF you can download</li>
  <li>Nothing leaves this device</li>
</ul>
<p>Northwind closed the quarter with 128 tickets and a 94% on-time rate.</p>`;

function wrap(text: string, width: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (next.length > width) {
      if (line) lines.push(line);
      line = w;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}
