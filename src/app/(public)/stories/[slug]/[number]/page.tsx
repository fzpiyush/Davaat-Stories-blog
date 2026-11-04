import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChatBubbleLeftRightIcon } from "@heroicons/react/20/solid";

import LikeButton from "@/components/engagement/LikeButton";
import ViewTracker from "@/components/engagement/ViewTracker";
import ShareButtons from "@/components/shared/ShareButtons";
import ChapterReader from "@/components/story/ChapterReader";
import { truncateText } from "@/lib/content/script";
import { SITE_NAME } from "@/lib/site";
import {
  getChapter,
  getLiveChapters,
  getStoryBySlug,
} from "@/lib/story/queries";

export const revalidate = 60;

// Search results and link previews show about this much
const DESCRIPTION_LENGTH = 160;
const SHARE_TEXT_LENGTH = 140;

type ChapterParams = {
  slug: string;
  number: string;
};

interface ChapterPageProps {
  params: Promise<ChapterParams>;
}

export function generateStaticParams(): ChapterParams[] {
  return [];
}

/* Only plain numbers like 1 or 12, so odd links go straight to 404 */
function parseChapterNumber(value: string): number | null {
  if (!/^\d{1,6}$/.test(value)) {
    return null;
  }

  const number = Number(value);
  return number > 0 ? number : null;
}

async function loadChapter(slug: string, numberParam: string) {
  const number = parseChapterNumber(numberParam);

  if (number === null) {
    return null;
  }

  const story = await getStoryBySlug(slug);

  if (!story) {
    return null;
  }

  const chapter = await getChapter(story.id, number);
  return chapter ? { story, chapter } : null;
}

/* Reads like The Lantern Keeper, Chapter 3: The night the lanterns went out */
function toShareTitle(
  storyTitle: string,
  number: number,
  chapterTitle: string,
): string {
  return `${storyTitle}, Chapter ${number}: ${chapterTitle}`;
}

export async function generateMetadata({
  params,
}: ChapterPageProps): Promise<Metadata> {
  const { slug, number } = await params;
  const loaded = await loadChapter(slug, number);

  if (!loaded) {
    return {
      title: `Chapter not found | ${SITE_NAME}`,
    };
  }

  const { story, chapter } = loaded;
  const firstParagraph = chapter.paragraphs[0];
  const shareTitle = toShareTitle(story.title, chapter.number, chapter.title);

  // The chapter's own opening lines, or a short slice of the synopsis
  const description = truncateText(
    firstParagraph || story.blurb,
    DESCRIPTION_LENGTH,
  );

  return {
    title: `Chapter ${chapter.number}: ${chapter.title} | ${story.title}`,
    description,
    openGraph: {
      type: "article",
      title: shareTitle,
      description,
      siteName: SITE_NAME,
      images: [{ url: story.cover, alt: story.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: shareTitle,
      description,
      images: [story.cover],
    },
  };
}

export default async function ChapterPage({ params }: ChapterPageProps) {
  const { slug, number } = await params;
  const loaded = await loadChapter(slug, number);

  if (!loaded) {
    notFound();
  }

  const { story, chapter } = loaded;
  const chapters = await getLiveChapters(story.id);
  const index = chapters.findIndex((item) => item.number === chapter.number);

  const firstParagraph = chapter.paragraphs[0];
  const shareTitle = toShareTitle(story.title, chapter.number, chapter.title);
  const shareText = firstParagraph
    ? truncateText(firstParagraph, SHARE_TEXT_LENGTH)
    : undefined;

  return (
    <>
      <ChapterReader
        story={{ slug: story.slug, title: story.title }}
        chapter={chapter}
        chapters={chapters}
        previous={index > 0 ? chapters[index - 1] : undefined}
        next={index >= 0 ? chapters[index + 1] : undefined}
      />

      <ViewTracker kind="chapter" id={chapter.id} />

      <aside
        aria-label="Support the story"
        className="w-full max-w-3xl px-4 pb-16 sm:px-6 sm:pb-20 mx-auto"
      >
        <div className="p-5 sm:p-6 flex flex-col gap-5 bg-surface-muted rounded-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-col gap-1">
              <p className="font-serif text-lg text-foreground">
                Enjoying {story.title}?
              </p>

              <Link
                href={`/stories/${story.slug}#comments`}
                className="w-fit inline-flex items-center gap-1.5 text-sm font-medium text-accent rounded-sm transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <ChatBubbleLeftRightIcon
                  aria-hidden="true"
                  className="w-4 h-4"
                />
                Join the discussion
              </Link>
            </div>

            <LikeButton kind="story" targetId={story.id} label={story.title} />
          </div>

          <div className="pt-5 border-t border-border">
            <ShareButtons
              title={shareTitle}
              path={`/stories/${story.slug}/${chapter.number}`}
              text={shareText}
              label="Share this chapter"
            />
          </div>
        </div>
      </aside>
    </>
  );
}