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
import { Input } from "@/components/ui/input";
import type { FolioDoc } from "@/lib/folio/types";
import { convertDoc } from "@/lib/folio/convert";
import { downloadBlob } from "@/lib/utils";
import { packFolio, shareBlob } from "@/lib/folio/share";
import { textOfDoc } from "@/lib/folio/office";
import { Download, Link2, Mail, Share2 } from "lucide-react";

export function ShareDialog({
  open,
  onOpenChange,
  doc,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  doc: FolioDoc | null;
}) {
  const [busy, setBusy] = useState(false);
  if (!doc) return null;
  const file = doc;

  async function asPdf() {
    setBusy(true);
    try {
      const { blob, filename } = await convertDoc(file, "pdf");
      return { blob, filename };
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share {doc.name}</DialogTitle>
          <DialogDescription>
            Files stay on this device until you download or hand them to the system share sheet.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <Button
            variant="secondary"
            className="justify-start"
            disabled={busy}
            onClick={async () => {
              const { blob, filename } = await asPdf();
              await shareBlob(blob, filename, doc.name);
            }}
          >
            <Share2 /> System share
          </Button>
          <Button
            variant="secondary"
            className="justify-start"
            disabled={busy}
            onClick={async () => {
              const { blob, filename } = await asPdf();
              downloadBlob(blob, filename);
              toast.success("Downloaded PDF");
            }}
          >
            <Download /> Download PDF
          </Button>
          <Button
            variant="secondary"
            className="justify-start"
            onClick={() => {
              const blob = packFolio(doc);
              downloadBlob(blob, `${doc.name.replace(/\.[^.]+$/, "")}.folio.json`);
              toast.success("Folio pack saved");
            }}
          >
            <Download /> Download Folio pack
          </Button>
          <Button
            variant="secondary"
            className="justify-start"
            onClick={async () => {
              const text = textOfDoc(doc) || doc.name;
              await navigator.clipboard.writeText(text);
              toast.success("Copied text");
            }}
          >
            <Link2 /> Copy text
          </Button>
          <Button
            variant="secondary"
            className="justify-start"
            disabled={busy}
            onClick={async () => {
              const { filename } = await asPdf();
              const subject = encodeURIComponent(doc.name);
              const body = encodeURIComponent(
                `Sharing ${filename} from Folio. Download the file from the studio and attach it here.`,
              );
              window.location.href = `mailto:?subject=${subject}&body=${body}`;
            }}
          >
            <Mail /> Email link
          </Button>
        </div>
        <div className="mt-4">
          <label className="mb-1 block text-xs text-muted">Filename</label>
          <Input value={doc.name} readOnly />
        </div>
      </DialogContent>
    </Dialog>
  );
}
