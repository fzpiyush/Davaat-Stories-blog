import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckCircleIcon } from "@heroicons/react/20/solid";

import ChapterList from "@/components/admin/stories/ChapterList";
import StoryEditor from "@/components/admin/stories/StoryEditor";
import AdminPageHeader from "@/components/admin/ui/AdminPageHeader";
import BackLink from "@/components/admin/ui/BackLink";
import DangerZone from "@/components/admin/ui/DangerZone";
import StatusBadge from "@/components/admin/ui/StatusBadge";
import { toAdminInputValue } from "@/lib/admin/datetime";
import { pluralize } from "@/lib/admin/format";
import { firstParam } from "@/lib/admin/params";
import { deleteStoryAction, saveStory } from "@/lib/admin/stories/actions";
import { requireAdmin } from "@/lib/auth/session";
import { getDisplayStatus } from "@/lib/content/status";
import { PROGRESS_LABEL } from "@/lib/content/story";
import { listCategoryOptions, listTagNames } from "@/lib/db/options";
import { getStoryForEditor, listChaptersForStory } from "@/lib/db/stories";
import { idSchema } from "@/lib/validation/shared";

export const metadata: Metadata = {
  title: "Edit story",
};

interface EditStoryPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string | string[] }>;
}

export default async function EditStoryPage({
  params,
  searchParams,
}: EditStoryPageProps) {
  await requireAdmin();

  const { id } = await params;

  if (!idSchema.safeParse(id).success) {
    notFound();
  }

  const [record, chapters, categories, tagSuggestions, search] =
    await Promise.all([
      getStoryForEditor(id),
      listChaptersForStory(id),
      listCategoryOptions(),
      listTagNames(),
      searchParams,
    ]);

  if (!record) {
    notFound();
  }

  const { story, cover, tagNames } = record;
  const displayStatus = getDisplayStatus(story.status, story.published_at);
  const justCreated = firstParam(search.created) === "1";

  return (
    <section className="w-full flex flex-col gap-8">
      <BackLink href="/admin/stories">All stories</BackLink>

      <AdminPageHeader title={story.title || "Untitled story"}>
        <StatusBadge status={displayStatus} />
        <span className="px-2.5 py-1 text-xs font-medium text-muted bg-surface-muted rounded-full">
          {PROGRESS_LABEL[story.progress]}
        </span>
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
          Story created. Add your first chapter below whenever you&apos;re
          ready.
        </p>
      )}

      <StoryEditor
        action={saveStory.bind(null, story.id)}
        initial={{
          title: story.title,
          slug: story.slug,
          blurb: story.blurb,
          cover: cover
            ? { id: cover.id, url: cover.url, alt: cover.alt_text }
            : null,
          categoryId: story.category_id ?? "",
          tags: tagNames,
          progress: story.progress,
          status: story.status,
          publishAt: toAdminInputValue(story.published_at),
          featured: story.is_featured,
        }}
        categories={categories}
        tagSuggestions={tagSuggestions}
        isNew={false}
      />

      <ChapterList storyId={story.id} chapters={chapters} />

      <DangerZone
        title="Delete this story"
        description={`All ${pluralize(chapters.length, "chapter")}, plus comments, likes, and views go with it. This can't be undone.`}
        action={deleteStoryAction.bind(null, story.id)}
        confirmMessage={`Delete ${story.title} and every chapter in it? This can't be undone.`}
      />
    </section>
  );
}
