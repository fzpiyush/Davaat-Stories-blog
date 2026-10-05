import type { Metadata } from "next";
import { notFound } from "next/navigation";

import BlogArticle from "@/components/blog/BlogArticle";
import BlogNavigation from "@/components/blog/BlogNavigation";
import PostEngagement from "@/components/engagement/PostEngagement";
import ViewTracker from "@/components/engagement/ViewTracker";
import {
  getAdjacentBlogs,
  getBlogBySlug,
  getRecommendedBlogs,
} from "@/lib/blog/queries";
import { formatDate } from "@/lib/formatDate";
import { SITE_NAME } from "@/lib/site";

// Refreshes every minute, so edits and scheduled posts show up on time
export const revalidate = 60;

type BlogParams = {
  slug: string;
};

interface BlogPageProps {
  params: Promise<BlogParams>;
}

/*
 * An empty list means pages get built on their first visit,
 * then cached. Builds stay fast and never need the database.
 */
export function generateStaticParams(): BlogParams[] {
  return [];
}

export async function generateMetadata({
  params,
}: BlogPageProps): Promise<Metadata> {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);

  if (!blog) {
    return {
      title: `Blog not found | ${SITE_NAME}`,
      description: "The requested blog post could not be found.",
    };
  }

  const { iso } = formatDate(blog.publishedAt);

  return {
    title: `${blog.title} | ${SITE_NAME}`,
    description: blog.excerpt,
    authors: [{ name: blog.author }],
    keywords: blog.tags,
    openGraph: {
      type: "article",
      title: blog.title,
      description: blog.excerpt,
      siteName: SITE_NAME,
      publishedTime: iso,
      authors: [blog.author],
      tags: blog.tags,
      images: [{ url: blog.image, alt: blog.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: blog.title,
      description: blog.excerpt,
      images: [blog.image],
    },
  };
}

export default async function BlogPage({ params }: BlogPageProps) {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);

  if (!blog) {
    notFound();
  }

  const [{ previousBlog, nextBlog }, recommendedBlogs] = await Promise.all([
    getAdjacentBlogs(blog),
    getRecommendedBlogs(blog.id),
  ]);

  return (
    <>
      <BlogArticle blog={blog} recommendedBlogs={recommendedBlogs} />

      <ViewTracker kind="blog" id={blog.id} />

      <PostEngagement
        kind="blog"
        targetId={blog.id}
        likeLabel="this post"
        prompt="Enjoyed this post? Let me know."
      />

      <div className="w-full max-w-3xl px-4 pb-16 sm:px-6 sm:pb-20 lg:px-0 mx-auto">
        <BlogNavigation previousBlog={previousBlog} nextBlog={nextBlog} />
      </div>
    </>
  );
}
