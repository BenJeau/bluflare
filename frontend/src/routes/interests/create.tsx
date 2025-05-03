import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Pickaxe, Plus, X, Sparkles } from "lucide-react";
import { useState, FormEvent, ChangeEvent } from "react";
import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateInterest } from "@/api/interests";
import { useMutationSuggestKeywords } from "@/api/suggest";
import { useTranslation } from "@/i18n";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/interests/create")({
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useTranslation();
  const createInterest = useCreateInterest();
  const { mutateAsync: suggestKeywords, isPending: isSuggesting } =
    useMutationSuggestKeywords();
  const [newSubject, setNewSubject] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newKeywords, setNewKeywords] = useState<string[]>([]);
  const [currentKeyword, setCurrentKeyword] = useState("");
  const navigate = useNavigate();

  const handleCreateInterest = async (e: FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim() || newKeywords.length === 0) return;

    try {
      const id = await createInterest.mutateAsync({
        subject: newSubject.trim(),
        description: newDescription.trim(),
        keywords: newKeywords,
      });
      navigate({ to: "/interests/$id", params: { id: id.toString() } });
    } catch (error) {
      console.error("Failed to create interest:", error);
    }
  };

  const handleAddKeyword = () => {
    if (!currentKeyword.trim()) return;
    if (newKeywords.includes(currentKeyword.trim())) {
      setCurrentKeyword("");
      return;
    }
    setNewKeywords([...newKeywords, currentKeyword.trim()]);
    setCurrentKeyword("");
  };

  const handleRemoveKeyword = (index: number) => {
    setNewKeywords(newKeywords.filter((_, i) => i !== index));
  };

  const handleSuggestKeywords = async () => {
    try {
      const suggestedKeywords = await suggestKeywords({
        subject: newSubject,
        description: newDescription,
      });
      // Add only unique keywords that aren't already in the list
      const uniqueKeywords = suggestedKeywords.filter(
        (keyword: string) => !newKeywords.includes(keyword)
      );
      setNewKeywords([...newKeywords, ...uniqueKeywords]);
    } catch (error) {
      toast.error("Failed to suggest keywords");
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link to="/interests">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex flex-col">
          <p className="text-3xl font-bold">Create an interest</p>
          <p className="text-sm italic">
            Start tracking messages related to it and get notified when new ones
            are posted. Start digging into the latest trends and insights.
          </p>
        </div>
      </div>

      <form onSubmit={handleCreateInterest} className="flex flex-col gap-4">
        <div className="flex gap-2 flex-col">
          <p className="text-sm font-medium">Subject</p>
          <Input
            type="text"
            placeholder="Main topic for the interest, e.g. 'AI'"
            value={newSubject}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setNewSubject(e.target.value)
            }
          />
        </div>

        <div className="flex gap-2 flex-col">
          <p className="text-sm font-medium">Description</p>
          <Textarea
            placeholder="Description of the interest, e.g. 'AI is the future of the world and the future of the world is AI 🤯'"
            value={newDescription}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
              setNewDescription(e.target.value)
            }
          />
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">Keywords</p>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Specific keywords used for filtering messages, e.g. 'AI', 'Machine Learning'"
              value={currentKeyword}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setCurrentKeyword(e.target.value)
              }
            />
            <Button
              onClick={handleAddKeyword}
              disabled={!currentKeyword.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              onClick={handleSuggestKeywords}
              variant="outline"
              className={cn(
                "relative overflow-hidden",
                isSuggesting &&
                  "bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 animate-gradient"
              )}
              disabled={isSuggesting}
            >
              <div className="relative flex items-center">
                <Sparkles className="h-4 w-4 mr-1" />
                {isSuggesting ? "Suggesting..." : "Suggest AI Keywords"}
              </div>
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {newKeywords.map((keyword, index) => (
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

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={!newSubject.trim() || newKeywords.length === 0}
          >
            <Pickaxe className="h-4 w-4" />
            {t("interests.add")}
          </Button>
        </div>
      </form>

      {isSuggesting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Multiple gradient layers for more intense effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 animate-gradient opacity-50" />
          <div
            className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 animate-gradient opacity-50"
            style={{ animationDelay: "0.5s" }}
          />
          <div
            className="absolute inset-0 bg-gradient-to-tr from-pink-500 via-blue-500 to-purple-500 animate-gradient opacity-50"
            style={{ animationDelay: "1s" }}
          />

          {/* Enhanced backdrop blur */}
          <div className="absolute inset-0 bg-black/20 backdrop-blur-md" />

          {/* Main content with enhanced effects */}
          <div className="relative flex flex-col items-center gap-6 p-10 rounded-lg bg-white/80 shadow-2xl backdrop-blur-sm border border-white/20">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Sparkles className="h-8 w-8 text-purple-500 animate-pulse" />
                <div className="absolute inset-0 bg-purple-500/20 rounded-full animate-ping" />
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 bg-clip-text text-transparent animate-gradient">
                AI is thinking...
              </h3>
            </div>

            {/* Enhanced progress bar */}
            <div className="w-72 h-3 bg-gray-200/50 rounded-full overflow-hidden backdrop-blur-sm">
              <div
                className="w-full h-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 animate-gradient"
                style={{ animationDuration: "1s" }}
              />
            </div>

            {/* Floating particles */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 rounded-full bg-white/30 animate-float"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: `${3 + Math.random() * 2}s`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
