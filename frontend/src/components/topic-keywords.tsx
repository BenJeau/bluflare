import { ChangeEvent, useState } from "react";
import { toast } from "sonner";
import { Tag, Edit2, Plus, Sparkles, X } from "lucide-react";

import { Topic } from "@/api/topics";
import { useTranslation } from "@/i18n";
import { useMutateTopic } from "@/api/topics";
import { useMutationSuggestKeywords } from "@/api/suggest";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Trans } from "@/components";
import { cn } from "@/lib/utils";

type Props = {
  topic: Topic;
};

const TopicKeywords: React.FC<Props> = ({ topic }) => {
  const [isEditingKeywords, setIsEditingKeywords] = useState(false);
  const [currentKeyword, setCurrentKeyword] = useState("");
  const [editedKeywords, setEditedKeywords] = useState<string[]>([]);
  const { mutateAsync: updateTopic } = useMutateTopic(topic.id);
  const { mutateAsync: suggestKeywords, isPending: isSuggesting } =
    useMutationSuggestKeywords();

  const { t } = useTranslation();

  const handleStartEditing = () => {
    setEditedKeywords([...topic.keywords]);
    setIsEditingKeywords(true);
  };

  const handleCancelEditing = () => {
    setIsEditingKeywords(false);
    setCurrentKeyword("");
    setEditedKeywords([]);
  };

  const handleSaveKeywords = async () => {
    try {
      await updateTopic({ keywords: editedKeywords });
      toast.success(t("keywords.updated.success"));
      setIsEditingKeywords(false);
    } catch (error) {
      console.error(error);
      toast.error(t("keywords.updated.error"));
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

  const handleSuggestKeywords = async () => {
    try {
      const suggestedKeywords = await suggestKeywords({
        subject: topic.subject,
        description: topic.description,
      });
      const newKeywords = suggestedKeywords.filter(
        (keyword) => !editedKeywords.includes(keyword),
      );
      setEditedKeywords([...editedKeywords, ...newKeywords]);
      toast.success(t("keywords.suggest.success"));
    } catch (error) {
      console.error(error);
      toast.error(t("keywords.suggest.error"));
    }
  };

  return (
    <div className="bg-background/75 flex flex-col gap-2 rounded-lg border p-4 shadow-xs">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <Tag className="h-4 w-4" /> <Trans id="keywords" />{" "}
          <span className="text-xs opacity-70">({topic.keywords.length})</span>
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
              <Trans id="cancel" />
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleSaveKeywords}
              className="h-6"
            >
              <Trans id="save" />
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
            <Button
              onClick={handleSuggestKeywords}
              variant="outline"
              className={cn(
                "relative h-8 overflow-hidden",
                isSuggesting &&
                  "animate-gradient bg-gradient-to-r from-purple-500 via-pink-500 to-sky-500",
              )}
              disabled={isSuggesting}
            >
              <div className="relative flex items-center">
                <Sparkles className="mr-1 h-3 w-3" />
                <Trans
                  id={isSuggesting ? "suggesting" : "suggest.ai.keywords"}
                />
              </div>
            </Button>
          </div>
          <div className="flex flex-wrap gap-1">
            {editedKeywords.map((keyword, index) => (
              <div
                key={index}
                className="bg-secondary flex items-center gap-1 rounded-full px-3 py-1 text-sm"
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
          {topic.keywords.map((keyword: string) => (
            <Badge key={keyword}>{keyword}</Badge>
          ))}
        </div>
      )}
    </div>
  );
};

export default TopicKeywords;
