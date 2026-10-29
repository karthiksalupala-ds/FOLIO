import { createFileRoute } from "@tanstack/react-router";
import { EditorShell } from "@/components/folio/editor-shell";

export const Route = createFileRoute("/editor/$docId")({
  component: EditorPage,
});

function EditorPage() {
  const { docId } = Route.useParams();
  return <EditorShell docId={docId} />;
}
