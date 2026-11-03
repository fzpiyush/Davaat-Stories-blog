import type { LegalSection } from "@/lib/legal/types";

const textClass =
  "text-base sm:text-lg leading-7 sm:leading-8 text-pretty text-foreground/85";

interface LegalDocumentProps {
  sections: readonly LegalSection[];
}

export default function LegalDocument({ sections }: LegalDocumentProps) {
  return (
    <div className="w-full max-w-3xl px-4 pt-10 pb-16 sm:px-6 sm:pt-14 lg:pb-24 mx-auto flex flex-col gap-12">
      <nav
        aria-label="On this page"
        className="p-5 sm:p-6 flex flex-col gap-4 bg-surface border border-border rounded-lg"
      >
        <p className="text-xs font-medium uppercase tracking-[0.15em] text-muted">
          On this page
        </p>

        <ol className="grid gap-x-6 gap-y-2 sm:grid-cols-2 text-sm list-decimal list-inside marker:text-muted">
          {sections.map((section) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                className="text-foreground rounded-sm transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                {section.heading}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      {sections.map((section, index) => (
        <section
          key={section.id}
          aria-labelledby={section.id}
          className="flex flex-col gap-4"
        >
          <h2
            id={section.id}
            className="font-serif text-2xl sm:text-3xl leading-tight text-balance text-foreground scroll-mt-24"
          >
            <span className="text-accent">{index + 1}.</span> {section.heading}
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
  );
}
