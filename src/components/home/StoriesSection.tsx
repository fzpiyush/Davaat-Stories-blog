import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/20/solid";

import StoryCard from "@/components/story/StoryCard";
import { pluralize } from "@/lib/admin/format";
import { PROGRESS_LABEL } from "@/lib/content/story";
import { getFeaturedStory, getLatestStories } from "@/lib/story/queries";
import type { StorySummary } from "@/lib/story/types";

const LATEST_LIMIT = 3;

function FeaturedStoryCard({ story }: { story: StorySummary }) {
  return (
    <article className="w-full grid sm:grid-cols-[200px_minmax(0,1fr)] md:grid-cols-[260px_minmax(0,1fr)] bg-surface shadow-sm rounded-lg relative overflow-hidden transition-shadow duration-300 hover:shadow-md has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-accent has-[a:focus-visible]:ring-offset-2 group">
      <div className="w-full aspect-3/4 bg-surface-muted relative overflow-hidden">
        <Image
          src={story.cover}
          alt=""
          fill
          sizes="(min-width: 768px) 260px, (min-width: 640px) 200px, 100vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
      </div>

      <div className="p-6 sm:p-8 lg:p-10 flex flex-col justify-center gap-4">
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

        <h3 className="font-serif text-3xl sm:text-4xl leading-tight text-balance text-foreground transition-colors duration-200 group-hover:text-accent">
          <Link
            href={`/stories/${story.slug}`}
            className="focus-visible:outline-none after:absolute after:inset-0 after:content-['']"
          >
            {story.title}
          </Link>
        </h3>

        <p className="max-w-xl line-clamp-4 text-base leading-7 text-pretty text-muted">
          {story.blurb}
        </p>

        <div className="pt-2 flex items-center justify-between gap-4">
          <span className="text-sm text-muted">
            {story.category} • {pluralize(story.chapterCount, "chapter")}
          </span>

          <span
            aria-hidden="true"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-accent"
          >
            Start reading
            <ArrowRightIcon className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none" />
          </span>
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
      className="w-full max-w-7xl 2xl:max-w-360 px-4 pb-12 sm:px-6 sm:pb-16 lg:px-8 lg:pb-20 mx-auto flex flex-col gap-8 sm:gap-10"
    >
      <div className="grid gap-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-accent">
            Stories
          </p>

          <h2
            id="stories-heading"
            className="font-serif text-3xl sm:text-4xl lg:text-5xl text-balance text-foreground"
          >
            One chapter at a time
          </h2>
        </div>

        <Link
          href="/stories"
          className="w-fit inline-flex items-center gap-1.5 text-sm font-medium text-accent transition-opacity hover:opacity-70 group"
        >
          View all stories
          <ArrowRightIcon
            aria-hidden="true"
            className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none"
          />
        </Link>
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
