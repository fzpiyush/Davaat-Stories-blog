import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/20/solid";

import type { Blog } from "@/lib/blog/mockBlogs";

interface RelatedBlogsProps {
  blogs: Blog[];
}

interface RelatedBlogCardProps {
  blog: Blog;
}

function RelatedBlogCard({ blog }: RelatedBlogCardProps) {
  return (
    <article className="relative w-full h-full flex flex-col gap-3 p-6 bg-surface rounded-lg shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-accent motion-reduce:transition-none motion-reduce:hover:translate-y-0 group">
      <span className="text-xs font-medium uppercase tracking-[0.15em] text-accent">
        {blog.category}
      </span>

      <h3 className="line-clamp-2 pt-1 font-serif text-2xl leading-tight text-foreground transition-colors duration-200 group-hover:text-accent">
        <Link
          href={`/blogs/${blog.slug}`}
          className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
        >
          {blog.title}
        </Link>
      </h3>

      <p className="line-clamp-3 text-sm leading-6 text-muted">
        {blog.excerpt}
      </p>

      <span
        aria-hidden="true"
        className="inline-flex items-center gap-1.5 mt-auto pt-3 text-sm font-medium text-accent"
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
      className="w-full max-w-7xl grid gap-8 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end mx-auto px-6 py-16 lg:px-8"
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
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 sm:col-span-2"
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
