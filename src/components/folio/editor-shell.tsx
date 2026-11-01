import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Bold,
  ChevronLeft,
  ChevronRight,
  Circle,
  Copy,
  Download,
  EllipsisVertical,
  EyeOff,
  Highlighter,
  ImagePlus,
  Italic,
  Minus,
  MousePointer2,
  MoveUpRight,
  PanelLeft,
  PanelRight,
  PenTool,
  Plus,
  Redo2,
  RotateCw,
  Search,
  Share2,
  Square,
  Stamp,
  StickyNote,
  Strikethrough,
  TextCursorInput,
  Trash2,
  Type,
  Underline,
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
import { PageThumb } from "@/components/folio/page-thumb";
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
import { INK_COLORS, MARK_COLORS, STAMPS, type Annot, type Tool } from "@/lib/folio/types";
import { uid } from "@/lib/utils";
import { defaultPages, mergePdfs } from "@/lib/folio/pdf";
import { PDFDocument } from "pdf-lib";

const ICONS: Record<Tool, typeof MousePointer2> = {
  select: MousePointer2,
  text: Type,
  textbox: TextCursorInput,
  highlight: Highlighter,
  underline: Underline,
  strike: Strikethrough,
  pen: PenTool,
  rect: Square,
  ellipse: Circle,
  line: Minus,
  arrow: MoveUpRight,
  image: ImagePlus,
  sign: PenTool,
  stamp: Stamp,
  note: StickyNote,
  redact: EyeOff,
};

const LABELS: Record<Tool, string> = {
  select: "Select",
  text: "Edit text",
  textbox: "Add text",
  highlight: "Highlight",
  underline: "Underline",
  strike: "Strike through",
  pen: "Draw",
  rect: "Rectangle",
  ellipse: "Ellipse",
  line: "Line",
  arrow: "Arrow",
  image: "Image",
  sign: "Sign",
  stamp: "Stamp",
  note: "Comment",
  redact: "Redact",
};

/** Tools in the order people reach for them, grouped like a desktop PDF editor. */
const TOOL_GROUPS: Tool[][] = [
  ["select", "text", "textbox"],
  ["highlight", "underline", "strike", "pen"],
  ["rect", "ellipse", "line", "arrow"],
  ["image", "sign", "stamp", "note"],
  ["redact"],
];

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
      if (e.key === "a") st.setTool("textbox");
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
  const [propsOpen, setPropsOpen] = useState(() => typeof window !== "undefined" && window.innerWidth >= 1024);
  const [find, setFind] = useState("");
  const imageRef = useRef<HTMLInputElement>(null);
  const mergeRef = useRef<HTMLInputElement>(null);

  const paginated = doc.kind === "pdf" || doc.kind === "image";

  function pick(t: Tool) {
    if (t === "image") imageRef.current?.click();
    else if (t === "sign") setSignOpen(true);
    setTool(t);
  }

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
    <div className="flex h-dvh flex-col bg-bg text-fg">
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
              aria-pressed={propsOpen}
            >
              <PanelRight /> Panel
            </Button>
          )}
          <Button size="sm" onClick={() => void downloadPdf()}>
            <Download /> <span className="hidden sm:inline">Download</span>
          </Button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {paginated && (
          <nav
            aria-label="Editing tools"
            className="hidden w-14 shrink-0 flex-col items-center gap-1 overflow-y-auto border-r border-border py-2 md:flex"
          >
            {TOOL_GROUPS.map((group, gi) => (
              <div key={gi} className="flex flex-col items-center gap-1">
                {gi > 0 && <Separator className="my-1 w-7" />}
                {group.map((t) => {
                  const Icon = ICONS[t];
                  return (
                    <Tooltip key={t}>
                      <TooltipTrigger asChild>
                        <Button
                          size="tool"
                          variant={tool === t ? "default" : "ghost"}
                          aria-label={LABELS[t]}
                          aria-pressed={tool === t}
                          onClick={() => pick(t)}
                        >
                          <Icon />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="right">{LABELS[t]}</TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            ))}
          </nav>
        )}

        {paginated && (
          <aside className="hidden w-[168px] shrink-0 border-r border-border md:block">
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
          <aside className="hidden w-64 shrink-0 overflow-y-auto border-l border-border p-3 md:block">
            <Inspector />
            <Separator className="my-4" />
            <p className="mb-3 text-xs font-semibold text-muted">Page</p>
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
            </div>
          </aside>
        )}
      </div>

      {paginated && (
        <div className="shrink-0 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] md:hidden">
          <SelectionBar />
          <div className="flex items-center gap-1 overflow-x-auto p-2">
            <Button size="icon" variant="ghost" className="size-11 shrink-0" onClick={() => setPagesOpen(true)} aria-label="Pages">
              <PanelLeft className="size-5" />
            </Button>
            {TOOL_GROUPS.map((group, gi) => (
              <div key={gi} className="flex shrink-0 items-center gap-1 border-l border-border pl-1">
                {group.map((t) => {
                  const Icon = ICONS[t];
                  return (
                    <Button
                      key={t}
                      size="icon"
                      variant={tool === t ? "default" : "ghost"}
                      className="size-11 shrink-0"
                      onClick={() => pick(t)}
                      aria-label={LABELS[t]}
                      aria-pressed={tool === t}
                    >
                      <Icon className="size-5" />
                    </Button>
                  );
                })}
              </div>
            ))}
            <Button size="sm" variant="ghost" className="ml-2 h-11 shrink-0" onClick={() => setConvertOpen(true)}>
              Convert
            </Button>
          </div>
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

const SWATCHES = Array.from(new Set([...INK_COLORS, ...MARK_COLORS.map((c) => c.value), "#d93025", "#1a73e8", "#188038"]));

type AnyPatch = Partial<Annot>;

function selectedAnnot() {
  const st = useFolio.getState();
  return st.current?.annotations.find((x) => x.id === st.selectedId);
}

function duplicateSelected() {
  const a = selectedAnnot();
  if (!a) return;
  const st = useFolio.getState();
  const copy = JSON.parse(JSON.stringify(a)) as Annot;
  copy.id = uid("a");
  if ("x" in copy) copy.x = Math.min(0.9, copy.x + 0.025);
  if ("y" in copy) copy.y = Math.min(0.95, copy.y + 0.02);
  st.addAnnot(copy);
  st.select(copy.id);
}

/** Look-and-feel controls for whatever is selected, or the defaults for the active tool. */
function Inspector() {
  const doc = useFolio((s) => s.current)!;
  const selectedId = useFolio((s) => s.selectedId);
  const tool = useFolio((s) => s.tool);
  const color = useFolio((s) => s.color);
  const setColor = useFolio((s) => s.setColor);
  const fontSize = useFolio((s) => s.fontSize);
  const setFontSize = useFolio((s) => s.setFontSize);
  const strokeWidth = useFolio((s) => s.strokeWidth);
  const setStroke = useFolio((s) => s.setStroke);
  const updateAnnot = useFolio((s) => s.updateAnnot);
  const removeAnnot = useFolio((s) => s.removeAnnot);

  const a = doc.annotations.find((x) => x.id === selectedId);
  const type = a?.type;
  const isText = type === "text" || type === "replace";
  const strokeTypes = ["pen", "rect", "ellipse", "line", "arrow"];
  const hasStroke = a ? strokeTypes.includes(a.type) : strokeTypes.includes(tool);
  const showSize = a ? isText : tool === "textbox";
  const showColor = a ? "color" in a : !["select", "text", "image", "sign", "stamp", "note", "redact"].includes(tool);
  const curColor = a && "color" in a ? a.color : color;
  const curSize = a && (a.type === "text" || a.type === "replace") ? a.fontSize : fontSize;
  const curStroke = a && a.type === "pen" ? a.strokeWidth : a && "strokeWidth" in a ? (a.strokeWidth ?? strokeWidth) : strokeWidth;

  const patch = (p: AnyPatch) => a && updateAnnot(a.id, p);

  if (!a && !showSize && !showColor && !hasStroke) {
    return (
      <div>
        <p className="mb-2 text-xs font-semibold text-muted">Properties</p>
        <p className="text-xs leading-relaxed text-subtle">
          Select an object on the page to change its colour, size and style. Pick a tool to set its defaults.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-xs font-semibold text-muted">{a ? LABELS_BY_TYPE[a.type] ?? "Selection" : `${LABELS[tool]} defaults`}</p>

      {showColor && (
        <div>
          <p className="mb-1.5 text-[11px] text-subtle">Colour</p>
          <div className="flex flex-wrap gap-1.5">
            {SWATCHES.map((c) => (
              <button
                key={c}
                type="button"
                aria-label={`Colour ${c}`}
                aria-pressed={curColor.toLowerCase() === c.toLowerCase()}
                onClick={() => (a ? patch({ color: c } as AnyPatch) : setColor(c))}
                className={cn(
                  "size-6 rounded-full outline-none ring-offset-1 ring-offset-bg focus-visible:ring-2 focus-visible:ring-accent",
                  curColor.toLowerCase() === c.toLowerCase() && "ring-2 ring-accent",
                )}
                style={{ background: c, boxShadow: "inset 0 0 0 1px rgb(0 0 0 / 0.12)" }}
              />
            ))}
          </div>
        </div>
      )}

      {showSize && (
        <div>
          <div className="mb-1.5 flex items-center justify-between text-[11px] text-subtle">
            <span>Size</span>
            <span className="tabular-nums">{Math.round(curSize)} pt</span>
          </div>
          <Slider
            min={6}
            max={96}
            step={1}
            value={[curSize]}
            onValueChange={(v) => {
              const n = v[0] ?? 16;
              if (a) patch({ fontSize: n } as AnyPatch);
              else setFontSize(n);
            }}
          />
        </div>
      )}

      {a && isText && (
        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant={"bold" in a && a.bold ? "default" : "secondary"}
            aria-label="Bold"
            aria-pressed={"bold" in a && !!a.bold}
            onClick={() => patch({ bold: !("bold" in a && a.bold) } as AnyPatch)}
          >
            <Bold />
          </Button>
          <Button
            size="icon"
            variant={"italic" in a && a.italic ? "default" : "secondary"}
            aria-label="Italic"
            aria-pressed={"italic" in a && !!a.italic}
            onClick={() => patch({ italic: !("italic" in a && a.italic) } as AnyPatch)}
          >
            <Italic />
          </Button>
          {a.type === "text" &&
            (["left", "center", "right"] as const).map((al) => {
              const Icon = al === "left" ? AlignLeft : al === "center" ? AlignCenter : AlignRight;
              return (
                <Button
                  key={al}
                  size="icon"
                  variant={(a.align ?? "left") === al ? "default" : "secondary"}
                  aria-label={`Align ${al}`}
                  onClick={() => patch({ align: al } as AnyPatch)}
                >
                  <Icon />
                </Button>
              );
            })}
        </div>
      )}

      {hasStroke && (
        <div>
          <div className="mb-1.5 flex items-center justify-between text-[11px] text-subtle">
            <span>Line width</span>
            <span className="tabular-nums">{curStroke}</span>
          </div>
          <Slider
            min={1}
            max={8}
            step={0.5}
            value={[curStroke]}
            onValueChange={(v) => {
              const n = v[0] ?? 2;
              if (a) patch({ strokeWidth: n } as AnyPatch);
              else setStroke(n);
            }}
          />
        </div>
      )}

      {a && (type === "rect" || type === "ellipse") && (
        <label className="flex items-center justify-between text-sm text-muted">
          Fill
          <input type="checkbox" checked={!!a.fill} onChange={(e) => patch({ fill: e.target.checked } as AnyPatch)} />
        </label>
      )}

      {a && (
        <div className="flex gap-2 pt-1">
          <Button size="sm" variant="secondary" className="flex-1" onClick={duplicateSelected}>
            <Copy /> Duplicate
          </Button>
          <Button size="sm" variant="secondary" className="flex-1" onClick={() => removeAnnot(a.id)}>
            <Trash2 /> Delete
          </Button>
        </div>
      )}
    </div>
  );
}

const LABELS_BY_TYPE: Record<string, string> = {
  text: "Text box",
  replace: "Edited text",
  highlight: "Highlight",
  underline: "Underline",
  strike: "Strike through",
  pen: "Drawing",
  rect: "Rectangle",
  ellipse: "Ellipse",
  line: "Line",
  arrow: "Arrow",
  image: "Image",
  sign: "Signature",
  stamp: "Stamp",
  note: "Comment",
  redact: "Redaction",
};

/** Phone version of the Inspector: a slim strip above the tool bar while something is selected. */
function SelectionBar() {
  const selectedId = useFolio((s) => s.selectedId);
  const doc = useFolio((s) => s.current)!;
  const updateAnnot = useFolio((s) => s.updateAnnot);
  const removeAnnot = useFolio((s) => s.removeAnnot);
  const a = doc.annotations.find((x) => x.id === selectedId);
  if (!a) return null;
  const hasColor = "color" in a;
  const isText = a.type === "text" || a.type === "replace";
  return (
    <div className="flex items-center gap-1 overflow-x-auto border-b border-border px-2 py-1.5">
      {hasColor &&
        SWATCHES.slice(0, 9).map((c) => (
          <button
            key={c}
            type="button"
            aria-label={`Colour ${c}`}
            onClick={() => updateAnnot(a.id, { color: c } as AnyPatch)}
            className={cn("size-8 shrink-0 rounded-full", a.color.toLowerCase() === c.toLowerCase() && "ring-2 ring-accent ring-offset-1")}
            style={{ background: c, boxShadow: "inset 0 0 0 1px rgb(0 0 0 / 0.12)" }}
          />
        ))}
      {isText && (
        <>
          <Button size="icon" variant="secondary" className="size-9 shrink-0" aria-label="Smaller text" onClick={() => updateAnnot(a.id, { fontSize: Math.max(6, a.fontSize - 2) } as AnyPatch)}>
            <Minus />
          </Button>
          <Button size="icon" variant="secondary" className="size-9 shrink-0" aria-label="Larger text" onClick={() => updateAnnot(a.id, { fontSize: Math.min(96, a.fontSize + 2) } as AnyPatch)}>
            <Plus />
          </Button>
        </>
      )}
      <Button size="icon" variant="secondary" className="ml-auto size-9 shrink-0" aria-label="Duplicate" onClick={duplicateSelected}>
        <Copy />
      </Button>
      <Button size="icon" variant="secondary" className="size-9 shrink-0" aria-label="Delete" onClick={() => removeAnnot(a.id)}>
        <Trash2 />
      </Button>
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
  const movePage = useFolio((s) => s.movePage);
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);
  const last = doc.pages.length - 1;

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col gap-3 p-3">
        {doc.pages.map((p, i) => (
          <div
            key={p.id}
            draggable
            onDragStart={() => setDragFrom(i)}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(i);
            }}
            onDragEnd={() => {
              setDragFrom(null);
              setDragOver(null);
            }}
            onDrop={() => {
              if (dragFrom !== null && dragFrom !== i) movePage(dragFrom, i);
              setDragFrom(null);
              setDragOver(null);
            }}
            className={cn("group relative rounded-md", dragOver === i && dragFrom !== i && "outline-2 outline-accent")}
          >
            <button
              type="button"
              onClick={() => setPage(i)}
              aria-label={`Go to page ${i + 1}`}
              aria-current={i === pageIndex ? "page" : undefined}
              className={cn(
                "block w-full rounded-md p-1.5 text-center outline-none focus-visible:ring-2 focus-visible:ring-accent",
                i === pageIndex ? "bg-accent/12 ring-2 ring-accent" : "hover:bg-raised",
              )}
            >
              <PageThumb page={p} bytes={doc.bytes} />
              <span className={cn("mt-1.5 block text-xs tabular-nums", i === pageIndex ? "font-bold text-fg" : "text-muted")}>{i + 1}</span>
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="icon"
                  variant="secondary"
                  aria-label={`Page ${i + 1} options`}
                  className="absolute top-2.5 right-2.5 size-7 opacity-0 shadow-sm group-focus-within:opacity-100 group-hover:opacity-100 data-[state=open]:opacity-100 max-md:opacity-100"
                >
                  <EllipsisVertical className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem disabled={i === 0} onClick={() => movePage(i, i - 1)}>
                  <ArrowUp /> Move up
                </DropdownMenuItem>
                <DropdownMenuItem disabled={i === last} onClick={() => movePage(i, i + 1)}>
                  <ArrowDown /> Move down
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => rotatePage(i)}>
                  <RotateCw /> Rotate 90°
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => duplicatePage(i)}>
                  <Copy /> Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => void insertBlankPage(i)}>
                  <Plus /> Insert blank after
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled={doc.pages.length < 2} onClick={() => deletePage(i)}>
                  <Trash2 /> Delete page
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
        <Button size="sm" variant="ghost" onClick={() => void insertBlankPage(pageIndex)}>
          <Plus className="size-3.5" /> Add page
        </Button>
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
