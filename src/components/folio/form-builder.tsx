import { useEffect, useRef, useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { openPdfJs, renderPageToCanvas } from "@/lib/folio/pdf";
import { uid } from "@/lib/utils";

export type FormFieldDraft = {
  id: string;
  page: number;
  x: number;
  y: number;
  w: number;
  h: number;
  name: string;
};

export function FormBuilder({
  bytes,
  fields,
  onChange,
}: {
  bytes: ArrayBuffer;
  fields: FormFieldDraft[];
  onChange: (fields: FormFieldDraft[]) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [page, setPage] = useState(0);
  const [count, setCount] = useState(1);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    setError(null);
    void (async () => {
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

  function addAt(e: React.MouseEvent<HTMLDivElement>) {
    if ((e.target as HTMLElement).closest("[data-field]")) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    onChange([
      ...fields,
      {
        id: uid("ff"),
        page,
        x: Math.max(0.02, Math.min(0.68, x - 0.02)),
        y: Math.max(0.02, Math.min(0.9, y - 0.01)),
        w: 0.32,
        h: 0.045,
        name: `Field ${fields.length + 1}`,
      },
    ]);
  }

  const onPage = fields.filter((f) => f.page === page);

  return (
    <div className="mt-6 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-bold">Click the page to drop a text field</p>
        <div className="flex items-center gap-2">
          <Button type="button" size="sm" variant="secondary" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
            Prev
          </Button>
          <span className="text-xs font-semibold text-muted">
            {page + 1} / {count}
          </span>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={page >= count - 1}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>
      {error ? (
        <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>
      ) : (
        <div
          className="relative mx-auto w-full max-w-xl cursor-crosshair overflow-hidden rounded-lg bg-raised shadow-[var(--shadow-paper)]"
          onClick={addAt}
        >
          <canvas ref={canvasRef} className="block w-full" />
          {onPage.map((f) => (
            <div
              key={f.id}
              data-field
              className="absolute flex items-center gap-1 rounded-sm bg-accent/15 px-1 ring-1 ring-accent"
              style={{ left: `${f.x * 100}%`, top: `${f.y * 100}%`, width: `${f.w * 100}%`, height: `${f.h * 100}%` }}
              onClick={(e) => e.stopPropagation()}
            >
              <span className="truncate text-[11px] font-bold text-fg">{f.name}</span>
            </div>
          ))}
        </div>
      )}
      {fields.length > 0 && (
        <ul className="space-y-2">
          {fields.map((f) => (
            <li key={f.id} className="flex items-center gap-2 rounded-lg bg-surface px-2 py-2 shadow-[var(--shadow-paper)]">
              <span className="w-12 shrink-0 text-xs font-semibold text-muted">p.{f.page + 1}</span>
              <Input
                value={f.name}
                aria-label="Field name"
                onChange={(e) =>
                  onChange(fields.map((x) => (x.id === f.id ? { ...x, name: e.target.value } : x)))
                }
              />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                aria-label="Remove field"
                onClick={() => onChange(fields.filter((x) => x.id !== f.id))}
              >
                <Trash2 />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
