import { Link, createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/folio/app-chrome";
import { ToolWorkspace } from "@/components/folio/tool-workspace";
import { getTool } from "@/lib/folio/catalog";

export const Route = createFileRoute("/tools/$toolId")({
  component: ToolPage,
});

function ToolPage() {
  const { toolId } = Route.useParams();
  const tool = getTool(toolId);
  if (!tool) {
    return (
      <AppShell>
        <div className="mx-auto max-w-lg px-4 py-20 text-center">
          <h1 className="text-2xl font-semibold">That tool is not here</h1>
          <p className="mt-2 text-sm text-muted">Pick another one from the full list.</p>
          <Link to="/" className="mt-6 inline-block text-sm font-medium text-accent">
            All PDF tools
          </Link>
        </div>
      </AppShell>
    );
  }
  return <ToolWorkspace tool={tool} />;
}
