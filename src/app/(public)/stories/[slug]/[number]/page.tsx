import type { Metadata } from "next";
import { notFound } from "next/navigation";

import ChapterReader from "@/components/story/ChapterReader";
import { SITE_NAME } from "@/lib/site";
import {
  getChapter,
  getLiveChapters,
  getStoryBySlug,
} from "@/lib/story/queries";

export const revalidate = 60;

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
  const title = `Chapter ${chapter.number}: ${chapter.title}`;

  return {
    title: `${title} | ${story.title}`,
    description: chapter.paragraphs[0]?.slice(0, 160) ?? story.blurb,
    openGraph: {
      type: "article",
      title,
      description: story.blurb,
      siteName: SITE_NAME,
      images: [{ url: story.cover, alt: story.title }],
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

  return (
    <ChapterReader
      story={{ slug: story.slug, title: story.title }}
      chapter={chapter}
      chapters={chapters}
      previous={index > 0 ? chapters[index - 1] : undefined}
      next={index >= 0 ? chapters[index + 1] : undefined}
    />
  );
}
