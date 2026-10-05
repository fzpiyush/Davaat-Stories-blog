import Image from "next/image";
import Link from "next/link";
import { StarIcon } from "@heroicons/react/20/solid";
import {
  ChatBubbleLeftIcon,
  EyeIcon,
  HeartIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";

import StatusBadge from "@/components/admin/ui/StatusBadge";
import { getStatusDateLabel } from "@/lib/admin/dates";
import { smallButtonClass } from "@/lib/admin/ui";
import { getDisplayStatus } from "@/lib/content/status";
import { PROGRESS_LABEL } from "@/lib/content/story";
import type { AdminStoryListItem } from "@/lib/db/stories";

const numberFormat = new Intl.NumberFormat("en-US");

interface StoryListProps {
  items: AdminStoryListItem[];
}

export default function StoryList({ items }: StoryListProps) {
  const now = new Date();

  return (
    <ul
      role="list"
      className="w-full bg-surface border border-border rounded-xl divide-y divide-border overflow-hidden"
    >
      {items.map((story) => {
        const status = getDisplayStatus(story.status, story.published_at, now);
        const stats = [
          { label: "Views", value: story.view_count, Icon: EyeIcon },
          { label: "Likes", value: story.like_count, Icon: HeartIcon },
          {
            label: "Comments",
            value: story.comment_count,
            Icon: ChatBubbleLeftIcon,
          },
        ];

        return (
          <li
            key={story.id}
            className="p-4 sm:px-5 flex flex-col lg:flex-row lg:items-center gap-4"
          >
            <div className="min-w-0 flex flex-1 items-start gap-4">
              <div className="w-12 h-16 shrink-0 bg-surface-muted rounded-md relative overflow-hidden">
                {story.cover_url && (
                  <Image
                    src={story.cover_url}
                    alt=""
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                )}
              </div>

              <div className="min-w-0 flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/admin/stories/${story.id}`}
                    className="line-clamp-2 font-medium text-foreground rounded-sm transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    {story.title}
                  </Link>

                  {story.is_featured && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-accent">
                      <StarIcon aria-hidden="true" className="w-3.5 h-3.5" />
                      Featured
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
                  <StatusBadge status={status} />
                  <span className="px-2.5 py-1 bg-surface-muted rounded-full">
                    {PROGRESS_LABEL[story.progress]}
                  </span>
                  {story.category_name && <span>{story.category_name}</span>}
                  <span aria-hidden="true">•</span>
                  <span>
                    {story.live_chapter_count} of {story.chapter_count} chapters
                    live
                  </span>
                  <span aria-hidden="true">•</span>
                  <span>
                    {getStatusDateLabel(
                      status,
                      story.published_at,
                      story.updated_at,
                    )}
                  </span>
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

            <Link
              href={`/admin/stories/${story.id}`}
              className={smallButtonClass.secondary}
            >
              <PencilSquareIcon aria-hidden="true" className="w-4 h-4" />
              Edit
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
