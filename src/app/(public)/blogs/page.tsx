import type { Metadata } from "next";
import { notFound } from "next/navigation";

import BlogCard from "@/components/blog/BlogCard";
import BlogEmptyState from "@/components/blog/BlogEmptyState";
import PublicPagination from "@/components/public/PublicPagination";
import { parsePage } from "@/lib/admin/params";
import { BLOGS_PER_PAGE, getBlogsPage } from "@/lib/blog/queries";
import { SITE_NAME } from "@/lib/site";

const PRIORITY_COUNT = 3;

export const metadata: Metadata = {
  title: `Blog | ${SITE_NAME}`,
  description:
    "Thoughts, ideas, experiences, and lessons about technology, life, and everything in between.",
};

interface BlogsPageProps {
  searchParams: Promise<{ page?: string | string[] }>;
}

export default async function BlogsPage({ searchParams }: BlogsPageProps) {
  const { page: pageParam } = await searchParams;
  const page = parsePage(pageParam);
  const { items, total } = await getBlogsPage(page);
  const totalPages = Math.max(1, Math.ceil(total / BLOGS_PER_PAGE));

  if (total > 0 && page > totalPages) {
    notFound();
  }

  return (
    <section
      aria-labelledby="blogs-heading"
      className="w-full max-w-7xl 2xl:max-w-360 min-h-screen px-4 pt-28 pb-16 sm:px-6 sm:pt-32 sm:pb-20 lg:px-8 lg:pt-36 lg:pb-24 mx-auto flex flex-col gap-12 sm:gap-16"
    >
      <header className="max-w-3xl pb-10 sm:pb-12 flex flex-col gap-5 border-b border-border">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-accent">
          The blog
        </p>

        <h1
          id="blogs-heading"
          className="font-serif text-4xl sm:text-5xl lg:text-6xl leading-[1.05] tracking-tight text-balance text-foreground"
        >
          Thoughts, stories and lessons along the way.
        </h1>

        <p className="max-w-2xl text-base sm:text-lg leading-7 sm:leading-8 text-pretty text-muted">
          Everything I write about technology, life, and the small things that
          make days better.
        </p>

        <p className="text-sm font-medium text-muted">
          {total} {total === 1 ? "post" : "posts"}
        </p>
      </header>

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
      ) : (
        <BlogEmptyState />
      )}

      <PublicPagination page={page} totalPages={totalPages} basePath="/blogs" />
    </section>
  );
}
