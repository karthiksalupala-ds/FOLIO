import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronDown, Search } from "lucide-react";
import { AppShell } from "@/components/folio/app-chrome";
import { EditDemo } from "@/components/folio/landing-demo";
import { ToolGlyph } from "@/components/folio/tool-icons";
import { UploadHub } from "@/components/folio/upload-hub";
import {
  CATEGORIES,
  TOOLS,
  searchTools,
  toolsIn,
  type CategoryId,
  type PdfTool,
} from "@/lib/folio/catalog";

const STRENGTHS = [
  {
    title: "Your files stay on your device",
    body: "Merge, split, edit, sign, compress and convert all run in your browser. Only the two AI tools, Summarizer and Translate, send the text they read to a server. Nothing else leaves your device.",
  },
  {
    title: "Redaction that removes the text",
    body: "Redacted pages are flattened to images, so the words you blacked out can't be selected, searched or copied out of the file.",
  },
  {
    title: "Scans become searchable",
    body: "OCR reads scanned pages in English and gives you a PDF you can search, plus the text as a plain file.",
  },
  {
    title: "Telugu, Hindi, Tamil and Kannada",
    body: "Watermarks, notes and edited lines are drawn in the right script, not as question marks.",
  },
];

const STEPS = [
  { title: "Choose a file", body: "Drop a PDF, Word file, deck, sheet or image. Or try the sample." },
  { title: "Pick what to do", body: "Edit the text, merge, split, compress, convert, sign or protect." },
  { title: "Download or keep editing", body: "Preview the result, save it, or open it in the editor." },
];

const FAQ = [
  {
    q: "Is my file uploaded anywhere?",
    a: "Not for the regular tools. They run in your browser. The AI Summarizer and Translate send the extracted text to a server so a language model can read it.",
  },
  { q: "Do I need an account?", a: "No. Open a tool and start." },
  { q: "How big can a file be?", a: "Up to 40 MB per file." },
  {
    q: "Which languages can I type into a PDF?",
    a: "Latin, Telugu, Hindi, Tamil, Kannada, Cyrillic and Greek. OCR currently reads English.",
  },
  {
    q: "Can I edit a scanned PDF?",
    a: "A scan is a picture of a page, so there are no lines of text to click. Run OCR PDF first to get a searchable copy.",
  },
  {
    q: "Does it work on a phone?",
    a: "Yes, in a modern mobile browser. Editing long documents is easier on a larger screen.",
  },
];

export function HomeStudio() {
  const [category, setCategory] = useState<CategoryId>("all");
  const [query, setQuery] = useState("");
  const searching = query.trim().length > 0;
  const total = TOOLS.length;
  const list = useMemo(() => {
    return searching ? searchTools(query) : toolsIn(category);
  }, [category, query, searching]);

  return (
    <AppShell>
      <section id="start" className="scroll-mt-16 bg-surface">
        <div className="mx-auto w-full max-w-6xl px-4 pt-12 pb-10 text-center md:px-8 md:pt-20 md:pb-16">
          <h1 className="font-display mx-auto max-w-4xl text-[clamp(2.3rem,7vw,4.6rem)] leading-[1.02] font-extrabold tracking-[-0.04em] text-balance">
            Edit a PDF the way you edit a document
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted md:text-lg">
            Click a line, retype it, and the font, colour and background stay as they were. {total} tools to merge,
            split, convert, sign and protect, all in your browser.
          </p>
          <UploadHub />
          <p className="mt-5 text-sm text-subtle">No account. No watermark. Files up to 40 MB.</p>
        </div>
      </section>

      <section className="bg-footer text-footer-fg">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-4 py-14 md:grid-cols-[1fr_auto] md:gap-16 md:px-8 md:py-20">
          <div className="max-w-md">
            <h2 className="font-display text-[clamp(1.8rem,4.4vw,2.9rem)] leading-[1.05] font-extrabold tracking-[-0.03em] text-balance">
              Retype a line. Keep the look.
            </h2>
            <p className="mt-4 leading-relaxed text-footer-muted">
              Open any text PDF in the editor and click the words you want to change. The new text is set in the
              same kind of font, in the same ink, on the same background, so the page doesn&rsquo;t look patched.
            </p>
            <p className="mt-4 leading-relaxed text-footer-muted">
              Try it on the page. It works the same way on yours.
            </p>
            <a
              href="#start"
              className="mt-7 inline-flex h-12 items-center rounded-md bg-accent px-6 font-bold text-accent-fg outline-none hover:brightness-95 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-footer"
            >
              Open a PDF
            </a>
          </div>
          <div className="flex justify-center md:justify-end">
            <EditDemo />
          </div>
        </div>
      </section>

      <section id="tools" className="mx-auto w-full max-w-6xl scroll-mt-16 px-4 pt-14 md:px-8 md:pt-20">
        <h2 className="font-display text-[clamp(1.7rem,4vw,2.6rem)] font-extrabold tracking-[-0.03em]">
          All {total} tools
        </h2>
        <label className="relative mt-5 block max-w-xl text-left">
          <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-subtle" />
          <input
            className="search-field"
            placeholder={`Search ${total} tools: merge, Word, compress, sign`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search PDF tools"
          />
        </label>

        {!searching && (
          <div className="mt-5 flex gap-1 overflow-x-auto border-b border-border">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategory(c.id)}
                data-active={category === c.id}
                className="cat-tab"
              >
                {c.label}
              </button>
            ))}
          </div>
        )}

        {searching && (
          <p className="mt-5 mb-2 text-sm text-muted">
            {list.length} {list.length === 1 ? "tool" : "tools"} for &ldquo;{query.trim()}&rdquo;
          </p>
        )}

        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {list.length === 0 ? (
            <p className="col-span-full rounded-xl bg-raised px-4 py-10 text-center text-sm text-muted">
              No tools match that search. Try &ldquo;merge&rdquo;, &ldquo;Word&rdquo; or &ldquo;sign&rdquo;.
            </p>
          ) : (
            list.map((t) => <ToolCard key={t.id} tool={t} />)
          )}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pt-20 md:px-8 md:pt-28">
        <h2 className="font-display max-w-2xl text-[clamp(1.7rem,4vw,2.6rem)] leading-[1.08] font-extrabold tracking-[-0.03em] text-balance">
          Built for documents that matter
        </h2>
        <div className="mt-8 border-t border-border">
          {STRENGTHS.map((s) => (
            <div key={s.title} className="grid gap-2 border-b border-border py-6 md:grid-cols-[2fr_3fr] md:gap-10 md:py-8">
              <h3 className="font-display text-xl font-bold tracking-tight">{s.title}</h3>
              <p className="max-w-xl leading-relaxed text-muted">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pt-20 md:px-8 md:pt-28">
        <h2 className="font-display text-[clamp(1.7rem,4vw,2.6rem)] font-extrabold tracking-[-0.03em]">How it works</h2>
        <ol className="mt-8 grid gap-8 md:grid-cols-3 md:gap-10">
          {STEPS.map((step, i) => (
            <li key={step.title} className="flex gap-4">
              <span className="font-display text-4xl leading-none font-extrabold text-accent" aria-hidden="true">
                {i + 1}
              </span>
              <div>
                <h3 className="font-bold">{step.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto w-full max-w-3xl px-4 pt-20 md:px-8 md:pt-28">
        <h2 className="font-display text-[clamp(1.7rem,4vw,2.6rem)] font-extrabold tracking-[-0.03em]">
          Questions
        </h2>
        <div className="mt-6 border-t border-border">
          {FAQ.map((f) => (
            <details key={f.q} className="faq-item border-b border-border">
              <summary className="flex items-center justify-between gap-4 py-4 font-bold outline-none focus-visible:ring-2 focus-visible:ring-accent">
                {f.q}
                <ChevronDown className="faq-chevron size-5 shrink-0 text-muted" aria-hidden="true" />
              </summary>
              <p className="max-w-xl pb-5 leading-relaxed text-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pt-20 pb-6 md:px-8 md:pt-28">
        <div className="flex flex-col items-start justify-between gap-6 border-t border-border pt-10 md:flex-row md:items-center">
          <h2 className="font-display text-[clamp(1.7rem,4vw,2.6rem)] leading-[1.08] font-extrabold tracking-[-0.03em] text-balance">
            Have a PDF open? Start now.
          </h2>
          <a
            href="#start"
            className="inline-flex h-12 shrink-0 items-center rounded-md bg-accent px-7 font-bold text-accent-fg outline-none hover:brightness-95 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          >
            Select a PDF
          </a>
        </div>
      </section>
    </AppShell>
  );
}

function ToolCard({ tool }: { tool: PdfTool }) {
  return (
    <Link to="/tools/$toolId" params={{ toolId: tool.id }} className="tool-card">
      <ToolGlyph icon={tool.icon} tint={tool.tint} />
      <div>
        <h2 className="text-[15px] font-extrabold tracking-tight">{tool.title}</h2>
        <p className="mt-1 text-sm leading-snug text-muted">{tool.blurb}</p>
      </div>
    </Link>
  );
}
