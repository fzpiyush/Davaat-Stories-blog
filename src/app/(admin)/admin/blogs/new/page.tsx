import type { Metadata } from "next";

import BlogEditor, {
  type BlogEditorInitial,
} from "@/components/admin/blogs/BlogEditor";
import AdminPageHeader from "@/components/admin/ui/AdminPageHeader";
import BackLink from "@/components/admin/ui/BackLink";
import { saveBlog } from "@/lib/admin/blogs/actions";
import { EMPTY_SECTION, toContentOption } from "@/lib/admin/editor";
import { requireAdmin } from "@/lib/auth/session";
import { listBlogOptions } from "@/lib/db/blogs";
import { listCategoryOptions, listTagNames } from "@/lib/db/options";

export const metadata: Metadata = {
  title: "New blog",
};

const NEW_BLOG: BlogEditorInitial = {
  title: "",
  slug: "",
  excerpt: "",
  sections: [EMPTY_SECTION],
  cover: null,
  categoryId: "",
  tags: [],
  recommendationIds: [],
  status: "draft",
  publishAt: "",
  featured: false,
};

export default async function NewBlogPage() {
  await requireAdmin();

  const [categories, tagSuggestions, blogRows] = await Promise.all([
    listCategoryOptions(),
    listTagNames(),
    listBlogOptions(),
  ]);

  return (
    <section className="w-full flex flex-col gap-8">
      <BackLink href="/admin/blogs">All blogs</BackLink>

      <AdminPageHeader
        title="New blog"
        description="Drafts stay private until you publish or schedule them."
      />

      <BlogEditor
        action={saveBlog.bind(null, null)}
        initial={NEW_BLOG}
        categories={categories}
        tagSuggestions={tagSuggestions}
        blogOptions={blogRows.map((row) =>
          toContentOption(row.id, row.title, row.status, row.published_at),
        )}
        isNew
      />
    </section>
  );
}
