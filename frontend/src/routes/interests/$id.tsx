import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Trash2,
  ChevronDown,
  ChevronUp,
  Edit2,
  Plus,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n";
import config from "@/lib/config";
import {
  Interest,
  useDeleteInterest,
  useInterestLangs,
  useInterestTags,
  useInterestUrls,
  useInterestWords,
  useMutateInterestKeywords,
} from "@/api/interests";
import { Badge } from "@/components/ui/badge";
import { usePosts } from "@/api/posts";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState, ChangeEvent } from "react";
import { Input } from "@/components/ui/input";
import { queryClient } from "@/api/query-client";

// Add this function before the InterestDetail component
const getTagColor = (count: number, max: number) => {
  const ratio = (max - count) / max;
  const red = Math.min(255, Math.max(0, Math.floor(255 * ratio) + 50));

  return `#000000${red.toString(16).padStart(2, "0")}`;
};

const highlightKeywords = (text: string, keywords: string[]) => {
  if (!keywords.length) return text;

  // Escape special regex characters and create case-insensitive pattern
  const pattern = keywords
    .map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|");

  const regex = new RegExp(`(${pattern})`, "gi");
  const parts = text.split(regex);

  return parts.map((part, i) => {
    if (i % 2 === 1) {
      // This part matched a keyword
      return (
        <span key={i} className="bg-yellow-200">
          {part}
        </span>
      );
    }
    return part;
  });
};

export const Route = createFileRoute("/interests/$id")({
  component: InterestDetail,
});

interface Post {
  text: string;
  created_at: string;
  urls: string[];
  did: string;
  cid: string;
  rkey: string;
  langs: string[];
  tags: string[];
  aka: string[];
}

function InterestDetail() {
  const { id } = Route.useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
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
  const { data: words } = useInterestWords(Number(id));
  const { data: langs } = useInterestLangs(Number(id));

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
      <KeywordsSection interest={interest} />
      <StatsSection data={langs || {}} title="Languages" />
      <StatsSection data={urls || {}} title="URLs" />
      <StatsSection data={tags || {}} title="Tags" />
      <StatsSection data={words || {}} title="Words" />
      <div className="rounded-lg border p-4 flex gap-2 flex-col bg-white">
        <p className="text-sm font-semibold">
          Posts{" "}
          <span className="text-xs text-muted-foreground">
            ({posts?.length})
          </span>
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {posts?.map(
            ({
              text,
              created_at,
              urls,
              did,
              cid,
              rkey,
              langs,
              tags,
              aka,
            }: Post) => (
              <div
                key={text}
                className="flex flex-col border rounded-lg bg-green-50 flex-1 overflow-hidden"
              >
                <div className="text-xs text-muted-foreground flex gap-1 bg-white border-b border-gray-200 p-2 justify-between items-center">
                  <div className="flex flex-col">
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
                          {urls.length} URLs
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
                          {tags.length} tags
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
                        {highlightKeywords(text, interest.keywords)}
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

const KeywordsSection = ({ interest }: { interest: Interest }) => {
  const [isEditingKeywords, setIsEditingKeywords] = useState(false);
  const [currentKeyword, setCurrentKeyword] = useState("");
  const [editedKeywords, setEditedKeywords] = useState<string[]>([]);
  const { mutateAsync: updateInterestKeywords } = useMutateInterestKeywords(
    Number(interest.id)
  );

  const handleStartEditing = () => {
    setEditedKeywords([...interest.keywords]);
    setIsEditingKeywords(true);
  };

  const handleCancelEditing = () => {
    setIsEditingKeywords(false);
    setCurrentKeyword("");
    setEditedKeywords([]);
  };

  const handleSaveKeywords = async () => {
    try {
      await updateInterestKeywords(editedKeywords);
      toast.success("Keywords updated successfully");
      setIsEditingKeywords(false);
      queryClient.invalidateQueries({ queryKey: ["interests", interest.id] });
    } catch (error) {
      toast.error("Failed to update keywords");
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
  return (
    <div className="rounded-lg border p-4 flex gap-2 flex-col bg-white">
      <div className="flex justify-between items-center">
        <p className="text-sm font-semibold">
          Keywords{" "}
          <span className="text-xs text-muted-foreground">
            ({interest.keywords.length})
          </span>
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
              Cancel
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleSaveKeywords}
              className="h-6"
            >
              Save
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
          </div>
          <div className="flex flex-wrap gap-1">
            {editedKeywords.map((keyword, index) => (
              <div
                key={index}
                className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-sm"
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
          {interest.keywords.map((keyword: string) => (
            <Badge key={keyword}>{keyword}</Badge>
          ))}
        </div>
      )}
    </div>
  );
};

type StatsSectionProps = {
  data: Record<string, number>;
  title: string;
};

const StatsSection = ({ data, title }: StatsSectionProps) => {
  const [showAll, setShowAll] = useState(false);

  return (
    <div className="rounded-lg border p-4 flex gap-2 flex-col bg-white">
      <div className="flex justify-between items-center">
        <p className="text-sm font-semibold">
          {title}{" "}
          <span className="text-xs text-muted-foreground">
            ({(data && Object.keys(data).length) ?? 0} unique{" "}
            {title.toLocaleLowerCase()})
          </span>
        </p>

        {data && Object.keys(data).length > 20 && (
          <Button
            variant="secondary"
            className="h-6 px-2 py-1"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? (
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
          {data &&
            Object.entries(data)
              .sort((a, b) => b[1] - a[1])
              .slice(0, showAll ? undefined : 20)
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
                        : "text-white"
                    )}
                  >
                    {word} <span className="text-xs font-bold">{count}</span>
                  </Badge>
                );
              })}
        </div>
      </div>
    </div>
  );
};
