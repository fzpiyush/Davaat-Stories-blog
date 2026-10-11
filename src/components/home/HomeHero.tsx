import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/20/solid";

import ThemedArt, { type ThemedArtSet } from "@/components/shared/ThemedArt";

import heroDay from "@/assets/Hero_davaat.png";
import heroNight from "@/assets/Hero_davaat_night.png";
import heroDayPhone from "@/assets/Hero_mobile.png";
import heroNightPhone from "@/assets/Hero_mobile_night.png";

const HERO_ART: ThemedArtSet = {
  day: heroDay,
  night: heroNight,
  dayPhone: heroDayPhone,
  nightPhone: heroNightPhone,
};

export default function HomeHero() {
  return (
    <section
      aria-labelledby="home-hero-heading"
      className="w-full bg-background relative isolate overflow-hidden"
    >
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <ThemedArt
          art={HERO_ART}
          breakpoint="lg"
          imageClassName="object-cover object-top lg:object-[70%_center]"
        />

        {/* Blue ink mist behind the text, from the top on phones and from the left on wide screens */}
        <div className="bg-linear-to-b from-wash/80 via-wash/30 via-40% to-transparent to-60% absolute inset-0 lg:bg-linear-to-r lg:from-wash/75 lg:via-wash/30 lg:via-35% lg:to-transparent lg:to-55%" />

        <div className="h-24 bg-linear-to-t from-background to-transparent absolute inset-x-0 bottom-0" />
      </div>

      <div className="w-full max-w-7xl 2xl:max-w-360 min-h-[min(125vw,56rem)] lg:min-h-[min(calc(100svh-4rem),720px)] px-4 pt-28 pb-16 sm:px-6 sm:pt-32 lg:px-8 lg:py-24 mx-auto flex items-start lg:items-center">
        <div className="max-w-xl lg:max-w-lg xl:max-w-xl flex flex-col gap-5 sm:gap-6">
          <p className="flex items-center gap-3 text-xs font-medium uppercase tracking-[0.3em] text-accent">
            <span aria-hidden="true" className="w-8 h-px bg-accent" />
            Blogs &amp; Stories
          </p>

          <h1
            id="home-hero-heading"
            className="font-serif text-4xl sm:text-5xl lg:text-6xl xl:text-7xl leading-[1.08] tracking-tight text-balance text-foreground"
          >
            A quiet space for curious minds and better days.
          </h1>

          <p className="max-w-md text-base sm:text-lg leading-7 sm:leading-8 text-pretty text-foreground/85">
            Thoughts, experiences, and stories about technology, life, and
            everything in between, written one drop of ink at a time.
          </p>

          <div className="pt-2 sm:pt-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <Link
              href="/blogs"
              className="px-6 py-3 inline-flex items-center justify-center gap-2 text-sm font-medium text-accent-foreground bg-accent shadow-sm rounded-lg transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background group"
            >
              Read the latest
              <ArrowRightIcon
                aria-hidden="true"
                className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none"
              />
            </Link>

            <Link
              href="/stories"
              className="px-6 py-3 inline-flex items-center justify-center gap-2 text-sm font-medium text-foreground bg-surface/70 backdrop-blur-sm border border-border rounded-lg transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background group"
            >
              Explore stories
              <ArrowRightIcon
                aria-hidden="true"
                className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none"
              />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
