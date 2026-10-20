import Image from "next/image";
import type { ReactNode } from "react";

import type { HeroArtImages } from "@/lib/content/heroArt";
import { textLang } from "@/lib/content/script";

type HeroTone = "blue" | "gold";

interface PageHeroProps {
  id?: string;
  eyebrow: string;
  title: string;
  description: string;
  countLabel?: string;
  art: HeroArtImages;
  tone?: HeroTone;
  children?: ReactNode;
}

/* Night only glows. Each page gets its own colour so they feel related but not identical */
const glowClass: Record<HeroTone, string> = {
  blue: "bg-[#3b4a8f]/25",
  gold: "bg-accent/15",
};

function HeroArt({ art }: { art: HeroArtImages }) {
  return (
    <div
      aria-hidden="true"
      className="w-full max-w-md aspect-square mx-auto relative lg:-my-6 xl:-my-8"
    >
      <div className="inset-[12%] absolute bg-accent/20 rounded-full blur-3xl hidden dark:block" />

      <Image
        src={art.night}
        alt=""
        fill
        priority
        sizes="(min-width: 1280px) 448px, 288px"
        className="object-contain [mask-image:radial-gradient(closest-side,black_72%,transparent_100%)] hidden dark:block"
      />

      {/* Multiply makes the white paper vanish into the page gradient */}
      <Image
        src={art.day}
        alt=""
        fill
        priority
        sizes="(min-width: 1280px) 448px, 288px"
        className="object-contain [mask-image:radial-gradient(closest-side,black_82%,transparent_100%)] mix-blend-multiply dark:hidden"
      />

      {/* Blur only, no colour, faded out by the mask so no box can show */}
      <div className="h-1/4 inset-x-0 bottom-0 absolute backdrop-blur-sm [mask-image:linear-gradient(to_top,black,transparent)]" />
    </div>
  );
}

export default function PageHero({
  id,
  eyebrow,
  title,
  description,
  countLabel,
  art,
  tone = "blue",
  children,
}: PageHeroProps) {
  return (
    <header className="w-full pt-28 pb-12 sm:pt-32 sm:pb-14 relative overflow-hidden">
      <div
        aria-hidden="true"
        className={`w-120 h-120 -top-48 -right-24 absolute rounded-full blur-3xl pointer-events-none hidden dark:block ${glowClass[tone]}`}
      />
      <div
        aria-hidden="true"
        className="w-80 h-80 -bottom-40 left-1/4 absolute bg-accent/5 rounded-full blur-3xl pointer-events-none hidden dark:block"
      />

      <div className="w-full max-w-7xl 2xl:max-w-360 px-4 sm:px-6 lg:px-8 mx-auto relative grid gap-10 items-center lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-12 xl:grid-cols-[minmax(0,1fr)_28rem]">
        <div className="flex flex-col gap-4 sm:gap-5">
          <p className="flex items-center gap-3 text-xs font-medium uppercase tracking-[0.2em] text-accent">
            <span aria-hidden="true" className="w-8 h-px bg-accent" />
            {eyebrow}
          </p>

          <h1
            id={id}
            lang={textLang(title)}
            className="max-w-3xl pb-2 -mb-2 font-serif text-4xl sm:text-5xl lg:text-6xl leading-[1.15] tracking-tight hi:leading-[1.4] hi:tracking-normal text-balance bg-linear-to-r from-foreground via-foreground to-accent bg-clip-text text-transparent"
          >
            {title}
          </h1>

          <p
            lang={textLang(description)}
            className="max-w-2xl text-lg leading-7 sm:leading-8 hi:sm:leading-9 text-pretty text-muted"
          >
            {description}
          </p>

          {countLabel && (
            <span className="w-fit px-3 py-1.5 text-xs font-medium text-foreground bg-linear-to-br from-surface to-surface-muted border border-border rounded-lg">
              {countLabel}
            </span>
          )}

          {children}
        </div>

        <div className="hidden lg:block">
          <HeroArt art={art} />
        </div>
      </div>
    </header>
  );
}
