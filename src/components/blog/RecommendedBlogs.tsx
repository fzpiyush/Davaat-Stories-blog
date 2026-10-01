import Image from "next/image";
import Link from "next/link";

import type { Blog } from "@/lib/blog/mockBlogs";

interface RecommendedBlogsProps {
  blogs: Blog[];
}

export default function RecommendedBlogs({ blogs }: RecommendedBlogsProps) {
  if (blogs.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="recommended-heading"
      className="w-full p-6 flex flex-col gap-4 bg-surface-muted rounded-lg"
    >
      <h2
        id="recommended-heading"
        className="text-xs font-medium uppercase tracking-[0.2em] text-accent"
      >
        Recommended
      </h2>

      <ul role="list" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
        {blogs.map((blog) => (
          <li key={blog.id}>
            <Link
              href={`/blogs/${blog.slug}`}
              className="w-full flex items-start gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent group"
            >
              <div className="w-20 h-16 shrink-0 bg-background rounded-md relative overflow-hidden">
                <Image
                  src={blog.image}
                  alt=""
                  fill
                  sizes="80px"
                  className="object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none"
                />
              </div>

              <div className="min-w-0 flex flex-col gap-1">
                <span className="line-clamp-2 text-sm font-medium leading-5 text-foreground transition-colors duration-200 group-hover:text-accent">
                  {blog.title}
                </span>

                <span className="text-xs text-muted">{blog.readTime}</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
