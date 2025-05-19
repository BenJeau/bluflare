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
import { queryClient } from "@/api/query-client";
import { useMutationSuggestKeywords } from "@/api/suggest";
import { postsOptions, Post } from "@/api/posts";
import { NotFound } from "@/components";

const NotFoundInterest: React.FC = () => {
  const { slug } = Route.useParams();
  return <NotFound title="interest.not.found" data={slug} />;
};

export const Route = createFileRoute("/interests/$slug")({
  loader: async ({ params: { slug }, context: { queryClient } }) => {
    const id = await queryClient.ensureQueryData(
      interestSlugQueryOptions(slug)
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

function InterestDetail() {
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
      queryClient.invalidateQueries({ queryKey: ["interests", id] });
    } catch (error) {
      toast.error("Failed to analyze interest");
    }
  };

  const combinedPosts: Post[] = useMemo(() => {
    const uniquePosts = new Map();
    [...ssePosts, ...posts].forEach((post) =>
      uniquePosts.set(post.post.id, post)
    );
    return Array.from(uniquePosts.values());
  }, [posts, ssePosts]);

  const urls: Record<string, number> = useMemo(() => {
    return combinedPosts.reduce((acc, post) => {
      post.urls.forEach((url) => {
        acc[url] = (acc[url] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);
  }, [combinedPosts]);

  const tags: Record<string, number> = useMemo(() => {
    return combinedPosts.reduce((acc, post) => {
      post.tags.forEach((tag) => {
        acc[tag] = (acc[tag] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);
  }, [combinedPosts]);

  const langs: Record<string, number> = useMemo(() => {
    return combinedPosts.reduce((acc, post) => {
      post.langs.forEach((lang) => {
        acc[lang] = (acc[lang] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);
  }, [combinedPosts]);

  return (
    <div className="flex flex-col gap-2 p-4">
      <div className="flex justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/interests">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h2 className="text-xl font-bold">
            <span className="flex gap-2 items-baseline">
              {interest.subject}
              <p className="text-sm font-normal italic">
                {interest.description}
              </p>
            </span>
            <p className="text-sm text-muted-foreground font-normal">
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
      <div className="rounded-lg border p-4 bg-white">
        <div className="flex justify-between items-center">
          <p className="text-sm font-semibold flex gap-2 items-center">
            <Bot className="h-4 w-4" /> Analysis{" "}
            <span className="text-xs text-muted-foreground">
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
                  Collapse <ChevronUp className="h-3 w-3 ml-1" />
                </>
              ) : (
                <>
                  Expand <ChevronDown className="h-3 w-3 ml-1" />
                </>
              )}
            </Button>
          )}
        </div>
        {isAnalysisExpanded && (
          <div className="prose prose-sm max-w-none dark:prose-invert mt-2">
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
      <div className="rounded-lg border p-4 flex gap-2 flex-col bg-white">
        <div className="flex justify-between gap-2">
          <p className="text-sm font-semibold flex gap-2 items-center">
            <Newspaper className="h-4 w-4" /> Posts{" "}
            <span className="text-xs text-muted-foreground">
              ({combinedPosts.length})
            </span>
          </p>
          <div className="flex gap-2 items-center">
            <p className="text-sm font-semibold">Latest posts to show</p>
            <Select
              value={numberOfPostsToShow.toString()}
              onValueChange={(value) => setNumberOfPostsToShow(Number(value))}
            >
              <SelectTrigger className="w-[100px]" size="sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30</SelectItem>
                <SelectItem value="90">90</SelectItem>
                <SelectItem value="150">150</SelectItem>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {combinedPosts.slice(0, numberOfPostsToShow).map((post) => (
            <PostCard post={post} keywords={interest.keywords} key={post.id} />
          ))}
        </div>
      </div>
    </div>
  );
}

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
      queryClient.invalidateQueries({ queryKey: ["interests", interest.id] });
    } catch (error) {
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
        (keyword) => !editedKeywords.includes(keyword)
      );
      setEditedKeywords([...editedKeywords, ...newKeywords]);
    } catch (error) {
      toast.error("Failed to suggest keywords");
    }
  };

  return (
    <div className="rounded-lg border p-4 flex gap-2 flex-col bg-white">
      <div className="flex justify-between items-center">
        <p className="text-sm font-semibold flex gap-2 items-center">
          <Tag className="h-4 w-4" /> Keywords{" "}
          <span className="text-xs text-muted-foreground">
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
                "h-8 relative overflow-hidden",
                isSuggesting &&
                  "bg-gradient-to-r from-purple-500 via-pink-500 to-sky-500 animate-gradient"
              )}
              disabled={isSuggesting}
            >
              <div className="relative flex items-center">
                <Sparkles className="h-3 w-3 mr-1" />
                {isSuggesting ? "Suggesting..." : "Suggest AI Keywords"}
              </div>
            </Button>
          </div>
          <div className="flex flex-wrap gap-1">
            {editedKeywords.map((keyword, index) => (
              <div
                key={index}
                className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-sm"
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
      {isSuggesting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-sky-500 animate-gradient opacity-50" />
          <div
            className="absolute inset-0 bg-gradient-to-br from-sky-500 via-purple-500 to-pink-500 animate-gradient opacity-50"
            style={{ animationDelay: "0.5s" }}
          />
          <div
            className="absolute inset-0 bg-gradient-to-tr from-pink-500 via-sky-500 to-purple-500 animate-gradient opacity-50"
            style={{ animationDelay: "1s" }}
          />

          <div className="absolute inset-0 bg-black/20 backdrop-blur-md" />

          <div className="relative flex flex-col items-center gap-6 p-10 rounded-lg bg-white/80 shadow-2xl backdrop-blur-sm border border-white/20">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Sparkles className="h-8 w-8 text-purple-500 animate-pulse" />
                <div className="absolute inset-0 bg-purple-500/20 rounded-full animate-ping" />
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-500 via-pink-500 to-sky-500 bg-clip-text text-transparent animate-gradient">
                AI is thinking...
              </h3>
            </div>

            <div className="w-72 h-3 bg-gray-200/50 rounded-full overflow-hidden backdrop-blur-sm">
              <div
                className="w-full h-full bg-gradient-to-r from-purple-500 via-pink-500 to-sky-500 animate-gradient"
                style={{ animationDuration: "1s" }}
              />
            </div>

            <div className="absolute inset-0 overflow-hidden">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 rounded-full bg-white/30 animate-float"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: `${3 + Math.random() * 2}s`,
                  }}
                />
              ))}
            </div>
          </div>
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
    <div className="rounded-lg border p-4 flex gap-2 flex-col bg-white">
      <div className="flex justify-between items-center">
        <p className="text-sm font-semibold flex gap-2 items-center">
          <Icon className="h-4 w-4" /> {title}{" "}
          <span className="text-xs text-muted-foreground">
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
                Show Less <ChevronUp className="h-3 w-3 ml-1" />
              </>
            ) : (
              <>
                View More <ChevronDown className="h-3 w-3 ml-1" />
              </>
            )}
          </Button>
        )}
      </div>
      <div className="flex flex-wrap gap-1 items-center justify-between">
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
                        : "text-white"
                    )}
                  >
                    {word} <span className="text-xs font-bold">{count}</span>
                  </Badge>
                );
              })}
        </div>
      </div>
    </div>
  );
};
