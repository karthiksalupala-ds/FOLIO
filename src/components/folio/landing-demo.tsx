import { useState } from "react";
import { RotateCcw } from "lucide-react";

const START = {
  title: "Quarterly Report",
  subtitle: "Prepared for the board, third quarter",
  body: "Revenue grew 18% on the previous quarter.",
  invoice: "invoice no: 1001",
  thanks: "ధన్యవాదాలు, धन्यवाद, thank you",
};

/**
 * A small live page that behaves like the editor: click a line, retype it,
 * and the font, colour and background around it stay exactly as they were.
 */
export function EditDemo() {
  const [round, setRound] = useState(0);

  return (
    <div className="w-full max-w-[26rem]">
      <div
        key={round}
        className="overflow-hidden rounded-[3px] bg-white text-[#1f2230] shadow-[0_30px_60px_-24px_rgb(0_0_0/0.65)]"
      >
        <div className="bg-[#142878] px-6 pt-8 pb-7">
          <Line
            label="Page title"
            className="font-[Georgia,'Times_New_Roman',serif] text-[1.9rem] leading-tight font-bold text-[#fafafa]"
            text={START.title}
          />
          <Line
            label="Page subtitle"
            className="mt-1 font-[Georgia,'Times_New_Roman',serif] text-sm text-[#c9d2f5] italic"
            text={START.subtitle}
          />
        </div>
        <div className="space-y-5 px-6 py-7">
          <Line label="Body text" className="text-[0.95rem] leading-relaxed" text={START.body} />
          <Line
            label="Invoice number"
            className="font-[ui-monospace,'Courier_New',monospace] text-sm text-[#1a0000]"
            text={START.invoice}
          />
          <Line
            label="Closing line"
            className="font-[Folio_Telugu,Folio_Devanagari,'Nunito_Sans',sans-serif] text-[0.95rem]"
            text={START.thanks}
          />
          <div className="space-y-2 pt-3" aria-hidden="true">
            <div className="h-1.5 w-full rounded-full bg-[#e6e6eb]" />
            <div className="h-1.5 w-11/12 rounded-full bg-[#e6e6eb]" />
            <div className="h-1.5 w-8/12 rounded-full bg-[#e6e6eb]" />
          </div>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3 text-sm text-[#a8acb8]">
        <p>Click any line and type. The look stays put.</p>
        <button
          type="button"
          onClick={() => setRound((r) => r + 1)}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1 font-semibold text-[#f4f4f8] outline-none hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-accent"
        >
          <RotateCcw className="size-3.5" aria-hidden="true" />
          Reset
        </button>
      </div>
    </div>
  );
}

function Line({ text, className, label }: { text: string; className: string; label: string }) {
  return (
    <div
      className={`demo-line ${className}`}
      contentEditable
      suppressContentEditableWarning
      spellCheck={false}
      role="textbox"
      aria-label={`${label}, editable`}
    >
      {text}
    </div>
  );
}
