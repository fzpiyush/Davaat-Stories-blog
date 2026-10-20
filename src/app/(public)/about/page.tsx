import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/20/solid";

import BlogCard from "@/components/blog/BlogCard";
import ThemedArt, { type ThemedArtSet } from "@/components/shared/ThemedArt";
import { socialIcons } from "@/components/shared/socialIcons";
import StoryCard from "@/components/story/StoryCard";
import { getPublicAbout, getSiteStats } from "@/lib/about/queries";
import { getPublicAuthor } from "@/lib/author/queries";
import { getLatestBlogs } from "@/lib/blog/queries";
import { pageBackgroundClass } from "@/lib/content/pageBackground";
import { splitParagraphs } from "@/lib/content/text";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";
import { getLatestStories } from "@/lib/story/queries";

import aboutDay from "@/assets/About.png";
import aboutDayPhone from "@/assets/About_Mobile.png";
import aboutNightPhone from "@/assets/About_Mobile_Night.png";
import aboutNight from "@/assets/About_Night.png";

export const revalidate = 60;

const ABOUT_ART: ThemedArtSet = {
  day: aboutDay,
  night: aboutNight,
  dayPhone: aboutDayPhone,
  nightPhone: aboutNightPhone,
};

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

  return (
    <>
      <section
        aria-labelledby="about-heading"
        className={`w-full ${pageBackgroundClass} relative isolate overflow-hidden`}
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 mask-[linear-gradient(to_bottom,black_60%,transparent_100%)]"
        >
          <ThemedArt
            art={ABOUT_ART}
            imageClassName="object-cover object-top md:object-center"
          />

          {/* Blue ink mist right behind the text, fading into the painting */}
          <div className="bg-radial-[ellipse_at_50%_32%] from-wash/85 via-wash/40 via-35% to-transparent to-65% absolute inset-0" />
        </div>

        <div className="w-full max-w-3xl min-h-[min(125vw,52rem)] md:min-h-[min(56vw,48rem)] px-4 pt-28 pb-24 sm:px-6 sm:pt-32 mx-auto flex flex-col items-center gap-5 text-center">
          {author?.avatarUrl ? (
            <div className="w-24 sm:w-28 h-24 sm:h-28 shrink-0 bg-surface-muted shadow-md rounded-full ring-4 ring-surface relative overflow-hidden">
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
              className="w-24 sm:w-28 h-24 sm:h-28 shrink-0 flex items-center justify-center font-serif text-5xl text-accent bg-surface shadow-md rounded-full ring-4 ring-surface"
            >
              {initial}
            </div>
          )}

          <p className={eyebrowClass}>
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
                      className="px-3.5 py-2 inline-flex items-center gap-2 text-sm text-foreground bg-surface/80 border border-border rounded-full backdrop-blur-sm transition-colors hover:text-accent-foreground hover:bg-accent hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
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
          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {statItems.map((item) => (
              <div
                key={item.label}
                className="p-5 flex flex-col-reverse items-center gap-1 text-center bg-surface border border-border rounded-xl"
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
          <div className="w-full max-w-3xl px-4 sm:px-6 mx-auto flex flex-col gap-12">
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
                  <blockquote className="p-5 sm:p-6 bg-surface-muted border-l-4 border-accent rounded-r-lg">
                    <p className="font-serif text-lg sm:text-xl italic leading-8 text-foreground">
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
