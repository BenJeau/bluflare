import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Trash2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Newspaper,
  LinkIcon,
  Languages,
  Bot,
  Hash,
  Play,
  Pause,
} from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { useState, useMemo } from "react";

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
  useDeleteTopic,
  useSSETopicPosts,
  useMutateTopic,
  useAnalyzeTopic,
  topicOptions,
  topicSlugQueryOptions,
} from "@/api/topics";
import { postsOptions, Post } from "@/api/posts";
import {
  NotFound,
  PostCard,
  Trans,
  TopicKeywords,
  TopicStats,
} from "@/components";
import { countOccurrences } from "@/lib/utils";
import { authQueryOptions } from "@/api/auth";

const TopicDetail: React.FC = () => {
  const { slug } = Route.useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isAnalysisExpanded, setIsAnalysisExpanded] = useState(false);
  const [numberOfPostsToShow, setNumberOfPostsToShow] = useState(30);
  const [isSSEActive, setIsSSEActive] = useState(true);
  const analyzeTopic = useAnalyzeTopic();

  const { data: auth } = useSuspenseQuery(authQueryOptions);
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
      await analyzeTopic.mutateAsync(id);
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

  const urls = useMemo(
    () => countOccurrences(combinedPosts, "urls"),
    [combinedPosts],
  );
  const tags = useMemo(
    () => countOccurrences(combinedPosts, "tags"),
    [combinedPosts],
  );
  const langs = useMemo(
    () => countOccurrences(combinedPosts, "langs"),
    [combinedPosts],
  );

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
            disabled={analyzeTopic.isPending || !auth.canEdit}
          >
            <Sparkles className="h-4 w-4" />
            <Trans
              id={
                analyzeTopic.isPending
                  ? "topic.analyzing"
                  : "topic.analyze.posts"
              }
            />
          </Button>
          <Button
            variant="outline"
            onClick={handleEnableTopic}
            disabled={updateTopic.isPending || !auth.canEdit}
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
            disabled={!auth.canEdit}
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
      <TopicKeywords topic={topic} canEdit={auth.canEdit} />
      <TopicStats data={langs || {}} title="languages" Icon={Languages} />
      <TopicStats data={urls || {}} title="urls" Icon={LinkIcon} />
      <TopicStats data={tags || {}} title="hashtags" Icon={Hash} />
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
        <div className="grid grid-cols-1 gap-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
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
      queryClient.ensureQueryData(authQueryOptions),
    ]);
  },
  notFoundComponent: NotFoundTopic,
  component: TopicDetail,
});
