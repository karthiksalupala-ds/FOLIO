import type { JobFile } from "./ops";

let stash: JobFile[] | null = null;

export function stashFiles(files: JobFile[]) {
  stash = files.map((f) => ({
    ...f,
    bytes: f.bytes.slice(0),
  }));
}

export function takeStash(): JobFile[] | null {
  const next = stash;
  stash = null;
  return next;
}

export async function jobFromBlob(name: string, blob: Blob): Promise<JobFile> {
  return {
    id: `stash_${Date.now().toString(36)}`,
    name,
    bytes: await blob.arrayBuffer(),
    mime: blob.type || guessMime(name),
  };
}

function guessMime(name: string) {
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return "application/pdf";
  if (ext === "png") return "image/png";
  if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
  if (ext === "docx") return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  if (ext === "pptx") return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
  if (ext === "xlsx") return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  if (ext === "txt") return "text/plain";
  if (ext === "md") return "text/markdown";
  if (ext === "html" || ext === "htm") return "text/html";
  return "application/octet-stream";
}
