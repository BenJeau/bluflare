import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/interests/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/interests/"!</div>;
}
