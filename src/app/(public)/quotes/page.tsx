import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import BlogEmptyState from "@/components/blog/BlogEmptyState";
import PublicPagination from "@/components/public/PublicPagination";
import TextHero from "@/components/public/TextHero";
import QuoteCard from "@/components/quote/QuoteCard";
import { parseChoice, parsePage } from "@/lib/admin/params";
import type { SearchParamValue } from "@/lib/content/filters";
import { pageBackgroundClass } from "@/lib/content/pageBackground";
import type { QuoteLang } from "@/lib/db/types";
import {
  getFeaturedQuote,
  getQuotesPage,
  QUOTES_PER_PAGE,
} from "@/lib/quotes/queries";
import { SITE_NAME } from "@/lib/site";

const LANG_VALUES: QuoteLang[] = ["hi", "en"];

const LANG_OPTIONS: {
  slug: QuoteLang | "";
  name: string;
  lang?: QuoteLang;
}[] = [
  { slug: "", name: "All" },
  { slug: "hi", name: "हिंदी", lang: "hi" },
  { slug: "en", name: "English" },
];

const chipBase =
  "px-3.5 py-1.5 inline-flex text-xs font-medium bg-surface border rounded-full transition-colors duration-200 hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent";

export const metadata: Metadata = {
  title: `Quotes & Shayari | ${SITE_NAME}`,
  description:
    "A small collection of quotes and shayari in Hindi and English, for quiet moments.",
};

interface QuotesPageProps {
  searchParams: Promise<{
    page?: SearchParamValue;
    lang?: SearchParamValue;
  }>;
}

export default async function QuotesPage({ searchParams }: QuotesPageProps) {
  const params = await searchParams;
  const page = parsePage(params.page);
  const lang = parseChoice<QuoteLang | "">(params.lang, LANG_VALUES, "");

  const [featured, { items, total }] = await Promise.all([
    getFeaturedQuote(lang),
    getQuotesPage({ page, lang }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / QUOTES_PER_PAGE));

  if (total > 0 && page > totalPages) {
    notFound();
  }

  const count = total + (featured ? 1 : 0);
  const showFeatured = Boolean(featured) && page === 1;

  return (
    <section
      aria-labelledby="quotes-heading"
      className={`w-full min-h-screen flex flex-col ${pageBackgroundClass}`}
    >
      <TextHero
        id="quotes-heading"
        eyebrow="Quotes & Shayari"
        title="Words that stay a little longer."
        description="A small collection of quotes and shayari in Hindi and English, for quiet moments and slow evenings."
        countLabel={`${count} ${count === 1 ? "quote" : "quotes"}`}
      >
        <nav aria-label="Filter by language">
          <ul
            role="list"
            className="flex flex-wrap items-center justify-center gap-2"
          >
            {LANG_OPTIONS.map((option) => (
              <li key={option.slug || "all"}>
                <Link
                  href={option.slug ? `/quotes?lang=${option.slug}` : "/quotes"}
                  lang={option.lang}
                  aria-current={lang === option.slug ? "page" : undefined}
                  className={`${chipBase} ${
                    lang === option.slug
                      ? "text-accent border-accent"
                      : "text-muted border-border"
                  }`}
                >
                  {option.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </TextHero>

      <div className="w-full max-w-7xl 2xl:max-w-360 px-4 pt-10 pb-16 sm:px-6 sm:pt-14 lg:px-8 lg:pb-24 mx-auto flex flex-col gap-12 sm:gap-16">
        {count === 0 ? (
          <BlogEmptyState
            eyebrow="Quotes"
            title={lang ? "Nothing in this language yet." : "No quotes yet."}
            description={
              lang
                ? "Try the other language, or see all quotes."
                : "New words are on their way. Check back soon."
            }
            action={null}
          />
        ) : (
          <>
            {showFeatured && featured && (
              <QuoteCard quote={featured} variant="featured" />
            )}

            {items.length > 0 && (
              <ul
                role="list"
                className="columns-1 md:columns-2 lg:columns-3 gap-6"
              >
                {items.map((quote) => (
                  <li key={quote.id} className="mb-6 break-inside-avoid">
                    <QuoteCard quote={quote} />
                  </li>
                ))}
              </ul>
            )}
          </>
        )}

        <PublicPagination
          page={page}
          totalPages={totalPages}
          basePath="/quotes"
          params={{ lang }}
        />
      </div>
    </section>
  );
}
