import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/20/solid";

import heroImage from "@/assets/Serene Lakeside Ink-Wash Retreat.png";

export default function HomeHero() {
  return (
    <section
      aria-labelledby="home-hero-heading"
      className="w-full bg-background border-b border-border relative isolate overflow-hidden"
    >
      {/* Full width background image */}
      <div aria-hidden="true" className="w-full absolute inset-0 -z-10">
        <Image
          src={heroImage}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[70%_center]"
        />

        {/* Soft gradient for text readability */}
        <div
          className="
            w-full
            absolute
            inset-0
            bg-linear-to-b
            from-background/95
            via-background/75
            to-transparent
            lg:bg-linear-to-r
            lg:from-background/95
            lg:via-background/70
            lg:via-45%
            lg:to-transparent
          "
        />

        {/* Soft fade at the bottom */}
        <div className="h-24 bg-linear-to-t from-background/95 to-transparent absolute inset-x-0 bottom-0" />
      </div>

      <div className="w-full max-w-7xl 2xl:max-w-360 min-h-120 sm:min-h-140 lg:min-h-[min(calc(100svh-4rem),720px)] px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24 mx-auto flex items-center">
        <div className="max-w-xl lg:max-w-lg xl:max-w-xl flex flex-col gap-5 sm:gap-6">
          <p className="flex items-center gap-3 text-xs font-medium uppercase tracking-[0.3em] text-accent">
            <span
              aria-hidden="true"
              className="w-8 h-px bg-accent"
            />
            Blog & Story
          </p>

          <h1
            id="home-hero-heading"
            className="font-serif text-4xl sm:text-5xl lg:text-6xl xl:text-7xl leading-[1.08] tracking-tight text-balance text-foreground"
          >
            A space for curious minds and better days.
          </h1>

          <p className="max-w-md text-base sm:text-lg leading-7 sm:leading-8 text-pretty text-foreground/80">
            Thoughts, experiences, and stories about technology, life, and
            everything in between.
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
              className="px-6 py-3 inline-flex items-center justify-center gap-2 text-sm font-medium text-foreground bg-background/70 backdrop-blur-sm border border-border rounded-lg transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background group"
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