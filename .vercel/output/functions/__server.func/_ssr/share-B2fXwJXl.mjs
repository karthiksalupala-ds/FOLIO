import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { n as Slot, s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { c as cn, f as uid, l as downloadBlob, s as asArrayBuffer } from "./router-BNe88wCr.mjs";
import { i as SliderTrack, n as SliderRange, r as SliderThumb, t as Slider$1 } from "../_libs/@radix-ui/react-slider+[...].mjs";
import { t as create } from "../_libs/zustand.mjs";
import { t as openDB } from "../_libs/idb.mjs";
import { a as LineCapStyle, i as rgb, n as PDFDocument, o as degrees, r as StandardFonts } from "../_libs/pdf-lib.mjs";
require_react();
var import_jsx_runtime = require_jsx_runtime();
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium select-none disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-accent/70 active:not-disabled:scale-[0.96] transition-[scale,background-color,color,opacity] duration-150 ease-out", {
	variants: {
		variant: {
			default: "bg-accent text-accent-fg hover:bg-accent/90",
			secondary: "bg-raised text-fg hover:bg-raised/80 shadow-[0_0_0_1px_var(--color-border)]",
			ghost: "text-fg hover:bg-raised",
			outline: "text-fg shadow-[0_0_0_1px_var(--color-border)] hover:bg-raised",
			danger: "bg-danger text-danger-fg hover:bg-danger/90",
			paper: "bg-paper text-ink hover:bg-paper-2",
			tool: "bg-[var(--tool,var(--color-accent))] text-on-tool hover:brightness-95"
		},
		size: {
			default: "h-10 px-3.5",
			sm: "h-8 px-2.5 text-[13px]",
			lg: "h-11 px-4",
			icon: "size-10",
			tool: "size-9 rounded-[10px]"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
function Button({ className, variant, size, asChild = false, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		"data-slot": "button",
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		...props
	});
}
function Input({ className, type, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		type,
		"data-slot": "input",
		className: cn("flex h-10 w-full rounded-md bg-raised px-3 text-sm text-fg placeholder:text-subtle shadow-[0_0_0_1px_var(--color-border)] outline-none focus-visible:shadow-[0_0_0_1px_var(--color-accent)] disabled:opacity-40", className),
		...props
	});
}
function Textarea({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		"data-slot": "textarea",
		className: cn("flex min-h-24 w-full rounded-md bg-raised px-3 py-2 text-sm text-fg placeholder:text-subtle shadow-[0_0_0_1px_var(--color-border)] outline-none focus-visible:shadow-[0_0_0_1px_var(--color-accent)] disabled:opacity-40", className),
		...props
	});
}
function Slider({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Slider$1, {
		className: cn("relative flex w-full touch-none items-center select-none", className),
		...props,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SliderTrack, {
			className: "relative h-1 w-full grow overflow-hidden rounded-full bg-raised",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SliderRange, { className: "absolute h-full bg-accent" })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SliderThumb, { className: "block size-4 rounded-full bg-accent shadow-[var(--shadow-pop)] outline-none" })]
	});
}
var MARK_COLORS = [
	{
		id: "mark",
		value: "#f2d56b",
		label: "Gold"
	},
	{
		id: "green",
		value: "#b7d7a8",
		label: "Green"
	},
	{
		id: "pink",
		value: "#f0b6c4",
		label: "Pink"
	},
	{
		id: "blue",
		value: "#a8c5e2",
		label: "Blue"
	},
	{
		id: "orange",
		value: "#f0c49a",
		label: "Peach"
	},
	{
		id: "ink",
		value: "#1c1917",
		label: "Ink"
	}
];
var INK_COLORS = [
	"#1c1917",
	"#c45c4a",
	"#3d6b9a",
	"#6a8f71",
	"#c5c9d1",
	"#eeeae3"
];
var STAMPS = [
	{
		id: "approved",
		label: "APPROVED"
	},
	{
		id: "confidential",
		label: "CONFIDENTIAL"
	},
	{
		id: "draft",
		label: "DRAFT"
	},
	{
		id: "signed",
		label: "SIGNED"
	},
	{
		id: "rejected",
		label: "REJECTED"
	}
];
var EXPORT_FORMATS = [
	{
		id: "pdf",
		label: "PDF",
		hint: "Portable document"
	},
	{
		id: "docx",
		label: "Word",
		hint: "DOCX"
	},
	{
		id: "pptx",
		label: "Slides",
		hint: "PPTX"
	},
	{
		id: "xlsx",
		label: "Excel",
		hint: "XLSX"
	},
	{
		id: "txt",
		label: "Plain text",
		hint: "TXT"
	},
	{
		id: "md",
		label: "Markdown",
		hint: "MD"
	},
	{
		id: "html",
		label: "Web page",
		hint: "HTML"
	},
	{
		id: "csv",
		label: "CSV",
		hint: "Spreadsheet"
	},
	{
		id: "png",
		label: "PNG",
		hint: "Image"
	},
	{
		id: "jpg",
		label: "JPG",
		hint: "Image"
	}
];
function kindFromName(name) {
	const ext = name.split(".").pop()?.toLowerCase() ?? "";
	if (ext === "pdf") return "pdf";
	if (ext === "docx" || ext === "doc") return "docx";
	if (ext === "pptx" || ext === "ppt") return "pptx";
	if (ext === "xlsx" || ext === "xls") return "xlsx";
	if (ext === "csv") return "csv";
	if (ext === "md" || ext === "markdown") return "md";
	if (ext === "html" || ext === "htm") return "html";
	if (ext === "rtf") return "rtf";
	if ([
		"png",
		"jpg",
		"jpeg",
		"webp",
		"gif",
		"svg"
	].includes(ext)) return "image";
	return "txt";
}
function mimeFor(format) {
	switch (format) {
		case "pdf": return "application/pdf";
		case "docx": return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
		case "pptx": return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
		case "xlsx": return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
		case "csv": return "text/csv";
		case "txt": return "text/plain";
		case "md": return "text/markdown";
		case "html": return "text/html";
		case "png": return "image/png";
		case "jpg": return "image/jpeg";
	}
}
var dbp = null;
function db() {
	if (!dbp) dbp = openDB("folio-studio", 1, { upgrade(database) {
		database.createObjectStore("docs", { keyPath: "id" }).createIndex("by-updated", "updatedAt");
	} });
	return dbp;
}
async function listDocs() {
	return (await (await db()).getAll("docs")).map(({ bytes: _b, annotations: _a, pages: _p, html: _h, slides: _s, sheets: _sh, text: _t, watermark: _w, pageNumbers: _n, ...meta }) => meta).sort((a, b) => b.updatedAt - a.updatedAt);
}
async function getDoc(id) {
	return (await db()).get("docs", id);
}
async function putDoc(doc) {
	await (await db()).put("docs", doc);
}
async function deleteDoc(id) {
	await (await db()).delete("docs", id);
}
var pdfjsMod = null;
async function loadPdfjs() {
	if (pdfjsMod) return pdfjsMod;
	const pdfjs = await import("../_libs/pdfjs-dist.mjs").then((n) => n.t);
	pdfjs.GlobalWorkerOptions.workerSrc = "/pdfjs/pdf.worker.min.mjs";
	pdfjsMod = pdfjs;
	return pdfjs;
}
async function openPdfJs(bytes, password) {
	const pdfjs = await loadPdfjs();
	const data = new Uint8Array(bytes.slice(0));
	return pdfjs.getDocument({
		data,
		password,
		cMapUrl: "/pdfjs/cmaps/",
		cMapPacked: true,
		standardFontDataUrl: "/pdfjs/standard_fonts/",
		wasmUrl: "/pdfjs/wasm/",
		useSystemFonts: true,
		verbosity: 0
	}).promise;
}
async function extractPageText(page, viewportWidth, viewportHeight, viewportTransform) {
	const pdfjs = await loadPdfjs();
	const content = await page.getTextContent();
	const items = [];
	for (const raw of content.items) {
		if (!("str" in raw) || !raw.str) continue;
		const it = raw;
		const tx = pdfjs.Util.transform(viewportTransform, it.transform);
		const fontSize = Math.hypot(tx[2] ?? 0, tx[3] ?? 0) || 12;
		const left = tx[4] ?? 0;
		const top = (tx[5] ?? 0) - fontSize;
		const native = Math.hypot(it.transform[2] ?? 0, it.transform[3] ?? 12) || 12;
		const width = (it.width || it.str.length * native * .5) * (fontSize / native);
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
			nh: height / viewportHeight
		});
	}
	return items;
}
async function pagePlainText(page) {
	const content = await page.getTextContent();
	const parts = [];
	let line = "";
	let lastY = null;
	for (const raw of content.items) {
		if (!("str" in raw)) continue;
		const it = raw;
		const y = it.transform[5];
		if (lastY !== null && Math.abs(lastY - y) > 4) {
			parts.push(line);
			line = it.str;
		} else line += it.str;
		lastY = y;
	}
	if (line) parts.push(line);
	return parts.join("\n");
}
async function renderPageToCanvas(page, canvas, scale, rotation) {
	const viewport = page.getViewport({
		scale,
		rotation
	});
	const ctx = canvas.getContext("2d");
	if (!ctx) throw new Error("Canvas unavailable");
	canvas.width = Math.ceil(viewport.width);
	canvas.height = Math.ceil(viewport.height);
	canvas.style.width = `${viewport.width}px`;
	canvas.style.height = `${viewport.height}px`;
	await page.render({
		canvas,
		canvasContext: ctx,
		viewport
	}).promise;
	return {
		width: viewport.width,
		height: viewport.height
	};
}
function hexToRgb(hex) {
	const h = hex.replace("#", "");
	const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
	return rgb((n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255);
}
function nToPdf(page, x, y, w, h) {
	const { width, height } = page.getSize();
	return {
		x: x * width,
		y: height - (y + h) * height,
		width: w * width,
		height: h * height
	};
}
async function embedImage(pdf, src) {
	const buf = await (await fetch(src)).arrayBuffer();
	const bytes = new Uint8Array(buf);
	if (src.startsWith("data:image/jpeg") || src.includes("image/jpeg")) return pdf.embedJpg(bytes);
	return pdf.embedPng(bytes);
}
function drawArrow(page, from, to, color, thickness) {
	const { width, height } = page.getSize();
	const x1 = from.x * width;
	const y1 = height - from.y * height;
	const x2 = to.x * width;
	const y2 = height - to.y * height;
	page.drawLine({
		start: {
			x: x1,
			y: y1
		},
		end: {
			x: x2,
			y: y2
		},
		thickness,
		color
	});
	const angle = Math.atan2(y2 - y1, x2 - x1);
	const head = 10;
	page.drawLine({
		start: {
			x: x2,
			y: y2
		},
		end: {
			x: x2 - head * Math.cos(angle - Math.PI / 6),
			y: y2 - head * Math.sin(angle - Math.PI / 6)
		},
		thickness,
		color
	});
	page.drawLine({
		start: {
			x: x2,
			y: y2
		},
		end: {
			x: x2 - head * Math.cos(angle + Math.PI / 6),
			y: y2 - head * Math.sin(angle + Math.PI / 6)
		},
		thickness,
		color
	});
}
async function bakePdf(doc) {
	const pdf = await PDFDocument.load(doc.bytes, { ignoreEncryption: true });
	const helv = await pdf.embedFont(StandardFonts.Helvetica);
	const helvBold = await pdf.embedFont(StandardFonts.HelveticaBold);
	const times = await pdf.embedFont(StandardFonts.TimesRoman);
	const keep = doc.pages.filter((p) => p.source >= 0 && p.source < pdf.getPageCount());
	if (keep.length && keep.length !== pdf.getPageCount()) {
		const rebuilt = await PDFDocument.create();
		const indices = keep.map((p) => p.source);
		(await rebuilt.copyPages(pdf, indices)).forEach((pg) => rebuilt.addPage(pg));
		const saved = await rebuilt.save();
		return bakePdf({
			...doc,
			bytes: asArrayBuffer(saved),
			pages: keep.map((p, i) => ({
				...p,
				source: i
			}))
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
		await drawAnnot(pdf, page, a, {
			helv,
			helvBold,
			times
		});
	}
	if (doc.watermark?.text) for (const page of pages) {
		const { width, height } = page.getSize();
		page.drawText(doc.watermark.text, {
			x: width * .18,
			y: height * .4,
			size: 42,
			font: helvBold,
			color: rgb(.6, .6, .62),
			opacity: doc.watermark.opacity ?? .16,
			rotate: degrees(32)
		});
	}
	if (doc.pageNumbers) pages.forEach((page, i) => {
		const { width } = page.getSize();
		const label = `${i + 1} / ${pages.length}`;
		page.drawText(label, {
			x: width / 2 - helv.widthOfTextAtSize(label, 9) / 2,
			y: 18,
			size: 9,
			font: helv,
			color: rgb(.4, .4, .4)
		});
	});
	return pdf.save({ useObjectStreams: true });
}
async function drawAnnot(pdf, page, a, fonts) {
	const { width: pw, height: ph } = page.getSize();
	switch (a.type) {
		case "highlight": {
			const r = nToPdf(page, a.x, a.y, a.w, a.h);
			page.drawRectangle({
				...r,
				color: hexToRgb(a.color),
				opacity: .38
			});
			break;
		}
		case "redact": {
			const r = nToPdf(page, a.x, a.y, a.w, a.h);
			page.drawRectangle({
				...r,
				color: rgb(0, 0, 0)
			});
			break;
		}
		case "underline":
		case "strike": {
			const y = a.type === "underline" ? a.y + a.h * .85 : a.y + a.h * .5;
			page.drawLine({
				start: {
					x: a.x * pw,
					y: ph - y * ph
				},
				end: {
					x: (a.x + a.w) * pw,
					y: ph - y * ph
				},
				thickness: 1.4,
				color: hexToRgb(a.color)
			});
			break;
		}
		case "rect": {
			const r = nToPdf(page, a.x, a.y, a.w, a.h);
			page.drawRectangle({
				...r,
				borderColor: hexToRgb(a.color),
				borderWidth: a.strokeWidth,
				color: a.fill ? hexToRgb(a.color) : void 0,
				opacity: a.fill ? .18 : 1
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
				color: a.fill ? hexToRgb(a.color) : void 0,
				opacity: a.fill ? .18 : 1
			});
			break;
		}
		case "line":
			page.drawLine({
				start: {
					x: a.x * pw,
					y: ph - a.y * ph
				},
				end: {
					x: (a.x + a.w) * pw,
					y: ph - (a.y + a.h) * ph
				},
				thickness: a.strokeWidth,
				color: hexToRgb(a.color)
			});
			break;
		case "arrow":
			drawArrow(page, {
				x: a.x,
				y: a.y
			}, {
				x: a.x + a.w,
				y: a.y + a.h
			}, hexToRgb(a.color), a.strokeWidth);
			break;
		case "pen":
			if (a.points.length < 2) break;
			for (let i = 1; i < a.points.length; i++) {
				const p0 = a.points[i - 1];
				const p1 = a.points[i];
				page.drawLine({
					start: {
						x: p0.x * pw,
						y: ph - p0.y * ph
					},
					end: {
						x: p1.x * pw,
						y: ph - p1.y * ph
					},
					thickness: a.strokeWidth,
					color: hexToRgb(a.color),
					lineCap: LineCapStyle.Round
				});
			}
			break;
		case "text":
		case "replace": {
			if (a.type === "replace") {
				const r = nToPdf(page, a.x, a.y, a.w, a.h);
				page.drawRectangle({
					...r,
					color: rgb(1, 1, 1)
				});
			}
			const font = a.type === "text" && a.bold ? fonts.helvBold : fonts.helv;
			const size = a.fontSize;
			a.text.split("\n").forEach((line, i) => {
				const x = a.x * pw + 2;
				const y = ph - a.y * ph - size * (i + .9);
				try {
					page.drawText(winAnsi(line), {
						x,
						y,
						size,
						font,
						color: hexToRgb(a.color)
					});
				} catch {
					page.drawText(winAnsi(line), {
						x,
						y,
						size,
						font: fonts.helv,
						color: hexToRgb(a.color)
					});
				}
			});
			break;
		}
		case "image":
		case "sign":
			try {
				const img = await embedImage(pdf, a.src);
				const r = nToPdf(page, a.x, a.y, a.w, a.h);
				page.drawImage(img, r);
			} catch {}
			break;
		case "stamp": {
			const r = nToPdf(page, a.x, a.y, a.w, a.h);
			const label = a.stamp.toUpperCase();
			page.drawRectangle({
				...r,
				borderColor: hexToRgb(a.color),
				borderWidth: 3
			});
			const size = Math.min(18, r.height * .4);
			const tw = fonts.helvBold.widthOfTextAtSize(label, size);
			page.drawText(label, {
				x: r.x + (r.width - tw) / 2,
				y: r.y + r.height / 2 - size / 3,
				size,
				font: fonts.helvBold,
				color: hexToRgb(a.color)
			});
			break;
		}
		case "note": {
			const r = nToPdf(page, a.x, a.y, .18, .08);
			page.drawRectangle({
				...r,
				color: rgb(.95, .84, .42)
			});
			page.drawText(winAnsi(a.text.slice(0, 80)), {
				x: r.x + 4,
				y: r.y + r.height - 14,
				size: 8,
				font: fonts.helv,
				color: rgb(.15, .12, .1),
				maxWidth: r.width - 8
			});
			break;
		}
	}
}
function winAnsi(s) {
	return s.replace(/[^\x00-\x7E]/g, (ch) => {
		return {
			"’": "'",
			"‘": "'",
			"“": "\"",
			"”": "\"",
			"–": "-",
			"—": "-",
			"…": "...",
			"•": "*"
		}[ch] ?? "?";
	});
}
async function mergePdfs(buffers) {
	const out = await PDFDocument.create();
	for (const buf of buffers) {
		const src = await PDFDocument.load(buf, { ignoreEncryption: true });
		(await out.copyPages(src, src.getPageIndices())).forEach((p) => out.addPage(p));
	}
	return out.save({ useObjectStreams: true });
}
async function pdfFromImages(images) {
	const pdf = await PDFDocument.create();
	for (const img of images) {
		const bytes = new Uint8Array(img.bytes);
		const embedded = img.mime.includes("jpeg") || img.mime.includes("jpg") ? await pdf.embedJpg(bytes) : await pdf.embedPng(bytes);
		pdf.addPage([embedded.width, embedded.height]).drawImage(embedded, {
			x: 0,
			y: 0,
			width: embedded.width,
			height: embedded.height
		});
	}
	return pdf.save();
}
function defaultPages(count) {
	return Array.from({ length: count }, (_, i) => ({
		id: uid("pg"),
		source: i,
		rotation: 0
	}));
}
async function canvasToJpeg(canvas, quality = .86) {
	return new Promise((resolve, reject) => {
		canvas.toBlob((b) => b ? resolve(b) : reject(/* @__PURE__ */ new Error("encode failed")), "image/jpeg", quality);
	});
}
async function canvasToPng(canvas) {
	return new Promise((resolve, reject) => {
		canvas.toBlob((b) => b ? resolve(b) : reject(/* @__PURE__ */ new Error("encode failed")), "image/png");
	});
}
async function htmlFromDocx(bytes) {
	return (await (await import("../_libs/mammoth+[...].mjs").then((n) => /* @__PURE__ */ __toESM(n.t()))).convertToHtml({ arrayBuffer: bytes })).value || "<p></p>";
}
async function docxFromHtml(html, title) {
	const { Document, Packer, Paragraph, TextRun, HeadingLevel } = await import("../_libs/docx.mjs").then((n) => n.t);
	const el = document.createElement("div");
	el.innerHTML = html;
	const children = [];
	const walk = (node) => {
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
		if (tag === "h1") children.push(new Paragraph({
			text,
			heading: HeadingLevel.HEADING_1
		}));
		else if (tag === "h2") children.push(new Paragraph({
			text,
			heading: HeadingLevel.HEADING_2
		}));
		else if (tag === "h3") children.push(new Paragraph({
			text,
			heading: HeadingLevel.HEADING_3
		}));
		else if (tag === "li") children.push(new Paragraph({ text: `• ${text}` }));
		else if (tag === "p" || tag === "div") {
			const runs = [];
			node.childNodes.forEach((c) => {
				if (c.nodeType === Node.TEXT_NODE) runs.push(new TextRun(c.textContent ?? ""));
				else if (c instanceof HTMLElement) {
					const bold = ["B", "STRONG"].includes(c.tagName);
					const italics = ["I", "EM"].includes(c.tagName);
					runs.push(new TextRun({
						text: c.innerText,
						bold,
						italics
					}));
				}
			});
			children.push(new Paragraph({ children: runs.length ? runs : [new TextRun(text)] }));
		} else node.childNodes.forEach(walk);
	};
	el.childNodes.forEach(walk);
	if (!children.length) children.push(new Paragraph({ text: title }));
	const doc = new Document({ sections: [{
		properties: {},
		children
	}] });
	return Packer.toBlob(doc);
}
async function slidesFromPptx(bytes) {
	const zip = await (await import("../_libs/jszip+[...].mjs").then((n) => /* @__PURE__ */ __toESM(n.t()))).default.loadAsync(bytes);
	const names = Object.keys(zip.files).filter((n) => /^ppt\/slides\/slide\d+\.xml$/.test(n)).sort((a, b) => a.localeCompare(b, void 0, { numeric: true }));
	const slides = [];
	for (const name of names) {
		const texts = [...(await zip.files[name].async("text")).matchAll(/<a:t[^>]*>([^<]*)<\/a:t>/g)].map((m) => decodeXml(m[1]));
		const title = texts[0] ?? "Slide";
		const body = texts.slice(1).join("\n");
		slides.push({
			id: uid("sld"),
			title,
			body,
			notes: "",
			bg: "#f3eee4"
		});
	}
	return slides.length ? slides : [emptySlide()];
}
function decodeXml(s) {
	return s.replaceAll("&amp;", "&").replaceAll("&lt;", "<").replaceAll("&gt;", ">").replaceAll("&quot;", "\"").replaceAll("&#39;", "'");
}
function emptySlide() {
	return {
		id: uid("sld"),
		title: "New slide",
		body: "Add talking points",
		notes: "",
		bg: "#f3eee4"
	};
}
async function pptxFromSlides(slides, title) {
	const PptxGenJS = (await import("../_libs/pptxgenjs.mjs").then((n) => n.t)).default;
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
			fill: { color: (s.bg || "#f3eee4").replace("#", "") }
		});
		slide.addText(s.title || " ", {
			x: .7,
			y: .55,
			w: 11.5,
			h: 1.1,
			fontSize: 32,
			fontFace: "Georgia",
			color: "1c1917",
			bold: true
		});
		slide.addText(s.body || " ", {
			x: .7,
			y: 1.9,
			w: 11.5,
			h: 4.6,
			fontSize: 18,
			fontFace: "Calibri",
			color: "44403c",
			valign: "top"
		});
	}
	return await pptx.write({ outputType: "blob" });
}
async function sheetsFromXlsx(bytes) {
	const XLSX = await import("../_libs/xlsx.mjs").then((n) => n.t);
	const wb = XLSX.read(bytes, { type: "array" });
	return wb.SheetNames.map((name) => {
		const normalized = XLSX.utils.sheet_to_json(wb.Sheets[name], {
			header: 1,
			raw: false,
			defval: ""
		}).map((r) => {
			const arr = Array.isArray(r) ? r : [];
			const width = Math.max(8, arr.length);
			return Array.from({ length: width }, (_, i) => String(arr[i] ?? ""));
		});
		while (normalized.length < 16) normalized.push(Array.from({ length: 8 }, () => ""));
		return {
			name,
			rows: normalized
		};
	});
}
function emptySheet() {
	return {
		name: "Sheet1",
		rows: Array.from({ length: 20 }, () => Array.from({ length: 8 }, () => ""))
	};
}
async function xlsxFromSheets(sheets) {
	const XLSX = await import("../_libs/xlsx.mjs").then((n) => n.t);
	const wb = XLSX.utils.book_new();
	for (const s of sheets) {
		const ws = XLSX.utils.aoa_to_sheet(s.rows);
		XLSX.utils.book_append_sheet(wb, ws, s.name.slice(0, 31) || "Sheet");
	}
	const out = XLSX.write(wb, {
		bookType: "xlsx",
		type: "array"
	});
	return new Blob([out], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
}
function csvFromSheet(tab) {
	return tab.rows.map((row) => row.map((cell) => {
		if (/[",\n]/.test(cell)) return `"${cell.replace(/"/g, "\"\"")}"`;
		return cell;
	}).join(",")).join("\n");
}
function sheetFromCsv(text) {
	const rows = text.split(/\r?\n/).map((line) => {
		const out = [];
		let cur = "";
		let q = false;
		for (let i = 0; i < line.length; i++) {
			const ch = line[i];
			if (q) {
				if (ch === "\"" && line[i + 1] === "\"") {
					cur += "\"";
					i++;
				} else if (ch === "\"") q = false;
				else cur += ch;
			} else if (ch === "\"") q = true;
			else if (ch === ",") {
				out.push(cur);
				cur = "";
			} else cur += ch;
		}
		out.push(cur);
		while (out.length < 8) out.push("");
		return out;
	});
	return {
		name: "Sheet1",
		rows: rows.length ? rows : emptySheet().rows
	};
}
function htmlToText(html) {
	const d = document.createElement("div");
	d.innerHTML = html;
	return d.innerText;
}
function mdToHtml(md) {
	const lines = md.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").split("\n");
	const out = [];
	for (const line of lines) if (/^### /.test(line)) out.push(`<h3>${line.slice(4)}</h3>`);
	else if (/^## /.test(line)) out.push(`<h2>${line.slice(3)}</h2>`);
	else if (/^# /.test(line)) out.push(`<h1>${line.slice(2)}</h1>`);
	else if (/^[-*] /.test(line)) out.push(`<li>${line.slice(2)}</li>`);
	else if (!line.trim()) out.push("<p></p>");
	else {
		const inline = line.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\*(.+?)\*/g, "<em>$1</em>");
		out.push(`<p>${inline}</p>`);
	}
	return out.join("");
}
function htmlToMd(html) {
	const d = document.createElement("div");
	d.innerHTML = html;
	const parts = [];
	const walk = (n) => {
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
async function cleanHtml(html) {
	return (await import("../_libs/dompurify.mjs").then((n) => n.t)).default.sanitize(html, { USE_PROFILES: { html: true } });
}
function defaultHtml(title, body) {
	return `<h1>${escapeHtml(title)}</h1>${body ?? "<p>Start writing.</p>"}`;
}
function escapeHtml(s) {
	const map = {
		"&": "&amp;",
		"<": "&lt;",
		">": "&gt;",
		"\"": "&quot;"
	};
	return s.replace(/[&<>"]/g, (ch) => map[ch] ?? ch);
}
async function htmlToPdfBytes(html) {
	const html2canvas = (await import("../_libs/html2canvas.mjs").then((n) => n.t)).default;
	const { PDFDocument } = await import("../_libs/pdf-lib.mjs").then((n) => n.t);
	const wrap = document.createElement("div");
	wrap.style.cssText = "position:fixed;left:-4000px;top:0;width:794px;padding:56px 64px;background:#ffffff;color:#1c1917;font:16px IBM Plex Sans,sans-serif;line-height:1.55;";
	wrap.innerHTML = html || "<p></p>";
	document.body.appendChild(wrap);
	const canvas = await html2canvas(wrap, {
		scale: 2,
		backgroundColor: "#ffffff",
		useCORS: true
	});
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
		const blob = await new Promise((res, rej) => slice.toBlob((b) => b ? res(b) : rej(/* @__PURE__ */ new Error("encode")), "image/png"));
		const img = await pdf.embedPng(new Uint8Array(await blob.arrayBuffer()));
		const h = sliceH * scale;
		pdf.addPage([pageW, h]).drawImage(img, {
			x: 0,
			y: 0,
			width: pageW,
			height: h
		});
		y += sliceH;
	}
	return pdf.save();
}
function textOfDoc(doc) {
	if (doc.text) return doc.text;
	if (doc.html) return htmlToText(doc.html);
	if (doc.slides) return doc.slides.map((s) => `${s.title}\n${s.body}`).join("\n\n");
	if (doc.sheets) return doc.sheets.map((s) => s.rows.map((r) => r.join("	")).join("\n")).join("\n\n");
	return "";
}
function now() {
	return Date.now();
}
function base(partial) {
	const t = now();
	return {
		id: uid("doc"),
		createdAt: t,
		updatedAt: t,
		size: partial.bytes.byteLength,
		annotations: partial.annotations ?? [],
		...partial
	};
}
async function makeWelcomePdf() {
	const pdf = await PDFDocument.create();
	const page = pdf.addPage([612, 792]);
	const serif = await pdf.embedFont(StandardFonts.TimesRoman);
	const serifBold = await pdf.embedFont(StandardFonts.TimesRomanBold);
	const sans = await pdf.embedFont(StandardFonts.Helvetica);
	page.drawRectangle({
		x: 0,
		y: 0,
		width: 612,
		height: 792,
		color: rgb(.953, .933, .894)
	});
	page.drawRectangle({
		x: 0,
		y: 708,
		width: 612,
		height: 84,
		color: rgb(.043, .047, .055)
	});
	page.drawText("FOLIO", {
		x: 56,
		y: 740,
		size: 22,
		font: serifBold,
		color: rgb(.933, .918, .89)
	});
	page.drawText("Document studio", {
		x: 140,
		y: 744,
		size: 11,
		font: sans,
		color: rgb(.6, .58, .55)
	});
	page.drawText("Edit any page. Convert any file.", {
		x: 56,
		y: 640,
		size: 26,
		font: serif,
		color: rgb(.11, .1, .09)
	});
	[
		"Folio is a private studio that runs in your browser. Open a PDF, Word file,",
		"deck, sheet, or image. Click any line of text to rewrite it. Draw, highlight,",
		"sign, stamp, and rearrange pages. Then download or share in the format you need."
	].forEach((line, i) => {
		page.drawText(line, {
			x: 56,
			y: 590 - i * 18,
			size: 11,
			font: sans,
			color: rgb(.27, .25, .23)
		});
	});
	[
		["Text", "Click existing copy or place a new box."],
		["Mark", "Highlight, underline, strike, or redact."],
		["Draw", "Pen, shapes, arrows, images, stamps, signatures."],
		["Convert", "PDF, DOCX, PPTX, XLSX, TXT, MD, HTML, PNG, JPG."],
		["Share", "Download, system share, or copy as a Folio pack."]
	].forEach((row, i) => {
		const y = 480 - i * 42;
		page.drawRectangle({
			x: 56,
			y: y - 12,
			width: 500,
			height: 36,
			color: rgb(1, .992, .973)
		});
		page.drawText(row[0], {
			x: 70,
			y,
			size: 11,
			font: serifBold,
			color: rgb(.11, .1, .09)
		});
		page.drawText(row[1], {
			x: 150,
			y,
			size: 10,
			font: sans,
			color: rgb(.35, .32, .3)
		});
	});
	page.drawText("Try editing this sentence: the quick studio rewrites the page.", {
		x: 56,
		y: 230,
		size: 12,
		font: serif,
		color: rgb(.11, .1, .09)
	});
	page.drawText("Confidential sample  ·  Not legal advice  ·  Stored only on this device", {
		x: 56,
		y: 48,
		size: 8,
		font: sans,
		color: rgb(.45, .42, .4)
	});
	const page2 = pdf.addPage([612, 792]);
	page2.drawRectangle({
		x: 0,
		y: 0,
		width: 612,
		height: 792,
		color: rgb(.953, .933, .894)
	});
	page2.drawText("A page you can mark up", {
		x: 56,
		y: 720,
		size: 22,
		font: serifBold,
		color: rgb(.11, .1, .09)
	});
	[
		"Section 1. Scope. This sample agreement is a playground. Highlight a clause,",
		"strike a phrase, drop a signature, and export a signed PDF.",
		"",
		"Section 2. Files. Folio keeps work in local storage on this device. Nothing is",
		"uploaded unless you download or share it yourself.",
		"",
		"Section 3. Conversion. Open Convert to turn this PDF into Word, slides, HTML,",
		"or an image. The reverse is also true: a letter can become a PDF.",
		"",
		"IN WITNESS WHEREOF, the parties have executed this sample as of the date below."
	].forEach((line, i) => {
		page2.drawText(line, {
			x: 56,
			y: 660 - i * 22,
			size: 12,
			font: serif,
			color: rgb(.15, .13, .12)
		});
	});
	page2.drawLine({
		start: {
			x: 56,
			y: 280
		},
		end: {
			x: 280,
			y: 280
		},
		thickness: .8,
		color: rgb(.3, .28, .26)
	});
	page2.drawText("Signature", {
		x: 56,
		y: 262,
		size: 9,
		font: sans,
		color: rgb(.4, .38, .36)
	});
	page2.drawLine({
		start: {
			x: 330,
			y: 280
		},
		end: {
			x: 540,
			y: 280
		},
		thickness: .8,
		color: rgb(.3, .28, .26)
	});
	page2.drawText("Date", {
		x: 330,
		y: 262,
		size: 9,
		font: sans,
		color: rgb(.4, .38, .36)
	});
	const bytes = await pdf.save();
	return base({
		name: "Welcome to Folio.pdf",
		kind: "pdf",
		bytes: asArrayBuffer(bytes),
		pages: defaultPages(2)
	});
}
async function makeBlankPdf() {
	const pdf = await PDFDocument.create();
	pdf.addPage([612, 792]);
	const bytes = await pdf.save();
	return base({
		name: "Untitled.pdf",
		kind: "pdf",
		bytes: asArrayBuffer(bytes),
		pages: defaultPages(1)
	});
}
function makeLetter() {
	const html = defaultHtml("Letter", `<p>Dear colleague,</p>
<p>Thank you for reviewing this draft. Replace this paragraph with your own copy. Use the toolbar for headings, lists, and emphasis, then convert to PDF or Word when you are ready to send.</p>
<p>Warmly,<br/>The Folio studio</p>`);
	return base({
		name: "Letter.docx",
		kind: "docx",
		bytes: new TextEncoder().encode(html).buffer,
		pages: defaultPages(1),
		html
	});
}
function makeResume() {
	const html = defaultHtml("Alex Rivera", `<p>Product designer  ·  New York</p>
<h2>Experience</h2>
<p><strong>Studio Lead, Northwind</strong> — 2022–present</p>
<p>Shipped editorial tools used by 40k weekly readers. Wrote the design system now used across four products.</p>
<h2>Education</h2>
<p>BFA, Graphic Design — RISD</p>`);
	return base({
		name: "Resume.docx",
		kind: "docx",
		bytes: new TextEncoder().encode(html).buffer,
		pages: defaultPages(1),
		html
	});
}
function makeDeck() {
	const slides = [
		{
			...emptySlide(),
			title: "Northwind",
			body: "A quieter way to ship documents."
		},
		{
			...emptySlide(),
			title: "The problem",
			body: "Files bounce between tools. Context gets lost. Signatures wait in inboxes."
		},
		{
			...emptySlide(),
			title: "The studio",
			body: "One canvas for PDFs, letters, decks, and sheets. Convert on the way out."
		}
	];
	return base({
		name: "Pitch deck.pptx",
		kind: "pptx",
		bytes: new TextEncoder().encode(JSON.stringify(slides)).buffer,
		pages: defaultPages(slides.length),
		slides
	});
}
function makeSheet() {
	const sheet = emptySheet();
	sheet.rows[0] = [
		"Item",
		"Owner",
		"Status",
		"Due",
		"Notes",
		"",
		"",
		""
	];
	sheet.rows[1] = [
		"Brand pass",
		"Maya",
		"Done",
		"Mon",
		"Locked",
		"",
		"",
		""
	];
	sheet.rows[2] = [
		"PDF editor",
		"Jules",
		"Review",
		"Wed",
		"Text layer live",
		"",
		"",
		""
	];
	sheet.rows[3] = [
		"Convert",
		"Sam",
		"Doing",
		"Fri",
		"10 formats",
		"",
		"",
		""
	];
	return base({
		name: "Tracker.xlsx",
		kind: "xlsx",
		bytes: new TextEncoder().encode(JSON.stringify([sheet])).buffer,
		pages: defaultPages(1),
		sheets: [sheet]
	});
}
function snap(doc) {
	return {
		annotations: doc.annotations,
		pages: doc.pages,
		html: doc.html,
		slides: doc.slides,
		sheets: doc.sheets,
		text: doc.text
	};
}
function cloneSnap(s) {
	return structuredClone(s);
}
var useFolio = create((set, get) => ({
	hydrated: false,
	library: [],
	current: null,
	tool: "select",
	color: "#f2d56b",
	strokeWidth: 2.5,
	fontSize: 16,
	stamp: "approved",
	selectedId: null,
	pageIndex: 0,
	zoom: 1.25,
	query: "",
	past: [],
	future: [],
	hydrate: async () => {
		if (get().hydrated) return;
		let library = await listDocs();
		if (!library.length) {
			const welcome = await makeWelcomePdf();
			const letter = makeLetter();
			const deck = makeDeck();
			await putDoc(welcome);
			await putDoc(letter);
			await putDoc(deck);
			library = await listDocs();
		}
		set({
			hydrated: true,
			library
		});
	},
	refreshLibrary: async () => {
		set({ library: await listDocs() });
	},
	openId: async (id) => {
		const doc = await getDoc(id);
		if (!doc) return null;
		set({
			current: doc,
			pageIndex: 0,
			selectedId: null,
			past: [],
			future: [],
			zoom: doc.kind === "pdf" || doc.kind === "image" ? 1.15 : 1
		});
		return doc;
	},
	importFiles: async (files) => {
		const list = Array.from(files);
		const created = [];
		for (const file of list) {
			const doc = await ingestFile(file);
			await putDoc(doc);
			created.push(doc);
		}
		await get().refreshLibrary();
		return created;
	},
	newFromTemplate: async (kind) => {
		let doc;
		if (kind === "pdf" || kind === "blank-pdf") doc = await makeBlankPdf();
		else if (kind === "letter") doc = makeLetter();
		else if (kind === "resume") doc = makeResume();
		else if (kind === "deck") doc = makeDeck();
		else doc = makeSheet();
		await putDoc(doc);
		await get().refreshLibrary();
		set({
			current: doc,
			pageIndex: 0,
			past: [],
			future: [],
			selectedId: null
		});
		return doc;
	},
	saveCurrent: async () => {
		const doc = get().current;
		if (!doc) return;
		const next = {
			...doc,
			updatedAt: Date.now(),
			size: doc.bytes.byteLength
		};
		await putDoc(next);
		set({ current: next });
		await get().refreshLibrary();
	},
	patchCurrent: (patch, undoable = true) => {
		const doc = get().current;
		if (!doc) return;
		if (undoable) set({
			past: [...get().past.slice(-40), cloneSnap(snap(doc))],
			future: []
		});
		set({ current: {
			...doc,
			...patch,
			updatedAt: Date.now()
		} });
	},
	setTool: (tool) => set({
		tool,
		selectedId: tool === "select" ? get().selectedId : null
	}),
	setColor: (color) => set({ color }),
	setStroke: (strokeWidth) => set({ strokeWidth }),
	setFontSize: (fontSize) => set({ fontSize }),
	setZoom: (zoom) => set({ zoom: Math.min(2.6, Math.max(.4, zoom)) }),
	setPage: (pageIndex) => set({
		pageIndex,
		selectedId: null
	}),
	addAnnot: (a) => {
		const doc = get().current;
		if (!doc) return;
		get().patchCurrent({ annotations: [...doc.annotations, a] });
		set({ selectedId: a.id });
	},
	updateAnnot: (id, patch) => {
		const doc = get().current;
		if (!doc) return;
		get().patchCurrent({ annotations: doc.annotations.map((a) => a.id === id ? {
			...a,
			...patch
		} : a) });
	},
	removeAnnot: (id) => {
		const doc = get().current;
		if (!doc) return;
		get().patchCurrent({ annotations: doc.annotations.filter((a) => a.id !== id) });
		if (get().selectedId === id) set({ selectedId: null });
	},
	select: (selectedId) => set({
		selectedId,
		tool: "select"
	}),
	undo: () => {
		const { past, current, future } = get();
		if (!current || !past.length) return;
		const prev = past[past.length - 1];
		set({
			past: past.slice(0, -1),
			future: [...future, cloneSnap(snap(current))],
			current: {
				...current,
				...cloneSnap(prev),
				updatedAt: Date.now()
			}
		});
	},
	redo: () => {
		const { future, current, past } = get();
		if (!current || !future.length) return;
		const next = future[future.length - 1];
		set({
			future: future.slice(0, -1),
			past: [...past, cloneSnap(snap(current))],
			current: {
				...current,
				...cloneSnap(next),
				updatedAt: Date.now()
			}
		});
	},
	rotatePage: (i) => {
		const doc = get().current;
		if (!doc) return;
		const pages = doc.pages.map((p, idx) => idx === i ? {
			...p,
			rotation: (p.rotation + 90) % 360
		} : p);
		get().patchCurrent({ pages });
	},
	deletePage: (i) => {
		const doc = get().current;
		if (!doc || doc.pages.length <= 1) return;
		const pages = doc.pages.filter((_, idx) => idx !== i);
		get().patchCurrent({ pages });
		set({ pageIndex: Math.min(i, pages.length - 1) });
	},
	duplicatePage: (i) => {
		const doc = get().current;
		if (!doc) return;
		const copy = {
			...doc.pages[i],
			id: uid("pg")
		};
		const pages = [
			...doc.pages.slice(0, i + 1),
			copy,
			...doc.pages.slice(i + 1)
		];
		get().patchCurrent({ pages });
	},
	movePage: (from, to) => {
		const doc = get().current;
		if (!doc) return;
		const pages = [...doc.pages];
		const [item] = pages.splice(from, 1);
		pages.splice(to, 0, item);
		get().patchCurrent({ pages });
		set({ pageIndex: to });
	},
	insertBlankPage: async (i) => {
		const doc = get().current;
		if (!doc || doc.kind !== "pdf") return;
		const { PDFDocument } = await import("../_libs/pdf-lib.mjs").then((n) => n.t);
		const src = await PDFDocument.load(doc.bytes, { ignoreEncryption: true });
		const blank = src.addPage([612, 792]);
		const idx = src.getPages().indexOf(blank);
		const bytes = await src.save();
		const pages = [...doc.pages];
		pages.splice(i + 1, 0, {
			id: uid("pg"),
			source: idx,
			rotation: 0
		});
		get().patchCurrent({
			bytes: asArrayBuffer(bytes),
			pages
		});
	},
	rename: (name) => {
		if (!get().current) return;
		get().patchCurrent({ name }, false);
	},
	removeFromLibrary: async (id) => {
		await deleteDoc(id);
		if (get().current?.id === id) set({ current: null });
		await get().refreshLibrary();
	}
}));
async function ingestFile(file) {
	const bytes = await file.arrayBuffer();
	const kind = kindFromName(file.name);
	const t = Date.now();
	const doc = {
		id: uid("doc"),
		name: file.name,
		kind,
		createdAt: t,
		updatedAt: t,
		bytes,
		size: bytes.byteLength,
		annotations: [],
		pages: defaultPages(1)
	};
	try {
		if (kind === "pdf") {
			const pdf = await openPdfJs(bytes);
			doc.pages = defaultPages(pdf.numPages);
			await pdf.cleanup();
		} else if (kind === "docx") doc.html = await cleanHtml(await htmlFromDocx(bytes));
		else if (kind === "pptx") {
			doc.slides = await slidesFromPptx(bytes);
			doc.pages = defaultPages(doc.slides.length);
		} else if (kind === "xlsx") doc.sheets = await sheetsFromXlsx(bytes);
		else if (kind === "csv") {
			const text = new TextDecoder().decode(bytes);
			doc.sheets = [sheetFromCsv(text)];
			doc.text = text;
		} else if (kind === "md") {
			const text = new TextDecoder().decode(bytes);
			doc.text = text;
			doc.html = mdToHtml(text);
		} else if (kind === "html") doc.html = await cleanHtml(new TextDecoder().decode(bytes));
		else if (kind === "txt" || kind === "rtf") {
			const text = new TextDecoder().decode(bytes);
			doc.text = text;
			doc.html = defaultHtml(file.name.replace(/\.[^.]+$/, ""), `<p>${escapeP(text)}</p>`);
		} else if (kind === "image") doc.pages = defaultPages(1);
	} catch (err) {
		console.warn("ingest", err);
		const text = new TextDecoder().decode(bytes).slice(0, 2e4);
		doc.kind = "txt";
		doc.text = text;
		doc.html = defaultHtml(file.name, `<p>${escapeP(text)}</p>`);
	}
	return doc;
}
function escapeP(s) {
	return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br/>");
}
async function shareBlob(blob, filename, title) {
	const file = new File([blob], filename, { type: blob.type || "application/octet-stream" });
	try {
		if (navigator.share && navigator.canShare?.({ files: [file] })) {
			await navigator.share({
				files: [file],
				title,
				text: title
			});
			return "shared";
		}
	} catch (err) {
		if (err.name === "AbortError") return "cancelled";
	}
	downloadBlob(blob, filename);
	return "downloaded";
}
function packFolio(doc) {
	const json = JSON.stringify({
		v: 1,
		name: doc.name,
		kind: doc.kind,
		annotations: doc.annotations,
		pages: doc.pages,
		html: doc.html,
		slides: doc.slides,
		sheets: doc.sheets,
		text: doc.text,
		watermark: doc.watermark,
		pageNumbers: doc.pageNumbers
	});
	return new Blob([json], { type: "application/json" });
}
//#endregion
export { renderPageToCanvas as A, mergePdfs as C, pagePlainText as D, packFolio as E, useFolio as F, xlsxFromSheets as I, sheetsFromXlsx as M, slidesFromPptx as N, pdfFromImages as O, textOfDoc as P, mdToHtml as S, openPdfJs as T, escapeHtml as _, MARK_COLORS as a, htmlToMd as b, Textarea as c, canvasToPng as d, cleanHtml as f, emptySlide as g, docxFromHtml as h, Input as i, shareBlob as j, pptxFromSlides as k, bakePdf as l, defaultPages as m, EXPORT_FORMATS as n, STAMPS as o, csvFromSheet as p, INK_COLORS as r, Slider as s, Button as t, canvasToJpeg as u, extractPageText as v, mimeFor as w, htmlToPdfBytes as x, htmlFromDocx as y };
