import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { FolioDoc, FolioMeta } from "./types";

interface FolioDB extends DBSchema {
  docs: {
    key: string;
    value: FolioDoc;
    indexes: { "by-updated": number };
  };
}

let dbp: Promise<IDBPDatabase<FolioDB>> | null = null;

function db() {
  if (!dbp) {
    dbp = openDB<FolioDB>("folio-studio", 1, {
      upgrade(database) {
        const store = database.createObjectStore("docs", { keyPath: "id" });
        store.createIndex("by-updated", "updatedAt");
      },
    });
  }
  return dbp;
}

export async function listDocs(): Promise<FolioMeta[]> {
  const all = await (await db()).getAll("docs");
  return all
    .map(({ bytes: _b, annotations: _a, pages: _p, html: _h, slides: _s, sheets: _sh, text: _t, watermark: _w, pageNumbers: _n, ...meta }) => meta)
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function getDoc(id: string): Promise<FolioDoc | undefined> {
  return (await db()).get("docs", id);
}

export async function putDoc(doc: FolioDoc): Promise<void> {
  await (await db()).put("docs", doc);
}

export async function deleteDoc(id: string): Promise<void> {
  await (await db()).delete("docs", id);
}
