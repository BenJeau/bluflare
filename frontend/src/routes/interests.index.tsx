import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useSuspenseQuery } from "@tanstack/react-query";
import * as v from "valibot";

import EmptyImg from "@/assets/adventure-1-70.svg";
import { Button } from "@/components/ui/button";
import { interestsOptions } from "@/api/interests";
import { useTranslation } from "@/i18n";
import { Empty, Trans } from "@/components";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

const InterestsComponent: React.FC = () => {
  const { search } = Route.useSearch();
  const navigate = Route.useNavigate();
  const { t } = useTranslation();
  const { data } = useSuspenseQuery(interestsOptions);

  const searchLowercase = search?.toLocaleLowerCase() ?? "";
  const filteredData = search
    ? data.filter(
        (interest) =>
          interest.subject.toLowerCase().includes(searchLowercase) ||
          interest.description.toLowerCase().includes(searchLowercase)
      )
    : data;

  return (
    <div className="flex flex-col gap-4 p-4 flex-1">
      <div className="flex gap-2">
        <Input
          placeholder={t("interests.search.placeholder") as string}
          className="h-8"
          value={search ?? ""}
          onChange={(e) =>
            navigate({
              search: { search: e.target.value },
              replace: true,
            })
          }
        />
        <Link to="/interests/create">
          <Button size="sm">
            <Plus className="h-2 w-2" />
            <Trans id="interests.add" />
          </Button>
        </Link>
      </div>

      <div className="flex flex-col gap-2 flex-1">
        {filteredData.map((interest) => (
          <Link
            to="/interests/$slug"
            params={{ slug: interest.slug }}
            key={interest.id}
            className="flex justify-between rounded-lg border p-3 bg-card group"
          >
            <div className="flex flex-col justify-center ms-2">
              <div className="flex items-baseline gap-2">
                <h2 className="font-medium group-hover:underline">
                  {interest.subject}
                </h2>
                <span className="text-xs text-gray-500">
                  {interest.description}
                </span>
              </div>
              <div className="flex flex-wrap gap-x-1">
                {interest.keywords.map((keyword) => (
                  <span key={keyword} className="text-xs text-green-500">
                    #{keyword}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-x-2 gap-y-1 items-end">
              <Badge variant={interest.enabled ? "default" : "destructive"}>
                <Trans
                  id={
                    interest.enabled ? "processing.posts" : "processing.paused"
                  }
                />
              </Badge>
              <Badge variant="secondary">
                {interest.post_count?.toLocaleString()}{" "}
                {t("posts").toLowerCase()}
              </Badge>
            </div>
          </Link>
        ))}
        {filteredData.length == 0 && (
          <Empty
            title="No interests"
            description="Add an interest to get started"
            image={EmptyImg}
            imageWidth={400}
          />
        )}
        {data.length === 0 && (
          <Empty
            title="No interests"
            description="Add an interest to get started"
            image={EmptyImg}
            imageWidth={400}
          />
        )}
      </div>
    </div>
  );
};

export const Route = createFileRoute("/interests/")({
  component: InterestsComponent,
  loader: async ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(interestsOptions),
  validateSearch: v.object({
    search: v.pipe(
      v.optional(v.string()),
      v.transform((input) => input || undefined)
    ),
  }),
});
