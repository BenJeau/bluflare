import {
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import config from "@/lib/config";
import { useSSE } from "@/api/sse";
import { Post } from "@/api/posts";

export interface Interest {
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

export interface CreateInterest {
  subject: string;
  description: string;
  keywords: string[];
}

export interface UpdateInterest {
  keywords?: string[];
  enabled?: boolean;
}

export const useMutateInterest = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, UpdateInterest>({
    mutationFn: async (update) => {
      const response = await fetch(
        `${config.rest_server_base_url}/interests/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(update),
        },
      );
      if (!response.ok) {
        throw new Error("Failed to update interest keywords");
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["interests"] });
    },
  });
};

export const interestsOptions = queryOptions<Interest[]>({
  queryKey: ["interests"],
  queryFn: async ({ signal }) => {
    const response = await fetch(`${config.rest_server_base_url}/interests`, {
      signal,
    });
    return response.json();
  },
});

export function interestSlugQueryOptions(slug: string) {
  return queryOptions({
    queryKey: ["interests", "slugs", slug],
    queryFn: async ({ signal }) => {
      const response = await fetch(
        `${config.rest_server_base_url}/interests/slugs/${slug}`,
        {
          signal,
        },
      );
      return response.json();
    },
  });
}

export const interestOptions = (id: string) =>
  queryOptions<Interest>({
    queryKey: ["interests", id],
    queryFn: async ({ signal }) => {
      const response = await fetch(
        `${config.rest_server_base_url}/interests/${id}`,
        {
          signal,
        },
      );
      return response.json();
    },
  });

export const useCreateInterest = () => {
  return useMutation<number, Error, CreateInterest>({
    mutationFn: async (interest) => {
      const response = await fetch(`${config.rest_server_base_url}/interests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(interest),
      });
      if (!response.ok) {
        throw new Error("Failed to create interest");
      }
      return Number(await response.text());
    },
  });
};

export const useDeleteInterest = () => {
  return useMutation<void, Error, number>({
    mutationFn: async (id) => {
      const response = await fetch(
        `${config.rest_server_base_url}/interests/${id}`,
        {
          method: "DELETE",
        },
      );
      if (!response.ok) {
        throw new Error("Failed to delete interest");
      }
    },
  });
};

export const useAnalyzeInterest = () => {
  return useMutation<string, Error, number>({
    mutationFn: async (id) => {
      const response = await fetch(
        `${config.rest_server_base_url}/interests/${id}/analyze`,
        {
          method: "POST",
        },
      );
      if (!response.ok) {
        throw new Error("Failed to analyze interest");
      }
      return await response.text();
    },
  });
};

export const useSSEInterestPosts = (id: string, active: boolean) => {
  return useSSE<Post>({
    url: `${config.rest_server_base_url}/interests/${id}/posts/sse`,
    active,
    maxDataEntries: 150,
  });
};
