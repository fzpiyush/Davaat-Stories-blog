import type { Metadata } from "next";
import { notFound } from "next/navigation";

import BlogArticle from "@/components/blog/BlogArticle";
import { blogs, getBlogBySlug } from "@/lib/blog/mockBlogs";
import { formatDate } from "@/lib/formatDate";

type BlogParams = {
  slug: string;
};

interface BlogPageProps {
  params: Promise<BlogParams>;
}

export function generateStaticParams(): BlogParams[] {
  return blogs.map((blog) => ({ slug: blog.slug }));
}

export async function generateMetadata({
  params,
}: BlogPageProps): Promise<Metadata> {
  const { slug } = await params;
  const blog = getBlogBySlug(slug);

  if (!blog) {
    return { title: "Post not found" };
  }

  const { iso } = formatDate(blog.publishedAt);

  return {
    title: blog.title,
    description: blog.excerpt,
    openGraph: {
      type: "article",
      title: blog.title,
      description: blog.excerpt,
      publishedTime: iso,
      authors: [blog.author],
      tags: blog.tags,
      images: [{ url: blog.image, alt: blog.title }],
    },
  };
}

export default async function BlogPage({ params }: BlogPageProps) {
  const { slug } = await params;
  const blog = getBlogBySlug(slug);

  if (!blog) {
    notFound();
  }

  return <BlogArticle blog={blog} />;
}
