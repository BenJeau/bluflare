import { createFileRoute } from "@tanstack/react-router";

const PostsComponent: React.FC = () => {
  return <div>Hello "/posts/"!</div>;
};

export const Route = createFileRoute("/posts/")({
  component: PostsComponent,
});
