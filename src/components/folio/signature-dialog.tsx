import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SignatureDialog({
  open,
  onOpenChange,
  onSign,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSign: (dataUrl: string) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [mode, setMode] = useState<"draw" | "type">("draw");
  const [typed, setTyped] = useState("");

  useEffect(() => {
    if (!open) return;
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    c.width = 520 * dpr;
    c.height = 180 * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = "#f3eee4";
    ctx.fillRect(0, 0, 520, 180);
    ctx.strokeStyle = "#1c1917";
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, [open, mode]);

  function pos(e: React.PointerEvent<HTMLCanvasElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Signature</DialogTitle>
          <DialogDescription>Draw or type a signature, then place it on the page.</DialogDescription>
        </DialogHeader>
        <div className="mb-3 flex gap-2">
          <Button size="sm" variant={mode === "draw" ? "default" : "secondary"} onClick={() => setMode("draw")}>
            Draw
          </Button>
          <Button size="sm" variant={mode === "type" ? "default" : "secondary"} onClick={() => setMode("type")}>
            Type
          </Button>
        </div>
        {mode === "draw" ? (
          <canvas
            ref={canvasRef}
            className="h-[180px] w-full touch-none rounded-lg paper-grain"
            onPointerDown={(e) => {
              drawing.current = true;
              const ctx = e.currentTarget.getContext("2d");
              if (!ctx) return;
              const p = pos(e);
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              e.currentTarget.setPointerCapture(e.pointerId);
            }}
            onPointerMove={(e) => {
              if (!drawing.current) return;
              const ctx = e.currentTarget.getContext("2d");
              if (!ctx) return;
              const p = pos(e);
              ctx.lineTo(p.x, p.y);
              ctx.stroke();
            }}
            onPointerUp={() => {
              drawing.current = false;
            }}
          />
        ) : (
          <div className="space-y-3">
            <Input
              placeholder="Your name"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
            />
            <div className="paper-grain flex h-[120px] items-center justify-center rounded-lg px-4">
              <span className="font-display text-3xl text-ink italic">{typed || "Signature"}</span>
            </div>
          </div>
        )}
        <div className="mt-4 flex justify-end gap-2">
          <Button
            variant="ghost"
            onClick={() => {
              setTyped("");
              const c = canvasRef.current;
              const ctx = c?.getContext("2d");
              if (c && ctx) {
                ctx.fillStyle = "#f3eee4";
                ctx.fillRect(0, 0, c.width, c.height);
              }
            }}
          >
            Clear
          </Button>
          <Button
            onClick={() => {
              if (mode === "type") {
                const c = document.createElement("canvas");
                c.width = 640;
                c.height = 200;
                const ctx = c.getContext("2d");
                if (!ctx) return;
                ctx.fillStyle = "transparent";
                ctx.clearRect(0, 0, 640, 200);
                ctx.fillStyle = "#1c1917";
                ctx.font = "italic 64px Fraunces, Georgia, serif";
                ctx.fillText(typed || "Signature", 24, 120);
                onSign(c.toDataURL("image/png"));
              } else {
                const c = canvasRef.current;
                if (!c) return;
                onSign(c.toDataURL("image/png"));
              }
              onOpenChange(false);
            }}
          >
            Place on page
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
