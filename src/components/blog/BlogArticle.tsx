import Image from "next/image";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/20/solid";

import type { Blog, BlogSummary } from "@/lib/blog/types";

import AuthorCard from "./AuthorCard";
import BlogMeta from "./BlogsMeta";
import RecommendedBlogs from "./RecommendedBlogs";
import TableOfContents, { type TocItem } from "./TableOfContent";

type BlogSection = Blog["content"][number];

type ArticleSection = BlogSection & {
  id?: string;
  key: string;
};

interface BlogArticleProps {
  blog: Blog;
  recommendedBlogs?: BlogSummary[];
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

export default function BlogArticle({
  blog,
  recommendedBlogs = [],
}: BlogArticleProps) {
  const sections = buildSections(blog.content);
  const toc = buildToc(sections);
  const hasToc = toc.length > 0;
  const hasTags = blog.tags.length > 0;
  const hasRecommended = recommendedBlogs.length > 0;
  const hasAside = hasToc || hasTags || hasRecommended;

  const bodyGridClass = hasAside
    ? "w-full max-w-7xl 2xl:max-w-360 px-4 py-12 sm:px-6 sm:py-16 lg:px-8 mx-auto grid gap-12 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-16 xl:grid-cols-[minmax(0,1fr)_320px]"
    : "w-full max-w-7xl 2xl:max-w-360 px-4 py-12 sm:px-6 sm:py-16 lg:px-8 mx-auto grid gap-12";

  return (
    <article className="w-full">
      <header className="w-full max-w-4xl 2xl:max-w-5xl px-4 py-10 sm:px-6 sm:pt-16 sm:pb-12 lg:px-8 mx-auto flex flex-col gap-6 sm:gap-8">
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

        <div className="flex flex-col gap-5 sm:gap-6">
          <span className="w-fit px-3 py-1.5 inline-flex text-xs font-medium text-accent bg-surface-muted rounded-full">
            {blog.category}
          </span>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl xl:text-7xl leading-[1.05] tracking-tight text-balance text-foreground">
            {blog.title}
          </h1>

          <p className="max-w-3xl text-lg sm:text-xl leading-7 sm:leading-8 text-pretty text-muted">
            {blog.excerpt}
          </p>
        </div>

        <BlogMeta
          author={blog.author}
          publishedAt={blog.publishedAt}
          readTime={blog.readTime}
        />
      </header>

      <div className="w-full max-w-7xl 2xl:max-w-360 px-4 sm:px-6 lg:px-8 mx-auto">
        <div className="w-full aspect-video sm:aspect-21/9 bg-surface-muted rounded-lg relative overflow-hidden">
          <Image
            src={blog.image}
            alt=""
            fill
            priority
            sizes="(min-width: 1536px) 1440px, (min-width: 1280px) 1280px, 100vw"
            className="object-cover"
          />
        </div>
      </div>

      <div className={bodyGridClass}>
        <div className="w-full max-w-3xl mx-auto flex flex-col gap-10 sm:gap-12">
          {sections.map((section) => (
            <section
              key={section.key}
              id={section.id}
              className="flex flex-col gap-5 scroll-mt-24"
            >
              {section.heading && (
                <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl leading-tight text-balance text-foreground">
                  {section.heading}
                </h2>
              )}

              {section.paragraphs.map((paragraph, index) => (
                <p
                  key={`${section.key}-p-${index}`}
                  className="text-base sm:text-lg leading-7 sm:leading-8 text-muted"
                >
                  {paragraph}
                </p>
              ))}

              {section.quote && (
                <blockquote className="p-5 sm:p-6 bg-surface-muted border-l-4 border-accent rounded-r-lg">
                  <p className="font-serif text-lg sm:text-xl italic leading-8 text-foreground">
                    “{section.quote}”
                  </p>
                </blockquote>
              )}
            </section>
          ))}

          <AuthorCard
            name={blog.author}
            bio={blog.authorBio}
            avatarUrl={blog.authorAvatarUrl}
          />
        </div>

        {hasAside && (
          <aside
            aria-label="More about this post"
            className="w-full h-fit lg:max-h-[calc(100vh-4rem)] flex flex-col gap-6 lg:sticky lg:top-8 lg:overflow-y-auto [scrollbar-width:thin]"
          >
            {hasToc && <TableOfContents items={toc} />}

            {hasTags && (
              <div className="w-full p-6 flex flex-col gap-4 bg-surface-muted rounded-lg">
                <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
                  Topics
                </h2>

                <ul className="flex flex-wrap gap-2">
                  {blog.tags.map((tag) => (
                    <li
                      key={tag}
                      className="px-3 py-1.5 text-xs text-muted bg-background rounded-full"
                    >
                      {tag}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {hasRecommended && <RecommendedBlogs blogs={recommendedBlogs} />}
          </aside>
        )}
      </div>
    </article>
  );
}
