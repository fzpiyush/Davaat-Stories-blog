import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/20/solid";

import type { Blog } from "@/lib/blog/mockBlogs";
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
    <article className="relative w-full h-full flex flex-col bg-surface rounded-lg overflow-hidden shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-accent has-[a:focus-visible]:ring-offset-2 motion-reduce:transition-none motion-reduce:hover:translate-y-0 group">
      <div className="relative w-full aspect-16/10 bg-surface-muted overflow-hidden">
        <Image
          src={blog.image}
          alt=""
          fill
          priority={priority}
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-6">
        <span className="w-fit inline-flex px-3 py-1 bg-surface-muted rounded-full text-xs font-medium text-accent">
          {blog.category}
        </span>

        <Heading className="line-clamp-2 pt-1 font-serif text-2xl leading-tight text-foreground transition-colors duration-200 group-hover:text-accent">
          <Link
            href={`/blogs/${blog.slug}`}
            className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
          >
            {blog.title}
          </Link>
        </Heading>

        <p className="line-clamp-3 text-sm leading-6 text-muted">
          {blog.excerpt}
        </p>

        <div className="flex items-center justify-between mt-auto pt-6 text-xs text-muted">
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
