export const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "organize", label: "Organize PDF" },
  { id: "optimize", label: "Optimize PDF" },
  { id: "convert", label: "Convert PDF" },
  { id: "edit", label: "Edit PDF" },
  { id: "security", label: "PDF Security" },
  { id: "ai", label: "PDF Intelligence" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];
export type ToolTint = "red" | "orange" | "green" | "blue" | "navy" | "teal" | "slate" | "rose";

export type ToolId =
  | "merge-pdf"
  | "split-pdf"
  | "extract-pdf"
  | "remove-pages"
  | "organize-pdf"
  | "rotate-pdf"
  | "compress-pdf"
  | "repair-pdf"
  | "pdf-to-word"
  | "pdf-to-powerpoint"
  | "pdf-to-excel"
  | "pdf-to-jpg"
  | "pdf-to-png"
  | "pdf-to-markdown"
  | "pdf-to-txt"
  | "word-to-pdf"
  | "powerpoint-to-pdf"
  | "excel-to-pdf"
  | "jpg-to-pdf"
  | "html-to-pdf"
  | "convert-any"
  | "edit-pdf"
  | "pdf-forms"
  | "watermark"
  | "page-numbers"
  | "crop-pdf"
  | "redact-pdf"
  | "sign-pdf"
  | "protect-pdf"
  | "unlock-pdf"
  | "compare-pdf"
  | "ocr-pdf"
  | "summarize-pdf"
  | "translate-pdf"
  | "scan-to-pdf"
  | "pdf-to-pdfa";

export type PdfTool = {
  id: ToolId;
  title: string;
  blurb: string;
  category: Exclude<CategoryId, "all">;
  icon: string;
  tint: ToolTint;
  accept: string;
  minFiles: number;
  maxFiles: number;
  multiple: boolean;
  cta: string;
  hint: string;
  done: string;
};

const PDF = "application/pdf,.pdf";
const IMAGES = "image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif";
const WORD = ".doc,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const PPT = ".ppt,.pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation";
const XLS = ".xls,.xlsx,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
const HTML = ".html,.htm,.txt,.md,text/html,text/plain";
const ANY_DOC = `${PDF},${IMAGES},${WORD},${PPT},${XLS},${HTML}`;

export const TOOLS: PdfTool[] = [
  {
    id: "merge-pdf",
    title: "Merge PDF",
    blurb: "Combine PDFs in the order you want with the easiest PDF merger.",
    category: "organize",
    icon: "merge",
    tint: "red",
    accept: PDF,
    minFiles: 2,
    maxFiles: 20,
    multiple: true,
    cta: "Merge PDF",
    hint: "Select two or more PDF files to merge them into one.",
    done: "PDFs have been merged!",
  },
  {
    id: "split-pdf",
    title: "Split PDF",
    blurb: "Separate one page or a whole set into independent PDF files.",
    category: "organize",
    icon: "split",
    tint: "orange",
    accept: PDF,
    minFiles: 1,
    maxFiles: 1,
    multiple: false,
    cta: "Split PDF",
    hint: "Split by range, extract every page, or cut into groups.",
    done: "PDF has been split!",
  },
  {
    id: "extract-pdf",
    title: "Extract pages",
    blurb: "Pick the pages you need and save them as a new PDF.",
    category: "organize",
    icon: "extract",
    tint: "rose",
    accept: PDF,
    minFiles: 1,
    maxFiles: 1,
    multiple: false,
    cta: "Extract pages",
    hint: "Choose which pages to keep. The rest are left out of the download.",
    done: "Pages have been extracted!",
  },
  {
    id: "remove-pages",
    title: "Remove pages",
    blurb: "Delete the pages you do not want and download a shorter PDF.",
    category: "organize",
    icon: "remove",
    tint: "rose",
    accept: PDF,
    minFiles: 1,
    maxFiles: 1,
    multiple: false,
    cta: "Remove pages",
    hint: "Trash the pages to drop. Everything left stays in the file.",
    done: "Pages have been removed!",
  },
  {
    id: "organize-pdf",
    title: "Organize PDF",
    blurb: "Sort, delete, or duplicate pages. Build the document you need.",
    category: "organize",
    icon: "organize",
    tint: "rose",
    accept: PDF,
    minFiles: 1,
    maxFiles: 1,
    multiple: false,
    cta: "Save PDF",
    hint: "Reorder pages, drop the ones you do not need, then save.",
    done: "PDF has been organized!",
  },
  {
    id: "rotate-pdf",
    title: "Rotate PDF",
    blurb: "Rotate your PDFs the way you need them — even several at once.",
    category: "organize",
    icon: "rotate",
    tint: "teal",
    accept: PDF,
    minFiles: 1,
    maxFiles: 12,
    multiple: true,
    cta: "Rotate PDF",
    hint: "Choose 90°, 180° or 270° and apply to every page.",
    done: "PDF has been rotated!",
  },
  {
    id: "compress-pdf",
    title: "Compress PDF",
    blurb: "Reduce file size while keeping the pages readable.",
    category: "optimize",
    icon: "compress",
    tint: "green",
    accept: PDF,
    minFiles: 1,
    maxFiles: 8,
    multiple: true,
    cta: "Compress PDF",
    hint: "Picks the smallest result. Higher compression re-renders pages as images, so text may no longer be selectable.",
    done: "PDF has been compressed!",
  },
  {
    id: "repair-pdf",
    title: "Repair PDF",
    blurb: "Rebuild a damaged PDF and recover pages that still render.",
    category: "optimize",
    icon: "repair",
    tint: "slate",
    accept: PDF,
    minFiles: 1,
    maxFiles: 1,
    multiple: false,
    cta: "Repair PDF",
    hint: "We rewrite the file from the pages that can still be read.",
    done: "PDF has been repaired!",
  },
  {
    id: "pdf-to-pdfa",
    title: "PDF to PDF/A",
    blurb: "Create an archival copy that keeps formatting for the long term.",
    category: "optimize",
    icon: "pdfa",
    tint: "navy",
    accept: PDF,
    minFiles: 1,
    maxFiles: 4,
    multiple: true,
    cta: "Convert to PDF/A",
    hint: "Pages are rewritten into a clean archival PDF.",
    done: "Archival PDF is ready!",
  },
  {
    id: "convert-any",
    title: "Convert any file",
    blurb: "Turn a PDF, Word file, deck, sheet, image or note into another format.",
    category: "convert",
    icon: "convert",
    tint: "red",
    accept: ANY_DOC,
    minFiles: 1,
    maxFiles: 1,
    multiple: false,
    cta: "Convert",
    hint: "Drop almost any document, pick a format, then download or share it.",
    done: "Your file has been converted!",
  },
  {
    id: "pdf-to-word",
    title: "PDF to Word",
    blurb: "Convert PDF files into editable DOC and DOCX documents.",
    category: "convert",
    icon: "word",
    tint: "navy",
    accept: PDF,
    minFiles: 1,
    maxFiles: 4,
    multiple: true,
    cta: "Convert to Word",
    hint: "Text, headings and paragraphs are reconstructed into a Word file.",
    done: "PDF has been converted to Word!",
  },
  {
    id: "pdf-to-powerpoint",
    title: "PDF to PowerPoint",
    blurb: "Turn PDF pages into an editable PPTX slideshow.",
    category: "convert",
    icon: "ppt",
    tint: "orange",
    accept: PDF,
    minFiles: 1,
    maxFiles: 2,
    multiple: false,
    cta: "Convert to PowerPoint",
    hint: "Each PDF page becomes a slide.",
    done: "PDF has been converted to PowerPoint!",
  },
  {
    id: "pdf-to-excel",
    title: "PDF to Excel",
    blurb: "Pull tables and lines from a PDF into a spreadsheet.",
    category: "convert",
    icon: "excel",
    tint: "green",
    accept: PDF,
    minFiles: 1,
    maxFiles: 4,
    multiple: true,
    cta: "Convert to Excel",
    hint: "Rows are detected from the text layout of each page.",
    done: "PDF has been converted to Excel!",
  },
  {
    id: "pdf-to-jpg",
    title: "PDF to JPG",
    blurb: "Convert each PDF page into a high-quality JPG image.",
    category: "convert",
    icon: "jpg",
    tint: "blue",
    accept: PDF,
    minFiles: 1,
    maxFiles: 2,
    multiple: false,
    cta: "Convert to JPG",
    hint: "Every page is exported as a JPG. Multiple pages arrive as a zip.",
    done: "PDF has been converted to JPG!",
  },
  {
    id: "pdf-to-png",
    title: "PDF to PNG",
    blurb: "Export PDF pages as crisp PNG images with a transparent-ready canvas.",
    category: "convert",
    icon: "png",
    tint: "teal",
    accept: PDF,
    minFiles: 1,
    maxFiles: 2,
    multiple: false,
    cta: "Convert to PNG",
    hint: "Best for slides, screenshots and graphics.",
    done: "PDF has been converted to PNG!",
  },
  {
    id: "pdf-to-markdown",
    title: "PDF to Markdown",
    blurb: "Turn PDFs into Markdown for notes, docs, and writing tools.",
    category: "convert",
    icon: "md",
    tint: "slate",
    accept: PDF,
    minFiles: 1,
    maxFiles: 4,
    multiple: true,
    cta: "Convert to Markdown",
    hint: "Headings and paragraphs are preserved as Markdown.",
    done: "Markdown file is ready!",
  },
  {
    id: "pdf-to-txt",
    title: "PDF to TXT",
    blurb: "Extract all readable text from a PDF into a plain text file.",
    category: "convert",
    icon: "txt",
    tint: "slate",
    accept: PDF,
    minFiles: 1,
    maxFiles: 8,
    multiple: true,
    cta: "Extract text",
    hint: "Works on PDFs that already contain a text layer.",
    done: "Text has been extracted!",
  },
  {
    id: "word-to-pdf",
    title: "Word to PDF",
    blurb: "Make DOC and DOCX files easy to read by converting them to PDF.",
    category: "convert",
    icon: "word",
    tint: "navy",
    accept: WORD,
    minFiles: 1,
    maxFiles: 8,
    multiple: true,
    cta: "Convert to PDF",
    hint: "Upload a Word file. We keep headings, lists and paragraphs.",
    done: "Word file has been converted to PDF!",
  },
  {
    id: "powerpoint-to-pdf",
    title: "PowerPoint to PDF",
    blurb: "Make PPT and PPTX slideshows easy to view as a PDF.",
    category: "convert",
    icon: "ppt",
    tint: "orange",
    accept: PPT,
    minFiles: 1,
    maxFiles: 4,
    multiple: true,
    cta: "Convert to PDF",
    hint: "Each slide becomes a PDF page.",
    done: "PowerPoint has been converted to PDF!",
  },
  {
    id: "excel-to-pdf",
    title: "Excel to PDF",
    blurb: "Make spreadsheets easy to share by converting them to PDF.",
    category: "convert",
    icon: "excel",
    tint: "green",
    accept: XLS,
    minFiles: 1,
    maxFiles: 4,
    multiple: true,
    cta: "Convert to PDF",
    hint: "Sheets are laid out as tables on the page.",
    done: "Spreadsheet has been converted to PDF!",
  },
  {
    id: "jpg-to-pdf",
    title: "JPG to PDF",
    blurb: "Convert JPG, PNG and other images to PDF in seconds.",
    category: "convert",
    icon: "jpg",
    tint: "blue",
    accept: IMAGES,
    minFiles: 1,
    maxFiles: 30,
    multiple: true,
    cta: "Convert to PDF",
    hint: "Images become pages. Drag to set the order.",
    done: "Images have been converted to PDF!",
  },
  {
    id: "html-to-pdf",
    title: "HTML to PDF",
    blurb: "Convert a web page or pasted HTML into a clean PDF.",
    category: "convert",
    icon: "html",
    tint: "orange",
    accept: HTML,
    minFiles: 0,
    maxFiles: 4,
    multiple: true,
    cta: "Convert to PDF",
    hint: "Paste a URL, drop an HTML file, or paste markup.",
    done: "HTML has been converted to PDF!",
  },
  {
    id: "scan-to-pdf",
    title: "Scan to PDF",
    blurb: "Capture photos or scans and turn them into a multi-page PDF.",
    category: "convert",
    icon: "scan",
    tint: "teal",
    accept: IMAGES,
    minFiles: 1,
    maxFiles: 24,
    multiple: true,
    cta: "Create PDF",
    hint: "Use the camera on a phone or upload existing scans.",
    done: "Scan has been saved as a PDF!",
  },
  {
    id: "edit-pdf",
    title: "Edit PDF",
    blurb: "Add text, images, shapes and notes. Rewrite lines right on the page.",
    category: "edit",
    icon: "edit",
    tint: "red",
    accept: ANY_DOC,
    minFiles: 1,
    maxFiles: 1,
    multiple: false,
    cta: "Open editor",
    hint: "Opens the full editor so you can change text and mark up pages.",
    done: "Document is open in the editor.",
  },
  {
    id: "pdf-forms",
    title: "PDF Forms",
    blurb: "Click the page to add fillable text fields, then download the form.",
    category: "edit",
    icon: "forms",
    tint: "blue",
    accept: PDF,
    minFiles: 1,
    maxFiles: 1,
    multiple: false,
    cta: "Create form",
    hint: "Click where a field should go, name it, then download a fillable PDF.",
    done: "Fillable PDF is ready!",
  },
  {
    id: "watermark",
    title: "Watermark",
    blurb: "Stamp an image or text over your PDF. Choose opacity and position.",
    category: "edit",
    icon: "watermark",
    tint: "rose",
    accept: PDF,
    minFiles: 1,
    maxFiles: 6,
    multiple: true,
    cta: "Add watermark",
    hint: "A diagonal text stamp is applied to every page.",
    done: "Watermark has been added!",
  },
  {
    id: "page-numbers",
    title: "Page numbers",
    blurb: "Add page numbers with control over position and format.",
    category: "edit",
    icon: "numbers",
    tint: "slate",
    accept: PDF,
    minFiles: 1,
    maxFiles: 6,
    multiple: true,
    cta: "Add page numbers",
    hint: "Numbers are drawn on every page, then baked into the file.",
    done: "Page numbers have been added!",
  },
  {
    id: "crop-pdf",
    title: "Crop PDF",
    blurb: "Trim margins or focus on a region across the whole document.",
    category: "edit",
    icon: "crop",
    tint: "teal",
    accept: PDF,
    minFiles: 1,
    maxFiles: 1,
    multiple: false,
    cta: "Crop PDF",
    hint: "Set margins as a percent of the page, then apply to all pages.",
    done: "PDF has been cropped!",
  },
  {
    id: "redact-pdf",
    title: "Redact PDF",
    blurb: "Permanently remove matching text. Pages are flattened to images so it cannot be copied.",
    category: "security",
    icon: "redact",
    tint: "slate",
    accept: PDF,
    minFiles: 1,
    maxFiles: 1,
    multiple: false,
    cta: "Redact PDF",
    hint: "Every match of your search is covered with a black box and removed.",
    done: "Text has been redacted!",
  },
  {
    id: "sign-pdf",
    title: "Sign PDF",
    blurb: "Draw or type a signature and place it on the document.",
    category: "security",
    icon: "sign",
    tint: "navy",
    accept: PDF,
    minFiles: 1,
    maxFiles: 1,
    multiple: false,
    cta: "Sign PDF",
    hint: "Draw a signature, then we stamp it on the last page or every page.",
    done: "PDF has been signed!",
  },
  {
    id: "protect-pdf",
    title: "Protect PDF",
    blurb: "Encrypt a PDF with a password so only people you choose can open it.",
    category: "security",
    icon: "protect",
    tint: "blue",
    accept: PDF,
    minFiles: 1,
    maxFiles: 6,
    multiple: true,
    cta: "Protect PDF",
    hint: "Uses AES-256. Recipients will be asked for the password to open it.",
    done: "PDF has been protected!",
  },
  {
    id: "unlock-pdf",
    title: "Unlock PDF",
    blurb: "Remove PDF password security so you can use the file freely.",
    category: "security",
    icon: "unlock",
    tint: "orange",
    accept: PDF,
    minFiles: 1,
    maxFiles: 6,
    multiple: true,
    cta: "Unlock PDF",
    hint: "Enter the current password. The downloaded file opens without one.",
    done: "PDF has been unlocked!",
  },
  {
    id: "compare-pdf",
    title: "Compare PDF",
    blurb: "See two versions side by side and spot what changed.",
    category: "security",
    icon: "compare",
    tint: "blue",
    accept: PDF,
    minFiles: 2,
    maxFiles: 2,
    multiple: true,
    cta: "Compare PDFs",
    hint: "Upload two PDFs. We build a side-by-side comparison file.",
    done: "Comparison PDF is ready!",
  },
  {
    id: "ocr-pdf",
    title: "OCR PDF",
    blurb: "Extract selectable text and save a searchable copy of your PDF.",
    category: "ai",
    icon: "ocr",
    tint: "green",
    accept: PDF,
    minFiles: 1,
    maxFiles: 2,
    multiple: false,
    cta: "Extract text",
    hint: "Text PDFs are exported as-is. Scanned PDFs are read with OCR (English) in your browser; the first run downloads the OCR engine.",
    done: "Searchable PDF is ready!",
  },
  {
    id: "summarize-pdf",
    title: "AI Summarizer",
    blurb: "Get a concise summary of articles, reports and essays in seconds.",
    category: "ai",
    icon: "summary",
    tint: "rose",
    accept: PDF,
    minFiles: 1,
    maxFiles: 1,
    multiple: false,
    cta: "Summarize",
    hint: "We read the document and write a short briefing you can download.",
    done: "Summary is ready!",
  },
  {
    id: "translate-pdf",
    title: "Translate PDF",
    blurb: "Translate the text of a PDF while keeping a clean, readable layout.",
    category: "ai",
    icon: "translate",
    tint: "navy",
    accept: PDF,
    minFiles: 1,
    maxFiles: 1,
    multiple: false,
    cta: "Translate",
    hint: "Pick a language. The result is a new PDF you can share.",
    done: "Translated PDF is ready!",
  },
];

export function getTool(id: string): PdfTool | undefined {
  return TOOLS.find((t) => t.id === id);
}

export function toolsIn(category: CategoryId): PdfTool[] {
  if (category === "all") return TOOLS;
  return TOOLS.filter((t) => t.category === category);
}

export function searchTools(query: string): PdfTool[] {
  const q = query.trim().toLowerCase();
  if (!q) return TOOLS;
  const words = q.split(/\s+/).filter(Boolean);
  return TOOLS.filter((t) => {
    const hay = `${t.title} ${t.id.replace(/-/g, " ")} ${t.cta} ${t.blurb} ${t.category}`.toLowerCase();
    return words.every((w) => {
      const escaped = w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return new RegExp(`(^|[^a-z0-9])${escaped}`, "i").test(hay);
    });
  });
}

export function categoryLabel(id: string) {
  return CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

export function pickNoun(tool: PdfTool): string {
  if (tool.id === "convert-any") return "a PDF, Word, PowerPoint, Excel, image or text file";
  if (tool.id === "jpg-to-pdf" || tool.id === "scan-to-pdf") return tool.multiple ? "images" : "an image";
  if (tool.id === "word-to-pdf") return tool.multiple ? "Word files" : "a Word file";
  if (tool.id === "powerpoint-to-pdf") return tool.multiple ? "PowerPoint files" : "a PowerPoint file";
  if (tool.id === "excel-to-pdf") return tool.multiple ? "Excel files" : "an Excel file";
  if (tool.id === "html-to-pdf") return "HTML, a URL, or paste markup";
  if (tool.multiple) return "PDF files";
  return "a PDF file";
}

export function continueTools(fromId: ToolId, resultName: string): PdfTool[] {
  const ext = resultName.split(".").pop()?.toLowerCase() ?? "";
  let ids: ToolId[] = [];
  if (ext === "pdf") {
    ids = ["compress-pdf", "pdf-to-word", "pdf-to-jpg", "protect-pdf", "watermark", "edit-pdf", "sign-pdf"];
  } else if (ext === "docx") {
    ids = ["word-to-pdf", "edit-pdf"];
  } else if (ext === "pptx") {
    ids = ["powerpoint-to-pdf"];
  } else if (ext === "xlsx") {
    ids = ["excel-to-pdf"];
  } else if (ext === "jpg" || ext === "jpeg" || ext === "png") {
    ids = ["jpg-to-pdf", "edit-pdf"];
  } else if (ext === "txt" || ext === "md" || ext === "html") {
    ids = ["html-to-pdf", "edit-pdf"];
  } else if (ext === "zip") {
    ids = ["merge-pdf"];
  }
  return ids
    .filter((id) => id !== fromId)
    .map((id) => getTool(id))
    .filter((t): t is PdfTool => !!t)
    .slice(0, 6);
}

