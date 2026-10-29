import type { LucideIcon } from "lucide-react";
import {
  Combine,
  Scissors,
  LayoutGrid,
  RotateCw,
  Minimize2,
  Wrench,
  FileType,
  Presentation,
  Table2,
  Image,
  FileImage,
  Hash,
  FileText,
  FileCode2,
  PenLine,
  Droplets,
  Crop,
  EyeOff,
  Stamp,
  Lock,
  Unlock,
  Columns2,
  ScanText,
  Languages,
  AlignLeft,
  Camera,
  Globe,
  Files,
  Archive,
  FileMinus,
  ClipboardList,
  ArrowLeftRight,
} from "lucide-react";
import type { ToolId, ToolTint } from "@/lib/folio/catalog";
import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = {
  merge: Combine,
  split: Scissors,
  extract: Files,
  remove: FileMinus,
  organize: LayoutGrid,
  rotate: RotateCw,
  compress: Minimize2,
  repair: Wrench,
  pdfa: Archive,
  word: FileType,
  ppt: Presentation,
  excel: Table2,
  jpg: Image,
  png: FileImage,
  md: Hash,
  txt: FileText,
  html: Globe,
  scan: Camera,
  edit: PenLine,
  forms: ClipboardList,
  convert: ArrowLeftRight,
  watermark: Droplets,
  numbers: Hash,
  crop: Crop,
  redact: EyeOff,
  sign: Stamp,
  protect: Lock,
  unlock: Unlock,
  compare: Columns2,
  ocr: ScanText,
  summary: AlignLeft,
  translate: Languages,
  code: FileCode2,
};

const TINT: Record<ToolTint, string> = {
  red: "bg-tool-red",
  orange: "bg-tool-orange",
  green: "bg-tool-green",
  blue: "bg-tool-blue",
  navy: "bg-tool-navy",
  teal: "bg-tool-teal",
  slate: "bg-tool-slate",
  rose: "bg-tool-rose",
};

export function ToolGlyph({
  icon,
  tint,
  className,
  size = "md",
}: {
  icon: string;
  tint: ToolTint;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const Icon = ICONS[icon] ?? FileText;
  const box = size === "lg" ? "size-16 rounded-2xl" : size === "sm" ? "size-9 rounded-md" : "size-12 rounded-[14px]";
  const ic = size === "lg" ? "size-8" : size === "sm" ? "size-4" : "size-6";
  return (
    <span className={cn("grid place-items-center text-on-tool", TINT[tint], box, className)}>
      <Icon className={ic} strokeWidth={1.8} />
    </span>
  );
}

export function iconFor(_id: ToolId, icon: string) {
  return ICONS[icon] ?? FileText;
}
