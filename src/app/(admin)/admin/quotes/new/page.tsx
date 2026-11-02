import type { Metadata } from "next";

import QuoteEditor, {
  EMPTY_QUOTE,
} from "@/components/admin/quotes/QuoteEditor";
import AdminPageHeader from "@/components/admin/ui/AdminPageHeader";
import BackLink from "@/components/admin/ui/BackLink";
import { saveQuote } from "@/lib/admin/quotes/actions";
import { requireAdmin } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "New quote",
};

export default async function NewQuotePage() {
  await requireAdmin();

  return (
    <section className="w-full flex flex-col gap-8">
      <BackLink href="/admin/quotes">All quotes</BackLink>

      <AdminPageHeader
        title="New quote"
        description="It saves as a draft until you publish."
      />

      <QuoteEditor
        action={saveQuote.bind(null, null)}
        initial={EMPTY_QUOTE}
        isNew
      />
    </section>
  );
}
