import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/20/solid";

import BlogCard from "@/components/blog/BlogCard";
import { socialIcons } from "@/components/shared/socialIcons";
import StoryCard from "@/components/story/StoryCard";
import { getPublicAbout, getSiteStats } from "@/lib/about/queries";
import { getPublicAuthor } from "@/lib/author/queries";
import { getLatestBlogs } from "@/lib/blog/queries";
import { pageBackgroundClass } from "@/lib/content/pageBackground";
import { splitParagraphs } from "@/lib/content/text";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";
import { getLatestStories } from "@/lib/story/queries";

export const revalidate = 60;

const LATEST_BLOGS = 3;
const LATEST_STORIES = 4;
const FALLBACK_NAME = "The author";
const DESCRIPTION_LENGTH = 160;

const eyebrowClass =
  "flex items-center justify-center gap-2 text-sm font-medium uppercase tracking-[0.2em] text-accent";

const leadClass =
  "font-serif text-xl sm:text-2xl leading-9 sm:leading-10 whitespace-pre-line text-pretty text-foreground";

const dropCapClass =
  "first-letter:float-left first-letter:mt-1 first-letter:mr-3 first-letter:font-serif first-letter:text-6xl sm:first-letter:text-7xl first-letter:leading-[0.8] first-letter:text-accent";

const viewAllClass =
  "inline-flex items-center gap-1.5 text-sm font-medium text-accent rounded-lg transition-colors hover:text-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent group";

function toDescription(text: string): string {
  const clean = text.replace(/\s+/g, " ").trim();

  return clean.length > DESCRIPTION_LENGTH
    ? `${clean.slice(0, DESCRIPTION_LENGTH - 3).trimEnd()}...`
    : clean;
}

function countLabel(count: number, singular: string, plural: string): string {
  return count === 1 ? singular : plural;
}

export async function generateMetadata(): Promise<Metadata> {
  const [author, about] = await Promise.all([
    getPublicAuthor(),
    getPublicAbout(),
  ]);
  const source = about.intro.trim() || author?.bio.trim() || "";

  return {
    title: `About | ${SITE_NAME}`,
    description: source ? toDescription(source) : SITE_DESCRIPTION,
  };
}

function InkDivider() {
  return (
    <div aria-hidden="true" className="flex items-center justify-center gap-3">
      <span className="w-12 h-px bg-border" />
      <span className="w-1.5 h-1.5 bg-highlight rounded-full" />
      <span className="w-1.5 h-1.5 bg-highlight rounded-full" />
      <span className="w-1.5 h-1.5 bg-highlight rounded-full" />
      <span className="w-12 h-px bg-border" />
    </div>
  );
}

interface ViewAllLinkProps {
  href: string;
  label: string;
}

function ViewAllLink({ href, label }: ViewAllLinkProps) {
  return (
    <Link href={href} className={viewAllClass}>
      {label}
      <ArrowRightIcon
        aria-hidden="true"
        className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none"
      />
    </Link>
  );
}

export default async function AboutPage() {
  const [author, about, stats, blogs, stories] = await Promise.all([
    getPublicAuthor(),
    getPublicAbout(),
    getSiteStats(),
    getLatestBlogs(LATEST_BLOGS),
    getLatestStories(LATEST_STORIES),
  ]);

  const name = author?.name ?? FALLBACK_NAME;
  const initial = name.trim().charAt(0).toUpperCase();
  const links = author?.links ?? [];

  // Your About intro first, your short profile bio if it's empty
  const introText = about.intro.trim() || author?.bio.trim() || "";
  const introParagraphs = introText ? splitParagraphs(introText) : [];

  const showLatest =
    about.showLatest && (blogs.length > 0 || stories.length > 0);

  const statItems = [
    { label: countLabel(stats.blogs, "Blog", "Blogs"), value: stats.blogs },
    {
      label: countLabel(stats.stories, "Story", "Stories"),
      value: stats.stories,
    },
    {
      label: countLabel(stats.chapters, "Chapter", "Chapters"),
      value: stats.chapters,
    },
    ...(stats.since ? [{ label: "Writing since", value: stats.since }] : []),
  ];

  // Four stats sit in one row on wider screens, three stay evenly spaced
  const statColumnsClass =
    statItems.length === 4 ? "sm:grid-cols-4" : "sm:grid-cols-3";

  return (
    <>
      <section
        aria-labelledby="about-heading"
        className={`w-full ${pageBackgroundClass} relative isolate overflow-hidden`}
      >
        {/* A giant faint initial behind the name, like a watermark on paper */}
        <span
          aria-hidden="true"
          className="font-serif text-[18rem] sm:text-[26rem] leading-none text-foreground/4 absolute top-10 left-1/2 -translate-x-1/2 -z-10 select-none pointer-events-none"
        >
          {initial}
        </span>

        <div className="w-full max-w-3xl px-4 pt-32 pb-16 sm:px-6 sm:pt-40 sm:pb-20 mx-auto flex flex-col items-center gap-5 text-center">
          {author?.avatarUrl ? (
            <div className="w-24 sm:w-28 h-24 sm:h-28 shrink-0 bg-surface-muted rounded-full ring-1 ring-border ring-offset-4 ring-offset-background relative overflow-hidden">
              <Image
                src={author.avatarUrl}
                alt=""
                fill
                priority
                sizes="(min-width: 640px) 112px, 96px"
                className="object-cover"
              />
            </div>
          ) : (
            <div
              aria-hidden="true"
              className="w-24 sm:w-28 h-24 sm:h-28 shrink-0 flex items-center justify-center font-serif text-5xl text-accent bg-surface rounded-full ring-1 ring-border ring-offset-4 ring-offset-background"
            >
              {initial}
            </div>
          )}

          <p className={`pt-3 ${eyebrowClass}`}>
            <span
              aria-hidden="true"
              className="w-1.5 h-1.5 bg-highlight rounded-full"
            />
            About
          </p>

          <h1
            id="about-heading"
            className="font-serif text-5xl sm:text-6xl lg:text-7xl leading-[1.05] tracking-tight text-balance text-foreground"
          >
            {name}
          </h1>

          {about.headline && (
            <p className="max-w-xl font-serif text-xl sm:text-2xl italic leading-8 text-pretty text-accent">
              {about.headline}
            </p>
          )}

          <div className="pt-2">
            <InkDivider />
          </div>

          {links.length > 0 && (
            <ul
              aria-label="Find me elsewhere"
              className="pt-2 flex flex-wrap justify-center gap-2"
            >
              {links.map((link) => {
                const Icon = socialIcons[link.platform];

                return (
                  <li key={link.id}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 inline-flex items-center gap-2 text-sm text-foreground bg-surface border border-border rounded-full transition-colors hover:text-accent-foreground hover:bg-accent hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    >
                      <Icon aria-hidden="true" className="w-3.5 h-3.5" />
                      {link.label}
                      <span className="sr-only">, opens in a new tab</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      <div
        className={`w-full pb-4 flex flex-col gap-16 sm:gap-20 ${pageBackgroundClass}`}
      >
        {introParagraphs.length > 0 && (
          <section
            aria-label="Introduction"
            className="w-full max-w-3xl px-4 sm:px-6 mx-auto flex flex-col gap-6"
          >
            {introParagraphs.map((paragraph, index) => (
              <p
                key={index}
                className={
                  index === 0 ? `${leadClass} ${dropCapClass}` : leadClass
                }
              >
                {paragraph}
              </p>
            ))}
          </section>
        )}

        <section
          aria-label="At a glance"
          className="w-full max-w-4xl px-4 sm:px-6 mx-auto"
        >
          {/* One joined panel, the 1px gaps show the border color as hairline dividers */}
          <dl
            className={`grid grid-cols-2 ${statColumnsClass} gap-px bg-border border border-border rounded-2xl overflow-hidden`}
          >
            {statItems.map((item) => (
              <div
                key={item.label}
                className="px-4 py-7 sm:py-9 flex flex-col-reverse items-center gap-1.5 text-center bg-surface odd:last:col-span-2 sm:odd:last:col-span-1"
              >
                <dt className="text-xs font-medium uppercase tracking-[0.15em] text-muted">
                  {item.label}
                </dt>
                <dd className="font-serif text-3xl sm:text-4xl text-foreground">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {about.sections.length > 0 && (
          <div className="w-full max-w-3xl px-4 sm:px-6 mx-auto flex flex-col gap-14">
            <InkDivider />

            {about.sections.map((section, index) => (
              <section key={index} className="flex flex-col gap-5">
                {section.heading && (
                  <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl leading-tight text-balance text-foreground">
                    {section.heading}
                  </h2>
                )}

                {section.paragraphs.map((paragraph, paragraphIndex) => (
                  <p
                    key={paragraphIndex}
                    className="text-base sm:text-lg leading-7 sm:leading-8 whitespace-pre-line text-pretty text-foreground/90"
                  >
                    {paragraph}
                  </p>
                ))}

                {section.quote && (
                  <blockquote className="my-2 py-1 pl-6 border-l-2 border-accent">
                    <p className="font-serif text-xl sm:text-2xl italic leading-9 sm:leading-10 text-pretty text-foreground">
                      “{section.quote}”
                    </p>
                  </blockquote>
                )}
              </section>
            ))}
          </div>
        )}

        {showLatest && (
          <section
            aria-labelledby="latest-heading"
            className="w-full bg-surface-muted/60 border-y border-border"
          >
            <div className="w-full max-w-7xl 2xl:max-w-360 px-4 py-16 sm:px-6 sm:py-20 lg:px-8 mx-auto flex flex-col gap-12">
              <div className="flex flex-col items-center gap-3 text-center">
                <p className={eyebrowClass}>
                  <span
                    aria-hidden="true"
                    className="w-1.5 h-1.5 bg-highlight rounded-full"
                  />
                  Latest writing
                </p>

                <h2
                  id="latest-heading"
                  className="font-serif text-3xl sm:text-4xl text-balance text-foreground"
                >
                  Fresh from the desk
                </h2>
              </div>

              {blogs.length > 0 && (
                <div className="flex flex-col gap-5">
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-serif text-2xl text-foreground">Blogs</p>
                    <ViewAllLink href="/blogs" label="All blogs" />
                  </div>

                  <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {blogs.map((blog) => (
                      <li key={blog.id} className="flex">
                        <BlogCard blog={blog} headingLevel="h3" />
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {stories.length > 0 && (
                <div className="flex flex-col gap-5">
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-serif text-2xl text-foreground">
                      Stories
                    </p>
                    <ViewAllLink href="/stories" label="All stories" />
                  </div>

                  <ul className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {stories.map((story) => (
                      <li key={story.id} className="flex">
                        <StoryCard story={story} headingLevel="h3" />
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>
        )}

        <section
          aria-labelledby="closing-heading"
          className="w-full max-w-2xl px-4 pb-12 sm:px-6 sm:pb-16 mx-auto flex flex-col items-center gap-5 text-center"
        >
          <InkDivider />

          <h2
            id="closing-heading"
            className="font-serif text-3xl sm:text-4xl text-balance text-foreground"
          >
            Thanks for stopping by
          </h2>

          <p className="max-w-md text-base leading-7 text-pretty text-muted">
            Join the newsletter and you&apos;ll be the first to know when new
            posts and chapters arrive.
          </p>

          <Link
            href="/#newsletter-heading"
            className="px-6 py-3 inline-flex items-center gap-2 text-sm font-medium text-accent-foreground bg-accent shadow-sm rounded-lg transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background group"
          >
            Join the newsletter
            <ArrowRightIcon
              aria-hidden="true"
              className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none"
            />
          </Link>
        </section>
      </div>
    </>
  );
}
