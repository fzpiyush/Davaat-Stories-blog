import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/20/solid";

import type { BlogSummary as Blog } from "@/lib/blog/types";
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
      className="w-full max-w-7xl 2xl:max-w-360 px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20 mx-auto"
    >
      <article className="w-full grid lg:grid-cols-2 bg-surface shadow-sm rounded-lg relative overflow-hidden transition-shadow duration-300 hover:shadow-md has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-accent has-[a:focus-visible]:ring-offset-2 group">
        <div className="w-full min-h-64 sm:min-h-80 lg:min-h-110 xl:min-h-125 bg-surface-muted relative overflow-hidden">
          <Image
            src={blog.image}
            alt=""
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        </div>

        <div className="p-6 sm:p-10 lg:p-12 xl:p-14 flex flex-col justify-center gap-5">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Featured
          </span>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl leading-tight text-balance text-foreground transition-colors duration-200 group-hover:text-accent">
            <Link
              href={`/blogs/${blog.slug}`}
              className="focus-visible:outline-none after:absolute after:inset-0 after:content-['']"
            >
              {blog.title}
            </Link>
          </h2>

          <p className="max-w-xl text-base leading-7 text-pretty text-muted">
            {blog.excerpt}
          </p>

          {tags.length > 0 && (
            <ul className="pt-1 flex flex-wrap items-center gap-2">
              {tags.map((tag) => (
                <li
                  key={tag}
                  className="px-3 py-1.5 text-xs text-muted bg-surface-muted rounded-full"
                >
                  {tag}
                </li>
              ))}
            </ul>
          )}

          <div className="pt-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-muted">
              <time dateTime={date.iso}>{date.label}</time>
              <span aria-hidden="true">•</span>
              <span>{blog.readTime}</span>
            </div>

            <span
              aria-hidden="true"
              className="w-10 h-10 shrink-0 flex items-center justify-center text-foreground bg-surface-muted rounded-lg transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none"
            >
              <ArrowRightIcon className="w-5 h-5" />
            </span>
          </div>
        </div>
      </article>
    </section>
  );
}
