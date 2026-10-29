import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { EXPORT_FORMATS, type ExportFormat, type FolioDoc } from "@/lib/folio/types";
import { convertDoc } from "@/lib/folio/convert";
import { downloadBlob } from "@/lib/utils";
import { shareBlob } from "@/lib/folio/share";
import { cn } from "@/lib/utils";

export function ConvertDialog({
  open,
  onOpenChange,
  doc,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  doc: FolioDoc | null;
}) {
  const [target, setTarget] = useState<ExportFormat>("pdf");
  const [busy, setBusy] = useState(false);

  async function run(mode: "download" | "share") {
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Convert</DialogTitle>
          <DialogDescription>
            {doc ? `Turn ${doc.name} into another format. Conversion happens on this device.` : "Open a file first."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {EXPORT_FORMATS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setTarget(f.id)}
              className={cn(
                "rounded-lg px-2 py-3 text-left shadow-[0_0_0_1px_var(--color-border)] transition-[background-color,box-shadow] duration-150",
                target === f.id ? "bg-accent text-accent-fg" : "bg-raised text-fg hover:bg-raised/80",
              )}
            >
              <div className="text-sm font-medium">{f.label}</div>
              <div className={cn("text-[11px]", target === f.id ? "text-accent-fg/70" : "text-muted")}>
                {f.hint}
              </div>
            </button>
          ))}
        </div>
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="secondary" disabled={!doc || busy} onClick={() => run("share")}>
            Share
          </Button>
          <Button disabled={!doc || busy} onClick={() => run("download")}>
            {busy ? "Working…" : "Download"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
