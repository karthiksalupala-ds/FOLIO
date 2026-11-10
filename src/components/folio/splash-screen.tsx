import { useCallback, useEffect, useRef, useState } from "react";
import { WORD, drawWordIntro, makeWordIntro, pickPoints, sampleMask } from "@/lib/folio/particle-text";

const KEY = "folio-splash-seen";
const SHOW_MS = Math.round(WORD.total * 1000); // particles fly in, form the word, then fade away
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

const FONT_FAMILY = '"Bricolage Grotesque", "Nunito Sans", ui-sans-serif, system-ui, sans-serif';

/**
 * Full-screen particle field. Particles stream in from every side of the screen and settle into the word "Folio",
 * which then turns crisp. The word is drawn on the same canvas the particles were sampled from, so it lines up exactly.
 */
function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    let raf = 0;
    let stopped = false;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.scale(dpr, dpr);

    (async () => {
      // Wait (briefly) for the display font, so the particles form the real letter shapes.
      try {
        await Promise.race([document.fonts.load(`800 100px ${FONT_FAMILY}`), new Promise((r) => setTimeout(r, 1200))]);
      } catch {
        /* use the fallback font */
      }
      if (stopped) return;

      // Size the word so it fills most of the width on a phone, and stays elegant on a big screen.
      const probe = document.createElement("canvas").getContext("2d");
      if (!probe) return;
      probe.font = `800 100px ${FONT_FAMILY}`;
      const base = probe.measureText("Folio").width || 260;
      const size = Math.min(Math.max(48, (Math.min(w * 0.74, 620) / base) * 100), 190);
      const font = `800 ${size}px ${FONT_FAMILY}`;
      const letterSpacing = -0.045 * size;
      const word = { text: "Folio", font, letterSpacing, x: w / 2, y: h * 0.5 + size * 0.34 };

      // Draw the word once, read back which pixels are inked: those become the particles' resting places.
      const mask = document.createElement("canvas");
      mask.width = Math.round(w);
      mask.height = Math.round(h);
      const mctx = mask.getContext("2d", { willReadFrequently: true });
      if (!mctx) return;
      mctx.font = font;
      if ("letterSpacing" in mctx) (mctx as unknown as { letterSpacing: string }).letterSpacing = `${letterSpacing}px`;
      mctx.textAlign = "center";
      mctx.textBaseline = "alphabetic";
      mctx.fillStyle = "#000";
      mctx.fillText(word.text, word.x, word.y);
      const pixels = mctx.getImageData(0, 0, mask.width, mask.height).data;
      const step = w < 480 ? 3 : 2;
      const targets = pickPoints(sampleMask(pixels, mask.width, mask.height, step), w < 480 ? 1900 : 2800);

      const state = makeWordIntro(targets, w, h, reduce, word);
      const t0 = performance.now();
      const frame = (now: number) => {
        // Schedule the next frame first so one bad frame can never stop the animation.
        if (!reduce && !stopped) raf = requestAnimationFrame(frame);
        try {
          drawWordIntro(ctx as never, state, (now - t0) / 1000);
        } catch {
          /* skip this frame */
        }
      };
      raf = requestAnimationFrame(frame);
    })();

    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <h1 className="sr-only">Folio</h1>
      <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 block h-full w-full" style={{ background: "transparent" }} />
    </>
  );
}
