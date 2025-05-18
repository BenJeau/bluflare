import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";

import EmptyImg from "@/assets/camping-82.svg";
import { Button } from "@/components/ui/button";
import { interestsOptions } from "@/api/interests";
import { useTranslation } from "@/i18n";
import { Empty } from "@/components";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/interests/")({
  loader: async ({ context: { queryClient } }) => {
    queryClient.ensureQueryData(interestsOptions);
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useTranslation();
  const { data } = useSuspenseQuery(interestsOptions);
  const [search, setSearch] = useState("");

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex gap-2">
        <Input
          placeholder="Search interests..."
          className="h-8"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Link to="/interests/create">
          <Button size="sm">
            <Plus className="h-2 w-2" />
            {t("interests.add")}
          </Button>
        </Link>
      </div>

      <div className="grid gap-2">
        {data
          .filter((interest) =>
            interest.subject.toLowerCase().includes(search.toLowerCase())
          )
          .map((interest) => (
            <Link
              to="/interests/$slug"
              params={{ slug: interest.slug }}
              key={interest.id}
              className="flex items-start justify-between rounded-lg border p-3 bg-white group"
            >
              <div>
                <div className="flex items-center justify-between">
                  <h2 className="flex-1 font-medium group-hover:underline">
                    {interest.subject}
                    <span className="text-xs text-gray-500 ms-2">
                      {interest.description}
                    </span>
                  </h2>
                </div>
                <div className="flex flex-wrap gap-x-1">
                  {interest.keywords.map((keyword) => (
                    <span key={keyword} className="text-xs text-green-500">
                      #{keyword}
                    </span>
                  ))}
                </div>
              </div>
              <Badge variant="secondary">
                {interest.post_count?.toLocaleString()} posts
              </Badge>
            </Link>
          )) || (
          <Empty
            title="No interests"
            description="Add an interest to get started"
            image={EmptyImg}
          />
        )}
        {data.length === 0 && (
          <Empty
            title="No interests"
            description="Add an interest to get started"
            image={EmptyImg}
          />
        )}
      </div>
    </div>
  );
}
