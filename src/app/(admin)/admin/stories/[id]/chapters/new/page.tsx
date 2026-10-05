import type { Metadata } from "next";
import { notFound } from "next/navigation";

import ChapterEditor, {
  type ChapterEditorInitial,
} from "@/components/admin/stories/ChapterEditor";
import AdminPageHeader from "@/components/admin/ui/AdminPageHeader";
import BackLink from "@/components/admin/ui/BackLink";
import { saveChapter } from "@/lib/admin/stories/chapterActions";
import { requireAdmin } from "@/lib/auth/session";
import { getDisplayStatus } from "@/lib/content/status";
import { getNextChapterNumber, getStorySummary } from "@/lib/db/stories";
import { idSchema } from "@/lib/validation/shared";

export const metadata: Metadata = {
  title: "New chapter",
};

const NEW_CHAPTER: ChapterEditorInitial = {
  title: "",
  content: "",
  status: "draft",
  publishAt: "",
};

interface NewChapterPageProps {
  params: Promise<{ id: string }>;
}

export default async function NewChapterPage({ params }: NewChapterPageProps) {
  await requireAdmin();

  const { id } = await params;

  if (!idSchema.safeParse(id).success) {
    notFound();
  }

  const [story, nextNumber] = await Promise.all([
    getStorySummary(id),
    getNextChapterNumber(id),
  ]);

  if (!story) {
    notFound();
  }

  return (
    <section className="w-full flex flex-col gap-8">
      <BackLink href={`/admin/stories/${story.id}`}>{story.title}</BackLink>

      <AdminPageHeader
        title={`Chapter ${nextNumber}`}
        description="A new chapter, saved as a draft until you publish or schedule it."
      />

      <ChapterEditor
        action={saveChapter.bind(null, story.id, null)}
        initial={NEW_CHAPTER}
        chapterNumber={nextNumber}
        isNew
        storyIsLive={getDisplayStatus(story.status, story.published_at) === "published"}
      />
    </section>
  );
}