import { useMutation } from "@tanstack/react-query";
import config from "@/lib/config";

export const useMutationSuggestKeywords = () =>
  useMutation({
    mutationFn: async ({
      subject,
      description,
    }: {
      subject: string;
      description: string;
    }) => {
      const response = await fetch(
        `${config.rest_server_base_url}/keywords/suggest`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ subject, description }),
          credentials: "include",
        },
      );
      return response.json() as Promise<string[]>;
    },
  });
