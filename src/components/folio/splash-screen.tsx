import { useCallback, useEffect, useRef, useState } from "react";
import { easeOutCubic, fibonacciSphere, project, rotate } from "@/lib/folio/orb";

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

    const count = css < 220 ? 650 : 1000;
    const base = fibonacciSphere(count);
    // Each particle starts scattered outward and gathers onto the sphere, a little later for some.
    const seeds = base.map((_, i) => {
      const a = Math.sin(i * 12.9898) * 43758.5453;
      const b = Math.sin(i * 78.233) * 12345.6789;
      return { dist: 1.6 + (a - Math.floor(a)) * 2.4, delay: (b - Math.floor(b)) * 0.35 };
    });

    const radius = (css * dpr) / 2 / 1.55;
    const c = (css * dpr) / 2;
    let raf = 0;
    const t0 = performance.now();

    const draw = (now: number) => {
      const t = reduce ? 3 : (now - t0) / 1000;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // soft glow behind the orb
      const glow = ctx.createRadialGradient(c, c, 0, c, c, radius * 1.45);
      glow.addColorStop(0, "rgba(229,50,45,0.20)");
      glow.addColorStop(1, "rgba(229,50,45,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.globalCompositeOperation = "lighter";
      const breathe = 1 + Math.sin(t * 2.2) * 0.025;
      const ry = t * 0.55;
      const rx = 0.38 + Math.sin(t * 0.4) * 0.08;
      for (let i = 0; i < base.length; i++) {
        const s = seeds[i];
        const k = easeOutCubic((t - s.delay) / 1.15); // 0 = scattered, 1 = on the sphere
        const out = 1 + (1 - k) * s.dist;
        const p = rotate({ x: base[i].x * out, y: base[i].y * out, z: base[i].z * out }, ry, rx);
        const q = project(p, radius * breathe, c, c);
        const near = q.depth;
        const alpha = (0.18 + near * 0.8) * (0.25 + 0.75 * k);
        const size = (0.7 + near * 1.5) * q.scale * dpr * 0.75;
        // far side deep red, near side warm white
        const r = 229 + Math.round(26 * near);
        const g = 50 + Math.round(120 * near * near);
        const b = 45 + Math.round(95 * near * near);
        ctx.fillStyle = `rgba(${r},${g},${b},${alpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(q.x, q.y, size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";
      if (!reduce) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return <canvas ref={ref} aria-hidden="true" className="block" />;
}
