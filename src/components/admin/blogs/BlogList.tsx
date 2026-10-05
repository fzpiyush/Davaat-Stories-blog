import Image from "next/image";
import Link from "next/link";
import { StarIcon } from "@heroicons/react/20/solid";
import {
  ArrowTopRightOnSquareIcon,
  ChatBubbleLeftIcon,
  EyeIcon,
  HeartIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";

import StatusBadge from "@/components/admin/ui/StatusBadge";
import { formatAdminDate, formatAdminDateTime } from "@/lib/admin/format";
import { smallButtonClass } from "@/lib/admin/ui";
import { getDisplayStatus, type DisplayStatus } from "@/lib/content/status";
import type { AdminBlogListItem } from "@/lib/db/blogs";

const numberFormat = new Intl.NumberFormat("en-US");

function getDateLabel(blog: AdminBlogListItem, status: DisplayStatus): string {
  if (status === "scheduled" && blog.published_at) {
    return `Goes live ${formatAdminDateTime(blog.published_at)}`;
  }

  if (status === "published" && blog.published_at) {
    return `Published ${formatAdminDate(blog.published_at)}`;
  }

  return `Edited ${formatAdminDate(blog.updated_at)}`;
}

interface BlogListProps {
  items: AdminBlogListItem[];
}

export default function BlogList({ items }: BlogListProps) {
  const now = new Date();

  return (
    <ul
      role="list"
      className="w-full bg-surface border border-border rounded-xl divide-y divide-border overflow-hidden"
    >
      {items.map((blog) => {
        const status = getDisplayStatus(blog.status, blog.published_at, now);
        const stats = [
          { label: "Views", value: blog.view_count, Icon: EyeIcon },
          { label: "Likes", value: blog.like_count, Icon: HeartIcon },
          {
            label: "Comments",
            value: blog.comment_count,
            Icon: ChatBubbleLeftIcon,
          },
        ];

        return (
          <li
            key={blog.id}
            className="p-4 sm:px-5 flex flex-col lg:flex-row lg:items-center gap-4"
          >
            <div className="min-w-0 flex flex-1 items-start gap-4">
              <div className="w-24 h-16 shrink-0 bg-surface-muted rounded-md relative overflow-hidden">
                {blog.cover_url && (
                  <Image
                    src={blog.cover_url}
                    alt=""
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                )}
              </div>

              <div className="min-w-0 flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/admin/blogs/${blog.id}`}
                    className="line-clamp-2 font-medium text-foreground rounded-sm transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    {blog.title}
                  </Link>

                  {blog.is_featured && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-accent">
                      <StarIcon aria-hidden="true" className="w-3.5 h-3.5" />
                      Featured
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
                  <StatusBadge status={status} />
                  {blog.category_name && <span>{blog.category_name}</span>}
                  <span aria-hidden="true">•</span>
                  <span>{getDateLabel(blog, status)}</span>
                  <span aria-hidden="true">•</span>
                  <span>{blog.read_time_minutes} min read</span>
                </div>
              </div>
            </div>

            <dl className="flex shrink-0 items-center gap-4 text-xs text-muted">
              {stats.map(({ label, value, Icon }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <dt>
                    <Icon aria-hidden="true" className="w-4 h-4" />
                    <span className="sr-only">{label}</span>
                  </dt>
                  <dd>{numberFormat.format(value)}</dd>
                </div>
              ))}
            </dl>

            <div className="flex shrink-0 items-center gap-2">
              <Link
                href={`/admin/blogs/${blog.id}`}
                className={smallButtonClass.secondary}
              >
                <PencilSquareIcon aria-hidden="true" className="w-4 h-4" />
                Edit
              </Link>

              {status === "published" && (
                <Link
                  href={`/blogs/${blog.slug}`}
                  target="_blank"
                  className={smallButtonClass.secondary}
                >
                  <ArrowTopRightOnSquareIcon
                    aria-hidden="true"
                    className="w-4 h-4"
                  />
                  View
                  <span className="sr-only">, opens in a new tab</span>
                </Link>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
