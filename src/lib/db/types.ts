export type UserRole = "admin" | "reader";
export type ContentStatus = "draft" | "published" | "scheduled";
export type StoryProgress = "ongoing" | "completed" | "hiatus";
export type SubscriberStatus = "subscribed" | "unsubscribed";

export interface BlogSection {
  heading?: string;
  paragraphs: string[];
  quote?: string;
}

interface Timestamps {
  created_at: Date;
  updated_at: Date;
}

export interface UserRow extends Timestamps {
  id: string;
  google_id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  role: UserRole;
  is_blocked: boolean;
  blocked_at: Date | null;
  last_login_at: Date | null;
}

export interface SessionRow {
  id: string;
  user_id: string;
  expires_at: Date;
  created_at: Date;
}

export interface MediaRow {
  id: string;
  storage_path: string | null;
  url: string;
  alt_text: string;
  original_name: string | null;
  mime_type: string | null;
  size_bytes: number | null;
  original_size_bytes: number | null;
  width: number | null;
  height: number | null;
  uploaded_by: string | null;
  created_at: Date;
}

export interface AuthorRow extends Timestamps {
  id: string;
  name: string;
  slug: string;
  bio: string;
  avatar_media_id: string | null;
  website_url: string | null;
  instagram_url: string | null;
  x_url: string | null;
  linkedin_url: string | null;
}

export interface CategoryRow extends Timestamps {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export interface TagRow extends Timestamps {
  id: string;
  name: string;
  slug: string;
}

export interface BlogRow extends Timestamps {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: BlogSection[];
  cover_media_id: string | null;
  category_id: string | null;
  author_id: string | null;
  status: ContentStatus;
  published_at: Date | null;
  is_featured: boolean;
  read_time_minutes: number;
  created_by: string | null;
}

export interface BlogTagRow {
  blog_id: string;
  tag_id: string;
}

export interface BlogRecommendationRow {
  blog_id: string;
  recommended_blog_id: string;
  position: number;
}

export interface StoryRow extends Timestamps {
  id: string;
  slug: string;
  title: string;
  blurb: string;
  cover_media_id: string | null;
  category_id: string | null;
  author_id: string | null;
  status: ContentStatus;
  progress: StoryProgress;
  published_at: Date | null;
  is_featured: boolean;
  created_by: string | null;
}

export interface StoryTagRow {
  story_id: string;
  tag_id: string;
}

export interface ChapterRow extends Timestamps {
  id: string;
  story_id: string;
  number: number;
  title: string;
  content: string;
  word_count: number;
  status: ContentStatus;
  published_at: Date | null;
}

export interface CommentRow extends Timestamps {
  id: string;
  blog_id: string | null;
  story_id: string | null;
  parent_id: string | null;
  user_id: string;
  body: string;
  is_hidden: boolean;
  edited_at: Date | null;
}

export interface LikeRow {
  id: string;
  blog_id: string | null;
  story_id: string | null;
  visitor_hash: string;
  created_at: Date;
}

export interface PageViewRow {
  // Postgres bigint comes back as a string
  id: string;
  blog_id: string | null;
  story_id: string | null;
  chapter_id: string | null;
  visitor_hash: string;
  viewed_on: Date;
  created_at: Date;
}

export interface NewsletterSubscriberRow {
  id: string;
  email: string;
  status: SubscriberStatus;
  subscribed_at: Date;
  unsubscribed_at: Date | null;
}