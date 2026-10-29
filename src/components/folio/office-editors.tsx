import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import {
  Bold,
  Heading1,
  Heading2,
  Italic,
  List,
  Plus,
  Trash2,
  Underline,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useFolio } from "@/lib/folio/store";
import { emptySlide } from "@/lib/folio/office";
import type { FolioDoc } from "@/lib/folio/types";

export function RichDocEditor({ doc }: { doc: FolioDoc }) {
  const ref = useRef<HTMLDivElement>(null);
  const patchCurrent = useFolio((s) => s.patchCurrent);

  useEffect(() => {
    if (ref.current && doc.html && ref.current.innerHTML !== doc.html) {
      ref.current.innerHTML = doc.html;
    }
  }, [doc.id]);

  function cmd(command: string, value?: string) {
    document.execCommand(command, false, value);
    persist();
  }

  function persist() {
    if (!ref.current) return;
    patchCurrent({ html: ref.current.innerHTML });
  }

  return (
    <div className="mx-auto flex w-full max-w-[820px] flex-col gap-3 px-3 py-6">
      <div className="sticky top-2 z-10 flex flex-wrap gap-1 rounded-lg bg-surface/95 p-1 shadow-[0_0_0_1px_var(--color-border)] backdrop-blur-sm">
        <IconBtn onClick={() => cmd("bold")} label="Bold">
          <Bold />
        </IconBtn>
        <IconBtn onClick={() => cmd("italic")} label="Italic">
          <Italic />
        </IconBtn>
        <IconBtn onClick={() => cmd("underline")} label="Underline">
          <Underline />
        </IconBtn>
        <IconBtn onClick={() => cmd("formatBlock", "h1")} label="Heading">
          <Heading1 />
        </IconBtn>
        <IconBtn onClick={() => cmd("formatBlock", "h2")} label="Subhead">
          <Heading2 />
        </IconBtn>
        <IconBtn onClick={() => cmd("insertUnorderedList")} label="List">
          <List />
        </IconBtn>
      </div>
      <div
        ref={ref}
        className="folio-prose paper-grain min-h-[70vh] rounded-xl px-8 py-10 text-ink shadow-[var(--shadow-paper)] outline-none md:px-14"
        contentEditable
        suppressContentEditableWarning
        onInput={persist}
        onBlur={persist}
        role="textbox"
        aria-label="Document"
      />
    </div>
  );
}

function IconBtn({
  children,
  onClick,
  label,
}: {
  children: ReactNode;
  onClick: () => void;
  label: string;
}) {
  return (
    <Button type="button" size="tool" variant="ghost" onClick={onClick} aria-label={label} title={label}>
      {children}
    </Button>
  );
}

export function SlideEditor({ doc }: { doc: FolioDoc }) {
  const slides = doc.slides ?? [];
  const pageIndex = useFolio((s) => s.pageIndex);
  const setPage = useFolio((s) => s.setPage);
  const patchCurrent = useFolio((s) => s.patchCurrent);
  const slide = slides[pageIndex] ?? slides[0];

  function update(patch: Partial<typeof slide>) {
    if (!slide) return;
    const next = slides.map((s, i) => (i === pageIndex ? { ...s, ...patch } : s));
    patchCurrent({ slides: next, pages: doc.pages });
  }

  return (
    <div className="flex h-full min-h-0">
      <ScrollArea className="hidden w-44 shrink-0 border-r border-border md:block">
        <div className="flex flex-col gap-2 p-3">
          {slides.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setPage(i)}
              className={cn(
                "rounded-md px-2 py-3 text-left text-xs shadow-[0_0_0_1px_var(--color-border)]",
                i === pageIndex ? "bg-accent text-accent-fg" : "bg-raised text-muted hover:text-fg",
              )}
            >
              <div className="text-[10px] opacity-70">{i + 1}</div>
              <div className="truncate font-medium">{s.title || "Slide"}</div>
            </button>
          ))}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              const next = [...slides, emptySlide()];
              patchCurrent({
                slides: next,
                pages: [...doc.pages, { id: `pg_${next.length}`, source: next.length - 1, rotation: 0 }],
              });
              setPage(next.length - 1);
            }}
          >
            <Plus className="size-3.5" /> Slide
          </Button>
        </div>
      </ScrollArea>
      <div className="flex min-w-0 flex-1 items-start justify-center overflow-auto p-4 md:p-8">
        {slide && (
          <div
            className="flex aspect-video w-full max-w-4xl flex-col gap-4 rounded-xl p-8 text-ink shadow-[var(--shadow-paper)] md:p-12"
            style={{ background: slide.bg || "#f3eee4" }}
          >
            <Input
              className="h-auto border-0 bg-transparent px-0 font-display text-3xl text-ink shadow-none md:text-4xl"
              value={slide.title}
              onChange={(e) => update({ title: e.target.value })}
            />
            <Textarea
              className="min-h-40 flex-1 resize-none bg-transparent text-base text-ink-soft shadow-none"
              value={slide.body}
              onChange={(e) => update({ body: e.target.value })}
            />
            <div className="flex justify-between">
              <span className="text-xs text-ink-soft">
                {pageIndex + 1} / {slides.length}
              </span>
              {slides.length > 1 && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-ink-soft"
                  onClick={() => {
                    const next = slides.filter((_, i) => i !== pageIndex);
                    patchCurrent({
                      slides: next,
                      pages: doc.pages.filter((_, i) => i !== pageIndex),
                    });
                    setPage(Math.max(0, pageIndex - 1));
                  }}
                >
                  <Trash2 className="size-3.5" /> Remove
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function SheetEditor({ doc }: { doc: FolioDoc }) {
  const tab = doc.sheets?.[0];
  const patchCurrent = useFolio((s) => s.patchCurrent);
  if (!tab) return null;
  const sheet = tab;

  function setCell(r: number, c: number, value: string) {
    const rows = sheet.rows.map((row, ri) =>
      ri === r ? row.map((cell, ci) => (ci === c ? value : cell)) : row,
    );
    patchCurrent({ sheets: [{ ...sheet, rows }] });
  }

  const cols = Math.max(8, ...tab.rows.map((r) => r.length));
  const letters = Array.from({ length: cols }, (_, i) => String.fromCharCode(65 + i));

  return (
    <div className="h-full overflow-auto p-3 md:p-6">
      <div className="inline-block min-w-full rounded-lg bg-surface shadow-[0_0_0_1px_var(--color-border)]">
        <table className="border-collapse text-sm">
          <thead>
            <tr>
              <th className="w-10 bg-raised px-2 py-1 text-[11px] text-subtle" />
              {letters.map((l) => (
                <th key={l} className="bg-raised px-2 py-1 text-[11px] font-medium text-muted">
                  {l}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tab.rows.map((row, r) => (
              <tr key={r}>
                <td className="bg-raised px-2 py-1 text-center text-[11px] text-subtle">{r + 1}</td>
                {Array.from({ length: cols }, (_, c) => (
                  <td key={c} className="min-w-28 border border-border p-0">
                    <input
                      className="h-8 w-full bg-transparent px-2 text-fg outline-none focus:bg-raised"
                      value={row[c] ?? ""}
                      onChange={(e) => setCell(r, c, e.target.value)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function MarkdownEditor({ doc }: { doc: FolioDoc }) {
  const patchCurrent = useFolio((s) => s.patchCurrent);
  const { mdToHtml } = requireMd();
  return (
    <div className="grid h-full min-h-0 grid-cols-1 md:grid-cols-2">
      <Textarea
        className="h-full min-h-[60vh] resize-none rounded-none bg-bg font-mono text-sm"
        value={doc.text ?? ""}
        onChange={(e) => {
          const text = e.target.value;
          patchCurrent({ text, html: mdToHtml(text) });
        }}
      />
      <div
        className="folio-prose hidden overflow-auto bg-paper px-8 py-8 text-ink md:block"
        dangerouslySetInnerHTML={{ __html: doc.html || "<p></p>" }}
      />
    </div>
  );
}

function requireMd() {
  return {
    mdToHtml: (md: string) => {
      const escaped = md.replace(/&/g, "&").replace(/</g, "<").replace(/>/g, ">");
      return escaped
        .split("\n")
        .map((line) => {
          if (/^### /.test(line)) return `<h3>${line.slice(4)}</h3>`;
          if (/^## /.test(line)) return `<h2>${line.slice(3)}</h2>`;
          if (/^# /.test(line)) return `<h1>${line.slice(2)}</h1>`;
          if (/^[-*] /.test(line)) return `<li>${line.slice(2)}</li>`;
          if (!line.trim()) return "<p></p>";
          return `<p>${line.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\*(.+?)\*/g, "<em>$1</em>")}</p>`;
        })
        .join("");
    },
  };
}
