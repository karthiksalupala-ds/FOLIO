import { useCallback, useEffect, useRef, useState } from "react";
import { drawOrb, makeOrb } from "@/lib/folio/orb";

const KEY = "folio-splash-seen";
const SHOW_MS = 2000; // total time on screen before fading away
const FADE_MS = 550;
const BG = "#101116";

/**
 * Opening screen: the Folio wordmark with a particle orb that gathers itself and turns beneath it.
 * Shown once per browser session. Tap anywhere to skip.
 */
export function SplashScreen({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<"boot" | "show" | "leave" | "done">("boot");
  const timers = useRef<number[]>([]);

  const finish = useCallback(() => {
    setPhase((p) => (p === "show" ? "leave" : p));
    timers.current.push(
      window.setTimeout(() => {
        try {
          sessionStorage.setItem(KEY, "1");
        } catch {
          /* private mode */
        }
        setPhase("done");
      }, FADE_MS),
    );
  }, []);

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
    timers.current.push(window.setTimeout(finish, SHOW_MS));
    const list = timers.current;
    return () => list.forEach((t) => window.clearTimeout(t));
  }, [finish]);

  if (phase === "boot") {
    // Same colour as the splash so there is no flash while the page hydrates.
    return <div className="fixed inset-0 z-[200]" style={{ background: BG }} aria-hidden="true" />;
  }

  const visible = phase === "show" || phase === "leave";
  return (
    <>
      {visible && (
        <div
          role="status"
          aria-live="polite"
          aria-label="Loading Folio"
          onClick={finish}
          className="fixed inset-0 z-[200] flex cursor-pointer flex-col items-center justify-center gap-7 px-6 transition-opacity ease-out"
          style={{
            background: `radial-gradient(ellipse at 50% 58%, #1d1a1f 0%, ${BG} 62%)`,
            opacity: phase === "leave" ? 0 : 1,
            transitionDuration: `${FADE_MS}ms`,
          }}
        >
          <h1 className="splash-word font-display text-[clamp(3.4rem,15vw,5.5rem)] leading-none font-extrabold tracking-[-0.045em] text-[#f5f5f8]">
            Folio
          </h1>
          <ParticleOrb />
        </div>
      )}
      <div className={phase === "done" ? "opacity-100" : "pointer-events-none opacity-0"}>{children}</div>
    </>
  );
}

function ParticleOrb() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const css = Math.min(280, Math.round(window.innerWidth * 0.68));
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = css * dpr;
    canvas.height = css * dpr;
    canvas.style.width = `${css}px`;
    canvas.style.height = `${css}px`;

    const orb = makeOrb(css < 220 ? 650 : 1000, css * dpr, dpr, reduce);
    const t0 = performance.now();
    let raf = 0;
    const frame = (now: number) => {
      // Schedule the next frame first so one bad frame can never stop the animation.
      if (!reduce) raf = requestAnimationFrame(frame);
      try {
        drawOrb(ctx, orb, (now - t0) / 1000);
      } catch {
        /* skip this frame */
      }
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  return <canvas ref={ref} aria-hidden="true" className="block" />;
}
