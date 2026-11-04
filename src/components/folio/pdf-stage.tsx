import { useEffect, useMemo, useRef, useState } from "react";
import { analyzeColors, type FontLook } from "@/lib/folio/text-style";
import { Spinner } from "@/components/folio/loading";
import { uid } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useFolio } from "@/lib/folio/store";
import {
  extractPageText,
  openPdfJs,
  renderPageToCanvas,
  type PdfDocProxy,
  type TextItem,
} from "@/lib/folio/pdf";
import type { Annot, FolioDoc, Point, StampId, Tool } from "@/lib/folio/types";
import { STAMPS } from "@/lib/folio/types";

export function PdfStage({
  doc,
  onRequestSign,
  pendingImage,
  onConsumedImage,
}: {
  doc: FolioDoc;
  onRequestSign: () => void;
  pendingImage: string | null;
  onConsumedImage: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [pdf, setPdf] = useState<PdfDocProxy | null>(null);
  const [size, setSize] = useState({ w: 612, h: 792 });
  const [items, setItems] = useState<TextItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(true);
  const [draft, setDraft] = useState<null | { x: number; y: number; w: number; h: number }>(null);
  const [ink, setInk] = useState<Point[] | null>(null);
  const tap = useRef<{ x: number; y: number; cx: number; cy: number; t: number } | null>(null);
  const [focusId, setFocusId] = useState<string | null>(null);
  const drag = useRef<{
    mode: "draw" | "move";
    sx: number;
    sy: number;
    id?: string;
    orig?: Annot;
  } | null>(null);

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

  useEffect(() => {
    if (useFolio.getState().tool === "select") setTool("text");
  }, [doc.id, setTool]);

  const pageMeta = doc.pages[pageIndex];
  const pageAnnots = doc.annotations.filter((a) => a.page === pageIndex);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    (async () => {
      try {
        const loaded = await openPdfJs(doc.bytes);
        if (cancelled) {
          void loaded.cleanup();
          return;
        }
        setPdf((prev) => {
          void prev?.cleanup();
          return loaded;
        });
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not open PDF");
          setBusy(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [doc.id, doc.bytes]);

  useEffect(() => {
    if (!pdf || !canvasRef.current || !pageMeta) return;
    let cancelled = false;
    setBusy(true);
    (async () => {
      try {
        const page = await pdf.getPage(pageMeta.source + 1);
        if (cancelled) return;
        const { width, height } = await renderPageToCanvas(
          page,
          canvasRef.current!,
          zoom,
          pageMeta.rotation,
        );
        if (cancelled) return;
        setSize({ w: width, h: height });
        const base = page.getViewport({ scale: zoom, rotation: pageMeta.rotation });
        const text = await extractPageText(page, base.width, base.height, base.transform);
        if (!cancelled) setItems(text);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Render failed");
      } finally {
        if (!cancelled) setBusy(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pdf, pageMeta, zoom, pageIndex]);

  function norm(e: React.PointerEvent) {
    const r = wrapRef.current!.getBoundingClientRect();
    return {
      x: (e.clientX - r.left) / r.width,
      y: (e.clientY - r.top) / r.height,
    };
  }

  function hit(p: Point): Annot | null {
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

  function onPointerDown(e: React.PointerEvent) {
    if (!wrapRef.current) return;
    const p = norm(e);
    if (tool === "select") {
      const a = hit(p);
      if (a && "x" in a) {
        select(a.id);
        drag.current = { mode: "move", sx: p.x, sy: p.y, id: a.id, orig: a };
        wrapRef.current.setPointerCapture(e.pointerId);
      } else {
        select(null);
      }
      return;
    }
    if (tool === "text") return; // editing happens by clicking an existing line; blank taps do nothing
    if (tool === "textbox") {
      // Place on release, and only for a real tap: touching the page to scroll must not drop a box.
      tap.current = { x: p.x, y: p.y, cx: e.clientX, cy: e.clientY, t: Date.now() };
      return;
    }
    if (tool === "note") {
      const text = window.prompt("Comment");
      if (text)
        addAnnot({
          id: uid("a"),
          page: pageIndex,
          type: "note",
          x: p.x,
          y: p.y,
          text,
          color: "#f2d56b",
        });
      return;
    }
    if (tool === "stamp") {
      addAnnot({
        id: uid("a"),
        page: pageIndex,
        type: "stamp",
        x: p.x - 0.12,
        y: p.y - 0.04,
        w: 0.24,
        h: 0.08,
        stamp: stamp as StampId,
        color: "#c45c4a",
      });
      return;
    }
    if (tool === "sign") {
      if (pendingImage) {
        addAnnot({
          id: uid("a"),
          page: pageIndex,
          type: "sign",
          x: p.x - 0.14,
          y: p.y - 0.05,
          w: 0.28,
          h: 0.1,
          src: pendingImage,
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
          x: p.x - 0.15,
          y: p.y - 0.1,
          w: 0.3,
          h: 0.2,
          src: pendingImage,
        });
        onConsumedImage();
        setTool("select");
      }
      return;
    }
    if (tool === "pen") {
      setInk([p]);
      drag.current = { mode: "draw", sx: p.x, sy: p.y };
      wrapRef.current.setPointerCapture(e.pointerId);
      return;
    }
    drag.current = { mode: "draw", sx: p.x, sy: p.y };
    setDraft({ x: p.x, y: p.y, w: 0, h: 0 });
    wrapRef.current.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    const p = norm(e);
    const d = drag.current;
    if (!d) return;
    if (d.mode === "move" && d.id && d.orig && "x" in d.orig) {
      const dx = p.x - d.sx;
      const dy = p.y - d.sy;
      updateAnnot(d.id, { x: d.orig.x + dx, y: d.orig.y + dy } as Partial<Annot>);
      return;
    }
    if (tool === "pen" && ink) {
      setInk([...ink, p]);
      return;
    }
    if (draft) {
      setDraft({ x: d.sx, y: d.sy, w: p.x - d.sx, h: p.y - d.sy });
    }
  }

  function onPointerCancel() {
    tap.current = null;
    drag.current = null;
    setDraft(null);
    setInk(null);
  }

  function onPointerUp(e: React.PointerEvent) {
    const t = tap.current;
    tap.current = null;
    if (tool === "textbox" && t) {
      const moved = Math.hypot(e.clientX - t.cx, e.clientY - t.cy);
      if (moved < 8 && Date.now() - t.t < 700) {
        const id = uid("a");
        addAnnot({
          id,
          page: pageIndex,
          type: "text",
          x: Math.min(t.x, 0.68),
          y: Math.min(t.y, 0.95),
          w: 0.32,
          h: 0.05,
          text: "",
          color: color === "#f2d56b" ? "#1c1917" : color,
          fontSize,
        });
        setFocusId(id);
      }
      return;
    }
    const d = drag.current;
    drag.current = null;
    if (tool === "pen" && ink && ink.length > 1) {
      addAnnot({
        id: uid("a"),
        page: pageIndex,
        type: "pen",
        points: ink,
        color,
        strokeWidth,
      });
    }
    setInk(null);
    if (draft && Math.abs(draft.w) > 0.008 && Math.abs(draft.h) > 0.008) {
      const x = Math.min(draft.x, draft.x + draft.w);
      const y = Math.min(draft.y, draft.y + draft.h);
      const w = Math.abs(draft.w);
      const h = Math.abs(draft.h);
      if (tool === "highlight" || tool === "underline" || tool === "strike" || tool === "redact") {
        addAnnot({
          id: uid("a"),
          page: pageIndex,
          type: tool,
          x,
          y,
          w,
          h,
          color: tool === "redact" ? "#0b0c0e" : color,
        });
      } else if (tool === "rect" || tool === "ellipse") {
        addAnnot({
          id: uid("a"),
          page: pageIndex,
          type: tool,
          x,
          y,
          w,
          h,
          color,
          fill: false,
          strokeWidth,
        });
      } else if (tool === "line" || tool === "arrow") {
        addAnnot({
          id: uid("a"),
          page: pageIndex,
          type: tool,
          x: draft.x,
          y: draft.y,
          w: draft.w,
          h: draft.h,
          color,
          strokeWidth,
        });
      }
    }
    setDraft(null);
    void d;
  }

  const selected = pageAnnots.find((a) => a.id === selectedId);
  const lines = useMemo(() => groupLines(items), [items]);

  return (
    <div className="flex min-h-0 flex-1 flex-col items-center overflow-auto p-4 md:p-8">
      {(tool === "text" || tool === "textbox") && (
        <p className="mb-3 max-w-lg rounded-lg bg-surface px-3 py-2 text-center text-xs leading-relaxed text-muted shadow-[var(--shadow-paper)]">
          {tool === "textbox"
            ? "Tap the page where you want to add text."
            : lines.length > 0
              ? "Tap a line and type the new words. Download takes the old letters out of the PDF and writes yours in their place."
              : "This page has no real text (it is a picture or drawn shapes). Use Add text to write on top of it."}
        </p>
      )}
      {error && (
        <div className="m-auto max-w-md rounded-lg bg-surface p-6 text-sm text-muted shadow-[0_0_0_1px_var(--color-border)]">
          {error}. If the file is password-protected, export an unlocked copy and try again.
        </div>
      )}
      <div
        ref={wrapRef}
        className={cn(
          "relative shrink-0 shadow-[var(--shadow-paper)]",
          tool === "select" ? "cursor-default" : tool === "text" || tool === "textbox" ? "cursor-text" : "cursor-crosshair",
        )}
        style={{ width: size.w, height: size.h, touchAction: DRAW_TOOLS.includes(tool) ? "none" : "auto" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
      >
        {busy && (
          <div
            role="status"
            aria-live="polite"
            className="absolute inset-0 z-30 grid place-items-center bg-white/75 text-sm font-semibold text-muted"
          >
            <span className="flex items-center gap-2">
              <Spinner className="size-5 text-accent" /> Loading page…
            </span>
          </div>
        )}
        <canvas ref={canvasRef} className="block bg-paper" />
        <div className="pointer-events-none absolute inset-0 z-10">
          {lines.map((line) => {
            const repl = pageAnnots.find(
              (a) => a.type === "replace" && covers(a, line),
            );
            return (
              <LineEdit
                key={line.id}
                line={line}
                text={repl && repl.type === "replace" ? repl.text : line.text}
                replaced={!!repl}
                look={repl && repl.type === "replace" ? repl : undefined}
                editable={tool === "text"}
                onCommit={(next) => {
                  if (repl && repl.type === "replace") {
                    if (next !== repl.text) updateAnnot(repl.id, { text: next } as Partial<Annot>);
                    return;
                  }
                  if (next === line.text) return;
                  const colors = sampleLine(canvasRef.current, line);
                  addAnnot({
                    id: uid("a"),
                    page: pageIndex,
                    type: "replace",
                    x: line.nx,
                    y: line.ny,
                    w: Math.max(line.nw, 0.04),
                    h: line.nh,
                    text: next,
                    fontSize: Math.max(8, line.fontSize / zoom),
                    color: colors?.fg ?? "#1c1917",
                    bg: colors?.bg ?? "#ffffff",
                    font: line.look?.font,
                    bold: line.look?.bold,
                    italic: line.look?.italic,
                  });
                }}
              />
            );
          })}
        </div>
        <svg className="pointer-events-none absolute inset-0 z-[1] h-full w-full" viewBox="0 0 1 1" preserveAspectRatio="none">
          {pageAnnots.map((a) => (
            <AnnotShape key={a.id} a={a} selected={a.id === selectedId} />
          ))}
          {draft && (
            <rect
              x={Math.min(draft.x, draft.x + draft.w)}
              y={Math.min(draft.y, draft.y + draft.h)}
              width={Math.abs(draft.w)}
              height={Math.abs(draft.h)}
              fill={tool === "highlight" ? color : "none"}
              fillOpacity={tool === "highlight" ? 0.35 : 0}
              stroke={color}
              strokeWidth={0.004}
            />
          )}
          {ink && ink.length > 1 && (
            <polyline
              points={ink.map((p) => `${p.x},${p.y}`).join(" ")}
              fill="none"
              stroke={color}
              strokeWidth={0.006}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </svg>
        {pageAnnots
          .filter((a) => a.type === "text")
          .map((a) =>
            a.type === "text" ? (
              <textarea
                key={a.id}
                ref={(el) => {
                  if (el && focusId === a.id) {
                    el.focus();
                    setFocusId(null);
                  }
                }}
                className={cn(
                  "absolute z-20 resize-none bg-transparent p-1 text-ink outline-none placeholder:text-subtle/70",
                  selectedId === a.id ? "ring-1 ring-accent" : "hover:ring-1 hover:ring-border",
                )}
                placeholder="Type here"
                style={{
                  left: `${a.x * 100}%`,
                  top: `${a.y * 100}%`,
                  width: `${a.w * 100}%`,
                  height: `${a.h * 100}%`,
                  fontSize: a.fontSize * zoom * 0.85,
                  color: a.color,
                  fontWeight: a.bold ? 600 : 400,
                  fontStyle: a.italic ? "italic" : "normal",
                  textAlign: a.align,
                }}
                value={a.text}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  select(a.id);
                }}
                onChange={(e) => updateAnnot(a.id, { text: e.target.value } as Partial<Annot>)}
                onBlur={() => {
                  // A box that was never typed into is just clutter: drop it.
                  if (a.text.trim() === "") removeAnnot(a.id);
                }}
              />
            ) : null,
          )}
        {selected && "w" in selected && (
          <button
            type="button"
            className="absolute z-10 rounded-md bg-surface px-2 py-1 text-[11px] text-fg shadow-[var(--shadow-pop)]"
            style={{
              left: `${Math.min(selected.x, selected.x + selected.w) * 100}%`,
              top: `${Math.min(selected.y, selected.y + selected.h) * 100 - 4}%`,
              transform: "translateY(-110%)",
            }}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => removeAnnot(selected.id)}
          >
            Delete
          </button>
        )}
      </div>
      <span className="sr-only">{STAMPS[0].label}</span>
    </div>
  );
}

function AnnotShape({ a, selected }: { a: Annot; selected: boolean }) {
  const stroke = selected ? "#c5c9d1" : undefined;
  if (a.type === "highlight" || a.type === "redact") {
    return (
      <rect
        x={a.x}
        y={a.y}
        width={a.w}
        height={a.h}
        fill={a.type === "redact" ? "#0b0c0e" : a.color}
        fillOpacity={a.type === "redact" ? 1 : 0.38}
        stroke={stroke}
        strokeWidth={selected ? 0.004 : 0}
      />
    );
  }
  if (a.type === "underline" || a.type === "strike") {
    const y = a.type === "underline" ? a.y + a.h * 0.85 : a.y + a.h * 0.5;
    return (
      <line
        x1={a.x}
        y1={y}
        x2={a.x + a.w}
        y2={y}
        stroke={a.color}
        strokeWidth={0.006}
      />
    );
  }
  if (a.type === "rect") {
    return (
      <rect
        x={a.x}
        y={a.y}
        width={a.w}
        height={a.h}
        fill={a.fill ? a.color : "none"}
        fillOpacity={a.fill ? 0.18 : 0}
        stroke={a.color}
        strokeWidth={0.006}
      />
    );
  }
  if (a.type === "ellipse") {
    return (
      <ellipse
        cx={a.x + a.w / 2}
        cy={a.y + a.h / 2}
        rx={Math.abs(a.w) / 2}
        ry={Math.abs(a.h) / 2}
        fill={a.fill ? a.color : "none"}
        fillOpacity={a.fill ? 0.18 : 0}
        stroke={a.color}
        strokeWidth={0.006}
      />
    );
  }
  if (a.type === "line" || a.type === "arrow") {
    return (
      <line
        x1={a.x}
        y1={a.y}
        x2={a.x + a.w}
        y2={a.y + a.h}
        stroke={a.color}
        strokeWidth={0.006}
        markerEnd={a.type === "arrow" ? "url(#arr)" : undefined}
      />
    );
  }
  if (a.type === "pen") {
    return (
      <polyline
        points={a.points.map((p) => `${p.x},${p.y}`).join(" ")}
        fill="none"
        stroke={a.color}
        strokeWidth={0.005 * a.strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    );
  }
  if (a.type === "stamp") {
    return (
      <g>
        <rect
          x={a.x}
          y={a.y}
          width={a.w}
          height={a.h}
          fill="none"
          stroke={a.color}
          strokeWidth={0.01}
        />
        <text
          x={a.x + a.w / 2}
          y={a.y + a.h / 2}
          fill={a.color}
          fontSize={0.035}
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {a.stamp.toUpperCase()}
        </text>
      </g>
    );
  }
  if (a.type === "image" || a.type === "sign") {
    return (
      <image href={a.src} x={a.x} y={a.y} width={a.w} height={a.h} preserveAspectRatio="xMidYMid meet" />
    );
  }
  if (a.type === "note") {
    return (
      <g>
        <rect x={a.x} y={a.y} width={0.04} height={0.04} fill="#f2d56b" />
      </g>
    );
  }
  if (a.type === "replace") {
    return <rect x={a.x} y={a.y} width={a.w} height={a.h} fill={a.bg ?? "#ffffff"} />;
  }
  return null;
}

type TextLine = {
  id: string;
  left: number;
  top: number;
  width: number;
  height: number;
  fontSize: number;
  text: string;
  nx: number;
  ny: number;
  nw: number;
  nh: number;
  look?: FontLook;
};

const CSS_FONTS = {
  sans: 'Helvetica, Arial, "Nimbus Sans", sans-serif',
  serif: '"Times New Roman", Times, "Nimbus Roman", serif',
  mono: '"Courier New", Courier, monospace',
} as const;

/** Read the background and ink colour under a text line from the rendered page canvas. */
function sampleLine(canvas: HTMLCanvasElement | null, line: TextLine) {
  try {
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || !canvas.clientWidth) return null;
    const k = canvas.width / canvas.clientWidth;
    const x = Math.max(0, Math.floor(line.left * k));
    const y = Math.max(0, Math.floor(line.top * k));
    const w = Math.min(canvas.width - x, Math.max(2, Math.ceil(line.width * k)));
    const h = Math.min(canvas.height - y, Math.max(2, Math.ceil(line.height * k)));
    if (w < 2 || h < 2) return null;
    const img = ctx.getImageData(x, y, w, h);
    return analyzeColors(img.data, w, h);
  } catch {
    return null; // tainted or unavailable canvas: fall back to defaults
  }
}

function groupLines(items: TextItem[]): TextLine[] {
  if (!items.length) return [];
  const sample = items.find((it) => it.nw > 0.002) ?? items[0];
  const vw = sample.nw > 0.002 ? sample.width / sample.nw : 1;
  const vh = sample.nh > 0.002 ? sample.height / sample.nh : 1;
  const sorted = [...items].sort((a, b) => a.top - b.top || a.left - b.left);
  const lines: Array<TextLine & { right: number }> = [];
  for (const it of sorted) {
    const last = lines[lines.length - 1];
    const same =
      last &&
      Math.abs(last.top + last.height / 2 - (it.top + it.height / 2)) < Math.max(3, it.fontSize * 0.45);
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
      look: it.look,
      right: it.left + Math.max(it.width, 8),
      nx: 0,
      ny: 0,
      nw: 0,
      nh: 0,
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
    look: l.look,
    nx: l.left / vw,
    ny: Math.max(0, (l.top - l.fontSize * 0.15) / vh),
    nw: l.width / vw,
    nh: (l.height * 1.35) / vh,
  }));
}

function covers(a: Annot, line: TextLine) {
  if (a.type !== "replace") return false;
  const cx = line.nx + line.nw / 2;
  const cy = line.ny + line.nh / 2;
  return cx >= a.x - 0.012 && cx <= a.x + a.w + 0.012 && cy >= a.y - 0.012 && cy <= a.y + a.h + 0.012;
}

function LineEdit({
  line,
  text,
  replaced,
  look,
  editable,
  onCommit,
}: {
  line: TextLine;
  text: string;
  replaced: boolean;
  look?: { color: string; bg?: string; font?: "sans" | "serif" | "mono"; bold?: boolean; italic?: boolean };
  editable: boolean;
  onCommit: (next: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || document.activeElement === el) return;
    if (el.textContent !== text) el.textContent = text;
  }, [text]);
  return (
    <div
      ref={ref}
      className={cn(
        "text-layer-item",
        editable && "pointer-events-auto is-live",
        replaced && "is-replaced",
      )}
      contentEditable={editable}
      suppressContentEditableWarning
      spellCheck={false}
      style={{
        left: line.left - 2,
        top: line.top - 2,
        fontSize: line.fontSize,
        width: Math.max(line.width + 8, 24),
        minHeight: Math.max(line.height + 4, line.fontSize + 4),
        ...(look
          ? {
              color: look.color,
              background: look.bg ?? "#fff",
              fontFamily: CSS_FONTS[look.font ?? "sans"],
              fontWeight: look.bold ? 700 : 400,
              fontStyle: look.italic ? "italic" : "normal",
            }
          : {}),
      }}
      onPointerDown={(e) => {
        if (editable) e.stopPropagation();
      }}
      onFocus={(e) => {
        const el = e.currentTarget;
        requestAnimationFrame(() => {
          const sel = window.getSelection();
          if (!sel || document.activeElement !== el) return;
          const range = document.createRange();
          range.selectNodeContents(el);
          sel.removeAllRanges();
          sel.addRange(range);
        });
      }}
      onBlur={(e) => onCommit(e.currentTarget.textContent ?? "")}
    />
  );
}

/** Tools that need the finger/pen to draw, so the browser must not treat the drag as a scroll. */
export const DRAW_TOOLS: Tool[] = ["pen", "highlight", "underline", "strike", "rect", "ellipse", "line", "arrow", "redact"];

export const PDF_TOOLS: { id: Tool; label: string }[] = [
  { id: "select", label: "Select" },
  { id: "text", label: "Edit text" },
  { id: "textbox", label: "Add text" },
  { id: "highlight", label: "Highlight" },
  { id: "underline", label: "Underline" },
  { id: "strike", label: "Strike" },
  { id: "pen", label: "Pen" },
  { id: "rect", label: "Rectangle" },
  { id: "ellipse", label: "Ellipse" },
  { id: "line", label: "Line" },
  { id: "arrow", label: "Arrow" },
  { id: "image", label: "Image" },
  { id: "sign", label: "Sign" },
  { id: "stamp", label: "Stamp" },
  { id: "note", label: "Note" },
  { id: "redact", label: "Redact" },
];
