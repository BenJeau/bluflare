import { createRouter } from "@tanstack/react-router";
import { Flame } from "lucide-react";

import { routeTree } from "@/navigation/routeTree.gen";
import { queryClient } from "@/api/query-client";
import { NotFound, Error } from "@/components";

export const router = createRouter({
  routeTree,
  context: {
    queryClient,
  },
  defaultPreload: "intent",
  defaultPreloadStaleTime: 0,
  defaultNotFoundComponent: () => <NotFound />,
  defaultPendingComponent: () => (
    <div className="flex flex-1 animate-pulse flex-col items-center justify-center text-primary">
      <Flame size={72} strokeWidth={1.5} />
    </div>
  ),
  defaultErrorComponent: Error,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
