import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { Post } from "@/api/posts";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getTagColor = (count: number, max: number) => {
  const ratio = (max - count) / max;
  const red = Math.min(255, Math.max(0, Math.floor(255 * ratio) + 50));

  return `#000000${red.toString(16).padStart(2, "0")}`;
};

export const highlightKeywords = (text: string, keywords: string[]) => {
  if (!keywords.length) return text;

  const pattern = keywords
    .map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|");

  const regex = new RegExp(`(${pattern})`, "gi");
  const parts = text.split(regex);

  return parts.map((part, i) => {
    if (i % 2 === 1) {
      return (
        <span key={i} className="bg-green-300 dark:text-green-950">
          {part}
        </span>
      );
    }
    return part;
  });
};

export const countOccurrences = (
  posts: Post[],
  field: "urls" | "tags" | "langs",
): Record<string, number> => {
  return posts.reduce(
    (acc, post) => {
      post[field].forEach((item) => {
        acc[item] = (acc[item] || 0) + 1;
      });
      return acc;
    },
    {} as Record<string, number>,
  );
};
