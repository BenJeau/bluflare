import { createFileRoute } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useState, FormEvent, ChangeEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useInterests,
  useCreateInterest,
  useDeleteInterest,
} from "@/api/interests";
import { useTranslation } from "@/i18n";

export const Route = createFileRoute("/interests/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { data: interests, isLoading, error } = useInterests();
  const createInterest = useCreateInterest();
  const deleteInterest = useDeleteInterest();
  const [newKeyword, setNewKeyword] = useState("");

  const handleCreateInterest = async (e: FormEvent) => {
    e.preventDefault();
    if (!newKeyword.trim()) return;

    try {
      await createInterest.mutateAsync({ keyword: newKeyword.trim() });
      setNewKeyword("");
      queryClient.invalidateQueries({ queryKey: ["interests"] });
    } catch (error) {
      console.error("Failed to create interest:", error);
    }
  };

  const handleDeleteInterest = async (id: number) => {
    try {
      await deleteInterest.mutateAsync(id);
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
      <form onSubmit={handleCreateInterest} className="flex gap-2">
        <Input
          type="text"
          placeholder={t("interests.add.placeholder")}
          value={newKeyword}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setNewKeyword(e.target.value)
          }
          className="flex-1"
        />
        <Button type="submit" disabled={!newKeyword.trim()}>
          <Plus className="mr-2 h-4 w-4" />
          {t("interests.add")}
        </Button>
      </form>

      <div className="grid gap-2">
        {interests?.map((interest) => (
          <div
            key={interest.id}
            className="flex items-center justify-between rounded-lg border p-3"
          >
            <span className="font-medium">{interest.keyword}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDeleteInterest(interest.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
