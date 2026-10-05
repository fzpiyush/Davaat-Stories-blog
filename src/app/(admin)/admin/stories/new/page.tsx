import type { Metadata } from "next";

import StoryEditor, { type StoryEditorInitial } from "@/components/admin/stories/StoryEditor";
import AdminPageHeader from "@/components/admin/ui/AdminPageHeader";
import BackLink from "@/components/admin/ui/BackLink";
import { saveStory } from "@/lib/admin/stories/actions";
import { requireAdmin } from "@/lib/auth/session";
import { listCategoryOptions, listTagNames } from "@/lib/db/options";

export const metadata: Metadata = {
  title: "New story",
};

const NEW_STORY: StoryEditorInitial = {
  title: "",
  slug: "",
  blurb: "",
  cover: null,
  categoryId: "",
  tags: [],
  progress: "ongoing",
  status: "draft",
  publishAt: "",
  featured: false,
};

export default async function NewStoryPage() {
  await requireAdmin();

  const [categories, tagSuggestions] = await Promise.all([
    listCategoryOptions(),
    listTagNames(),
  ]);

  return (
    <section className="w-full flex flex-col gap-8">
      <BackLink href="/admin/stories">All stories</BackLink>

      <AdminPageHeader
        title="New story"
        description="Save the story first, then you can start adding chapters."
      />

      <StoryEditor
        action={saveStory.bind(null, null)}
        initial={NEW_STORY}
        categories={categories}
        tagSuggestions={tagSuggestions}
        isNew
      />
    </section>
  );
}