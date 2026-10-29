import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { b as useNavigate, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { F as LayoutGrid, G as Files, I as Languages, J as FileMinus, K as FileType, M as LockOpen, Q as Droplets, R as Image, S as Presentation, T as PenLine, U as Hash, W as Globe, X as FileCode2, Y as FileImage, Z as EyeOff, a as Wrench, b as RotateCw, d as Table2, et as Crop, gt as AlignLeft, ht as Archive, i as X, it as ClipboardList, j as Lock, k as Minimize2, lt as Camera, nt as Columns2, p as Stamp, pt as ArrowLeftRight, q as FileText, rt as CloudUpload, st as ChevronDown, tt as Combine, v as Scissors, y as ScanText } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { c as cn, f as uid, u as formatBytes } from "./router-BNe88wCr.mjs";
import { a as DropdownMenuTrigger, n as DropdownMenuContent, o as FolioMark, t as DropdownMenu } from "./mark-CWKMxwFg.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/upload-hub-BUJiPHo4.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var ICONS = {
	merge: Combine,
	split: Scissors,
	extract: Files,
	remove: FileMinus,
	organize: LayoutGrid,
	rotate: RotateCw,
	compress: Minimize2,
	repair: Wrench,
	pdfa: Archive,
	word: FileType,
	ppt: Presentation,
	excel: Table2,
	jpg: Image,
	png: FileImage,
	md: Hash,
	txt: FileText,
	html: Globe,
	scan: Camera,
	edit: PenLine,
	forms: ClipboardList,
	convert: ArrowLeftRight,
	watermark: Droplets,
	numbers: Hash,
	crop: Crop,
	redact: EyeOff,
	sign: Stamp,
	protect: Lock,
	unlock: LockOpen,
	compare: Columns2,
	ocr: ScanText,
	summary: AlignLeft,
	translate: Languages,
	code: FileCode2
};
var TINT = {
	red: "bg-tool-red",
	orange: "bg-tool-orange",
	green: "bg-tool-green",
	blue: "bg-tool-blue",
	navy: "bg-tool-navy",
	teal: "bg-tool-teal",
	slate: "bg-tool-slate",
	rose: "bg-tool-rose"
};
function ToolGlyph({ icon, tint, className, size = "md" }) {
	const Icon = ICONS[icon] ?? FileText;
	const box = size === "lg" ? "size-16 rounded-2xl" : size === "sm" ? "size-9 rounded-md" : "size-12 rounded-[14px]";
	const ic = size === "lg" ? "size-8" : size === "sm" ? "size-4" : "size-6";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("grid place-items-center text-on-tool", TINT[tint], box, className),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
			className: ic,
			strokeWidth: 1.8
		})
	});
}
var CATEGORIES = [
	{
		id: "all",
		label: "All"
	},
	{
		id: "organize",
		label: "Organize PDF"
	},
	{
		id: "optimize",
		label: "Optimize PDF"
	},
	{
		id: "convert",
		label: "Convert PDF"
	},
	{
		id: "edit",
		label: "Edit PDF"
	},
	{
		id: "security",
		label: "PDF Security"
	},
	{
		id: "ai",
		label: "PDF Intelligence"
	}
];
var PDF = "application/pdf,.pdf";
var IMAGES = "image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif";
var WORD = ".doc,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document";
var PPT = ".ppt,.pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation";
var XLS = ".xls,.xlsx,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
var HTML = ".html,.htm,.txt,.md,text/html,text/plain";
var ANY_DOC = `${PDF},${IMAGES},${WORD},${PPT},${XLS},${HTML}`;
var TOOLS = [
	{
		id: "merge-pdf",
		title: "Merge PDF",
		blurb: "Combine PDFs in the order you want with the easiest PDF merger.",
		category: "organize",
		icon: "merge",
		tint: "red",
		accept: PDF,
		minFiles: 2,
		maxFiles: 20,
		multiple: true,
		cta: "Merge PDF",
		hint: "Select two or more PDF files to merge them into one.",
		done: "PDFs have been merged!"
	},
	{
		id: "split-pdf",
		title: "Split PDF",
		blurb: "Separate one page or a whole set into independent PDF files.",
		category: "organize",
		icon: "split",
		tint: "orange",
		accept: PDF,
		minFiles: 1,
		maxFiles: 1,
		multiple: false,
		cta: "Split PDF",
		hint: "Split by range, extract every page, or cut into groups.",
		done: "PDF has been split!"
	},
	{
		id: "extract-pdf",
		title: "Extract pages",
		blurb: "Pick the pages you need and save them as a new PDF.",
		category: "organize",
		icon: "extract",
		tint: "rose",
		accept: PDF,
		minFiles: 1,
		maxFiles: 1,
		multiple: false,
		cta: "Extract pages",
		hint: "Choose which pages to keep. The rest are left out of the download.",
		done: "Pages have been extracted!"
	},
	{
		id: "remove-pages",
		title: "Remove pages",
		blurb: "Delete the pages you do not want and download a shorter PDF.",
		category: "organize",
		icon: "remove",
		tint: "rose",
		accept: PDF,
		minFiles: 1,
		maxFiles: 1,
		multiple: false,
		cta: "Remove pages",
		hint: "Trash the pages to drop. Everything left stays in the file.",
		done: "Pages have been removed!"
	},
	{
		id: "organize-pdf",
		title: "Organize PDF",
		blurb: "Sort, delete, or duplicate pages. Build the document you need.",
		category: "organize",
		icon: "organize",
		tint: "rose",
		accept: PDF,
		minFiles: 1,
		maxFiles: 1,
		multiple: false,
		cta: "Save PDF",
		hint: "Reorder pages, drop the ones you do not need, then save.",
		done: "PDF has been organized!"
	},
	{
		id: "rotate-pdf",
		title: "Rotate PDF",
		blurb: "Rotate your PDFs the way you need them — even several at once.",
		category: "organize",
		icon: "rotate",
		tint: "teal",
		accept: PDF,
		minFiles: 1,
		maxFiles: 12,
		multiple: true,
		cta: "Rotate PDF",
		hint: "Choose 90°, 180° or 270° and apply to every page.",
		done: "PDF has been rotated!"
	},
	{
		id: "compress-pdf",
		title: "Compress PDF",
		blurb: "Reduce file size while keeping the pages readable.",
		category: "optimize",
		icon: "compress",
		tint: "green",
		accept: PDF,
		minFiles: 1,
		maxFiles: 8,
		multiple: true,
		cta: "Compress PDF",
		hint: "Recommended keeps quality. Extreme makes the smallest file.",
		done: "PDF has been compressed!"
	},
	{
		id: "repair-pdf",
		title: "Repair PDF",
		blurb: "Rebuild a damaged PDF and recover pages that still render.",
		category: "optimize",
		icon: "repair",
		tint: "slate",
		accept: PDF,
		minFiles: 1,
		maxFiles: 1,
		multiple: false,
		cta: "Repair PDF",
		hint: "We rewrite the file from the pages that can still be read.",
		done: "PDF has been repaired!"
	},
	{
		id: "pdf-to-pdfa",
		title: "PDF to PDF/A",
		blurb: "Create an archival copy that keeps formatting for the long term.",
		category: "optimize",
		icon: "pdfa",
		tint: "navy",
		accept: PDF,
		minFiles: 1,
		maxFiles: 4,
		multiple: true,
		cta: "Convert to PDF/A",
		hint: "Pages are rewritten into a clean archival PDF.",
		done: "Archival PDF is ready!"
	},
	{
		id: "convert-any",
		title: "Convert any file",
		blurb: "Turn a PDF, Word file, deck, sheet, image or note into another format.",
		category: "convert",
		icon: "convert",
		tint: "red",
		accept: ANY_DOC,
		minFiles: 1,
		maxFiles: 1,
		multiple: false,
		cta: "Convert",
		hint: "Drop almost any document, pick a format, then download or share it.",
		done: "Your file has been converted!"
	},
	{
		id: "pdf-to-word",
		title: "PDF to Word",
		blurb: "Convert PDF files into editable DOC and DOCX documents.",
		category: "convert",
		icon: "word",
		tint: "navy",
		accept: PDF,
		minFiles: 1,
		maxFiles: 4,
		multiple: true,
		cta: "Convert to Word",
		hint: "Text, headings and paragraphs are reconstructed into a Word file.",
		done: "PDF has been converted to Word!"
	},
	{
		id: "pdf-to-powerpoint",
		title: "PDF to PowerPoint",
		blurb: "Turn PDF pages into an editable PPTX slideshow.",
		category: "convert",
		icon: "ppt",
		tint: "orange",
		accept: PDF,
		minFiles: 1,
		maxFiles: 2,
		multiple: false,
		cta: "Convert to PowerPoint",
		hint: "Each PDF page becomes a slide.",
		done: "PDF has been converted to PowerPoint!"
	},
	{
		id: "pdf-to-excel",
		title: "PDF to Excel",
		blurb: "Pull tables and lines from a PDF into a spreadsheet.",
		category: "convert",
		icon: "excel",
		tint: "green",
		accept: PDF,
		minFiles: 1,
		maxFiles: 4,
		multiple: true,
		cta: "Convert to Excel",
		hint: "Rows are detected from the text layout of each page.",
		done: "PDF has been converted to Excel!"
	},
	{
		id: "pdf-to-jpg",
		title: "PDF to JPG",
		blurb: "Convert each PDF page into a high-quality JPG image.",
		category: "convert",
		icon: "jpg",
		tint: "blue",
		accept: PDF,
		minFiles: 1,
		maxFiles: 2,
		multiple: false,
		cta: "Convert to JPG",
		hint: "Every page is exported as a JPG. Multiple pages arrive as a zip.",
		done: "PDF has been converted to JPG!"
	},
	{
		id: "pdf-to-png",
		title: "PDF to PNG",
		blurb: "Export PDF pages as crisp PNG images with a transparent-ready canvas.",
		category: "convert",
		icon: "png",
		tint: "teal",
		accept: PDF,
		minFiles: 1,
		maxFiles: 2,
		multiple: false,
		cta: "Convert to PNG",
		hint: "Best for slides, screenshots and graphics.",
		done: "PDF has been converted to PNG!"
	},
	{
		id: "pdf-to-markdown",
		title: "PDF to Markdown",
		blurb: "Turn PDFs into Markdown for notes, docs, and writing tools.",
		category: "convert",
		icon: "md",
		tint: "slate",
		accept: PDF,
		minFiles: 1,
		maxFiles: 4,
		multiple: true,
		cta: "Convert to Markdown",
		hint: "Headings and paragraphs are preserved as Markdown.",
		done: "Markdown file is ready!"
	},
	{
		id: "pdf-to-txt",
		title: "PDF to TXT",
		blurb: "Extract all readable text from a PDF into a plain text file.",
		category: "convert",
		icon: "txt",
		tint: "slate",
		accept: PDF,
		minFiles: 1,
		maxFiles: 8,
		multiple: true,
		cta: "Extract text",
		hint: "Works on PDFs that already contain a text layer.",
		done: "Text has been extracted!"
	},
	{
		id: "word-to-pdf",
		title: "Word to PDF",
		blurb: "Make DOC and DOCX files easy to read by converting them to PDF.",
		category: "convert",
		icon: "word",
		tint: "navy",
		accept: WORD,
		minFiles: 1,
		maxFiles: 8,
		multiple: true,
		cta: "Convert to PDF",
		hint: "Upload a Word file. We keep headings, lists and paragraphs.",
		done: "Word file has been converted to PDF!"
	},
	{
		id: "powerpoint-to-pdf",
		title: "PowerPoint to PDF",
		blurb: "Make PPT and PPTX slideshows easy to view as a PDF.",
		category: "convert",
		icon: "ppt",
		tint: "orange",
		accept: PPT,
		minFiles: 1,
		maxFiles: 4,
		multiple: true,
		cta: "Convert to PDF",
		hint: "Each slide becomes a PDF page.",
		done: "PowerPoint has been converted to PDF!"
	},
	{
		id: "excel-to-pdf",
		title: "Excel to PDF",
		blurb: "Make spreadsheets easy to share by converting them to PDF.",
		category: "convert",
		icon: "excel",
		tint: "green",
		accept: XLS,
		minFiles: 1,
		maxFiles: 4,
		multiple: true,
		cta: "Convert to PDF",
		hint: "Sheets are laid out as tables on the page.",
		done: "Spreadsheet has been converted to PDF!"
	},
	{
		id: "jpg-to-pdf",
		title: "JPG to PDF",
		blurb: "Convert JPG, PNG and other images to PDF in seconds.",
		category: "convert",
		icon: "jpg",
		tint: "blue",
		accept: IMAGES,
		minFiles: 1,
		maxFiles: 30,
		multiple: true,
		cta: "Convert to PDF",
		hint: "Images become pages. Drag to set the order.",
		done: "Images have been converted to PDF!"
	},
	{
		id: "html-to-pdf",
		title: "HTML to PDF",
		blurb: "Convert a web page or pasted HTML into a clean PDF.",
		category: "convert",
		icon: "html",
		tint: "orange",
		accept: HTML,
		minFiles: 0,
		maxFiles: 4,
		multiple: true,
		cta: "Convert to PDF",
		hint: "Paste a URL, drop an HTML file, or paste markup.",
		done: "HTML has been converted to PDF!"
	},
	{
		id: "scan-to-pdf",
		title: "Scan to PDF",
		blurb: "Capture photos or scans and turn them into a multi-page PDF.",
		category: "convert",
		icon: "scan",
		tint: "teal",
		accept: IMAGES,
		minFiles: 1,
		maxFiles: 24,
		multiple: true,
		cta: "Create PDF",
		hint: "Use the camera on a phone or upload existing scans.",
		done: "Scan has been saved as a PDF!"
	},
	{
		id: "edit-pdf",
		title: "Edit PDF",
		blurb: "Add text, images, shapes and notes. Rewrite lines right on the page.",
		category: "edit",
		icon: "edit",
		tint: "red",
		accept: ANY_DOC,
		minFiles: 1,
		maxFiles: 1,
		multiple: false,
		cta: "Open editor",
		hint: "Opens the full editor so you can change text and mark up pages.",
		done: "Document is open in the editor."
	},
	{
		id: "pdf-forms",
		title: "PDF Forms",
		blurb: "Click the page to add fillable text fields, then download the form.",
		category: "edit",
		icon: "forms",
		tint: "blue",
		accept: PDF,
		minFiles: 1,
		maxFiles: 1,
		multiple: false,
		cta: "Create form",
		hint: "Click where a field should go, name it, then download a fillable PDF.",
		done: "Fillable PDF is ready!"
	},
	{
		id: "watermark",
		title: "Watermark",
		blurb: "Stamp an image or text over your PDF. Choose opacity and position.",
		category: "edit",
		icon: "watermark",
		tint: "rose",
		accept: PDF,
		minFiles: 1,
		maxFiles: 6,
		multiple: true,
		cta: "Add watermark",
		hint: "A diagonal text stamp is applied to every page.",
		done: "Watermark has been added!"
	},
	{
		id: "page-numbers",
		title: "Page numbers",
		blurb: "Add page numbers with control over position and format.",
		category: "edit",
		icon: "numbers",
		tint: "slate",
		accept: PDF,
		minFiles: 1,
		maxFiles: 6,
		multiple: true,
		cta: "Add page numbers",
		hint: "Numbers are drawn on every page, then baked into the file.",
		done: "Page numbers have been added!"
	},
	{
		id: "crop-pdf",
		title: "Crop PDF",
		blurb: "Trim margins or focus on a region across the whole document.",
		category: "edit",
		icon: "crop",
		tint: "teal",
		accept: PDF,
		minFiles: 1,
		maxFiles: 1,
		multiple: false,
		cta: "Crop PDF",
		hint: "Set margins as a percent of the page, then apply to all pages.",
		done: "PDF has been cropped!"
	},
	{
		id: "redact-pdf",
		title: "Redact PDF",
		blurb: "Permanently black out matching text so it cannot be copied.",
		category: "security",
		icon: "redact",
		tint: "slate",
		accept: PDF,
		minFiles: 1,
		maxFiles: 1,
		multiple: false,
		cta: "Redact PDF",
		hint: "Every match of your search is covered with a black box and removed.",
		done: "Text has been redacted!"
	},
	{
		id: "sign-pdf",
		title: "Sign PDF",
		blurb: "Draw or type a signature and place it on the document.",
		category: "security",
		icon: "sign",
		tint: "navy",
		accept: PDF,
		minFiles: 1,
		maxFiles: 1,
		multiple: false,
		cta: "Sign PDF",
		hint: "Draw a signature, then we stamp it on the last page or every page.",
		done: "PDF has been signed!"
	},
	{
		id: "protect-pdf",
		title: "Protect PDF",
		blurb: "Encrypt a PDF with a password so only people you choose can open it.",
		category: "security",
		icon: "protect",
		tint: "blue",
		accept: PDF,
		minFiles: 1,
		maxFiles: 6,
		multiple: true,
		cta: "Protect PDF",
		hint: "Uses AES-256. Recipients will be asked for the password to open it.",
		done: "PDF has been protected!"
	},
	{
		id: "unlock-pdf",
		title: "Unlock PDF",
		blurb: "Remove PDF password security so you can use the file freely.",
		category: "security",
		icon: "unlock",
		tint: "orange",
		accept: PDF,
		minFiles: 1,
		maxFiles: 6,
		multiple: true,
		cta: "Unlock PDF",
		hint: "Enter the current password. The downloaded file opens without one.",
		done: "PDF has been unlocked!"
	},
	{
		id: "compare-pdf",
		title: "Compare PDF",
		blurb: "See two versions side by side and spot what changed.",
		category: "security",
		icon: "compare",
		tint: "blue",
		accept: PDF,
		minFiles: 2,
		maxFiles: 2,
		multiple: true,
		cta: "Compare PDFs",
		hint: "Upload two PDFs. We build a side-by-side comparison file.",
		done: "Comparison PDF is ready!"
	},
	{
		id: "ocr-pdf",
		title: "OCR PDF",
		blurb: "Extract selectable text and save a searchable copy of your PDF.",
		category: "ai",
		icon: "ocr",
		tint: "green",
		accept: PDF,
		minFiles: 1,
		maxFiles: 2,
		multiple: false,
		cta: "Extract text",
		hint: "Reads the text layer. Scanned-only files will be flagged.",
		done: "Searchable PDF is ready!"
	},
	{
		id: "summarize-pdf",
		title: "AI Summarizer",
		blurb: "Get a concise summary of articles, reports and essays in seconds.",
		category: "ai",
		icon: "summary",
		tint: "rose",
		accept: PDF,
		minFiles: 1,
		maxFiles: 1,
		multiple: false,
		cta: "Summarize",
		hint: "We read the document and write a short briefing you can download.",
		done: "Summary is ready!"
	},
	{
		id: "translate-pdf",
		title: "Translate PDF",
		blurb: "Translate the text of a PDF while keeping a clean, readable layout.",
		category: "ai",
		icon: "translate",
		tint: "navy",
		accept: PDF,
		minFiles: 1,
		maxFiles: 1,
		multiple: false,
		cta: "Translate",
		hint: "Pick a language. The result is a new PDF you can share.",
		done: "Translated PDF is ready!"
	}
];
function getTool(id) {
	return TOOLS.find((t) => t.id === id);
}
function toolsIn(category) {
	if (category === "all") return TOOLS;
	return TOOLS.filter((t) => t.category === category);
}
function searchTools(query) {
	const q = query.trim().toLowerCase();
	if (!q) return TOOLS;
	const words = q.split(/\s+/).filter(Boolean);
	return TOOLS.filter((t) => {
		const hay = `${t.title} ${t.id.replace(/-/g, " ")} ${t.cta} ${t.blurb} ${t.category}`.toLowerCase();
		return words.every((w) => {
			const escaped = w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
			return new RegExp(`(^|[^a-z0-9])${escaped}`, "i").test(hay);
		});
	});
}
function categoryLabel(id) {
	return CATEGORIES.find((c) => c.id === id)?.label ?? id;
}
function pickNoun(tool) {
	if (tool.id === "convert-any") return "a PDF, Word, PowerPoint, Excel, image or text file";
	if (tool.id === "jpg-to-pdf" || tool.id === "scan-to-pdf") return tool.multiple ? "images" : "an image";
	if (tool.id === "word-to-pdf") return tool.multiple ? "Word files" : "a Word file";
	if (tool.id === "powerpoint-to-pdf") return tool.multiple ? "PowerPoint files" : "a PowerPoint file";
	if (tool.id === "excel-to-pdf") return tool.multiple ? "Excel files" : "an Excel file";
	if (tool.id === "html-to-pdf") return "HTML, a URL, or paste markup";
	if (tool.multiple) return "PDF files";
	return "a PDF file";
}
function continueTools(fromId, resultName) {
	const ext = resultName.split(".").pop()?.toLowerCase() ?? "";
	let ids = [];
	if (ext === "pdf") ids = [
		"compress-pdf",
		"pdf-to-word",
		"pdf-to-jpg",
		"protect-pdf",
		"watermark",
		"edit-pdf",
		"sign-pdf"
	];
	else if (ext === "docx") ids = ["word-to-pdf", "edit-pdf"];
	else if (ext === "pptx") ids = ["powerpoint-to-pdf"];
	else if (ext === "xlsx") ids = ["excel-to-pdf"];
	else if (ext === "jpg" || ext === "jpeg" || ext === "png") ids = ["jpg-to-pdf", "edit-pdf"];
	else if (ext === "txt" || ext === "md" || ext === "html") ids = ["html-to-pdf", "edit-pdf"];
	else if (ext === "zip") ids = ["merge-pdf"];
	return ids.filter((id) => id !== fromId).map((id) => getTool(id)).filter((t) => !!t).slice(0, 6);
}
function FolioLogo({ compact = false }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to: "/",
		className: "inline-flex items-center gap-2 text-fg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "grid size-8 place-items-center rounded-md bg-accent text-accent-fg",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FolioMark, { className: "size-4" })
		}), !compact && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "text-[1.2rem] font-extrabold tracking-tight",
			children: ["Folio", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-accent",
				children: "PDF"
			})]
		})]
	});
}
function SiteHeader() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
		className: "sticky top-0 z-30 border-b border-border bg-surface/95 backdrop-blur-sm",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto flex h-14 w-full max-w-6xl items-center gap-3 px-4 md:h-16 md:px-8",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FolioLogo, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuTrigger, {
					className: "ml-1 inline-flex h-10 items-center gap-1 rounded-md px-2 text-sm font-bold text-fg hover:bg-raised",
					children: ["All PDF tools", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "size-4 text-muted" })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuContent, {
					align: "start",
					className: "w-[min(920px,calc(100vw-24px))] max-h-[min(70vh,640px)] overflow-auto p-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid gap-5 sm:grid-cols-2 lg:grid-cols-3",
						children: CATEGORIES.filter((c) => c.id !== "all").map((cat) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mb-2 text-[11px] font-extrabold tracking-wide text-muted uppercase",
							children: cat.label
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "flex flex-col gap-0.5",
							children: toolsIn(cat.id).map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/tools/$toolId",
								params: { toolId: t.id },
								className: "flex items-center gap-2 rounded-md px-1.5 py-1.5 text-sm hover:bg-raised",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToolGlyph, {
									icon: t.icon,
									tint: t.tint,
									size: "sm"
								}), t.title]
							}) }, t.id))
						})] }, cat.id))
					})
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "ml-auto hidden text-sm font-semibold text-muted md:block",
					children: "Files stay on this device"
				})
			]
		})
	});
}
function SiteFooter() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
		className: "mt-16 bg-footer text-footer-fg",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 md:grid-cols-4 md:px-8",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "md:col-span-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "inline-flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "grid size-8 place-items-center rounded-md bg-accent text-accent-fg",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FolioMark, { className: "size-4" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-[1.2rem] font-extrabold tracking-tight",
							children: ["Folio", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-accent",
								children: "PDF"
							})]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 max-w-sm text-sm leading-relaxed text-footer-muted",
						children: "Every PDF tool in one place. Merge, split, compress, convert, edit, protect and share — processed in your browser, not on a server."
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] font-extrabold tracking-wide text-footer-muted uppercase",
					children: "Product"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "mt-3 space-y-2 text-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/",
							className: "hover:text-accent",
							children: "All tools"
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/tools/$toolId",
							params: { toolId: "edit-pdf" },
							className: "hover:text-accent",
							children: "PDF editor"
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/tools/$toolId",
							params: { toolId: "merge-pdf" },
							className: "hover:text-accent",
							children: "Merge PDF"
						}) })
					]
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] font-extrabold tracking-wide text-footer-muted uppercase",
					children: "Popular"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-3 space-y-2 text-sm",
					children: TOOLS.slice(0, 5).map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/tools/$toolId",
						params: { toolId: t.id },
						className: "hover:text-accent",
						children: t.title
					}) }, t.id))
				})] })
			]
		})
	});
}
function AppShell({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh bg-bg text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, {}),
			children,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFooter, {})
		]
	});
}
var stash = null;
function stashFiles(files) {
	stash = files.map((f) => ({
		...f,
		bytes: f.bytes.slice(0)
	}));
}
function takeStash() {
	const next = stash;
	stash = null;
	return next;
}
async function jobFromBlob(name, blob) {
	return {
		id: `stash_${Date.now().toString(36)}`,
		name,
		bytes: await blob.arrayBuffer(),
		mime: blob.type || guessMime(name)
	};
}
function guessMime(name) {
	const ext = name.split(".").pop()?.toLowerCase();
	if (ext === "pdf") return "application/pdf";
	if (ext === "png") return "image/png";
	if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
	if (ext === "docx") return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
	if (ext === "pptx") return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
	if (ext === "xlsx") return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
	if (ext === "txt") return "text/plain";
	if (ext === "md") return "text/markdown";
	if (ext === "html" || ext === "htm") return "text/html";
	return "application/octet-stream";
}
var PDF_ACTIONS = [
	"edit-pdf",
	"merge-pdf",
	"split-pdf",
	"compress-pdf",
	"pdf-to-word",
	"pdf-to-powerpoint",
	"pdf-to-excel",
	"pdf-to-jpg",
	"rotate-pdf",
	"organize-pdf",
	"remove-pages",
	"sign-pdf",
	"watermark",
	"page-numbers",
	"protect-pdf",
	"unlock-pdf",
	"crop-pdf",
	"redact-pdf",
	"pdf-forms",
	"convert-any",
	"ocr-pdf",
	"summarize-pdf"
];
function UploadHub() {
	const inputRef = (0, import_react.useRef)(null);
	const [dragging, setDragging] = (0, import_react.useState)(false);
	const [files, setFiles] = (0, import_react.useState)([]);
	async function take(list) {
		const next = [];
		for (const f of Array.from(list).slice(0, 12)) {
			if (f.size > 41943040) {
				toast.error(`${f.name} is larger than 40 MB`);
				continue;
			}
			next.push({
				id: uid("f"),
				name: f.name,
				bytes: await f.arrayBuffer(),
				mime: f.type || "application/octet-stream"
			});
		}
		if (next.length) setFiles(next);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto mt-8 w-full max-w-3xl text-left",
		"data-tint": "red",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			ref: inputRef,
			type: "file",
			className: "hidden",
			multiple: true,
			accept: "application/pdf,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.csv,image/*,.html,.htm,.txt,.md",
			onChange: (e) => {
				if (e.target.files?.length) take(e.target.files);
				e.target.value = "";
			}
		}), files.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			"data-active": dragging,
			className: "drop-zone flex cursor-pointer flex-col items-center px-6 py-10 text-center",
			onClick: () => inputRef.current?.click(),
			onDragOver: (e) => {
				e.preventDefault();
				setDragging(true);
			},
			onDragLeave: () => setDragging(false),
			onDrop: (e) => {
				e.preventDefault();
				setDragging(false);
				if (e.dataTransfer.files.length) take(e.dataTransfer.files);
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "grid size-14 place-items-center rounded-full bg-accent text-accent-fg",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CloudUpload, { className: "size-7" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 text-xl font-extrabold",
					children: "Upload a PDF"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 max-w-md text-sm text-muted",
					children: "Drop any PDF, Word, PowerPoint, Excel or image. Then pick Edit, Merge, Compress, Convert and the rest."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "mt-5 inline-flex h-12 items-center rounded-md bg-accent px-6 text-base font-extrabold text-accent-fg",
					children: "Select files"
				})
			]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-xl bg-surface p-4 shadow-[var(--shadow-paper)] md:p-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm font-extrabold",
							children: [
								files.length,
								" ",
								files.length === 1 ? "file" : "files",
								" ready"
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-1 space-y-0.5",
							children: files.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "truncate text-sm text-muted",
								children: [
									f.name,
									" · ",
									formatBytes(f.bytes.byteLength)
								]
							}, f.id))
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "grid size-9 shrink-0 place-items-center rounded-md bg-raised text-muted",
						"aria-label": "Clear files",
						onClick: () => setFiles([]),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 text-sm font-extrabold",
					children: "What do you want to do?"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileActions, { files }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "mt-3 text-sm font-bold text-accent",
					onClick: () => inputRef.current?.click(),
					children: "Add another file"
				})
			]
		})]
	});
}
function FileActions({ files, except }) {
	const navigate = useNavigate();
	const ids = (files.some((f) => f.mime.includes("pdf") || f.name.toLowerCase().endsWith(".pdf")) ? PDF_ACTIONS : [
		"edit-pdf",
		"convert-any",
		"word-to-pdf",
		"powerpoint-to-pdf",
		"excel-to-pdf",
		"jpg-to-pdf"
	]).filter((id) => id !== except);
	function open(id) {
		const tool = getTool(id);
		if (!tool) return;
		stashFiles(files.slice(0, tool.maxFiles));
		navigate({
			to: "/tools/$toolId",
			params: { toolId: id }
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4",
		children: ids.map((id) => {
			const tool = getTool(id);
			if (!tool) return null;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				className: "tool-card min-h-0 items-center gap-2 py-3 text-left",
				onClick: () => open(id),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToolGlyph, {
					icon: tool.icon,
					tint: tool.tint,
					size: "sm"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-sm font-extrabold",
					children: tool.title
				})]
			}, id);
		})
	});
}
//#endregion
export { ToolGlyph as a, continueTools as c, pickNoun as d, searchTools as f, toolsIn as h, TOOLS as i, getTool as l, takeStash as m, CATEGORIES as n, UploadHub as o, stashFiles as p, FileActions as r, categoryLabel as s, AppShell as t, jobFromBlob as u };
