import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { b as useNavigate, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { n as TSS_SERVER_FUNCTION, r as getServerFnById, t as createServerFn } from "./ssr.mjs";
import { $ as Download, T as PenLine, ct as Check, dt as ArrowUp, g as Share2, mt as ArrowDown, q as FileText, rt as CloudUpload, u as Trash2 } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { c as cn, d as stemOf, f as uid, l as downloadBlob, n as Route, s as asArrayBuffer, u as formatBytes } from "./router-BNe88wCr.mjs";
import { i as rgb, n as PDFDocument, o as degrees, r as StandardFonts } from "../_libs/pdf-lib.mjs";
import { A as renderPageToCanvas, C as mergePdfs, D as pagePlainText, F as useFolio, I as xlsxFromSheets, M as sheetsFromXlsx, N as slidesFromPptx, O as pdfFromImages, S as mdToHtml, T as openPdfJs, _ as escapeHtml, c as Textarea, d as canvasToPng, f as cleanHtml, h as docxFromHtml, i as Input, j as shareBlob, s as Slider, t as Button, u as canvasToJpeg, v as extractPageText, x as htmlToPdfBytes, y as htmlFromDocx } from "./share-B2fXwJXl.mjs";
import { a as ToolGlyph, c as continueTools, d as pickNoun, i as TOOLS, l as getTool, m as takeStash, p as stashFiles, r as FileActions, s as categoryLabel, t as AppShell, u as jobFromBlob } from "./upload-hub-BUJiPHo4.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/tools._toolId-urWnGDv5.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function FormBuilder({ bytes, fields, onChange }) {
	const canvasRef = (0, import_react.useRef)(null);
	const [page, setPage] = (0, import_react.useState)(0);
	const [count, setCount] = (0, import_react.useState)(1);
	const [error, setError] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		let live = true;
		setError(null);
		(async () => {
			try {
				const pdf = await openPdfJs(bytes);
				if (!live) {
					await pdf.cleanup();
					return;
				}
				setCount(pdf.numPages);
				const safe = Math.min(page, pdf.numPages - 1);
				const src = await pdf.getPage(safe + 1);
				if (canvasRef.current) {
					await renderPageToCanvas(src, canvasRef.current, 1.1, 0);
					canvasRef.current.style.width = "100%";
					canvasRef.current.style.height = "auto";
				}
				await pdf.cleanup();
			} catch (err) {
				if (live) setError(err instanceof Error ? err.message : "Could not preview this PDF");
			}
		})();
		return () => {
			live = false;
		};
	}, [bytes, page]);
	function addAt(e) {
		if (e.target.closest("[data-field]")) return;
		const r = e.currentTarget.getBoundingClientRect();
		const x = (e.clientX - r.left) / r.width;
		const y = (e.clientY - r.top) / r.height;
		onChange([...fields, {
			id: uid("ff"),
			page,
			x: Math.max(.02, Math.min(.68, x - .02)),
			y: Math.max(.02, Math.min(.9, y - .01)),
			w: .32,
			h: .045,
			name: `Field ${fields.length + 1}`
		}]);
	}
	const onPage = fields.filter((f) => f.page === page);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-6 space-y-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-bold",
					children: "Click the page to drop a text field"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							size: "sm",
							variant: "secondary",
							disabled: page === 0,
							onClick: () => setPage((p) => p - 1),
							children: "Prev"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-xs font-semibold text-muted",
							children: [
								page + 1,
								" / ",
								count
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							size: "sm",
							variant: "secondary",
							disabled: page >= count - 1,
							onClick: () => setPage((p) => p + 1),
							children: "Next"
						})
					]
				})]
			}),
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger",
				children: error
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative mx-auto w-full max-w-xl cursor-crosshair overflow-hidden rounded-lg bg-raised shadow-[var(--shadow-paper)]",
				onClick: addAt,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
					ref: canvasRef,
					className: "block w-full"
				}), onPage.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					"data-field": true,
					className: "absolute flex items-center gap-1 rounded-sm bg-accent/15 px-1 ring-1 ring-accent",
					style: {
						left: `${f.x * 100}%`,
						top: `${f.y * 100}%`,
						width: `${f.w * 100}%`,
						height: `${f.h * 100}%`
					},
					onClick: (e) => e.stopPropagation(),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "truncate text-[11px] font-bold text-fg",
						children: f.name
					})
				}, f.id))]
			}),
			fields.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "space-y-2",
				children: fields.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center gap-2 rounded-lg bg-surface px-2 py-2 shadow-[var(--shadow-paper)]",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "w-12 shrink-0 text-xs font-semibold text-muted",
							children: ["p.", f.page + 1]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: f.name,
							"aria-label": "Field name",
							onChange: (e) => onChange(fields.map((x) => x.id === f.id ? {
								...x,
								name: e.target.value
							} : x))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							size: "icon",
							variant: "ghost",
							"aria-label": "Remove field",
							onClick: () => onChange(fields.filter((x) => x.id !== f.id)),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, {})
						})
					]
				}, f.id))
			})
		]
	});
}
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var summarizeText = createServerFn({ method: "POST" }).validator((input) => input).handler(createSsrRpc("85ed5d11c8e805bb500cd502ebd85d90be82e0e8a36c1fdd3afa3640a1e6e620"));
var translateText = createServerFn({ method: "POST" }).validator((input) => input).handler(createSsrRpc("88e21acf9b1bebc5001cc20fad32b65e996cc42204936979f43bc7e01f0ef18f"));
var fetchHtmlPage = createServerFn({ method: "POST" }).validator((input) => input).handler(createSsrRpc("e8412fa3383d18d3023dbe1af1b0ad565635919ccdf172b8f34d2b369c1d81b9"));
async function runTool(toolId, files, options, onProgress = () => {}) {
	switch (toolId) {
		case "merge-pdf": return mergeOp(files, onProgress);
		case "split-pdf": return splitOp(files[0], options, onProgress);
		case "organize-pdf": return organizeOp(files[0], options, onProgress);
		case "extract-pdf":
		case "remove-pages": return organizeOp(files[0], options, onProgress);
		case "rotate-pdf": return rotateOp(files, options, onProgress);
		case "compress-pdf": return compressOp(files, options, onProgress);
		case "repair-pdf": return repairOp(files[0], onProgress);
		case "pdf-to-pdfa": return pdfaOp(files, onProgress);
		case "pdf-to-word": return pdfToWord(files, onProgress);
		case "pdf-to-powerpoint": return pdfToPptx(files[0], onProgress);
		case "pdf-to-excel": return pdfToExcel(files, onProgress);
		case "pdf-to-jpg": return pdfToImages(files[0], "jpg", onProgress);
		case "pdf-to-png": return pdfToImages(files[0], "png", onProgress);
		case "pdf-to-markdown": return pdfToMarkdown(files, onProgress);
		case "pdf-to-txt": return pdfToTxt(files, onProgress);
		case "word-to-pdf": return officeToPdf(files, "word", onProgress);
		case "powerpoint-to-pdf": return officeToPdf(files, "ppt", onProgress);
		case "excel-to-pdf": return officeToPdf(files, "excel", onProgress);
		case "jpg-to-pdf":
		case "scan-to-pdf": return imagesToPdf(files, options, onProgress);
		case "html-to-pdf": return htmlToPdfOp(files, options, onProgress);
		case "convert-any": return convertAnyOp(files[0], options, onProgress);
		case "pdf-forms": return formOp(files[0], options, onProgress);
		case "watermark": return watermarkOp(files, options, onProgress);
		case "page-numbers": return pageNumbersOp(files, options, onProgress);
		case "crop-pdf": return cropOp(files[0], options, onProgress);
		case "redact-pdf": return redactOp(files[0], options, onProgress);
		case "sign-pdf": return signOp(files[0], options, onProgress);
		case "protect-pdf": return protectOp(files, options, onProgress);
		case "unlock-pdf": return unlockOp(files, options, onProgress);
		case "compare-pdf": return compareOp(files, onProgress);
		case "ocr-pdf": return ocrOp(files[0], onProgress);
		case "summarize-pdf": return summarizeOp(files[0], onProgress);
		case "translate-pdf": return translateOp(files[0], options, onProgress);
		case "edit-pdf": throw new Error("Edit PDF opens in the editor");
		default: throw new Error("Unknown tool");
	}
}
async function mergeOp(files, onProgress) {
	if (files.length < 2) throw new Error("Add at least two files to merge");
	onProgress(15, "Reading files");
	const buffers = [];
	for (let i = 0; i < files.length; i++) {
		buffers.push(await ensurePdf(files[i]));
		onProgress(15 + 70 * (i + 1) / files.length, `Adding ${files[i].name}`);
	}
	onProgress(90, "Writing merged PDF");
	const bytes = await mergePdfs(buffers);
	return [pdfResult(`${stemOf(files[0].name)}-merged.pdf`, bytes)];
}
async function splitOp(file, options, onProgress) {
	onProgress(10, "Opening PDF");
	const src = await PDFDocument.load(await ensurePdf(file), { ignoreEncryption: true });
	const count = src.getPageCount();
	const mode = options.splitMode ?? "extract";
	if (mode === "extract") {
		const out = [];
		for (let i = 0; i < count; i++) {
			const doc = await PDFDocument.create();
			const [page] = await doc.copyPages(src, [i]);
			doc.addPage(page);
			out.push(pdfResult(`${stemOf(file.name)}-page-${i + 1}.pdf`, await doc.save()));
			onProgress(10 + 80 * (i + 1) / count, `Page ${i + 1} of ${count}`);
		}
		if (out.length > 1) out.unshift(await zipResult(`${stemOf(file.name)}-pages.zip`, out));
		return out;
	}
	if (mode === "fixed") {
		const n = Math.max(1, options.fixedCount ?? 1);
		const out = [];
		for (let i = 0, part = 1; i < count; i += n, part++) {
			const doc = await PDFDocument.create();
			const idxs = Array.from({ length: Math.min(n, count - i) }, (_, k) => i + k);
			(await doc.copyPages(src, idxs)).forEach((p) => doc.addPage(p));
			out.push(pdfResult(`${stemOf(file.name)}-part-${part}.pdf`, await doc.save()));
			onProgress(10 + 80 * part * n / count, `Part ${part}`);
		}
		if (out.length > 1) out.unshift(await zipResult(`${stemOf(file.name)}-split.zip`, out));
		return out;
	}
	const groups = parseRangeGroups(options.ranges || `1-${count}`, count);
	if (!groups.length) throw new Error("Enter a valid page range such as 1-3,5,8-10");
	const out = [];
	for (let g = 0; g < groups.length; g++) {
		const doc = await PDFDocument.create();
		(await doc.copyPages(src, groups[g])).forEach((p) => doc.addPage(p));
		const label = groups[g].length === 1 ? `page-${groups[g][0] + 1}` : `pages-${groups[g][0] + 1}-${groups[g][groups[g].length - 1] + 1}`;
		out.push(pdfResult(`${stemOf(file.name)}-${label}.pdf`, await doc.save()));
		onProgress(10 + 80 * (g + 1) / groups.length, `Range ${g + 1}`);
	}
	if (out.length > 1) out.unshift(await zipResult(`${stemOf(file.name)}-split.zip`, out));
	return out;
}
async function organizeOp(file, options, onProgress) {
	onProgress(20, "Rebuilding pages");
	const src = await PDFDocument.load(await ensurePdf(file), { ignoreEncryption: true });
	const order = options.pageOrder ? options.pageOrder.filter((i) => i >= 0 && i < src.getPageCount()) : src.getPageIndices();
	if (!order.length) throw new Error("Keep at least one page");
	const doc = await PDFDocument.create();
	(await doc.copyPages(src, order)).forEach((p) => doc.addPage(p));
	onProgress(90, "Saving");
	const suffix = options.pageOrder && options.pageOrder.length < src.getPageCount() ? "trimmed" : "organized";
	return [pdfResult(`${stemOf(file.name)}-${suffix}.pdf`, await doc.save())];
}
async function rotateOp(files, options, onProgress) {
	const extra = options.rotation ?? 90;
	const out = [];
	for (let i = 0; i < files.length; i++) {
		const src = await PDFDocument.load(await ensurePdf(files[i]), { ignoreEncryption: true });
		src.getPages().forEach((page) => {
			const cur = page.getRotation().angle || 0;
			page.setRotation(degrees(((cur + extra) % 360 + 360) % 360));
		});
		out.push(pdfResult(`${stemOf(files[i].name)}-rotated.pdf`, await src.save()));
		onProgress((i + 1) / files.length * 90, files[i].name);
	}
	return out;
}
async function compressOp(files, options, onProgress) {
	const quality = options.quality ?? "recommended";
	const scale = quality === "extreme" ? 1.05 : quality === "low" ? 1.25 : 1.55;
	const q = quality === "extreme" ? .42 : quality === "low" ? .55 : .68;
	const out = [];
	for (let f = 0; f < files.length; f++) {
		onProgress(f / files.length * 90, `Compressing ${files[f].name}`);
		const bytes = await rasterizeToPdf(await ensurePdf(files[f]), scale, q, (p, label) => {
			onProgress(f / files.length * 90 + p * .9 * (1 / files.length), label);
		});
		out.push(pdfResult(`${stemOf(files[f].name)}-compressed.pdf`, bytes));
	}
	return out;
}
async function repairOp(file, onProgress) {
	onProgress(10, "Reading file");
	try {
		const src = await PDFDocument.load(file.bytes, { ignoreEncryption: true });
		const out = await PDFDocument.create();
		(await out.copyPages(src, src.getPageIndices())).forEach((p) => out.addPage(p));
		onProgress(80, "Rewriting");
		return [pdfResult(`${stemOf(file.name)}-repaired.pdf`, await out.save({ useObjectStreams: true }))];
	} catch {
		onProgress(30, "Rebuilding from rendered pages");
		const bytes = await rasterizeToPdf(file.bytes, 1.6, .8, onProgress);
		return [pdfResult(`${stemOf(file.name)}-repaired.pdf`, bytes)];
	}
}
async function pdfaOp(files, onProgress) {
	const out = [];
	for (let i = 0; i < files.length; i++) {
		onProgress((i + .2) / files.length * 100, `Rewriting ${files[i].name}`);
		const src = await PDFDocument.load(await ensurePdf(files[i]), { ignoreEncryption: true });
		const doc = await PDFDocument.create();
		doc.setTitle(stemOf(files[i].name));
		doc.setProducer("FolioPDF archival");
		doc.setCreator("FolioPDF");
		(await doc.copyPages(src, src.getPageIndices())).forEach((p) => doc.addPage(p));
		out.push(pdfResult(`${stemOf(files[i].name)}-pdfa.pdf`, await doc.save({ useObjectStreams: false })));
	}
	return out;
}
async function pdfToWord(files, onProgress) {
	const out = [];
	for (let i = 0; i < files.length; i++) {
		onProgress((i + .2) / files.length * 100, `Reading ${files[i].name}`);
		const html = await pdfToHtml(files[i].bytes, files[i].name);
		const blob = await docxFromHtml(html, stemOf(files[i].name));
		const previewText = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 1600);
		out.push({
			name: `${stemOf(files[i].name)}.docx`,
			blob,
			previewText
		});
	}
	return out;
}
async function pdfToPptx(file, onProgress) {
	onProgress(8, "Rendering pages");
	const pdf = await openPdfJs(file.bytes);
	const PptxGenJS = (await import("../_libs/pptxgenjs.mjs").then((n) => n.t)).default;
	const pptx = new PptxGenJS();
	pptx.author = "Folio";
	pptx.title = stemOf(file.name);
	pptx.layout = "LAYOUT_WIDE";
	for (let i = 1; i <= pdf.numPages; i++) {
		const page = await pdf.getPage(i);
		const canvas = document.createElement("canvas");
		await renderPageToCanvas(page, canvas, 1.6, 0);
		const data = canvas.toDataURL("image/jpeg", .82);
		pptx.addSlide().addImage({
			data,
			x: 0,
			y: 0,
			w: "100%",
			h: "100%"
		});
		onProgress(8 + 80 * i / pdf.numPages, `Slide ${i} of ${pdf.numPages}`);
	}
	await pdf.cleanup();
	const blob = await pptx.write({ outputType: "blob" });
	return [{
		name: `${stemOf(file.name)}.pptx`,
		blob
	}];
}
async function pdfToExcel(files, onProgress) {
	const out = [];
	for (let i = 0; i < files.length; i++) {
		onProgress((i + .3) / files.length * 100, files[i].name);
		const pdf = await openPdfJs(files[i].bytes);
		const rows = [];
		for (let p = 1; p <= pdf.numPages; p++) {
			const page = await pdf.getPage(p);
			(await pagePlainText(page)).split("\n").forEach((line) => {
				const cells = line.split(/\s{2,}|\t/).map((c) => c.trim());
				if (cells.some((c) => c)) rows.push(cells.length < 2 ? [line] : cells);
			});
			rows.push([]);
		}
		await pdf.cleanup();
		const blob = await xlsxFromSheets([{
			name: "Extract",
			rows: rows.length ? rows : [["(no table text)"]]
		}]);
		out.push({
			name: `${stemOf(files[i].name)}.xlsx`,
			blob
		});
	}
	return out;
}
async function pdfToImages(file, kind, onProgress) {
	const pdf = await openPdfJs(file.bytes);
	const out = [];
	for (let i = 1; i <= pdf.numPages; i++) {
		const page = await pdf.getPage(i);
		const canvas = document.createElement("canvas");
		await renderPageToCanvas(page, canvas, 2, 0);
		const blob = kind === "png" ? await canvasToPng(canvas) : await canvasToJpeg(canvas, .9);
		out.push({
			name: `${stemOf(file.name)}-page-${i}.${kind}`,
			blob
		});
		onProgress(i / pdf.numPages * 90, `Page ${i} of ${pdf.numPages}`);
	}
	await pdf.cleanup();
	if (out.length > 1) out.unshift(await zipResult(`${stemOf(file.name)}-${kind}.zip`, out));
	return out;
}
async function pdfToMarkdown(files, onProgress) {
	const out = [];
	for (let i = 0; i < files.length; i++) {
		const md = (await extractPdfText(files[i].bytes, onProgress)).split(/\n{2,}/).map((p) => p.trim()).filter(Boolean).map((p) => p.length < 60 && !p.endsWith(".") ? `## ${p}` : p).join("\n\n");
		out.push({
			name: `${stemOf(files[i].name)}.md`,
			blob: new Blob([md || "# Empty"], { type: "text/markdown" }),
			previewText: md.slice(0, 1200)
		});
	}
	return out;
}
async function pdfToTxt(files, onProgress) {
	const out = [];
	for (const file of files) {
		const text = await extractPdfText(file.bytes, onProgress);
		out.push({
			name: `${stemOf(file.name)}.txt`,
			blob: new Blob([text || ""], { type: "text/plain" }),
			previewText: text.slice(0, 1200)
		});
	}
	return out;
}
async function officeToPdf(files, kind, onProgress) {
	const out = [];
	for (let i = 0; i < files.length; i++) {
		onProgress((i + .2) / files.length * 100, files[i].name);
		const bytes = await fileToPdfBytes(files[i], kind);
		out.push(pdfResult(`${stemOf(files[i].name)}.pdf`, bytes));
	}
	return out;
}
async function imagesToPdf(files, options, onProgress) {
	onProgress(10, "Preparing images");
	const images = [];
	for (let i = 0; i < files.length; i++) {
		images.push(await normalizeImage(files[i]));
		onProgress(10 + 50 * (i + 1) / files.length, files[i].name);
	}
	if (options.imageFit === "page") {
		const pdf = await PDFDocument.create();
		for (const img of images) {
			const embedded = img.mime.includes("jpeg") ? await pdf.embedJpg(new Uint8Array(img.bytes)) : await pdf.embedPng(new Uint8Array(img.bytes));
			const page = pdf.addPage([612, 792]);
			const scale = Math.min(560 / embedded.width, 720 / embedded.height);
			const w = embedded.width * scale;
			const h = embedded.height * scale;
			page.drawImage(embedded, {
				x: (612 - w) / 2,
				y: (792 - h) / 2,
				width: w,
				height: h
			});
		}
		return [pdfResult("images.pdf", await pdf.save())];
	}
	return [pdfResult("images.pdf", await pdfFromImages(images))];
}
async function convertAnyOp(file, options, onProgress) {
	if (!file) throw new Error("Add a file to convert");
	const target = options.targetFormat ?? "pdf";
	onProgress(12, "Reading file");
	const asPdf = {
		...file,
		bytes: await ensurePdf(file),
		mime: "application/pdf"
	};
	if (target === "pdf") return [pdfResult(`${stemOf(file.name)}.pdf`, new Uint8Array(asPdf.bytes))];
	if (target === "docx") return pdfToWord([asPdf], onProgress);
	if (target === "pptx") return pdfToPptx(asPdf, onProgress);
	if (target === "xlsx") return pdfToExcel([asPdf], onProgress);
	if (target === "jpg") return pdfToImages(asPdf, "jpg", onProgress);
	if (target === "png") return pdfToImages(asPdf, "png", onProgress);
	if (target === "txt") return pdfToTxt([asPdf], onProgress);
	if (target === "md") return pdfToMarkdown([asPdf], onProgress);
	const html = await pdfToHtml(asPdf.bytes, file.name);
	return [{
		name: `${stemOf(file.name)}.html`,
		blob: new Blob([html], { type: "text/html" }),
		previewText: html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 800)
	}];
}
async function formOp(file, options, onProgress) {
	const fields = options.formFields ?? [];
	if (!fields.length) throw new Error("Click the page to add at least one field");
	onProgress(20, "Adding fields");
	const pdf = await PDFDocument.load(await ensurePdf(file), { ignoreEncryption: true });
	const form = pdf.getForm();
	const pages = pdf.getPages();
	const used = /* @__PURE__ */ new Set();
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
		field.addToPage(page, {
			x,
			y,
			width: w,
			height: h,
			borderWidth: 1
		});
		field.setFontSize(11);
	});
	onProgress(90, "Saving form");
	return [pdfResult(`${stemOf(file.name)}-form.pdf`, await pdf.save())];
}
async function htmlToPdfOp(files, options, onProgress) {
	const out = [];
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
async function watermarkOp(files, options, onProgress) {
	const text = (options.watermarkText || "CONFIDENTIAL").slice(0, 48);
	const opacity = clamp(options.watermarkOpacity ?? .18, .06, .5);
	const out = [];
	for (let i = 0; i < files.length; i++) {
		const pdf = await PDFDocument.load(await ensurePdf(files[i]), { ignoreEncryption: true });
		const font = await pdf.embedFont(StandardFonts.HelveticaBold);
		for (const page of pdf.getPages()) {
			const { width, height } = page.getSize();
			page.drawText(winAnsi(text), {
				x: width * .16,
				y: height * .42,
				size: Math.min(48, width / (text.length * .5)),
				font,
				color: rgb(.55, .55, .56),
				opacity,
				rotate: degrees(32)
			});
		}
		out.push(pdfResult(`${stemOf(files[i].name)}-watermark.pdf`, await pdf.save()));
		onProgress((i + 1) / files.length * 90, files[i].name);
	}
	return out;
}
async function pageNumbersOp(files, options, onProgress) {
	const pos = options.pageNumberPos ?? "bottom";
	const out = [];
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
			page.drawText(label, {
				x,
				y,
				size: 10,
				font,
				color: rgb(.35, .35, .35)
			});
		});
		out.push(pdfResult(`${stemOf(file.name)}-numbered.pdf`, await pdf.save()));
		onProgress(90, file.name);
	}
	return out;
}
async function cropOp(file, options, onProgress) {
	const crop = options.crop ?? {
		t: 5,
		r: 5,
		b: 5,
		l: 5
	};
	onProgress(30, "Cropping pages");
	const pdf = await PDFDocument.load(await ensurePdf(file), { ignoreEncryption: true });
	for (const page of pdf.getPages()) {
		const { width, height } = page.getSize();
		const l = crop.l / 100 * width;
		const r = crop.r / 100 * width;
		const t = crop.t / 100 * height;
		const b = crop.b / 100 * height;
		const w = Math.max(24, width - l - r);
		const h = Math.max(24, height - t - b);
		page.setCropBox(l, b, w, h);
		page.setMediaBox(l, b, w, h);
	}
	onProgress(90, "Saving");
	return [pdfResult(`${stemOf(file.name)}-cropped.pdf`, await pdf.save())];
}
async function redactOp(file, options, onProgress) {
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
			if (!it.str.toLowerCase().includes(needle) && needle.length > 2 && !needle.includes(it.str.toLowerCase())) continue;
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
				color: rgb(0, 0, 0)
			});
		}
		onProgress(15 + 70 * i / js.numPages, `Page ${i}`);
	}
	await js.cleanup();
	if (!hits) throw new Error(`No matches for “${query}”`);
	onProgress(92, `Redacted ${hits} matches`);
	return [pdfResult(`${stemOf(file.name)}-redacted.pdf`, await pdf.save())];
}
async function signOp(file, options, onProgress) {
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
		const w = Math.min(180, width * .32);
		const h = img.height / img.width * w;
		page.drawImage(img, {
			x: width - w - 48,
			y: 42,
			width: w,
			height: h
		});
	}
	onProgress(90, "Saving");
	return [pdfResult(`${stemOf(file.name)}-signed.pdf`, await pdf.save())];
}
async function protectOp(files, options, onProgress) {
	const password = options.password?.trim();
	if (!password || password.length < 4) throw new Error("Choose a password of at least 4 characters");
	const { PDFDocument: EncryptedPDF } = await import("../_libs/@cantoo/pdf-lib+[...].mjs").then((n) => n.t);
	const out = [];
	for (let i = 0; i < files.length; i++) {
		onProgress((i + .2) / files.length * 100, `Encrypting ${files[i].name}`);
		const src = await EncryptedPDF.load(await ensurePdf(files[i]), { ignoreEncryption: true });
		const doc = await EncryptedPDF.create();
		(await doc.copyPages(src, src.getPageIndices())).forEach((p) => doc.addPage(p));
		doc.encrypt({
			userPassword: password,
			ownerPassword: `${password}-owner`,
			permissions: {
				printing: "highResolution",
				modifying: false,
				copying: false,
				annotating: false
			}
		});
		const bytes = await doc.save();
		out.push(pdfResult(`${stemOf(files[i].name)}-protected.pdf`, bytes));
	}
	return out;
}
async function unlockOp(files, options, onProgress) {
	const password = options.password?.trim();
	if (!password) throw new Error("Enter the PDF password");
	const { PDFDocument: EncryptedPDF } = await import("../_libs/@cantoo/pdf-lib+[...].mjs").then((n) => n.t);
	const out = [];
	for (let i = 0; i < files.length; i++) {
		onProgress((i + .2) / files.length * 100, `Unlocking ${files[i].name}`);
		try {
			const doc = await EncryptedPDF.load(files[i].bytes, { password });
			const fresh = await EncryptedPDF.create();
			(await fresh.copyPages(doc, doc.getPageIndices())).forEach((p) => fresh.addPage(p));
			out.push(pdfResult(`${stemOf(files[i].name)}-unlocked.pdf`, await fresh.save()));
		} catch {
			const js = await openPdfJs(files[i].bytes, password);
			const bytes = await rasterizeOpenDoc(js, 1.7, .85, onProgress);
			await js.cleanup();
			out.push(pdfResult(`${stemOf(files[i].name)}-unlocked.pdf`, bytes));
		}
	}
	return out;
}
async function compareOp(files, onProgress) {
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
		const jpgA = await canvasToJpeg(canvasA, .82);
		const jpgB = await canvasToJpeg(canvasB, .82);
		const imgA = await out.embedJpg(new Uint8Array(await jpgA.arrayBuffer()));
		const imgB = await out.embedJpg(new Uint8Array(await jpgB.arrayBuffer()));
		const page = out.addPage([900, 640]);
		page.drawText(`A · ${files[0].name} · p.${i}`, {
			x: 24,
			y: 612,
			size: 10,
			font,
			color: rgb(.2, .2, .2)
		});
		page.drawText(`B · ${files[1].name} · p.${i}`, {
			x: 470,
			y: 612,
			size: 10,
			font,
			color: rgb(.2, .2, .2)
		});
		const hA = Math.min(560, imgA.height / imgA.width * 420);
		const hB = Math.min(560, imgB.height / imgB.width * 420);
		page.drawImage(imgA, {
			x: 24,
			y: 600 - hA - 16,
			width: 420,
			height: hA
		});
		page.drawImage(imgB, {
			x: 456,
			y: 600 - hB - 16,
			width: 420,
			height: hB
		});
		onProgress(10 + 80 * i / pages, `Page ${i} of ${pages}`);
	}
	await a.cleanup();
	await b.cleanup();
	return [pdfResult(`${stemOf(files[0].name)}-vs-${stemOf(files[1].name)}.pdf`, await out.save())];
}
async function ocrOp(file, onProgress) {
	onProgress(20, "Reading text layer");
	const text = await extractPdfText(file.bytes, onProgress);
	if (text.replace(/\s/g, "").length < 12) throw new Error("No selectable text found. This looks like a scan — convert to JPG or open it in Edit PDF.");
	const html = text.split(/\n{2,}/).map((p) => `<p>${escapeHtml(p)}</p>`).join("");
	const pdfBytes = await htmlToPdfBytes(`<h1>${escapeHtml(stemOf(file.name))}</h1>${html}`);
	return [{
		name: `${stemOf(file.name)}.txt`,
		blob: new Blob([text], { type: "text/plain" }),
		previewText: text.slice(0, 1600)
	}, pdfResult(`${stemOf(file.name)}-searchable.pdf`, pdfBytes)];
}
async function summarizeOp(file, onProgress) {
	onProgress(20, "Extracting text");
	const text = await extractPdfText(file.bytes, onProgress);
	if (text.replace(/\s/g, "").length < 40) throw new Error("Not enough text in this PDF to summarize.");
	onProgress(55, "Writing summary");
	const res = await summarizeText({ data: {
		text,
		title: file.name
	} });
	if (!res.ok) throw new Error(res.error);
	const html = `<h1>Summary · ${escapeHtml(stemOf(file.name))}</h1>${res.text.split("\n").map((line) => {
		if (line.startsWith("- ")) return `<li>${escapeHtml(line.slice(2))}</li>`;
		return `<p>${escapeHtml(line)}</p>`;
	}).join("")}`;
	const bytes = await htmlToPdfBytes(html);
	return [{
		name: `${stemOf(file.name)}-summary.pdf`,
		blob: new Blob([asArrayBuffer(bytes)], { type: "application/pdf" }),
		previewText: res.text
	}];
}
async function translateOp(file, options, onProgress) {
	const lang = options.targetLang || "Spanish";
	onProgress(20, "Extracting text");
	const text = await extractPdfText(file.bytes, onProgress);
	if (text.replace(/\s/g, "").length < 20) throw new Error("Not enough text in this PDF to translate.");
	onProgress(55, `Translating to ${lang}`);
	const res = await translateText({ data: {
		text,
		lang
	} });
	if (!res.ok) throw new Error(res.error);
	const html = `<h1>${escapeHtml(stemOf(file.name))} · ${escapeHtml(lang)}</h1>${res.text.split(/\n{2,}/).map((p) => `<p>${escapeHtml(p)}</p>`).join("")}`;
	const bytes = await htmlToPdfBytes(html);
	return [{
		name: `${stemOf(file.name)}-${lang.toLowerCase()}.pdf`,
		blob: new Blob([asArrayBuffer(bytes)], { type: "application/pdf" }),
		previewText: res.text.slice(0, 1600)
	}];
}
async function pageThumbs(bytes, max = 24) {
	const pdf = await openPdfJs(bytes);
	const n = Math.min(pdf.numPages, max);
	const out = [];
	for (let i = 1; i <= n; i++) {
		const page = await pdf.getPage(i);
		const canvas = document.createElement("canvas");
		const size = await renderPageToCanvas(page, canvas, .28, 0);
		out.push({
			url: canvas.toDataURL("image/jpeg", .72),
			w: size.width,
			h: size.height
		});
	}
	await pdf.cleanup();
	return out;
}
async function inspectPdf(bytes) {
	try {
		const pdf = await openPdfJs(bytes);
		const pages = pdf.numPages;
		const page = await pdf.getPage(1);
		const canvas = document.createElement("canvas");
		await renderPageToCanvas(page, canvas, .28, 0);
		const thumb = canvas.toDataURL("image/jpeg", .72);
		await pdf.cleanup();
		return {
			pages,
			thumb
		};
	} catch {
		return { pages: 0 };
	}
}
async function ensurePdf(file) {
	if ((file.name.split(".").pop()?.toLowerCase() ?? "") === "pdf" || file.mime.includes("pdf")) return file.bytes.slice(0);
	return fileToPdfBytes(file);
}
async function fileToPdfBytes(file, kind) {
	const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
	const inferred = kind ?? (["doc", "docx"].includes(ext) ? "word" : ["ppt", "pptx"].includes(ext) ? "ppt" : [
		"xls",
		"xlsx",
		"csv"
	].includes(ext) ? "excel" : void 0);
	if (inferred === "word" || ext === "docx" || ext === "doc") {
		const html = await htmlFromDocx(file.bytes);
		return asArrayBuffer(await htmlToPdfBytes(html));
	}
	if (inferred === "ppt" || ext === "pptx" || ext === "ppt") {
		const html = (await slidesFromPptx(file.bytes)).map((s) => `<section style="page-break-after:always;padding:24px"><h1>${escapeHtml(s.title)}</h1><p>${escapeHtml(s.body).replace(/\n/g, "<br/>")}</p></section>`).join("");
		return asArrayBuffer(await htmlToPdfBytes(html));
	}
	if (inferred === "excel" || [
		"xlsx",
		"xls",
		"csv"
	].includes(ext)) {
		const html = (ext === "csv" ? [{
			name: "Sheet1",
			rows: new TextDecoder().decode(file.bytes).split(/\r?\n/).map((l) => l.split(","))
		}] : await sheetsFromXlsx(file.bytes)).map((s) => {
			const rows = s.rows.map((r) => `<tr>${r.map((c) => `<td style="border:1px solid #d6d0c6;padding:6px 8px">${escapeHtml(c)}</td>`).join("")}</tr>`).join("");
			return `<h2>${escapeHtml(s.name)}</h2><table style="border-collapse:collapse;width:100%">${rows}</table>`;
		}).join("");
		return asArrayBuffer(await htmlToPdfBytes(html));
	}
	if ([
		"png",
		"jpg",
		"jpeg",
		"webp",
		"gif"
	].includes(ext)) {
		const img = await normalizeImage(file);
		return asArrayBuffer(await pdfFromImages([img]));
	}
	const text = new TextDecoder().decode(file.bytes);
	const html = ext === "md" ? mdToHtml(text) : `<pre>${escapeHtml(text)}</pre>`;
	return asArrayBuffer(await htmlToPdfBytes(html));
}
async function pdfToHtml(bytes, name) {
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
async function extractPdfText(bytes, onProgress = () => {}) {
	const pdf = await openPdfJs(bytes);
	const parts = [];
	for (let i = 1; i <= pdf.numPages; i++) {
		const page = await pdf.getPage(i);
		parts.push(await pagePlainText(page));
		onProgress(Math.min(50, i / pdf.numPages * 50), `Reading page ${i}`);
	}
	await pdf.cleanup();
	return parts.join("\n\n");
}
async function rasterizeToPdf(bytes, scale, quality, onProgress) {
	const js = await openPdfJs(bytes);
	const result = await rasterizeOpenDoc(js, scale, quality, onProgress);
	await js.cleanup();
	return result;
}
async function rasterizeOpenDoc(js, scale, quality, onProgress) {
	const images = [];
	for (let i = 1; i <= js.numPages; i++) {
		const page = await js.getPage(i);
		const canvas = document.createElement("canvas");
		await renderPageToCanvas(page, canvas, scale, 0);
		const blob = await canvasToJpeg(canvas, quality);
		images.push({
			bytes: await blob.arrayBuffer(),
			mime: "image/jpeg"
		});
		onProgress(i / js.numPages * 85, `Page ${i} of ${js.numPages}`);
	}
	return pdfFromImages(images);
}
async function normalizeImage(file) {
	const mime = file.mime || guessMime(file.name);
	if (mime.includes("jpeg") || mime.includes("jpg") || mime.includes("png")) return {
		bytes: file.bytes,
		mime: mime.includes("png") ? "image/png" : "image/jpeg"
	};
	const url = URL.createObjectURL(new Blob([file.bytes]));
	try {
		const img = await loadImg(url);
		const canvas = document.createElement("canvas");
		canvas.width = img.naturalWidth || 1;
		canvas.height = img.naturalHeight || 1;
		const ctx = canvas.getContext("2d");
		if (!ctx) throw new Error("Could not read image");
		ctx.drawImage(img, 0, 0);
		return {
			bytes: await (await canvasToJpeg(canvas, .92)).arrayBuffer(),
			mime: "image/jpeg"
		};
	} finally {
		URL.revokeObjectURL(url);
	}
}
function loadImg(src) {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => resolve(img);
		img.onerror = () => reject(/* @__PURE__ */ new Error("Could not read image"));
		img.src = src;
	});
}
function parseRangeGroups(input, count) {
	const groups = [];
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
function pdfResult(name, bytes) {
	const buf = bytes instanceof Uint8Array ? asArrayBuffer(bytes) : bytes;
	return {
		name,
		blob: new Blob([buf], { type: "application/pdf" })
	};
}
async function zipResult(name, files) {
	const JSZip = (await import("../_libs/jszip+[...].mjs").then((n) => /* @__PURE__ */ __toESM(n.t()))).default;
	const zip = new JSZip();
	for (const f of files) zip.file(f.name, await f.blob.arrayBuffer());
	return {
		name,
		blob: await zip.generateAsync({ type: "blob" })
	};
}
function guessMime(name) {
	const ext = name.split(".").pop()?.toLowerCase();
	if (ext === "png") return "image/png";
	if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
	if (ext === "webp") return "image/webp";
	if (ext === "gif") return "image/gif";
	if (ext === "pdf") return "application/pdf";
	return "application/octet-stream";
}
function clamp(n, a, b) {
	return Math.max(a, Math.min(b, n));
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
			"…": "..."
		}[ch] ?? "?";
	});
}
function stripChrome(html) {
	return html.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<nav[\s\S]*?<\/nav>/gi, "");
}
async function samplesForTool(toolId) {
	switch (toolId) {
		case "merge-pdf":
		case "compare-pdf": return { files: [await makeSamplePdfFile("folio-sample-a.pdf", "A"), await makeSamplePdfFile("folio-sample-b.pdf", "B")] };
		case "word-to-pdf": return { files: [await makeSampleDocx()] };
		case "powerpoint-to-pdf": return { files: [await makeSamplePptx()] };
		case "excel-to-pdf": return { files: [await makeSampleXlsx()] };
		case "jpg-to-pdf":
		case "scan-to-pdf": return { files: [await makeSampleJpeg("Scan 1", "#f4efe6"), await makeSampleJpeg("Scan 2", "#e8eef4")] };
		case "html-to-pdf": return {
			files: [{
				name: "folio-sample.html",
				bytes: asArrayBuffer(new TextEncoder().encode(SAMPLE_HTML)),
				mime: "text/html"
			}],
			html: SAMPLE_HTML
		};
		case "redact-pdf": return {
			files: [await makeSamplePdfFile("folio-sample.pdf", "A")],
			redactQuery: "Northwind"
		};
		case "watermark": return {
			files: [await makeSamplePdfFile("folio-sample.pdf", "A")],
			watermarkText: "CONFIDENTIAL"
		};
		case "sign-pdf": return {
			files: [await makeSamplePdfFile("folio-sample.pdf", "A")],
			signDataUrl: sampleSignature()
		};
		case "protect-pdf": return {
			files: [await makeSamplePdfFile("folio-sample.pdf", "A")],
			password: "folio"
		};
		case "unlock-pdf": return {
			files: [await makeLockedPdf()],
			password: "folio"
		};
		default: return { files: [await makeSamplePdfFile("folio-sample.pdf", "A")] };
	}
}
async function makeSamplePdfFile(name, variant) {
	const pdf = await PDFDocument.create();
	const font = await pdf.embedFont(StandardFonts.TimesRoman);
	const bold = await pdf.embedFont(StandardFonts.TimesRomanBold);
	const sans = await pdf.embedFont(StandardFonts.Helvetica);
	const page1 = pdf.addPage([612, 792]);
	page1.drawRectangle({
		x: 0,
		y: 720,
		width: 612,
		height: 72,
		color: rgb(.878, .235, .18)
	});
	page1.drawText("FOLIO", {
		x: 56,
		y: 748,
		size: 18,
		font: bold,
		color: rgb(1, 1, 1)
	});
	page1.drawText(variant === "A" ? "Sample document" : "Revised document", {
		x: 130,
		y: 750,
		size: 11,
		font: sans,
		color: rgb(1, .92, .9)
	});
	page1.drawText(variant === "A" ? "Quarterly operations brief" : "Quarterly operations brief  ·  v2", {
		x: 56,
		y: 660,
		size: 22,
		font: bold,
		color: rgb(.11, .1, .09)
	});
	page1.drawText("Prepared for the product team  ·  2026", {
		x: 56,
		y: 634,
		size: 11,
		font: sans,
		color: rgb(.42, .4, .38)
	});
	const paras = variant === "A" ? [
		"This sample exists so you can try every Folio tool without hunting for a file. Merge it with another PDF, split the pages, compress it, convert it to Word or JPG, stamp a watermark, or open it in the editor and rewrite a line.",
		"Northwind closed the quarter with 128 closed tickets, a 94% on-time rate, and two delayed launches that have since shipped. Customer support volume rose 12% after the April release; average first reply stayed under four hours.",
		"Priorities for next quarter: finish the billing export, add password protection to shared decks, and cut the median PDF processing time below two seconds on a laptop."
	] : [
		"This is a second version of the same brief so Merge and Compare have two real files to work with.",
		"Northwind closed the quarter with 141 closed tickets, a 96% on-time rate, and no delayed launches. Customer support volume rose 8% after the April release; average first reply stayed under three hours.",
		"Priorities for next quarter: ship the billing export, keep password protection on shared decks, and hold PDF processing under two seconds on a laptop."
	];
	let y = 580;
	for (const p of paras) {
		const lines = wrap(p, 86);
		for (const line of lines) {
			page1.drawText(line, {
				x: 56,
				y,
				size: 12,
				font,
				color: rgb(.16, .14, .13)
			});
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
		color: rgb(.11, .1, .09)
	});
	const rows = variant === "A" ? [
		[
			"Metric",
			"Q1",
			"Q2",
			"Delta"
		],
		[
			"Closed tickets",
			"102",
			"128",
			"+26"
		],
		[
			"On-time rate",
			"91%",
			"94%",
			"+3 pts"
		],
		[
			"First reply",
			"4.8 h",
			"3.9 h",
			"-0.9 h"
		],
		[
			"NPS",
			"41",
			"47",
			"+6"
		]
	] : [
		[
			"Metric",
			"Q1",
			"Q2",
			"Delta"
		],
		[
			"Closed tickets",
			"102",
			"141",
			"+39"
		],
		[
			"On-time rate",
			"91%",
			"96%",
			"+5 pts"
		],
		[
			"First reply",
			"4.8 h",
			"2.9 h",
			"-1.9 h"
		],
		[
			"NPS",
			"41",
			"51",
			"+10"
		]
	];
	let ry = 670;
	rows.forEach((row, i) => {
		row.forEach((cell, c) => {
			page2.drawText(cell, {
				x: 56 + c * 120,
				y: ry,
				size: 12,
				font: i === 0 ? bold : font,
				color: rgb(.16, .14, .13)
			});
		});
		ry -= 28;
	});
	page2.drawText("Page 2 of 2", {
		x: 270,
		y: 36,
		size: 10,
		font: sans,
		color: rgb(.45, .42, .4)
	});
	const bytes = await pdf.save();
	return {
		name,
		bytes: asArrayBuffer(bytes),
		mime: "application/pdf"
	};
}
async function makeSampleDocx() {
	const { Document, Packer, Paragraph, TextRun, HeadingLevel } = await import("../_libs/docx.mjs").then((n) => n.t);
	const doc = new Document({ sections: [{ children: [
		new Paragraph({
			text: "Quarterly operations brief",
			heading: HeadingLevel.HEADING_1
		}),
		new Paragraph({
			text: "Northwind  ·  2026",
			heading: HeadingLevel.HEADING_2
		}),
		new Paragraph({ children: [new TextRun("This Word sample converts cleanly to PDF. Headings, body copy and a short list survive the round-trip.")] }),
		new Paragraph({ text: "Closed 128 tickets this quarter" }),
		new Paragraph({ text: "On-time rate reached 94%" }),
		new Paragraph({ text: "First reply under four hours" })
	] }] });
	return {
		name: "folio-brief.docx",
		bytes: await (await Packer.toBlob(doc)).arrayBuffer(),
		mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
	};
}
async function makeSamplePptx() {
	const PptxGenJS = (await import("../_libs/pptxgenjs.mjs").then((n) => n.t)).default;
	const pptx = new PptxGenJS();
	pptx.author = "Folio";
	pptx.title = "Quarterly review";
	pptx.layout = "LAYOUT_WIDE";
	const s1 = pptx.addSlide();
	s1.addShape("rect", {
		x: 0,
		y: 0,
		w: "100%",
		h: "100%",
		fill: { color: "F6F3EE" }
	});
	s1.addText("Quarterly review", {
		x: .7,
		y: 2.1,
		w: 12,
		h: 1,
		fontSize: 36,
		fontFace: "Georgia",
		color: "1C1917",
		bold: true
	});
	s1.addText("Northwind product team  ·  2026", {
		x: .7,
		y: 3.2,
		w: 12,
		h: .5,
		fontSize: 16,
		color: "6B6560"
	});
	const s2 = pptx.addSlide();
	s2.addShape("rect", {
		x: 0,
		y: 0,
		w: "100%",
		h: "100%",
		fill: { color: "FFFFFF" }
	});
	s2.addText("What shipped", {
		x: .7,
		y: .6,
		w: 12,
		h: .7,
		fontSize: 28,
		bold: true,
		color: "1C1917"
	});
	s2.addText("Billing export\nPassword-protected decks\nSub-2s PDF tools on a laptop", {
		x: .7,
		y: 1.6,
		w: 12,
		h: 3,
		fontSize: 20,
		color: "44403C"
	});
	return {
		name: "folio-review.pptx",
		bytes: await (await pptx.write({ outputType: "blob" })).arrayBuffer(),
		mime: "application/vnd.openxmlformats-officedocument.presentationml.presentation"
	};
}
async function makeSampleXlsx() {
	const XLSX = await import("../_libs/xlsx.mjs").then((n) => n.t);
	const wb = XLSX.utils.book_new();
	const ws = XLSX.utils.aoa_to_sheet([
		[
			"Metric",
			"Q1",
			"Q2",
			"Delta"
		],
		[
			"Closed tickets",
			102,
			128,
			"+26"
		],
		[
			"On-time rate",
			"91%",
			"94%",
			"+3 pts"
		],
		[
			"First reply (h)",
			4.8,
			3.9,
			-.9
		],
		[
			"NPS",
			41,
			47,
			6
		]
	]);
	XLSX.utils.book_append_sheet(wb, ws, "Ops");
	const out = XLSX.write(wb, {
		bookType: "xlsx",
		type: "array"
	});
	return {
		name: "folio-metrics.xlsx",
		bytes: out instanceof ArrayBuffer ? out : asArrayBuffer(new Uint8Array(out)),
		mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
	};
}
async function makeSampleJpeg(label, fill) {
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
	wrap("A generated scan so JPG to PDF and Scan to PDF work without picking a photo. Drop your own images any time.", 42).forEach((line, i) => ctx.fillText(line, 64, 360 + i * 40));
	const blob = await new Promise((res, rej) => canvas.toBlob((b) => b ? res(b) : rej(/* @__PURE__ */ new Error("encode")), "image/jpeg", .9));
	return {
		name: `${label.toLowerCase().replace(/\s+/g, "-")}.jpg`,
		bytes: await blob.arrayBuffer(),
		mime: "image/jpeg"
	};
}
async function makeLockedPdf() {
	const plain = await makeSamplePdfFile("folio-locked.pdf", "A");
	const { PDFDocument: EncryptedPDF } = await import("../_libs/@cantoo/pdf-lib+[...].mjs").then((n) => n.t);
	const src = await EncryptedPDF.load(plain.bytes);
	const doc = await EncryptedPDF.create();
	(await doc.copyPages(src, src.getPageIndices())).forEach((p) => doc.addPage(p));
	doc.encrypt({
		userPassword: "folio",
		ownerPassword: "folio-owner",
		permissions: {
			printing: "highResolution",
			modifying: false,
			copying: false,
			annotating: false
		}
	});
	const bytes = await doc.save();
	return {
		name: "folio-locked.pdf",
		bytes: asArrayBuffer(bytes),
		mime: "application/pdf"
	};
}
function sampleSignature() {
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
var SAMPLE_HTML = `<h1>Folio sample page</h1>
<p>Paste any HTML, drop an .html file, or convert this starter page.</p>
<ul>
  <li>Headings and lists keep their structure</li>
  <li>The result is a real PDF you can download</li>
  <li>Nothing leaves this device</li>
</ul>
<p>Northwind closed the quarter with 128 tickets and a 94% on-time rate.</p>`;
function wrap(text, width) {
	const words = text.split(/\s+/);
	const lines = [];
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
var LANGS = [
	"Spanish",
	"French",
	"German",
	"Portuguese",
	"Italian",
	"Hindi",
	"Japanese",
	"Korean",
	"Chinese",
	"Arabic"
];
function ToolWorkspace({ tool }) {
	const navigate = useNavigate();
	const importFiles = useFolio((s) => s.importFiles);
	const inputRef = (0, import_react.useRef)(null);
	const [files, setFiles] = (0, import_react.useState)([]);
	const [dragging, setDragging] = (0, import_react.useState)(false);
	const [running, setRunning] = (0, import_react.useState)(false);
	const [progress, setProgress] = (0, import_react.useState)(0);
	const [label, setLabel] = (0, import_react.useState)("");
	const [results, setResults] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(null);
	const [options, setOptions] = (0, import_react.useState)(defaultsFor(tool.id));
	const [thumbs, setThumbs] = (0, import_react.useState)([]);
	const [autoRun, setAutoRun] = (0, import_react.useState)(false);
	const capture = tool.id === "scan-to-pdf";
	const pagePicker = tool.id === "organize-pdf" || tool.id === "extract-pdf" || tool.id === "remove-pages";
	const noun = pickNoun(tool);
	const showOptionsEmpty = tool.id === "html-to-pdf";
	(0, import_react.useEffect)(() => {
		setFiles([]);
		setResults(null);
		setError(null);
		setOptions(defaultsFor(tool.id));
		setThumbs([]);
		setRunning(false);
		setProgress(0);
		setAutoRun(false);
	}, [tool.id]);
	(0, import_react.useEffect)(() => {
		if (typeof window === "undefined") return;
		const queued = takeStash();
		if (queued?.length) {
			(async () => {
				const next = [];
				for (const f of queued) next.push(await enrich(f));
				setFiles(next.slice(0, tool.maxFiles));
			})();
			return;
		}
		if (sessionStorage.getItem("folio-autodemo") === tool.id) {
			sessionStorage.removeItem("folio-autodemo");
			useSample(true);
		}
	}, [tool.id]);
	(0, import_react.useEffect)(() => {
		if (!pagePicker || !files[0]) {
			setThumbs([]);
			return;
		}
		let live = true;
		pageThumbs(files[0].bytes).then((t) => {
			if (!live) return;
			setThumbs(t);
			setOptions((o) => ({
				...o,
				pageOrder: t.map((_, i) => i)
			}));
		}).catch(() => {});
		return () => {
			live = false;
		};
	}, [pagePicker, files]);
	const canRun = (0, import_react.useMemo)(() => {
		if (running) return false;
		if (tool.id === "html-to-pdf") return files.length > 0 || !!options.url?.trim() || !!options.html?.trim();
		if (tool.id === "pdf-forms") return files.length >= 1 && (options.formFields?.length ?? 0) > 0;
		if (tool.id === "sign-pdf") return files.length >= tool.minFiles && !!options.signDataUrl;
		if (tool.id === "redact-pdf") return files.length >= 1 && !!options.redactQuery?.trim();
		if (tool.id === "protect-pdf" || tool.id === "unlock-pdf") return files.length >= 1 && (options.password?.trim().length ?? 0) >= (tool.id === "protect-pdf" ? 4 : 1);
		return files.length >= tool.minFiles;
	}, [
		files.length,
		running,
		tool,
		options
	]);
	const blockedReason = (0, import_react.useMemo)(() => {
		if (running || canRun) return "";
		if (tool.id === "sign-pdf" && files.length >= 1 && !options.signDataUrl) return "Draw or type a signature first.";
		if (tool.id === "redact-pdf" && files.length >= 1 && !options.redactQuery?.trim()) return "Enter the text you want to black out.";
		if (tool.id === "protect-pdf" && files.length >= 1) return "Choose a password of at least 4 characters.";
		if (tool.id === "unlock-pdf" && files.length >= 1) return "Enter the PDF password.";
		if (tool.id === "html-to-pdf") return "Paste a URL or HTML, drop a file, or try the sample.";
		if (tool.id === "pdf-forms" && files.length >= 1) return "Click the page to add a text field.";
		if (files.length < tool.minFiles) {
			const n = tool.minFiles - files.length;
			return n === 1 ? "Add a file, or try the sample." : `Add ${n} more files, or try the sample.`;
		}
		return "";
	}, [
		canRun,
		files.length,
		options,
		running,
		tool
	]);
	(0, import_react.useEffect)(() => {
		if (!autoRun || running || results || !canRun) return;
		setAutoRun(false);
		process();
	}, [
		autoRun,
		canRun,
		running,
		results
	]);
	async function enrich(file) {
		if (!(file.mime.includes("pdf") || file.name.toLowerCase().endsWith(".pdf"))) return file;
		try {
			const info = await inspectPdf(file.bytes);
			return {
				...file,
				pages: info.pages,
				thumb: info.thumb
			};
		} catch {
			return file;
		}
	}
	async function addList(list) {
		const incoming = Array.from(list);
		const next = [];
		for (const f of incoming) {
			if (f.size > 41943040) {
				toast.error(`${f.name} is larger than 40 MB`);
				continue;
			}
			next.push(await enrich({
				id: uid("f"),
				name: f.name,
				bytes: await f.arrayBuffer(),
				mime: f.type
			}));
		}
		setFiles((cur) => [...cur, ...next].slice(0, tool.maxFiles));
		setResults(null);
		setError(null);
	}
	async function useSample(runAfter = false) {
		try {
			const bundle = await samplesForTool(tool.id);
			const next = [];
			for (const f of bundle.files) next.push(await enrich({
				id: uid("f"),
				name: f.name,
				bytes: f.bytes,
				mime: f.mime
			}));
			setFiles((cur) => {
				if (next.length >= tool.minFiles) return next.slice(0, tool.maxFiles);
				return [...cur, ...next].slice(0, tool.maxFiles);
			});
			setOptions((o) => ({
				...o,
				html: bundle.html ?? o.html,
				url: bundle.url ?? o.url,
				redactQuery: bundle.redactQuery ?? o.redactQuery,
				watermarkText: bundle.watermarkText ?? o.watermarkText,
				signDataUrl: bundle.signDataUrl ?? o.signDataUrl,
				password: bundle.password ?? o.password
			}));
			setResults(null);
			setError(null);
			if (runAfter) {
				setAutoRun(true);
				toast.success("Sample loaded — running the tool");
			} else toast.success("Sample loaded — tap the red button to run");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Could not build a sample");
		}
	}
	async function process() {
		setError(null);
		setRunning(true);
		setProgress(4);
		setLabel("Starting");
		try {
			if (tool.id === "edit-pdf") {
				const created = await importFiles(files.map((f) => new File([new Uint8Array(f.bytes)], f.name, { type: f.mime || "application/pdf" })));
				if (created[0]) {
					toast.success("Opening editor");
					navigate({
						to: "/editor/$docId",
						params: { docId: created[0].id }
					});
				}
				return;
			}
			const safe = files.map((f) => ({
				...f,
				bytes: f.bytes.slice(0)
			}));
			const out = await runTool(tool.id, safe, options, (pct, msg) => {
				setProgress(Math.round(pct));
				setLabel(msg);
			});
			setProgress(100);
			setResults(out);
			toast.success(tool.done);
		} catch (err) {
			const msg = err instanceof Error ? err.message : "Something went wrong";
			setError(msg);
			toast.error(msg);
		} finally {
			setRunning(false);
		}
	}
	function reset() {
		setFiles([]);
		setResults(null);
		setError(null);
		setProgress(0);
		setOptions(defaultsFor(tool.id));
	}
	const related = TOOLS.filter((t) => t.category === tool.category && t.id !== tool.id).slice(0, 4);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			"data-tint": tool.tint,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: cn("text-on-tool", results ? "bg-ok" : `tint-${tool.tint}`),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex w-full max-w-4xl flex-col items-center px-4 py-10 text-center md:px-8 md:py-14",
					children: [
						results ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "grid size-16 place-items-center rounded-full bg-surface text-ok shadow-[var(--shadow-pop)]",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-8" })
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToolGlyph, {
							icon: tool.icon,
							tint: tool.tint,
							size: "lg",
							className: "shadow-[var(--shadow-pop)]"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "mt-4 text-3xl font-extrabold tracking-tight md:text-4xl",
							children: results ? tool.done : tool.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 max-w-xl text-sm text-on-tool/90 md:text-base",
							children: results ? "Your file is ready to download or share." : tool.blurb
						})
					]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto w-full max-w-3xl px-4 py-8 pb-32 md:px-8",
				children: [!results ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					files.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-active": dragging,
						onDragOver: (e) => {
							e.preventDefault();
							setDragging(true);
						},
						onDragLeave: () => setDragging(false),
						onDrop: (e) => {
							e.preventDefault();
							setDragging(false);
							if (e.dataTransfer.files.length) addList(e.dataTransfer.files);
						},
						className: "drop-zone flex min-h-80 cursor-pointer flex-col items-center justify-center px-6 py-14 text-center",
						onClick: (e) => {
							if (e.target.closest("button")) return;
							inputRef.current?.click();
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "grid size-16 place-items-center rounded-full text-on-tool",
								style: { background: "var(--tool)" },
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CloudUpload, { className: "size-8" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-5 text-2xl font-extrabold",
								children: ["Select ", noun]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 max-w-md text-sm text-muted",
								children: tool.hint
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-7 flex w-full max-w-md flex-col items-stretch gap-3 sm:flex-row sm:justify-center",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "tool",
									className: "h-12 px-8 text-base font-bold",
									onClick: () => inputRef.current?.click(),
									children: capture ? "Take photo or browse" : "Select files"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "secondary",
									className: "h-12 px-8 text-base font-bold",
									onClick: () => void useSample(false),
									children: "Try with a sample"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-4 text-xs text-subtle",
								children: "or drop files here · max 40 MB each"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						ref: inputRef,
						type: "file",
						className: "hidden",
						multiple: tool.multiple,
						accept: tool.accept,
						capture: capture ? "environment" : void 0,
						onChange: (e) => {
							if (e.target.files?.length) addList(e.target.files);
							e.target.value = "";
						}
					}),
					files.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-4 flex flex-wrap items-center justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm font-bold",
							children: [
								files.length,
								" ",
								files.length === 1 ? "file" : "files",
								" selected",
								tool.multiple ? " · drag to reorder" : ""
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-2",
							children: [files.length < tool.maxFiles && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								size: "sm",
								onClick: () => inputRef.current?.click(),
								children: "Add more"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								size: "sm",
								onClick: () => void useSample(),
								children: "Use sample"
							})]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "space-y-2",
						children: files.map((f, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							draggable: tool.multiple,
							onDragStart: (e) => {
								e.dataTransfer.setData("text/plain", String(i));
								e.dataTransfer.effectAllowed = "move";
							},
							onDragOver: (e) => e.preventDefault(),
							onDrop: (e) => {
								e.preventDefault();
								const from = Number(e.dataTransfer.getData("text/plain"));
								if (!Number.isNaN(from)) setFiles(move(files, from, i));
							},
							className: "flex items-center gap-3 rounded-xl bg-surface px-3 py-3 shadow-[var(--shadow-paper)]",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileThumb, { file: f }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0 flex-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "truncate text-sm font-bold",
										children: f.name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-xs text-muted",
										children: [formatBytes(f.bytes.byteLength), f.pages ? ` · ${f.pages} ${f.pages === 1 ? "page" : "pages"}` : ""]
									})]
								}),
								tool.multiple && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "icon",
										variant: "ghost",
										"aria-label": "Move up",
										disabled: i === 0,
										onClick: () => setFiles(move(files, i, i - 1)),
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUp, {})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "icon",
										variant: "ghost",
										"aria-label": "Move down",
										disabled: i === files.length - 1,
										onClick: () => setFiles(move(files, i, i + 1)),
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowDown, {})
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "icon",
									variant: "ghost",
									"aria-label": "Remove",
									onClick: () => setFiles(files.filter((x) => x.id !== f.id)),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, {})
								})
							]
						}, f.id))
					})] }),
					showOptionsEmpty || files.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToolOptions, {
						tool,
						options,
						setOptions,
						thumbs
					}) : null,
					tool.id === "pdf-forms" && files[0] && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormBuilder, {
						bytes: files[0].bytes,
						fields: options.formFields ?? [],
						onChange: (formFields) => setOptions((o) => ({
							...o,
							formFields
						}))
					}),
					files.length > 0 && tool.id !== "edit-pdf" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-8",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-sm font-extrabold",
							children: "Use this file for something else"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileActions, {
							files,
							except: tool.id
						})]
					}),
					error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger",
						children: error
					})
				] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResultPanel, {
					results,
					onReset: reset,
					tool,
					onEdit: async (file) => {
						const created = await importFiles([new File([file.blob], file.name, { type: file.blob.type || "application/pdf" })]);
						if (created[0]) navigate({
							to: "/editor/$docId",
							params: { docId: created[0].id }
						});
					},
					onContinue: async (nextId, file) => {
						stashFiles([await jobFromBlob(file.name, file.blob)]);
						navigate({
							to: "/tools/$toolId",
							params: { toolId: nextId }
						});
					}
				}), related.length > 0 && !results && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-12",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
						className: "text-sm font-extrabold text-muted",
						children: ["More in ", categoryLabel(tool.category)]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 grid grid-cols-2 gap-3 md:grid-cols-4",
						children: related.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/tools/$toolId",
							params: { toolId: t.id },
							className: "tool-card min-h-0 py-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToolGlyph, {
								icon: t.icon,
								tint: t.tint,
								size: "sm"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-bold",
								children: t.title
							})]
						}, t.id))
					})]
				})]
			})]
		}),
		(files.length > 0 || showOptionsEmpty) && !results && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "tool-dock",
			"data-tint": tool.tint,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto flex w-full max-w-3xl items-center gap-3 px-4 py-3 md:px-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "min-w-0 flex-1 truncate text-sm text-muted",
					children: blockedReason || (files.length ? `${files.length} ${files.length === 1 ? "file" : "files"} ready` : "Paste a URL or HTML, then convert")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "tool",
					className: "h-12 shrink-0 px-8 text-base font-extrabold",
					disabled: !canRun,
					onClick: () => void process(),
					children: running ? "Working…" : tool.cta
				})]
			})
		}),
		running && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "fixed inset-0 z-40 grid place-items-center bg-fg/45 p-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "process-card",
				"data-tint": tool.tint,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "spin-ring" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-5 text-lg font-extrabold",
						children: [label || tool.cta, "…"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 h-2 overflow-hidden rounded-full bg-raised",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-full rounded-full transition-[width] duration-200",
							style: {
								width: `${progress}%`,
								background: "var(--tool)"
							}
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-sm font-bold tabular-nums text-muted",
						children: [progress, "%"]
					})
				]
			})
		})
	] });
}
function FileThumb({ file }) {
	const [url, setUrl] = (0, import_react.useState)(file.thumb ?? null);
	(0, import_react.useEffect)(() => {
		if (file.thumb) {
			setUrl(file.thumb);
			return;
		}
		if (!file.mime.startsWith("image/")) return;
		const u = URL.createObjectURL(new Blob([file.bytes], { type: file.mime }));
		setUrl(u);
		return () => URL.revokeObjectURL(u);
	}, [file]);
	if (url) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
		src: url,
		alt: "",
		className: "size-12 rounded-md object-cover"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "grid size-12 place-items-center rounded-md bg-raised text-fg",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "size-5" })
	});
}
function ToolOptions({ tool, options, setOptions, thumbs }) {
	const patch = (p) => setOptions((o) => ({
		...o,
		...p
	}));
	if (tool.id === "split-pdf") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-6 space-y-3 rounded-xl bg-surface p-4 shadow-[var(--shadow-paper)]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm font-bold",
				children: "Split mode"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-2 sm:grid-cols-3",
				children: [
					["extract", "Every page"],
					["range", "Custom ranges"],
					["fixed", "Fixed groups"]
				].map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => patch({ splitMode: id }),
					className: cn("h-10 rounded-md text-sm font-bold", options.splitMode === id ? "bg-[var(--tool)] text-on-tool" : "bg-raised"),
					children: label
				}, id))
			}),
			options.splitMode === "range" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "block text-sm font-semibold",
				children: ["Ranges", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					className: "mt-1",
					placeholder: "1-3,5,8-10",
					value: options.ranges ?? "",
					onChange: (e) => patch({ ranges: e.target.value })
				})]
			}),
			options.splitMode === "fixed" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "block text-sm font-semibold",
				children: ["Pages per file", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					className: "mt-1",
					type: "number",
					min: 1,
					value: options.fixedCount ?? 1,
					onChange: (e) => patch({ fixedCount: Number(e.target.value) || 1 })
				})]
			})
		]
	});
	if (tool.id === "compress-pdf") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mt-6 grid gap-2 sm:grid-cols-3",
		children: [
			[
				"recommended",
				"Recommended",
				"Good quality, smaller file"
			],
			[
				"low",
				"Strong",
				"Smaller still"
			],
			[
				"extreme",
				"Extreme",
				"Smallest file"
			]
		].map(([id, title, hint]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			onClick: () => patch({ quality: id }),
			className: cn("rounded-xl p-4 text-left shadow-[var(--shadow-paper)]", options.quality === id ? "bg-[var(--tool)] text-on-tool" : "bg-surface"),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-extrabold",
				children: title
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: cn("mt-1 text-xs", options.quality === id ? "text-on-tool/80" : "text-muted"),
				children: hint
			})]
		}, id))
	});
	if (tool.id === "rotate-pdf") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mt-6 flex gap-2",
		children: [
			90,
			180,
			270
		].map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			variant: options.rotation === d ? "tool" : "secondary",
			onClick: () => patch({ rotation: d }),
			children: [d, "°"]
		}, d))
	});
	if (tool.id === "watermark") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-6 space-y-4 rounded-xl bg-surface p-4 shadow-[var(--shadow-paper)]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
			className: "block text-sm font-bold",
			children: ["Watermark text", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				className: "mt-1",
				value: options.watermarkText ?? "",
				onChange: (e) => patch({ watermarkText: e.target.value })
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
			className: "block text-sm font-bold",
			children: ["Opacity", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
				className: "mt-3",
				min: 8,
				max: 50,
				value: [Math.round((options.watermarkOpacity ?? .18) * 100)],
				onValueChange: (v) => patch({ watermarkOpacity: (v[0] ?? 18) / 100 })
			})]
		})]
	});
	if (tool.id === "page-numbers") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "mt-6 block text-sm font-bold",
		children: ["Position", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
			className: "field-select mt-1",
			value: options.pageNumberPos,
			onChange: (e) => patch({ pageNumberPos: e.target.value }),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
					value: "bottom",
					children: "Bottom center"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
					value: "top",
					children: "Top center"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
					value: "bottom-left",
					children: "Bottom left"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
					value: "bottom-right",
					children: "Bottom right"
				})
			]
		})]
	});
	if (tool.id === "crop-pdf") {
		const c = options.crop ?? {
			t: 5,
			r: 5,
			b: 5,
			l: 5
		};
		const set = (k, n) => patch({ crop: {
			...c,
			[k]: n
		} });
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-6 space-y-3 rounded-xl bg-surface p-4 shadow-[var(--shadow-paper)]",
			children: [
				"t",
				"r",
				"b",
				"l"
			].map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "block text-sm font-semibold",
				children: [
					k === "t" ? "Top" : k === "r" ? "Right" : k === "b" ? "Bottom" : "Left",
					" ",
					c[k],
					"%",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
						className: "mt-2",
						min: 0,
						max: 30,
						value: [c[k]],
						onValueChange: (v) => set(k, v[0] ?? 0)
					})
				]
			}, k))
		});
	}
	if (tool.id === "redact-pdf") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "mt-6 block text-sm font-bold",
		children: ["Text to remove", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
			className: "mt-1",
			placeholder: "e.g. invoice number, email, name",
			value: options.redactQuery ?? "",
			onChange: (e) => patch({ redactQuery: e.target.value })
		})]
	});
	if (tool.id === "protect-pdf" || tool.id === "unlock-pdf") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "mt-6 block text-sm font-bold",
		children: ["Password", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
			className: "mt-1",
			type: "password",
			autoComplete: "off",
			value: options.password ?? "",
			onChange: (e) => patch({ password: e.target.value })
		})]
	});
	if (tool.id === "html-to-pdf") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-6 space-y-3 rounded-xl bg-surface p-4 shadow-[var(--shadow-paper)]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
			className: "block text-sm font-bold",
			children: ["Page URL", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				className: "mt-1",
				placeholder: "https://",
				value: options.url ?? "",
				onChange: (e) => patch({ url: e.target.value })
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
			className: "block text-sm font-bold",
			children: ["Or paste HTML", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
				className: "mt-1 min-h-28",
				value: options.html ?? "",
				onChange: (e) => patch({ html: e.target.value })
			})]
		})]
	});
	if (tool.id === "translate-pdf") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "mt-6 block text-sm font-bold",
		children: ["Translate into", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
			className: "field-select mt-1",
			value: options.targetLang,
			onChange: (e) => patch({ targetLang: e.target.value }),
			children: LANGS.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: l }, l))
		})]
	});
	if (tool.id === "jpg-to-pdf" || tool.id === "scan-to-pdf") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-6 flex gap-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: options.imageFit === "original" ? "tool" : "secondary",
			onClick: () => patch({ imageFit: "original" }),
			children: "Original size"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: options.imageFit === "page" ? "tool" : "secondary",
			onClick: () => patch({ imageFit: "page" }),
			children: "Fit to page"
		})]
	});
	if (tool.id === "convert-any") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mb-2 text-sm font-bold",
			children: "Convert to"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid grid-cols-3 gap-2 sm:grid-cols-5",
			children: [
				["pdf", "PDF"],
				["docx", "Word"],
				["pptx", "PowerPoint"],
				["xlsx", "Excel"],
				["jpg", "JPG"],
				["png", "PNG"],
				["txt", "Text"],
				["md", "Markdown"],
				["html", "HTML"]
			].map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => patch({ targetFormat: id }),
				className: cn("h-11 rounded-md text-sm font-bold", (options.targetFormat ?? "docx") === id ? "bg-[var(--tool)] text-on-tool" : "bg-raised"),
				children: label
			}, id))
		})]
	});
	if (tool.id === "sign-pdf") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SignPad, {
		value: options.signDataUrl,
		onChange: (signDataUrl) => patch({ signDataUrl }),
		page: options.signPage,
		onPage: (signPage) => patch({ signPage })
	});
	if ((tool.id === "organize-pdf" || tool.id === "extract-pdf" || tool.id === "remove-pages") && thumbs.length) {
		const order = options.pageOrder ?? thumbs.map((_, i) => i);
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-3 text-sm font-bold",
				children: tool.id === "remove-pages" ? "Trash the pages you want gone. Everything left stays in the file." : tool.id === "extract-pdf" ? "Trash the pages you do not need. Keep the rest." : "Use arrows to reorder, trash to drop a page."
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-2 gap-3 sm:grid-cols-3",
				children: order.map((idx, pos) => {
					const t = thumbs[idx];
					if (!t) return null;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "overflow-hidden rounded-lg bg-surface shadow-[var(--shadow-paper)]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: t.url,
							alt: `Page ${idx + 1}`,
							className: "w-full bg-raised object-contain"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between px-2 py-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-xs text-muted",
								children: ["p.", idx + 1]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "icon",
										variant: "ghost",
										className: "size-8",
										disabled: pos === 0,
										onClick: () => patch({ pageOrder: move(order, pos, pos - 1) }),
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUp, { className: "size-3.5" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "icon",
										variant: "ghost",
										className: "size-8",
										disabled: pos === order.length - 1,
										onClick: () => patch({ pageOrder: move(order, pos, pos + 1) }),
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowDown, { className: "size-3.5" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "icon",
										variant: "ghost",
										className: "size-8",
										disabled: order.length <= 1,
										onClick: () => patch({ pageOrder: order.filter((_, i) => i !== pos) }),
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-3.5" })
									})
								]
							})]
						})]
					}, `${idx}-${pos}`);
				})
			})]
		});
	}
	return null;
}
function SignPad({ value, onChange, page, onPage }) {
	const canvasRef = (0, import_react.useRef)(null);
	const drawing = (0, import_react.useRef)(false);
	const [mode, setMode] = (0, import_react.useState)("draw");
	const [typed, setTyped] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		const c = canvasRef.current;
		if (!c) return;
		const ctx = c.getContext("2d");
		if (!ctx) return;
		const dpr = window.devicePixelRatio || 1;
		const w = c.clientWidth || 480;
		c.width = w * dpr;
		c.height = 140 * dpr;
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		ctx.fillStyle = "#fffdf9";
		ctx.fillRect(0, 0, w, 140);
		ctx.strokeStyle = "#1c1917";
		ctx.lineWidth = 2.2;
		ctx.lineCap = "round";
	}, [mode]);
	function pos(e) {
		const r = e.currentTarget.getBoundingClientRect();
		return {
			x: e.clientX - r.left,
			y: e.clientY - r.top
		};
	}
	function commitCanvas() {
		const c = canvasRef.current;
		if (c) onChange(c.toDataURL("image/png"));
	}
	function commitType() {
		const c = document.createElement("canvas");
		c.width = 640;
		c.height = 180;
		const ctx = c.getContext("2d");
		if (!ctx) return;
		ctx.fillStyle = "#fffdf9";
		ctx.fillRect(0, 0, 640, 180);
		ctx.fillStyle = "#1c1917";
		ctx.font = "italic 56px Georgia, serif";
		ctx.fillText(typed || "Signature", 32, 110);
		onChange(c.toDataURL("image/png"));
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-6 space-y-3 rounded-xl bg-surface p-4 shadow-[var(--shadow-paper)]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: mode === "draw" ? "default" : "secondary",
					onClick: () => setMode("draw"),
					children: "Draw"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: mode === "type" ? "default" : "secondary",
					onClick: () => setMode("type"),
					children: "Type"
				})]
			}),
			mode === "draw" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
				ref: canvasRef,
				className: "h-[140px] w-full touch-none rounded-lg paper-grain",
				onPointerDown: (e) => {
					drawing.current = true;
					const ctx = e.currentTarget.getContext("2d");
					if (!ctx) return;
					const p = pos(e);
					ctx.beginPath();
					ctx.moveTo(p.x, p.y);
					e.currentTarget.setPointerCapture(e.pointerId);
				},
				onPointerMove: (e) => {
					if (!drawing.current) return;
					const ctx = e.currentTarget.getContext("2d");
					if (!ctx) return;
					const p = pos(e);
					ctx.lineTo(p.x, p.y);
					ctx.stroke();
				},
				onPointerUp: () => {
					drawing.current = false;
					commitCanvas();
				}
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					placeholder: "Your name",
					value: typed,
					onChange: (e) => setTyped(e.target.value),
					className: "font-[Georgia,serif] text-lg italic"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "secondary",
					onClick: commitType,
					children: "Use"
				})]
			}),
			value && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-bold text-ok",
				children: "Signature ready"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: page === "last" ? "default" : "secondary",
					onClick: () => onPage("last"),
					children: "Last page"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: page === "all" ? "default" : "secondary",
					onClick: () => onPage("all"),
					children: "Every page"
				})]
			})
		]
	});
}
function ResultPanel({ results, onReset, tool, onEdit, onContinue }) {
	const preview = results.find((r) => r.previewText)?.previewText;
	const visual = results.find((r) => {
		const t = r.blob.type || "";
		const n = r.name.toLowerCase();
		if (n.endsWith(".zip")) return false;
		return t.includes("pdf") || n.endsWith(".pdf") || t.startsWith("image/") || n.match(/\.(jpg|jpeg|png|webp)$/);
	});
	const primary = results.find((r) => !r.name.endsWith(".zip")) ?? results[0];
	const more = primary ? continueTools(tool.id, primary.name) : [];
	function downloadAll() {
		const zip = results.find((r) => r.name.endsWith(".zip"));
		if (zip) {
			downloadBlob(zip.blob, zip.name);
			return;
		}
		results.forEach((r) => downloadBlob(r.blob, r.name));
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl bg-surface p-6 text-center shadow-[var(--shadow-paper)]",
		children: [
			visual && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResultPreview, { file: visual }),
			!visual && !preview && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mx-auto mt-2 grid size-20 place-items-center rounded-2xl bg-raised text-fg",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "size-8" })
			}),
			preview && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
				className: "mt-4 max-h-48 overflow-auto rounded-lg bg-raised p-3 text-left text-xs leading-relaxed whitespace-pre-wrap",
				children: preview
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 flex flex-wrap justify-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "tool",
					className: "h-12 px-8 text-base font-extrabold",
					onClick: downloadAll,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, {}),
						" Download ",
						results.length > 1 ? "all" : ""
					]
				}), visual && (visual.name.endsWith(".pdf") || visual.blob.type.includes("pdf")) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "secondary",
					className: "h-12 px-5 font-bold",
					onClick: () => void onEdit(visual),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PenLine, {}), " Continue editing"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-5 space-y-2 text-left",
				children: results.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center gap-3 rounded-lg bg-raised px-3 py-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "size-4 shrink-0 text-muted" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "min-w-0 flex-1 truncate text-sm font-semibold",
							children: r.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs text-muted",
							children: formatBytes(r.blob.size)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "tool",
							className: "font-bold",
							onClick: () => downloadBlob(r.blob, r.name),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, {}), " Save"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "icon",
							variant: "secondary",
							"aria-label": "Share",
							onClick: () => void shareBlob(r.blob, r.name, r.name),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Share2, {})
						})
					]
				}, r.name))
			}),
			more.length > 0 && primary && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 text-left",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-sm font-extrabold text-muted",
					children: "Continue with this file"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3",
					children: more.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "tool-card min-h-0 items-center gap-2 py-3",
						onClick: () => void onContinue(t.id, primary),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToolGlyph, {
							icon: t.icon,
							tint: t.tint,
							size: "sm"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-bold",
							children: t.title
						})]
					}, t.id))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "secondary",
				className: "mt-6 font-bold",
				onClick: onReset,
				children: "Start over"
			})
		]
	});
}
function ResultPreview({ file }) {
	const canvasRef = (0, import_react.useRef)(null);
	const [imgUrl, setImgUrl] = (0, import_react.useState)(null);
	const isPdf = file.blob.type.includes("pdf") || file.name.toLowerCase().endsWith(".pdf");
	const isImage = file.blob.type.startsWith("image/") || /\.(jpg|jpeg|png|webp)$/i.test(file.name);
	(0, import_react.useEffect)(() => {
		let live = true;
		if (isImage) {
			const u = URL.createObjectURL(file.blob);
			setImgUrl(u);
			return () => {
				live = false;
				URL.revokeObjectURL(u);
			};
		}
		if (!isPdf || !canvasRef.current) return;
		(async () => {
			try {
				const pdf = await openPdfJs(await file.blob.arrayBuffer());
				const page = await pdf.getPage(1);
				if (!live || !canvasRef.current) return;
				await renderPageToCanvas(page, canvasRef.current, .7, 0);
				const canvas = canvasRef.current;
				canvas.style.width = "auto";
				canvas.style.height = "auto";
				canvas.style.maxHeight = "20rem";
				canvas.style.maxWidth = "100%";
				await pdf.cleanup();
			} catch {}
		})();
		return () => {
			live = false;
		};
	}, [
		file,
		isPdf,
		isImage
	]);
	if (isImage && imgUrl) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
		src: imgUrl,
		alt: "Result preview",
		className: "mx-auto mt-5 max-h-80 rounded-lg bg-raised object-contain shadow-[var(--shadow-paper)]"
	});
	if (isPdf) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mx-auto mt-5 flex h-80 max-w-full items-start justify-center overflow-hidden rounded-lg bg-raised shadow-[var(--shadow-paper)]",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
			ref: canvasRef,
			className: "max-h-full w-auto max-w-full"
		})
	});
	return null;
}
function defaultsFor(id) {
	return {
		splitMode: "extract",
		ranges: "1-3",
		fixedCount: 1,
		quality: "recommended",
		rotation: 90,
		watermarkText: "CONFIDENTIAL",
		watermarkOpacity: .18,
		pageNumberPos: "bottom",
		crop: {
			t: 5,
			r: 5,
			b: 5,
			l: 5
		},
		signPage: "last",
		imageFit: "original",
		targetLang: "Spanish",
		targetFormat: "docx",
		formFields: []
	};
}
function move(arr, from, to) {
	if (to < 0 || to >= arr.length) return arr;
	const next = [...arr];
	const [item] = next.splice(from, 1);
	next.splice(to, 0, item);
	return next;
}
function ToolPage() {
	const { toolId } = Route.useParams();
	const tool = getTool(toolId);
	if (!tool) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-lg px-4 py-20 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl font-semibold",
				children: "That tool is not here"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted",
				children: "Pick another one from the full list."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/",
				className: "mt-6 inline-block text-sm font-medium text-accent",
				children: "All PDF tools"
			})
		]
	}) });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToolWorkspace, { tool });
}
//#endregion
export { ToolPage as component };
