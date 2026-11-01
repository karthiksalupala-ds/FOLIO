// Annotations point at a page by its position. Whenever pages are removed, moved or inserted,
// the positions change, so the annotations have to follow their page.

type OnPage = { page: number };

/** Apply an old-position to new-position mapping. Returning null drops the annotation. */
export function remapAnnots<T extends OnPage>(annots: T[], map: (oldPage: number) => number | null): T[] {
  const out: T[] = [];
  for (const a of annots) {
    const next = map(a.page);
    if (next === null) continue;
    out.push(next === a.page ? a : { ...a, page: next });
  }
  return out;
}

export const deleteMap = (removed: number) => (j: number) => (j === removed ? null : j > removed ? j - 1 : j);

export const moveMap = (from: number, to: number) => (j: number) => {
  if (j === from) return to;
  if (from < to && j > from && j <= to) return j - 1;
  if (from > to && j >= to && j < from) return j + 1;
  return j;
};

/** A new page was inserted right after position `i`. */
export const insertAfterMap = (i: number) => (j: number) => (j > i ? j + 1 : j);

/** Page `i` was duplicated: pages after it shift down and the copy gets its own copy of the annotations. */
export function duplicateAnnots<T extends OnPage & { id: string }>(annots: T[], i: number, newId: () => string): T[] {
  const shifted = remapAnnots(annots, insertAfterMap(i));
  const copies = annots.filter((a) => a.page === i).map((a) => ({ ...a, id: newId(), page: i + 1 }));
  return [...shifted, ...copies];
}
