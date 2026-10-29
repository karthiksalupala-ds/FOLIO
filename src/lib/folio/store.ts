import { create } from "zustand";
import type { Annot, DocKind, FolioDoc, FolioMeta, PageMeta, Tool } from "./types";
import { kindFromName } from "./types";
import { uid, asArrayBuffer } from "@/lib/utils";
import * as idb from "./idb";
import { defaultPages, openPdfJs } from "./pdf";
import {
  cleanHtml,
  htmlFromDocx,
  mdToHtml,
  sheetFromCsv,
  sheetsFromXlsx,
  slidesFromPptx,
  defaultHtml,
} from "./office";
import {
  makeBlankPdf,
  makeDeck,
  makeLetter,
  makeResume,
  makeSheet,
  makeWelcomePdf,
} from "./templates";

type Snapshot = Pick<FolioDoc, "annotations" | "pages" | "html" | "slides" | "sheets" | "text">;

type FolioState = {
  hydrated: boolean;
  library: FolioMeta[];
  current: FolioDoc | null;
  tool: Tool;
  color: string;
  strokeWidth: number;
  fontSize: number;
  stamp: "approved" | "confidential" | "draft" | "signed" | "rejected";
  selectedId: string | null;
  pageIndex: number;
  zoom: number;
  query: string;
  past: Snapshot[];
  future: Snapshot[];
  hydrate: () => Promise<void>;
  refreshLibrary: () => Promise<void>;
  openId: (id: string) => Promise<FolioDoc | null>;
  importFiles: (files: FileList | File[]) => Promise<FolioDoc[]>;
  newFromTemplate: (
    kind: "pdf" | "letter" | "resume" | "deck" | "sheet" | "blank-pdf",
  ) => Promise<FolioDoc>;
  saveCurrent: () => Promise<void>;
  patchCurrent: (patch: Partial<FolioDoc>, undoable?: boolean) => void;
  setTool: (tool: Tool) => void;
  setColor: (color: string) => void;
  setStroke: (n: number) => void;
  setFontSize: (n: number) => void;
  setZoom: (n: number) => void;
  setPage: (i: number) => void;
  addAnnot: (a: Annot) => void;
  updateAnnot: (id: string, patch: Partial<Annot>) => void;
  removeAnnot: (id: string) => void;
  select: (id: string | null) => void;
  undo: () => void;
  redo: () => void;
  rotatePage: (i: number) => void;
  deletePage: (i: number) => void;
  duplicatePage: (i: number) => void;
  movePage: (from: number, to: number) => void;
  insertBlankPage: (i: number) => Promise<void>;
  rename: (name: string) => void;
  removeFromLibrary: (id: string) => Promise<void>;
};

function snap(doc: FolioDoc): Snapshot {
  return {
    annotations: doc.annotations,
    pages: doc.pages,
    html: doc.html,
    slides: doc.slides,
    sheets: doc.sheets,
    text: doc.text,
  };
}

function cloneSnap(s: Snapshot): Snapshot {
  return structuredClone(s);
}

export const useFolio = create<FolioState>((set, get) => ({
  hydrated: false,
  library: [],
  current: null,
  tool: "select",
  color: "#f2d56b",
  strokeWidth: 2.5,
  fontSize: 16,
  stamp: "approved",
  selectedId: null,
  pageIndex: 0,
  zoom: 1.25,
  query: "",
  past: [],
  future: [],

  hydrate: async () => {
    if (get().hydrated) return;
    let library = await idb.listDocs();
    if (!library.length) {
      const welcome = await makeWelcomePdf();
      const letter = makeLetter();
      const deck = makeDeck();
      await idb.putDoc(welcome);
      await idb.putDoc(letter);
      await idb.putDoc(deck);
      library = await idb.listDocs();
    }
    set({ hydrated: true, library });
  },

  refreshLibrary: async () => {
    set({ library: await idb.listDocs() });
  },

  openId: async (id) => {
    const doc = await idb.getDoc(id);
    if (!doc) return null;
    set({
      current: doc,
      pageIndex: 0,
      selectedId: null,
      past: [],
      future: [],
      zoom: doc.kind === "pdf" || doc.kind === "image" ? 1.15 : 1,
    });
    return doc;
  },

  importFiles: async (files) => {
    const list = Array.from(files);
    const created: FolioDoc[] = [];
    for (const file of list) {
      const doc = await ingestFile(file);
      await idb.putDoc(doc);
      created.push(doc);
    }
    await get().refreshLibrary();
    return created;
  },

  newFromTemplate: async (kind) => {
    let doc: FolioDoc;
    if (kind === "pdf" || kind === "blank-pdf") doc = await makeBlankPdf();
    else if (kind === "letter") doc = makeLetter();
    else if (kind === "resume") doc = makeResume();
    else if (kind === "deck") doc = makeDeck();
    else doc = makeSheet();
    await idb.putDoc(doc);
    await get().refreshLibrary();
    set({ current: doc, pageIndex: 0, past: [], future: [], selectedId: null });
    return doc;
  },

  saveCurrent: async () => {
    const doc = get().current;
    if (!doc) return;
    const next = { ...doc, updatedAt: Date.now(), size: doc.bytes.byteLength };
    await idb.putDoc(next);
    set({ current: next });
    await get().refreshLibrary();
  },

  patchCurrent: (patch, undoable = true) => {
    const doc = get().current;
    if (!doc) return;
    if (undoable) {
      set({ past: [...get().past.slice(-40), cloneSnap(snap(doc))], future: [] });
    }
    set({ current: { ...doc, ...patch, updatedAt: Date.now() } });
  },

  setTool: (tool) => set({ tool, selectedId: tool === "select" ? get().selectedId : null }),
  setColor: (color) => set({ color }),
  setStroke: (strokeWidth) => set({ strokeWidth }),
  setFontSize: (fontSize) => set({ fontSize }),
  setZoom: (zoom) => set({ zoom: Math.min(2.6, Math.max(0.4, zoom)) }),
  setPage: (pageIndex) => set({ pageIndex, selectedId: null }),

  addAnnot: (a) => {
    const doc = get().current;
    if (!doc) return;
    get().patchCurrent({ annotations: [...doc.annotations, a] });
    set({ selectedId: a.id });
  },

  updateAnnot: (id, patch) => {
    const doc = get().current;
    if (!doc) return;
    get().patchCurrent({
      annotations: doc.annotations.map((a) => (a.id === id ? ({ ...a, ...patch } as Annot) : a)),
    });
  },

  removeAnnot: (id) => {
    const doc = get().current;
    if (!doc) return;
    get().patchCurrent({ annotations: doc.annotations.filter((a) => a.id !== id) });
    if (get().selectedId === id) set({ selectedId: null });
  },

  select: (selectedId) => set({ selectedId, tool: "select" }),

  undo: () => {
    const { past, current, future } = get();
    if (!current || !past.length) return;
    const prev = past[past.length - 1];
    set({
      past: past.slice(0, -1),
      future: [...future, cloneSnap(snap(current))],
      current: { ...current, ...cloneSnap(prev), updatedAt: Date.now() },
    });
  },

  redo: () => {
    const { future, current, past } = get();
    if (!current || !future.length) return;
    const next = future[future.length - 1];
    set({
      future: future.slice(0, -1),
      past: [...past, cloneSnap(snap(current))],
      current: { ...current, ...cloneSnap(next), updatedAt: Date.now() },
    });
  },

  rotatePage: (i) => {
    const doc = get().current;
    if (!doc) return;
    const pages = doc.pages.map((p, idx) =>
      idx === i
        ? { ...p, rotation: (((p.rotation + 90) % 360) as PageMeta["rotation"]) }
        : p,
    );
    get().patchCurrent({ pages });
  },

  deletePage: (i) => {
    const doc = get().current;
    if (!doc || doc.pages.length <= 1) return;
    const pages = doc.pages.filter((_, idx) => idx !== i);
    get().patchCurrent({ pages });
    set({ pageIndex: Math.min(i, pages.length - 1) });
  },

  duplicatePage: (i) => {
    const doc = get().current;
    if (!doc) return;
    const src = doc.pages[i];
    const copy: PageMeta = { ...src, id: uid("pg") };
    const pages = [...doc.pages.slice(0, i + 1), copy, ...doc.pages.slice(i + 1)];
    get().patchCurrent({ pages });
  },

  movePage: (from, to) => {
    const doc = get().current;
    if (!doc) return;
    const pages = [...doc.pages];
    const [item] = pages.splice(from, 1);
    pages.splice(to, 0, item);
    get().patchCurrent({ pages });
    set({ pageIndex: to });
  },

  insertBlankPage: async (i) => {
    const doc = get().current;
    if (!doc || doc.kind !== "pdf") return;
    const { PDFDocument } = await import("pdf-lib");
    const src = await PDFDocument.load(doc.bytes, { ignoreEncryption: true });
    const blank = src.addPage([612, 792]);
    const idx = src.getPages().indexOf(blank);
    const bytes = await src.save();
    const pages = [...doc.pages];
    pages.splice(i + 1, 0, { id: uid("pg"), source: idx, rotation: 0 });
    get().patchCurrent({
      bytes: asArrayBuffer(bytes),
      pages,
    });
  },

  rename: (name) => {
    const doc = get().current;
    if (!doc) return;
    get().patchCurrent({ name }, false);
  },

  removeFromLibrary: async (id) => {
    await idb.deleteDoc(id);
    if (get().current?.id === id) set({ current: null });
    await get().refreshLibrary();
  },
}));

async function ingestFile(file: File): Promise<FolioDoc> {
  const bytes = await file.arrayBuffer();
  const kind: DocKind = kindFromName(file.name);
  const t = Date.now();
  const doc: FolioDoc = {
    id: uid("doc"),
    name: file.name,
    kind,
    createdAt: t,
    updatedAt: t,
    bytes,
    size: bytes.byteLength,
    annotations: [],
    pages: defaultPages(1),
  };

  try {
    if (kind === "pdf") {
      const pdf = await openPdfJs(bytes);
      doc.pages = defaultPages(pdf.numPages);
      await pdf.cleanup();
    } else if (kind === "docx") {
      doc.html = await cleanHtml(await htmlFromDocx(bytes));
    } else if (kind === "pptx") {
      doc.slides = await slidesFromPptx(bytes);
      doc.pages = defaultPages(doc.slides.length);
    } else if (kind === "xlsx") {
      doc.sheets = await sheetsFromXlsx(bytes);
    } else if (kind === "csv") {
      const text = new TextDecoder().decode(bytes);
      doc.sheets = [sheetFromCsv(text)];
      doc.text = text;
    } else if (kind === "md") {
      const text = new TextDecoder().decode(bytes);
      doc.text = text;
      doc.html = mdToHtml(text);
    } else if (kind === "html") {
      doc.html = await cleanHtml(new TextDecoder().decode(bytes));
    } else if (kind === "txt" || kind === "rtf") {
      const text = new TextDecoder().decode(bytes);
      doc.text = text;
      doc.html = defaultHtml(file.name.replace(/\.[^.]+$/, ""), `<p>${escapeP(text)}</p>`);
    } else if (kind === "image") {
      doc.pages = defaultPages(1);
    }
  } catch (err) {
    console.warn("ingest", err);
    const text = new TextDecoder().decode(bytes).slice(0, 20_000);
    doc.kind = "txt";
    doc.text = text;
    doc.html = defaultHtml(file.name, `<p>${escapeP(text)}</p>`);
  }
  return doc;
}

function escapeP(s: string) {
  return s
    .replace(/&/g, "&" + "amp;")
    .replace(/</g, "&" + "lt;")
    .replace(/>/g, "&" + "gt;")
    .replace(/\n/g, "<br/>");
}
