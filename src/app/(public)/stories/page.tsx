import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import BlogEmptyState from "@/components/blog/BlogEmptyState";
import ListFilters from "@/components/public/ListFilters";
import PageHero from "@/components/public/PageHero";
import PublicPagination from "@/components/public/PublicPagination";
import StoryCard from "@/components/story/StoryCard";
import { parsePage, parseQuery, parseChoice } from "@/lib/admin/params";
import { parseSlug, type SearchParamValue } from "@/lib/content/filters";
import { storiesHeroArt } from "@/lib/content/heroArt";
import { pageBackgroundClass } from "@/lib/content/pageBackground";
import { PROGRESS_LABEL } from "@/lib/content/story";
import type { StoryProgress } from "@/lib/db/types";
import { SITE_NAME } from "@/lib/site";
import {
  getStoriesPage,
  getStoryFilterOptions,
  STORIES_PER_PAGE,
} from "@/lib/story/queries";

const PRIORITY_COUNT = 3;

const PROGRESS_VALUES = Object.keys(PROGRESS_LABEL) as StoryProgress[];

const PROGRESS_OPTIONS = PROGRESS_VALUES.map((value) => ({
  slug: value,
  name: PROGRESS_LABEL[value],
}));

const chipBase =
  "px-3 py-1.5 text-xs font-medium bg-linear-to-br from-surface to-surface-muted border rounded-lg transition-colors duration-200 hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent";

export const metadata: Metadata = {
  title: `Stories | ${SITE_NAME}`,
  description: "Serialized stories, released one chapter at a time.",
};

interface StoriesPageProps {
  searchParams: Promise<{
    page?: SearchParamValue;
    q?: SearchParamValue;
    category?: SearchParamValue;
    tag?: SearchParamValue;
    progress?: SearchParamValue;
  }>;
}

export default async function StoriesPage({ searchParams }: StoriesPageProps) {
  const params = await searchParams;
  const page = parsePage(params.page);
  const query = parseQuery(params.q);
  const category = parseSlug(params.category);
  const tag = parseSlug(params.tag);
  const progress = parseChoice<StoryProgress | "">(
    params.progress,
    PROGRESS_VALUES,
    "",
  );
  const hasFilters = Boolean(query || category || tag || progress);

  const [{ items, total }, options] = await Promise.all([
    getStoriesPage({ page, query, category, tag, progress }),
    getStoryFilterOptions(),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / STORIES_PER_PAGE));

  if (total > 0 && page > totalPages) {
    notFound();
  }

  return (
    <section
      aria-labelledby="stories-heading"
      className={`w-full min-h-screen flex flex-col ${pageBackgroundClass}`}
    >
      <PageHero
        id="stories-heading"
        eyebrow="Stories"
        title="Stories, told one chapter at a time."
        description="Settle in, pick a story, and follow along as new chapters arrive."
        countLabel={`${total} ${total === 1 ? "story" : "stories"}${hasFilters ? " found" : ""}`}
        art={storiesHeroArt}
        tone="gold"
      >
        <nav aria-label="Filter by progress">
          <ul role="list" className="flex flex-wrap items-center gap-2">
            <li>
              <Link
                href="/stories"
                aria-current={progress === "" ? "page" : undefined}
                className={`${chipBase} ${
                  progress === ""
                    ? "text-accent border-accent"
                    : "text-muted border-border"
                }`}
              >
                All stories
              </Link>
            </li>

            {PROGRESS_OPTIONS.map((option) => (
              <li key={option.slug}>
                <Link
                  href={`/stories?progress=${option.slug}`}
                  aria-current={progress === option.slug ? "page" : undefined}
                  className={`${chipBase} ${
                    progress === option.slug
                      ? "text-accent border-accent"
                      : "text-muted border-border"
                  }`}
                >
                  {option.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </PageHero>

      <div className="w-full max-w-7xl 2xl:max-w-360 px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:pb-24 mx-auto flex flex-col gap-10 sm:gap-12">
        <div className="p-4 sm:p-5 bg-linear-to-br from-surface to-surface-muted border border-border rounded-lg">
          <ListFilters
            id="stories-filter"
            action="/stories"
            query={query}
            searchLabel="Search stories"
            placeholder="Search stories"
            selects={[
              {
                name: "category",
                label: "Category",
                allLabel: "All categories",
                value: category,
                options: options.categories,
              },
              {
                name: "tag",
                label: "Tag",
                allLabel: "All tags",
                value: tag,
                options: options.tags,
              },
              {
                name: "progress",
                label: "Progress",
                allLabel: "Any progress",
                value: progress,
                options: PROGRESS_OPTIONS,
              },
            ]}
          />
        </div>

        {items.length > 0 ? (
          <ul
            role="list"
            className="grid gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-3"
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
        ) : hasFilters ? (
          <BlogEmptyState
            eyebrow="No matches"
            title="Nothing matched your search."
            description="Try a different word, or clear the filters to see every story."
          />
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
          params={{ q: query, category, tag, progress }}
        />
      </div>
    </section>
  );
}
