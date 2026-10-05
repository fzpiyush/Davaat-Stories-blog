import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/20/solid";

import type { BlogSummary as Blog } from "@/lib/blog/types";

interface RelatedBlogsProps {
  blogs: Blog[];
}

interface RelatedBlogCardProps {
  blog: Blog;
}

function RelatedBlogCard({ blog }: RelatedBlogCardProps) {
  return (
    <article className="w-full h-full p-6 flex flex-col gap-3 bg-surface shadow-sm rounded-lg relative transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-accent motion-reduce:transition-none motion-reduce:hover:translate-y-0 group">
      <span className="text-xs font-medium uppercase tracking-[0.15em] text-accent">
        {blog.category}
      </span>

      <h3 className="pt-1 line-clamp-2 font-serif text-xl sm:text-2xl leading-tight text-foreground transition-colors duration-200 group-hover:text-accent">
        <Link
          href={`/blogs/${blog.slug}`}
          className="focus-visible:outline-none after:absolute after:inset-0 after:content-['']"
        >
          {blog.title}
        </Link>
      </h3>

      <p className="line-clamp-3 text-sm leading-6 text-muted">
        {blog.excerpt}
      </p>

      <span
        aria-hidden="true"
        className="mt-auto pt-3 inline-flex items-center gap-1.5 text-sm font-medium text-accent"
      >
        Read article
        <ArrowRightIcon className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none" />
      </span>
    </article>
  );
}

export default function RelatedBlogs({ blogs }: RelatedBlogsProps) {
  if (blogs.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="related-blogs-heading"
      className="w-full max-w-7xl 2xl:max-w-360 px-4 py-12 sm:px-6 sm:py-16 lg:px-8 mx-auto grid gap-8 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end"
    >
      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-accent">
          Continue reading
        </p>

        <h2
          id="related-blogs-heading"
          className="font-serif text-3xl sm:text-4xl text-foreground"
        >
          You might also like
        </h2>
      </div>

      <Link
        href="/blogs"
        className="w-fit inline-flex items-center gap-1.5 order-last sm:order-0 text-sm font-medium text-accent transition-opacity hover:opacity-70 group"
      >
        View all
        <ArrowRightIcon
          aria-hidden="true"
          className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none"
        />
      </Link>

      <ul
        role="list"
        className="grid gap-6 sm:col-span-2 md:grid-cols-2 lg:grid-cols-3 lg:gap-8"
      >
        {blogs.map((blog) => (
          <li key={blog.id} className="flex">
            <RelatedBlogCard blog={blog} />
          </li>
        ))}
      </ul>
    </section>
  );
}
