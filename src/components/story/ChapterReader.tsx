import Link from "next/link";
import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/20/solid";

import { formatDate } from "@/lib/formatDate";
import type { ChapterListItem, ChapterReading } from "@/lib/story/types";

import ChapterJumpList from "./ChapterJumpList";
import ChapterKeyboardNav from "./ChapterKeyboardNav";

const smallLinkClass =
  "px-4 py-2 inline-flex items-center gap-2 text-sm font-medium text-foreground border border-border rounded-lg transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent group";

const smallDisabledClass =
  "px-4 py-2 inline-flex items-center gap-2 text-sm font-medium text-muted border border-border rounded-lg opacity-50 cursor-not-allowed";

interface ChapterReaderProps {
  story: { slug: string; title: string };
  chapter: ChapterReading;
  chapters: ChapterListItem[];
  previous?: ChapterListItem;
  next?: ChapterListItem;
}

interface NavCardProps {
  href: string;
  label: string;
  chapter: ChapterListItem;
  direction: "previous" | "next";
}

function NavCard({ href, label, chapter, direction }: NavCardProps) {
  const isNext = direction === "next";

  return (
    <Link
      href={href}
      className={`w-full h-full p-5 sm:p-6 flex flex-col gap-2 bg-surface-muted rounded-lg transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent group ${
        isNext
          ? "items-start text-left sm:items-end sm:text-right"
          : "items-start text-left"
      }`}
    >
      <span className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.15em] text-muted">
        {!isNext && (
          <ArrowLeftIcon aria-hidden="true" className="w-3.5 h-3.5" />
        )}
        {label}
        {isNext && (
          <ArrowRightIcon aria-hidden="true" className="w-3.5 h-3.5" />
        )}
      </span>

      <span className="text-xs text-accent">Chapter {chapter.number}</span>

      <span className="line-clamp-2 font-serif text-lg sm:text-xl text-foreground transition-colors duration-200 group-hover:text-accent">
        {chapter.title}
      </span>
    </Link>
  );
}

export default function ChapterReader({
  story,
  chapter,
  chapters,
  previous,
  next,
}: ChapterReaderProps) {
  const date = formatDate(chapter.publishedAt);
  const chapterPath = (number: number) => `/stories/${story.slug}/${number}`;
  const previousHref = previous ? chapterPath(previous.number) : undefined;
  const nextHref = next ? chapterPath(next.number) : undefined;

  return (
    <article className="w-full max-w-3xl px-4 pt-28 pb-16 sm:px-6 sm:pt-32 sm:pb-20 mx-auto flex flex-col gap-10">
      <header className="flex flex-col gap-5">
        <Link
          href={`/stories/${story.slug}`}
          className="w-fit inline-flex items-center gap-1.5 text-sm text-muted rounded-sm transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent group"
        >
          <ArrowLeftIcon
            aria-hidden="true"
            className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1 motion-reduce:transition-none"
          />
          {story.title}
        </Link>

        <p className="text-sm font-medium uppercase tracking-[0.2em] text-accent">
          Chapter {chapter.number}
        </p>

        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl leading-tight text-balance text-foreground">
          {chapter.title}
        </h1>

        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">
          <time dateTime={date.iso}>{date.label}</time>
          <span aria-hidden="true">•</span>
          <span>{chapter.readTime}</span>
        </div>

        <nav
          aria-label="Chapter navigation"
          className="pt-2 flex flex-col gap-3"
        >
          <div className="flex items-center justify-between gap-3">
            {previousHref ? (
              <Link href={previousHref} className={smallLinkClass}>
                <ArrowLeftIcon
                  aria-hidden="true"
                  className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1 motion-reduce:transition-none"
                />
                Previous
              </Link>
            ) : (
              <span aria-disabled="true" className={smallDisabledClass}>
                <ArrowLeftIcon aria-hidden="true" className="w-4 h-4" />
                Previous
              </span>
            )}

            {nextHref ? (
              <Link href={nextHref} className={smallLinkClass}>
                Next
                <ArrowRightIcon
                  aria-hidden="true"
                  className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none"
                />
              </Link>
            ) : (
              <span aria-disabled="true" className={smallDisabledClass}>
                Next
                <ArrowRightIcon aria-hidden="true" className="w-4 h-4" />
              </span>
            )}
          </div>

          <ChapterJumpList
            storySlug={story.slug}
            chapters={chapters}
            currentNumber={chapter.number}
          />
        </nav>
      </header>

      <div className="pt-10 flex flex-col gap-6 border-t border-border">
        {chapter.paragraphs.map((paragraph, index) => (
          <p
            key={`${chapter.id}-p-${index}`}
            className="font-serif text-lg sm:text-xl leading-8 sm:leading-9 whitespace-pre-line text-pretty text-foreground/90"
          >
            {paragraph}
          </p>
        ))}
      </div>

      <nav
        aria-label="Continue reading"
        className="pt-8 flex flex-col gap-6 border-t border-border"
      >
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
          {previous ? (
            <NavCard
              href={chapterPath(previous.number)}
              label="Previous"
              chapter={previous}
              direction="previous"
            />
          ) : (
            <div aria-hidden="true" className="hidden sm:block" />
          )}

          {next ? (
            <NavCard
              href={chapterPath(next.number)}
              label="Next"
              chapter={next}
              direction="next"
            />
          ) : (
            <div className="w-full p-5 sm:p-6 flex flex-col items-start sm:items-end gap-2 text-left sm:text-right bg-surface-muted rounded-lg">
              <span className="text-xs font-medium uppercase tracking-[0.15em] text-muted">
                You&apos;re all caught up
              </span>
              <span className="font-serif text-lg text-foreground">
                The next chapter is on its way.
              </span>
            </div>
          )}
        </div>

        <p className="hidden lg:block text-center text-xs text-muted">
          Tip: use the left and right arrow keys to move between chapters.
        </p>
      </nav>

      <ChapterKeyboardNav previousHref={previousHref} nextHref={nextHref} />
    </article>
  );
}
