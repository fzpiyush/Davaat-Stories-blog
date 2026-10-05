import type { StoryProgress } from "@/lib/db/types";

/* Everything a card or list needs */
export interface StorySummary {
  id: string;
  slug: string;
  title: string;
  blurb: string;
  category: string;
  tags: string[];
  cover: string;
  progress: StoryProgress;
  chapterCount: number;
  publishedAt: string;
  updatedAt: string;
}

/* The story page */
export interface StoryDetail extends StorySummary {
  author: string;
  authorBio: string;
  authorAvatarUrl: string | null;
  wordCount: number;
}

export interface ChapterListItem {
  id: string;
  number: number;
  title: string;
  publishedAt: string;
  wordCount: number;
}

export interface ChapterReading extends ChapterListItem {
  paragraphs: string[];
  readTime: string;
}
