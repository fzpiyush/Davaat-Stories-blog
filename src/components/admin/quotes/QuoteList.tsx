import Link from "next/link";
import { StarIcon } from "@heroicons/react/20/solid";
import {
  ArrowTopRightOnSquareIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";

import StatusBadge from "@/components/admin/ui/StatusBadge";
import { formatAdminDate, formatAdminDateTime } from "@/lib/admin/format";
import { smallButtonClass } from "@/lib/admin/ui";
import { getDisplayStatus, type DisplayStatus } from "@/lib/content/status";
import type { AdminQuoteListItem } from "@/lib/db/quotes";
import { QUOTE_LANG_LABEL } from "@/lib/quotes/text";

function getDateLabel(
  quote: AdminQuoteListItem,
  status: DisplayStatus,
): string {
  if (status === "scheduled" && quote.published_at) {
    return `Goes live ${formatAdminDateTime(quote.published_at)}`;
  }

  if (status === "published" && quote.published_at) {
    return `Published ${formatAdminDate(quote.published_at)}`;
  }

  return `Edited ${formatAdminDate(quote.updated_at)}`;
}

interface QuoteListProps {
  items: AdminQuoteListItem[];
}

export default function QuoteList({ items }: QuoteListProps) {
  const now = new Date();

  return (
    <ul
      role="list"
      className="w-full bg-surface border border-border rounded-xl divide-y divide-border overflow-hidden"
    >
      {items.map((quote) => {
        const status = getDisplayStatus(quote.status, quote.published_at, now);

        return (
          <li
            key={quote.id}
            className="p-4 sm:px-5 flex flex-col lg:flex-row lg:items-center gap-4"
          >
            <div className="min-w-0 flex flex-1 flex-col gap-2">
              <div className="flex flex-wrap items-start gap-2">
                <Link
                  href={`/admin/quotes/${quote.id}`}
                  lang={quote.lang}
                  className="line-clamp-2 font-serif whitespace-pre-line text-foreground rounded-sm transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  {quote.text.trim() || "Untitled quote"}
                </Link>

                {quote.is_featured && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-accent">
                    <StarIcon aria-hidden="true" className="w-3.5 h-3.5" />
                    Featured
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
                <StatusBadge status={status} />
                <span lang={quote.lang}>{QUOTE_LANG_LABEL[quote.lang]}</span>
                {quote.author && (
                  <>
                    <span aria-hidden="true">•</span>
                    <span>{quote.author}</span>
                  </>
                )}
                <span aria-hidden="true">•</span>
                <span>{getDateLabel(quote, status)}</span>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <Link
                href={`/admin/quotes/${quote.id}`}
                className={smallButtonClass.secondary}
              >
                <PencilSquareIcon aria-hidden="true" className="w-4 h-4" />
                Edit
              </Link>

              {status === "published" && (
                <Link
                  href={`/quotes?lang=${quote.lang}`}
                  target="_blank"
                  className={smallButtonClass.secondary}
                >
                  <ArrowTopRightOnSquareIcon
                    aria-hidden="true"
                    className="w-4 h-4"
                  />
                  View
                  <span className="sr-only">, opens in a new tab</span>
                </Link>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
