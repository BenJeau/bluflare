import {
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import config from "@/lib/config";

export const useLogin = () => {
  const queryClient = useQueryClient();

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

      queryClient.invalidateQueries({ queryKey: ["auth"] });
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

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

      queryClient.invalidateQueries({ queryKey: ["auth"] });
    },
  });
};

export type AuthPermission =
  | "auth_disabled"
  | "authenticated"
  | "invalid_session";

export type Auth = {
  canEdit: boolean;
  enabled: boolean;
};

export const authQueryOptions = queryOptions<Auth>({
  queryKey: ["auth"],
  queryFn: async ({ signal }) => {
    const response = await fetch(
      `${config.rest_server_base_url}/auth/permission`,
      {
        credentials: "include",
        signal,
      },
    );
    if (!response.ok) {
      throw new Error("Failed to check authentication permission");
    }
    const data: AuthPermission = await response.json();
    return {
      canEdit: data !== "invalid_session",
      enabled: data !== "auth_disabled",
    };
  },
});
