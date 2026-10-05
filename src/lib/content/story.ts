import type { StoryProgress } from "@/lib/db/types";

export const STORY_PROGRESS_OPTIONS: { value: StoryProgress; label: string }[] =
  [
    { value: "ongoing", label: "Ongoing" },
    { value: "completed", label: "Completed" },
    { value: "hiatus", label: "On hiatus" },
  ];

export const PROGRESS_LABEL: Record<StoryProgress, string> = {
  ongoing: "Ongoing",
  completed: "Completed",
  hiatus: "On hiatus",
};

export function formatChapterLabel(number: number, title: string): string {
  return title ? `Chapter ${number}: ${title}` : `Chapter ${number}`;
}
