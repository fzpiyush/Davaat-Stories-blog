import type { Metadata } from "next";
import Link from "next/link";
import { PlusIcon } from "@heroicons/react/20/solid";

import BlogList from "@/components/admin/blogs/BlogList";
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
  BLOG_PAGE_SIZE,
  getBlogStatusCounts,
  listAdminBlogs,
} from "@/lib/db/blogs";

export const metadata: Metadata = {
  title: "Blogs",
};

interface BlogsAdminPageProps {
  searchParams: Promise<{
    status?: string | string[];
    q?: string | string[];
    page?: string | string[];
  }>;
}

export default async function BlogsAdminPage({
  searchParams,
}: BlogsAdminPageProps) {
  await requireAdmin();

  const params = await searchParams;
  const filter = parseStatusFilter(firstParam(params.status));
  const query = firstParam(params.q).trim().slice(0, 100);
  const page = parsePage(params.page);

  const [{ items, total }, counts] = await Promise.all([
    listAdminBlogs({ filter, query, page }),
    getBlogStatusCounts(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / BLOG_PAGE_SIZE));
  const statusParam = filter === "all" ? "" : filter;

  return (
    <section className="w-full flex flex-col gap-8">
      <AdminPageHeader
        title="Blogs"
        description="Write, schedule, and manage every post."
      >
        <Link href="/admin/blogs/new" className={buttonClass.primary}>
          <PlusIcon aria-hidden="true" className="w-4 h-4" />
          New blog
        </Link>
      </AdminPageHeader>

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <StatusTabs
          basePath="/admin/blogs"
          current={filter}
          counts={counts}
          query={query}
        />

        <SearchForm
          id="blog-search"
          action="/admin/blogs"
          query={query}
          label="Search blogs"
          placeholder="Search by title"
          hiddenParams={{ status: statusParam }}
        />
      </div>

      {items.length > 0 ? (
        <BlogList items={items} />
      ) : (
        <AdminEmptyState
          title={query ? "No blogs match" : "Nothing here yet"}
          description={
            query
              ? "Try a different word, or clear the search."
              : "Start your next post, it saves as a draft until you publish."
          }
        >
          {!query && (
            <Link href="/admin/blogs/new" className={buttonClass.primary}>
              <PlusIcon aria-hidden="true" className="w-4 h-4" />
              New blog
            </Link>
          )}
        </AdminEmptyState>
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        basePath="/admin/blogs"
        params={{ status: statusParam, q: query }}
      />
    </section>
  );
}
