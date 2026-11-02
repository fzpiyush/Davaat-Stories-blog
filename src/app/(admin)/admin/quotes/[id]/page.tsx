import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircleIcon } from "@heroicons/react/20/solid";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";

import QuoteEditor from "@/components/admin/quotes/QuoteEditor";
import AdminPageHeader from "@/components/admin/ui/AdminPageHeader";
import BackLink from "@/components/admin/ui/BackLink";
import DangerZone from "@/components/admin/ui/DangerZone";
import StatusBadge from "@/components/admin/ui/StatusBadge";
import { toAdminInputValue } from "@/lib/admin/datetime";
import { firstParam } from "@/lib/admin/params";
import { deleteQuoteAction, saveQuote } from "@/lib/admin/quotes/actions";
import { buttonClass } from "@/lib/admin/ui";
import { requireAdmin } from "@/lib/auth/session";
import { getDisplayStatus } from "@/lib/content/status";
import { getQuoteForEditor } from "@/lib/db/quotes";
import { toQuoteTitle } from "@/lib/quotes/text";
import { idSchema } from "@/lib/validation/shared";

export const metadata: Metadata = {
  title: "Edit quote",
};

interface EditQuotePageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string | string[] }>;
}

export default async function EditQuotePage({
  params,
  searchParams,
}: EditQuotePageProps) {
  await requireAdmin();

  const { id } = await params;

  if (!idSchema.safeParse(id).success) {
    notFound();
  }

  const [quote, search] = await Promise.all([
    getQuoteForEditor(id),
    searchParams,
  ]);

  if (!quote) {
    notFound();
  }

  const displayStatus = getDisplayStatus(quote.status, quote.published_at);
  const justCreated = firstParam(search.created) === "1";

  return (
    <section className="w-full flex flex-col gap-8">
      <BackLink href="/admin/quotes">All quotes</BackLink>

      <AdminPageHeader title={toQuoteTitle(quote.text)}>
        <StatusBadge status={displayStatus} />

        {displayStatus === "published" && (
          <Link
            href={`/quotes?lang=${quote.lang}`}
            target="_blank"
            className={buttonClass.secondary}
          >
            <ArrowTopRightOnSquareIcon aria-hidden="true" className="w-4 h-4" />
            View on site
            <span className="sr-only">, opens in a new tab</span>
          </Link>
        )}
      </AdminPageHeader>

      {justCreated && (
        <p
          role="status"
          className="p-3 flex items-start gap-2 text-sm text-foreground bg-surface-muted border border-border rounded-lg"
        >
          <CheckCircleIcon
            aria-hidden="true"
            className="w-5 h-5 shrink-0 text-accent"
          />
          Quote created. Polish it, or publish when you&apos;re ready.
        </p>
      )}

      <QuoteEditor
        action={saveQuote.bind(null, quote.id)}
        initial={{
          text: quote.text,
          lang: quote.lang,
          translation: quote.translation,
          author: quote.author,
          status: quote.status,
          publishAt: toAdminInputValue(quote.published_at),
          featured: quote.is_featured,
        }}
        isNew={false}
      />

      <DangerZone
        title="Delete this quote"
        description="It disappears from the site right away. This can't be undone."
        action={deleteQuoteAction.bind(null, quote.id)}
        confirmMessage="Delete this quote? This can't be undone."
      />
    </section>
  );
}
