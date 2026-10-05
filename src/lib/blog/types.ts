import type { BlogSection } from "@/lib/db/types";

export type { BlogSection };

/* Everything a card or list needs */
export interface BlogSummary {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  tags: string[];
  image: string;
  publishedAt: string;
  readTime: string;
  author: string;
}

/* The full post for the blog page */
export interface Blog extends BlogSummary {
  content: BlogSection[];
  authorBio: string;
  authorAvatarUrl: string | null;
}