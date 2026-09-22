import type { Metadata } from "next";
import { notFound } from "next/navigation";

import BlogArticle from "@/components/blog/BlogArticle";
import BlogNavigation from "@/components/blog/BlogNavigation";
import RelatedBlogs from "@/components/blog/RelatedBlogs";
import type { Blog } from "@/lib/blog/mockBlogs";
import { blogs, getBlogBySlug } from "@/lib/blog/mockBlogs";
import { formatDate } from "@/lib/formatDate";

const SITE_NAME = "DI World";
const RELATED_LIMIT = 3;

type BlogParams = {
  slug: string;
};

interface BlogPageProps {
  params: Promise<BlogParams>;
}

type AdjacentBlogs = {
  previousBlog: Blog | undefined;
  nextBlog: Blog | undefined;
};

function getAdjacentBlogs(index: number): AdjacentBlogs {
  return {
    previousBlog: index + 1 < blogs.length ? blogs[index + 1] : undefined,
    nextBlog: index > 0 ? blogs[index - 1] : undefined,
  };
}

function getRelatedBlogs(current: Blog, limit = RELATED_LIMIT): Blog[] {
  const others = blogs.filter((item) => item.id !== current.id);

  const related = others
    .map((item) => {
      const sharedTags = item.tags.filter((tag) =>
        current.tags.includes(tag),
      ).length;
      const categoryScore = item.category === current.category ? 2 : 0;

      return { item, score: sharedTags + categoryScore };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ item }) => item);

  if (related.length >= limit) {
    return related.slice(0, limit);
  }

  const fillers = others.filter((item) => !related.includes(item));

  return [...related, ...fillers].slice(0, limit);
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
  const blogIndex = blogs.findIndex((item) => item.slug === slug);
  const blog = blogs[blogIndex];

  if (!blog) {
    notFound();
  }

  const { previousBlog, nextBlog } = getAdjacentBlogs(blogIndex);
  const relatedBlogs = getRelatedBlogs(blog);

  return (
    <>
      <BlogArticle blog={blog} />

      <div className="w-full max-w-7xl mx-auto px-6 lg:px-8">
        <BlogNavigation previousBlog={previousBlog} nextBlog={nextBlog} />
      </div>

      <RelatedBlogs blogs={relatedBlogs} />
    </>
  );
}
