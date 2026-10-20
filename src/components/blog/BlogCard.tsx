import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/20/solid";

import ViewCount from "@/components/shared/ViewCount";
import type { BlogSummary as Blog } from "@/lib/blog/types";
import { textLang } from "@/lib/content/script";
import { formatDate } from "@/lib/formatDate";
import { cardButtonClass } from "@/lib/publicUi";

type HeadingLevel = "h2" | "h3";

interface BlogCardProps {
  blog: Blog;
  /** Set true for cards visible on first load (e.g. the first row) */
  priority?: boolean;
  /** Use h3 when the card sits under a section h2, like on the homepage */
  headingLevel?: HeadingLevel;
}

export default function BlogCard({
  blog,
  priority = false,
  headingLevel = "h2",
}: BlogCardProps) {
  const date = formatDate(blog.publishedAt);
  const Heading = headingLevel;

  return (
    <article className="w-full h-full flex flex-col bg-linear-to-b from-surface to-surface-muted/60 shadow-sm rounded-lg relative overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-accent has-[a:focus-visible]:ring-offset-2 motion-reduce:transition-none motion-reduce:hover:translate-y-0 group">
      <div className="w-full aspect-16/10 bg-surface-muted relative overflow-hidden">
        <Image
          src={blog.image}
          alt=""
          fill
          priority={priority}
          sizes="(min-width: 1536px) 480px, (min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
      </div>

      <div className="p-5 sm:p-6 flex flex-1 flex-col gap-3">
        <span
          lang={textLang(blog.category)}
          className="w-fit px-3 py-1 inline-flex text-xs font-medium text-accent bg-surface-muted rounded-full"
        >
          {blog.category}
        </span>

        <Heading
          lang={textLang(blog.title)}
          className="pt-1 line-clamp-2 font-serif text-xl sm:text-2xl leading-tight hi:leading-[1.4] text-foreground transition-colors duration-200 group-hover:text-accent"
        >
          {blog.title}
        </Heading>

        <p
          lang={textLang(blog.excerpt)}
          className="line-clamp-3 text-sm leading-6 hi:leading-7 text-muted"
        >
          {blog.excerpt}
        </p>

        <div className="mt-auto pt-5 flex items-center justify-between gap-3 text-xs text-muted">
          <div className="min-w-0 flex flex-wrap items-center gap-x-2 gap-y-1">
            <time dateTime={date.iso}>{date.label}</time>
            <span aria-hidden="true">•</span>
            <span>{blog.readTime}</span>
            <ViewCount count={blog.viewCount} separated />
          </div>

          <Link href={`/blogs/${blog.slug}`} className={cardButtonClass}>
            Read
            <span className="sr-only"> {blog.title}</span>
            <ArrowRightIcon
              aria-hidden="true"
              className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none"
            />
          </Link>
        </div>
      </div>
    </article>
  );
}
