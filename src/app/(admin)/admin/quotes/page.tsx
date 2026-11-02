import type { Metadata } from "next";
import Link from "next/link";
import { PlusIcon } from "@heroicons/react/20/solid";

import QuoteList from "@/components/admin/quotes/QuoteList";
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
  getQuoteStatusCounts,
  listAdminQuotes,
  QUOTE_PAGE_SIZE,
} from "@/lib/db/quotes";

export const metadata: Metadata = {
  title: "Quotes",
};

interface QuotesAdminPageProps {
  searchParams: Promise<{
    status?: string | string[];
    q?: string | string[];
    page?: string | string[];
  }>;
}

export default async function QuotesAdminPage({
  searchParams,
}: QuotesAdminPageProps) {
  await requireAdmin();

  const params = await searchParams;
  const filter = parseStatusFilter(firstParam(params.status));
  const query = firstParam(params.q).trim().slice(0, 100);
  const page = parsePage(params.page);

  const [{ items, total }, counts] = await Promise.all([
    listAdminQuotes({ filter, query, page }),
    getQuoteStatusCounts(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / QUOTE_PAGE_SIZE));
  const statusParam = filter === "all" ? "" : filter;

  return (
    <section className="w-full flex flex-col gap-8">
      <AdminPageHeader
        title="Quotes"
        description="Write, schedule, and manage quotes and shayari in Hindi and English."
      >
        <Link href="/admin/quotes/new" className={buttonClass.primary}>
          <PlusIcon aria-hidden="true" className="w-4 h-4" />
          New quote
        </Link>
      </AdminPageHeader>

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <StatusTabs
          basePath="/admin/quotes"
          current={filter}
          counts={counts}
          query={query}
        />

        <SearchForm
          id="quote-search"
          action="/admin/quotes"
          query={query}
          label="Search quotes"
          placeholder="Search text or author"
          hiddenParams={{ status: statusParam }}
        />
      </div>

      {items.length > 0 ? (
        <QuoteList items={items} />
      ) : (
        <AdminEmptyState
          title={query ? "No quotes match" : "Nothing here yet"}
          description={
            query
              ? "Try a different word, or clear the search."
              : "Write your first quote or shayari, it saves as a draft until you publish."
          }
        >
          {!query && (
            <Link href="/admin/quotes/new" className={buttonClass.primary}>
              <PlusIcon aria-hidden="true" className="w-4 h-4" />
              New quote
            </Link>
          )}
        </AdminEmptyState>
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        basePath="/admin/quotes"
        params={{ status: statusParam, q: query }}
      />
    </section>
  );
}
