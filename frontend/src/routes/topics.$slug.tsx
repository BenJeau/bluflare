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
import { TransId, useTranslation } from "@/i18n";
import {
  Topic,
  useDeleteTopic,
  useSSETopicPosts,
  useMutateTopic,
  useAnalyzeTopic,
  topicOptions,
  topicSlugQueryOptions,
} from "@/api/topics";
import { Badge } from "@/components/ui/badge";
import { cn, getTagColor } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { useMutationSuggestKeywords } from "@/api/suggest";
import { postsOptions, Post } from "@/api/posts";
import { NotFound, PostCard, Trans } from "@/components";

const TopicDetail: React.FC = () => {
  const { slug } = Route.useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isAnalysisExpanded, setIsAnalysisExpanded] = useState(false);
  const [numberOfPostsToShow, setNumberOfPostsToShow] = useState(30);
  const [isSSEActive, setIsSSEActive] = useState(true);
  const { mutateAsync: analyzeTopic, isPending: isAnalyzing } =
    useAnalyzeTopic();

  const { data: id } = useSuspenseQuery(topicSlugQueryOptions(slug));
  const { data: topic } = useSuspenseQuery(topicOptions(id));
  const { data: posts } = useSuspenseQuery(postsOptions(id));
  const { data: ssePosts } = useSSETopicPosts(id, isSSEActive);

  const updateTopic = useMutateTopic(topic.id);
  const deleteTopic = useDeleteTopic();

  const handleDeleteTopic = async (id: number) => {
    try {
      await deleteTopic.mutateAsync(id);
      toast.success(t("topic.deleted.success"));
    } catch (error) {
      console.error(error);
      toast.error(t("topic.deleted.error"));
    }
    navigate({ to: "/topics" });
  };

  const handleAnalyzeTopic = async () => {
    try {
      await analyzeTopic(Number(id));
    } catch (error) {
      console.error(error);
      toast.error(t("topic.analysis.failed"));
    }
  };

  const handleEnableTopic = async () => {
    try {
      await updateTopic.mutateAsync({
        enabled: !topic.enabled,
      });
      toast.success(
        t(topic.enabled ? "topic.disabled.success" : "topic.enabled.success"),
      );
    } catch (error) {
      console.error(error);
      toast.error(
        t(topic.enabled ? "topic.disabled.error" : "topic.enabled.error"),
      );
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
            <Link to="/topics">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h2 className="text-xl font-bold">
            <span className="flex flex-wrap items-baseline gap-x-2">
              {topic.subject}
              <p className="text-sm font-normal italic">{topic.description}</p>
            </span>
            <p className="text-sm font-normal opacity-70">
              {t("topics.detail.created")}:{" "}
              {new Date(topic.created_at).toLocaleString()}
            </p>
          </h2>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleAnalyzeTopic}
            disabled={isAnalyzing}
          >
            <Sparkles className="h-4 w-4" />
            <Trans
              id={isAnalyzing ? "topic.analyzing" : "topic.analyze.posts"}
            />
          </Button>
          <Button
            variant="outline"
            onClick={handleEnableTopic}
            disabled={updateTopic.isPending}
          >
            {topic.enabled ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            <Trans
              id={
                topic.enabled
                  ? "topic.disable.ingestion"
                  : "topic.enable.ingestion"
              }
            />
          </Button>
          <Button
            variant="destructive"
            size="icon"
            onClick={() => handleDeleteTopic(Number(id))}
            className="cursor-pointer"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="bg-background/75 rounded-lg border p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <Bot className="h-4 w-4" /> <Trans id="analysis" />{" "}
            <span className="text-xs opacity-70">
              (
              {topic.last_analysis_at ? (
                new Date(topic.last_analysis_at).toLocaleString()
              ) : (
                <Trans id="never.analyzed" />
              )}
              )
            </span>
          </p>
          {topic.last_analysis && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsAnalysisExpanded(!isAnalysisExpanded)}
              className="h-6"
            >
              {isAnalysisExpanded ? (
                <>
                  <Trans id="collapse" /> <ChevronUp className="ml-1 h-3 w-3" />
                </>
              ) : (
                <>
                  <Trans id="expand" /> <ChevronDown className="ml-1 h-3 w-3" />
                </>
              )}
            </Button>
          )}
        </div>
        {isAnalysisExpanded && (
          <div className="prose prose-sm dark:prose-invert mt-2 max-w-none">
            <ReactMarkdown>
              {topic.last_analysis ?? t("never.analyzed.description")}
            </ReactMarkdown>
          </div>
        )}
      </div>
      <KeywordsSection topic={topic} />
      <StatsSection data={langs || {}} title="languages" Icon={Languages} />
      <StatsSection data={urls || {}} title="urls" Icon={LinkIcon} />
      <StatsSection data={tags || {}} title="hashtags" Icon={Hash} />
      <div className="bg-background/75 flex flex-col gap-2 rounded-lg border p-4 shadow-xs">
        <div className="flex justify-between gap-2">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <Newspaper className="h-4 w-4" /> <Trans id="posts" />{" "}
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
              keywords={topic.keywords}
              offset={index}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const KeywordsSection = ({ topic }: { topic: Topic }) => {
  const [isEditingKeywords, setIsEditingKeywords] = useState(false);
  const [currentKeyword, setCurrentKeyword] = useState("");
  const [editedKeywords, setEditedKeywords] = useState<string[]>([]);
  const { mutateAsync: updateTopic } = useMutateTopic(topic.id);
  const { mutateAsync: suggestKeywords, isPending: isSuggesting } =
    useMutationSuggestKeywords();

  const { t } = useTranslation();

  const handleStartEditing = () => {
    setEditedKeywords([...topic.keywords]);
    setIsEditingKeywords(true);
  };

  const handleCancelEditing = () => {
    setIsEditingKeywords(false);
    setCurrentKeyword("");
    setEditedKeywords([]);
  };

  const handleSaveKeywords = async () => {
    try {
      await updateTopic({ keywords: editedKeywords });
      toast.success(t("keywords.updated.success"));
      setIsEditingKeywords(false);
    } catch (error) {
      console.error(error);
      toast.error(t("keywords.updated.error"));
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
        subject: topic.subject,
        description: topic.description,
      });
      const newKeywords = suggestedKeywords.filter(
        (keyword) => !editedKeywords.includes(keyword),
      );
      setEditedKeywords([...editedKeywords, ...newKeywords]);
      toast.success(t("keywords.suggest.success"));
    } catch (error) {
      console.error(error);
      toast.error(t("keywords.suggest.error"));
    }
  };

  return (
    <div className="bg-background/75 flex flex-col gap-2 rounded-lg border p-4 shadow-xs">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <Tag className="h-4 w-4" /> <Trans id="keywords" />{" "}
          <span className="text-xs opacity-70">({topic.keywords.length})</span>
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
              <Trans id="cancel" />
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleSaveKeywords}
              className="h-6"
            >
              <Trans id="save" />
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
                <Trans
                  id={isSuggesting ? "suggesting" : "suggest.ai.keywords"}
                />
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
          {topic.keywords.map((keyword: string) => (
            <Badge key={keyword}>{keyword}</Badge>
          ))}
        </div>
      )}
    </div>
  );
};

type StatsSectionProps = {
  data: Record<string, number>;
  title: TransId;
  Icon: React.ElementType;
};

const StatsSection = ({ data, title, Icon }: StatsSectionProps) => {
  const [showAll, setShowAll] = useState(false);
  const { t } = useTranslation();

  return (
    <div className="bg-background/75 flex flex-col gap-2 rounded-lg border p-4 shadow-xs">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <Icon className="h-4 w-4" /> <Trans id={title} />{" "}
          <span className="text-xs opacity-70">
            (
            <Trans
              id="count.unique.data"
              count={(data && Object.keys(data).length) ?? 0}
              data={t(title).toLocaleLowerCase()}
            />
            )
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
                <Trans id="show.less" /> <ChevronUp className="ml-1 h-3 w-3" />
              </>
            ) : (
              <>
                <Trans id="view.more" />{" "}
                <ChevronDown className="ml-1 h-3 w-3" />
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
            <p className="text-sm opacity-70">
              <Trans id="no.data" />
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const NotFoundTopic: React.FC = () => {
  const { slug } = Route.useParams();
  return <NotFound title="topic.not.found" data={slug} />;
};

export const Route = createFileRoute("/topics/$slug")({
  loader: async ({ params: { slug }, context: { queryClient } }) => {
    const id = await queryClient.ensureQueryData(topicSlugQueryOptions(slug));

    if (!id) {
      return;
    }

    return Promise.all([
      queryClient.ensureQueryData(topicOptions(id)),
      queryClient.ensureQueryData(postsOptions(id)),
    ]);
  },
  notFoundComponent: NotFoundTopic,
  component: TopicDetail,
});
