import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Trash2,
  ChevronDown,
  ChevronUp,
  Edit2,
  Plus,
  X,
  Sparkles,
  Newspaper,
  Tag,
  LinkIcon,
  Languages,
  Bot,
  Hash,
  Play,
  Pause,
} from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { useState, ChangeEvent, useMemo } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n";
import {
  Interest,
  useDeleteInterest,
  useSSEInterestPosts,
  useMutateInterest,
  useAnalyzeInterest,
  interestOptions,
  interestSlugQueryOptions,
} from "@/api/interests";
import { Badge } from "@/components/ui/badge";
import { cn, getTagColor } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { useMutationSuggestKeywords } from "@/api/suggest";
import { postsOptions, Post } from "@/api/posts";
import { NotFound, PostCard, Trans } from "@/components";

const InterestDetail: React.FC = () => {
  const { slug } = Route.useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isAnalysisExpanded, setIsAnalysisExpanded] = useState(false);
  const [numberOfPostsToShow, setNumberOfPostsToShow] = useState(30);
  const [isSSEActive, setIsSSEActive] = useState(true);
  const { mutateAsync: analyzeInterest, isPending: isAnalyzing } =
    useAnalyzeInterest();

  const { data: id } = useSuspenseQuery(interestSlugQueryOptions(slug));
  const { data: interest } = useSuspenseQuery(interestOptions(id));
  const { data: posts } = useSuspenseQuery(postsOptions(id));
  const { data: ssePosts } = useSSEInterestPosts(id, isSSEActive);

  const deleteInterest = useDeleteInterest();

  const handleDeleteInterest = async (id: number) => {
    await deleteInterest.mutateAsync(id);
    toast.success("Interest deleted successfully");
    navigate({ to: "/interests" });
  };

  const handleAnalyzeInterest = async () => {
    try {
      await analyzeInterest(Number(id));
    } catch (error) {
      console.error(error);
      toast.error("Failed to analyze interest");
    }
  };

  const combinedPosts: Post[] = useMemo(() => {
    const uniquePosts = new Map();
    [...ssePosts, ...posts].forEach((post) => uniquePosts.set(post.id, post));
    return Array.from(uniquePosts.values());
  }, [posts, ssePosts]);

  const urls: Record<string, number> = useMemo(() => {
    return combinedPosts.reduce(
      (acc, post) => {
        post.urls.forEach((url) => {
          acc[url] = (acc[url] || 0) + 1;
        });
        return acc;
      },
      {} as Record<string, number>,
    );
  }, [combinedPosts]);

  const tags: Record<string, number> = useMemo(() => {
    return combinedPosts.reduce(
      (acc, post) => {
        post.tags.forEach((tag) => {
          acc[tag] = (acc[tag] || 0) + 1;
        });
        return acc;
      },
      {} as Record<string, number>,
    );
  }, [combinedPosts]);

  const langs: Record<string, number> = useMemo(() => {
    return combinedPosts.reduce(
      (acc, post) => {
        post.langs.forEach((lang) => {
          acc[lang] = (acc[lang] || 0) + 1;
        });
        return acc;
      },
      {} as Record<string, number>,
    );
  }, [combinedPosts]);

  return (
    <div className="flex flex-col gap-2 p-4">
      <div className="mb-2 flex justify-between gap-2">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/interests">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h2 className="text-xl font-bold">
            <span className="flex flex-wrap items-baseline gap-x-2">
              {interest.subject}
              <p className="text-sm font-normal italic">
                {interest.description}
              </p>
            </span>
            <p className="text-sm font-normal opacity-70">
              {t("interests.detail.created")}:{" "}
              {new Date(interest.created_at).toLocaleString()}
            </p>
          </h2>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleAnalyzeInterest}
            disabled={isAnalyzing}
          >
            <Sparkles className="h-4 w-4" />
            {isAnalyzing ? "Analyzing..." : "Analyze Posts"}
          </Button>
          <Button
            variant="destructive"
            size="icon"
            onClick={() => handleDeleteInterest(Number(id))}
            className="cursor-pointer"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="bg-background/75 rounded-lg border p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <Bot className="h-4 w-4" /> Analysis{" "}
            <span className="text-xs opacity-70">
              (
              {interest.last_analysis_at
                ? new Date(interest.last_analysis_at).toLocaleString()
                : "Never analyzed"}
              )
            </span>
          </p>
          {interest.last_analysis && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsAnalysisExpanded(!isAnalysisExpanded)}
              className="h-6"
            >
              {isAnalysisExpanded ? (
                <>
                  Collapse <ChevronUp className="ml-1 h-3 w-3" />
                </>
              ) : (
                <>
                  Expand <ChevronDown className="ml-1 h-3 w-3" />
                </>
              )}
            </Button>
          )}
        </div>
        {isAnalysisExpanded && (
          <div className="prose prose-sm dark:prose-invert mt-2 max-w-none">
            <ReactMarkdown>
              {interest.last_analysis ??
                "No analysis results yet, start analyzing posts to get started!"}
            </ReactMarkdown>
          </div>
        )}
      </div>
      <KeywordsSection interest={interest} />
      <StatsSection data={langs || {}} title="Languages" Icon={Languages} />
      <StatsSection data={urls || {}} title="URLs" Icon={LinkIcon} />
      <StatsSection data={tags || {}} title="Tags" Icon={Hash} />
      <div className="bg-background/75 flex flex-col gap-2 rounded-lg border p-4 shadow-xs">
        <div className="flex justify-between gap-2">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <Newspaper className="h-4 w-4" /> Posts{" "}
            <span className="text-xs opacity-70">({combinedPosts.length})</span>
          </p>
          <div className="flex items-center gap-2">
            <Select
              value={numberOfPostsToShow.toString()}
              onValueChange={(value) => setNumberOfPostsToShow(Number(value))}
            >
              <SelectTrigger className="w-[250px]" size="sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">
                  <Trans id="showing.latest.posts" count={30} />
                </SelectItem>
                <SelectItem value="90">
                  <Trans id="showing.latest.posts" count={90} />
                </SelectItem>
                <SelectItem value="150">
                  <Trans id="showing.latest.posts" count={150} />
                </SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant={isSSEActive ? "destructive" : "default"}
              size="sm"
              onClick={() => setIsSSEActive((prev) => !prev)}
            >
              {isSSEActive ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
          {combinedPosts.slice(0, numberOfPostsToShow).map((post, index) => (
            <PostCard
              key={post.id}
              post={post}
              keywords={interest.keywords}
              offset={index}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const KeywordsSection = ({ interest }: { interest: Interest }) => {
  const [isEditingKeywords, setIsEditingKeywords] = useState(false);
  const [currentKeyword, setCurrentKeyword] = useState("");
  const [editedKeywords, setEditedKeywords] = useState<string[]>([]);
  const { mutateAsync: updateInterest } = useMutateInterest(interest.id);
  const { mutateAsync: suggestKeywords, isPending: isSuggesting } =
    useMutationSuggestKeywords();

  const handleStartEditing = () => {
    setEditedKeywords([...interest.keywords]);
    setIsEditingKeywords(true);
  };

  const handleCancelEditing = () => {
    setIsEditingKeywords(false);
    setCurrentKeyword("");
    setEditedKeywords([]);
  };

  const handleSaveKeywords = async () => {
    try {
      await updateInterest({ keywords: editedKeywords });
      toast.success("Keywords updated successfully");
      setIsEditingKeywords(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to update keywords");
    }
  };

  const handleAddKeyword = () => {
    if (!currentKeyword.trim()) return;
    if (editedKeywords.includes(currentKeyword.trim())) {
      setCurrentKeyword("");
      return;
    }
    setEditedKeywords([...editedKeywords, currentKeyword.trim()]);
    setCurrentKeyword("");
  };

  const handleRemoveKeyword = (index: number) => {
    setEditedKeywords(editedKeywords.filter((_, i) => i !== index));
  };

  const handleSuggestKeywords = async () => {
    try {
      const suggestedKeywords = await suggestKeywords({
        subject: interest.subject,
        description: interest.description,
      });
      // Add only unique keywords that aren't already in the list
      const newKeywords = suggestedKeywords.filter(
        (keyword) => !editedKeywords.includes(keyword),
      );
      setEditedKeywords([...editedKeywords, ...newKeywords]);
    } catch (error) {
      console.error(error);
      toast.error("Failed to suggest keywords");
    }
  };

  return (
    <div className="bg-background/75 flex flex-col gap-2 rounded-lg border p-4 shadow-xs">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <Tag className="h-4 w-4" /> Keywords{" "}
          <span className="text-xs opacity-70">
            ({interest.keywords.length})
          </span>
        </p>
        {!isEditingKeywords ? (
          <Button
            variant="outline"
            size="icon"
            onClick={handleStartEditing}
            className="h-6 w-6"
          >
            <Edit2 className="h-3 w-3" />
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancelEditing}
              className="h-6"
            >
              Cancel
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleSaveKeywords}
              className="h-6"
            >
              Save
            </Button>
          </div>
        )}
      </div>
      {isEditingKeywords ? (
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Add a keyword"
              value={currentKeyword}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setCurrentKeyword(e.target.value)
              }
              className="h-8"
            />
            <Button
              onClick={handleAddKeyword}
              disabled={!currentKeyword.trim()}
              className="h-8"
            >
              <Plus className="h-3 w-3" />
            </Button>
            <Button
              onClick={handleSuggestKeywords}
              variant="outline"
              className={cn(
                "relative h-8 overflow-hidden",
                isSuggesting &&
                  "animate-gradient bg-gradient-to-r from-purple-500 via-pink-500 to-sky-500",
              )}
              disabled={isSuggesting}
            >
              <div className="relative flex items-center">
                <Sparkles className="mr-1 h-3 w-3" />
                {isSuggesting ? "Suggesting..." : "Suggest AI Keywords"}
              </div>
            </Button>
          </div>
          <div className="flex flex-wrap gap-1">
            {editedKeywords.map((keyword, index) => (
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
      ) : (
        <div className="flex flex-wrap gap-1">
          {interest.keywords.map((keyword: string) => (
            <Badge key={keyword}>{keyword}</Badge>
          ))}
        </div>
      )}
    </div>
  );
};

type StatsSectionProps = {
  data: Record<string, number>;
  title: string;
  Icon: React.ElementType;
};

const StatsSection = ({ data, title, Icon }: StatsSectionProps) => {
  const [showAll, setShowAll] = useState(false);

  return (
    <div className="bg-background/75 flex flex-col gap-2 rounded-lg border p-4 shadow-xs">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <Icon className="h-4 w-4" /> {title}{" "}
          <span className="text-xs opacity-70">
            ({(data && Object.keys(data).length) ?? 0} unique{" "}
            {title.toLocaleLowerCase()})
          </span>
        </p>

        {data && Object.keys(data).length > 15 && (
          <Button
            variant="secondary"
            className="h-6 px-2 py-1"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? (
              <>
                Show Less <ChevronUp className="ml-1 h-3 w-3" />
              </>
            ) : (
              <>
                View More <ChevronDown className="ml-1 h-3 w-3" />
              </>
            )}
          </Button>
        )}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-1">
        <div className="flex flex-wrap gap-1">
          {data &&
            Object.entries(data)
              .sort((a, b) => b[1] - a[1])
              .slice(0, showAll ? undefined : 15)
              .map(([word, count], i, array) => {
                const isAtleastThreeQuarters = i >= array.length * 0.75;
                const color = getTagColor(i, array.length);

                return (
                  <Badge
                    key={word}
                    variant="outline"
                    style={{ backgroundColor: color }}
                    className={cn(
                      "border-none",
                      isAtleastThreeQuarters && showAll
                        ? "text-black"
                        : "text-white",
                    )}
                  >
                    {word} <span className="text-xs font-bold">{count}</span>
                  </Badge>
                );
              })}

          {Object.entries(data).length === 0 && (
            <p className="text-sm opacity-70">No data</p>
          )}
        </div>
      </div>
    </div>
  );
};

const NotFoundInterest: React.FC = () => {
  const { slug } = Route.useParams();
  return <NotFound title="interest.not.found" data={slug} />;
};

export const Route = createFileRoute("/interests/$slug")({
  loader: async ({ params: { slug }, context: { queryClient } }) => {
    const id = await queryClient.ensureQueryData(
      interestSlugQueryOptions(slug),
    );

    if (!id) {
      return;
    }

    return Promise.all([
      queryClient.ensureQueryData(interestOptions(id)),
      queryClient.ensureQueryData(postsOptions(id)),
    ]);
  },
  notFoundComponent: NotFoundInterest,
  component: InterestDetail,
});
