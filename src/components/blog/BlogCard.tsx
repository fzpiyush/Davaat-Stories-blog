import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/20/solid";

import type { BlogSummary as Blog } from "@/lib/blog/types";
import { formatDate } from "@/lib/formatDate";

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
    <article className="w-full h-full flex flex-col bg-surface shadow-sm rounded-lg relative overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-accent has-[a:focus-visible]:ring-offset-2 motion-reduce:transition-none motion-reduce:hover:translate-y-0 group">
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
        <span className="w-fit px-3 py-1 inline-flex text-xs font-medium text-accent bg-surface-muted rounded-full">
          {blog.category}
        </span>

        <Heading className="pt-1 line-clamp-2 font-serif text-xl sm:text-2xl leading-tight text-foreground transition-colors duration-200 group-hover:text-accent">
          <Link
            href={`/blogs/${blog.slug}`}
            className="focus-visible:outline-none after:absolute after:inset-0 after:content-['']"
          >
            {blog.title}
          </Link>
        </Heading>

        <p className="line-clamp-3 text-sm leading-6 text-muted">
          {blog.excerpt}
        </p>

        <div className="mt-auto pt-6 flex items-center justify-between gap-4 text-xs text-muted">
          <div className="flex items-center gap-2">
            <time dateTime={date.iso}>{date.label}</time>
            <span aria-hidden="true">•</span>
            <span>{blog.readTime}</span>
          </div>

          <span
            aria-hidden="true"
            className="inline-flex items-center gap-1 font-medium text-accent"
          >
            Read
            <ArrowRightIcon className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none" />
          </span>
        </div>
      </div>
    </article>
  );
}
