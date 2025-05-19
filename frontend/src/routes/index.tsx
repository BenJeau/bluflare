import { latestPostsOptions, Post, useSSELatestPosts } from "@/api/posts";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Pause, Play } from "lucide-react";
import { PostCard } from "@/components";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  loader: async ({ context }) => {
    const posts = await context.queryClient.ensureQueryData(latestPostsOptions);
    return { posts };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const [sseEnabled, setSseEnabled] = useState(true);
  const posts = useSuspenseQuery(latestPostsOptions);
  const { data: ssePosts } = useSSELatestPosts(sseEnabled);

  const combinedPosts: Post[] = useMemo(() => {
    if (ssePosts.length > 15) {
      return ssePosts;
    }

    return [...ssePosts, ...posts.data];
  }, [posts, ssePosts]);

  return (
    <div className="flex overflow-y-hidden ">
      <div className="flex flex-1 flex-col gap-4 justify-center p-4">
        <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-sky-500">
          Welcome to Bluflare
        </h1>
        <p className="text-xl md:text-xl text-muted-foreground mb-8">
          Start analyzing your interests and get insights on{" "}
          <a
            href="https://bsky.app"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Bluesky
          </a>
        </p>
        <Link
          to="/interests"
          className="shadow-lg border border-primary/20 inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-lg font-semibold"
        >
          Get Started
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
      <div className="p-4 max-w-2xl border-l relative bg-background/50">
        <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
          <div>
            <h2 className="text-lg font-bold -mb-1">Recently ingested posts</h2>
            <p className="text-xs text-muted-foreground">
              Enable the live updates to see the latest posts
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSseEnabled((prev) => !prev)}
          >
            {sseEnabled ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            {sseEnabled ? "Disable live updates" : "Enable live updates"}
          </Button>
        </div>
        {combinedPosts.map((post, index) => (
          <PostCard
            key={post.id}
            post={post}
            keywords={[]}
            className="mb-4"
            offset={index}
          />
        ))}
        <div className="absolute bottom-0 right-0 left-0 h-60 bg-gradient-to-t from-background to-transparent" />
      </div>
    </div>
  );
}
