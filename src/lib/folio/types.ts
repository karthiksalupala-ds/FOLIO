export const ACCEPT =
  ".pdf,.docx,.pptx,.xlsx,.xls,.csv,.txt,.md,.html,.htm,.png,.jpg,.jpeg,.webp,.gif,.svg,.rtf";

export type DocKind =
  | "pdf"
  | "docx"
  | "pptx"
  | "xlsx"
  | "csv"
  | "txt"
  | "md"
  | "html"
  | "image"
  | "rtf";

export type ExportFormat =
  | "pdf"
  | "docx"
  | "pptx"
  | "xlsx"
  | "csv"
  | "txt"
  | "md"
  | "html"
  | "png"
  | "jpg";

export type Tool =
  | "select"
  | "text"
  | "highlight"
  | "underline"
  | "strike"
  | "pen"
  | "rect"
  | "ellipse"
  | "line"
  | "arrow"
  | "image"
  | "sign"
  | "stamp"
  | "note"
  | "redact";

export type StampId = "approved" | "confidential" | "draft" | "signed" | "rejected";

export type Point = { x: number; y: number };

export type AnnotBase = {
  id: string;
  page: number;
};

export type Annot =
  | (AnnotBase & {
      type: "text";
      x: number;
      y: number;
      w: number;
      h: number;
      text: string;
      color: string;
      fontSize: number;
      bold?: boolean;
      italic?: boolean;
      align?: "left" | "center" | "right";
    })
  | (AnnotBase & {
      type: "highlight" | "underline" | "strike" | "redact";
      x: number;
      y: number;
      w: number;
      h: number;
      color: string;
    })
  | (AnnotBase & {
      type: "pen";
      points: Point[];
      color: string;
      strokeWidth: number;
    })
  | (AnnotBase & {
      type: "rect" | "ellipse";
      x: number;
      y: number;
      w: number;
      h: number;
      color: string;
      fill: boolean;
      strokeWidth: number;
    })
  | (AnnotBase & {
      type: "line" | "arrow";
      x: number;
      y: number;
      w: number;
      h: number;
      color: string;
      strokeWidth: number;
    })
  | (AnnotBase & {
      type: "image" | "sign";
      x: number;
      y: number;
      w: number;
      h: number;
      src: string;
    })
  | (AnnotBase & {
      type: "stamp";
      x: number;
      y: number;
      w: number;
      h: number;
      stamp: StampId;
      color: string;
    })
  | (AnnotBase & {
      type: "note";
      x: number;
      y: number;
      text: string;
      color: string;
    })
  | (AnnotBase & {
      type: "replace";
      x: number;
      y: number;
      w: number;
      h: number;
      text: string;
      fontSize: number;
      color: string;
    });

export type PageMeta = {
  id: string;
  source: number;
  rotation: 0 | 90 | 180 | 270;
};

export type Slide = {
  id: string;
  title: string;
  body: string;
  notes: string;
  bg: string;
};

export type SheetTab = {
  name: string;
  rows: string[][];
};

export type FolioDoc = {
  id: string;
  name: string;
  kind: DocKind;
  createdAt: number;
  updatedAt: number;
  bytes: ArrayBuffer;
  size: number;
  thumb?: string;
  annotations: Annot[];
  pages: PageMeta[];
  html?: string;
  slides?: Slide[];
  sheets?: SheetTab[];
  text?: string;
  watermark?: { text: string; opacity: number };
  pageNumbers?: boolean;
};

export type FolioMeta = {
  id: string;
  name: string;
  kind: DocKind;
  createdAt: number;
  updatedAt: number;
  size: number;
  thumb?: string;
};

export const MARK_COLORS = [
  { id: "mark", value: "#f2d56b", label: "Gold" },
  { id: "green", value: "#b7d7a8", label: "Green" },
  { id: "pink", value: "#f0b6c4", label: "Pink" },
  { id: "blue", value: "#a8c5e2", label: "Blue" },
  { id: "orange", value: "#f0c49a", label: "Peach" },
  { id: "ink", value: "#1c1917", label: "Ink" },
] as const;

export const INK_COLORS = [
  "#1c1917",
  "#c45c4a",
  "#3d6b9a",
  "#6a8f71",
  "#c5c9d1",
  "#eeeae3",
];

export const STAMPS: { id: StampId; label: string }[] = [
  { id: "approved", label: "APPROVED" },
  { id: "confidential", label: "CONFIDENTIAL" },
  { id: "draft", label: "DRAFT" },
  { id: "signed", label: "SIGNED" },
  { id: "rejected", label: "REJECTED" },
];

export const EXPORT_FORMATS: { id: ExportFormat; label: string; hint: string }[] = [
  { id: "pdf", label: "PDF", hint: "Portable document" },
  { id: "docx", label: "Word", hint: "DOCX" },
  { id: "pptx", label: "Slides", hint: "PPTX" },
  { id: "xlsx", label: "Excel", hint: "XLSX" },
  { id: "txt", label: "Plain text", hint: "TXT" },
  { id: "md", label: "Markdown", hint: "MD" },
  { id: "html", label: "Web page", hint: "HTML" },
  { id: "csv", label: "CSV", hint: "Spreadsheet" },
  { id: "png", label: "PNG", hint: "Image" },
  { id: "jpg", label: "JPG", hint: "Image" },
];

export function kindFromName(name: string): DocKind {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "pdf") return "pdf";
  if (ext === "docx" || ext === "doc") return "docx";
  if (ext === "pptx" || ext === "ppt") return "pptx";
  if (ext === "xlsx" || ext === "xls") return "xlsx";
  if (ext === "csv") return "csv";
  if (ext === "md" || ext === "markdown") return "md";
  if (ext === "html" || ext === "htm") return "html";
  if (ext === "rtf") return "rtf";
  if (["png", "jpg", "jpeg", "webp", "gif", "svg"].includes(ext)) return "image";
  return "txt";
}

export function mimeFor(format: ExportFormat): string {
  switch (format) {
    case "pdf":
      return "application/pdf";
    case "docx":
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    case "pptx":
      return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
    case "xlsx":
      return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    case "csv":
      return "text/csv";
    case "txt":
      return "text/plain";
    case "md":
      return "text/markdown";
    case "html":
      return "text/html";
    case "png":
      return "image/png";
    case "jpg":
      return "image/jpeg";
  }
}

export function isPaginated(kind: DocKind): boolean {
  return kind === "pdf" || kind === "image" || kind === "pptx";
}
