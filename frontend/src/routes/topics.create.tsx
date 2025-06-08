import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Pickaxe, Plus, X, Sparkles } from "lucide-react";
import { FormEvent } from "react";
import { toast } from "sonner";
import * as v from "valibot";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateTopic } from "@/api/topics";
import { useMutationSuggestKeywords } from "@/api/suggest";
import { useTranslation } from "@/i18n";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Trans } from "@/components";

function RouteComponent() {
  const { t } = useTranslation();
  const createTopic = useCreateTopic();
  const suggestKeywords = useMutationSuggestKeywords();

  const navigate = Route.useNavigate();
  const { subject, description, keywords, currentKeyword } = Route.useSearch();

  const updateSearch = (newSearchValues: Partial<Search>) => {
    navigate({
      search: {
        subject,
        description,
        keywords,
        currentKeyword,
        ...newSearchValues,
      },
      replace: true,
    });
  };

  const handleCreateTopic = async (e: FormEvent) => {
    e.preventDefault();
    if (!subject || !keywords) return;
    if (!subject.trim() || keywords.length === 0) return;

    try {
      const topic = await createTopic.mutateAsync({
        subject: subject.trim(),
        description: description?.trim() ?? "",
        keywords,
      });
      navigate({ to: "/topics/$slug", params: { slug: topic.slug } });
      toast.success(t("create.topic.success"));
    } catch (error) {
      console.error("Failed to create topic:", error);
      toast.error(t("create.topic.error"));
    }
  };

  const handleAddKeyword = () => {
    if (!currentKeyword?.trim()) return;
    if (keywords?.includes(currentKeyword.trim())) {
      updateSearch({ currentKeyword: undefined });
      return;
    }
    updateSearch({
      keywords: [...(keywords ?? []), currentKeyword.trim()],
      currentKeyword: undefined,
    });
  };

  const handleRemoveKeyword = (index: number) => {
    updateSearch({
      keywords: keywords?.filter((_, i) => i !== index) ?? [],
    });
  };

  const handleSuggestKeywords = async () => {
    if (!subject || !description) return;

    try {
      const suggestedKeywords = await suggestKeywords.mutateAsync({
        subject,
        description,
      });
      const uniqueKeywords = suggestedKeywords.filter(
        (keyword: string) => !keywords?.includes(keyword),
      );
      updateSearch({
        keywords: [...(keywords ?? []), ...uniqueKeywords],
      });
      toast.success(t("keywords.suggest.success"));
    } catch (error) {
      console.error("Failed to suggest keywords:", error);
      toast.error(t("keywords.suggest.error"));
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/topics">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex flex-col">
          <p className="text-3xl font-bold">
            <Trans id="create.topic.title" />
          </p>
          <p className="text-sm italic">
            <Trans id="create.topic.description" />
          </p>
        </div>
      </div>

      <form onSubmit={handleCreateTopic} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">
            <Trans id="subject" />
          </p>
          <Input
            type="text"
            placeholder={t("subject.placeholder")}
            value={subject ?? ""}
            onChange={(e) => updateSearch({ subject: e.target.value })}
          />
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">
            <Trans id="description" />
          </p>
          <Textarea
            placeholder={t("description.placeholder")}
            value={description ?? ""}
            onChange={(e) => updateSearch({ description: e.target.value })}
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
              value={currentKeyword ?? ""}
              onChange={(e) => updateSearch({ currentKeyword: e.target.value })}
            />
            <Button
              onClick={handleAddKeyword}
              disabled={!currentKeyword?.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              onClick={handleSuggestKeywords}
              variant="outline"
              className={cn(
                "relative overflow-hidden",
                suggestKeywords.isPending &&
                  "animate-gradient bg-gradient-to-r from-purple-500 via-pink-500 to-sky-500",
              )}
              disabled={suggestKeywords.isPending || !subject || !description}
            >
              <div className="relative flex items-center">
                <Sparkles className="mr-1 h-4 w-4" />
                <Trans
                  id={
                    suggestKeywords.isPending
                      ? "keywords.suggesting"
                      : "keywords.suggest"
                  }
                />
              </div>
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {keywords?.map((keyword, index) => (
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
            disabled={!subject?.trim() || keywords?.length === 0}
          >
            <Pickaxe className="h-4 w-4" />
            {t("topics.add")}
          </Button>
        </div>
      </form>
    </div>
  );
}

const validateSearch = v.object({
  subject: v.pipe(
    v.optional(v.string()),
    v.transform((input) => input || undefined),
  ),
  description: v.pipe(
    v.optional(v.string()),
    v.transform((input) => input || undefined),
  ),
  keywords: v.pipe(
    v.optional(v.array(v.string())),
    v.transform((input) => input || undefined),
  ),
  currentKeyword: v.pipe(
    v.optional(v.string()),
    v.transform((input) => input || undefined),
  ),
});

type Search = v.InferOutput<typeof validateSearch>;

export const Route = createFileRoute("/topics/create")({
  component: RouteComponent,
  validateSearch,
});
