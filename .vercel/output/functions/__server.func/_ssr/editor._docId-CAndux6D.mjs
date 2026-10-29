import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { b as useNavigate, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { $ as Download, A as Mail, B as Highlighter, C as Plus, D as MousePointer2, E as PanelLeft, H as Heading1, L as Italic, N as List, O as Minus, P as Link2, V as Heading2, _ as Search, at as ChevronRight, c as Type, f as StickyNote, ft as ArrowLeft, g as Share2, i as X, m as Square, n as ZoomOut, o as Undo2, ot as ChevronLeft, p as Stamp, s as Underline, t as ZoomIn, u as Trash2, ut as Bold, w as PenTool, x as Redo2, z as ImagePlus } from "../_libs/lucide-react.mjs";
import { a as DialogOverlay$1, i as DialogDescription$1, n as DialogClose, o as DialogPortal$1, r as DialogContent$1, s as DialogTitle$1, t as Dialog$1 } from "../_libs/@radix-ui/react-dialog+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as TooltipContent, c as cn, d as stemOf, f as uid, i as Tooltip, l as downloadBlob, o as TooltipTrigger, r as Route$1, s as asArrayBuffer } from "./router-BNe88wCr.mjs";
import { n as PDFDocument } from "../_libs/pdf-lib.mjs";
import { A as renderPageToCanvas, C as mergePdfs, D as pagePlainText, E as packFolio, F as useFolio, I as xlsxFromSheets, M as sheetsFromXlsx, O as pdfFromImages, P as textOfDoc, S as mdToHtml, T as openPdfJs, a as MARK_COLORS, b as htmlToMd, c as Textarea, d as canvasToPng, g as emptySlide, h as docxFromHtml, i as Input, j as shareBlob, k as pptxFromSlides, l as bakePdf, m as defaultPages, n as EXPORT_FORMATS, o as STAMPS, p as csvFromSheet, r as INK_COLORS, s as Slider, t as Button, u as canvasToJpeg, v as extractPageText, w as mimeFor, x as htmlToPdfBytes } from "./share-B2fXwJXl.mjs";
import { a as DropdownMenuTrigger, i as DropdownMenuSeparator, n as DropdownMenuContent, r as DropdownMenuItem, s as FolioWordmark, t as DropdownMenu } from "./mark-CWKMxwFg.mjs";
import { i as Viewport, n as Scrollbar, r as Thumb, t as Root } from "../_libs/radix-ui__react-scroll-area.mjs";
import { t as Root$1 } from "../_libs/radix-ui__react-separator.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/editor._docId-CAndux6D.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ScrollArea({ className, children, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Root, {
		className: cn("relative overflow-hidden", className),
		...props,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Viewport, {
			className: "h-full w-full rounded-[inherit]",
			children
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scrollbar, {
			orientation: "vertical",
			className: "flex w-2 touch-none p-px select-none",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Thumb, { className: "relative flex-1 rounded-full bg-border" })
		})]
	});
}
function Separator({ className, orientation = "horizontal", decorative = true, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Root$1, {
		decorative,
		orientation,
		className: cn("shrink-0 bg-border", orientation === "horizontal" ? "h-px w-full" : "h-full w-px", className),
		...props
	});
}
var Sheet = Dialog$1;
function SheetContent({ className, children, side = "right", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal$1, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay$1, { className: "fixed inset-0 z-50 bg-bg/60 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent$1, {
		className: cn("fixed z-50 bg-surface text-fg shadow-[var(--shadow-pop)] outline-none data-[state=open]:animate-in data-[state=closed]:animate-out", side === "right" && "inset-y-0 right-0 h-full w-[min(360px,100vw)] data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right", side === "left" && "inset-y-0 left-0 h-full w-[min(360px,100vw)] data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left", side === "bottom" && "inset-x-0 bottom-0 max-h-[80vh] rounded-t-xl data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom", className),
		...props,
		children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogClose, {
			className: "absolute top-3 right-3 size-9 inline-flex items-center justify-center rounded-md text-muted hover:bg-raised hover:text-fg",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "sr-only",
				children: "Close"
			})]
		})]
	})] });
}
function PdfStage({ doc, onRequestSign, pendingImage, onConsumedImage }) {
	const canvasRef = (0, import_react.useRef)(null);
	const wrapRef = (0, import_react.useRef)(null);
	const [pdf, setPdf] = (0, import_react.useState)(null);
	const [size, setSize] = (0, import_react.useState)({
		w: 612,
		h: 792
	});
	const [items, setItems] = (0, import_react.useState)([]);
	const [error, setError] = (0, import_react.useState)(null);
	const [draft, setDraft] = (0, import_react.useState)(null);
	const [ink, setInk] = (0, import_react.useState)(null);
	const drag = (0, import_react.useRef)(null);
	const pageIndex = useFolio((s) => s.pageIndex);
	const zoom = useFolio((s) => s.zoom);
	const tool = useFolio((s) => s.tool);
	const color = useFolio((s) => s.color);
	const strokeWidth = useFolio((s) => s.strokeWidth);
	const fontSize = useFolio((s) => s.fontSize);
	const stamp = useFolio((s) => s.stamp);
	const selectedId = useFolio((s) => s.selectedId);
	const addAnnot = useFolio((s) => s.addAnnot);
	const updateAnnot = useFolio((s) => s.updateAnnot);
	const removeAnnot = useFolio((s) => s.removeAnnot);
	const select = useFolio((s) => s.select);
	const setTool = useFolio((s) => s.setTool);
	const pageMeta = doc.pages[pageIndex];
	const pageAnnots = doc.annotations.filter((a) => a.page === pageIndex);
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		setError(null);
		(async () => {
			try {
				const loaded = await openPdfJs(doc.bytes);
				if (cancelled) {
					loaded.cleanup();
					return;
				}
				setPdf((prev) => {
					prev?.cleanup();
					return loaded;
				});
			} catch (err) {
				if (!cancelled) setError(err instanceof Error ? err.message : "Could not open PDF");
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [doc.id, doc.bytes]);
	(0, import_react.useEffect)(() => {
		if (!pdf || !canvasRef.current || !pageMeta) return;
		let cancelled = false;
		(async () => {
			try {
				const page = await pdf.getPage(pageMeta.source + 1);
				if (cancelled) return;
				const { width, height } = await renderPageToCanvas(page, canvasRef.current, zoom, pageMeta.rotation);
				if (cancelled) return;
				setSize({
					w: width,
					h: height
				});
				const base = page.getViewport({
					scale: zoom,
					rotation: pageMeta.rotation
				});
				const text = await extractPageText(page, base.width, base.height, base.transform);
				if (!cancelled) setItems(text);
			} catch (err) {
				if (!cancelled) setError(err instanceof Error ? err.message : "Render failed");
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [
		pdf,
		pageMeta,
		zoom,
		pageIndex
	]);
	function norm(e) {
		const r = wrapRef.current.getBoundingClientRect();
		return {
			x: (e.clientX - r.left) / r.width,
			y: (e.clientY - r.top) / r.height
		};
	}
	function hit(p) {
		for (let i = pageAnnots.length - 1; i >= 0; i--) {
			const a = pageAnnots[i];
			if ("x" in a && "w" in a) {
				const x = Math.min(a.x, a.x + a.w);
				const y = Math.min(a.y, a.y + a.h);
				const w = Math.abs(a.w);
				const h = Math.abs(a.h);
				if (p.x >= x && p.x <= x + w && p.y >= y && p.y <= y + h) return a;
			}
		}
		return null;
	}
	function onPointerDown(e) {
		if (!wrapRef.current) return;
		const p = norm(e);
		if (tool === "select") {
			const a = hit(p);
			if (a && "x" in a) {
				select(a.id);
				drag.current = {
					mode: "move",
					sx: p.x,
					sy: p.y,
					id: a.id,
					orig: a
				};
				wrapRef.current.setPointerCapture(e.pointerId);
			} else select(null);
			return;
		}
		if (tool === "text") {
			addAnnot({
				id: uid("a"),
				page: pageIndex,
				type: "text",
				x: p.x,
				y: p.y,
				w: .32,
				h: .05,
				text: "New text",
				color: "#1c1917",
				fontSize
			});
			return;
		}
		if (tool === "note") {
			const text = window.prompt("Comment");
			if (text) addAnnot({
				id: uid("a"),
				page: pageIndex,
				type: "note",
				x: p.x,
				y: p.y,
				text,
				color: "#f2d56b"
			});
			return;
		}
		if (tool === "stamp") {
			addAnnot({
				id: uid("a"),
				page: pageIndex,
				type: "stamp",
				x: p.x - .12,
				y: p.y - .04,
				w: .24,
				h: .08,
				stamp,
				color: "#c45c4a"
			});
			return;
		}
		if (tool === "sign") {
			if (pendingImage) {
				addAnnot({
					id: uid("a"),
					page: pageIndex,
					type: "sign",
					x: p.x - .14,
					y: p.y - .05,
					w: .28,
					h: .1,
					src: pendingImage
				});
				onConsumedImage();
				setTool("select");
			} else onRequestSign();
			return;
		}
		if (tool === "image") {
			if (pendingImage) {
				addAnnot({
					id: uid("a"),
					page: pageIndex,
					type: "image",
					x: p.x - .15,
					y: p.y - .1,
					w: .3,
					h: .2,
					src: pendingImage
				});
				onConsumedImage();
				setTool("select");
			}
			return;
		}
		if (tool === "pen") {
			setInk([p]);
			drag.current = {
				mode: "draw",
				sx: p.x,
				sy: p.y
			};
			wrapRef.current.setPointerCapture(e.pointerId);
			return;
		}
		drag.current = {
			mode: "draw",
			sx: p.x,
			sy: p.y
		};
		setDraft({
			x: p.x,
			y: p.y,
			w: 0,
			h: 0
		});
		wrapRef.current.setPointerCapture(e.pointerId);
	}
	function onPointerMove(e) {
		const p = norm(e);
		const d = drag.current;
		if (!d) return;
		if (d.mode === "move" && d.id && d.orig && "x" in d.orig) {
			const dx = p.x - d.sx;
			const dy = p.y - d.sy;
			updateAnnot(d.id, {
				x: d.orig.x + dx,
				y: d.orig.y + dy
			});
			return;
		}
		if (tool === "pen" && ink) {
			setInk([...ink, p]);
			return;
		}
		if (draft) setDraft({
			x: d.sx,
			y: d.sy,
			w: p.x - d.sx,
			h: p.y - d.sy
		});
	}
	function onPointerUp() {
		drag.current;
		drag.current = null;
		if (tool === "pen" && ink && ink.length > 1) addAnnot({
			id: uid("a"),
			page: pageIndex,
			type: "pen",
			points: ink,
			color,
			strokeWidth
		});
		setInk(null);
		if (draft && Math.abs(draft.w) > .008 && Math.abs(draft.h) > .008) {
			const x = Math.min(draft.x, draft.x + draft.w);
			const y = Math.min(draft.y, draft.y + draft.h);
			const w = Math.abs(draft.w);
			const h = Math.abs(draft.h);
			if (tool === "highlight" || tool === "underline" || tool === "strike" || tool === "redact") addAnnot({
				id: uid("a"),
				page: pageIndex,
				type: tool,
				x,
				y,
				w,
				h,
				color: tool === "redact" ? "#0b0c0e" : color
			});
			else if (tool === "rect" || tool === "ellipse") addAnnot({
				id: uid("a"),
				page: pageIndex,
				type: tool,
				x,
				y,
				w,
				h,
				color,
				fill: false,
				strokeWidth
			});
			else if (tool === "line" || tool === "arrow") addAnnot({
				id: uid("a"),
				page: pageIndex,
				type: tool,
				x: draft.x,
				y: draft.y,
				w: draft.w,
				h: draft.h,
				color,
				strokeWidth
			});
		}
		setDraft(null);
	}
	const selected = pageAnnots.find((a) => a.id === selectedId);
	const lines = (0, import_react.useMemo)(() => groupLines(items), [items]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-0 flex-1 flex-col items-center overflow-auto p-4 md:p-8",
		children: [
			tool === "text" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-3 max-w-lg rounded-lg bg-surface px-3 py-2 text-center text-xs leading-relaxed text-muted shadow-[var(--shadow-paper)]",
				children: "Click a line and type to rewrite it. Download saves the new words into the PDF."
			}),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "m-auto max-w-md rounded-lg bg-surface p-6 text-sm text-muted shadow-[0_0_0_1px_var(--color-border)]",
				children: [error, ". If the file is password-protected, export an unlocked copy and try again."]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				ref: wrapRef,
				className: cn("relative shrink-0 shadow-[var(--shadow-paper)]", tool === "select" ? "cursor-default" : tool === "text" ? "cursor-text" : "cursor-crosshair"),
				style: {
					width: size.w,
					height: size.h
				},
				onPointerDown,
				onPointerMove,
				onPointerUp,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
						ref: canvasRef,
						className: "block bg-paper"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "pointer-events-none absolute inset-0",
						children: lines.map((line) => {
							const repl = pageAnnots.find((a) => a.type === "replace" && covers(a, line));
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LineEdit, {
								line,
								text: repl && repl.type === "replace" ? repl.text : line.text,
								replaced: !!repl,
								editable: tool === "text",
								onCommit: (next) => {
									if (repl && repl.type === "replace") {
										if (next !== repl.text) updateAnnot(repl.id, { text: next });
										return;
									}
									if (next === line.text) return;
									addAnnot({
										id: uid("a"),
										page: pageIndex,
										type: "replace",
										x: line.nx,
										y: line.ny,
										w: Math.max(line.nw, .04),
										h: line.nh,
										text: next,
										fontSize: Math.max(8, line.fontSize / zoom),
										color: "#1c1917"
									});
								}
							}, line.id);
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
						className: "absolute inset-0 h-full w-full",
						viewBox: "0 0 1 1",
						preserveAspectRatio: "none",
						children: [
							pageAnnots.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnnotShape, {
								a,
								selected: a.id === selectedId
							}, a.id)),
							draft && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
								x: Math.min(draft.x, draft.x + draft.w),
								y: Math.min(draft.y, draft.y + draft.h),
								width: Math.abs(draft.w),
								height: Math.abs(draft.h),
								fill: tool === "highlight" ? color : "none",
								fillOpacity: tool === "highlight" ? .35 : 0,
								stroke: color,
								strokeWidth: .004
							}),
							ink && ink.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("polyline", {
								points: ink.map((p) => `${p.x},${p.y}`).join(" "),
								fill: "none",
								stroke: color,
								strokeWidth: .006,
								strokeLinecap: "round",
								strokeLinejoin: "round"
							})
						]
					}),
					pageAnnots.filter((a) => a.type === "text").map((a) => a.type === "text" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
						className: cn("absolute resize-none bg-transparent p-1 text-ink outline-none", selectedId === a.id && "ring-1 ring-accent"),
						style: {
							left: `${a.x * 100}%`,
							top: `${a.y * 100}%`,
							width: `${a.w * 100}%`,
							height: `${a.h * 100}%`,
							fontSize: a.fontSize * zoom * .85,
							color: a.color,
							fontWeight: a.bold ? 600 : 400,
							fontStyle: a.italic ? "italic" : "normal",
							textAlign: a.align
						},
						value: a.text,
						onPointerDown: (e) => {
							e.stopPropagation();
							select(a.id);
						},
						onChange: (e) => updateAnnot(a.id, { text: e.target.value })
					}, a.id) : null),
					selected && "w" in selected && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "absolute z-10 rounded-md bg-surface px-2 py-1 text-[11px] text-fg shadow-[var(--shadow-pop)]",
						style: {
							left: `${Math.min(selected.x, selected.x + selected.w) * 100}%`,
							top: `${Math.min(selected.y, selected.y + selected.h) * 100 - 4}%`,
							transform: "translateY(-110%)"
						},
						onPointerDown: (e) => e.stopPropagation(),
						onClick: () => removeAnnot(selected.id),
						children: "Delete"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "sr-only",
				children: STAMPS[0].label
			})
		]
	});
}
function AnnotShape({ a, selected }) {
	const stroke = selected ? "#c5c9d1" : void 0;
	if (a.type === "highlight" || a.type === "redact") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
		x: a.x,
		y: a.y,
		width: a.w,
		height: a.h,
		fill: a.type === "redact" ? "#0b0c0e" : a.color,
		fillOpacity: a.type === "redact" ? 1 : .38,
		stroke,
		strokeWidth: selected ? .004 : 0
	});
	if (a.type === "underline" || a.type === "strike") {
		const y = a.type === "underline" ? a.y + a.h * .85 : a.y + a.h * .5;
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
			x1: a.x,
			y1: y,
			x2: a.x + a.w,
			y2: y,
			stroke: a.color,
			strokeWidth: .006
		});
	}
	if (a.type === "rect") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
		x: a.x,
		y: a.y,
		width: a.w,
		height: a.h,
		fill: a.fill ? a.color : "none",
		fillOpacity: a.fill ? .18 : 0,
		stroke: a.color,
		strokeWidth: .006
	});
	if (a.type === "ellipse") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
		cx: a.x + a.w / 2,
		cy: a.y + a.h / 2,
		rx: Math.abs(a.w) / 2,
		ry: Math.abs(a.h) / 2,
		fill: a.fill ? a.color : "none",
		fillOpacity: a.fill ? .18 : 0,
		stroke: a.color,
		strokeWidth: .006
	});
	if (a.type === "line" || a.type === "arrow") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
		x1: a.x,
		y1: a.y,
		x2: a.x + a.w,
		y2: a.y + a.h,
		stroke: a.color,
		strokeWidth: .006,
		markerEnd: a.type === "arrow" ? "url(#arr)" : void 0
	});
	if (a.type === "pen") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("polyline", {
		points: a.points.map((p) => `${p.x},${p.y}`).join(" "),
		fill: "none",
		stroke: a.color,
		strokeWidth: .005 * a.strokeWidth,
		strokeLinecap: "round",
		strokeLinejoin: "round"
	});
	if (a.type === "stamp") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
		x: a.x,
		y: a.y,
		width: a.w,
		height: a.h,
		fill: "none",
		stroke: a.color,
		strokeWidth: .01
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
		x: a.x + a.w / 2,
		y: a.y + a.h / 2,
		fill: a.color,
		fontSize: .035,
		textAnchor: "middle",
		dominantBaseline: "middle",
		children: a.stamp.toUpperCase()
	})] });
	if (a.type === "image" || a.type === "sign") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("image", {
		href: a.src,
		x: a.x,
		y: a.y,
		width: a.w,
		height: a.h,
		preserveAspectRatio: "xMidYMid meet"
	});
	if (a.type === "note") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("g", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
		x: a.x,
		y: a.y,
		width: .04,
		height: .04,
		fill: "#f2d56b"
	}) });
	if (a.type === "replace") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
		x: a.x,
		y: a.y,
		width: a.w,
		height: a.h,
		fill: "#f3eee4"
	});
	return null;
}
function groupLines(items) {
	if (!items.length) return [];
	const sample = items.find((it) => it.nw > .002) ?? items[0];
	const vw = sample.nw > .002 ? sample.width / sample.nw : 1;
	const vh = sample.nh > .002 ? sample.height / sample.nh : 1;
	const sorted = [...items].sort((a, b) => a.top - b.top || a.left - b.left);
	const lines = [];
	for (const it of sorted) {
		const last = lines[lines.length - 1];
		const same = last && Math.abs(last.top + last.height / 2 - (it.top + it.height / 2)) < Math.max(3, it.fontSize * .45);
		if (last && same) {
			if (it.left > last.right + 1.2 && !last.text.endsWith(" ") && !it.str.startsWith(" ")) last.text += " ";
			last.text += it.str;
			last.right = Math.max(last.right, it.left + it.width);
			last.width = Math.max(8, last.right - last.left);
			last.height = Math.max(last.height, it.height, it.fontSize);
			last.fontSize = Math.max(last.fontSize, it.fontSize);
			continue;
		}
		lines.push({
			id: `ln_${lines.length}_${Math.round(it.left)}_${Math.round(it.top)}`,
			left: it.left,
			top: it.top,
			width: Math.max(it.width, 8),
			height: Math.max(it.height, it.fontSize, 10),
			fontSize: it.fontSize || 12,
			text: it.str,
			right: it.left + Math.max(it.width, 8),
			nx: 0,
			ny: 0,
			nw: 0,
			nh: 0
		});
	}
	return lines.map((l) => ({
		id: l.id,
		left: l.left,
		top: l.top,
		width: l.width,
		height: l.height,
		fontSize: l.fontSize,
		text: l.text,
		nx: l.left / vw,
		ny: l.top / vh,
		nw: l.width / vw,
		nh: l.height / vh
	}));
}
function covers(a, line) {
	if (a.type !== "replace") return false;
	const cx = line.nx + line.nw / 2;
	const cy = line.ny + line.nh / 2;
	return cx >= a.x - .012 && cx <= a.x + a.w + .012 && cy >= a.y - .012 && cy <= a.y + a.h + .012;
}
function LineEdit({ line, text, replaced, editable, onCommit }) {
	const ref = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const el = ref.current;
		if (!el || document.activeElement === el) return;
		if (el.textContent !== text) el.textContent = text;
	}, [text]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		ref,
		className: cn("text-layer-item", editable && "pointer-events-auto is-live", replaced && "is-replaced"),
		contentEditable: editable,
		suppressContentEditableWarning: true,
		spellCheck: false,
		style: {
			left: line.left,
			top: line.top,
			fontSize: line.fontSize,
			width: Math.max(line.width, 12),
			minHeight: line.height
		},
		onPointerDown: (e) => {
			if (editable) e.stopPropagation();
		},
		onBlur: (e) => onCommit(e.currentTarget.textContent ?? "")
	});
}
var PDF_TOOLS = [
	{
		id: "select",
		label: "Select"
	},
	{
		id: "text",
		label: "Text"
	},
	{
		id: "highlight",
		label: "Highlight"
	},
	{
		id: "underline",
		label: "Underline"
	},
	{
		id: "strike",
		label: "Strike"
	},
	{
		id: "pen",
		label: "Pen"
	},
	{
		id: "rect",
		label: "Rectangle"
	},
	{
		id: "ellipse",
		label: "Ellipse"
	},
	{
		id: "line",
		label: "Line"
	},
	{
		id: "arrow",
		label: "Arrow"
	},
	{
		id: "image",
		label: "Image"
	},
	{
		id: "sign",
		label: "Sign"
	},
	{
		id: "stamp",
		label: "Stamp"
	},
	{
		id: "note",
		label: "Note"
	},
	{
		id: "redact",
		label: "Redact"
	}
];
function RichDocEditor({ doc }) {
	const ref = (0, import_react.useRef)(null);
	const patchCurrent = useFolio((s) => s.patchCurrent);
	(0, import_react.useEffect)(() => {
		if (ref.current && doc.html && ref.current.innerHTML !== doc.html) ref.current.innerHTML = doc.html;
	}, [doc.id]);
	function cmd(command, value) {
		document.execCommand(command, false, value);
		persist();
	}
	function persist() {
		if (!ref.current) return;
		patchCurrent({ html: ref.current.innerHTML });
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex w-full max-w-[820px] flex-col gap-3 px-3 py-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "sticky top-2 z-10 flex flex-wrap gap-1 rounded-lg bg-surface/95 p-1 shadow-[0_0_0_1px_var(--color-border)] backdrop-blur-sm",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
					onClick: () => cmd("bold"),
					label: "Bold",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bold, {})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
					onClick: () => cmd("italic"),
					label: "Italic",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Italic, {})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
					onClick: () => cmd("underline"),
					label: "Underline",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Underline, {})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
					onClick: () => cmd("formatBlock", "h1"),
					label: "Heading",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heading1, {})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
					onClick: () => cmd("formatBlock", "h2"),
					label: "Subhead",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heading2, {})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
					onClick: () => cmd("insertUnorderedList"),
					label: "List",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(List, {})
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			ref,
			className: "folio-prose paper-grain min-h-[70vh] rounded-xl px-8 py-10 text-ink shadow-[var(--shadow-paper)] outline-none md:px-14",
			contentEditable: true,
			suppressContentEditableWarning: true,
			onInput: persist,
			onBlur: persist,
			role: "textbox",
			"aria-label": "Document"
		})]
	});
}
function IconBtn({ children, onClick, label }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
		type: "button",
		size: "tool",
		variant: "ghost",
		onClick,
		"aria-label": label,
		title: label,
		children
	});
}
function SlideEditor({ doc }) {
	const slides = doc.slides ?? [];
	const pageIndex = useFolio((s) => s.pageIndex);
	const setPage = useFolio((s) => s.setPage);
	const patchCurrent = useFolio((s) => s.patchCurrent);
	const slide = slides[pageIndex] ?? slides[0];
	function update(patch) {
		if (!slide) return;
		const next = slides.map((s, i) => i === pageIndex ? {
			...s,
			...patch
		} : s);
		patchCurrent({
			slides: next,
			pages: doc.pages
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full min-h-0",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
			className: "hidden w-44 shrink-0 border-r border-border md:block",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-2 p-3",
				children: [slides.map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => setPage(i),
					className: cn("rounded-md px-2 py-3 text-left text-xs shadow-[0_0_0_1px_var(--color-border)]", i === pageIndex ? "bg-accent text-accent-fg" : "bg-raised text-muted hover:text-fg"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-[10px] opacity-70",
						children: i + 1
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "truncate font-medium",
						children: s.title || "Slide"
					})]
				}, s.id)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					variant: "ghost",
					onClick: () => {
						const next = [...slides, emptySlide()];
						patchCurrent({
							slides: next,
							pages: [...doc.pages, {
								id: `pg_${next.length}`,
								source: next.length - 1,
								rotation: 0
							}]
						});
						setPage(next.length - 1);
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-3.5" }), " Slide"]
				})]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex min-w-0 flex-1 items-start justify-center overflow-auto p-4 md:p-8",
			children: slide && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex aspect-video w-full max-w-4xl flex-col gap-4 rounded-xl p-8 text-ink shadow-[var(--shadow-paper)] md:p-12",
				style: { background: slide.bg || "#f3eee4" },
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						className: "h-auto border-0 bg-transparent px-0 font-display text-3xl text-ink shadow-none md:text-4xl",
						value: slide.title,
						onChange: (e) => update({ title: e.target.value })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						className: "min-h-40 flex-1 resize-none bg-transparent text-base text-ink-soft shadow-none",
						value: slide.body,
						onChange: (e) => update({ body: e.target.value })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-xs text-ink-soft",
							children: [
								pageIndex + 1,
								" / ",
								slides.length
							]
						}), slides.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "ghost",
							className: "text-ink-soft",
							onClick: () => {
								const next = slides.filter((_, i) => i !== pageIndex);
								patchCurrent({
									slides: next,
									pages: doc.pages.filter((_, i) => i !== pageIndex)
								});
								setPage(Math.max(0, pageIndex - 1));
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-3.5" }), " Remove"]
						})]
					})
				]
			})
		})]
	});
}
function SheetEditor({ doc }) {
	const tab = doc.sheets?.[0];
	const patchCurrent = useFolio((s) => s.patchCurrent);
	if (!tab) return null;
	const sheet = tab;
	function setCell(r, c, value) {
		const rows = sheet.rows.map((row, ri) => ri === r ? row.map((cell, ci) => ci === c ? value : cell) : row);
		patchCurrent({ sheets: [{
			...sheet,
			rows
		}] });
	}
	const cols = Math.max(8, ...tab.rows.map((r) => r.length));
	const letters = Array.from({ length: cols }, (_, i) => String.fromCharCode(65 + i));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "h-full overflow-auto p-3 md:p-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "inline-block min-w-full rounded-lg bg-surface shadow-[0_0_0_1px_var(--color-border)]",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "border-collapse text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { className: "w-10 bg-raised px-2 py-1 text-[11px] text-subtle" }), letters.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
					className: "bg-raised px-2 py-1 text-[11px] font-medium text-muted",
					children: l
				}, l))] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: tab.rows.map((row, r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
					className: "bg-raised px-2 py-1 text-center text-[11px] text-subtle",
					children: r + 1
				}), Array.from({ length: cols }, (_, c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
					className: "min-w-28 border border-border p-0",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "h-8 w-full bg-transparent px-2 text-fg outline-none focus:bg-raised",
						value: row[c] ?? "",
						onChange: (e) => setCell(r, c, e.target.value)
					})
				}, c))] }, r)) })]
			})
		})
	});
}
function MarkdownEditor({ doc }) {
	const patchCurrent = useFolio((s) => s.patchCurrent);
	const { mdToHtml } = requireMd();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid h-full min-h-0 grid-cols-1 md:grid-cols-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
			className: "h-full min-h-[60vh] resize-none rounded-none bg-bg font-mono text-sm",
			value: doc.text ?? "",
			onChange: (e) => {
				const text = e.target.value;
				patchCurrent({
					text,
					html: mdToHtml(text)
				});
			}
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "folio-prose hidden overflow-auto bg-paper px-8 py-8 text-ink md:block",
			dangerouslySetInnerHTML: { __html: doc.html || "<p></p>" }
		})]
	});
}
function requireMd() {
	return { mdToHtml: (md) => {
		return md.replace(/&/g, "&").replace(/</g, "<").replace(/>/g, ">").split("\n").map((line) => {
			if (/^### /.test(line)) return `<h3>${line.slice(4)}</h3>`;
			if (/^## /.test(line)) return `<h2>${line.slice(3)}</h2>`;
			if (/^# /.test(line)) return `<h1>${line.slice(2)}</h1>`;
			if (/^[-*] /.test(line)) return `<li>${line.slice(2)}</li>`;
			if (!line.trim()) return "<p></p>";
			return `<p>${line.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\*(.+?)\*/g, "<em>$1</em>")}</p>`;
		}).join("");
	} };
}
var Dialog = Dialog$1;
var DialogPortal = DialogPortal$1;
function DialogOverlay({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay$1, {
		className: cn("fixed inset-0 z-50 bg-bg/70 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className),
		...props
	});
}
function DialogContent({ className, children, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent$1, {
		className: cn("fixed top-1/2 left-1/2 z-50 w-[min(560px,calc(100vw-24px))] -translate-x-1/2 -translate-y-1/2 rounded-xl bg-surface p-5 text-fg shadow-[var(--shadow-pop)] outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-[0.96] data-[state=open]:zoom-in-[0.96]", className),
		...props,
		children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogClose, {
			className: "absolute top-3.5 right-3.5 size-9 inline-flex items-center justify-center rounded-md text-muted hover:bg-raised hover:text-fg",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "sr-only",
				children: "Close"
			})]
		})]
	})] });
}
function DialogHeader({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("mb-4 space-y-1 pr-8", className),
		...props
	});
}
function DialogTitle({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle$1, {
		className: cn("font-display text-xl font-medium tracking-tight", className),
		...props
	});
}
function DialogDescription({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription$1, {
		className: cn("text-sm text-muted", className),
		...props
	});
}
async function convertDoc(doc, format) {
	const filename = `${stemOf(doc.name) || "document"}.${format === "jpg" ? "jpg" : format}`;
	return {
		blob: await toBlob(doc, format),
		filename
	};
}
async function toBlob(doc, format) {
	switch (format) {
		case "pdf": return new Blob([await toPdf(doc)], { type: mimeFor("pdf") });
		case "docx": return docxFromHtml(await toHtml(doc), stemOf(doc.name));
		case "pptx": return pptxFromSlides(await toSlides(doc), stemOf(doc.name));
		case "xlsx": return xlsxFromSheets(await toSheets(doc));
		case "csv": return new Blob([csvFromSheet((await toSheets(doc))[0])], { type: mimeFor("csv") });
		case "txt": return new Blob([await toText(doc)], { type: mimeFor("txt") });
		case "md": return new Blob([await toMd(doc)], { type: mimeFor("md") });
		case "html": return new Blob([wrapHtml(await toHtml(doc), stemOf(doc.name))], { type: mimeFor("html") });
		case "png": return toImage(doc, "png");
		case "jpg": return toImage(doc, "jpg");
	}
}
async function toPdf(doc) {
	if (doc.kind === "pdf") return bakePdf(doc);
	if (doc.kind === "image") {
		const mime = guessImageMime(doc.name);
		return pdfFromImages([{
			bytes: doc.bytes,
			mime
		}]);
	}
	if (doc.html) return htmlToPdfBytes(doc.html);
	if (doc.slides) {
		const html = doc.slides.map((s) => `<section style="page-break-after:always;padding:48px 32px"><h1>${esc(s.title)}</h1><p>${esc(s.body).replace(/\n/g, "<br/>")}</p></section>`).join("");
		return htmlToPdfBytes(html);
	}
	if (doc.sheets) {
		const html = doc.sheets.map((s) => {
			const rows = s.rows.map((r) => `<tr>${r.map((c) => `<td style="border:1px solid #d6d0c6;padding:6px 8px">${esc(c)}</td>`).join("")}</tr>`).join("");
			return `<h2>${esc(s.name)}</h2><table style="border-collapse:collapse;width:100%">${rows}</table>`;
		}).join("");
		return htmlToPdfBytes(html);
	}
	return htmlToPdfBytes(`<pre>${esc(textOfDoc(doc))}</pre>`);
}
async function toHtml(doc) {
	if (doc.html) return doc.html;
	if (doc.kind === "md" && doc.text) return mdToHtml(doc.text);
	if (doc.slides) return doc.slides.map((s) => `<h1>${esc(s.title)}</h1><p>${esc(s.body).replace(/\n/g, "<br/>")}</p>`).join("");
	if (doc.kind === "pdf") return (await extractPdfText(doc)).split("\n\n").map((p) => `<p>${esc(p).replace(/\n/g, "<br/>")}</p>`).join("");
	return `<p>${esc(textOfDoc(doc)).replace(/\n/g, "<br/>")}</p>`;
}
async function toText(doc) {
	if (doc.kind === "pdf") return extractPdfText(doc);
	return textOfDoc(doc);
}
async function toMd(doc) {
	if (doc.kind === "md" && doc.text) return doc.text;
	if (doc.html) return htmlToMd(doc.html);
	return await toText(doc);
}
async function toSlides(doc) {
	if (doc.slides?.length) return doc.slides;
	const chunks = (await toText(doc)).split(/\n{2,}/).filter(Boolean);
	if (!chunks.length) return [{
		id: "s1",
		title: stemOf(doc.name),
		body: "",
		notes: "",
		bg: "#f3eee4"
	}];
	return chunks.slice(0, 24).map((c, i) => {
		const [title, ...rest] = c.split("\n");
		return {
			id: `s${i}`,
			title: title.slice(0, 80),
			body: rest.join("\n") || c,
			notes: "",
			bg: "#f3eee4"
		};
	});
}
async function toSheets(doc) {
	if (doc.sheets?.length) return doc.sheets;
	if (doc.kind === "xlsx" || doc.kind === "csv") try {
		return await sheetsFromXlsx(doc.bytes);
	} catch {}
	return [{
		name: "Sheet1",
		rows: (await toText(doc)).split("\n").map((line) => {
			const cells = line.split(/\t|,/).map((c) => c.trim());
			while (cells.length < 8) cells.push("");
			return cells;
		})
	}];
}
async function extractPdfText(doc) {
	const pdf = await openPdfJs(doc.bytes);
	const parts = [];
	for (let i = 1; i <= pdf.numPages; i++) {
		const page = await pdf.getPage(i);
		parts.push(await pagePlainText(page));
	}
	await pdf.cleanup();
	return parts.join("\n\n");
}
async function toImage(doc, kind) {
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
	} else if (doc.slides?.[0]) await drawSlide(canvas, doc.slides[0].title, doc.slides[0].body);
	else await drawSlide(canvas, stemOf(doc.name), (await toText(doc)).slice(0, 800));
	return kind === "png" ? canvasToPng(canvas) : canvasToJpeg(canvas, .9);
}
function drawUrl(canvas, url) {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => {
			canvas.width = img.naturalWidth;
			canvas.height = img.naturalHeight;
			const ctx = canvas.getContext("2d");
			if (!ctx) return reject(/* @__PURE__ */ new Error("canvas"));
			ctx.drawImage(img, 0, 0);
			resolve();
		};
		img.onerror = () => reject(/* @__PURE__ */ new Error("image"));
		img.src = url;
	});
}
async function drawSlide(canvas, title, body) {
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
function wrapFill(ctx, text, x, y, maxW, lh) {
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
function wrapHtml(body, title) {
	return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(title)}</title>
  <style>body{font:16px/1.55 IBM Plex Sans,sans-serif;color:#1c1917;background:#f3eee4;margin:48px auto;max-width:720px;padding:0 24px}h1{font-family:Fraunces,Georgia,serif}</style>
  </head><body>${body}</body></html>`;
}
function esc(s) {
	return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function guessImageMime(name) {
	const ext = name.split(".").pop()?.toLowerCase();
	if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
	if (ext === "webp") return "image/webp";
	if (ext === "gif") return "image/gif";
	return "image/png";
}
function ConvertDialog({ open, onOpenChange, doc }) {
	const [target, setTarget] = (0, import_react.useState)("pdf");
	const [busy, setBusy] = (0, import_react.useState)(false);
	async function run(mode) {
		if (!doc) return;
		setBusy(true);
		try {
			const { blob, filename } = await convertDoc(doc, target);
			if (mode === "share") {
				const result = await shareBlob(blob, filename, doc.name);
				if (result === "shared") toast.success("Shared");
				else if (result === "downloaded") toast.success("Saved to downloads");
			} else {
				downloadBlob(blob, filename);
				toast.success(`Exported ${filename}`);
			}
			onOpenChange(false);
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Convert failed");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Convert" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: doc ? `Turn ${doc.name} into another format. Conversion happens on this device.` : "Open a file first." })] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-2 gap-2 sm:grid-cols-5",
				children: EXPORT_FORMATS.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => setTarget(f.id),
					className: cn("rounded-lg px-2 py-3 text-left shadow-[0_0_0_1px_var(--color-border)] transition-[background-color,box-shadow] duration-150", target === f.id ? "bg-accent text-accent-fg" : "bg-raised text-fg hover:bg-raised/80"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-sm font-medium",
						children: f.label
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: cn("text-[11px]", target === f.id ? "text-accent-fg/70" : "text-muted"),
						children: f.hint
					})]
				}, f.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 flex flex-wrap justify-end gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						onClick: () => onOpenChange(false),
						children: "Cancel"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						disabled: !doc || busy,
						onClick: () => run("share"),
						children: "Share"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						disabled: !doc || busy,
						onClick: () => run("download"),
						children: busy ? "Working…" : "Download"
					})
				]
			})
		] })
	});
}
function ShareDialog({ open, onOpenChange, doc }) {
	const [busy, setBusy] = (0, import_react.useState)(false);
	if (!doc) return null;
	const file = doc;
	async function asPdf() {
		setBusy(true);
		try {
			const { blob, filename } = await convertDoc(file, "pdf");
			return {
				blob,
				filename
			};
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, { children: ["Share ", doc.name] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Files stay on this device until you download or hand them to the system share sheet." })] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "secondary",
						className: "justify-start",
						disabled: busy,
						onClick: async () => {
							const { blob, filename } = await asPdf();
							await shareBlob(blob, filename, doc.name);
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Share2, {}), " System share"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "secondary",
						className: "justify-start",
						disabled: busy,
						onClick: async () => {
							const { blob, filename } = await asPdf();
							downloadBlob(blob, filename);
							toast.success("Downloaded PDF");
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, {}), " Download PDF"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "secondary",
						className: "justify-start",
						onClick: () => {
							const blob = packFolio(doc);
							downloadBlob(blob, `${doc.name.replace(/\.[^.]+$/, "")}.folio.json`);
							toast.success("Folio pack saved");
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, {}), " Download Folio pack"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "secondary",
						className: "justify-start",
						onClick: async () => {
							const text = textOfDoc(doc) || doc.name;
							await navigator.clipboard.writeText(text);
							toast.success("Copied text");
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link2, {}), " Copy text"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "secondary",
						className: "justify-start",
						disabled: busy,
						onClick: async () => {
							const { filename } = await asPdf();
							const subject = encodeURIComponent(doc.name);
							const body = encodeURIComponent(`Sharing ${filename} from Folio. Download the file from the studio and attach it here.`);
							window.location.href = `mailto:?subject=${subject}&body=${body}`;
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, {}), " Email link"]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
					className: "mb-1 block text-xs text-muted",
					children: "Filename"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: doc.name,
					readOnly: true
				})]
			})
		] })
	});
}
function SignatureDialog({ open, onOpenChange, onSign }) {
	const canvasRef = (0, import_react.useRef)(null);
	const drawing = (0, import_react.useRef)(false);
	const [mode, setMode] = (0, import_react.useState)("draw");
	const [typed, setTyped] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		if (!open) return;
		const c = canvasRef.current;
		if (!c) return;
		const ctx = c.getContext("2d");
		if (!ctx) return;
		const dpr = window.devicePixelRatio || 1;
		c.width = 520 * dpr;
		c.height = 180 * dpr;
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		ctx.fillStyle = "#f3eee4";
		ctx.fillRect(0, 0, 520, 180);
		ctx.strokeStyle = "#1c1917";
		ctx.lineWidth = 2.2;
		ctx.lineCap = "round";
		ctx.lineJoin = "round";
	}, [open, mode]);
	function pos(e) {
		const r = e.currentTarget.getBoundingClientRect();
		return {
			x: e.clientX - r.left,
			y: e.clientY - r.top
		};
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Signature" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Draw or type a signature, then place it on the page." })] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-3 flex gap-2",
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
				className: "h-[180px] w-full touch-none rounded-lg paper-grain",
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
				}
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					placeholder: "Your name",
					value: typed,
					onChange: (e) => setTyped(e.target.value)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "paper-grain flex h-[120px] items-center justify-center rounded-lg px-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-display text-3xl text-ink italic",
						children: typed || "Signature"
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex justify-end gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					onClick: () => {
						setTyped("");
						const c = canvasRef.current;
						const ctx = c?.getContext("2d");
						if (c && ctx) {
							ctx.fillStyle = "#f3eee4";
							ctx.fillRect(0, 0, c.width, c.height);
						}
					},
					children: "Clear"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: () => {
						if (mode === "type") {
							const c = document.createElement("canvas");
							c.width = 640;
							c.height = 200;
							const ctx = c.getContext("2d");
							if (!ctx) return;
							ctx.fillStyle = "transparent";
							ctx.clearRect(0, 0, 640, 200);
							ctx.fillStyle = "#1c1917";
							ctx.font = "italic 64px Fraunces, Georgia, serif";
							ctx.fillText(typed || "Signature", 24, 120);
							onSign(c.toDataURL("image/png"));
						} else {
							const c = canvasRef.current;
							if (!c) return;
							onSign(c.toDataURL("image/png"));
						}
						onOpenChange(false);
					},
					children: "Place on page"
				})]
			})
		] })
	});
}
var ICONS = {
	select: MousePointer2,
	text: Type,
	highlight: Highlighter,
	underline: Highlighter,
	strike: Highlighter,
	pen: PenTool,
	rect: Square,
	ellipse: Square,
	line: Minus,
	arrow: Minus,
	image: ImagePlus,
	sign: PenTool,
	stamp: Stamp,
	note: StickyNote,
	redact: Square
};
function EditorShell({ docId }) {
	const navigate = useNavigate();
	const current = useFolio((s) => s.current);
	const openId = useFolio((s) => s.openId);
	const saveCurrent = useFolio((s) => s.saveCurrent);
	const hydrate = useFolio((s) => s.hydrate);
	const [ready, setReady] = (0, import_react.useState)(false);
	const [missing, setMissing] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		let live = true;
		(async () => {
			await hydrate();
			const doc = await openId(docId);
			if (!live) return;
			if (!doc) setMissing(true);
			setReady(true);
		})();
		return () => {
			live = false;
		};
	}, [
		docId,
		hydrate,
		openId
	]);
	(0, import_react.useEffect)(() => {
		const t = window.setInterval(() => {
			saveCurrent();
		}, 8e3);
		return () => window.clearInterval(t);
	}, [saveCurrent]);
	(0, import_react.useEffect)(() => {
		function onKey(e) {
			const meta = e.metaKey || e.ctrlKey;
			const st = useFolio.getState();
			if (meta && e.key.toLowerCase() === "s") {
				e.preventDefault();
				st.saveCurrent();
				toast.success("Saved on this device");
			}
			if (meta && e.key.toLowerCase() === "z") {
				e.preventDefault();
				if (e.shiftKey) st.redo();
				else st.undo();
			}
			if (meta && e.key.toLowerCase() === "f") {
				e.preventDefault();
				document.getElementById("folio-find")?.focus();
			}
			if (e.key === "Delete" || e.key === "Backspace") {
				const tag = e.target.tagName;
				if (["INPUT", "TEXTAREA"].includes(tag) || e.target.isContentEditable) return;
				if (st.selectedId) st.removeAnnot(st.selectedId);
			}
			if (meta) return;
			const tag = e.target.tagName;
			if (["INPUT", "TEXTAREA"].includes(tag) || e.target.isContentEditable) return;
			if (e.key === "v") st.setTool("select");
			if (e.key === "t") st.setTool("text");
			if (e.key === "h") st.setTool("highlight");
			if (e.key === "p") st.setTool("pen");
		}
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, []);
	if (!ready) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid min-h-dvh place-items-center bg-bg text-muted",
		children: "Opening document…"
	});
	if (missing || !current) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid min-h-dvh place-items-center bg-bg px-6 text-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-display text-2xl",
			children: "This file is not on this device."
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/",
			className: "mt-4 inline-block text-sm text-muted underline",
			children: "Back to tools"
		})] })
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EditorChrome, { onHome: () => {
		saveCurrent();
		navigate({ to: "/" });
	} });
}
function EditorChrome({ onHome }) {
	const doc = useFolio((s) => s.current);
	const tool = useFolio((s) => s.tool);
	const setTool = useFolio((s) => s.setTool);
	const color = useFolio((s) => s.color);
	const setColor = useFolio((s) => s.setColor);
	const zoom = useFolio((s) => s.zoom);
	const setZoom = useFolio((s) => s.setZoom);
	const pageIndex = useFolio((s) => s.pageIndex);
	const setPage = useFolio((s) => s.setPage);
	const rename = useFolio((s) => s.rename);
	const undo = useFolio((s) => s.undo);
	const redo = useFolio((s) => s.redo);
	const patchCurrent = useFolio((s) => s.patchCurrent);
	const saveCurrent = useFolio((s) => s.saveCurrent);
	const strokeWidth = useFolio((s) => s.strokeWidth);
	const setStroke = useFolio((s) => s.setStroke);
	const [convertOpen, setConvertOpen] = (0, import_react.useState)(false);
	const [shareOpen, setShareOpen] = (0, import_react.useState)(false);
	const [signOpen, setSignOpen] = (0, import_react.useState)(false);
	const [pendingImage, setPendingImage] = (0, import_react.useState)(null);
	const [pagesOpen, setPagesOpen] = (0, import_react.useState)(false);
	const [propsOpen, setPropsOpen] = (0, import_react.useState)(false);
	const [find, setFind] = (0, import_react.useState)("");
	const imageRef = (0, import_react.useRef)(null);
	const mergeRef = (0, import_react.useRef)(null);
	const paginated = doc.kind === "pdf" || doc.kind === "image";
	async function downloadPdf() {
		try {
			const { blob, filename } = await convertDoc(doc, "pdf");
			downloadBlob(blob, filename);
			toast.success("Downloaded");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Export failed");
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-dvh flex-col bg-bg pb-20 text-fg md:pb-0",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex h-12 shrink-0 items-center gap-2 border-b border-border px-2 md:px-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "icon",
						variant: "ghost",
						onClick: onHome,
						"aria-label": "All tools",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, {})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "hidden md:block",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FolioWordmark, { compact: true })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						className: "h-8 max-w-56 bg-transparent text-sm shadow-none md:max-w-xs",
						value: doc.name,
						onChange: (e) => rename(e.target.value),
						"aria-label": "Filename"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "ml-auto flex items-center gap-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "icon",
								variant: "ghost",
								onClick: undo,
								"aria-label": "Undo",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Undo2, {})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "icon",
								variant: "ghost",
								onClick: redo,
								"aria-label": "Redo",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Redo2, {})
							}),
							paginated && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "icon",
									variant: "ghost",
									onClick: () => setPage(Math.max(0, pageIndex - 1)),
									"aria-label": "Previous page",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, {})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "hidden min-w-14 text-center text-xs tabular-nums text-muted md:inline",
									children: [
										pageIndex + 1,
										" / ",
										doc.pages.length
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "icon",
									variant: "ghost",
									onClick: () => setPage(Math.min(doc.pages.length - 1, pageIndex + 1)),
									"aria-label": "Next page",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, {})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "icon",
									variant: "ghost",
									onClick: () => setZoom(zoom - .1),
									"aria-label": "Zoom out",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ZoomOut, {})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "icon",
									variant: "ghost",
									onClick: () => setZoom(zoom + .1),
									"aria-label": "Zoom in",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ZoomIn, {})
								})
							] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "ghost",
								className: "hidden md:inline-flex",
								onClick: () => setConvertOpen(true),
								children: "Convert"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "icon",
								variant: "ghost",
								onClick: () => setShareOpen(true),
								"aria-label": "Share",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Share2, {})
							}),
							paginated && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: propsOpen ? "secondary" : "ghost",
								className: "hidden md:inline-flex",
								onClick: () => setPropsOpen((v) => !v),
								children: "Options"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								onClick: () => void downloadPdf(),
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, {}),
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "hidden sm:inline",
										children: "Download"
									})
								]
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-h-0 flex-1",
				children: [
					paginated && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
						className: "hidden w-12 shrink-0 flex-col items-center gap-1 border-r border-border py-2 md:flex",
						children: [
							PDF_TOOLS.filter((t) => [
								"select",
								"text",
								"highlight",
								"pen",
								"rect",
								"image",
								"sign",
								"stamp",
								"note",
								"redact"
							].includes(t.id)).map((t) => {
								const Icon = ICONS[t.id];
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
									asChild: true,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "tool",
										variant: tool === t.id ? "default" : "ghost",
										"aria-label": t.label,
										onClick: () => {
											if (t.id === "image") imageRef.current?.click();
											else if (t.id === "sign") setSignOpen(true);
											setTool(t.id);
										},
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {})
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipContent, {
									side: "right",
									children: t.label
								})] }, t.id);
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator, { className: "my-1 w-6" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex flex-col gap-1.5",
								children: MARK_COLORS.slice(0, 5).map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									"aria-label": c.label,
									onClick: () => setColor(c.value),
									className: cn("size-4 rounded-full", color === c.value && "ring-2 ring-accent ring-offset-1 ring-offset-bg"),
									style: { background: c.value }
								}, c.id))
							})
						]
					}),
					paginated && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
						className: "hidden w-[140px] shrink-0 border-r border-border md:block",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageRail, {})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
						className: "studio-grid relative min-w-0 flex-1 overflow-hidden",
						children: [
							doc.kind === "pdf" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PdfStage, {
								doc,
								pendingImage,
								onConsumedImage: () => setPendingImage(null),
								onRequestSign: () => setSignOpen(true)
							}),
							doc.kind === "image" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImageStage, {
								srcBytes: doc.bytes,
								name: doc.name
							}),
							(doc.kind === "docx" || doc.kind === "html" || doc.kind === "txt" || doc.kind === "rtf") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
								className: "h-full",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RichDocEditor, { doc })
							}),
							doc.kind === "md" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarkdownEditor, { doc }),
							doc.kind === "pptx" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SlideEditor, { doc }),
							(doc.kind === "xlsx" || doc.kind === "csv") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetEditor, { doc })
						]
					}),
					paginated && propsOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
						className: "hidden w-56 shrink-0 border-l border-border p-3 md:block",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mb-3 text-[11px] font-medium tracking-wide text-muted uppercase",
							children: "Page"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-3 text-sm",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "flex items-center justify-between text-muted",
									children: ["Page numbers", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "checkbox",
										checked: !!doc.pageNumbers,
										onChange: (e) => patchCurrent({ pageNumbers: e.target.checked }, false)
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									className: "mb-1 block text-xs text-muted",
									children: "Watermark"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									placeholder: "CONFIDENTIAL",
									value: doc.watermark?.text ?? "",
									onChange: (e) => patchCurrent({ watermark: {
										text: e.target.value,
										opacity: doc.watermark?.opacity ?? .16
									} })
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										className: "mb-1 block text-xs text-muted",
										children: "Find in page"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "relative",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute top-2.5 left-2 size-3.5 text-subtle" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											id: "folio-find",
											className: "pl-7",
											value: find,
											onChange: (e) => setFind(e.target.value),
											placeholder: "Search text"
										})]
									}),
									find && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-[11px] text-muted",
										children: "Matches are in the live text layer. Choose Text and edit a hit directly."
									})
								] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "secondary",
									size: "sm",
									className: "w-full",
									onClick: () => mergeRef.current?.click(),
									children: "Merge PDF"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
									asChild: true,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "secondary",
										size: "sm",
										className: "w-full",
										children: "Stamp"
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuContent, { children: STAMPS.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
									onClick: () => {
										useFolio.setState({
											stamp: s.id,
											tool: "stamp"
										});
									},
									children: s.label
								}, s.id)) })] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[11px] text-subtle",
									children: "Ink width"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
									min: 1,
									max: 8,
									step: .5,
									value: [strokeWidth],
									onValueChange: (v) => setStroke(v[0] ?? 2)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex flex-wrap gap-1",
									children: INK_COLORS.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: "size-5 rounded-full",
										style: { background: c },
										onClick: () => setColor(c),
										"aria-label": c
									}, c))
								})
							]
						})]
					})
				]
			}),
			paginated && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "fixed inset-x-0 bottom-16 z-20 flex items-center gap-1 overflow-x-auto border-t border-border bg-surface p-2 md:hidden",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "icon",
						variant: "ghost",
						onClick: () => setPagesOpen(true),
						"aria-label": "Pages",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelLeft, {})
					}),
					[
						"select",
						"text",
						"highlight",
						"pen",
						"rect",
						"image",
						"sign",
						"stamp",
						"note",
						"redact"
					].map((t) => {
						const Icon = ICONS[t];
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "icon",
							variant: tool === t ? "default" : "ghost",
							onClick: () => {
								if (t === "image") imageRef.current?.click();
								else if (t === "sign") setSignOpen(true);
								setTool(t);
							},
							"aria-label": t,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {})
						}, t);
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "ghost",
						className: "ml-auto",
						onClick: () => setConvertOpen(true),
						children: "Convert"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sheet, {
				open: pagesOpen,
				onOpenChange: setPagesOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetContent, {
					side: "left",
					className: "p-0 pt-10",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageRail, {})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConvertDialog, {
				open: convertOpen,
				onOpenChange: setConvertOpen,
				doc
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShareDialog, {
				open: shareOpen,
				onOpenChange: setShareOpen,
				doc
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SignatureDialog, {
				open: signOpen,
				onOpenChange: setSignOpen,
				onSign: (src) => {
					setPendingImage(src);
					setTool("sign");
					toast.message("Tap the page to place the signature");
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				ref: imageRef,
				type: "file",
				accept: "image/*",
				className: "hidden",
				onChange: (e) => {
					const f = e.target.files?.[0];
					if (!f) return;
					const reader = new FileReader();
					reader.onload = () => {
						setPendingImage(String(reader.result));
						setTool("image");
						toast.message("Tap the page to place the image");
					};
					reader.readAsDataURL(f);
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				ref: mergeRef,
				type: "file",
				accept: "application/pdf",
				multiple: true,
				className: "hidden",
				onChange: async (e) => {
					const files = e.target.files;
					if (!files?.length) return;
					try {
						const buffers = [doc.bytes, ...await Promise.all(Array.from(files).map((f) => f.arrayBuffer()))];
						const merged = await mergePdfs(buffers);
						const copy = asArrayBuffer(merged);
						const loaded = await PDFDocument.load(merged);
						patchCurrent({
							bytes: copy,
							pages: defaultPages(loaded.getPageCount())
						});
						await saveCurrent();
						toast.success("Merged");
					} catch (err) {
						toast.error(err instanceof Error ? err.message : "Merge failed");
					}
				}
			})
		]
	});
}
function PageRail() {
	const doc = useFolio((s) => s.current);
	const pageIndex = useFolio((s) => s.pageIndex);
	const setPage = useFolio((s) => s.setPage);
	const rotatePage = useFolio((s) => s.rotatePage);
	const deletePage = useFolio((s) => s.deletePage);
	const duplicatePage = useFolio((s) => s.duplicatePage);
	const insertBlankPage = useFolio((s) => s.insertBlankPage);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
		className: "h-full",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-2 p-3",
			children: [doc.pages.map((p, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: () => setPage(i),
				className: cn("rounded-md px-2 py-3 text-left text-xs shadow-[0_0_0_1px_var(--color-border)]", i === pageIndex ? "bg-accent text-accent-fg" : "bg-raised text-muted hover:text-fg"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "font-medium",
					children: ["Page ", i + 1]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "opacity-70",
					children: [p.rotation, "°"]
				})]
			}, p.id)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					variant: "ghost",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-3.5" }), " Page"]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
					onClick: () => void insertBlankPage(pageIndex),
					children: "Insert blank"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
					onClick: () => duplicatePage(pageIndex),
					children: "Duplicate"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
					onClick: () => rotatePage(pageIndex),
					children: "Rotate 90°"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
					onClick: () => deletePage(pageIndex),
					children: "Delete page"
				})
			] })] })]
		})
	});
}
function ImageStage({ srcBytes, name }) {
	const [url, setUrl] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		const u = URL.createObjectURL(new Blob([srcBytes]));
		setUrl(u);
		return () => URL.revokeObjectURL(u);
	}, [srcBytes]);
	if (!url) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid h-full place-items-center overflow-auto p-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
			src: url,
			alt: name,
			className: "max-h-full max-w-full rounded-md shadow-[var(--shadow-paper)] outline outline-1 -outline-offset-1 outline-black/10"
		})
	});
}
function EditorPage() {
	const { docId } = Route$1.useParams();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EditorShell, { docId });
}
//#endregion
export { EditorPage as component };
