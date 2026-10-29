import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { _ as Search, h as Shield, j as Lock, r as Zap } from "../_libs/lucide-react.mjs";
import { a as ToolGlyph, f as searchTools, h as toolsIn, n as CATEGORIES, o as UploadHub, t as AppShell } from "./upload-hub-BUJiPHo4.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-DLaifWsc.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function HomeStudio() {
	const [category, setCategory] = (0, import_react.useState)("all");
	const [query, setQuery] = (0, import_react.useState)("");
	const searching = query.trim().length > 0;
	const list = (0, import_react.useMemo)(() => {
		return searching ? searchTools(query) : toolsIn(category);
	}, [
		category,
		query,
		searching
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "bg-surface",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto w-full max-w-6xl px-4 py-10 text-center md:px-8 md:py-16",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mx-auto max-w-3xl text-[clamp(1.9rem,5.4vw,3.15rem)] font-extrabold leading-[1.12] tracking-[-0.035em]",
						children: "Every tool you need to work with PDFs, at your fingertips"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-muted md:text-lg",
						children: "Upload a PDF and pick what to do — edit the text, merge, split, compress, convert, sign or protect. It all runs in your browser."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UploadHub, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "relative mx-auto mt-8 block max-w-xl text-left",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-subtle" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: "search-field",
							placeholder: "Search 30+ tools — merge, Word, compress, sign…",
							value: query,
							onChange: (e) => setQuery(e.target.value),
							"aria-label": "Search PDF tools"
						})]
					})
				]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mx-auto w-full max-w-6xl px-4 md:px-8",
			children: [
				!searching && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex gap-1 overflow-x-auto border-b border-border",
					children: CATEGORIES.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setCategory(c.id),
						"data-active": category === c.id,
						className: "cat-tab",
						children: c.label
					}, c.id))
				}),
				searching && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-5 mb-2 text-sm text-muted",
					children: [
						list.length,
						" ",
						list.length === 1 ? "tool" : "tools",
						" for “",
						query.trim(),
						"”"
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4",
					children: list.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "col-span-full rounded-xl bg-raised px-4 py-10 text-center text-sm text-muted",
						children: "No tools match that search. Try “merge”, “Word”, or “sign”."
					}) : list.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToolCard, { tool: t }, t.id))
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mx-auto mt-16 w-full max-w-6xl px-4 md:px-8",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-center text-xl font-extrabold tracking-tight md:text-2xl",
				children: "How it works"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-8 grid gap-4 md:grid-cols-3",
				children: [
					{
						step: "1",
						title: "Select a file",
						body: "Drop a PDF, Word file, deck, sheet or image. Or tap Try with a sample — no file needed."
					},
					{
						step: "2",
						title: "Work the magic",
						body: "We merge, convert, compress, sign or edit right in your browser. Nothing is uploaded."
					},
					{
						step: "3",
						title: "Download or share",
						body: "Preview the result, save it to your device, or open it in the editor to keep going."
					}
				].map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-xl bg-surface p-5 shadow-[var(--shadow-paper)]",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "grid size-8 place-items-center rounded-full bg-accent text-sm font-extrabold text-accent-fg",
							children: s.step
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "mt-3 font-bold",
							children: s.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm leading-relaxed text-muted",
							children: s.body
						})
					]
				}, s.step))
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "mx-auto mt-14 w-full max-w-6xl px-4 pb-8 md:px-8",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 rounded-xl bg-raised p-6 md:grid-cols-3 md:p-8",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trust, {
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "size-5" }),
						title: "Private by default",
						body: "Your documents are processed locally. Nothing is sent to a server unless you use an AI tool."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trust, {
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zap, { className: "size-5" }),
						title: "Fast, no account",
						body: "Open a tool and go. No sign-in, no watermarks we add, no daily limit on the basics."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trust, {
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "size-5" }),
						title: "Real encryption",
						body: "Protect PDF uses AES-256. Unlock, sign, redact and convert all produce downloadable files."
					})
				]
			})
		})
	] });
}
function ToolCard({ tool }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to: "/tools/$toolId",
		params: { toolId: tool.id },
		className: "tool-card",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToolGlyph, {
			icon: tool.icon,
			tint: tool.tint
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "text-[15px] font-extrabold tracking-tight",
			children: tool.title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-sm leading-snug text-muted",
			children: tool.blurb
		})] })]
	});
}
function Trust({ icon, title, body }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex gap-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "mt-0.5 grid size-10 shrink-0 place-items-center rounded-lg bg-surface text-fg shadow-[var(--shadow-paper)]",
			children: icon
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
			className: "font-bold",
			children: title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-sm leading-relaxed text-muted",
			children: body
		})] })]
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HomeStudio, {});
}
//#endregion
export { Home as component };
