import { useEffect, useState } from "react";

const KEY = "folio-splash-seen";

/**
 * First paint when the user opens Folio: a paper card with the brand mark
 * and a short buffer, then the normal app. Once per browser session.
 */
export function SplashScreen({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<"boot" | "show" | "done">("boot");

  useEffect(() => {
    try {
      if (sessionStorage.getItem(KEY) === "1") {
        setPhase("done");
        return;
      }
    } catch {
      /* private mode */
    }
    setPhase("show");
    const t = setTimeout(() => {
      try {
        sessionStorage.setItem(KEY, "1");
      } catch {
        /* ignore */
      }
      setPhase("done");
    }, 2200);
    return () => clearTimeout(t);
  }, []);

  if (phase === "boot") {
    return <div className="fixed inset-0 z-[200] bg-[#1a1b20]" aria-hidden="true" />;
  }

  return (
    <>
      {phase === "show" && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-[#1a1b20] px-6"
          role="status"
          aria-live="polite"
          aria-label="Loading Folio"
        >
          <div className="relative w-full max-w-sm">
            <div
              className="pointer-events-none absolute -inset-8 rounded-[2rem] opacity-40 blur-2xl"
              style={{
                background:
                  "radial-gradient(ellipse at 50% 40%, rgba(229,50,45,0.35), transparent 70%)",
              }}
              aria-hidden="true"
            />
            <div className="relative overflow-hidden rounded-2xl bg-[#f6f1e8] px-8 pt-12 pb-10 text-center shadow-[0_28px_60px_-20px_rgba(0,0,0,0.55)] ring-1 ring-black/10">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[42%]" aria-hidden="true">
                <svg width="36" height="48" viewBox="0 0 36 48" fill="none">
                  <path
                    d="M12 18V10a6 6 0 0 1 12 0v16a4 4 0 0 1-8 0V14"
                    stroke="#c43a2f"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div
                className="absolute right-5 bottom-6 grid size-11 place-items-center rounded-full bg-[#9c1f1a] text-[10px] font-bold tracking-wide text-[#f6e4a8] shadow-md"
                aria-hidden="true"
              >
                FP
              </div>
              <h1 className="font-display text-[3.25rem] leading-none font-extrabold tracking-[-0.04em] text-[#2a2a2e]">
                Folio
              </h1>
              <p className="mt-3 text-sm font-semibold tracking-wide text-[#6b6b72]">
                Every PDF tool in one place
              </p>
              <div className="mt-10 flex flex-col items-center gap-3">
                <span className="splash-spin size-8 rounded-full border-[3px] border-[#e0d8cc] border-t-[#e5322d]" />
                <p className="text-xs font-semibold tracking-wide text-[#8a8a92] uppercase">
                  Opening…
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className={phase === "show" ? "pointer-events-none opacity-0" : "opacity-100 transition-opacity duration-500"}>
        {children}
      </div>
    </>
  );
}
