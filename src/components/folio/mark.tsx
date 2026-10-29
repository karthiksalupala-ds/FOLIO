import { cn } from "@/lib/utils";

export function FolioMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn("size-6", className)}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 21.35c-4.8-3.16-8.5-6.7-8.5-10.7C3.5 7.4 5.9 5.2 8.7 5.2c1.6 0 3.1.76 4.05 1.96A5.13 5.13 0 0 1 16.8 5.2c2.8 0 5.2 2.2 5.2 5.45 0 4-3.7 7.54-8.5 10.7Z" />
    </svg>
  );
}

export function FolioWordmark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2 text-fg">
      <span className="grid size-8 place-items-center rounded-md bg-accent text-accent-fg">
        <FolioMark className="size-4" />
      </span>
      {!compact && (
        <span className="text-[1.2rem] font-extrabold tracking-tight">
          Folio<span className="text-accent">PDF</span>
        </span>
      )}
    </span>
  );
}
