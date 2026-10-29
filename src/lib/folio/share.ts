import { downloadBlob } from "@/lib/utils";
import type { FolioDoc } from "./types";

export async function shareBlob(blob: Blob, filename: string, title: string) {
  const file = new File([blob], filename, { type: blob.type || "application/octet-stream" });
  try {
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title, text: title });
      return "shared";
    }
  } catch (err) {
    if ((err as Error).name === "AbortError") return "cancelled";
  }
  downloadBlob(blob, filename);
  return "downloaded";
}

export function packFolio(doc: FolioDoc) {
  const json = JSON.stringify({
    v: 1,
    name: doc.name,
    kind: doc.kind,
    annotations: doc.annotations,
    pages: doc.pages,
    html: doc.html,
    slides: doc.slides,
    sheets: doc.sheets,
    text: doc.text,
    watermark: doc.watermark,
    pageNumbers: doc.pageNumbers,
  });
  return new Blob([json], { type: "application/json" });
}
