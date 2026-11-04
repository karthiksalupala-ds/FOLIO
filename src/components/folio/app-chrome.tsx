import { Link } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import { FolioMark } from "@/components/folio/mark";
import { ToolGlyph } from "@/components/folio/tool-icons";
import { CATEGORIES, TOOLS, toolsIn, type CategoryId, type ToolId } from "@/lib/folio/catalog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function FolioLogo({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="inline-flex items-center gap-2 text-fg">
      <span className="grid size-8 place-items-center rounded-md bg-accent text-accent-fg">
        <FolioMark className="size-4" />
      </span>
      {!compact && (
        <span className="text-[1.2rem] font-extrabold tracking-tight">
          Folio<span className="text-accent">PDF</span>
        </span>
      )}
    </Link>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-4 px-4 md:px-6">
        <FolioLogo />
        <nav className="ml-2 hidden items-center gap-1 lg:flex">
          <NavLink id="merge-pdf" label="Merge PDF" />
          <NavLink id="split-pdf" label="Split PDF" />
          <NavLink id="compress-pdf" label="Compress PDF" />
          <ToolMenu label="Convert PDF" category="convert" />
          <ToolMenu label="All PDF tools" />
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <div className="lg:hidden">
            <ToolMenu label="Tools" />
          </div>
          <Link
            to="/tools/$toolId"
            params={{ toolId: "merge-pdf" }}
            className="inline-flex h-9 items-center rounded-md bg-accent px-4 text-sm font-bold text-accent-fg"
          >
            Start
          </Link>
        </div>
      </div>
    </header>
  );
}

function NavLink({ id, label }: { id: ToolId; label: string }) {
  return (
    <Link
      to="/tools/$toolId"
      params={{ toolId: id }}
      className="rounded-md px-2.5 py-2 text-[13px] font-bold tracking-wide text-fg uppercase hover:text-accent"
    >
      {label}
    </Link>
  );
}

function ToolMenu({ label, category }: { label: string; category?: CategoryId }) {
  const cats = category ? CATEGORIES.filter((c) => c.id === category) : CATEGORIES.filter((c) => c.id !== "all");
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex h-10 items-center gap-1 rounded-md px-2.5 text-[13px] font-bold tracking-wide text-fg uppercase hover:text-accent">
        {label}
        <ChevronDown className="size-4 text-muted" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-[min(920px,calc(100vw-24px))] max-h-[min(70vh,640px)] overflow-auto p-4"
      >
        <div className={category ? "grid gap-1" : "grid gap-5 sm:grid-cols-2 lg:grid-cols-3"}>
          {cats.map((cat) => (
            <div key={cat.id}>
              {!category && (
                <p className="mb-2 text-[11px] font-extrabold tracking-wide text-muted uppercase">{cat.label}</p>
              )}
              <ul className="flex flex-col gap-0.5">
                {toolsIn(cat.id as CategoryId).map((t) => (
                  <li key={t.id}>
                    <Link
                      to="/tools/$toolId"
                      params={{ toolId: t.id }}
                      className="flex items-center gap-2 rounded-md px-1.5 py-1.5 text-sm hover:bg-raised"
                    >
                      <ToolGlyph icon={t.icon} tint={t.tint} size="sm" />
                      {t.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-16 bg-footer text-footer-fg">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 md:grid-cols-4 md:px-8">
        <div className="md:col-span-2">
          <span className="inline-flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-md bg-accent text-accent-fg">
              <FolioMark className="size-4" />
            </span>
            <span className="text-[1.2rem] font-extrabold tracking-tight">
              Folio<span className="text-accent">PDF</span>
            </span>
          </span>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-footer-muted">
            Every PDF tool in one place. Merge, split, compress, convert, edit, protect and share —
            processed in your browser, not on a server.
          </p>
        </div>
        <div>
          <p className="text-[11px] font-extrabold tracking-wide text-footer-muted uppercase">Product</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link to="/" className="hover:text-accent">
                All tools
              </Link>
            </li>
            <li>
              <Link to="/tools/$toolId" params={{ toolId: "edit-pdf" }} className="hover:text-accent">
                PDF editor
              </Link>
            </li>
            <li>
              <Link to="/tools/$toolId" params={{ toolId: "merge-pdf" }} className="hover:text-accent">
                Merge PDF
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-[11px] font-extrabold tracking-wide text-footer-muted uppercase">Popular</p>
          <ul className="mt-3 space-y-2 text-sm">
            {TOOLS.slice(0, 5).map((t) => (
              <li key={t.id}>
                <Link to="/tools/$toolId" params={{ toolId: t.id }} className="hover:text-accent">
                  {t.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-bg text-fg">
      <SiteHeader />
      {children}
      <SiteFooter />
    </div>
  );
}
