import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { uid, asArrayBuffer } from "@/lib/utils";
import type { FolioDoc } from "./types";
import { defaultPages } from "./pdf";
import { defaultHtml, emptySheet, emptySlide } from "./office";

function now() {
  return Date.now();
}

function base(
  partial: Omit<FolioDoc, "id" | "createdAt" | "updatedAt" | "size" | "annotations"> & {
    annotations?: FolioDoc["annotations"];
  },
): FolioDoc {
  const t = now();
  return {
    id: uid("doc"),
    createdAt: t,
    updatedAt: t,
    size: partial.bytes.byteLength,
    annotations: partial.annotations ?? [],
    ...partial,
  };
}

export async function makeWelcomePdf(): Promise<FolioDoc> {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([612, 792]);
  const serif = await pdf.embedFont(StandardFonts.TimesRoman);
  const serifBold = await pdf.embedFont(StandardFonts.TimesRomanBold);
  const sans = await pdf.embedFont(StandardFonts.Helvetica);

  page.drawRectangle({ x: 0, y: 0, width: 612, height: 792, color: rgb(0.953, 0.933, 0.894) });
  page.drawRectangle({ x: 0, y: 708, width: 612, height: 84, color: rgb(0.043, 0.047, 0.055) });
  page.drawText("FOLIO", {
    x: 56,
    y: 740,
    size: 22,
    font: serifBold,
    color: rgb(0.933, 0.918, 0.89),
  });
  page.drawText("Document studio", {
    x: 140,
    y: 744,
    size: 11,
    font: sans,
    color: rgb(0.6, 0.58, 0.55),
  });

  page.drawText("Edit any page. Convert any file.", {
    x: 56,
    y: 640,
    size: 26,
    font: serif,
    color: rgb(0.11, 0.1, 0.09),
  });

  const intro = [
    "Folio is a private studio that runs in your browser. Open a PDF, Word file,",
    "deck, sheet, or image. Click any line of text to rewrite it. Draw, highlight,",
    "sign, stamp, and rearrange pages. Then download or share in the format you need.",
  ];
  intro.forEach((line, i) => {
    page.drawText(line, {
      x: 56,
      y: 590 - i * 18,
      size: 11,
      font: sans,
      color: rgb(0.27, 0.25, 0.23),
    });
  });

  const tools = [
    ["Text", "Click existing copy or place a new box."],
    ["Mark", "Highlight, underline, strike, or redact."],
    ["Draw", "Pen, shapes, arrows, images, stamps, signatures."],
    ["Convert", "PDF, DOCX, PPTX, XLSX, TXT, MD, HTML, PNG, JPG."],
    ["Share", "Download, system share, or copy as a Folio pack."],
  ];
  tools.forEach((row, i) => {
    const y = 480 - i * 42;
    page.drawRectangle({
      x: 56,
      y: y - 12,
      width: 500,
      height: 36,
      color: rgb(1, 0.992, 0.973),
    });
    page.drawText(row[0], { x: 70, y: y, size: 11, font: serifBold, color: rgb(0.11, 0.1, 0.09) });
    page.drawText(row[1], { x: 150, y: y, size: 10, font: sans, color: rgb(0.35, 0.32, 0.3) });
  });

  page.drawText("Try editing this sentence: the quick studio rewrites the page.", {
    x: 56,
    y: 230,
    size: 12,
    font: serif,
    color: rgb(0.11, 0.1, 0.09),
  });
  page.drawText("Confidential sample  ·  Not legal advice  ·  Stored only on this device", {
    x: 56,
    y: 48,
    size: 8,
    font: sans,
    color: rgb(0.45, 0.42, 0.4),
  });

  const page2 = pdf.addPage([612, 792]);
  page2.drawRectangle({ x: 0, y: 0, width: 612, height: 792, color: rgb(0.953, 0.933, 0.894) });
  page2.drawText("A page you can mark up", {
    x: 56,
    y: 720,
    size: 22,
    font: serifBold,
    color: rgb(0.11, 0.1, 0.09),
  });
  const body = [
    "Section 1. Scope. This sample agreement is a playground. Highlight a clause,",
    "strike a phrase, drop a signature, and export a signed PDF.",
    "",
    "Section 2. Files. Folio keeps work in local storage on this device. Nothing is",
    "uploaded unless you download or share it yourself.",
    "",
    "Section 3. Conversion. Open Convert to turn this PDF into Word, slides, HTML,",
    "or an image. The reverse is also true: a letter can become a PDF.",
    "",
    "IN WITNESS WHEREOF, the parties have executed this sample as of the date below.",
  ];
  body.forEach((line, i) => {
    page2.drawText(line, {
      x: 56,
      y: 660 - i * 22,
      size: 12,
      font: serif,
      color: rgb(0.15, 0.13, 0.12),
    });
  });
  page2.drawLine({
    start: { x: 56, y: 280 },
    end: { x: 280, y: 280 },
    thickness: 0.8,
    color: rgb(0.3, 0.28, 0.26),
  });
  page2.drawText("Signature", { x: 56, y: 262, size: 9, font: sans, color: rgb(0.4, 0.38, 0.36) });
  page2.drawLine({
    start: { x: 330, y: 280 },
    end: { x: 540, y: 280 },
    thickness: 0.8,
    color: rgb(0.3, 0.28, 0.26),
  });
  page2.drawText("Date", { x: 330, y: 262, size: 9, font: sans, color: rgb(0.4, 0.38, 0.36) });

  const bytes = await pdf.save();
  const copy = asArrayBuffer(bytes);
  return base({
    name: "Welcome to Folio.pdf",
    kind: "pdf",
    bytes: copy,
    pages: defaultPages(2),
  });
}

export async function makeBlankPdf(): Promise<FolioDoc> {
  const pdf = await PDFDocument.create();
  pdf.addPage([612, 792]);
  const bytes = await pdf.save();
  return base({
    name: "Untitled.pdf",
    kind: "pdf",
    bytes: asArrayBuffer(bytes),
    pages: defaultPages(1),
  });
}

export function makeLetter(): FolioDoc {
  const html = defaultHtml(
    "Letter",
    `<p>Dear colleague,</p>
<p>Thank you for reviewing this draft. Replace this paragraph with your own copy. Use the toolbar for headings, lists, and emphasis, then convert to PDF or Word when you are ready to send.</p>
<p>Warmly,<br/>The Folio studio</p>`,
  );
  const enc = new TextEncoder().encode(html);
  return base({
    name: "Letter.docx",
    kind: "docx",
    bytes: enc.buffer,
    pages: defaultPages(1),
    html,
  });
}

export function makeResume(): FolioDoc {
  const html = defaultHtml(
    "Alex Rivera",
    `<p>Product designer  ·  New York</p>
<h2>Experience</h2>
<p><strong>Studio Lead, Northwind</strong> — 2022–present</p>
<p>Shipped editorial tools used by 40k weekly readers. Wrote the design system now used across four products.</p>
<h2>Education</h2>
<p>BFA, Graphic Design — RISD</p>`,
  );
  const enc = new TextEncoder().encode(html);
  return base({
    name: "Resume.docx",
    kind: "docx",
    bytes: enc.buffer,
    pages: defaultPages(1),
    html,
  });
}

export function makeDeck(): FolioDoc {
  const slides = [
    { ...emptySlide(), title: "Northwind", body: "A quieter way to ship documents." },
    {
      ...emptySlide(),
      title: "The problem",
      body: "Files bounce between tools. Context gets lost. Signatures wait in inboxes.",
    },
    {
      ...emptySlide(),
      title: "The studio",
      body: "One canvas for PDFs, letters, decks, and sheets. Convert on the way out.",
    },
  ];
  const enc = new TextEncoder().encode(JSON.stringify(slides));
  return base({
    name: "Pitch deck.pptx",
    kind: "pptx",
    bytes: enc.buffer,
    pages: defaultPages(slides.length),
    slides,
  });
}

export function makeSheet(): FolioDoc {
  const sheet = emptySheet();
  sheet.rows[0] = ["Item", "Owner", "Status", "Due", "Notes", "", "", ""];
  sheet.rows[1] = ["Brand pass", "Maya", "Done", "Mon", "Locked", "", "", ""];
  sheet.rows[2] = ["PDF editor", "Jules", "Review", "Wed", "Text layer live", "", "", ""];
  sheet.rows[3] = ["Convert", "Sam", "Doing", "Fri", "10 formats", "", "", ""];
  const enc = new TextEncoder().encode(JSON.stringify([sheet]));
  return base({
    name: "Tracker.xlsx",
    kind: "xlsx",
    bytes: enc.buffer,
    pages: defaultPages(1),
    sheets: [sheet],
  });
}
