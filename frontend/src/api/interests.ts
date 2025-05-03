import { useMutation, useQuery } from "@tanstack/react-query";
import config from "@/lib/config";

export interface Interest {
  id: number;
  subject: string;
  description: string;
  keywords: string[];
  created_at: string;
}

export interface CreateInterest {
  subject: string;
  description: string;
  keywords: string[];
}

const API_BASE_URL = config.rest_server_base_url;

export const useInterests = () => {
  return useQuery<Interest[]>({
    queryKey: ["interests"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/interests`);
      if (!response.ok) {
        throw new Error("Failed to fetch interests");
      }
      return response.json();
    },
  });
};

export const useInterestWords = (id: number) => {
  return useQuery<Record<string, number>>({
    queryKey: ["interest-words", id],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/interests/${id}/words`);
      if (!response.ok) {
        throw new Error("Failed to fetch interest words");
      }
      return response.json();
    },
  });
};

export const useInterestUrls = (id: number) => {
  return useQuery<Record<string, number>>({
    queryKey: ["interest-urls", id],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/interests/${id}/urls`);
      if (!response.ok) {
        throw new Error("Failed to fetch interest urls");
      }
      return response.json();
    },
    refetchInterval: 200,
  });
};

export const useInterestTags = (id: number) => {
  return useQuery<Record<string, number>>({
    queryKey: ["interest-tags", id],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/interests/${id}/tags`);
      if (!response.ok) {
        throw new Error("Failed to fetch interest tags");
      }
      return response.json();
    },
  });
};

export const useCreateInterest = () => {
  return useMutation<number, Error, CreateInterest>({
    mutationFn: async (interest) => {
      const response = await fetch(`${API_BASE_URL}/interests`, {
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
      const response = await fetch(`${API_BASE_URL}/interests/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete interest");
      }
    },
  });
};
