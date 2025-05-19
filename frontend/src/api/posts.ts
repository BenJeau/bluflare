import { queryOptions } from "@tanstack/react-query";

import config from "@/lib/config";
import { useSSE } from "@/api/sse";

export interface Post {
  id: number;
  text: string;
  created_at: string;
  urls: string[];
  cid: string;
  rkey: string;
  langs: string[];
  tags: string[];
  author_id: string;
  aka: Record<string, string[]>;
}

export const postsOptions = (interestId: string) =>
  queryOptions<Post[]>({
    queryKey: ["interets", interestId, "posts"],
    queryFn: async ({ signal }) => {
      const response = await fetch(
        `${config.rest_server_base_url}/interests/${interestId}/posts`,
        { signal }
      );
      return response.json();
    },
  });

export const latestPostsOptions = queryOptions<Post[]>({
  queryKey: ["posts", "latest"],
  queryFn: async ({ signal }) => {
    const response = await fetch(
      `${config.rest_server_base_url}/posts/latest`,
      { signal }
    );
    return response.json();
  },
});

export const useSSELatestPosts = (active: boolean) =>
  useSSE<Post>({
    url: `${config.rest_server_base_url}/posts/latest/sse`,
    maxDataEntries: 20,
    active,
  });
