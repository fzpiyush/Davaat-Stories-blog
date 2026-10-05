import type { Metadata } from "next";

import ReaderList from "@/components/admin/readers/ReaderList";
import AdminEmptyState from "@/components/admin/ui/AdminEmptyState";
import AdminPageHeader from "@/components/admin/ui/AdminPageHeader";
import FilterTabs from "@/components/admin/ui/FilterTabs";
import Pagination from "@/components/admin/ui/Pagination";
import SearchForm from "@/components/admin/ui/SearchForm";
import { parseChoice, parsePage, parseQuery } from "@/lib/admin/params";
import { requireAdmin } from "@/lib/auth/session";
import {
  getReaderCounts,
  listReaders,
  READER_FILTERS,
  READER_PAGE_SIZE,
} from "@/lib/db/readers";

export const metadata: Metadata = {
  title: "Readers",
};

interface ReadersPageProps {
  searchParams: Promise<{
    filter?: string | string[];
    q?: string | string[];
    page?: string | string[];
  }>;
}

export default async function ReadersPage({ searchParams }: ReadersPageProps) {
  await requireAdmin();

  const params = await searchParams;
  const filter = parseChoice(params.filter, READER_FILTERS, "all");
  const query = parseQuery(params.q);
  const page = parsePage(params.page);

  const [{ items, total }, counts] = await Promise.all([
    listReaders({ filter, query, page }),
    getReaderCounts(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / READER_PAGE_SIZE));
  const filterParam = filter === "all" ? "" : filter;

  return (
    <section className="w-full flex flex-col gap-8">
      <AdminPageHeader
        title="Readers"
        description="Everyone who signed in with Google to comment. Blocked readers can still read, but can't comment."
      />

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <FilterTabs
          label="Filter readers"
          basePath="/admin/readers"
          current={filter}
          defaultValue="all"
          query={query}
          tabs={[
            { value: "all", label: "All", count: counts.all },
            { value: "active", label: "Active", count: counts.active },
            { value: "blocked", label: "Blocked", count: counts.blocked },
          ]}
        />

        <SearchForm
          id="reader-search"
          action="/admin/readers"
          query={query}
          label="Search readers"
          placeholder="Search name or email"
          hiddenParams={{ filter: filterParam }}
        />
      </div>

      {items.length > 0 ? (
        <ReaderList items={items} />
      ) : (
        <AdminEmptyState
          title={query ? "No readers match" : "No readers yet"}
          description={
            query
              ? "Try a different word, or clear the search."
              : "Readers appear here after they sign in with Google to comment."
          }
        />
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        basePath="/admin/readers"
        params={{ filter: filterParam, q: query }}
      />
    </section>
  );
}
