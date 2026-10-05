import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  PlusIcon,
} from "@heroicons/react/20/solid";

import ChapterEditor from "@/components/admin/stories/ChapterEditor";
import AdminPageHeader from "@/components/admin/ui/AdminPageHeader";
import BackLink from "@/components/admin/ui/BackLink";
import DangerZone from "@/components/admin/ui/DangerZone";
import StatusBadge from "@/components/admin/ui/StatusBadge";
import { toAdminInputValue } from "@/lib/admin/datetime";
import { firstParam } from "@/lib/admin/params";
import {
  deleteChapterAction,
  saveChapter,
} from "@/lib/admin/stories/chapterActions";
import { buttonClass, smallButtonClass } from "@/lib/admin/ui";
import { requireAdmin } from "@/lib/auth/session";
import { getDisplayStatus } from "@/lib/content/status";
import {
  getChapterForEditor,
  getChapterNeighbors,
  getStorySummary,
} from "@/lib/db/stories";
import { idSchema } from "@/lib/validation/shared";

export const metadata: Metadata = {
  title: "Edit chapter",
};

interface EditChapterPageProps {
  params: Promise<{ id: string; chapterId: string }>;
  searchParams: Promise<{ created?: string | string[] }>;
}

export default async function EditChapterPage({
  params,
  searchParams,
}: EditChapterPageProps) {
  await requireAdmin();

  const { id, chapterId } = await params;

  if (
    !idSchema.safeParse(id).success ||
    !idSchema.safeParse(chapterId).success
  ) {
    notFound();
  }

  const [story, chapter, search] = await Promise.all([
    getStorySummary(id),
    getChapterForEditor(id, chapterId),
    searchParams,
  ]);

  if (!story || !chapter) {
    notFound();
  }

  const { previous, next } = await getChapterNeighbors(
    story.id,
    chapter.number,
  );
  const basePath = `/admin/stories/${story.id}/chapters`;
  const justCreated = firstParam(search.created) === "1";

  return (
    <section className="w-full flex flex-col gap-8">
      <BackLink href={`/admin/stories/${story.id}`}>{story.title}</BackLink>

      <AdminPageHeader
        title={`Chapter ${chapter.number}`}
        description={chapter.title}
      >
        <StatusBadge
          status={getDisplayStatus(chapter.status, chapter.published_at)}
        />

        {!next && (
          <Link href={`${basePath}/new`} className={buttonClass.secondary}>
            <PlusIcon aria-hidden="true" className="w-4 h-4" />
            Write next chapter
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
          Chapter {chapter.number} created. Keep writing, or publish when
          it&apos;s ready.
        </p>
      )}

      <ChapterEditor
        action={saveChapter.bind(null, story.id, chapter.id)}
        initial={{
          title: chapter.title,
          content: chapter.content,
          status: chapter.status,
          publishAt: toAdminInputValue(chapter.published_at),
        }}
        chapterNumber={chapter.number}
        isNew={false}
        storyIsLive={
          getDisplayStatus(story.status, story.published_at) === "published"
        }
      />

      {(previous || next) && (
        <nav
          aria-label="Other chapters"
          className="flex flex-wrap items-center justify-between gap-3"
        >
          {previous ? (
            <Link
              href={`${basePath}/${previous.id}`}
              className={smallButtonClass.secondary}
            >
              <ArrowLeftIcon aria-hidden="true" className="w-4 h-4" />
              Chapter {previous.number}
            </Link>
          ) : (
            <span />
          )}

          {next && (
            <Link
              href={`${basePath}/${next.id}`}
              className={smallButtonClass.secondary}
            >
              Chapter {next.number}
              <ArrowRightIcon aria-hidden="true" className="w-4 h-4" />
            </Link>
          )}
        </nav>
      )}

      <DangerZone
        title="Delete this chapter"
        description="Its views go with it, and later chapters move up by one. This can't be undone."
        action={deleteChapterAction.bind(null, story.id, chapter.id)}
        confirmMessage={`Delete chapter ${chapter.number}? This can't be undone.`}
      />
    </section>
  );
}
