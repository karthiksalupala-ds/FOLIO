// Fonts people can pick when editing text in a PDF. The same files are used for the on-screen preview
// and for embedding into the saved PDF, so what you see is what gets saved.

export type FontKind = "sans" | "serif" | "mono";

export type CatalogFont = {
  id: string;
  label: string;
  /** What it looks like / replaces, shown next to the name. */
  note: string;
  kind: FontKind;
  /** CSS family used for the on-screen preview (the @font-face names are in styles.css). */
  css: string;
};

export const FONT_CATALOG: CatalogFont[] = [
  { id: "liberation-sans", label: "Arial", note: "Liberation Sans", kind: "sans", css: '"Folio Liberation Sans", Arial, Helvetica, sans-serif' },
  { id: "carlito", label: "Calibri", note: "Carlito", kind: "sans", css: '"Folio Carlito", Calibri, sans-serif' },
  { id: "dejavu-sans", label: "DejaVu Sans", note: "wide and clear", kind: "sans", css: '"Folio DejaVu Sans", Verdana, sans-serif' },
  { id: "poppins", label: "Poppins", note: "rounded modern", kind: "sans", css: '"Folio Poppins", sans-serif' },
  { id: "liberation-serif", label: "Times New Roman", note: "Liberation Serif", kind: "serif", css: '"Folio Liberation Serif", "Times New Roman", Times, serif' },
  { id: "caladea", label: "Cambria", note: "Caladea", kind: "serif", css: '"Folio Caladea", Cambria, serif' },
  { id: "dejavu-serif", label: "DejaVu Serif", note: "sturdy serif", kind: "serif", css: '"Folio DejaVu Serif", Georgia, serif' },
  { id: "liberation-mono", label: "Courier New", note: "Liberation Mono", kind: "mono", css: '"Folio Liberation Mono", "Courier New", Courier, monospace' },
];

const BY_ID = new Map(FONT_CATALOG.map((f) => [f.id, f]));

/** The old three-way choice is still understood (older edits saved "sans", "serif" or "mono"). */
const GENERIC_DEFAULT: Record<FontKind, string> = { sans: "liberation-sans", serif: "liberation-serif", mono: "liberation-mono" };

export function isGenericFont(id: string | undefined): id is FontKind {
  return id === "sans" || id === "serif" || id === "mono";
}

export function catalogFont(id: string | undefined): CatalogFont | undefined {
  if (!id) return undefined;
  return BY_ID.get(isGenericFont(id) ? GENERIC_DEFAULT[id] : id);
}

export function fontKindOf(id: string | undefined): FontKind {
  if (isGenericFont(id)) return id;
  return BY_ID.get(id ?? "")?.kind ?? "sans";
}

/** Path (under /fonts/) of the file for one style, or null if the id is not a bundled font. */
export function fontFile(id: string | undefined, bold: boolean, italic: boolean): string | null {
  const f = catalogFont(id);
  if (!f) return null;
  const style = bold && italic ? "bolditalic" : bold ? "bold" : italic ? "italic" : "regular";
  return `pdf/${f.id}-${style}.ttf`;
}

export function cssFamilyFor(id: string | undefined): string {
  return catalogFont(id)?.css ?? FONT_CATALOG[0].css;
}

/** Best bundled match for a font found in a PDF (from its real name and its generic kind). */
export function catalogIdFor(name: string | undefined, kind: FontKind): string {
  const n = (name ?? "").toLowerCase();
  if (/calibri|carlito/.test(n)) return "carlito";
  if (/cambria|caladea/.test(n)) return "caladea";
  if (/poppins/.test(n)) return "poppins";
  if (/dejavu.*(serif)/.test(n) && !/sans/.test(n)) return "dejavu-serif";
  if (/dejavu/.test(n)) return "dejavu-sans";
  return GENERIC_DEFAULT[kind];
}
