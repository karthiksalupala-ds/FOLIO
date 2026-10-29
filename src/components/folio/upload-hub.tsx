import { useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { CloudUpload, X } from "lucide-react";
import { toast } from "sonner";
import { ToolGlyph } from "@/components/folio/tool-icons";
import { getTool, type ToolId } from "@/lib/folio/catalog";
import { stashFiles } from "@/lib/folio/pending";
import type { JobFile } from "@/lib/folio/ops";
import { formatBytes, uid } from "@/lib/utils";

const PDF_ACTIONS: ToolId[] = [
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
  "summarize-pdf",
];

export function UploadHub() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [files, setFiles] = useState<JobFile[]>([]);

  async function take(list: FileList | File[]) {
    const next: JobFile[] = [];
    for (const f of Array.from(list).slice(0, 12)) {
      if (f.size > 40 * 1024 * 1024) {
        toast.error(`${f.name} is larger than 40 MB`);
        continue;
      }
      next.push({
        id: uid("f"),
        name: f.name,
        bytes: await f.arrayBuffer(),
        mime: f.type || "application/octet-stream",
      });
    }
    if (next.length) setFiles(next);
  }

  return (
    <div className="mx-auto mt-8 w-full max-w-3xl text-left" data-tint="red">
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        multiple
        accept="application/pdf,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.csv,image/*,.html,.htm,.txt,.md"
        onChange={(e) => {
          if (e.target.files?.length) void take(e.target.files);
          e.target.value = "";
        }}
      />
      {files.length === 0 ? (
        <div
          data-active={dragging}
          className="drop-zone flex cursor-pointer flex-col items-center px-6 py-10 text-center"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            if (e.dataTransfer.files.length) void take(e.dataTransfer.files);
          }}
        >
          <span className="grid size-14 place-items-center rounded-full bg-accent text-accent-fg">
            <CloudUpload className="size-7" />
          </span>
          <p className="mt-4 text-xl font-extrabold">Upload a PDF</p>
          <p className="mt-1 max-w-md text-sm text-muted">
            Drop any PDF, Word, PowerPoint, Excel or image. Then pick Edit, Merge, Compress, Convert and the rest.
          </p>
          <span className="mt-5 inline-flex h-12 items-center rounded-md bg-accent px-6 text-base font-extrabold text-accent-fg">
            Select files
          </span>
        </div>
      ) : (
        <div className="rounded-xl bg-surface p-4 shadow-[var(--shadow-paper)] md:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-extrabold">
                {files.length} {files.length === 1 ? "file" : "files"} ready
              </p>
              <ul className="mt-1 space-y-0.5">
                {files.map((f) => (
                  <li key={f.id} className="truncate text-sm text-muted">
                    {f.name} · {formatBytes(f.bytes.byteLength)}
                  </li>
                ))}
              </ul>
            </div>
            <button
              type="button"
              className="grid size-9 shrink-0 place-items-center rounded-md bg-raised text-muted"
              aria-label="Clear files"
              onClick={() => setFiles([])}
            >
              <X className="size-4" />
            </button>
          </div>
          <p className="mt-4 text-sm font-extrabold">What do you want to do?</p>
          <FileActions files={files} />
          <button
            type="button"
            className="mt-3 text-sm font-bold text-accent"
            onClick={() => inputRef.current?.click()}
          >
            Add another file
          </button>
        </div>
      )}
    </div>
  );
}

export function FileActions({ files, except }: { files: JobFile[]; except?: string }) {
  const navigate = useNavigate();
  const pdf = files.some((f) => f.mime.includes("pdf") || f.name.toLowerCase().endsWith(".pdf"));
  const ids = (pdf ? PDF_ACTIONS : (["edit-pdf", "convert-any", "word-to-pdf", "powerpoint-to-pdf", "excel-to-pdf", "jpg-to-pdf"] as ToolId[])).filter(
    (id) => id !== except,
  );

  function open(id: ToolId) {
    const tool = getTool(id);
    if (!tool) return;
    stashFiles(files.slice(0, tool.maxFiles));
    void navigate({ to: "/tools/$toolId", params: { toolId: id } });
  }

  return (
    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
      {ids.map((id) => {
        const tool = getTool(id);
        if (!tool) return null;
        return (
          <button key={id} type="button" className="tool-card min-h-0 items-center gap-2 py-3 text-left" onClick={() => open(id)}>
            <ToolGlyph icon={tool.icon} tint={tool.tint} size="sm" />
            <span className="text-sm font-extrabold">{tool.title}</span>
          </button>
        );
      })}
    </div>
  );
}
