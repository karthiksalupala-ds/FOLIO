import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Download,
  Highlighter,
  ImagePlus,
  Minus,
  MousePointer2,
  PanelLeft,
  PenTool,
  Plus,
  Redo2,
  Search,
  Share2,
  Square,
  Stamp,
  StickyNote,
  Type,
  Undo2,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FolioWordmark } from "@/components/folio/mark";
import { PdfStage, PDF_TOOLS } from "@/components/folio/pdf-stage";
import {
  MarkdownEditor,
  RichDocEditor,
  SheetEditor,
  SlideEditor,
} from "@/components/folio/office-editors";
import { ConvertDialog } from "@/components/folio/convert-dialog";
import { ShareDialog } from "@/components/folio/share-dialog";
import { SignatureDialog } from "@/components/folio/signature-dialog";
import { useFolio } from "@/lib/folio/store";
import { convertDoc } from "@/lib/folio/convert";
import { downloadBlob, cn, asArrayBuffer } from "@/lib/utils";
import { INK_COLORS, MARK_COLORS, STAMPS, type Tool } from "@/lib/folio/types";
import { defaultPages, mergePdfs } from "@/lib/folio/pdf";
import { PDFDocument } from "pdf-lib";

const ICONS: Record<Tool, typeof MousePointer2> = {
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
  redact: Square,
};

export function EditorShell({ docId }: { docId: string }) {
  const navigate = useNavigate();
  const current = useFolio((s) => s.current);
  const openId = useFolio((s) => s.openId);
  const saveCurrent = useFolio((s) => s.saveCurrent);
  const hydrate = useFolio((s) => s.hydrate);
  const [ready, setReady] = useState(false);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
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
  }, [docId, hydrate, openId]);

  useEffect(() => {
    const t = window.setInterval(() => {
      void saveCurrent();
    }, 8000);
    return () => window.clearInterval(t);
  }, [saveCurrent]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const meta = e.metaKey || e.ctrlKey;
      const st = useFolio.getState();
      if (meta && e.key.toLowerCase() === "s") {
        e.preventDefault();
        void st.saveCurrent();
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
        const tag = (e.target as HTMLElement).tagName;
        if (["INPUT", "TEXTAREA"].includes(tag) || (e.target as HTMLElement).isContentEditable)
          return;
        if (st.selectedId) st.removeAnnot(st.selectedId);
      }
      if (meta) return;
      const tag = (e.target as HTMLElement).tagName;
      if (["INPUT", "TEXTAREA"].includes(tag) || (e.target as HTMLElement).isContentEditable) return;
      if (e.key === "v") st.setTool("select");
      if (e.key === "t") st.setTool("text");
      if (e.key === "h") st.setTool("highlight");
      if (e.key === "p") st.setTool("pen");
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!ready) {
    return (
      <div className="grid min-h-dvh place-items-center bg-bg text-muted">
        Opening document…
      </div>
    );
  }
  if (missing || !current) {
    return (
      <div className="grid min-h-dvh place-items-center bg-bg px-6 text-center">
        <div>
          <p className="font-display text-2xl">This file is not on this device.</p>
          <Link to="/" className="mt-4 inline-block text-sm text-muted underline">
            Back to tools
          </Link>
        </div>
      </div>
    );
  }

  return (
    <EditorChrome
      onHome={() => {
        void saveCurrent();
        void navigate({ to: "/" });
      }}
    />
  );
}

function EditorChrome({ onHome }: { onHome: () => void }) {
  const doc = useFolio((s) => s.current)!;
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
  const [convertOpen, setConvertOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [signOpen, setSignOpen] = useState(false);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [pagesOpen, setPagesOpen] = useState(false);
  const [propsOpen, setPropsOpen] = useState(false);
  const [find, setFind] = useState("");
  const imageRef = useRef<HTMLInputElement>(null);
  const mergeRef = useRef<HTMLInputElement>(null);

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

  return (
    <div className="flex h-dvh flex-col bg-bg pb-20 text-fg md:pb-0">
      <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border px-2 md:px-3">
        <Button size="icon" variant="ghost" onClick={onHome} aria-label="All tools">
          <ArrowLeft />
        </Button>
        <div className="hidden md:block">
          <FolioWordmark compact />
        </div>
        <Input
          className="h-8 max-w-56 bg-transparent text-sm shadow-none md:max-w-xs"
          value={doc.name}
          onChange={(e) => rename(e.target.value)}
          aria-label="Filename"
        />
        <div className="ml-auto flex items-center gap-1">
          <Button size="icon" variant="ghost" onClick={undo} aria-label="Undo">
            <Undo2 />
          </Button>
          <Button size="icon" variant="ghost" onClick={redo} aria-label="Redo">
            <Redo2 />
          </Button>
          {paginated && (
            <>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setPage(Math.max(0, pageIndex - 1))}
                aria-label="Previous page"
              >
                <ChevronLeft />
              </Button>
              <span className="hidden min-w-14 text-center text-xs tabular-nums text-muted md:inline">
                {pageIndex + 1} / {doc.pages.length}
              </span>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setPage(Math.min(doc.pages.length - 1, pageIndex + 1))}
                aria-label="Next page"
              >
                <ChevronRight />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => setZoom(zoom - 0.1)} aria-label="Zoom out">
                <ZoomOut />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => setZoom(zoom + 0.1)} aria-label="Zoom in">
                <ZoomIn />
              </Button>
            </>
          )}
          <Button size="sm" variant="ghost" className="hidden md:inline-flex" onClick={() => setConvertOpen(true)}>
            Convert
          </Button>
          <Button size="icon" variant="ghost" onClick={() => setShareOpen(true)} aria-label="Share">
            <Share2 />
          </Button>
          {paginated && (
            <Button
              size="sm"
              variant={propsOpen ? "secondary" : "ghost"}
              className="hidden md:inline-flex"
              onClick={() => setPropsOpen((v) => !v)}
            >
              Options
            </Button>
          )}
          <Button size="sm" onClick={() => void downloadPdf()}>
            <Download /> <span className="hidden sm:inline">Download</span>
          </Button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {paginated && (
          <nav className="hidden w-12 shrink-0 flex-col items-center gap-1 border-r border-border py-2 md:flex">
            {PDF_TOOLS.filter((t) =>
              ["select", "text", "highlight", "pen", "rect", "image", "sign", "stamp", "note", "redact"].includes(
                t.id,
              ),
            ).map((t) => {
              const Icon = ICONS[t.id];
              return (
                <Tooltip key={t.id}>
                  <TooltipTrigger asChild>
                    <Button
                      size="tool"
                      variant={tool === t.id ? "default" : "ghost"}
                      aria-label={t.label}
                      onClick={() => {
                        if (t.id === "image") imageRef.current?.click();
                        else if (t.id === "sign") setSignOpen(true);
                        setTool(t.id);
                      }}
                    >
                      <Icon />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">{t.label}</TooltipContent>
                </Tooltip>
              );
            })}
            <Separator className="my-1 w-6" />
            <div className="flex flex-col gap-1.5">
              {MARK_COLORS.slice(0, 5).map((c) => (
                <button
                  key={c.id}
                  type="button"
                  aria-label={c.label}
                  onClick={() => setColor(c.value)}
                  className={cn(
                    "size-4 rounded-full",
                    color === c.value && "ring-2 ring-accent ring-offset-1 ring-offset-bg",
                  )}
                  style={{ background: c.value }}
                />
              ))}
            </div>
          </nav>
        )}

        {paginated && (
          <aside className="hidden w-[140px] shrink-0 border-r border-border md:block">
            <PageRail />
          </aside>
        )}

        <main className="studio-grid relative min-w-0 flex-1 overflow-hidden">
          {doc.kind === "pdf" && (
            <PdfStage
              doc={doc}
              pendingImage={pendingImage}
              onConsumedImage={() => setPendingImage(null)}
              onRequestSign={() => setSignOpen(true)}
            />
          )}
          {doc.kind === "image" && <ImageStage srcBytes={doc.bytes} name={doc.name} />}
          {(doc.kind === "docx" || doc.kind === "html" || doc.kind === "txt" || doc.kind === "rtf") && (
            <ScrollArea className="h-full">
              <RichDocEditor doc={doc} />
            </ScrollArea>
          )}
          {doc.kind === "md" && <MarkdownEditor doc={doc} />}
          {doc.kind === "pptx" && <SlideEditor doc={doc} />}
          {(doc.kind === "xlsx" || doc.kind === "csv") && <SheetEditor doc={doc} />}
        </main>

        {paginated && propsOpen && (
          <aside className="hidden w-56 shrink-0 border-l border-border p-3 md:block">
            <p className="mb-3 text-[11px] font-medium tracking-wide text-muted uppercase">Page</p>
            <div className="space-y-3 text-sm">
              <label className="flex items-center justify-between text-muted">
                Page numbers
                <input
                  type="checkbox"
                  checked={!!doc.pageNumbers}
                  onChange={(e) => patchCurrent({ pageNumbers: e.target.checked }, false)}
                />
              </label>
              <div>
                <label className="mb-1 block text-xs text-muted">Watermark</label>
                <Input
                  placeholder="CONFIDENTIAL"
                  value={doc.watermark?.text ?? ""}
                  onChange={(e) =>
                    patchCurrent({
                      watermark: { text: e.target.value, opacity: doc.watermark?.opacity ?? 0.16 },
                    })
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted">Find in page</label>
                <div className="relative">
                  <Search className="pointer-events-none absolute top-2.5 left-2 size-3.5 text-subtle" />
                  <Input
                    id="folio-find"
                    className="pl-7"
                    value={find}
                    onChange={(e) => setFind(e.target.value)}
                    placeholder="Search text"
                  />
                </div>
                {find && (
                  <p className="mt-1 text-[11px] text-muted">
                    Matches are in the live text layer. Choose Text and edit a hit directly.
                  </p>
                )}
              </div>
              <Button
                variant="secondary"
                size="sm"
                className="w-full"
                onClick={() => mergeRef.current?.click()}
              >
                Merge PDF
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" size="sm" className="w-full">
                    Stamp
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {STAMPS.map((s) => (
                    <DropdownMenuItem
                      key={s.id}
                      onClick={() => {
                        useFolio.setState({ stamp: s.id, tool: "stamp" });
                      }}
                    >
                      {s.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <p className="text-[11px] text-subtle">Ink width</p>
              <Slider
                min={1}
                max={8}
                step={0.5}
                value={[strokeWidth]}
                onValueChange={(v) => setStroke(v[0] ?? 2)}
              />
              <div className="flex flex-wrap gap-1">
                {INK_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className="size-5 rounded-full"
                    style={{ background: c }}
                    onClick={() => setColor(c)}
                    aria-label={c}
                  />
                ))}
              </div>
            </div>
          </aside>
        )}
      </div>

      {paginated && (
        <div className="fixed inset-x-0 bottom-16 z-20 flex items-center gap-1 overflow-x-auto border-t border-border bg-surface p-2 md:hidden">
          <Button size="icon" variant="ghost" onClick={() => setPagesOpen(true)} aria-label="Pages">
            <PanelLeft />
          </Button>
          {(["select", "text", "highlight", "pen", "rect", "image", "sign", "stamp", "note", "redact"] as Tool[]).map(
            (t) => {
              const Icon = ICONS[t];
              return (
                <Button
                  key={t}
                  size="icon"
                  variant={tool === t ? "default" : "ghost"}
                  onClick={() => {
                    if (t === "image") imageRef.current?.click();
                    else if (t === "sign") setSignOpen(true);
                    setTool(t);
                  }}
                  aria-label={t}
                >
                  <Icon />
                </Button>
              );
            },
          )}
          <Button size="sm" variant="ghost" className="ml-auto" onClick={() => setConvertOpen(true)}>
            Convert
          </Button>
        </div>
      )}

      <Sheet open={pagesOpen} onOpenChange={setPagesOpen}>
        <SheetContent side="left" className="p-0 pt-10">
          <PageRail />
        </SheetContent>
      </Sheet>

      <ConvertDialog open={convertOpen} onOpenChange={setConvertOpen} doc={doc} />
      <ShareDialog open={shareOpen} onOpenChange={setShareOpen} doc={doc} />
      <SignatureDialog
        open={signOpen}
        onOpenChange={setSignOpen}
        onSign={(src) => {
          setPendingImage(src);
          setTool("sign");
          toast.message("Tap the page to place the signature");
        }}
      />
      <input
        ref={imageRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          const reader = new FileReader();
          reader.onload = () => {
            setPendingImage(String(reader.result));
            setTool("image");
            toast.message("Tap the page to place the image");
          };
          reader.readAsDataURL(f);
        }}
      />
      <input
        ref={mergeRef}
        type="file"
        accept="application/pdf"
        multiple
        className="hidden"
        onChange={async (e) => {
          const files = e.target.files;
          if (!files?.length) return;
          try {
            const buffers = [doc.bytes, ...(await Promise.all(Array.from(files).map((f) => f.arrayBuffer())))];
            const merged = await mergePdfs(buffers);
            const copy = asArrayBuffer(merged);
            const loaded = await PDFDocument.load(merged);
            patchCurrent({
              bytes: copy,
              pages: defaultPages(loaded.getPageCount()),
            });
            await saveCurrent();
            toast.success("Merged");
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Merge failed");
          }
        }}
      />
    </div>
  );
}

function PageRail() {
  const doc = useFolio((s) => s.current)!;
  const pageIndex = useFolio((s) => s.pageIndex);
  const setPage = useFolio((s) => s.setPage);
  const rotatePage = useFolio((s) => s.rotatePage);
  const deletePage = useFolio((s) => s.deletePage);
  const duplicatePage = useFolio((s) => s.duplicatePage);
  const insertBlankPage = useFolio((s) => s.insertBlankPage);

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col gap-2 p-3">
        {doc.pages.map((p, i) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setPage(i)}
            className={cn(
              "rounded-md px-2 py-3 text-left text-xs shadow-[0_0_0_1px_var(--color-border)]",
              i === pageIndex ? "bg-accent text-accent-fg" : "bg-raised text-muted hover:text-fg",
            )}
          >
            <div className="font-medium">Page {i + 1}</div>
            <div className="opacity-70">{p.rotation}°</div>
          </button>
        ))}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="ghost">
              <Plus className="size-3.5" /> Page
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => void insertBlankPage(pageIndex)}>
              Insert blank
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => duplicatePage(pageIndex)}>Duplicate</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => rotatePage(pageIndex)}>Rotate 90°</DropdownMenuItem>
            <DropdownMenuItem onClick={() => deletePage(pageIndex)}>Delete page</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </ScrollArea>
  );
}

function ImageStage({ srcBytes, name }: { srcBytes: ArrayBuffer; name: string }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    const u = URL.createObjectURL(new Blob([srcBytes]));
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [srcBytes]);
  if (!url) return null;
  return (
    <div className="grid h-full place-items-center overflow-auto p-6">
      <img
        src={url}
        alt={name}
        className="max-h-full max-w-full rounded-md shadow-[var(--shadow-paper)] outline outline-1 -outline-offset-1 outline-black/10"
      />
    </div>
  );
}
