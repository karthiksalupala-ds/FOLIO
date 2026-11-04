import type { FontLook } from "./text-style.ts";
import type { TextItem } from "./pdf.ts";

export type TextLine = {
  id: string;
  left: number;
  top: number;
  width: number;
  height: number;
  fontSize: number;
  text: string;
  nx: number;
  ny: number;
  nw: number;
  nh: number;
  look?: FontLook;
};


export function groupLines(items: TextItem[]): TextLine[] {
  if (!items.length) return [];
  const sample = items.find((it) => it.nw > 0.002) ?? items[0];
  const vw = sample.nw > 0.002 ? sample.width / sample.nw : 1;
  const vh = sample.nh > 0.002 ? sample.height / sample.nh : 1;
  const sorted = [...items].sort((a, b) => a.top - b.top || a.left - b.left);
  const lines: Array<TextLine & { right: number }> = [];
  for (const it of sorted) {
    const last = lines[lines.length - 1];
    const same =
      last &&
      Math.abs(last.top + last.height / 2 - (it.top + it.height / 2)) < Math.max(3, it.fontSize * 0.45);
    if (last && same) {
      if (it.left > last.right + 1.2 && !last.text.endsWith(" ") && !it.str.startsWith(" ")) last.text += " ";
      last.text += it.str;
      last.right = Math.max(last.right, it.left + it.width);
      last.width = Math.max(8, last.right - last.left);
      last.height = Math.max(last.height, it.height, it.fontSize);
      last.fontSize = Math.max(last.fontSize, it.fontSize);
      continue;
    }
    lines.push({
      id: `ln_${lines.length}_${Math.round(it.left)}_${Math.round(it.top)}`,
      left: it.left,
      top: it.top,
      width: Math.max(it.width, 8),
      height: Math.max(it.height, it.fontSize, 10),
      fontSize: it.fontSize || 12,
      text: it.str,
      look: it.look,
      right: it.left + Math.max(it.width, 8),
      nx: 0,
      ny: 0,
      nw: 0,
      nh: 0,
    });
  }
  const crowded = lines.length <= 600;
  const boxLimit = (l: (typeof lines)[number]) => {
    // Distance down to the next line that overlaps this one horizontally.
    let limit = Infinity;
    const top = l.top - l.fontSize * 0.15;
    for (const m of lines) {
      if (m === l || m.top <= l.top + 1) continue;
      const overlap = Math.min(l.right, m.right) - Math.max(l.left, m.left);
      // Stop at the top of the next line's own box (which starts 0.15 x its font size above its text).
      if (overlap > 0.25 * Math.min(l.width, m.width)) limit = Math.min(limit, m.top - m.fontSize * 0.15 - top);
    }
    return limit;
  };
  return lines.map((l) => ({
    id: l.id,
    left: l.left,
    top: l.top,
    width: l.width,
    height: l.height,
    fontSize: l.fontSize,
    text: l.text,
    look: l.look,
    nx: l.left / vw,
    ny: Math.max(0, (l.top - l.fontSize * 0.15) / vh),
    nw: l.width / vw,
    nh: Math.max(l.height, Math.min(l.height * 1.35, crowded ? boxLimit(l) : Infinity)) / vh,
  }));
}
