import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpenText, Pause, Play, Radio, Speech } from "lucide-react";
import { useState } from "react";
import dayjs from "dayjs";

import { latestPostsOptions } from "@/api/posts";
import { HomeSubSection, RecentlyIngestedPosts, Trans } from "@/components";
import { Button } from "@/components/ui/button";
import { interestsOptions } from "@/api/interests";
import { latestUsersOptions } from "@/api/users";
import { useTranslation } from "@/i18n";

const IndexComponent: React.FC = () => {
  const { t } = useTranslation();
  const [sseEnabled, setSseEnabled] = useState(true);

  const { data: interests } = useSuspenseQuery(interestsOptions);
  const { data: users } = useSuspenseQuery(latestUsersOptions);
  return (
    <div className="flex flex-1 flex-col overflow-y-hidden md:flex-row">
      <div className="flex flex-1 flex-col">
        <div className="flex flex-1 flex-col justify-center gap-6 p-12">
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
          <p>
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
            data={users.users}
            total={users.total}
            viewAllLink="/users"
            emptyMessage="no.users"
            viewAllText="view.all.users"
            render={(user) => {
              const handle = user.aka ? user.aka[0].split("://")[1] : user.did;

              return (
                <Link
                  key={user.id}
                  to="/users"
                  className="group bg-background/75 hover:bg-background flex flex-col rounded-lg border p-2 text-sm shadow-xs transition-all active:shadow-inner"
                >
                  <h3 className="overflow-hidden font-medium overflow-ellipsis whitespace-nowrap group-hover:underline">
                    {handle}
                  </h3>
                  <span className="overflow-hidden text-xs overflow-ellipsis whitespace-nowrap opacity-70">
                    First seen{" "}
                    <span className="font-medium italic">
                      {dayjs(user.createdAt).format("LL LTS")}
                    </span>
                  </span>
                </Link>
              );
            }}
          />
          <div className="border-t" />
          <HomeSubSection
            title="latest.interests"
            description="latest.interests.description"
            Icon={BookOpenText}
            data={interests}
            viewAllLink="/interests"
            emptyMessage="no.interests"
            viewAllText="view.all.interests"
            render={(interest) => (
              <Link
                key={interest.id}
                to="/interests/$slug"
                params={{ slug: interest.slug }}
                className="bg-background/75 hover:bg-background group flex flex-col rounded-lg border p-2 text-sm shadow-xs transition-all active:shadow-inner"
              >
                <div className="flex items-center justify-between gap-4">
                  <h3 className="overflow-hidden font-medium overflow-ellipsis whitespace-nowrap group-hover:underline">
                    {interest.subject}
                  </h3>
                  <p className="text-xs whitespace-nowrap text-sky-300 opacity-70">
                    {interest.post_count?.toLocaleString()}{" "}
                    {t("posts").toLowerCase()}
                  </p>
                </div>
                {interest.description ? (
                  <span className="overflow-hidden text-xs overflow-ellipsis whitespace-nowrap opacity-70">
                    {interest.description}
                  </span>
                ) : (
                  <span className="text-xs italic opacity-35">
                    <Trans id="no.description" />
                  </span>
                )}
              </Link>
            )}
          />
        </div>
      </div>
      <div className="bg-background/75 flex-1 border-t border-l p-4 md:relative md:border-t-0">
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
            className="cursor-pointer"
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
      queryClient.ensureQueryData(latestUsersOptions),
    ]),
  component: IndexComponent,
});
