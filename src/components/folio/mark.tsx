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

/** The Folio logo: a folded page with an F, on the brand red. */
export function FolioBadge({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 128 128" className={cn("size-8", className)} role="img" aria-label="Folio">
      <rect width="128" height="128" rx="30" fill="#E5322D" />
      <path d="M38 28h38l18 18v54a4 4 0 0 1-4 4H38a4 4 0 0 1-4-4V32a4 4 0 0 1 4-4z" fill="#fff" />
      <path d="M76 28l18 18H80a4 4 0 0 1-4-4z" fill="#F4B7B4" />
      <path d="M48 60h30M48 60v30M48 74h22" stroke="#E5322D" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export function FolioWordmark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2 text-fg">
      <FolioBadge className="size-8" />
      {!compact && (
        <span className="text-[1.2rem] font-extrabold tracking-tight">
          Folio<span className="text-accent">PDF</span>
        </span>
      )}
    </span>
  );
}
