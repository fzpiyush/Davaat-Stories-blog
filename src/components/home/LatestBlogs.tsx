import BlogCard from "@/components/blog/BlogCard";
import ViewAllLink from "@/components/shared/ViewAllLink";
import { getLatestBlogs } from "@/lib/blog/queries";

const LATEST_LIMIT = 3;

interface LatestBlogsProps {
  excludeSlug?: string;
}

export default async function LatestBlogs({ excludeSlug }: LatestBlogsProps) {
  const blogs = await getLatestBlogs(LATEST_LIMIT, excludeSlug);

  if (blogs.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="latest-blogs-heading"
      className="w-full max-w-7xl 2xl:max-w-360 px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16 mx-auto flex flex-col gap-6 sm:gap-8"
    >
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end sm:gap-6">
        <div className="flex flex-col gap-2 sm:gap-3">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-accent">
            Latest
          </p>

          <h2
            id="latest-blogs-heading"
            className="font-serif text-3xl sm:text-4xl leading-tight text-balance text-foreground"
          >
            Latest from the blog
          </h2>
        </div>

        <ViewAllLink href="/blogs" label="View all blogs" />
      </div>

      <ul
        role="list"
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8"
      >
        {blogs.map((blog) => (
          <li key={blog.id} className="flex">
            <BlogCard blog={blog} headingLevel="h3" />
          </li>
        ))}
      </ul>
    </section>
  );
}
