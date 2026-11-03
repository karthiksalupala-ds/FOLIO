import { useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function Spinner({ className = "size-5" }: { className?: string }) {
  return <Loader2 className={cn("motion-safe:animate-spin", className)} aria-hidden="true" />;
}

/**
 * Thin bar across the top of the screen while the app is moving to another page.
 * It waits a moment before showing so instant navigations don't flicker.
 */
export function RouteProgress() {
  const busy = useRouterState({ select: (s) => s.isLoading || s.status === "pending" });
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!busy) {
      setShow(false);
      return;
    }
    const t = setTimeout(() => setShow(true), 120);
    return () => clearTimeout(t);
  }, [busy]);
  if (!show) return null;
  return (
    <div
      role="progressbar"
      aria-label="Loading page"
      className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-1 overflow-hidden bg-accent/20"
    >
      <div className="route-progress h-full w-1/3 bg-accent" />
    </div>
  );
}

/** Shown in place of a page that is still loading. */
export function PendingScreen({ label = "Loading" }: { label?: string }) {
  return (
    <div className="grid min-h-[60dvh] place-items-center px-6" role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-3 text-muted">
        <Spinner className="size-8 text-accent" />
        <p className="text-sm font-semibold">{label}…</p>
      </div>
    </div>
  );
}
