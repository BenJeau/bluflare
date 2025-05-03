import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { RouterProvider } from "@tanstack/react-router";
import { Provider } from "jotai";

import { queryClient } from "@/api/query-client";
import { router } from "@/navigation";
import { store } from "@/atoms";
import { Toaster } from "@/components/ui/sonner";

const Providers: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <Provider store={store}>
      <RouterProvider router={router} />
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
      <Toaster />
    </Provider>
  </QueryClientProvider>
);

export default Providers;
