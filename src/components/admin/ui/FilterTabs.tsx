import Link from "next/link";

export type FilterTab = {
  value: string;
  label: string;
  count: number;
};

interface FilterTabsProps {
  label: string;
  basePath: string;
  tabs: FilterTab[];
  current: string;
  defaultValue: string;
  query?: string;
}

function hrefFor(
  basePath: string,
  value: string,
  defaultValue: string,
  query: string,
): string {
  const search = new URLSearchParams();

  if (value !== defaultValue) {
    search.set("filter", value);
  }

  if (query) {
    search.set("q", query);
  }

  const queryString = search.toString();
  return queryString ? `${basePath}?${queryString}` : basePath;
}

export default function FilterTabs({
  label,
  basePath,
  tabs,
  current,
  defaultValue,
  query = "",
}: FilterTabsProps) {
  return (
    <nav aria-label={label}>
      <ul className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <li key={tab.value}>
            <Link
              href={hrefFor(basePath, tab.value, defaultValue, query)}
              aria-current={tab.value === current ? "page" : undefined}
              className="h-9 px-4 inline-flex items-center gap-2 text-sm font-medium text-muted bg-surface border border-border rounded-full transition-colors hover:text-foreground aria-[current=page]:text-accent-foreground aria-[current=page]:bg-accent aria-[current=page]:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              {tab.label}
              <span className="text-xs opacity-80">{tab.count}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
