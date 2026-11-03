import Link from "next/link";
import { ArrowRightIcon, ChevronDownIcon } from "@heroicons/react/20/solid";

import HeroPattern from "@/components/public/HeroPattern";
import { LEGAL } from "@/lib/legal/config";
import type { LegalSection } from "@/lib/legal/types";

const textClass = "text-base leading-8 text-pretty text-foreground/85";

const tocLinkClass =
  "py-1 flex items-start gap-2 text-sm leading-6 text-muted rounded-sm transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent";

interface TocListProps {
  sections: readonly LegalSection[];
}

function TocList({ sections }: TocListProps) {
  return (
    <ol className="flex flex-col">
      {sections.map((section, index) => (
        <li key={section.id}>
          <a href={`#${section.id}`} className={tocLinkClass}>
            <span className="w-5 shrink-0 tabular-nums text-accent">
              {index + 1}
            </span>
            <span>{section.heading}</span>
          </a>
        </li>
      ))}
    </ol>
  );
}

interface LegalPageProps {
  id: string;
  title: string;
  description: string;
  sections: readonly LegalSection[];
  /** The other legal page, linked from the header */
  related: { label: string; href: string };
}

export default function LegalPage({
  id,
  title,
  description,
  sections,
  related,
}: LegalPageProps) {
  return (
    <article aria-labelledby={id} className="w-full">
      <header className="w-full border-b border-border relative isolate overflow-hidden">
        <HeroPattern />

        <div className="w-full max-w-6xl px-4 pt-28 pb-10 sm:px-6 sm:pt-32 sm:pb-12 lg:px-8 mx-auto flex flex-col gap-4">
          <p className="flex items-center gap-2 text-sm font-medium uppercase tracking-[0.2em] text-accent">
            <span
              aria-hidden="true"
              className="w-1.5 h-1.5 bg-highlight rounded-full"
            />
            Legal
          </p>

          <h1
            id={id}
            className="font-serif text-4xl sm:text-5xl leading-[1.1] tracking-tight text-balance text-foreground"
          >
            {title}
          </h1>

          <p className="max-w-2xl text-base sm:text-lg leading-7 sm:leading-8 text-pretty text-muted">
            {description}
          </p>

          <div className="pt-1 flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="px-3 py-1.5 text-xs font-medium text-muted bg-surface-muted rounded-full">
              Updated {LEGAL.lastUpdated}
            </span>

            <Link
              href={related.href}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-accent rounded-sm transition-colors hover:text-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent group"
            >
              Read our {related.label}
              <ArrowRightIcon
                aria-hidden="true"
                className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none"
              />
            </Link>
          </div>
        </div>
      </header>

      <div className="w-full max-w-6xl px-4 pt-10 pb-16 sm:px-6 sm:pt-12 lg:px-8 lg:pb-24 mx-auto grid gap-10 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-16">
        <aside className="hidden lg:block lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto [scrollbar-width:thin]">
          <div className="flex flex-col gap-6">
            <nav aria-label="On this page" className="flex flex-col gap-3">
              <p className="text-xs font-medium uppercase tracking-[0.15em] text-foreground">
                On this page
              </p>

              <TocList sections={sections} />
            </nav>

            <div className="p-4 flex flex-col gap-1.5 bg-surface border border-border rounded-lg">
              <p className="text-sm font-medium text-foreground">Questions?</p>

              <p className="text-sm leading-6 text-muted">
                Write to{" "}
                <a
                  href={`mailto:${LEGAL.contactEmail}`}
                  className="break-all text-accent underline underline-offset-4 rounded-sm transition-colors hover:text-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  {LEGAL.contactEmail}
                </a>
              </p>
            </div>
          </div>
        </aside>

        <div className="min-w-0 max-w-3xl flex flex-col">
          {/* On smaller screens the index folds away so reading starts right away */}
          <details className="mb-8 bg-surface border border-border rounded-lg lg:hidden group">
            <summary className="px-4 py-3 flex items-center justify-between gap-3 text-sm font-medium text-foreground rounded-lg cursor-pointer list-none [&::-webkit-details-marker]:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
              On this page
              <ChevronDownIcon
                aria-hidden="true"
                className="w-4 h-4 text-muted transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none"
              />
            </summary>

            <nav aria-label="On this page" className="px-4 pb-4">
              <TocList sections={sections} />
            </nav>
          </details>

          {sections.map((section, index) => (
            <section
              key={section.id}
              aria-labelledby={section.id}
              className="py-8 first-of-type:pt-0 flex flex-col gap-4 border-t border-border first-of-type:border-t-0"
            >
              <h2
                id={section.id}
                className="font-serif text-xl sm:text-2xl leading-tight text-balance text-foreground scroll-mt-24"
              >
                <span className="mr-2 text-accent">{index + 1}.</span>
                {section.heading}
              </h2>

              {section.blocks.map((block, blockIndex) =>
                typeof block === "string" ? (
                  <p key={blockIndex} className={textClass}>
                    {block}
                  </p>
                ) : (
                  <ul
                    key={blockIndex}
                    className={`pl-5 flex flex-col gap-2 list-disc marker:text-accent ${textClass}`}
                  >
                    {block.list.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ),
              )}
            </section>
          ))}
        </div>
      </div>
    </article>
  );
}
