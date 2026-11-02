import type { ReactNode } from "react";

import HeroPattern from "@/components/public/HeroPattern";

interface TextHeroProps {
  id: string;
  eyebrow: string;
  title: string;
  description?: string;
  countLabel?: string;
  /** Extra content under the count, like filter chips */
  children?: ReactNode;
}

export default function TextHero({
  id,
  eyebrow,
  title,
  description,
  countLabel,
  children,
}: TextHeroProps) {
  return (
    <div className="w-full relative isolate overflow-hidden">
      <HeroPattern />

      <div className="w-full max-w-3xl px-4 pt-32 pb-4 sm:px-6 sm:pt-40 sm:pb-6 mx-auto flex flex-col items-center gap-5 text-center">
        <p className="flex items-center justify-center gap-2 text-sm font-medium uppercase tracking-[0.2em] text-accent">
          <span
            aria-hidden="true"
            className="w-1.5 h-1.5 bg-highlight rounded-full"
          />
          {eyebrow}
        </p>

        <h1
          id={id}
          className="font-serif text-4xl sm:text-5xl lg:text-6xl leading-[1.08] tracking-tight text-balance text-foreground"
        >
          {title}
        </h1>

        {description && (
          <p className="max-w-xl text-base sm:text-lg leading-7 sm:leading-8 text-pretty text-muted">
            {description}
          </p>
        )}

        <div
          aria-hidden="true"
          className="pt-2 flex items-center justify-center gap-3"
        >
          <span className="w-12 h-px bg-border" />
          <span className="w-1.5 h-1.5 bg-highlight rounded-full" />
          <span className="w-1.5 h-1.5 bg-highlight rounded-full" />
          <span className="w-1.5 h-1.5 bg-highlight rounded-full" />
          <span className="w-12 h-px bg-border" />
        </div>

        {countLabel && (
          <p className="px-3 py-1.5 text-xs font-medium uppercase tracking-[0.15em] text-muted bg-surface-muted rounded-full">
            {countLabel}
          </p>
        )}

        {children && <div className="pt-1">{children}</div>}
      </div>
    </div>
  );
}
