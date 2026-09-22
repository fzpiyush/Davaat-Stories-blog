import type { Blog } from "./mockBlogs";
import { blogs } from "./mockBlogs";

function getTime(value: string): number {
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? 0 : time;
}

export function getBlogsByNewest(): Blog[] {
  return [...blogs].sort(
    (a, b) => getTime(b.publishedAt) - getTime(a.publishedAt),
  );
}

/** Returns the post with this slug, or the newest post if none is given */
export function getFeaturedBlog(slug?: string): Blog | undefined {
  const sorted = getBlogsByNewest();

  if (slug) {
    return sorted.find((blog) => blog.slug === slug) ?? sorted[0];
  }

  return sorted[0];
}

export function getLatestBlogs(limit = 3, excludeSlug?: string): Blog[] {
  return getBlogsByNewest()
    .filter((blog) => blog.slug !== excludeSlug)
    .slice(0, limit);
}
