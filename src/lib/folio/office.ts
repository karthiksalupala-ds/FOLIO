import { uid } from "@/lib/utils";
import type { FolioDoc, Slide, SheetTab } from "./types";

export async function htmlFromDocx(bytes: ArrayBuffer): Promise<string> {
  const mammoth = await import("mammoth");
  const result = await mammoth.convertToHtml({ arrayBuffer: bytes });
  return result.value || "<p></p>";
}

export async function docxFromHtml(html: string, title: string): Promise<Blob> {
  const { Document, Packer, Paragraph, TextRun, HeadingLevel } = await import("docx");
  const el = document.createElement("div");
  el.innerHTML = html;
  const children: InstanceType<typeof Paragraph>[] = [];

  const walk = (node: ChildNode) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const t = node.textContent ?? "";
      if (t.trim()) children.push(new Paragraph({ children: [new TextRun(t)] }));
      return;
    }
    if (!(node instanceof HTMLElement)) return;
    const tag = node.tagName.toLowerCase();
    const text = node.innerText ?? "";
    if (!text.trim() && tag !== "br") {
      node.childNodes.forEach(walk);
      return;
    }
    if (tag === "h1") {
      children.push(new Paragraph({ text, heading: HeadingLevel.HEADING_1 }));
    } else if (tag === "h2") {
      children.push(new Paragraph({ text, heading: HeadingLevel.HEADING_2 }));
    } else if (tag === "h3") {
      children.push(new Paragraph({ text, heading: HeadingLevel.HEADING_3 }));
    } else if (tag === "li") {
      children.push(new Paragraph({ text: `• ${text}` }));
    } else if (tag === "p" || tag === "div") {
      const runs: InstanceType<typeof TextRun>[] = [];
      node.childNodes.forEach((c) => {
        if (c.nodeType === Node.TEXT_NODE) runs.push(new TextRun(c.textContent ?? ""));
        else if (c instanceof HTMLElement) {
          const bold = ["B", "STRONG"].includes(c.tagName);
          const italics = ["I", "EM"].includes(c.tagName);
          runs.push(new TextRun({ text: c.innerText, bold, italics }));
        }
      });
      children.push(new Paragraph({ children: runs.length ? runs : [new TextRun(text)] }));
    } else {
      node.childNodes.forEach(walk);
    }
  };
  el.childNodes.forEach(walk);
  if (!children.length) children.push(new Paragraph({ text: title }));

  const doc = new Document({
    sections: [{ properties: {}, children }],
  });
  return Packer.toBlob(doc);
}

export async function slidesFromPptx(bytes: ArrayBuffer): Promise<Slide[]> {
  const JSZip = (await import("jszip")).default;
  const zip = await JSZip.loadAsync(bytes);
  const names = Object.keys(zip.files)
    .filter((n) => /^ppt\/slides\/slide\d+\.xml$/.test(n))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  const slides: Slide[] = [];
  for (const name of names) {
    const xml = await zip.files[name].async("text");
    const texts = [...xml.matchAll(/<a:t[^>]*>([^<]*)<\/a:t>/g)].map((m) => decodeXml(m[1]));
    const title = texts[0] ?? "Slide";
    const body = texts.slice(1).join("\n");
    slides.push({
      id: uid("sld"),
      title,
      body,
      notes: "",
      bg: "#f3eee4",
    });
  }
  return slides.length ? slides : [emptySlide()];
}

function decodeXml(s: string) {
  return s
    .replaceAll("&" + "amp;", "&")
    .replaceAll("&" + "lt;", "<")
    .replaceAll("&" + "gt;", ">")
    .replaceAll("&" + "quot;", '"')
    .replaceAll("&#39;", "'");
}

export function emptySlide(): Slide {
  return {
    id: uid("sld"),
    title: "New slide",
    body: "Add talking points",
    notes: "",
    bg: "#f3eee4",
  };
}

export async function pptxFromSlides(slides: Slide[], title: string): Promise<Blob> {
  const PptxGenJS = (await import("pptxgenjs")).default;
  const pptx = new PptxGenJS();
  pptx.author = "Folio";
  pptx.title = title;
  pptx.layout = "LAYOUT_WIDE";
  for (const s of slides) {
    const slide = pptx.addSlide();
    slide.addShape("rect", {
      x: 0,
      y: 0,
      w: "100%",
      h: "100%",
      fill: { color: (s.bg || "#f3eee4").replace("#", "") },
    });
    slide.addText(s.title || " ", {
      x: 0.7,
      y: 0.55,
      w: 11.5,
      h: 1.1,
      fontSize: 32,
      fontFace: "Georgia",
      color: "1c1917",
      bold: true,
    });
    slide.addText(s.body || " ", {
      x: 0.7,
      y: 1.9,
      w: 11.5,
      h: 4.6,
      fontSize: 18,
      fontFace: "Calibri",
      color: "44403c",
      valign: "top",
    });
  }
  const out = await pptx.write({ outputType: "blob" });
  return out as Blob;
}

export async function sheetsFromXlsx(bytes: ArrayBuffer): Promise<SheetTab[]> {
  const XLSX = await import("xlsx");
  const wb = XLSX.read(bytes, { type: "array" });
  return wb.SheetNames.map((name) => {
    const rows = XLSX.utils.sheet_to_json<(string | number | boolean | null)[]>(wb.Sheets[name], {
      header: 1,
      raw: false,
      defval: "",
    });
    const normalized = rows.map((r) => {
      const arr = Array.isArray(r) ? r : [];
      const width = Math.max(8, arr.length);
      const out = Array.from({ length: width }, (_, i) => String(arr[i] ?? ""));
      return out;
    });
    while (normalized.length < 16) normalized.push(Array.from({ length: 8 }, () => ""));
    return { name, rows: normalized };
  });
}

export function emptySheet(): SheetTab {
  return {
    name: "Sheet1",
    rows: Array.from({ length: 20 }, () => Array.from({ length: 8 }, () => "")),
  };
}

export async function xlsxFromSheets(sheets: SheetTab[]): Promise<Blob> {
  const XLSX = await import("xlsx");
  const wb = XLSX.utils.book_new();
  for (const s of sheets) {
    const ws = XLSX.utils.aoa_to_sheet(s.rows);
    XLSX.utils.book_append_sheet(wb, ws, s.name.slice(0, 31) || "Sheet");
  }
  const out = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  return new Blob([out], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

export function csvFromSheet(tab: SheetTab): string {
  return tab.rows
    .map((row) =>
      row
        .map((cell) => {
          if (/[",\n]/.test(cell)) return `"${cell.replace(/"/g, '""')}"`;
          return cell;
        })
        .join(","),
    )
    .join("\n");
}

export function sheetFromCsv(text: string): SheetTab {
  const rows = text.split(/\r?\n/).map((line) => {
    const out: string[] = [];
    let cur = "";
    let q = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (q) {
        if (ch === '"' && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else if (ch === '"') q = false;
        else cur += ch;
      } else if (ch === '"') q = true;
      else if (ch === ",") {
        out.push(cur);
        cur = "";
      } else cur += ch;
    }
    out.push(cur);
    while (out.length < 8) out.push("");
    return out;
  });
  return { name: "Sheet1", rows: rows.length ? rows : emptySheet().rows };
}

export function htmlToText(html: string): string {
  const d = document.createElement("div");
  d.innerHTML = html;
  return d.innerText;
}

export function mdToHtml(md: string): string {
  const escaped = md
    .replaceAll("&", "&" + "amp;")
    .replaceAll("<", "&" + "lt;")
    .replaceAll(">", "&" + "gt;");
  const lines = escaped.split("\n");
  const out: string[] = [];
  for (const line of lines) {
    if (/^### /.test(line)) out.push(`<h3>${line.slice(4)}</h3>`);
    else if (/^## /.test(line)) out.push(`<h2>${line.slice(3)}</h2>`);
    else if (/^# /.test(line)) out.push(`<h1>${line.slice(2)}</h1>`);
    else if (/^[-*] /.test(line)) out.push(`<li>${line.slice(2)}</li>`);
    else if (!line.trim()) out.push("<p></p>");
    else {
      const inline = line
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.+?)\*/g, "<em>$1</em>");
      out.push(`<p>${inline}</p>`);
    }
  }
  return out.join("");
}

export function htmlToMd(html: string): string {
  const d = document.createElement("div");
  d.innerHTML = html;
  const parts: string[] = [];
  const walk = (n: ChildNode) => {
    if (n.nodeType === Node.TEXT_NODE) {
      parts.push(n.textContent ?? "");
      return;
    }
    if (!(n instanceof HTMLElement)) return;
    const t = n.tagName.toLowerCase();
    if (t === "h1") parts.push(`# ${n.innerText}\n\n`);
    else if (t === "h2") parts.push(`## ${n.innerText}\n\n`);
    else if (t === "h3") parts.push(`### ${n.innerText}\n\n`);
    else if (t === "li") parts.push(`- ${n.innerText}\n`);
    else if (t === "p") parts.push(`${n.innerText}\n\n`);
    else if (t === "strong" || t === "b") parts.push(`**${n.innerText}**`);
    else if (t === "em" || t === "i") parts.push(`*${n.innerText}*`);
    else n.childNodes.forEach(walk);
  };
  d.childNodes.forEach(walk);
  return parts.join("").trim();
}

export function sanitizeHtml(html: string): string {
  // DOMPurify is loaded lazily by callers that already sanitized.
  return html;
}

export async function cleanHtml(html: string): Promise<string> {
  const DOMPurify = (await import("dompurify")).default;
  return DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
}

export async function thumbFromHtml(html: string): Promise<string | undefined> {
  try {
    const html2canvas = (await import("html2canvas")).default;
    const wrap = document.createElement("div");
    wrap.style.cssText =
      "position:fixed;left:-2000px;top:0;width:420px;padding:24px;background:#f3eee4;color:#1c1917;font:14px IBM Plex Sans,sans-serif;";
    wrap.innerHTML = html || "<p>Empty document</p>";
    document.body.appendChild(wrap);
    const canvas = await html2canvas(wrap, { scale: 0.6, backgroundColor: "#f3eee4" });
    wrap.remove();
    return canvas.toDataURL("image/jpeg", 0.7);
  } catch {
    return undefined;
  }
}

export function defaultHtml(title: string, body?: string): string {
  return `<h1>${escapeHtml(title)}</h1>${body ?? "<p>Start writing.</p>"}`;
}

export function escapeHtml(s: string): string {
  const map: Record<string, string> = {
    "&": "&" + "amp;",
    "<": "&" + "lt;",
    ">": "&" + "gt;",
    '"': "&" + "quot;",
  };
  return s.replace(/[&<>"]/g, (ch) => map[ch] ?? ch);
}

export async function htmlToPdfBytes(html: string): Promise<Uint8Array> {
  const html2canvas = (await import("html2canvas")).default;
  const { PDFDocument } = await import("pdf-lib");
  const wrap = document.createElement("div");
  wrap.style.cssText =
    "position:fixed;left:-4000px;top:0;width:794px;padding:56px 64px;background:#ffffff;color:#1c1917;font:16px IBM Plex Sans,sans-serif;line-height:1.55;";
  wrap.innerHTML = html || "<p></p>";
  document.body.appendChild(wrap);
  const canvas = await html2canvas(wrap, { scale: 2, backgroundColor: "#ffffff", useCORS: true });
  wrap.remove();
  const pdf = await PDFDocument.create();
  const pageW = 612;
  const scale = pageW / canvas.width;
  const pageHpx = 792 / scale;
  let y = 0;
  while (y < canvas.height - 1) {
    const sliceH = Math.min(pageHpx, canvas.height - y);
    const slice = document.createElement("canvas");
    slice.width = canvas.width;
    slice.height = sliceH;
    const ctx = slice.getContext("2d");
    if (!ctx) break;
    ctx.drawImage(canvas, 0, y, canvas.width, sliceH, 0, 0, canvas.width, sliceH);
    const blob: Blob = await new Promise((res, rej) =>
      slice.toBlob((b) => (b ? res(b) : rej(new Error("encode"))), "image/png"),
    );
    const img = await pdf.embedPng(new Uint8Array(await blob.arrayBuffer()));
    const h = sliceH * scale;
    const page = pdf.addPage([pageW, h]);
    page.drawImage(img, { x: 0, y: 0, width: pageW, height: h });
    y += sliceH;
  }
  return pdf.save();
}

export function textOfDoc(doc: FolioDoc): string {
  if (doc.text) return doc.text;
  if (doc.html) return htmlToText(doc.html);
  if (doc.slides) return doc.slides.map((s) => `${s.title}\n${s.body}`).join("\n\n");
  if (doc.sheets) return doc.sheets.map((s) => s.rows.map((r) => r.join("\t")).join("\n")).join("\n\n");
  return "";
}
