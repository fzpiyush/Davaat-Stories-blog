import type { QuoteLang } from "@/lib/db/types";
import type { PublicQuote } from "@/lib/quotes/types";

type QuoteVariant = "card" | "featured";

const figureClass: Record<QuoteVariant, string> = {
  card: "p-6 sm:p-8 flex flex-col gap-5 bg-surface border border-border rounded-lg transition-colors duration-200 hover:border-accent/50",
  featured:
    "w-full max-w-3xl px-6 py-10 sm:px-12 sm:py-14 mx-auto flex flex-col items-center gap-6 text-center bg-surface border border-border rounded-lg",
};

// Devanagari needs more room between lines than Latin letters
const textClass: Record<QuoteVariant, Record<QuoteLang, string>> = {
  card: {
    hi: "text-xl sm:text-2xl leading-[1.9] text-pretty",
    en: "text-lg sm:text-xl leading-[1.7] text-pretty",
  },
  featured: {
    hi: "text-2xl sm:text-3xl leading-[1.9] text-balance",
    en: "text-2xl sm:text-3xl leading-[1.6] text-balance",
  },
};

const translationClass: Record<QuoteVariant, string> = {
  card: "text-sm leading-6 italic whitespace-pre-line text-pretty text-muted",
  featured:
    "max-w-xl text-base leading-7 italic whitespace-pre-line text-pretty text-muted",
};

interface QuoteCardProps {
  quote: PublicQuote;
  variant?: QuoteVariant;
}

export default function QuoteCard({ quote, variant = "card" }: QuoteCardProps) {
  const translationLang: QuoteLang = quote.lang === "hi" ? "en" : "hi";

  return (
    <figure className={figureClass[variant]}>
      {variant === "featured" ? (
        <p className="flex items-center justify-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-accent">
          <span
            aria-hidden="true"
            className="w-1.5 h-1.5 bg-highlight rounded-full"
          />
          Featured
        </p>
      ) : (
        <span
          aria-hidden="true"
          className="h-6 font-serif text-5xl leading-none text-accent/50"
        >
          “
        </span>
      )}

      <blockquote lang={quote.lang}>
        <p
          className={`font-serif whitespace-pre-line text-foreground ${textClass[variant][quote.lang]}`}
        >
          {quote.text}
        </p>
      </blockquote>

      {quote.translation && (
        <p lang={translationLang} className={translationClass[variant]}>
          {quote.translation}
        </p>
      )}

      {quote.author && (
        <figcaption className="text-xs font-medium uppercase tracking-[0.15em] text-muted">
          {quote.author}
        </figcaption>
      )}
    </figure>
  );
}
