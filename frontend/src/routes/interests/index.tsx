import { createFileRoute } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

import EmptyImg from "@/assets/camping-82.svg";

import { Button } from "@/components/ui/button";
import { useInterests, useDeleteInterest, Interest } from "@/api/interests";
import { useTranslation } from "@/i18n";
import { toast } from "sonner";
import { Empty } from "@/components";

export const Route = createFileRoute("/interests/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { data: interests, isLoading, error } = useInterests();
  const deleteInterest = useDeleteInterest();

  const handleDeleteInterest = async (interest: Interest) => {
    try {
      await deleteInterest.mutateAsync(interest.id);
      toast.success(`Interest "${interest.subject}" deleted successfully`);
      queryClient.invalidateQueries({ queryKey: ["interests"] });
    } catch (error) {
      console.error("Failed to delete interest:", error);
    }
  };

  if (isLoading) {
    return <div className="p-4">Loading...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error.message}</div>;
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex justify-end">
        <Link to="/interests/create">
          <Button>{t("interests.add")}</Button>
        </Link>
      </div>

      <div className="grid gap-2">
        {interests?.map((interest) => (
          <Link
            to="/interests/$id"
            params={{ id: interest.id.toString() }}
            key={interest.id}
            className="flex items-center justify-between rounded-lg border p-3 bg-white"
          >
            <h2 className="flex-1 font-medium hover:underline">
              {interest.subject}
            </h2>
            <Button
              variant="destructive"
              size="icon"
              onClick={() => handleDeleteInterest(interest)}
              className="cursor-pointer"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </Link>
        ))}
        {interests?.length === 0 && (
          <Empty
            title="No interests"
            description="Add an interest to get started"
            image={EmptyImg}
          />
        )}
      </div>
    </div>
  );
}
