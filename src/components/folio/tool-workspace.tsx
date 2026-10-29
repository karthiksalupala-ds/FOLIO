import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowDown,
  ArrowUp,
  Check,
  CloudUpload,
  Download,
  FileText,
  PenLine,
  Share2,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/folio/app-chrome";
import { FormBuilder } from "@/components/folio/form-builder";
import { FileActions } from "@/components/folio/upload-hub";
import { ToolGlyph } from "@/components/folio/tool-icons";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import type { PdfTool, ToolId } from "@/lib/folio/catalog";
import { TOOLS, categoryLabel, continueTools, pickNoun } from "@/lib/folio/catalog";
import {
  inspectPdf,
  pageThumbs,
  runTool,
  type JobFile,
  type JobOptions,
  type JobResultFile,
} from "@/lib/folio/ops";
import { samplesForTool } from "@/lib/folio/sample";
import { useFolio } from "@/lib/folio/store";
import { shareBlob } from "@/lib/folio/share";
import { jobFromBlob, stashFiles, takeStash } from "@/lib/folio/pending";
import { openPdfJs, renderPageToCanvas } from "@/lib/folio/pdf";
import { cn, downloadBlob, formatBytes, uid } from "@/lib/utils";

const LANGS = [
  "Spanish",
  "French",
  "German",
  "Portuguese",
  "Italian",
  "Hindi",
  "Japanese",
  "Korean",
  "Chinese",
  "Arabic",
];

export function ToolWorkspace({ tool }: { tool: PdfTool }) {
  const navigate = useNavigate();
  const importFiles = useFolio((s) => s.importFiles);
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<JobFile[]>([]);
  const [dragging, setDragging] = useState(false);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [label, setLabel] = useState("");
  const [results, setResults] = useState<JobResultFile[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [options, setOptions] = useState<JobOptions>(defaultsFor(tool.id));
  const [thumbs, setThumbs] = useState<{ url: string; w: number; h: number }[]>([]);
  const [autoRun, setAutoRun] = useState(false);
  const capture = tool.id === "scan-to-pdf";
  const pagePicker = tool.id === "organize-pdf" || tool.id === "extract-pdf" || tool.id === "remove-pages";
  const noun = pickNoun(tool);
  const showOptionsEmpty = tool.id === "html-to-pdf";

  useEffect(() => {
    setFiles([]);
    setResults(null);
    setError(null);
    setOptions(defaultsFor(tool.id));
    setThumbs([]);
    setRunning(false);
    setProgress(0);
    setAutoRun(false);
  }, [tool.id]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const queued = takeStash();
    if (queued?.length) {
      void (async () => {
        const next: JobFile[] = [];
        for (const f of queued) next.push(await enrich(f));
        setFiles(next.slice(0, tool.maxFiles));
      })();
      return;
    }
    const key = sessionStorage.getItem("folio-autodemo");
    if (key === tool.id) {
      sessionStorage.removeItem("folio-autodemo");
      void useSample(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tool.id]);

  useEffect(() => {
    if (!pagePicker || !files[0]) {
      setThumbs([]);
      return;
    }
    let live = true;
    void pageThumbs(files[0].bytes)
      .then((t) => {
        if (!live) return;
        setThumbs(t);
        setOptions((o) => ({ ...o, pageOrder: t.map((_, i) => i) }));
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [pagePicker, files]);

  const canRun = useMemo(() => {
    if (running) return false;
    if (tool.id === "html-to-pdf")
      return files.length > 0 || !!options.url?.trim() || !!options.html?.trim();
    if (tool.id === "pdf-forms") return files.length >= 1 && (options.formFields?.length ?? 0) > 0;
    if (tool.id === "sign-pdf") return files.length >= tool.minFiles && !!options.signDataUrl;
    if (tool.id === "redact-pdf") return files.length >= 1 && !!options.redactQuery?.trim();
    if (tool.id === "protect-pdf" || tool.id === "unlock-pdf")
      return files.length >= 1 && (options.password?.trim().length ?? 0) >= (tool.id === "protect-pdf" ? 4 : 1);
    return files.length >= tool.minFiles;
  }, [files.length, running, tool, options]);

  const blockedReason = useMemo(() => {
    if (running || canRun) return "";
    if (tool.id === "sign-pdf" && files.length >= 1 && !options.signDataUrl)
      return "Draw or type a signature first.";
    if (tool.id === "redact-pdf" && files.length >= 1 && !options.redactQuery?.trim())
      return "Enter the text you want to black out.";
    if (tool.id === "protect-pdf" && files.length >= 1)
      return "Choose a password of at least 4 characters.";
    if (tool.id === "unlock-pdf" && files.length >= 1) return "Enter the PDF password.";
    if (tool.id === "html-to-pdf") return "Paste a URL or HTML, drop a file, or try the sample.";
    if (tool.id === "pdf-forms" && files.length >= 1) return "Click the page to add a text field.";
    if (files.length < tool.minFiles) {
      const n = tool.minFiles - files.length;
      return n === 1
        ? "Add a file, or try the sample."
        : `Add ${n} more files, or try the sample.`;
    }
    return "";
  }, [canRun, files.length, options, running, tool]);

  useEffect(() => {
    if (!autoRun || running || results || !canRun) return;
    setAutoRun(false);
    void process();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRun, canRun, running, results]);

  async function enrich(file: JobFile): Promise<JobFile> {
    const isPdf = file.mime.includes("pdf") || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) return file;
    try {
      const info = await inspectPdf(file.bytes);
      return { ...file, pages: info.pages, thumb: info.thumb };
    } catch {
      return file;
    }
  }

  async function addList(list: FileList | File[]) {
    const incoming = Array.from(list);
    const next: JobFile[] = [];
    for (const f of incoming) {
      if (f.size > 40 * 1024 * 1024) {
        toast.error(`${f.name} is larger than 40 MB`);
        continue;
      }
      next.push(
        await enrich({
          id: uid("f"),
          name: f.name,
          bytes: await f.arrayBuffer(),
          mime: f.type,
        }),
      );
    }
    setFiles((cur) => [...cur, ...next].slice(0, tool.maxFiles));
    setResults(null);
    setError(null);
  }

  async function useSample(runAfter = false) {
    try {
      const bundle = await samplesForTool(tool.id);
      const next: JobFile[] = [];
      for (const f of bundle.files) {
        next.push(await enrich({ id: uid("f"), name: f.name, bytes: f.bytes, mime: f.mime }));
      }
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
        password: bundle.password ?? o.password,
      }));
      setResults(null);
      setError(null);
      if (runAfter) {
        setAutoRun(true);
        toast.success("Sample loaded — running the tool");
      } else {
        toast.success("Sample loaded — tap the red button to run");
      }
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
        const created = await importFiles(
          files.map(
            (f) =>
              new File([new Uint8Array(f.bytes)], f.name, {
                type: f.mime || "application/pdf",
              }),
          ),
        );
        if (created[0]) {
          toast.success("Opening editor");
          void navigate({ to: "/editor/$docId", params: { docId: created[0].id } });
        }
        return;
      }
      const safe = files.map((f) => ({ ...f, bytes: f.bytes.slice(0) }));
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

  return (
    <AppShell>
      <div data-tint={tool.tint}>
        <section className={cn("text-on-tool", results ? "bg-ok" : `tint-${tool.tint}`)}>
          <div className="mx-auto flex w-full max-w-4xl flex-col items-center px-4 py-10 text-center md:px-8 md:py-14">
            {results ? (
              <span className="grid size-16 place-items-center rounded-full bg-surface text-ok shadow-[var(--shadow-pop)]">
                <Check className="size-8" />
              </span>
            ) : (
              <ToolGlyph icon={tool.icon} tint={tool.tint} size="lg" className="shadow-[var(--shadow-pop)]" />
            )}
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight md:text-4xl">
              {results ? tool.done : tool.title}
            </h1>
            <p className="mt-2 max-w-xl text-sm text-on-tool/90 md:text-base">
              {results ? "Your file is ready to download or share." : tool.blurb}
            </p>
          </div>
        </section>

        <div className="mx-auto w-full max-w-3xl px-4 py-8 pb-32 md:px-8">
          {!results ? (
            <>
              {files.length === 0 && (
                <div
                  data-active={dragging}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragging(false);
                    if (e.dataTransfer.files.length) void addList(e.dataTransfer.files);
                  }}
                  className="drop-zone flex min-h-80 cursor-pointer flex-col items-center justify-center px-6 py-14 text-center"
                  onClick={(e) => {
                    if ((e.target as HTMLElement).closest("button")) return;
                    inputRef.current?.click();
                  }}
                >
                  <span
                    className="grid size-16 place-items-center rounded-full text-on-tool"
                    style={{ background: "var(--tool)" }}
                  >
                    <CloudUpload className="size-8" />
                  </span>
                  <p className="mt-5 text-2xl font-extrabold">Select {noun}</p>
                  <p className="mt-1 max-w-md text-sm text-muted">{tool.hint}</p>
                  <div className="mt-7 flex w-full max-w-md flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
                    <Button
                      variant="tool"
                      className="h-12 px-8 text-base font-bold"
                      onClick={() => inputRef.current?.click()}
                    >
                      {capture ? "Take photo or browse" : "Select files"}
                    </Button>
                    <Button
                      variant="secondary"
                      className="h-12 px-8 text-base font-bold"
                      onClick={() => void useSample(false)}
                    >
                      Try with a sample
                    </Button>
                  </div>
                  <p className="mt-4 text-xs text-subtle">or drop files here · max 40 MB each</p>
                </div>
              )}

              <input
                ref={inputRef}
                type="file"
                className="hidden"
                multiple={tool.multiple}
                accept={tool.accept}
                capture={capture ? "environment" : undefined}
                onChange={(e) => {
                  if (e.target.files?.length) void addList(e.target.files);
                  e.target.value = "";
                }}
              />

              {files.length > 0 && (
                <>
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-bold">
                      {files.length} {files.length === 1 ? "file" : "files"} selected
                      {tool.multiple ? " · drag to reorder" : ""}
                    </p>
                    <div className="flex gap-2">
                      {files.length < tool.maxFiles && (
                        <Button variant="secondary" size="sm" onClick={() => inputRef.current?.click()}>
                          Add more
                        </Button>
                      )}
                      <Button variant="secondary" size="sm" onClick={() => void useSample()}>
                        Use sample
                      </Button>
                    </div>
                  </div>
                  <ul className="space-y-2">
                    {files.map((f, i) => (
                      <li
                        key={f.id}
                        draggable={tool.multiple}
                        onDragStart={(e) => {
                          e.dataTransfer.setData("text/plain", String(i));
                          e.dataTransfer.effectAllowed = "move";
                        }}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          const from = Number(e.dataTransfer.getData("text/plain"));
                          if (!Number.isNaN(from)) setFiles(move(files, from, i));
                        }}
                        className="flex items-center gap-3 rounded-xl bg-surface px-3 py-3 shadow-[var(--shadow-paper)]"
                      >
                        <FileThumb file={f} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold">{f.name}</p>
                          <p className="text-xs text-muted">
                            {formatBytes(f.bytes.byteLength)}
                            {f.pages ? ` · ${f.pages} ${f.pages === 1 ? "page" : "pages"}` : ""}
                          </p>
                        </div>
                        {tool.multiple && (
                          <div className="flex">
                            <Button
                              size="icon"
                              variant="ghost"
                              aria-label="Move up"
                              disabled={i === 0}
                              onClick={() => setFiles(move(files, i, i - 1))}
                            >
                              <ArrowUp />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              aria-label="Move down"
                              disabled={i === files.length - 1}
                              onClick={() => setFiles(move(files, i, i + 1))}
                            >
                              <ArrowDown />
                            </Button>
                          </div>
                        )}
                        <Button
                          size="icon"
                          variant="ghost"
                          aria-label="Remove"
                          onClick={() => setFiles(files.filter((x) => x.id !== f.id))}
                        >
                          <Trash2 />
                        </Button>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {showOptionsEmpty || files.length > 0 ? (
                <ToolOptions tool={tool} options={options} setOptions={setOptions} thumbs={thumbs} />
              ) : null}

              {tool.id === "pdf-forms" && files[0] && (
                <FormBuilder
                  bytes={files[0].bytes}
                  fields={options.formFields ?? []}
                  onChange={(formFields) => setOptions((o) => ({ ...o, formFields }))}
                />
              )}

              {files.length > 0 && tool.id !== "edit-pdf" && (
                <div className="mt-8">
                  <h2 className="text-sm font-extrabold">Use this file for something else</h2>
                  <FileActions files={files} except={tool.id} />
                </div>
              )}

              {error && (
                <p className="mt-4 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>
              )}
            </>
          ) : (
            <ResultPanel
              results={results}
              onReset={reset}
              tool={tool}
              onEdit={async (file) => {
                const created = await importFiles([
                  new File([file.blob], file.name, { type: file.blob.type || "application/pdf" }),
                ]);
                if (created[0]) {
                  void navigate({ to: "/editor/$docId", params: { docId: created[0].id } });
                }
              }}
              onContinue={async (nextId, file) => {
                stashFiles([await jobFromBlob(file.name, file.blob)]);
                void navigate({ to: "/tools/$toolId", params: { toolId: nextId } });
              }}
            />
          )}

          {related.length > 0 && !results && (
            <div className="mt-12">
              <h2 className="text-sm font-extrabold text-muted">More in {categoryLabel(tool.category)}</h2>
              <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
                {related.map((t) => (
                  <Link key={t.id} to="/tools/$toolId" params={{ toolId: t.id }} className="tool-card min-h-0 py-4">
                    <ToolGlyph icon={t.icon} tint={t.tint} size="sm" />
                    <p className="text-sm font-bold">{t.title}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {(files.length > 0 || showOptionsEmpty) && !results && (
        <div className="tool-dock" data-tint={tool.tint}>
          <div className="mx-auto flex w-full max-w-3xl items-center gap-3 px-4 py-3 md:px-8">
            <p className="min-w-0 flex-1 truncate text-sm text-muted">
              {blockedReason ||
                (files.length
                  ? `${files.length} ${files.length === 1 ? "file" : "files"} ready`
                  : "Paste a URL or HTML, then convert")}
            </p>
            <Button
              variant="tool"
              className="h-12 shrink-0 px-8 text-base font-extrabold"
              disabled={!canRun}
              onClick={() => void process()}
            >
              {running ? "Working…" : tool.cta}
            </Button>
          </div>
        </div>
      )}

      {running && (
        <div className="fixed inset-0 z-40 grid place-items-center bg-fg/45 p-4">
          <div className="process-card" data-tint={tool.tint}>
            <div className="spin-ring" />
            <p className="mt-5 text-lg font-extrabold">{label || tool.cta}…</p>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-raised">
              <div
                className="h-full rounded-full transition-[width] duration-200"
                style={{ width: `${progress}%`, background: "var(--tool)" }}
              />
            </div>
            <p className="mt-2 text-sm font-bold tabular-nums text-muted">{progress}%</p>
          </div>
        </div>
      )}
    </AppShell>
  );
}

function FileThumb({ file }: { file: JobFile }) {
  const [url, setUrl] = useState<string | null>(file.thumb ?? null);
  useEffect(() => {
    if (file.thumb) {
      setUrl(file.thumb);
      return;
    }
    if (!file.mime.startsWith("image/")) return;
    const u = URL.createObjectURL(new Blob([file.bytes], { type: file.mime }));
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);
  if (url) {
    return <img src={url} alt="" className="size-12 rounded-md object-cover" />;
  }
  return (
    <span className="grid size-12 place-items-center rounded-md bg-raised text-fg">
      <FileText className="size-5" />
    </span>
  );
}

function ToolOptions({
  tool,
  options,
  setOptions,
  thumbs,
}: {
  tool: PdfTool;
  options: JobOptions;
  setOptions: (o: JobOptions | ((p: JobOptions) => JobOptions)) => void;
  thumbs: { url: string; w: number; h: number }[];
}) {
  const patch = (p: Partial<JobOptions>) => setOptions((o) => ({ ...o, ...p }));

  if (tool.id === "split-pdf") {
    return (
      <div className="mt-6 space-y-3 rounded-xl bg-surface p-4 shadow-[var(--shadow-paper)]">
        <p className="text-sm font-bold">Split mode</p>
        <div className="grid gap-2 sm:grid-cols-3">
          {(
            [
              ["extract", "Every page"],
              ["range", "Custom ranges"],
              ["fixed", "Fixed groups"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => patch({ splitMode: id })}
              className={cn(
                "h-10 rounded-md text-sm font-bold",
                options.splitMode === id ? "bg-[var(--tool)] text-on-tool" : "bg-raised",
              )}
            >
              {label}
            </button>
          ))}
        </div>
        {options.splitMode === "range" && (
          <label className="block text-sm font-semibold">
            Ranges
            <Input
              className="mt-1"
              placeholder="1-3,5,8-10"
              value={options.ranges ?? ""}
              onChange={(e) => patch({ ranges: e.target.value })}
            />
          </label>
        )}
        {options.splitMode === "fixed" && (
          <label className="block text-sm font-semibold">
            Pages per file
            <Input
              className="mt-1"
              type="number"
              min={1}
              value={options.fixedCount ?? 1}
              onChange={(e) => patch({ fixedCount: Number(e.target.value) || 1 })}
            />
          </label>
        )}
      </div>
    );
  }

  if (tool.id === "compress-pdf") {
    return (
      <div className="mt-6 grid gap-2 sm:grid-cols-3">
        {(
          [
            ["recommended", "Recommended", "Good quality, smaller file"],
            ["low", "Strong", "Smaller still"],
            ["extreme", "Extreme", "Smallest file"],
          ] as const
        ).map(([id, title, hint]) => (
          <button
            key={id}
            type="button"
            onClick={() => patch({ quality: id })}
            className={cn(
              "rounded-xl p-4 text-left shadow-[var(--shadow-paper)]",
              options.quality === id ? "bg-[var(--tool)] text-on-tool" : "bg-surface",
            )}
          >
            <p className="font-extrabold">{title}</p>
            <p className={cn("mt-1 text-xs", options.quality === id ? "text-on-tool/80" : "text-muted")}>
              {hint}
            </p>
          </button>
        ))}
      </div>
    );
  }

  if (tool.id === "rotate-pdf") {
    return (
      <div className="mt-6 flex gap-2">
        {([90, 180, 270] as const).map((d) => (
          <Button
            key={d}
            variant={options.rotation === d ? "tool" : "secondary"}
            onClick={() => patch({ rotation: d })}
          >
            {d}°
          </Button>
        ))}
      </div>
    );
  }

  if (tool.id === "watermark") {
    return (
      <div className="mt-6 space-y-4 rounded-xl bg-surface p-4 shadow-[var(--shadow-paper)]">
        <label className="block text-sm font-bold">
          Watermark text
          <Input
            className="mt-1"
            value={options.watermarkText ?? ""}
            onChange={(e) => patch({ watermarkText: e.target.value })}
          />
        </label>
        <label className="block text-sm font-bold">
          Opacity
          <Slider
            className="mt-3"
            min={8}
            max={50}
            value={[Math.round((options.watermarkOpacity ?? 0.18) * 100)]}
            onValueChange={(v) => patch({ watermarkOpacity: (v[0] ?? 18) / 100 })}
          />
        </label>
      </div>
    );
  }

  if (tool.id === "page-numbers") {
    return (
      <label className="mt-6 block text-sm font-bold">
        Position
        <select
          className="field-select mt-1"
          value={options.pageNumberPos}
          onChange={(e) => patch({ pageNumberPos: e.target.value as JobOptions["pageNumberPos"] })}
        >
          <option value="bottom">Bottom center</option>
          <option value="top">Top center</option>
          <option value="bottom-left">Bottom left</option>
          <option value="bottom-right">Bottom right</option>
        </select>
      </label>
    );
  }

  if (tool.id === "crop-pdf") {
    const c = options.crop ?? { t: 5, r: 5, b: 5, l: 5 };
    const set = (k: "t" | "r" | "b" | "l", n: number) => patch({ crop: { ...c, [k]: n } });
    return (
      <div className="mt-6 space-y-3 rounded-xl bg-surface p-4 shadow-[var(--shadow-paper)]">
        {(["t", "r", "b", "l"] as const).map((k) => (
          <label key={k} className="block text-sm font-semibold">
            {k === "t" ? "Top" : k === "r" ? "Right" : k === "b" ? "Bottom" : "Left"} {c[k]}%
            <Slider className="mt-2" min={0} max={30} value={[c[k]]} onValueChange={(v) => set(k, v[0] ?? 0)} />
          </label>
        ))}
      </div>
    );
  }

  if (tool.id === "redact-pdf") {
    return (
      <label className="mt-6 block text-sm font-bold">
        Text to remove
        <Input
          className="mt-1"
          placeholder="e.g. invoice number, email, name"
          value={options.redactQuery ?? ""}
          onChange={(e) => patch({ redactQuery: e.target.value })}
        />
      </label>
    );
  }

  if (tool.id === "protect-pdf" || tool.id === "unlock-pdf") {
    return (
      <label className="mt-6 block text-sm font-bold">
        Password
        <Input
          className="mt-1"
          type="password"
          autoComplete="off"
          value={options.password ?? ""}
          onChange={(e) => patch({ password: e.target.value })}
        />
      </label>
    );
  }

  if (tool.id === "html-to-pdf") {
    return (
      <div className="mt-6 space-y-3 rounded-xl bg-surface p-4 shadow-[var(--shadow-paper)]">
        <label className="block text-sm font-bold">
          Page URL
          <Input
            className="mt-1"
            placeholder="https://"
            value={options.url ?? ""}
            onChange={(e) => patch({ url: e.target.value })}
          />
        </label>
        <label className="block text-sm font-bold">
          Or paste HTML
          <Textarea
            className="mt-1 min-h-28"
            value={options.html ?? ""}
            onChange={(e) => patch({ html: e.target.value })}
          />
        </label>
      </div>
    );
  }

  if (tool.id === "translate-pdf") {
    return (
      <label className="mt-6 block text-sm font-bold">
        Translate into
        <select
          className="field-select mt-1"
          value={options.targetLang}
          onChange={(e) => patch({ targetLang: e.target.value })}
        >
          {LANGS.map((l) => (
            <option key={l}>{l}</option>
          ))}
        </select>
      </label>
    );
  }

  if (tool.id === "jpg-to-pdf" || tool.id === "scan-to-pdf") {
    return (
      <div className="mt-6 flex gap-2">
        <Button
          variant={options.imageFit === "original" ? "tool" : "secondary"}
          onClick={() => patch({ imageFit: "original" })}
        >
          Original size
        </Button>
        <Button
          variant={options.imageFit === "page" ? "tool" : "secondary"}
          onClick={() => patch({ imageFit: "page" })}
        >
          Fit to page
        </Button>
      </div>
    );
  }

  if (tool.id === "convert-any") {
    const formats = [
      ["pdf", "PDF"],
      ["docx", "Word"],
      ["pptx", "PowerPoint"],
      ["xlsx", "Excel"],
      ["jpg", "JPG"],
      ["png", "PNG"],
      ["txt", "Text"],
      ["md", "Markdown"],
      ["html", "HTML"],
    ] as const;
    return (
      <div className="mt-6">
        <p className="mb-2 text-sm font-bold">Convert to</p>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {formats.map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => patch({ targetFormat: id })}
              className={cn(
                "h-11 rounded-md text-sm font-bold",
                (options.targetFormat ?? "docx") === id ? "bg-[var(--tool)] text-on-tool" : "bg-raised",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (tool.id === "sign-pdf") {
    return (
      <SignPad
        value={options.signDataUrl}
        onChange={(signDataUrl) => patch({ signDataUrl })}
        page={options.signPage}
        onPage={(signPage) => patch({ signPage })}
      />
    );
  }

  if ((tool.id === "organize-pdf" || tool.id === "extract-pdf" || tool.id === "remove-pages") && thumbs.length) {
    const order = options.pageOrder ?? thumbs.map((_, i) => i);
    return (
      <div className="mt-6">
        <p className="mb-3 text-sm font-bold">
          {tool.id === "remove-pages"
            ? "Trash the pages you want gone. Everything left stays in the file."
            : tool.id === "extract-pdf"
              ? "Trash the pages you do not need. Keep the rest."
              : "Use arrows to reorder, trash to drop a page."}
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {order.map((idx, pos) => {
            const t = thumbs[idx];
            if (!t) return null;
            return (
              <div key={`${idx}-${pos}`} className="overflow-hidden rounded-lg bg-surface shadow-[var(--shadow-paper)]">
                <img src={t.url} alt={`Page ${idx + 1}`} className="w-full bg-raised object-contain" />
                <div className="flex items-center justify-between px-2 py-1.5">
                  <span className="text-xs text-muted">p.{idx + 1}</span>
                  <span className="flex">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-8"
                      disabled={pos === 0}
                      onClick={() => patch({ pageOrder: move(order, pos, pos - 1) })}
                    >
                      <ArrowUp className="size-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-8"
                      disabled={pos === order.length - 1}
                      onClick={() => patch({ pageOrder: move(order, pos, pos + 1) })}
                    >
                      <ArrowDown className="size-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-8"
                      disabled={order.length <= 1}
                      onClick={() => patch({ pageOrder: order.filter((_, i) => i !== pos) })}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return null;
}

function SignPad({
  value,
  onChange,
  page,
  onPage,
}: {
  value?: string;
  onChange: (v: string) => void;
  page?: "last" | "all";
  onPage: (v: "last" | "all") => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [mode, setMode] = useState<"draw" | "type">("draw");
  const [typed, setTyped] = useState("");

  useEffect(() => {
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

  function pos(e: React.PointerEvent<HTMLCanvasElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
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

  return (
    <div className="mt-6 space-y-3 rounded-xl bg-surface p-4 shadow-[var(--shadow-paper)]">
      <div className="flex gap-2">
        <Button size="sm" variant={mode === "draw" ? "default" : "secondary"} onClick={() => setMode("draw")}>
          Draw
        </Button>
        <Button size="sm" variant={mode === "type" ? "default" : "secondary"} onClick={() => setMode("type")}>
          Type
        </Button>
      </div>
      {mode === "draw" ? (
        <canvas
          ref={canvasRef}
          className="h-[140px] w-full touch-none rounded-lg paper-grain"
          onPointerDown={(e) => {
            drawing.current = true;
            const ctx = e.currentTarget.getContext("2d");
            if (!ctx) return;
            const p = pos(e);
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            e.currentTarget.setPointerCapture(e.pointerId);
          }}
          onPointerMove={(e) => {
            if (!drawing.current) return;
            const ctx = e.currentTarget.getContext("2d");
            if (!ctx) return;
            const p = pos(e);
            ctx.lineTo(p.x, p.y);
            ctx.stroke();
          }}
          onPointerUp={() => {
            drawing.current = false;
            commitCanvas();
          }}
        />
      ) : (
        <div className="flex gap-2">
          <Input
            placeholder="Your name"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            className="font-[Georgia,serif] text-lg italic"
          />
          <Button variant="secondary" onClick={commitType}>
            Use
          </Button>
        </div>
      )}
      {value && <p className="text-xs font-bold text-ok">Signature ready</p>}
      <div className="flex gap-2">
        <Button size="sm" variant={page === "last" ? "default" : "secondary"} onClick={() => onPage("last")}>
          Last page
        </Button>
        <Button size="sm" variant={page === "all" ? "default" : "secondary"} onClick={() => onPage("all")}>
          Every page
        </Button>
      </div>
    </div>
  );
}

function ResultPanel({
  results,
  onReset,
  tool,
  onEdit,
  onContinue,
}: {
  results: JobResultFile[];
  onReset: () => void;
  tool: PdfTool;
  onEdit: (file: JobResultFile) => Promise<void>;
  onContinue: (toolId: ToolId, file: JobResultFile) => Promise<void>;
}) {
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

  return (
    <div className="rounded-xl bg-surface p-6 text-center shadow-[var(--shadow-paper)]">
      {visual && <ResultPreview file={visual} />}
      {!visual && !preview && (
        <div className="mx-auto mt-2 grid size-20 place-items-center rounded-2xl bg-raised text-fg">
          <FileText className="size-8" />
        </div>
      )}
      {preview && (
        <pre className="mt-4 max-h-48 overflow-auto rounded-lg bg-raised p-3 text-left text-xs leading-relaxed whitespace-pre-wrap">
          {preview}
        </pre>
      )}
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Button variant="tool" className="h-12 px-8 text-base font-extrabold" onClick={downloadAll}>
          <Download /> Download {results.length > 1 ? "all" : ""}
        </Button>
        {visual && (visual.name.endsWith(".pdf") || visual.blob.type.includes("pdf")) && (
          <Button variant="secondary" className="h-12 px-5 font-bold" onClick={() => void onEdit(visual)}>
            <PenLine /> Continue editing
          </Button>
        )}
      </div>
      <ul className="mt-5 space-y-2 text-left">
        {results.map((r) => (
          <li key={r.name} className="flex items-center gap-3 rounded-lg bg-raised px-3 py-2">
            <FileText className="size-4 shrink-0 text-muted" />
            <span className="min-w-0 flex-1 truncate text-sm font-semibold">{r.name}</span>
            <span className="text-xs text-muted">{formatBytes(r.blob.size)}</span>
            <Button size="sm" variant="tool" className="font-bold" onClick={() => downloadBlob(r.blob, r.name)}>
              <Download /> Save
            </Button>
            <Button
              size="icon"
              variant="secondary"
              aria-label="Share"
              onClick={() => void shareBlob(r.blob, r.name, r.name)}
            >
              <Share2 />
            </Button>
          </li>
        ))}
      </ul>
      {more.length > 0 && primary && (
        <div className="mt-8 text-left">
          <h2 className="text-sm font-extrabold text-muted">Continue with this file</h2>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {more.map((t) => (
              <button
                key={t.id}
                type="button"
                className="tool-card min-h-0 items-center gap-2 py-3"
                onClick={() => void onContinue(t.id, primary)}
              >
                <ToolGlyph icon={t.icon} tint={t.tint} size="sm" />
                <p className="text-sm font-bold">{t.title}</p>
              </button>
            ))}
          </div>
        </div>
      )}
      <Button variant="secondary" className="mt-6 font-bold" onClick={onReset}>
        Start over
      </Button>
    </div>
  );
}

function ResultPreview({ file }: { file: JobResultFile }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const isPdf = file.blob.type.includes("pdf") || file.name.toLowerCase().endsWith(".pdf");
  const isImage = file.blob.type.startsWith("image/") || /\.(jpg|jpeg|png|webp)$/i.test(file.name);

  useEffect(() => {
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
    void (async () => {
      try {
        const pdf = await openPdfJs(await file.blob.arrayBuffer());
        const page = await pdf.getPage(1);
        if (!live || !canvasRef.current) return;
        await renderPageToCanvas(page, canvasRef.current, 0.7, 0);
        const canvas = canvasRef.current;
        canvas.style.width = "auto";
        canvas.style.height = "auto";
        canvas.style.maxHeight = "20rem";
        canvas.style.maxWidth = "100%";
        await pdf.cleanup();
      } catch {
        /* preview is optional */
      }
    })();
    return () => {
      live = false;
    };
  }, [file, isPdf, isImage]);

  if (isImage && imgUrl) {
    return (
      <img
        src={imgUrl}
        alt="Result preview"
        className="mx-auto mt-5 max-h-80 rounded-lg bg-raised object-contain shadow-[var(--shadow-paper)]"
      />
    );
  }
  if (isPdf) {
    return (
      <div className="mx-auto mt-5 flex h-80 max-w-full items-start justify-center overflow-hidden rounded-lg bg-raised shadow-[var(--shadow-paper)]">
        <canvas ref={canvasRef} className="max-h-full w-auto max-w-full" />
      </div>
    );
  }
  return null;
}

function defaultsFor(id: string): JobOptions {
  return {
    splitMode: "extract",
    ranges: "1-3",
    fixedCount: 1,
    quality: "recommended",
    rotation: 90,
    watermarkText: "CONFIDENTIAL",
    watermarkOpacity: 0.18,
    pageNumberPos: "bottom",
    crop: { t: 5, r: 5, b: 5, l: 5 },
    signPage: "last",
    imageFit: "original",
    targetLang: "Spanish",
    targetFormat: "docx",
    formFields: [],
  };
}

function move<T>(arr: T[], from: number, to: number): T[] {
  if (to < 0 || to >= arr.length) return arr;
  const next = [...arr];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}
