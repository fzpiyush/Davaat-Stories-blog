import type { ContentStatus } from "@/lib/db/types";

export type DisplayStatus = "draft" | "scheduled" | "published";

export const STATUS_FILTERS = [
  "all",
  "published",
  "scheduled",
  "draft",
] as const;
export type StatusFilter = (typeof STATUS_FILTERS)[number];

export const STATUS_LABEL: Record<DisplayStatus, string> = {
  draft: "Draft",
  scheduled: "Scheduled",
  published: "Published",
};

export const STATUS_FILTER_LABEL: Record<StatusFilter, string> = {
  all: "All",
  published: "Published",
  scheduled: "Scheduled",
  draft: "Drafts",
};

/*
 * What readers actually see. A scheduled post whose time
 * has passed counts as published.
 */
export function getDisplayStatus(
  status: ContentStatus,
  publishedAt: Date | null,
  now: Date = new Date(),
): DisplayStatus {
  if (status === "draft" || !publishedAt) {
    return "draft";
  }

  return publishedAt.getTime() > now.getTime() ? "scheduled" : "published";
}

export function parseStatusFilter(value: string): StatusFilter {
  return (STATUS_FILTERS as readonly string[]).includes(value)
    ? (value as StatusFilter)
    : "all";
}
