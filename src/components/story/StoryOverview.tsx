import Image from "next/image";
import Link from "next/link";
import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/20/solid";

import { pluralize } from "@/lib/admin/format";
import { PROGRESS_LABEL } from "@/lib/content/story";
import { getReadTimeMinutes } from "@/lib/content/text";
import { formatDate } from "@/lib/formatDate";
import type { ChapterListItem, StoryDetail } from "@/lib/story/types";

interface StoryOverviewProps {
  story: StoryDetail;
  chapters: ChapterListItem[];
}

export default function StoryOverview({ story, chapters }: StoryOverviewProps) {
  const firstChapter = chapters[0];
  const latestChapter = chapters.at(-1);
  const updated = formatDate(story.updatedAt);
  const totalMinutes = getReadTimeMinutes(story.wordCount);
  const chapterPath = (number: number) => `/stories/${story.slug}/${number}`;

  return (
    <article className="w-full max-w-7xl 2xl:max-w-360 px-4 pt-28 pb-16 sm:px-6 sm:pt-32 sm:pb-20 lg:px-8 mx-auto flex flex-col gap-14 sm:gap-16">
      <header className="grid gap-8 md:grid-cols-[minmax(0,280px)_minmax(0,1fr)] md:items-start md:gap-10 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)] lg:gap-14">
        <div className="w-full max-w-xs md:max-w-none aspect-3/4 mx-auto md:mx-0 bg-surface-muted shadow-md rounded-lg relative overflow-hidden">
          <Image
            src={story.cover}
            alt=""
            fill
            priority
            sizes="(min-width: 1024px) 320px, (min-width: 768px) 280px, 320px"
            className="object-cover"
          />
        </div>

        <div className="flex flex-col gap-6">
          <Link
            href="/stories"
            className="w-fit inline-flex items-center gap-1.5 text-sm text-muted rounded-sm transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent group"
          >
            <ArrowLeftIcon
              aria-hidden="true"
              className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1 motion-reduce:transition-none"
            />
            All stories
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1.5 text-xs font-medium text-accent-foreground bg-accent rounded-full">
              {PROGRESS_LABEL[story.progress]}
            </span>
            <span className="px-3 py-1.5 text-xs font-medium text-accent bg-surface-muted rounded-full">
              {story.category}
            </span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl leading-[1.05] tracking-tight text-balance text-foreground">
            {story.title}
          </h1>

          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">
            <span>
              By{" "}
              <span className="font-medium text-foreground">
                {story.author}
              </span>
            </span>
            <span aria-hidden="true">•</span>
            <span>{pluralize(chapters.length, "chapter")}</span>
            {chapters.length > 0 && (
              <>
                <span aria-hidden="true">•</span>
                <span>About {totalMinutes} min of reading</span>
              </>
            )}
            <span aria-hidden="true">•</span>
            <span>
              Updated <time dateTime={updated.iso}>{updated.label}</time>
            </span>
          </div>

          <p className="max-w-2xl text-base sm:text-lg leading-7 sm:leading-8 whitespace-pre-line text-pretty text-muted">
            {story.blurb}
          </p>

          {story.tags.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {story.tags.map((tag) => (
                <li
                  key={tag}
                  className="px-3 py-1.5 text-xs text-muted bg-surface-muted rounded-full"
                >
                  {tag}
                </li>
              ))}
            </ul>
          )}

          {firstChapter ? (
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <Link
                href={chapterPath(firstChapter.number)}
                className="px-6 py-3 inline-flex items-center justify-center gap-2 text-sm font-medium text-accent-foreground bg-accent shadow-sm rounded-lg transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background group"
              >
                Start reading
                <ArrowRightIcon
                  aria-hidden="true"
                  className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none"
                />
              </Link>

              {latestChapter &&
                latestChapter.number !== firstChapter.number && (
                  <Link
                    href={chapterPath(latestChapter.number)}
                    className="px-6 py-3 inline-flex items-center justify-center gap-2 text-sm font-medium text-foreground border border-border rounded-lg transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    Latest, chapter {latestChapter.number}
                  </Link>
                )}
            </div>
          ) : (
            <p className="pt-2 text-sm font-medium text-accent">
              The first chapter is on its way.
            </p>
          )}
        </div>
      </header>

      {chapters.length > 0 && (
        <section
          aria-labelledby="chapters-heading"
          className="flex flex-col gap-6"
        >
          <div className="flex items-baseline justify-between gap-4">
            <h2
              id="chapters-heading"
              className="font-serif text-2xl sm:text-3xl text-foreground"
            >
              Chapters
            </h2>

            <p className="text-sm text-muted">{chapters.length} so far</p>
          </div>

          <ol className="w-full bg-surface shadow-sm rounded-lg divide-y divide-border overflow-hidden">
            {chapters.map((chapter) => {
              const date = formatDate(chapter.publishedAt);

              return (
                <li key={chapter.id}>
                  <Link
                    href={chapterPath(chapter.number)}
                    className="w-full px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4 transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent group"
                  >
                    <span className="min-w-0 flex flex-col gap-1">
                      <span className="text-xs font-medium uppercase tracking-[0.15em] text-accent">
                        Chapter {chapter.number}
                      </span>
                      <span className="line-clamp-1 font-serif text-lg text-foreground transition-colors group-hover:text-accent">
                        {chapter.title}
                      </span>
                    </span>

                    <time
                      dateTime={date.iso}
                      className="shrink-0 text-xs text-muted"
                    >
                      {date.label}
                    </time>
                  </Link>
                </li>
              );
            })}
          </ol>
        </section>
      )}
    </article>
  );
}
