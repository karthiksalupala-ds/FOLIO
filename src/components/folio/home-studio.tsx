import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Lock, Search, Shield, Zap } from "lucide-react";
import { AppShell } from "@/components/folio/app-chrome";
import { ToolGlyph } from "@/components/folio/tool-icons";
import { UploadHub } from "@/components/folio/upload-hub";
import {
  CATEGORIES,
  searchTools,
  toolsIn,
  type CategoryId,
  type PdfTool,
} from "@/lib/folio/catalog";

export function HomeStudio() {
  const [category, setCategory] = useState<CategoryId>("all");
  const [query, setQuery] = useState("");
  const searching = query.trim().length > 0;
  const list = useMemo(() => {
    return searching ? searchTools(query) : toolsIn(category);
  }, [category, query, searching]);

  return (
    <AppShell>
      <section className="bg-surface">
        <div className="mx-auto w-full max-w-6xl px-4 py-10 text-center md:px-8 md:py-16">
          <h1 className="mx-auto max-w-3xl text-[clamp(1.9rem,5.4vw,3.15rem)] font-extrabold leading-[1.12] tracking-[-0.035em]">
            Every tool you need to work with PDFs, at your fingertips
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-muted md:text-lg">
            Upload a PDF and pick what to do — edit the text, merge, split, compress, convert, sign or protect.
            It all runs in your browser.
          </p>
          <UploadHub />
          <label className="relative mx-auto mt-8 block max-w-xl text-left">
            <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-subtle" />
            <input
              className="search-field"
              placeholder="Search 30+ tools — merge, Word, compress, sign…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search PDF tools"
            />
          </label>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 md:px-8">
        {!searching && (
          <div className="flex gap-1 overflow-x-auto border-b border-border">
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
            {list.length} {list.length === 1 ? "tool" : "tools"} for “{query.trim()}”
          </p>
        )}

        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {list.length === 0 ? (
            <p className="col-span-full rounded-xl bg-raised px-4 py-10 text-center text-sm text-muted">
              No tools match that search. Try “merge”, “Word”, or “sign”.
            </p>
          ) : (
            list.map((t) => <ToolCard key={t.id} tool={t} />)
          )}
        </div>
      </section>

      <section className="mx-auto mt-16 w-full max-w-6xl px-4 md:px-8">
        <h2 className="text-center text-xl font-extrabold tracking-tight md:text-2xl">How it works</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            {
              step: "1",
              title: "Select a file",
              body: "Drop a PDF, Word file, deck, sheet or image. Or tap Try with a sample — no file needed.",
            },
            {
              step: "2",
              title: "Work the magic",
              body: "We merge, convert, compress, sign or edit right in your browser. Nothing is uploaded.",
            },
            {
              step: "3",
              title: "Download or share",
              body: "Preview the result, save it to your device, or open it in the editor to keep going.",
            },
          ].map((s) => (
            <div key={s.step} className="rounded-xl bg-surface p-5 shadow-[var(--shadow-paper)]">
              <span className="grid size-8 place-items-center rounded-full bg-accent text-sm font-extrabold text-accent-fg">
                {s.step}
              </span>
              <h3 className="mt-3 font-bold">{s.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-14 w-full max-w-6xl px-4 pb-8 md:px-8">
        <div className="grid gap-4 rounded-xl bg-raised p-6 md:grid-cols-3 md:p-8">
          <Trust
            icon={<Shield className="size-5" />}
            title="Private by default"
            body="Your documents are processed locally. Nothing is sent to a server unless you use an AI tool."
          />
          <Trust
            icon={<Zap className="size-5" />}
            title="Fast, no account"
            body="Open a tool and go. No sign-in, no watermarks we add, no daily limit on the basics."
          />
          <Trust
            icon={<Lock className="size-5" />}
            title="Real encryption"
            body="Protect PDF uses AES-256. Unlock, sign, redact and convert all produce downloadable files."
          />
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

function Trust({
  icon,
  title,
  body,
}: {
  icon: ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="flex gap-3">
      <span className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-lg bg-surface text-fg shadow-[var(--shadow-paper)]">
        {icon}
      </span>
      <div>
        <h3 className="font-bold">{title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-muted">{body}</p>
      </div>
    </div>
  );
}
