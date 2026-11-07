import { useCallback, useEffect, useRef, useState } from "react";
import { drawIntro, INTRO, makeIntro } from "@/lib/folio/orb";

const KEY = "folio-splash-seen";
const SHOW_MS = Math.round(INTRO.total * 1000); // gather, big orb, shrink, settle, then fade
const FADE_MS = 600;
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
          className="fixed inset-0 z-[200] flex cursor-pointer items-center justify-center overflow-hidden px-6 transition-opacity ease-out"
          style={{
            background: `radial-gradient(ellipse at 50% 58%, #1d1a1f 0%, ${BG} 62%)`,
            opacity: phase === "leave" ? 0 : 1,
            transitionDuration: `${FADE_MS}ms`,
          }}
        >
          <ParticleField />
        </div>
      )}
      <div className={phase === "done" ? "opacity-100" : "pointer-events-none opacity-0"}>{children}</div>
    </>
  );
}

const GAP = 24; // space between the wordmark and the small orb

/**
 * Full-screen particle field. Particles stream in from every side and gather into an orb that fills the
 * screen; the orb then shrinks and settles below the "Folio" wordmark, turning the whole time.
 */
function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const spacerRef = useRef<HTMLDivElement>(null);
  const [orbSize] = useState(() =>
    typeof window === "undefined" ? 220 : Math.round(Math.min(window.innerWidth * 0.54, 236)),
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const spacer = spacerRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !spacer || !ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.scale(dpr, dpr);

    // The small orb rests exactly in the empty slot under the wordmark.
    const box = spacer.getBoundingClientRect();
    const rest = { cx: box.left + box.width / 2, cy: box.top + box.height / 2, r: box.width / 2 };
    const state = makeIntro(w < 480 ? 1100 : 1500, w, h, rest, reduce);

    const t0 = performance.now();
    let raf = 0;
    const frame = (now: number) => {
      // Schedule the next frame first so one bad frame can never stop the animation.
      if (!reduce) raf = requestAnimationFrame(frame);
      try {
        drawIntro(ctx, state, (now - t0) / 1000);
      } catch {
        /* skip this frame */
      }
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="absolute inset-0 block h-full w-full"
        style={{ background: "transparent" }}
      />
      <div className="relative z-10 flex flex-col items-center" style={{ gap: GAP }}>
        <h1 className="splash-word font-display text-[clamp(3.4rem,15vw,5.5rem)] leading-none font-extrabold tracking-[-0.045em] text-[#f5f5f8]">
          Folio
        </h1>
        <div ref={spacerRef} style={{ width: orbSize, height: orbSize }} aria-hidden="true" />
      </div>
    </>
  );
}
