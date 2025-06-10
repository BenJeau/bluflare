import config from "@/lib/config";
import { queryOptions } from "@tanstack/react-query";

export type User = {
  id: string;
  createdAt: string;
  did: string;
  aka: string[];
  aka_retrieved_at: string;
};

type LatestUsers = {
  users: User[];
  total: number;
};

export const latestUsersOptions = queryOptions<LatestUsers>({
  queryKey: ["latestUsers"],
  queryFn: async ({ signal }) => {
    const response = await fetch(
      `${config.rest_server_base_url}/users/latest`,
      {
        signal,
      },
    );
    return response.json();
  },
});
