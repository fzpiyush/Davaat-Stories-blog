import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircleIcon } from "@heroicons/react/20/solid";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";

import BlogEditor from "@/components/admin/blogs/BlogEditor";
import AdminPageHeader from "@/components/admin/ui/AdminPageHeader";
import BackLink from "@/components/admin/ui/BackLink";
import DangerZone from "@/components/admin/ui/DangerZone";
import StatusBadge from "@/components/admin/ui/StatusBadge";
import { deleteBlogAction, saveBlog } from "@/lib/admin/blogs/actions";
import { toAdminInputValue } from "@/lib/admin/datetime";
import { toContentOption, toSectionDrafts } from "@/lib/admin/editor";
import { firstParam } from "@/lib/admin/params";
import { buttonClass } from "@/lib/admin/ui";
import { requireAdmin } from "@/lib/auth/session";
import { getDisplayStatus } from "@/lib/content/status";
import { getBlogForEditor, listBlogOptions } from "@/lib/db/blogs";
import { listCategoryOptions, listTagNames } from "@/lib/db/options";
import { idSchema } from "@/lib/validation/shared";

export const metadata: Metadata = {
  title: "Edit blog",
};

interface EditBlogPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string | string[] }>;
}

export default async function EditBlogPage({
  params,
  searchParams,
}: EditBlogPageProps) {
  await requireAdmin();

  const { id } = await params;

  if (!idSchema.safeParse(id).success) {
    notFound();
  }

  const [record, categories, tagSuggestions, blogRows, search] =
    await Promise.all([
      getBlogForEditor(id),
      listCategoryOptions(),
      listTagNames(),
      listBlogOptions(id),
      searchParams,
    ]);

  if (!record) {
    notFound();
  }

  const { blog, cover, tagNames, recommendationIds } = record;
  const displayStatus = getDisplayStatus(blog.status, blog.published_at);
  const justCreated = firstParam(search.created) === "1";

  return (
    <section className="w-full flex flex-col gap-8">
      <BackLink href="/admin/blogs">All blogs</BackLink>

      <AdminPageHeader title={blog.title || "Untitled blog"}>
        <StatusBadge status={displayStatus} />

        {displayStatus === "published" && (
          <Link
            href={`/blogs/${blog.slug}`}
            target="_blank"
            className={buttonClass.secondary}
          >
            <ArrowTopRightOnSquareIcon aria-hidden="true" className="w-4 h-4" />
            View on site
            <span className="sr-only">, opens in a new tab</span>
          </Link>
        )}
      </AdminPageHeader>

      {justCreated && (
        <p
          role="status"
          className="p-3 flex items-start gap-2 text-sm text-foreground bg-surface-muted border border-border rounded-lg"
        >
          <CheckCircleIcon
            aria-hidden="true"
            className="w-5 h-5 shrink-0 text-accent"
          />
          Blog created. Keep writing, or publish when you&apos;re ready.
        </p>
      )}

      <BlogEditor
        action={saveBlog.bind(null, blog.id)}
        initial={{
          title: blog.title,
          slug: blog.slug,
          excerpt: blog.excerpt,
          sections: toSectionDrafts(blog.content),
          cover: cover
            ? { id: cover.id, url: cover.url, alt: cover.alt_text }
            : null,
          categoryId: blog.category_id ?? "",
          tags: tagNames,
          recommendationIds,
          status: blog.status,
          publishAt: toAdminInputValue(blog.published_at),
          featured: blog.is_featured,
        }}
        categories={categories}
        tagSuggestions={tagSuggestions}
        blogOptions={blogRows.map((row) =>
          toContentOption(row.id, row.title, row.status, row.published_at),
        )}
        isNew={false}
      />

      <DangerZone
        title="Delete this blog"
        description="Its comments, likes, and views go with it. This can't be undone."
        action={deleteBlogAction.bind(null, blog.id)}
        confirmMessage={`Delete ${blog.title}? This can't be undone.`}
      />
    </section>
  );
}
