import type { Metadata } from "next";

import BlogEmptyState from "@/components/blog/BlogEmptyState";
import FeaturedBlog from "@/components/home/FeaturedBlog";
import HomeHero from "@/components/home/HomeHero";
import LatestBlogs from "@/components/home/LatestBlogs";
import NewsletterSection from "@/components/home/NewsletterSection";
import { getFeaturedBlog } from "@/lib/blog/queries";

export const metadata: Metadata = {
  title: "DI World",
  description:
    "Thoughts, ideas, experiences, and lessons about technology, life, and everything in between.",
};

export default function HomePage() {
  const featuredBlog = getFeaturedBlog();

  return (
    <>
      <HomeHero />

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

      <NewsletterSection />
    </>
  );
}
