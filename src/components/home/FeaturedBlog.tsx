import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/20/solid";

import ViewCount from "@/components/shared/ViewCount";
import type { BlogSummary as Blog } from "@/lib/blog/types";
import { textLang } from "@/lib/content/script";
import { formatDate } from "@/lib/formatDate";
import { cardButtonLargeClass } from "@/lib/publicUi";

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
      className="w-full max-w-7xl 2xl:max-w-360 px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12 mx-auto"
    >
      <article className="w-full grid md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] bg-linear-to-br from-surface to-surface-muted shadow-sm rounded-lg relative overflow-hidden transition-shadow duration-300 hover:shadow-md has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-accent has-[a:focus-visible]:ring-offset-2 group">
        <div className="w-full aspect-16/10 md:aspect-auto md:min-h-64 bg-surface-muted relative overflow-hidden">
          <Image
            src={blog.image}
            alt=""
            fill
            sizes="(min-width: 768px) 40vw, 100vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        </div>

        <div className="p-5 sm:p-6 lg:p-8 flex flex-col justify-center gap-3 sm:gap-4">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Featured
          </span>

          <h2
            lang={textLang(blog.title)}
            className="line-clamp-3 font-serif text-2xl sm:text-3xl leading-tight hi:leading-[1.35] text-balance text-foreground transition-colors duration-200 group-hover:text-accent"
          >
            {blog.title}
          </h2>

          <p
            lang={textLang(blog.excerpt)}
            className="max-w-xl line-clamp-3 text-sm sm:text-base leading-6 sm:leading-7 hi:sm:leading-8 text-pretty text-muted"
          >
            {blog.excerpt}
          </p>

          {tags.length > 0 && (
            <ul className="flex flex-wrap items-center gap-2">
              {tags.map((tag) => (
                <li
                  key={tag}
                  lang={textLang(tag)}
                  className="px-3 py-1.5 text-xs text-muted bg-surface-muted rounded-full"
                >
                  {tag}
                </li>
              ))}
            </ul>
          )}

          <div className="pt-1 flex items-center justify-between gap-3">
            <div className="min-w-0 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm text-muted">
              <time dateTime={date.iso}>{date.label}</time>
              <span aria-hidden="true">•</span>
              <span>{blog.readTime}</span>
              <ViewCount count={blog.viewCount} separated />
            </div>

            <Link href={`/blogs/${blog.slug}`} className={cardButtonLargeClass}>
              Read
              <span className="sr-only"> {blog.title}</span>
              <ArrowRightIcon
                aria-hidden="true"
                className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none"
              />
            </Link>
          </div>
        </div>
      </article>
    </section>
  );
}
