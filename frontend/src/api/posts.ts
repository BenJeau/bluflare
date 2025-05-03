import config from "@/lib/config";
import { useQuery } from "@tanstack/react-query";

export function usePosts(interestId: number) {
  return useQuery({
    queryKey: ["posts", interestId],
    queryFn: async () => {
      const response = await fetch(
        `${config.rest_server_base_url}/interests/${interestId}/posts`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }
      return response.json();
    },
    refetchInterval: 200,
  });
}
