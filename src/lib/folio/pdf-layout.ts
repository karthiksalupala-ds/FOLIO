// Turns the lines and pictures found on a PDF page into document blocks (headings, paragraphs, tables, images),
// in reading order. Pure maths so it can be unit tested; the DOM-dependent extraction lives elsewhere.

export type LineBox = { text: string; left: number; top: number; width: number; height: number; fontSize: number; bold?: boolean; italic?: boolean; font?: "sans" | "serif" | "mono" };
export type ImageBox = { left: number; top: number; width: number; height: number; png: Uint8Array };

export type Block =
  | { kind: "para"; text: string; fontSize: number; bold: boolean; italic: boolean; font: "sans" | "serif" | "mono"; heading: 0 | 1 | 2 | 3 }
  | { kind: "table"; rows: string[][] }
  | { kind: "image"; width: number; height: number; png: Uint8Array };

type Row = { top: number; bottom: number; cells: LineBox[] };

export function medianFontSize(lines: LineBox[]): number {
  const sizes: number[] = [];
  for (const l of lines) for (let i = 0; i < Math.max(1, Math.min(40, l.text.length)); i++) sizes.push(l.fontSize);
  sizes.sort((a, b) => a - b);
  return sizes.length ? sizes[Math.floor(sizes.length / 2)] : 12;
}

/** Lines on the same baseline (cells of one row), top to bottom. */
function toRows(lines: LineBox[]): Row[] {
  const sorted = [...lines].sort((a, b) => a.top - b.top || a.left - b.left);
  const rows: Row[] = [];
  for (const l of sorted) {
    const mid = l.top + l.height / 2;
    const row = rows.find((r) => Math.abs((r.top + r.bottom) / 2 - mid) < Math.max(3, l.fontSize * 0.45));
    if (row) {
      row.cells.push(l);
      row.top = Math.min(row.top, l.top);
      row.bottom = Math.max(row.bottom, l.top + l.height);
    } else rows.push({ top: l.top, bottom: l.top + l.height, cells: [l] });
  }
  for (const r of rows) r.cells.sort((a, b) => a.left - b.left);
  return rows;
}

const sameColumns = (a: Row, b: Row, tol: number) => a.cells.length === b.cells.length && a.cells.every((c, i) => Math.abs(c.left - b.cells[i].left) <= tol);

export function buildBlocks(lines: LineBox[], images: ImageBox[], pageWidth: number): Block[] {
  const body = medianFontSize(lines);
  const rows = toRows(lines);
  type Item = { top: number; row?: Row; img?: ImageBox };
  const items: Item[] = [...rows.map((row) => ({ top: row.top, row })), ...images.map((img) => ({ top: img.top, img }))].sort((a, b) => a.top - b.top);

  const blocks: Block[] = [];
  const headingFor = (size: number, bold: boolean): 0 | 1 | 2 | 3 => (size >= body * 1.6 ? 1 : size >= body * 1.3 ? 2 : size >= body * 1.12 && bold ? 3 : 0);
  let i = 0;
  while (i < items.length) {
    const it = items[i];
    if (it.img) {
      blocks.push({ kind: "image", width: it.img.width, height: it.img.height, png: it.img.png });
      i++;
      continue;
    }
    const row = it.row!;
    // A run of rows with the same several columns is a table.
    if (row.cells.length >= 2) {
      const run: Row[] = [row];
      let j = i + 1;
      while (j < items.length && items[j].row && sameColumns(run[run.length - 1], items[j].row!, Math.max(8, body * 0.8))) {
        run.push(items[j].row!);
        j++;
      }
      if (run.length >= 2) {
        blocks.push({ kind: "table", rows: run.map((r) => r.cells.map((c) => c.text.trim())) });
        i = j;
        continue;
      }
    }
    // Otherwise a paragraph: join following rows that continue it (same size, small gap).
    const first = row.cells[0];
    const text = row.cells.map((c) => c.text.trim()).join("   ");
    const heading = headingFor(first.fontSize, !!first.bold);
    let para = text;
    let lastBottom = row.bottom;
    let j = i + 1;
    if (!heading && row.cells.length === 1) {
      while (j < items.length && items[j].row && items[j].row!.cells.length === 1) {
        const nx = items[j].row!;
        const c = nx.cells[0];
        const gap = nx.top - lastBottom;
        if (Math.abs(c.fontSize - first.fontSize) > 1.2 || gap > first.fontSize * 0.7 || Math.abs(c.left - first.left) > pageWidth * 0.12 || headingFor(c.fontSize, !!c.bold)) break;
        para += (para.endsWith("-") ? "" : " ") + c.text.trim();
        lastBottom = nx.bottom;
        j++;
      }
    }
    blocks.push({ kind: "para", text: para, fontSize: first.fontSize, bold: !!first.bold, italic: !!first.italic, font: first.font ?? "sans", heading });
    i = j;
  }
  return blocks;
}
