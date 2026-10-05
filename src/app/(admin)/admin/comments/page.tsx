import type { Metadata } from "next";

import CommentList from "@/components/admin/comments/CommentList";
import AdminEmptyState from "@/components/admin/ui/AdminEmptyState";
import AdminPageHeader from "@/components/admin/ui/AdminPageHeader";
import FilterTabs from "@/components/admin/ui/FilterTabs";
import Pagination from "@/components/admin/ui/Pagination";
import SearchForm from "@/components/admin/ui/SearchForm";
import { parseChoice, parsePage, parseQuery } from "@/lib/admin/params";
import { requireAdmin } from "@/lib/auth/session";
import {
  COMMENT_FILTERS,
  COMMENT_PAGE_SIZE,
  getCommentCounts,
  listAdminComments,
} from "@/lib/db/comments";

export const metadata: Metadata = {
  title: "Comments",
};

interface CommentsPageProps {
  searchParams: Promise<{
    filter?: string | string[];
    q?: string | string[];
    page?: string | string[];
  }>;
}

export default async function CommentsPage({
  searchParams,
}: CommentsPageProps) {
  await requireAdmin();

  const params = await searchParams;
  const filter = parseChoice(params.filter, COMMENT_FILTERS, "all");
  const query = parseQuery(params.q);
  const page = parsePage(params.page);

  const [{ items, total }, counts] = await Promise.all([
    listAdminComments({ filter, query, page }),
    getCommentCounts(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / COMMENT_PAGE_SIZE));
  const filterParam = filter === "all" ? "" : filter;

  return (
    <section className="w-full flex flex-col gap-8">
      <AdminPageHeader
        title="Comments"
        description="Comments go live right away. Hide anything that doesn't belong, or block a reader from commenting again."
      />

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <FilterTabs
          label="Filter comments"
          basePath="/admin/comments"
          current={filter}
          defaultValue="all"
          query={query}
          tabs={[
            { value: "all", label: "All", count: counts.all },
            { value: "visible", label: "Visible", count: counts.visible },
            { value: "hidden", label: "Hidden", count: counts.hidden },
          ]}
        />

        <SearchForm
          id="comment-search"
          action="/admin/comments"
          query={query}
          label="Search comments"
          placeholder="Search text, name, or email"
          hiddenParams={{ filter: filterParam }}
        />
      </div>

      {items.length > 0 ? (
        <CommentList items={items} />
      ) : (
        <AdminEmptyState
          title={query ? "No comments match" : "No comments yet"}
          description={
            query
              ? "Try a different word, or clear the search."
              : "When readers start commenting on your blogs and stories, they'll show up here."
          }
        />
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        basePath="/admin/comments"
        params={{ filter: filterParam, q: query }}
      />
    </section>
  );
}
