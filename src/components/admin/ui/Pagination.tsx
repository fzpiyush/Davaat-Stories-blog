import Link from "next/link";
import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/20/solid";

import { smallButtonClass } from "@/lib/admin/ui";

interface PaginationProps {
  page: number;
  totalPages: number;
  basePath: string;
  params?: Record<string, string>;
}

const disabledClass =
  "h-9 px-3 inline-flex items-center gap-1.5 text-sm font-medium text-muted border border-border rounded-lg opacity-50 cursor-not-allowed";

export default function Pagination({
  page,
  totalPages,
  basePath,
  params = {},
}: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  function hrefFor(target: number): string {
    const search = new URLSearchParams(
      Object.entries(params).filter(([, value]) => value),
    );

    if (target > 1) {
      search.set("page", String(target));
    }

    const query = search.toString();
    return query ? `${basePath}?${query}` : basePath;
  }

  return (
    <nav
      aria-label="Pagination"
      className="pt-2 flex items-center justify-between gap-4"
    >
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} className={smallButtonClass.secondary}>
          <ArrowLeftIcon aria-hidden="true" className="w-4 h-4" />
          Previous
        </Link>
      ) : (
        <span aria-disabled="true" className={disabledClass}>
          <ArrowLeftIcon aria-hidden="true" className="w-4 h-4" />
          Previous
        </span>
      )}

      <p className="text-sm text-muted">
        Page {page} of {totalPages}
      </p>

      {page < totalPages ? (
        <Link href={hrefFor(page + 1)} className={smallButtonClass.secondary}>
          Next
          <ArrowRightIcon aria-hidden="true" className="w-4 h-4" />
        </Link>
      ) : (
        <span aria-disabled="true" className={disabledClass}>
          Next
          <ArrowRightIcon aria-hidden="true" className="w-4 h-4" />
        </span>
      )}
    </nav>
  );
}
