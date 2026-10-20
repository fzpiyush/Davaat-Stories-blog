import type { Metadata } from "next";

import BlogEmptyState from "@/components/blog/BlogEmptyState";
import FeaturedBlog from "@/components/home/FeaturedBlog";
import HomeHero from "@/components/home/HomeHero";
import LatestBlogs from "@/components/home/LatestBlogs";
import NewsletterSection from "@/components/home/NewsletterSection";
import StoriesSection from "@/components/home/StoriesSection";
import { getFeaturedBlog } from "@/lib/blog/queries";
import { pageBackgroundClass } from "@/lib/content/pageBackground";
import { SITE_NAME } from "@/lib/site";

// Refreshes every minute, so scheduled posts and chapters show up on time
export const revalidate = 60;

export const metadata: Metadata = {
  title: SITE_NAME,
  description:
    "Thoughts, ideas, experiences, and lessons about technology, life, and everything in between.",
};

export default async function HomePage() {
  const featuredBlog = await getFeaturedBlog();

  return (
    <>
      <HomeHero />

      <div className={`relative isolate ${pageBackgroundClass}`}>
        {/* Starts on the hero's own colour, so no seam, then a faint blue before it fades out */}
        <div
          aria-hidden="true"
          className="h-80 bg-linear-to-b from-background via-wash/25 to-transparent absolute inset-x-0 top-0 -z-10 pointer-events-none"
        />

        <div className="pt-4 sm:pt-8">
          <StoriesSection />
        </div>

        {featuredBlog ? (
          <>
            <FeaturedBlog blog={featuredBlog} />
            <LatestBlogs excludeSlug={featuredBlog.slug} />
          </>
        ) : (
          <section
            aria-label="No posts yet"
            className="w-full max-w-7xl 2xl:max-w-360 px-4 py-12 sm:px-6 sm:py-16 lg:px-8 mx-auto"
          >
            <BlogEmptyState
              description="The first post is on its way. Subscribe below to get it the moment it's live."
              action={null}
            />
          </section>
        )}
      </div>

      <NewsletterSection />
    </>
  );
}
