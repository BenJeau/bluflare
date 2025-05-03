import { useMutation, useQuery } from "@tanstack/react-query";
import config from "@/lib/config";

export interface Interest {
  id: number;
  keyword: string;
  created_at: string;
}

export interface CreateInterest {
  keyword: string;
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

export const useCreateInterest = () => {
  return useMutation<Interest, Error, CreateInterest>({
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
      return response.json();
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
