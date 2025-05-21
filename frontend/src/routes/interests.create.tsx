import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { ArrowLeft, Pickaxe, Plus, X, Sparkles } from "lucide-react";
import { useState, FormEvent, ChangeEvent } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateInterest } from "@/api/interests";
import { useMutationSuggestKeywords } from "@/api/suggest";
import { useTranslation } from "@/i18n";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Trans } from "@/components";

function RouteComponent() {
  const { t } = useTranslation();
  const createInterest = useCreateInterest();
  const { mutateAsync: suggestKeywords, isPending: isSuggesting } =
    useMutationSuggestKeywords();
  const [newSubject, setNewSubject] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newKeywords, setNewKeywords] = useState<string[]>([]);
  const [currentKeyword, setCurrentKeyword] = useState("");
  const navigate = useNavigate();

  const handleCreateInterest = async (e: FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim() || newKeywords.length === 0) return;

    try {
      const interest = await createInterest.mutateAsync({
        subject: newSubject.trim(),
        description: newDescription.trim(),
        keywords: newKeywords,
      });
      navigate({ to: "/interests/$slug", params: { slug: interest.slug } });
      toast.success(t("create.interest.success"));
    } catch (error) {
      console.error("Failed to create interest:", error);
      toast.error(t("create.interest.error"));
    }
  };

  const handleAddKeyword = () => {
    if (!currentKeyword.trim()) return;
    if (newKeywords.includes(currentKeyword.trim())) {
      setCurrentKeyword("");
      return;
    }
    setNewKeywords([...newKeywords, currentKeyword.trim()]);
    setCurrentKeyword("");
  };

  const handleRemoveKeyword = (index: number) => {
    setNewKeywords(newKeywords.filter((_, i) => i !== index));
  };

  const handleSuggestKeywords = async () => {
    try {
      const suggestedKeywords = await suggestKeywords({
        subject: newSubject,
        description: newDescription,
      });
      // Add only unique keywords that aren't already in the list
      const uniqueKeywords = suggestedKeywords.filter(
        (keyword: string) => !newKeywords.includes(keyword),
      );
      setNewKeywords([...newKeywords, ...uniqueKeywords]);
      toast.success(t("keywords.suggest.success"));
    } catch (error) {
      console.error("Failed to suggest keywords:", error);
      toast.error(t("keywords.suggest.error"));
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link to="/interests">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex flex-col">
          <p className="text-3xl font-bold">
            <Trans id="create.interest.title" />
          </p>
          <p className="text-sm italic">
            <Trans id="create.interest.description" />
          </p>
        </div>
      </div>

      <form onSubmit={handleCreateInterest} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">
            <Trans id="subject" />
          </p>
          <Input
            type="text"
            placeholder={t("subject.placeholder")}
            value={newSubject}
            onChange={(e) => setNewSubject(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">
            <Trans id="description" />
          </p>
          <Textarea
            placeholder={t("description.placeholder")}
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">
            <Trans id="keywords" />
          </p>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder={t("keywords.placeholder")}
              value={currentKeyword}
              onChange={(e) => setCurrentKeyword(e.target.value)}
            />
            <Button
              onClick={handleAddKeyword}
              disabled={!currentKeyword.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              onClick={handleSuggestKeywords}
              variant="outline"
              className={cn(
                "relative overflow-hidden",
                isSuggesting &&
                  "animate-gradient bg-gradient-to-r from-purple-500 via-pink-500 to-sky-500",
              )}
              disabled={isSuggesting}
            >
              <div className="relative flex items-center">
                <Sparkles className="mr-1 h-4 w-4" />
                <Trans
                  id={isSuggesting ? "keywords.suggesting" : "keywords.suggest"}
                />
              </div>
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {newKeywords.map((keyword, index) => (
              <div
                key={index}
                className="bg-secondary flex items-center gap-1 rounded-full px-3 py-1 text-sm"
              >
                <span>{keyword}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4"
                  onClick={() => handleRemoveKeyword(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={!newSubject.trim() || newKeywords.length === 0}
          >
            <Pickaxe className="h-4 w-4" />
            {t("interests.add")}
          </Button>
        </div>
      </form>
    </div>
  );
}

export const Route = createFileRoute("/interests/create")({
  component: RouteComponent,
});
