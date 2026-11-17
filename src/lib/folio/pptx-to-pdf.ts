import { PDFDocument, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { drawRuns } from "./fonts";
import { catalogIdFor } from "./font-catalog";
import { resolveFont } from "./pdf";

const EMU_PER_PT = 12700;
const A = "http://schemas.openxmlformats.org/drawingml/2006/main";
const P = "http://schemas.openxmlformats.org/presentationml/2006/main";
const R = "http://schemas.openxmlformats.org/officeDocument/2006/relationships";

type Xfrm = { x: number; y: number; w: number; h: number };
const kids = (el: Element, ns: string, name: string) => [...el.children].filter((c) => c.localName === name && c.namespaceURI === ns);
const kid = (el: Element | null | undefined, ns: string, name: string) => (el ? kids(el, ns, name)[0] : undefined);
const parse = (xml: string) => new DOMParser().parseFromString(xml, "application/xml");

function resolvePath(base: string, target: string): string {
  if (target.startsWith("/")) return target.slice(1);
  const parts = base.split("/").slice(0, -1);
  for (const seg of target.split("/")) {
    if (seg === "..") parts.pop();
    else if (seg !== ".") parts.push(seg);
  }
  return parts.join("/");
}

function relsOf(xml: string | undefined, from: string): Map<string, string> {
  const m = new Map<string, string>();
  if (!xml) return m;
  for (const r of parse(xml).getElementsByTagName("Relationship")) m.set(r.getAttribute("Id") ?? "", resolvePath(from, r.getAttribute("Target") ?? ""));
  return m;
}

function themeColors(xml: string | undefined): Record<string, string> {
  const out: Record<string, string> = { tx1: "000000", bg1: "FFFFFF", dk1: "000000", lt1: "FFFFFF" };
  if (!xml) return out;
  const scheme = parse(xml).getElementsByTagNameNS(A, "clrScheme")[0];
  if (!scheme) return out;
  for (const c of scheme.children) {
    const v = c.firstElementChild?.getAttribute("val") ?? c.firstElementChild?.getAttribute("lastClr");
    if (v) out[c.localName] = v;
  }
  out.tx1 = out.dk1 ?? out.tx1;
  out.bg1 = out.lt1 ?? out.bg1;
  out.tx2 = out.dk2 ?? out.tx1;
  out.bg2 = out.lt2 ?? out.bg1;
  return out;
}

function colorOf(fill: Element | null | undefined, theme: Record<string, string>): string | null {
  const solid = kid(fill, A, "solidFill");
  const c = solid?.firstElementChild;
  if (!c) return null;
  if (c.localName === "srgbClr") return c.getAttribute("val");
  if (c.localName === "schemeClr") return theme[c.getAttribute("val") ?? ""] ?? null;
  return null;
}

const hexRgb = (h: string) => rgb(parseInt(h.slice(0, 2), 16) / 255, parseInt(h.slice(2, 4), 16) / 255, parseInt(h.slice(4, 6), 16) / 255);

function xfrmOf(spPr: Element | null | undefined): Xfrm | null {
  const x = kid(spPr, A, "xfrm");
  const off = kid(x, A, "off");
  const ext = kid(x, A, "ext");
  if (!off || !ext) return null;
  return { x: Number(off.getAttribute("x")) / EMU_PER_PT, y: Number(off.getAttribute("y")) / EMU_PER_PT, w: Number(ext.getAttribute("cx")) / EMU_PER_PT, h: Number(ext.getAttribute("cy")) / EMU_PER_PT };
}

/** Position of a placeholder inherited from the slide layout or master. */
function inheritedXfrm(sp: Element, layoutDoc: Document | null, masterDoc: Document | null): Xfrm | null {
  const ph = sp.getElementsByTagNameNS(P, "ph")[0];
  if (!ph) return null;
  const type = ph.getAttribute("type");
  const idx = ph.getAttribute("idx");
  for (const doc of [layoutDoc, masterDoc]) {
    if (!doc) continue;
    for (const cand of doc.getElementsByTagNameNS(P, "sp")) {
      const cph = cand.getElementsByTagNameNS(P, "ph")[0];
      if (!cph) continue;
      if ((idx && cph.getAttribute("idx") === idx) || (type && cph.getAttribute("type") === type)) {
        const x = xfrmOf(kid(cand, P, "spPr"));
        if (x) return x;
      }
    }
  }
  return null;
}

function fontKind(face: string | null): "sans" | "serif" | "mono" {
  const n = (face ?? "").toLowerCase();
  if (/courier|mono|consolas/.test(n)) return "mono";
  if (/times|georgia|garamond|cambria|serif/.test(n) && !/sans/.test(n)) return "serif";
  return "sans";
}

type Run = { text: string; size: number; bold: boolean; italic: boolean; color: string; face: string | null };

function paragraphsOf(txBody: Element, theme: Record<string, string>): { runs: Run[]; algn: string }[] {
  const out: { runs: Run[]; algn: string }[] = [];
  for (const p of kids(txBody, A, "p")) {
    const algn = kid(p, A, "pPr")?.getAttribute("algn") ?? "l";
    const runs: Run[] = [];
    for (const r of kids(p, A, "r")) {
      const rPr = kid(r, A, "rPr");
      const text = kid(r, A, "t")?.textContent ?? "";
      if (!text) continue;
      runs.push({
        text,
        size: (Number(rPr?.getAttribute("sz")) || 1800) / 100,
        bold: rPr?.getAttribute("b") === "1",
        italic: rPr?.getAttribute("i") === "1",
        color: colorOf(rPr, theme) ?? theme.tx1 ?? "000000",
        face: kid(rPr, A, "latin")?.getAttribute("typeface") ?? null,
      });
    }
    out.push({ runs, algn });
  }
  return out;
}

/**
 * Real slides as real PDF pages: one page per slide, with live text, pictures and filled shapes in place.
 * Understands the common PowerPoint structure (text boxes, placeholders, pictures, rectangles/ellipses, theme colours).
 */
export async function pptxToPdf(bytes: ArrayBuffer): Promise<Uint8Array> {
  const JSZip = (await import("jszip")).default;
  const zip = await JSZip.loadAsync(bytes);
  const text = async (path: string) => (zip.file(path) ? await zip.file(path)!.async("string") : undefined);

  const pres = await text("ppt/presentation.xml");
  if (!pres) throw new Error("Not a PowerPoint file");
  const presDoc = parse(pres);
  const sz = presDoc.getElementsByTagNameNS(P, "sldSz")[0];
  const pageW = (Number(sz?.getAttribute("cx")) || 9144000) / EMU_PER_PT;
  const pageH = (Number(sz?.getAttribute("cy")) || 5143500) / EMU_PER_PT;
  const presRels = relsOf(await text("ppt/_rels/presentation.xml.rels"), "ppt/presentation.xml");
  const slidePaths = [...presDoc.getElementsByTagNameNS(P, "sldId")].map((s) => presRels.get(s.getAttributeNS(R, "id") ?? "")).filter((x): x is string => !!x);
  const theme = themeColors(await text("ppt/theme/theme1.xml"));

  const out = await PDFDocument.create();
  const fontCache = new Map<string, PDFFont>();
  const fontFor = async (face: string | null, bold: boolean, italic: boolean) => {
    const id = catalogIdFor(face ?? undefined, fontKind(face));
    const key = `${id}|${bold}|${italic}`;
    let f = fontCache.get(key);
    if (!f) fontCache.set(key, (f = await resolveFont(out, id, bold, italic)));
    return f;
  };

  for (const slidePath of slidePaths) {
    const slideXml = await text(slidePath);
    if (!slideXml) continue;
    const slide = parse(slideXml);
    const rels = relsOf(await text(slidePath.replace("slides/", "slides/_rels/") + ".rels"), slidePath);
    const layoutPath = [...rels.values()].find((v) => v.includes("slideLayouts/"));
    const layoutXml = layoutPath ? await text(layoutPath) : undefined;
    const layoutDoc = layoutXml ? parse(layoutXml) : null;
    const layoutRels = layoutPath ? relsOf(await text(layoutPath.replace("slideLayouts/", "slideLayouts/_rels/") + ".rels"), layoutPath) : new Map<string, string>();
    const masterPath = [...layoutRels.values()].find((v) => v.includes("slideMasters/"));
    const masterXml = masterPath ? await text(masterPath) : undefined;
    const masterDoc = masterXml ? parse(masterXml) : null;

    const page: PDFPage = out.addPage([pageW, pageH]);
    const bg = colorOf(kid(kid(kid(slide.documentElement, P, "cSld"), P, "bg"), P, "bgPr"), theme);
    if (bg) page.drawRectangle({ x: 0, y: 0, width: pageW, height: pageH, color: hexRgb(bg) });

    const tree = kid(kid(slide.documentElement, P, "cSld"), P, "spTree");
    const shapes = tree ? [...tree.getElementsByTagNameNS(P, "sp"), ...tree.getElementsByTagNameNS(P, "pic")] : [];
    // keep document order (shapes then pictures would break stacking)
    const ordered = tree ? [...tree.getElementsByTagName("*")].filter((e) => shapes.includes(e)) : [];
    for (const el of ordered) {
      const spPr = kid(el, P, "spPr");
      const box = xfrmOf(spPr) ?? inheritedXfrm(el, layoutDoc, masterDoc);
      if (!box) continue;
      const y = pageH - box.y - box.h; // PDF origin is bottom-left
      if (el.localName === "pic") {
        const embed = el.getElementsByTagNameNS(A, "blip")[0]?.getAttributeNS(R, "embed");
        const path = embed ? rels.get(embed) : undefined;
        const file = path ? zip.file(path) : null;
        if (!file || !path) continue;
        const data = await file.async("uint8array");
        try {
          const img = /\.(jpe?g)$/i.test(path) ? await out.embedJpg(data) : /\.png$/i.test(path) ? await out.embedPng(data) : null;
          if (img) page.drawImage(img, { x: box.x, y, width: box.w, height: box.h });
        } catch {
          /* unsupported picture */
        }
        continue;
      }
      // shape fill
      const fill = colorOf(spPr, theme);
      const prst = kid(spPr, A, "prstGeom")?.getAttribute("prst");
      if (fill) {
        if (prst === "ellipse") page.drawEllipse({ x: box.x + box.w / 2, y: y + box.h / 2, xScale: box.w / 2, yScale: box.h / 2, color: hexRgb(fill) });
        else page.drawRectangle({ x: box.x, y, width: box.w, height: box.h, color: hexRgb(fill) });
      }
      // text
      const body = kid(el, P, "txBody");
      if (!body) continue;
      const paras = paragraphsOf(body, theme);
      const inset = 7.2;
      const maxW = Math.max(10, box.w - inset * 2);
      const lines: { text: string; run: Run; width: number; algn: string; font: PDFFont }[] = [];
      for (const para of paras) {
        const run0 = para.runs[0];
        if (!run0) {
          lines.push({ text: "", run: { text: "", size: 18, bold: false, italic: false, color: theme.tx1 ?? "000000", face: null }, width: 0, algn: para.algn, font: await fontFor(null, false, false) });
          continue;
        }
        // one font per paragraph (its first run), words wrapped to the box width
        const font = await fontFor(run0.face, run0.bold, run0.italic);
        const full = para.runs.map((r) => r.text).join("");
        let cur = "";
        for (const word of full.split(/(\s+)/)) {
          const trial = cur + word;
          if (cur && font.widthOfTextAtSize(trial.trimEnd(), run0.size) > maxW) {
            lines.push({ text: cur.trimEnd(), run: run0, width: font.widthOfTextAtSize(cur.trimEnd(), run0.size), algn: para.algn, font });
            cur = word.trimStart();
          } else cur = trial;
        }
        lines.push({ text: cur.trimEnd(), run: run0, width: font.widthOfTextAtSize(cur.trimEnd(), run0.size), algn: para.algn, font });
      }
      const anchor = kid(body, A, "bodyPr")?.getAttribute("anchor");
      const totalH = lines.reduce((s, l) => s + l.run.size * 1.2, 0);
      let cy = anchor === "ctr" ? pageH - box.y - (box.h - totalH) / 2 : anchor === "b" ? pageH - box.y - box.h + totalH : pageH - box.y - inset / 2;
      for (const l of lines) {
        cy -= l.run.size * 1.2;
        if (!l.text) continue;
        const x = l.algn === "ctr" ? box.x + (box.w - l.width) / 2 : l.algn === "r" ? box.x + box.w - inset - l.width : box.x + inset;
        await drawRuns(out, page, l.text, { x, y: cy + l.run.size * 0.2, size: l.run.size, color: hexRgb(l.run.color), helv: l.font });
      }
    }
  }
  if (!out.getPageCount()) throw new Error("No slides found");
  return out.save();
}
