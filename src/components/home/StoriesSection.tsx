import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/20/solid";

import ViewAllLink from "@/components/shared/ViewAllLink";
import ViewCount from "@/components/shared/ViewCount";
import StoryCard from "@/components/story/StoryCard";
import { pluralize } from "@/lib/admin/format";
import { textLang } from "@/lib/content/script";
import { PROGRESS_LABEL } from "@/lib/content/story";
import { cardButtonLargeClass } from "@/lib/publicUi";
import { getFeaturedStory, getLatestStories } from "@/lib/story/queries";
import type { StorySummary } from "@/lib/story/types";

const LATEST_LIMIT = 3;

function FeaturedStoryCard({ story }: { story: StorySummary }) {
  return (
    <article className="w-full grid sm:grid-cols-[200px_minmax(0,1fr)] md:grid-cols-[220px_minmax(0,1fr)] bg-linear-to-br from-surface to-surface-muted shadow-sm rounded-lg relative overflow-hidden transition-shadow duration-300 hover:shadow-md has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-accent has-[a:focus-visible]:ring-offset-2 group">
      <div className="w-full aspect-16/10 sm:aspect-3/4 bg-surface-muted relative overflow-hidden">
        <Image
          src={story.cover}
          alt=""
          fill
          sizes="(min-width: 768px) 220px, (min-width: 640px) 200px, 100vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
      </div>

      <div className="p-5 sm:p-6 lg:p-8 flex flex-col justify-center gap-3 sm:gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Featured story
          </span>
          <span aria-hidden="true" className="text-muted">
            •
          </span>
          <span className="text-xs text-muted">
            {PROGRESS_LABEL[story.progress]}
          </span>
        </div>

        <h3
          lang={textLang(story.title)}
          className="line-clamp-2 font-serif text-2xl sm:text-3xl leading-tight hi:leading-[1.35] text-balance text-foreground transition-colors duration-200 group-hover:text-accent"
        >
          {story.title}
        </h3>

        <p
          lang={textLang(story.blurb)}
          className="max-w-xl line-clamp-3 sm:line-clamp-4 text-sm sm:text-base leading-6 sm:leading-7 hi:sm:leading-8 text-pretty text-muted"
        >
          {story.blurb}
        </p>

        <div className="pt-1 flex items-center justify-between gap-3">
          <div
            lang={textLang(story.category)}
            className="min-w-0 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm text-muted"
          >
            <span>{story.category}</span>
            <span aria-hidden="true">•</span>
            <span>{pluralize(story.chapterCount, "chapter")}</span>
            <ViewCount count={story.viewCount} separated />
          </div>

          <Link
            href={`/stories/${story.slug}`}
            className={cardButtonLargeClass}
          >
            Start reading
            <span className="sr-only"> {story.title}</span>
            <ArrowRightIcon
              aria-hidden="true"
              className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none"
            />
          </Link>
        </div>
      </div>
    </article>
  );
}

export default async function StoriesSection() {
  const featured = await getFeaturedStory();

  if (!featured) {
    return null;
  }

  const latest = await getLatestStories(LATEST_LIMIT, featured.slug);

  return (
    <section
      aria-labelledby="stories-heading"
      className="w-full max-w-7xl 2xl:max-w-360 px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16 mx-auto flex flex-col gap-6 sm:gap-8"
    >
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end sm:gap-6">
        <div className="flex flex-col gap-2 sm:gap-3">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-accent">
            Stories
          </p>

          <h2
            id="stories-heading"
            className="font-serif text-3xl sm:text-4xl leading-tight text-balance text-foreground"
          >
            One chapter at a time
          </h2>
        </div>

        <ViewAllLink href="/stories" label="View all stories" />
      </div>

      <FeaturedStoryCard story={featured} />

      {latest.length > 0 && (
        <ul
          role="list"
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8"
        >
          {latest.map((story) => (
            <li key={story.id} className="flex">
              <StoryCard story={story} headingLevel="h3" />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
