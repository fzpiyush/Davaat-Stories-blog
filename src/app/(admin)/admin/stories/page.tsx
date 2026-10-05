import type { Metadata } from "next";
import Link from "next/link";
import { PlusIcon } from "@heroicons/react/20/solid";

import StoryList from "@/components/admin/stories/StoryList";
import AdminEmptyState from "@/components/admin/ui/AdminEmptyState";
import AdminPageHeader from "@/components/admin/ui/AdminPageHeader";
import Pagination from "@/components/admin/ui/Pagination";
import SearchForm from "@/components/admin/ui/SearchForm";
import StatusTabs from "@/components/admin/ui/StatusTabs";
import { firstParam, parsePage } from "@/lib/admin/params";
import { buttonClass } from "@/lib/admin/ui";
import { requireAdmin } from "@/lib/auth/session";
import { parseStatusFilter } from "@/lib/content/status";
import {
  getStoryStatusCounts,
  listAdminStories,
  STORY_PAGE_SIZE,
} from "@/lib/db/stories";

export const metadata: Metadata = {
  title: "Stories",
};

interface StoriesAdminPageProps {
  searchParams: Promise<{
    status?: string | string[];
    q?: string | string[];
    page?: string | string[];
  }>;
}

export default async function StoriesAdminPage({
  searchParams,
}: StoriesAdminPageProps) {
  await requireAdmin();

  const params = await searchParams;
  const filter = parseStatusFilter(firstParam(params.status));
  const query = firstParam(params.q).trim().slice(0, 100);
  const page = parsePage(params.page);

  const [{ items, total }, counts] = await Promise.all([
    listAdminStories({ filter, query, page }),
    getStoryStatusCounts(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / STORY_PAGE_SIZE));
  const statusParam = filter === "all" ? "" : filter;

  return (
    <section className="w-full flex flex-col gap-8">
      <AdminPageHeader
        title="Stories"
        description="Your web novels, written and released chapter by chapter."
      >
        <Link href="/admin/stories/new" className={buttonClass.primary}>
          <PlusIcon aria-hidden="true" className="w-4 h-4" />
          New story
        </Link>
      </AdminPageHeader>

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <StatusTabs
          basePath="/admin/stories"
          current={filter}
          counts={counts}
          query={query}
        />

        <SearchForm
          id="story-search"
          action="/admin/stories"
          query={query}
          label="Search stories"
          placeholder="Search by title"
          hiddenParams={{ status: statusParam }}
        />
      </div>

      {items.length > 0 ? (
        <StoryList items={items} />
      ) : (
        <AdminEmptyState
          title={query ? "No stories match" : "No stories yet"}
          description={
            query
              ? "Try a different word, or clear the search."
              : "Set up your first story, then add chapters to it."
          }
        >
          {!query && (
            <Link href="/admin/stories/new" className={buttonClass.primary}>
              <PlusIcon aria-hidden="true" className="w-4 h-4" />
              New story
            </Link>
          )}
        </AdminEmptyState>
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        basePath="/admin/stories"
        params={{ status: statusParam, q: query }}
      />
    </section>
  );
}
