import { queryOptions, useMutation } from "@tanstack/react-query";

import config from "@/lib/config";

export const serverAuthQueryOptions = queryOptions({
  queryKey: ["auth", "server"],
  queryFn: async ({ signal }) => {
    const response = await fetch(`${config.rest_server_base_url}/auth/login`, {
      method: "POST",
      body: JSON.stringify({ username: "", password: "" }),
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      signal,
    });
    return { authEnabled: response.status !== 503 };
  },
});

export const useLogin = () => {
  return useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      const response = await fetch(
        `${config.rest_server_base_url}/auth/login`,
        {
          method: "POST",
          body: JSON.stringify(credentials),
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        },
      );
      if (!response.ok || response.status !== 200) {
        throw new Error("Failed to login");
      }
    },
  });
};

export const useLogout = () => {
  return useMutation({
    mutationFn: async () => {
      const response = await fetch(
        `${config.rest_server_base_url}/auth/logout`,
        {
          method: "POST",
          credentials: "include",
        },
      );
      if (!response.ok) {
        throw new Error("Failed to logout");
      }
    },
  });
};
