import { createRouter } from "@tanstack/react-router";
import { AppErrorComponent } from "@/lib/error-component";
import { PendingScreen } from "@/components/folio/loading";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
  return createRouter({
    routeTree,
    defaultErrorComponent: AppErrorComponent,
    // Show a spinner screen if a page takes longer than a blink to load, and keep it up long enough to read.
    defaultPendingComponent: () => <PendingScreen />,
    defaultPendingMs: 200,
    defaultPendingMinMs: 400,
  });
}
