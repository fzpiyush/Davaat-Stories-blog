import type { Metadata } from "next";
import { notFound } from "next/navigation";

import BlogCard from "@/components/blog/BlogCard";
import BlogEmptyState from "@/components/blog/BlogEmptyState";
import ListFilters from "@/components/public/ListFilters";
import PageHero from "@/components/public/PageHero";
import PublicPagination from "@/components/public/PublicPagination";
import { parsePage, parseQuery } from "@/lib/admin/params";
import {
  BLOGS_PER_PAGE,
  getBlogFilterOptions,
  getBlogsPage,
} from "@/lib/blog/queries";
import { parseSlug, type SearchParamValue } from "@/lib/content/filters";
import { blogsHeroArt } from "@/lib/content/heroArt";
import { pageBackgroundClass } from "@/lib/content/pageBackground";
import { SITE_NAME } from "@/lib/site";

const PRIORITY_COUNT = 3;

export const metadata: Metadata = {
  title: `Blog | ${SITE_NAME}`,
  description:
    "Thoughts, ideas, experiences, and lessons about technology, life, and everything in between.",
};

interface BlogsPageProps {
  searchParams: Promise<{
    page?: SearchParamValue;
    q?: SearchParamValue;
    category?: SearchParamValue;
    tag?: SearchParamValue;
  }>;
}

export default async function BlogsPage({ searchParams }: BlogsPageProps) {
  const params = await searchParams;
  const page = parsePage(params.page);
  const query = parseQuery(params.q);
  const category = parseSlug(params.category);
  const tag = parseSlug(params.tag);
  const hasFilters = Boolean(query || category || tag);

  const [{ items, total }, options] = await Promise.all([
    getBlogsPage({ page, query, category, tag }),
    getBlogFilterOptions(),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / BLOGS_PER_PAGE));

  if (total > 0 && page > totalPages) {
    notFound();
  }

  return (
    <section
      aria-labelledby="blogs-heading"
      className={`w-full min-h-screen flex flex-col ${pageBackgroundClass}`}
    >
      <PageHero
        id="blogs-heading"
        eyebrow="The blog"
        title="Thoughts, stories and lessons along the way."
        description="Everything I write about technology, life, and the small things that make days better."
        countLabel={`${total} ${total === 1 ? "post" : "posts"}${hasFilters ? " found" : ""}`}
        art={blogsHeroArt}
        tone="blue"
      />

      <div className="w-full max-w-7xl 2xl:max-w-360 px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:pb-24 mx-auto flex flex-col gap-10 sm:gap-12">
        <div className="p-4 sm:p-5 bg-linear-to-br from-surface to-surface-muted border border-border rounded-lg">
          <ListFilters
            id="blogs-filter"
            action="/blogs"
            query={query}
            searchLabel="Search posts"
            placeholder="Search posts"
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
            ]}
          />
        </div>

        {items.length > 0 ? (
          <ul
            role="list"
            className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3"
          >
            {items.map((blog, index) => (
              <li key={blog.id} className="flex *:w-full">
                <BlogCard
                  blog={blog}
                  priority={page === 1 && index < PRIORITY_COUNT}
                />
              </li>
            ))}
          </ul>
        ) : hasFilters ? (
          <BlogEmptyState
            eyebrow="No matches"
            title="Nothing matched your search."
            description="Try a different word, or clear the filters to see every post."
          />
        ) : (
          <BlogEmptyState />
        )}

        <PublicPagination
          page={page}
          totalPages={totalPages}
          basePath="/blogs"
          params={{ q: query, category, tag }}
        />
      </div>
    </section>
  );
}
