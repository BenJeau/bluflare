import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Pickaxe, Plus, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useState, FormEvent, ChangeEvent } from "react";
import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateInterest } from "@/api/interests";
import { useTranslation } from "@/i18n";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/interests/create")({
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const createInterest = useCreateInterest();
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
    </div>
  );
}
