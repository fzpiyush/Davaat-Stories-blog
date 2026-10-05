import type { Metadata } from "next";
import { notFound } from "next/navigation";

import BlogEmptyState from "@/components/blog/BlogEmptyState";
import PublicPagination from "@/components/public/PublicPagination";
import StoryCard from "@/components/story/StoryCard";
import { parsePage } from "@/lib/admin/params";
import { SITE_NAME } from "@/lib/site";
import { getStoriesPage, STORIES_PER_PAGE } from "@/lib/story/queries";

const PRIORITY_COUNT = 4;

export const metadata: Metadata = {
  title: `Stories | ${SITE_NAME}`,
  description: "Serialized stories, released one chapter at a time.",
};

interface StoriesPageProps {
  searchParams: Promise<{ page?: string | string[] }>;
}

export default async function StoriesPage({ searchParams }: StoriesPageProps) {
  const { page: pageParam } = await searchParams;
  const page = parsePage(pageParam);
  const { items, total } = await getStoriesPage(page);
  const totalPages = Math.max(1, Math.ceil(total / STORIES_PER_PAGE));

  if (total > 0 && page > totalPages) {
    notFound();
  }

  return (
    <section
      aria-labelledby="stories-heading"
      className="w-full max-w-7xl 2xl:max-w-360 min-h-screen px-4 pt-28 pb-16 sm:px-6 sm:pt-32 sm:pb-20 lg:px-8 lg:pt-36 lg:pb-24 mx-auto flex flex-col gap-12 sm:gap-16"
    >
      <header className="max-w-3xl pb-10 sm:pb-12 flex flex-col gap-5 border-b border-border">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-accent">
          Stories
        </p>

        <h1
          id="stories-heading"
          className="font-serif text-4xl sm:text-5xl lg:text-6xl leading-[1.05] tracking-tight text-balance text-foreground"
        >
          Stories, told one chapter at a time.
        </h1>

        <p className="max-w-2xl text-base sm:text-lg leading-7 sm:leading-8 text-pretty text-muted">
          Settle in, pick a story, and follow along as new chapters arrive.
        </p>

        <p className="text-sm font-medium text-muted">
          {total} {total === 1 ? "story" : "stories"}
        </p>
      </header>

      {items.length > 0 ? (
        <ul
          role="list"
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8 xl:grid-cols-4"
        >
          {items.map((story, index) => (
            <li key={story.id} className="flex *:w-full">
              <StoryCard
                story={story}
                priority={page === 1 && index < PRIORITY_COUNT}
              />
            </li>
          ))}
        </ul>
      ) : (
        <BlogEmptyState
          eyebrow="Stories"
          title="No stories yet."
          description="The first story is being written. Subscribe on the home page to hear when it's out."
        />
      )}

      <PublicPagination
        page={page}
        totalPages={totalPages}
        basePath="/stories"
      />
    </section>
  );
}
