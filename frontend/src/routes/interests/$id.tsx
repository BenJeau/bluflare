import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n";
import config from "@/lib/config";

export const Route = createFileRoute("/interests/$id")({
  component: InterestDetail,
});

function InterestDetail() {
  const { id } = Route.useParams();
  const { t } = useTranslation();
  const {
    data: interest,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["interests", id],
    queryFn: async () => {
      const response = await fetch(
        `${config.rest_server_base_url}/interests/${id}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch interest");
      }
      return response.json();
    },
  });

  if (isLoading) {
    return <div className="p-4">Loading...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error.message}</div>;
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/interests">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h2 className="text-xl font-bold">{interest.keyword}</h2>
      </div>
      <div className="rounded-lg border p-4">
        <p className="text-sm text-muted-foreground">
          {t("interests.detail.created")}:{" "}
          {new Date(interest.created_at).toLocaleString()}
        </p>
      </div>
    </div>
  );
}
