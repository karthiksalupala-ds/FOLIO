import { useEffect, useRef, useState } from "react";
import { openPdfJs, renderPageToCanvas, type PdfDocProxy } from "@/lib/folio/pdf";
import type { PageMeta } from "@/lib/folio/types";

// One shared pdf.js document per file so a long page list doesn't open the PDF once per thumbnail.
let shared: { bytes: ArrayBuffer; doc: Promise<PdfDocProxy> } | null = null;

function sharedDoc(bytes: ArrayBuffer): Promise<PdfDocProxy> {
  if (shared?.bytes === bytes) return shared.doc;
  const old = shared;
  shared = { bytes, doc: openPdfJs(bytes) };
  // Release the previous document once nothing is going to ask for it again.
  void old?.doc.then((d) => d.cleanup()).catch(() => undefined);
  return shared.doc;
}

/** Small rendering of one page. It only renders once it scrolls into view. */
export function PageThumb({ page, bytes, width = 104 }: { page: PageMeta; bytes: ArrayBuffer; width?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const holderRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const el = holderRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || !canvasRef.current) return;
    let cancelled = false;
    (async () => {
      try {
        const doc = await sharedDoc(bytes);
        const pdfPage = await doc.getPage(page.source + 1);
        if (cancelled || !canvasRef.current) return;
        const natural = pdfPage.getViewport({ scale: 1, rotation: page.rotation });
        const scale = (width * 2) / natural.width; // 2x for sharp thumbnails on dense screens
        await renderPageToCanvas(pdfPage, canvasRef.current, scale, page.rotation);
        if (cancelled || !canvasRef.current) return;
        canvasRef.current.style.width = "100%";
        canvasRef.current.style.height = "auto";
        setFailed(false);
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [visible, bytes, page.source, page.rotation, width]);

  return (
    <div ref={holderRef} className="min-h-16 w-full overflow-hidden rounded-[3px] bg-white">
      {failed ? (
        <div className="grid h-24 place-items-center text-[10px] text-subtle">No preview</div>
      ) : (
        <canvas ref={canvasRef} className="block w-full bg-white" aria-hidden="true" />
      )}
    </div>
  );
}
