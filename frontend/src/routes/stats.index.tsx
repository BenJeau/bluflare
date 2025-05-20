import { createFileRoute } from "@tanstack/react-router";

const StatsComponent: React.FC = () => {
  return <div>Hello "/stats/"!</div>;
};

export const Route = createFileRoute("/stats/")({
  component: StatsComponent,
});
