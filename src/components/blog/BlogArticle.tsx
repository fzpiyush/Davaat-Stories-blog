import Image from "next/image";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/20/solid";

import ViewCount from "@/components/shared/ViewCount";
import { smallButtonClass } from "@/lib/admin/ui";
import type { Blog, BlogSummary } from "@/lib/blog/types";
import { textLang } from "@/lib/content/script";
import { formatDate } from "@/lib/formatDate";

import AuthorCard from "./AuthorCard";
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

/* One centered column when narrow, and the left track of the grid from xl */
const blockClass = "w-full min-w-0 max-w-3xl mx-auto xl:max-w-none xl:mx-0";

const chipClass =
  "px-3 py-1.5 inline-flex text-xs bg-linear-to-br from-surface to-surface-muted border border-border rounded-lg";

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
  const date = formatDate(blog.publishedAt);
  const hasToc = toc.length > 0;
  const hasRecommended = recommendedBlogs.length > 0;
  const hasAside = hasToc || hasRecommended;

  return (
    <article className="w-full px-4 pt-28 pb-10 sm:px-6 sm:pt-32 sm:pb-14 lg:px-8 bg-linear-to-b from-background via-surface to-background">
      {/* From xl the grid is a 48rem text track and an 18rem panel track. The heading and cover span both */}
      <div className="w-full max-w-274 mx-auto grid grid-cols-1 gap-y-8 sm:gap-y-10 xl:grid-cols-[minmax(0,48rem)_18rem] xl:gap-x-10">
        <header
          className={`${blockClass} xl:col-span-2 flex flex-col gap-5 sm:gap-6`}
        >
          <Link
            href="/blogs"
            className={`${smallButtonClass.secondary} w-fit group`}
          >
            <ArrowLeftIcon
              aria-hidden="true"
              className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1 motion-reduce:transition-none"
            />
            All posts
          </Link>

          <h1
            lang={textLang(blog.title)}
            className="font-serif text-3xl sm:text-4xl lg:text-5xl leading-[1.1] tracking-tight hi:leading-[1.35] hi:tracking-normal text-balance text-foreground"
          >
            {blog.title}
          </h1>

          <p
            lang={textLang(blog.excerpt)}
            className="max-w-3xl text-lg sm:text-xl leading-7 sm:leading-8 hi:sm:leading-9 text-pretty text-muted"
          >
            {blog.excerpt}
          </p>

          <ul className="flex flex-wrap items-center gap-2">
            <li
              lang={textLang(blog.category)}
              className={`${chipClass} font-medium text-accent`}
            >
              {blog.category}
            </li>

            {blog.tags.map((tag) => (
              <li
                key={tag}
                lang={textLang(tag)}
                className={`${chipClass} text-muted`}
              >
                {tag}
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">
            <span>
              By{" "}
              <span
                lang={textLang(blog.author)}
                className="font-medium text-foreground"
              >
                {blog.author}
              </span>
            </span>
            <span aria-hidden="true">•</span>
            <time dateTime={date.iso}>{date.label}</time>
            <span aria-hidden="true">•</span>
            <span>{blog.readTime}</span>
            <ViewCount count={blog.viewCount} separated />
          </div>
        </header>

        <div
          className={`${blockClass} xl:col-span-2 aspect-16/10 xl:aspect-21/9 bg-linear-to-br from-surface to-surface-muted rounded-lg relative overflow-hidden`}
        >
          {blog.image ? (
            <Image
              src={blog.image}
              alt=""
              fill
              priority
              sizes="(min-width: 1280px) 1096px, (min-width: 768px) 768px, 100vw"
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center text-sm text-muted absolute inset-0">
              No cover yet
            </div>
          )}
        </div>

        <div className={`${blockClass} pt-2 flex flex-col gap-10 sm:gap-12`}>
          {sections.map((section) => (
            <section
              key={section.key}
              id={section.id}
              className="flex flex-col gap-5 scroll-mt-24"
            >
              {section.heading && (
                <h2
                  lang={textLang(section.heading)}
                  className="font-serif text-2xl sm:text-3xl leading-tight hi:leading-[1.4] text-balance text-foreground"
                >
                  {section.heading}
                </h2>
              )}

              {section.paragraphs.map((paragraph, index) => (
                <p
                  key={`${section.key}-p-${index}`}
                  lang={textLang(paragraph)}
                  className="text-base leading-7 hi:leading-8 sm:text-lg sm:leading-8 sm:hi:leading-9 text-foreground/85"
                >
                  {paragraph}
                </p>
              ))}

              {section.quote && (
                <blockquote className="p-5 sm:p-6 bg-linear-to-br from-surface to-surface-muted border-l-4 border-accent rounded-lg">
                  <p
                    lang={textLang(section.quote)}
                    className="font-serif text-lg sm:text-xl italic hi:not-italic leading-8 hi:leading-9 text-foreground"
                  >
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
            className={`${blockClass} flex flex-col gap-6 xl:col-start-2 xl:pt-2 xl:sticky xl:top-24 xl:self-start xl:max-h-[calc(100vh-7rem)] xl:overflow-y-auto [scrollbar-width:thin]`}
          >
            {hasToc && (
              <div className="hidden xl:block">
                <TableOfContents items={toc} />
              </div>
            )}

            {hasRecommended && <RecommendedBlogs blogs={recommendedBlogs} />}
          </aside>
        )}
      </div>
    </article>
  );
}
