import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n";
import config from "@/lib/config";
import {
  useDeleteInterest,
  useInterestTags,
  useInterestUrls,
} from "@/api/interests";
import { Badge } from "@/components/ui/badge";
import { usePosts } from "@/api/posts";
import clsx from "clsx";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";

// Add this function before the InterestDetail component
const getTagColor = (count: number, min: number, max: number) => {
  if (min === max) return "bg-white";

  const ratio = count / max;
  const red = Math.floor(255 * ratio);

  return `#${red.toString(16).padStart(2, "0")}0000`;
};

export const Route = createFileRoute("/interests/$id")({
  component: InterestDetail,
});

function InterestDetail() {
  const { id } = Route.useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showAllTags, setShowAllTags] = useState(false);
  const [showAllUrls, setShowAllUrls] = useState(false);
  const {
    data: interest,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["interests", id],
    queryFn: async () => {
      const response = await fetch(
        `${config.rest_server_base_url}/interests/${id}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch interest");
      }
      return response.json();
    },
  });

  const { data: posts } = usePosts(Number(id));
  const { data: urls } = useInterestUrls(Number(id));
  const { data: tags } = useInterestTags(Number(id));

  const deleteInterest = useDeleteInterest();

  if (isLoading) {
    return <div className="p-4">Loading...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error.message}</div>;
  }

  const handleDeleteInterest = async (id: number) => {
    await deleteInterest.mutateAsync(id);
    toast.success("Interest deleted successfully");
    navigate({ to: "/interests" });
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex justify-between gap-2">
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
        <Button
          variant="destructive"
          size="icon"
          onClick={() => handleDeleteInterest(Number(id))}
          className="cursor-pointer"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <div className="rounded-lg border p-4 flex gap-2 flex-col bg-white">
        <p className="text-sm font-semibold">
          Keywords{" "}
          <span className="text-xs text-muted-foreground">
            ({interest.keywords.length})
          </span>
        </p>
        <div className="flex flex-wrap gap-1">
          {interest.keywords.map((keyword) => (
            <Badge key={keyword}>{keyword}</Badge>
          ))}
        </div>
      </div>
      <div className="rounded-lg border p-4 flex gap-2 flex-col bg-white">
        <div className="flex justify-between items-center">
          <p className="text-sm font-semibold">
            URLs{" "}
            <span className="text-xs text-muted-foreground">
              ({(urls && Object.keys(urls).length) ?? 0} unique URLs)
            </span>
          </p>
          {urls && Object.keys(urls).length > 10 && (
            <Button
              variant="secondary"
              className="h-6 px-2 py-1"
              onClick={() => setShowAllUrls(!showAllUrls)}
            >
              {showAllUrls ? (
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
        <div className="flex flex-wrap gap-1">
          {urls &&
            Object.entries(urls)
              .slice(0, showAllUrls ? undefined : 10)
              .sort((a, b) => b[1] - a[1])
              .map(([tag, count], _, array) => {
                const counts = array.map(([_, c]) => c);
                const min = Math.min(...counts);
                const max = Math.max(...counts);
                const color = getTagColor(count, min, max);

                return (
                  <Badge
                    key={tag}
                    variant="outline"
                    style={{ backgroundColor: color }}
                    className="text-white border-none"
                  >
                    {tag} <span className="text-xs font-bold">{count}</span>
                  </Badge>
                );
              })}
        </div>
      </div>
      <div className="rounded-lg border p-4 flex gap-2 flex-col bg-white">
        <div className="flex justify-between items-center">
          <p className="text-sm font-semibold">
            Tags{" "}
            <span className="text-xs text-muted-foreground">
              ({(tags && Object.keys(tags).length) ?? 0} unique tags)
            </span>
          </p>

          {tags && Object.keys(tags).length > 10 && (
            <Button
              variant="secondary"
              className="h-6 px-2 py-1"
              onClick={() => setShowAllTags(!showAllTags)}
            >
              {showAllTags ? (
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
            {tags &&
              Object.entries(tags)
                .sort((a, b) => b[1] - a[1])
                .slice(0, showAllTags ? undefined : 10)
                .map(([tag, count], _, array) => {
                  const counts = array.map(([_, c]) => c);
                  const min = Math.min(...counts);
                  const max = Math.max(...counts);
                  const color = getTagColor(count, min, max);

                  return (
                    <Badge
                      key={tag}
                      variant="outline"
                      style={{ backgroundColor: color }}
                      className="text-white border-none"
                    >
                      {tag} <span className="text-xs font-bold">{count}</span>
                    </Badge>
                  );
                })}
          </div>
        </div>
      </div>
      <div className="rounded-lg border p-4 flex gap-2 flex-col bg-white">
        <p className="text-sm font-semibold">
          Posts{" "}
          <span className="text-xs text-muted-foreground">
            ({posts?.length})
          </span>
        </p>
        <div className="flex flex-wrap flex-col gap-2">
          {posts?.map(
            ({ text, created_at, urls, did, cid, rkey, langs, tags, aka }) => (
              <div
                key={text}
                className="flex flex-col border rounded-lg bg-green-50 flex-1 overflow-hidden"
              >
                <div className="text-xs text-muted-foreground flex gap-1 bg-white border-b border-gray-200 p-2 justify-between items-center">
                  <div className="flex gap-2">
                    <a
                      href={`https://bsky.app/profile/${did}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <p className="text-xs text-primary font-bold hover:underline">
                        @{aka[0]}
                      </p>
                    </a>
                    {created_at}
                  </div>
                  <div className="flex gap-2">
                    <Popover>
                      <PopoverTrigger disabled={urls.length === 0}>
                        <Badge
                          className={cn(
                            "text-xs",
                            urls.length > 0
                              ? "bg-green-600 text-white"
                              : "bg-white text-black"
                          )}
                          variant="outline"
                        >
                          {urls.length} URL found
                        </Badge>
                      </PopoverTrigger>
                      <PopoverContent>
                        <div className="flex flex-col gap-2">
                          {urls.map((url) => (
                            <a
                              key={url}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary font-bold hover:underline"
                            >
                              {url}
                            </a>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                    <Popover>
                      <PopoverTrigger disabled={tags.length === 0}>
                        <Badge
                          className={cn(
                            "text-xs",
                            tags.length > 0
                              ? "bg-green-600 text-white"
                              : "bg-white text-black"
                          )}
                          variant="outline"
                        >
                          {tags.length} tag found
                        </Badge>
                      </PopoverTrigger>
                      <PopoverContent>
                        <div className="flex flex-col gap-2">
                          {tags.map((tag) => (
                            <Badge key={tag}>{tag}</Badge>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <div className="flex gap-2 justify-between items-stretch">
                  <div>
                    <a
                      href={`https://bsky.app/profile/${did}/post/${rkey}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <p className="text-sm font-semibold hover:underline p-2">
                        {text}
                      </p>
                    </a>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
