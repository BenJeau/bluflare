import { createFileRoute } from "@tanstack/react-router";

const UsersComponent: React.FC = () => {
  return <div>Hello "/users/"!</div>;
};

export const Route = createFileRoute("/users/")({
  component: UsersComponent,
});
