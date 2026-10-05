import Link from "next/link";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  PlusIcon,
} from "@heroicons/react/20/solid";
import { EyeIcon, PencilSquareIcon } from "@heroicons/react/24/outline";

import StatusBadge from "@/components/admin/ui/StatusBadge";
import { getStatusDateLabel } from "@/lib/admin/dates";
import { pluralize } from "@/lib/admin/format";
import { moveChapterAction } from "@/lib/admin/stories/chapterActions";
import { cardClass, iconButtonClass, smallButtonClass } from "@/lib/admin/ui";
import { getDisplayStatus } from "@/lib/content/status";
import type { AdminChapterItem } from "@/lib/db/stories";

const numberFormat = new Intl.NumberFormat("en-US");

interface ChapterListProps {
  storyId: string;
  chapters: AdminChapterItem[];
}

export default function ChapterList({ storyId, chapters }: ChapterListProps) {
  const now = new Date();
  const basePath = `/admin/stories/${storyId}/chapters`;
  const liveCount = chapters.filter(
    (chapter) =>
      getDisplayStatus(chapter.status, chapter.published_at, now) ===
      "published",
  ).length;

  return (
    <section aria-labelledby="chapters-heading" className={cardClass}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2
            id="chapters-heading"
            className="text-lg font-semibold text-foreground"
          >
            Chapters
          </h2>

          <p className="text-sm text-muted">
            {pluralize(chapters.length, "chapter")}, {liveCount} live
          </p>
        </div>

        <Link href={`${basePath}/new`} className={smallButtonClass.primary}>
          <PlusIcon aria-hidden="true" className="w-4 h-4" />
          New chapter
        </Link>
      </div>

      {chapters.length === 0 ? (
        <p className="px-4 py-10 text-center text-sm text-muted bg-background border border-dashed border-border rounded-lg">
          No chapters yet. Start with chapter one.
        </p>
      ) : (
        <ol className="bg-background border border-border rounded-lg divide-y divide-border overflow-hidden">
          {chapters.map((chapter, index) => {
            const status = getDisplayStatus(
              chapter.status,
              chapter.published_at,
              now,
            );
            const label = `chapter ${chapter.number}`;

            return (
              <li
                key={chapter.id}
                className="p-3 sm:px-4 flex flex-col md:flex-row md:items-center gap-3"
              >
                <div className="min-w-0 flex flex-1 items-center gap-3">
                  <span className="w-10 h-10 shrink-0 flex items-center justify-center text-sm font-semibold text-accent bg-surface-muted rounded-lg">
                    {chapter.number}
                  </span>

                  <div className="min-w-0 flex flex-col gap-1.5">
                    <Link
                      href={`${basePath}/${chapter.id}`}
                      className="line-clamp-1 text-sm font-medium text-foreground rounded-sm transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    >
                      {chapter.title}
                    </Link>

                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
                      <StatusBadge status={status} />
                      <span>
                        {getStatusDateLabel(
                          status,
                          chapter.published_at,
                          chapter.updated_at,
                        )}
                      </span>
                      <span aria-hidden="true">•</span>
                      <span>{pluralize(chapter.word_count, "word")}</span>
                      <span aria-hidden="true">•</span>
                      <span className="inline-flex items-center gap-1">
                        <EyeIcon aria-hidden="true" className="w-3.5 h-3.5" />
                        {numberFormat.format(chapter.view_count)}
                        <span className="sr-only">views</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1.5">
                  <form
                    action={moveChapterAction.bind(
                      null,
                      storyId,
                      chapter.id,
                      "up",
                    )}
                  >
                    <button
                      type="submit"
                      disabled={index === 0}
                      aria-label={`Move ${label} up`}
                      className={iconButtonClass}
                    >
                      <ArrowUpIcon aria-hidden="true" className="w-4 h-4" />
                    </button>
                  </form>

                  <form
                    action={moveChapterAction.bind(
                      null,
                      storyId,
                      chapter.id,
                      "down",
                    )}
                  >
                    <button
                      type="submit"
                      disabled={index === chapters.length - 1}
                      aria-label={`Move ${label} down`}
                      className={iconButtonClass}
                    >
                      <ArrowDownIcon aria-hidden="true" className="w-4 h-4" />
                    </button>
                  </form>

                  <Link
                    href={`${basePath}/${chapter.id}`}
                    className={smallButtonClass.secondary}
                  >
                    <PencilSquareIcon aria-hidden="true" className="w-4 h-4" />
                    Edit
                  </Link>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
