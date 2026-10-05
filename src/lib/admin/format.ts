import { ADMIN_TIME_ZONE } from "@/lib/admin/datetime";

const dateFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: ADMIN_TIME_ZONE,
});

const dateTimeFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZone: ADMIN_TIME_ZONE,
});

export function formatAdminDate(date: Date): string {
  return dateFormat.format(date);
}

export function formatAdminDateTime(date: Date): string {
  return dateTimeFormat.format(date);
}

export function pluralize(
  count: number,
  singular: string,
  plural = `${singular}s`,
): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function formatUsage(blogCount: number, storyCount: number): string {
  const parts = [
    blogCount > 0 ? pluralize(blogCount, "blog") : null,
    storyCount > 0 ? pluralize(storyCount, "story", "stories") : null,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(" and ") : "Not used yet";
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
