import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useSuspenseQuery } from "@tanstack/react-query";
import * as v from "valibot";

import EmptyImg from "@/assets/adventure-1-70.svg";
import { Button } from "@/components/ui/button";
import { topicsOptions } from "@/api/topics";
import { useTranslation } from "@/i18n";
import { Empty, Trans } from "@/components";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { authQueryOptions } from "@/api/auth";

const TopicsComponent: React.FC = () => {
  const { search } = Route.useSearch();
  const navigate = Route.useNavigate();
  const { t } = useTranslation();
  const { data: topics } = useSuspenseQuery(topicsOptions);
  const serverAuth = useSuspenseQuery(authQueryOptions);

  const searchLowercase = search?.toLocaleLowerCase() ?? "";
  const filteredData = search
    ? topics.filter(
        (topic) =>
          topic.subject.toLowerCase().includes(searchLowercase) ||
          topic.description.toLowerCase().includes(searchLowercase),
      )
    : topics;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="flex gap-2">
        <Input
          placeholder={t("topics.search.placeholder")}
          className="h-8"
          value={search ?? ""}
          onChange={(e) =>
            navigate({
              search: { search: e.target.value },
              replace: true,
            })
          }
        />
        <Button size="sm" disabled={!serverAuth.data.canEdit}>
          <Link
            to="/topics/create"
            search={{ subject: search }}
            className="flex items-center gap-1"
          >
            <Plus className="h-2 w-2" />
            <Trans id="topics.add" />
          </Link>
        </Button>
      </div>

      <div className="flex flex-1 flex-col gap-2">
        {filteredData.map((topic) => (
          <Link
            to="/topics/$slug"
            params={{ slug: topic.slug }}
            key={topic.id}
            className="bg-background/75 group hover:bg-background flex justify-between gap-4 rounded-lg border p-2 text-sm shadow-xs transition-all active:shadow-inner"
          >
            <div className="ms-1 flex flex-col justify-center">
              <div className="flex flex-wrap items-baseline gap-x-2">
                <h2 className="font-medium group-hover:underline">
                  {topic.subject}
                </h2>
                <span className="text-xs opacity-70">{topic.description}</span>
              </div>
              <div className="flex flex-wrap gap-x-1">
                {topic.keywords.map((keyword) => (
                  <span key={keyword} className="text-xs text-green-500">
                    #{keyword}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex flex-col items-end gap-x-2 gap-y-1">
              <Badge variant={topic.enabled ? "default" : "destructive"}>
                <Trans
                  id={topic.enabled ? "processing.posts" : "processing.paused"}
                />
              </Badge>
              <Badge variant="secondary">
                {topic.post_count?.toLocaleString()} {t("posts").toLowerCase()}
              </Badge>
            </div>
          </Link>
        ))}
        {filteredData.length == 0 && topics.length != 0 && (
          <Empty
            title="no.topics.search"
            description="no.topics.search.description"
            image={EmptyImg}
            imageWidth={400}
          />
        )}
        {topics.length === 0 && (
          <Empty
            title="no.topics"
            description="no.topics.description"
            image={EmptyImg}
            imageWidth={400}
          />
        )}
      </div>
    </div>
  );
};

export const Route = createFileRoute("/topics/")({
  component: TopicsComponent,
  loader: ({ context: { queryClient } }) =>
    Promise.all([
      queryClient.ensureQueryData(topicsOptions),
      queryClient.ensureQueryData(authQueryOptions),
    ]),
  validateSearch: v.object({
    search: v.pipe(
      v.optional(v.string()),
      v.transform((input) => input || undefined),
    ),
  }),
});
