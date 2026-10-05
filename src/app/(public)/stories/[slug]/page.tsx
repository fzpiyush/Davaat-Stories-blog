import type { Metadata } from "next";
import { notFound } from "next/navigation";

import StoryOverview from "@/components/story/StoryOverview";
import { SITE_NAME } from "@/lib/site";
import { getLiveChapters, getStoryBySlug } from "@/lib/story/queries";

// Refreshes every minute, so new chapters show up on time
export const revalidate = 60;

type StoryParams = {
  slug: string;
};

interface StoryPageProps {
  params: Promise<StoryParams>;
}

/* Built on first visit, then cached, so deploys never need the database */
export function generateStaticParams(): StoryParams[] {
  return [];
}

export async function generateMetadata({
  params,
}: StoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const story = await getStoryBySlug(slug);

  if (!story) {
    return {
      title: `Story not found | ${SITE_NAME}`,
    };
  }

  return {
    title: `${story.title} | ${SITE_NAME}`,
    description: story.blurb,
    keywords: story.tags,
    openGraph: {
      type: "book",
      title: story.title,
      description: story.blurb,
      siteName: SITE_NAME,
      images: [{ url: story.cover, alt: story.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: story.title,
      description: story.blurb,
      images: [story.cover],
    },
  };
}

export default async function StoryPage({ params }: StoryPageProps) {
  const { slug } = await params;
  const story = await getStoryBySlug(slug);

  if (!story) {
    notFound();
  }

  const chapters = await getLiveChapters(story.id);

  return <StoryOverview story={story} chapters={chapters} />;
}
