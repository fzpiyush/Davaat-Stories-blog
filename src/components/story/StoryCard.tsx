import Image from "next/image";
import Link from "next/link";

import { pluralize } from "@/lib/admin/format";
import { PROGRESS_LABEL } from "@/lib/content/story";
import { formatDate } from "@/lib/formatDate";
import type { StorySummary } from "@/lib/story/types";

type HeadingLevel = "h2" | "h3";

interface StoryCardProps {
  story: StorySummary;
  priority?: boolean;
  headingLevel?: HeadingLevel;
}

export default function StoryCard({
  story,
  priority = false,
  headingLevel = "h2",
}: StoryCardProps) {
  const updated = formatDate(story.updatedAt);
  const Heading = headingLevel;

  return (
    <article className="w-full h-full flex flex-col bg-surface shadow-sm rounded-lg relative overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-accent has-[a:focus-visible]:ring-offset-2 motion-reduce:transition-none motion-reduce:hover:translate-y-0 group">
      <div className="w-full aspect-3/4 bg-surface-muted relative overflow-hidden">
        <Image
          src={story.cover}
          alt=""
          fill
          priority={priority}
          sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />

        <span className="px-2.5 py-1 text-xs font-medium text-foreground bg-background/90 backdrop-blur-sm rounded-full absolute top-3 left-3">
          {PROGRESS_LABEL[story.progress]}
        </span>
      </div>

      <div className="p-4 sm:p-5 flex flex-1 flex-col gap-2">
        <span className="text-xs font-medium uppercase tracking-[0.15em] text-accent">
          {story.category}
        </span>

        <Heading className="line-clamp-2 font-serif text-lg sm:text-xl leading-tight text-foreground transition-colors duration-200 group-hover:text-accent">
          <Link
            href={`/stories/${story.slug}`}
            className="focus-visible:outline-none after:absolute after:inset-0 after:content-['']"
          >
            {story.title}
          </Link>
        </Heading>

        <p className="line-clamp-2 text-sm leading-6 text-muted">
          {story.blurb}
        </p>

        <div className="mt-auto pt-3 flex items-center gap-2 text-xs text-muted">
          <span>{pluralize(story.chapterCount, "chapter")}</span>
          <span aria-hidden="true">•</span>
          <span>
            Updated <time dateTime={updated.iso}>{updated.label}</time>
          </span>
        </div>
      </div>
    </article>
  );
}
