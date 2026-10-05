import type { Metadata } from "next";

import BlogCard from "@/components/blog/BlogCard";
import BlogEmptyState from "@/components/blog/BlogEmptyState";
import { blogs } from "@/lib/blog/mockBlogs";

const PRIORITY_COUNT = 3;

export const metadata: Metadata = {
  title: "Blog | DI World",
  description:
    "Thoughts, ideas, experiences, and lessons about technology, life, and everything in between.",
};

export default function BlogsPage() {
  const count = blogs.length;

  return (
    <section
      aria-labelledby="blogs-heading"
      className="w-full max-w-7xl 2xl:max-w-360 min-h-screen mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 sm:pt-32 sm:pb-20 lg:pt-36 lg:pb-24 flex flex-col gap-12 sm:gap-16"
    >
      <header className="max-w-3xl flex flex-col gap-5 border-b border-border pb-10 sm:pb-12">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-accent">
          The blog
        </p>

        <h1
          id="blogs-heading"
          className="font-serif text-4xl sm:text-5xl lg:text-6xl leading-[1.05] tracking-tight text-balance text-foreground"
        >
          Thoughts, stories and lessons along the way.
        </h1>

        <p className="max-w-2xl text-base sm:text-lg leading-7 sm:leading-8 text-pretty text-muted">
          Everything I write about technology, life, and the small things that
          make days better.
        </p>

        <p className="text-sm font-medium text-muted">
          {count} {count === 1 ? "post" : "posts"}
        </p>
      </header>

      {count > 0 ? (
        <ul
          role="list"
          className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3"
        >
          {blogs.map((blog, index) => (
            <li key={blog.id} className="flex *:w-full">
              <BlogCard blog={blog} priority={index < PRIORITY_COUNT} />
            </li>
          ))}
        </ul>
      ) : (
        <BlogEmptyState />
      )}
    </section>
  );
}
