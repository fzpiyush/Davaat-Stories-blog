import Link from "next/link";
import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/20/solid";

interface PublicPaginationProps {
  page: number;
  totalPages: number;
  basePath: string;
}

const linkClass =
  "px-5 py-3 inline-flex items-center gap-2 text-sm font-medium text-foreground border border-border rounded-lg transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent group";

const disabledClass =
  "px-5 py-3 inline-flex items-center gap-2 text-sm font-medium text-muted border border-border rounded-lg opacity-50 cursor-not-allowed";

function hrefFor(basePath: string, page: number): string {
  return page > 1 ? `${basePath}?page=${page}` : basePath;
}

export default function PublicPagination({
  page,
  totalPages,
  basePath,
}: PublicPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav
      aria-label="Pagination"
      className="pt-4 flex items-center justify-between gap-4 border-t border-border"
    >
      {page > 1 ? (
        <Link href={hrefFor(basePath, page - 1)} className={linkClass}>
          <ArrowLeftIcon
            aria-hidden="true"
            className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1 motion-reduce:transition-none"
          />
          Newer
        </Link>
      ) : (
        <span aria-disabled="true" className={disabledClass}>
          <ArrowLeftIcon aria-hidden="true" className="w-4 h-4" />
          Newer
        </span>
      )}

      <p className="text-sm text-muted">
        Page {page} of {totalPages}
      </p>

      {page < totalPages ? (
        <Link href={hrefFor(basePath, page + 1)} className={linkClass}>
          Older
          <ArrowRightIcon
            aria-hidden="true"
            className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none"
          />
        </Link>
      ) : (
        <span aria-disabled="true" className={disabledClass}>
          Older
          <ArrowRightIcon aria-hidden="true" className="w-4 h-4" />
        </span>
      )}
    </nav>
  );
}