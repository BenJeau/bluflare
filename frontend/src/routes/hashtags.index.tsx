import { createFileRoute } from "@tanstack/react-router";

import { Empty } from "@/components";
import EmptyImg from "@/assets/construction-worker-9.svg";

const HashesComponent: React.FC = () => (
  <Empty
    title="under.construction.title"
    description="under.construction.description"
    image={EmptyImg}
    imageWidth={400}
    className="gap-4"
  />
);

export const Route = createFileRoute("/hashtags/")({
  component: HashesComponent,
});
