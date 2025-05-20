import { createFileRoute } from "@tanstack/react-router";

const DocsComponent: React.FC = () => {
  return <div>Hello "/docs/"!</div>;
};

export const Route = createFileRoute("/docs/")({
  component: DocsComponent,
});
