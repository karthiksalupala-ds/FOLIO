import "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { a as Separator2, i as Root2, n as Item2, o as Trigger, r as Portal2, t as Content2 } from "../_libs/@radix-ui/react-dropdown-menu+[...].mjs";
import { c as cn } from "./router-BNe88wCr.mjs";
require_react();
var import_jsx_runtime = require_jsx_runtime();
var DropdownMenu = Root2;
var DropdownMenuTrigger = Trigger;
function DropdownMenuContent({ className, sideOffset = 6, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Portal2, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2, {
		sideOffset,
		className: cn("z-50 min-w-44 overflow-hidden rounded-lg bg-surface p-1 text-fg shadow-[var(--shadow-pop)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-[0.97] data-[state=open]:zoom-in-[0.97]", className),
		...props
	}) });
}
function DropdownMenuItem({ className, inset, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item2, {
		className: cn("relative flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none select-none focus:bg-raised data-[disabled]:opacity-40", inset && "pl-8", className),
		...props
	});
}
function DropdownMenuSeparator({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator2, {
		className: cn("-mx-1 my-1 h-px bg-border", className),
		...props
	});
}
function FolioMark({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
		viewBox: "0 0 24 24",
		className: cn("size-6", className),
		fill: "currentColor",
		"aria-hidden": "true",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M12 21.35c-4.8-3.16-8.5-6.7-8.5-10.7C3.5 7.4 5.9 5.2 8.7 5.2c1.6 0 3.1.76 4.05 1.96A5.13 5.13 0 0 1 16.8 5.2c2.8 0 5.2 2.2 5.2 5.45 0 4-3.7 7.54-8.5 10.7Z" })
	});
}
function FolioWordmark({ compact = false }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
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
//#endregion
export { DropdownMenuTrigger as a, DropdownMenuSeparator as i, DropdownMenuContent as n, FolioMark as o, DropdownMenuItem as r, FolioWordmark as s, DropdownMenu as t };
