import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n";
import config from "@/lib/config";
import { useDeleteInterest } from "@/api/interests";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/interests/$id")({
  component: InterestDetail,
});

function InterestDetail() {
  const { id } = Route.useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
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

  const deleteInterest = useDeleteInterest();

  if (isLoading) {
    return <div className="p-4">Loading...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error.message}</div>;
  }

  const handleDeleteInterest = async (id: number) => {
    await deleteInterest.mutateAsync(id);
    toast.success("Interest deleted successfully");
    navigate({ to: "/interests" });
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex justify-between gap-2">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/interests">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h2 className="text-xl font-bold">
            {interest.subject}
            <p className="text-sm text-muted-foreground">
              {t("interests.detail.created")}:{" "}
              {new Date(interest.created_at).toLocaleString()}
            </p>
          </h2>
        </div>
        <Button
          variant="destructive"
          size="icon"
          onClick={() => handleDeleteInterest(Number(id))}
          className="cursor-pointer"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <div className="rounded-lg border p-4 flex gap-2 flex-col bg-white">
        <p className="text-sm font-semibold">Keywords</p>
        <div className="flex flex-wrap gap-2">
          {interest.keywords.map((keyword) => (
            <Badge key={keyword}>{keyword}</Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
