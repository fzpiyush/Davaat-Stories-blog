import type { Metadata } from "next";
import { notFound } from "next/navigation";

import PostEngagement from "@/components/engagement/PostEngagement";
import StoryOverview from "@/components/story/StoryOverview";
import { truncateText } from "@/lib/content/script";
import { SITE_NAME } from "@/lib/site";
import { getLiveChapters, getStoryBySlug } from "@/lib/story/queries";

// Refreshes every minute, so new chapters show up on time
export const revalidate = 60;

// A synopsis can run to 1,000 words, previews only need a taste of it
const DESCRIPTION_LENGTH = 160;

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

  const description = truncateText(story.blurb, DESCRIPTION_LENGTH);

  return {
    title: `${story.title} | ${SITE_NAME}`,
    description,
    keywords: story.tags,
    openGraph: {
      type: "book",
      title: story.title,
      description,
      siteName: SITE_NAME,
      images: [{ url: story.cover, alt: story.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: story.title,
      description,
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

  return (
    <>
      <StoryOverview story={story} chapters={chapters} />

      <PostEngagement
        kind="story"
        targetId={story.id}
        likeLabel={story.title}
        prompt="Enjoying the story? Leave a like."
      />
    </>
  );
}
