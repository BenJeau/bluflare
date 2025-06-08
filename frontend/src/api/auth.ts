import { useMutation } from "@tanstack/react-query";

import config from "@/lib/config";

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
