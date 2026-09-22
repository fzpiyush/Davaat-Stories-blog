import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/20/solid";

import type { Blog } from "@/lib/blog/mockBlogs";
import { formatDate } from "@/lib/formatDate";

const MAX_TAGS = 3;

interface FeaturedBlogProps {
  blog: Blog;
}

export default function FeaturedBlog({ blog }: FeaturedBlogProps) {
  const date = formatDate(blog.publishedAt);
  const tags = blog.tags.slice(0, MAX_TAGS);

  return (
    <section
      aria-label="Featured post"
      className="w-full max-w-7xl mx-auto px-6 py-20 lg:px-8"
    >
      <article className="relative w-full grid lg:grid-cols-2 bg-surface rounded-lg overflow-hidden shadow-sm transition-shadow duration-300 hover:shadow-md has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-accent has-[a:focus-visible]:ring-offset-2 group">
        <div className="relative w-full min-h-80 lg:min-h-110 bg-surface-muted overflow-hidden">
          <Image
            src={blog.image}
            alt=""
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        </div>

        <div className="flex flex-col justify-center gap-5 p-8 sm:p-10 lg:p-14">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Featured
          </span>

          <h2 className="text-balance font-serif text-4xl sm:text-5xl leading-tight text-foreground transition-colors duration-200 group-hover:text-accent">
            <Link
              href={`/blogs/${blog.slug}`}
              className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
            >
              {blog.title}
            </Link>
          </h2>

          <p className="max-w-xl text-pretty text-base leading-7 text-muted">
            {blog.excerpt}
          </p>

          {tags.length > 0 && (
            <ul className="flex flex-wrap items-center gap-2 pt-1">
              {tags.map((tag) => (
                <li
                  key={tag}
                  className="px-3 py-1.5 bg-surface-muted rounded-full text-xs text-muted"
                >
                  {tag}
                </li>
              ))}
            </ul>
          )}

          <div className="flex items-center justify-between pt-3">
            <div className="flex items-center gap-2 text-sm text-muted">
              <time dateTime={date.iso}>{date.label}</time>
              <span aria-hidden="true">•</span>
              <span>{blog.readTime}</span>
            </div>

            <span
              aria-hidden="true"
              className="w-10 h-10 flex items-center justify-center bg-surface-muted rounded-lg text-foreground transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none"
            >
              <ArrowRightIcon className="w-5 h-5" />
            </span>
          </div>
        </div>
      </article>
    </section>
  );
}
