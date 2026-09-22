import Image from "next/image";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/20/solid";

import type { Blog } from "@/lib/blog/mockBlogs";

import AuthorCard from "./AuthorCard";
import BlogMeta from "./BlogsMeta";

type BlogSection = Blog["content"][number];

type ArticleSection = BlogSection & {
  id?: string;
  key: string;
};

type TocItem = {
  id: string;
  heading: string;
};

interface BlogArticleProps {
  blog: Blog;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

function buildSections(content: BlogSection[]): ArticleSection[] {
  const usedIds = new Map<string, number>();

  return content.map((section, index) => {
    if (!section.heading) {
      return { ...section, key: `section-${index}` };
    }

    const baseId = slugify(section.heading) || `section-${index}`;
    const count = usedIds.get(baseId) ?? 0;
    usedIds.set(baseId, count + 1);

    const id = count > 0 ? `${baseId}-${count}` : baseId;

    return { ...section, id, key: id };
  });
}

function buildToc(sections: ArticleSection[]): TocItem[] {
  return sections.flatMap((section) =>
    section.id && section.heading
      ? [{ id: section.id, heading: section.heading }]
      : [],
  );
}

export default function BlogArticle({ blog }: BlogArticleProps) {
  const sections = buildSections(blog.content);
  const toc = buildToc(sections);
  const hasTags = blog.tags.length > 0;
  const hasAside = toc.length > 0 || hasTags;

  const bodyGridClass = [
    "w-full max-w-7xl grid gap-12",
    hasAside ? "lg:grid-cols-[minmax(0,1fr)_280px]" : "",
    "mx-auto px-6 py-16 lg:px-8",
  ].join(" ");

  return (
    <article className="w-full">
      <header className="w-full max-w-4xl flex flex-col gap-8 mx-auto px-6 pt-12 pb-12 sm:pt-16 lg:px-8">
        <Link
          href="/blogs"
          className="w-fit inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-accent group"
        >
          <ArrowLeftIcon
            aria-hidden="true"
            className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1 motion-reduce:transition-none"
          />
          All posts
        </Link>

        <div className="flex flex-col gap-6">
          <span className="w-fit inline-flex px-3 py-1.5 bg-surface-muted rounded-full text-xs font-medium text-accent">
            {blog.category}
          </span>

          <h1 className="text-balance font-serif text-4xl sm:text-6xl lg:text-7xl leading-[1.05] tracking-tight text-foreground">
            {blog.title}
          </h1>

          <p className="max-w-3xl text-pretty text-lg sm:text-xl leading-8 text-muted">
            {blog.excerpt}
          </p>
        </div>

        <BlogMeta
          author={blog.author}
          publishedAt={blog.publishedAt}
          readTime={blog.readTime}
        />
      </header>

      <div className="w-full max-w-7xl mx-auto px-6 lg:px-8">
        <div className="relative w-full aspect-video sm:aspect-21/9 bg-surface-muted rounded-lg overflow-hidden">
          <Image
            src={blog.image}
            alt=""
            fill
            priority
            sizes="(max-width: 1280px) 100vw, 1280px"
            className="object-cover"
          />
        </div>
      </div>

      <div className={bodyGridClass}>
        <div className="w-full max-w-3xl flex flex-col gap-12 mx-auto">
          {sections.map((section) => (
            <section
              key={section.key}
              id={section.id}
              className="flex flex-col gap-5 scroll-mt-24"
            >
              {section.heading && (
                <h2 className="text-balance font-serif text-3xl sm:text-4xl leading-tight text-foreground">
                  {section.heading}
                </h2>
              )}

              {section.paragraphs.map((paragraph, index) => (
                <p
                  key={`${section.key}-p-${index}`}
                  className="text-lg leading-8 text-muted"
                >
                  {paragraph}
                </p>
              ))}

              {section.quote && (
                <blockquote className="p-6 bg-surface-muted border-l-4 border-accent rounded-r-lg">
                  <p className="font-serif text-xl italic leading-8 text-foreground">
                    “{section.quote}”
                  </p>
                </blockquote>
              )}
            </section>
          ))}

          <AuthorCard name={blog.author} />
        </div>

        {hasAside && (
          <aside
            aria-label="About this post"
            className="lg:sticky lg:top-8 w-full h-fit flex flex-col gap-8 p-6 bg-surface-muted rounded-lg"
          >
            {toc.length > 0 && (
              <nav
                aria-labelledby="toc-heading"
                className="hidden lg:flex flex-col gap-4"
              >
                <h2
                  id="toc-heading"
                  className="text-xs font-medium uppercase tracking-[0.2em] text-accent"
                >
                  On this page
                </h2>

                <ul className="flex flex-col gap-2">
                  {toc.map((item) => (
                    <li key={item.id}>
                      <Link
                        href={`#${item.id}`}
                        className="block text-sm leading-6 text-muted transition-colors hover:text-foreground"
                      >
                        {item.heading}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            )}

            {hasTags && (
              <div className="flex flex-col gap-5">
                <h2 className="font-serif text-2xl text-foreground">
                  About this post
                </h2>

                <ul className="flex flex-wrap gap-2">
                  {blog.tags.map((tag) => (
                    <li
                      key={tag}
                      className="px-3 py-1.5 bg-background rounded-full text-xs text-muted"
                    >
                      {tag}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        )}
      </div>
    </article>
  );
}
