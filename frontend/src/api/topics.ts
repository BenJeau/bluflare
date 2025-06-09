import {
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import config from "@/lib/config";
import { useSSE } from "@/api/sse";
import { Post } from "@/api/posts";

export interface Topic {
  id: number;
  enabled: boolean;
  slug: string;
  subject: string;
  description: string;
  keywords: string[];
  created_at: string;
  last_analysis: string | null;
  last_analysis_at: string | null;
  post_count?: number;
}

export interface CreateTopic {
  subject: string;
  description: string;
  keywords: string[];
}

export interface UpdateTopic {
  keywords?: string[];
  enabled?: boolean;
}

export const useMutateTopic = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, UpdateTopic>({
    mutationFn: async (update) => {
      const response = await fetch(
        `${config.rest_server_base_url}/topics/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(update),
          credentials: "include",
        },
      );
      if (!response.ok) {
        throw new Error("Failed to update topic keywords");
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["topics"] });
    },
  });
};

export const topicsOptions = queryOptions<Topic[]>({
  queryKey: ["topics"],
  queryFn: async ({ signal }) => {
    const response = await fetch(`${config.rest_server_base_url}/topics`, {
      signal,
    });
    return response.json();
  },
});

export function topicSlugQueryOptions(slug: string) {
  return queryOptions({
    queryKey: ["topics", "slugs", slug],
    queryFn: async ({ signal }) => {
      const response = await fetch(
        `${config.rest_server_base_url}/topics/slugs/${slug}`,
        {
          signal,
        },
      );
      return response.json();
    },
  });
}

export const topicOptions = (id: string) =>
  queryOptions<Topic>({
    queryKey: ["topics", id],
    queryFn: async ({ signal }) => {
      const response = await fetch(
        `${config.rest_server_base_url}/topics/${id}`,
        {
          signal,
        },
      );
      return response.json();
    },
  });

export const useCreateTopic = () => {
  const queryClient = useQueryClient();

  return useMutation<Topic, Error, CreateTopic>({
    mutationFn: async (topic) => {
      const response = await fetch(`${config.rest_server_base_url}/topics`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(topic),
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to create topic");
      }
      return await response.json();
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["topics"] });
    },
  });
};

export const useDeleteTopic = () => {
  return useMutation<void, Error, number>({
    mutationFn: async (id) => {
      const response = await fetch(
        `${config.rest_server_base_url}/topics/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );
      if (!response.ok) {
        throw new Error("Failed to delete topic");
      }
    },
  });
};

export const useAnalyzeTopic = () => {
  const queryClient = useQueryClient();

  return useMutation<string, Error, number>({
    mutationFn: async (id) => {
      const response = await fetch(
        `${config.rest_server_base_url}/topics/${id}/analyze`,
        {
          method: "POST",
          credentials: "include",
        },
      );
      if (!response.ok) {
        throw new Error("Failed to analyze topic");
      }
      const text = await response.text();
      queryClient.invalidateQueries({ queryKey: ["topics", id] });
      return text;
    },
  });
};

export const useSSETopicPosts = (id: string, active: boolean) => {
  return useSSE<Post>({
    url: `${config.rest_server_base_url}/topics/${id}/posts/sse`,
    active,
    maxDataEntries: 150,
  });
};
