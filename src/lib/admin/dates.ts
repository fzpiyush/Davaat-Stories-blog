import { formatAdminDate, formatAdminDateTime } from "@/lib/admin/format";
import type { DisplayStatus } from "@/lib/content/status";

export function getStatusDateLabel(
  status: DisplayStatus,
  publishedAt: Date | null,
  updatedAt: Date,
): string {
  if (status === "scheduled" && publishedAt) {
    return `Goes live ${formatAdminDateTime(publishedAt)}`;
  }

  if (status === "published" && publishedAt) {
    return `Published ${formatAdminDate(publishedAt)}`;
  }

  return `Edited ${formatAdminDate(updatedAt)}`;
}
