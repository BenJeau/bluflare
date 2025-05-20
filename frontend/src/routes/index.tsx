import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpenText,
  LucideIcon,
  Pause,
  Play,
  Radio,
  Speech,
} from "lucide-react";
import { useState } from "react";

import { latestPostsOptions, useSSELatestPosts } from "@/api/posts";
import { PostCard } from "@/components";
import { Button } from "@/components/ui/button";
import { interestsOptions } from "@/api/interests";

function RouteComponent() {
  const [sseEnabled, setSseEnabled] = useState(true);

  const { data: interests } = useSuspenseQuery(interestsOptions);

  return (
    <div className="flex overflow-y-hidden flex-1">
      <div className="flex flex-1 flex-col">
        <div className="flex-1 flex flex-col gap-6 justify-center p-24">
          <h1 className="text-5xl md:text-6xl font-bold">
            Welcome to{" "}
            <span className="font-black bg-clip-text text-transparent bg-gradient-to-r from-primary to-sky-500 underline decoration-wavy">
              Bluflare
            </span>
          </h1>
          <p className="mb-8">
            The{" "}
            <a
              href="https://github.com/BenJeau/bluflare"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              open-source platform
            </a>{" "}
            for getting insights on{" "}
            <a
              href="https://bsky.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Bluesky
            </a>
            , see what people are talking about, and dig into specific topics
          </p>
        </div>
        <div className="flex flex-col gap-4 border-t p-4 bg-green-50 dark:bg-green-950/15">
          <SubSection
            title="Latest users"
            description="Enable the live updates to see the latest posts"
            Icon={Speech}
            data={interests}
            render={(interest) => (
              <Link
                key={interest.id}
                to="/interests/$slug"
                params={{ slug: interest.slug }}
                className="text-primary hover:underline text-sm bg-background/50 border rounded-lg p-2 shadow-xs"
              >
                {interest.slug}
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          />
          <div className="border-t" />
          <SubSection
            title="Latest interests"
            description="Enable the live updates to see the latest posts"
            Icon={BookOpenText}
            data={interests}
            render={(interest) => (
              <Link
                key={interest.id}
                to="/interests/$slug"
                params={{ slug: interest.slug }}
                className="text-primary hover:underline text-sm bg-background/50 border rounded-lg p-2 shadow-xs"
              >
                {interest.slug}
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          />
        </div>
      </div>
      <div className="p-4 max-w-2xl border-l relative bg-background/50">
        <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
          <div>
            <div className="-mb-1 flex items-center gap-1">
              <Radio />
              <h2 className="text-lg font-bold">Recently ingested posts</h2>
            </div>
            <p className="text-xs opacity-70">
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
            {sseEnabled ? "Pause live updates" : "Resume live updates"}
          </Button>
        </div>
        <RecentlyIngestedPosts sseEnabled={sseEnabled} />
        <div className="absolute bottom-0 right-0 left-0 h-60 bg-gradient-to-t from-background to-transparent" />
      </div>
    </div>
  );
}

interface SubSectionProps<T> {
  title: string;
  description: string;
  Icon: LucideIcon;
  data: T[];
  render: (data: T) => React.ReactNode;
}

function SubSection<T>({
  title,
  description,
  Icon,
  data,
  render,
}: SubSectionProps<T>) {
  return (
    <>
      <div>
        <div className="-mb-1 flex items-center gap-1">
          <Icon />
          <h2 className="text-lg font-bold">{title}</h2>
        </div>
        <p className="text-xs opacity-70">{description}</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {data.map((interest) => render(interest))}
      </div>
    </>
  );
}

const RecentlyIngestedPosts = ({ sseEnabled }: { sseEnabled: boolean }) => {
  const posts = useSuspenseQuery(latestPostsOptions);
  const { data: ssePosts } = useSSELatestPosts(sseEnabled);

  const combinedPosts = [...ssePosts, ...posts.data];

  return (
    <>
      {combinedPosts.map((post, index) => (
        <PostCard
          key={post.id}
          post={post}
          keywords={[]}
          className="mb-4"
          offset={index}
        />
      ))}
    </>
  );
};

export const Route = createFileRoute("/")({
  loader: async ({ context: { queryClient } }) => {
    await Promise.all([
      queryClient.ensureQueryData(latestPostsOptions),
      queryClient.ensureQueryData(interestsOptions),
    ]);
  },
  component: RouteComponent,
});
