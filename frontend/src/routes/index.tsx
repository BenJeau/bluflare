import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpenText, Pause, Play, Radio, Speech } from "lucide-react";
import { useState } from "react";

import { latestPostsOptions } from "@/api/posts";
import { HomeSubSection, RecentlyIngestedPosts, Trans } from "@/components";
import { Button } from "@/components/ui/button";
import { interestsOptions } from "@/api/interests";

const IndexComponent: React.FC = () => {
  const [sseEnabled, setSseEnabled] = useState(true);

  const { data: interests } = useSuspenseQuery(interestsOptions);

  return (
    <div className="flex flex-1 overflow-y-hidden">
      <div className="flex flex-1 flex-col">
        <div className="flex flex-1 flex-col justify-center gap-6 p-24">
          <h1 className="text-5xl font-bold md:text-6xl">
            <Trans
              id="home.welcome"
              name={
                <span className="from-primary bg-gradient-to-r to-sky-500 bg-clip-text font-black text-transparent underline decoration-wavy">
                  Bluflare
                </span>
              }
            />
          </h1>
          <p className="mb-8">
            <Trans
              id="home.welcome.description"
              openSourcePlatform={
                <a
                  href="https://github.com/BenJeau/bluflare"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  <Trans id="opensource.platform" />
                </a>
              }
              socialNetwork={
                <a
                  href="https://bsky.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Bluesky
                </a>
              }
            />
          </p>
        </div>
        <div className="flex flex-col gap-4 border-t bg-green-50 p-4 dark:bg-green-950/15">
          <HomeSubSection
            title="latest.users"
            description="latest.users.description"
            Icon={Speech}
            data={interests}
            viewAllLink="/users"
            render={(interest) => (
              <Link
                key={interest.id}
                to="/interests/$slug"
                params={{ slug: interest.slug }}
                className="text-primary bg-background/50 rounded-lg border p-2 text-sm shadow-xs hover:underline"
              >
                {interest.slug}
              </Link>
            )}
          />
          <div className="border-t" />
          <HomeSubSection
            title="latest.interests"
            description="latest.interests.description"
            Icon={BookOpenText}
            data={interests}
            viewAllLink="/interests"
            render={(interest) => (
              <Link
                key={interest.id}
                to="/interests/$slug"
                params={{ slug: interest.slug }}
                className="text-primary bg-background/50 rounded-lg border p-2 text-sm shadow-xs hover:underline"
              >
                {interest.slug}
              </Link>
            )}
          />
        </div>
      </div>
      <div className="bg-background/50 relative max-w-2xl border-l p-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="-mb-1 flex items-center gap-1">
              <Radio />
              <h2 className="text-lg font-bold">
                <Trans id="recently.ingested.posts" />
              </h2>
            </div>
            <p className="text-xs opacity-70">
              <Trans id="recently.ingested.posts.description" />
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSseEnabled((prev) => !prev)}
          >
            {sseEnabled ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            <Trans
              id={sseEnabled ? "pause.live.updates" : "resume.live.updates"}
            />
          </Button>
        </div>
        <RecentlyIngestedPosts sseEnabled={sseEnabled} />
        <div className="from-background absolute right-0 bottom-0 left-0 h-60 bg-gradient-to-t to-transparent" />
      </div>
    </div>
  );
};

export const Route = createFileRoute("/")({
  loader: async ({ context: { queryClient } }) =>
    Promise.all([
      queryClient.ensureQueryData(latestPostsOptions),
      queryClient.ensureQueryData(interestsOptions),
    ]),
  component: IndexComponent,
});
