import Link from "next/link";

import {
  STATUS_FILTER_LABEL,
  STATUS_FILTERS,
  type StatusFilter,
} from "@/lib/content/status";

interface StatusTabsProps {
  basePath: string;
  current: StatusFilter;
  counts: Record<StatusFilter, number>;
  query: string;
}

function hrefFor(
  basePath: string,
  filter: StatusFilter,
  query: string,
): string {
  const search = new URLSearchParams();

  if (filter !== "all") {
    search.set("status", filter);
  }

  if (query) {
    search.set("q", query);
  }

  const queryString = search.toString();
  return queryString ? `${basePath}?${queryString}` : basePath;
}

export default function StatusTabs({
  basePath,
  current,
  counts,
  query,
}: StatusTabsProps) {
  return (
    <nav aria-label="Filter by status">
      <ul className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((filter) => (
          <li key={filter}>
            <Link
              href={hrefFor(basePath, filter, query)}
              aria-current={filter === current ? "page" : undefined}
              className="h-9 px-4 inline-flex items-center gap-2 text-sm font-medium text-muted bg-surface border border-border rounded-full transition-colors hover:text-foreground aria-[current=page]:text-accent-foreground aria-[current=page]:bg-accent aria-[current=page]:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              {STATUS_FILTER_LABEL[filter]}
              <span className="text-xs opacity-80">{counts[filter]}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
