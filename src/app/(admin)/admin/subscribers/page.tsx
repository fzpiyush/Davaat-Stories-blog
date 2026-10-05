import type { Metadata } from "next";
import { ArrowDownTrayIcon } from "@heroicons/react/20/solid";

import SubscriberList from "@/components/admin/subscribers/SubscriberList";
import AdminEmptyState from "@/components/admin/ui/AdminEmptyState";
import AdminPageHeader from "@/components/admin/ui/AdminPageHeader";
import FilterTabs from "@/components/admin/ui/FilterTabs";
import Pagination from "@/components/admin/ui/Pagination";
import SearchForm from "@/components/admin/ui/SearchForm";
import { parseChoice, parsePage, parseQuery } from "@/lib/admin/params";
import { buttonClass } from "@/lib/admin/ui";
import { requireAdmin } from "@/lib/auth/session";
import {
  getSubscriberCounts,
  listSubscribers,
  SUBSCRIBER_FILTERS,
  SUBSCRIBER_PAGE_SIZE,
} from "@/lib/db/subscribers";

export const metadata: Metadata = {
  title: "Subscribers",
};

interface SubscribersPageProps {
  searchParams: Promise<{
    filter?: string | string[];
    q?: string | string[];
    page?: string | string[];
  }>;
}

export default async function SubscribersPage({
  searchParams,
}: SubscribersPageProps) {
  await requireAdmin();

  const params = await searchParams;
  const filter = parseChoice(params.filter, SUBSCRIBER_FILTERS, "all");
  const query = parseQuery(params.q);
  const page = parsePage(params.page);

  const [{ items, total }, counts] = await Promise.all([
    listSubscribers({ filter, query, page }),
    getSubscriberCounts(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / SUBSCRIBER_PAGE_SIZE));
  const filterParam = filter === "all" ? "" : filter;

  return (
    <section className="w-full flex flex-col gap-8">
      <AdminPageHeader
        title="Subscribers"
        description="Everyone who signed up through the newsletter form on your site."
      >
        {/* A normal link, since a file download shouldn't go through the app router */}
        <a
          href={`/admin/subscribers/export?filter=${filter}`}
          download
          className={buttonClass.secondary}
        >
          <ArrowDownTrayIcon aria-hidden="true" className="w-4 h-4" />
          Export CSV
        </a>
      </AdminPageHeader>

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <FilterTabs
          label="Filter subscribers"
          basePath="/admin/subscribers"
          current={filter}
          defaultValue="all"
          query={query}
          tabs={[
            { value: "all", label: "All", count: counts.all },
            {
              value: "subscribed",
              label: "Subscribed",
              count: counts.subscribed,
            },
            {
              value: "unsubscribed",
              label: "Unsubscribed",
              count: counts.unsubscribed,
            },
          ]}
        />

        <SearchForm
          id="subscriber-search"
          action="/admin/subscribers"
          query={query}
          label="Search subscribers"
          placeholder="Search by email"
          hiddenParams={{ filter: filterParam }}
        />
      </div>

      {items.length > 0 ? (
        <SubscriberList items={items} />
      ) : (
        <AdminEmptyState
          title={query ? "No emails match" : "No subscribers yet"}
          description={
            query
              ? "Try a different search, or clear it."
              : "When someone signs up through the newsletter form, they'll appear here."
          }
        />
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        basePath="/admin/subscribers"
        params={{ filter: filterParam, q: query }}
      />
    </section>
  );
}
