import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/20/solid";

import BlogCard from "@/components/blog/BlogCard";
import { getLatestBlogs } from "@/lib/blog/queries";

const DEFAULT_LIMIT = 3;

interface LatestBlogsProps {
  /** Skip a post already shown elsewhere, like the featured one */
  excludeSlug?: string;
  limit?: number;
}

export default async function LatestBlogs({
  excludeSlug,
  limit = DEFAULT_LIMIT,
}: LatestBlogsProps) {
  const latestBlogs = await getLatestBlogs(limit, excludeSlug);

  if (latestBlogs.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="latest-blogs-heading"
      className="w-full max-w-7xl 2xl:max-w-360 px-4 pb-12 sm:px-6 sm:pb-16 lg:px-8 lg:pb-20 mx-auto grid gap-8 sm:gap-10 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end"
    >
      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-accent">
          Latest
        </p>

        <h2
          id="latest-blogs-heading"
          className="font-serif text-3xl sm:text-4xl lg:text-5xl text-balance text-foreground"
        >
          Latest from the blog
        </h2>
      </div>

      <Link
        href="/blogs"
        className="w-fit inline-flex items-center gap-1.5 order-last sm:order-0 text-sm font-medium text-accent transition-opacity hover:opacity-70 group"
      >
        View all blogs
        <ArrowRightIcon
          aria-hidden="true"
          className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none"
        />
      </Link>

      <ul
        role="list"
        className="grid gap-6 sm:col-span-2 md:grid-cols-2 lg:grid-cols-3 lg:gap-8"
      >
        {latestBlogs.map((blog) => (
          <li key={blog.id} className="flex">
            <BlogCard blog={blog} headingLevel="h3" />
          </li>
        ))}
      </ul>
    </section>
  );
}
