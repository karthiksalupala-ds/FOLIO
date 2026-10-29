import { createFileRoute } from "@tanstack/react-router";
import { HomeStudio } from "@/components/folio/home-studio";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <HomeStudio />;
}
