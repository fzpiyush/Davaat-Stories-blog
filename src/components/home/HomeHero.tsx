import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/20/solid";

import heroImage from "@/assets/HeroImage.png";

export default function HomeHero() {
  return (
    <section
      aria-labelledby="home-hero-heading"
      className="relative isolate bg-background border-b border-border overflow-hidden"
    >
      {/* Background image, bleeds to the right edge */}
      <div
        aria-hidden="true"
        className="absolute inset-y-0 right-0 -z-10 w-full lg:w-[62%]"
      >
        <Image
          src={heroImage}
          alt=""
          fill
          priority
          placeholder="blur"
          sizes="(min-width: 1024px) 62vw, 100vw"
          className="object-cover object-[70%_center]"
        />

        {/* Soft fade into the page on the left */}
        <div className="absolute inset-0 bg-linear-to-r from-background via-background/40 to-transparent" />

        {/* Gentle fade at the bottom */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-background to-transparent" />

        {/* Keeps text readable on mobile where the image sits behind it */}
        <div className="absolute inset-0 bg-background/70 lg:hidden" />
      </div>

      <div className="w-full max-w-7xl min-h-150 lg:min-h-170 flex items-center mx-auto px-6 py-24 lg:px-8">
        <div className="max-w-xl flex flex-col gap-6">
          <p className="flex items-center gap-3 text-xs font-medium uppercase tracking-[0.3em] text-accent">
            <span aria-hidden="true" className="w-8 h-px bg-accent" />
            Blog & Story
          </p>

          <h1
            id="home-hero-heading"
            className="text-balance font-serif text-5xl sm:text-6xl lg:text-7xl leading-[1.05] tracking-tight text-foreground"
          >
            A space for curious minds and better days.
          </h1>

          <p className="max-w-md text-pretty text-lg leading-8 text-muted">
            Thoughts, experiences, and stories about technology, life, and
            everything in between.
          </p>

          <div className="flex flex-wrap items-center gap-x-8 gap-y-4 pt-4">
            <Link
              href="/blogs"
              className="inline-flex items-center gap-2 px-6 py-3 bg-accent rounded-full text-sm font-medium text-accent-foreground shadow-sm transition hover:shadow-md hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background group"
            >
              Read the latest
              <ArrowRightIcon
                aria-hidden="true"
                className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none"
              />
            </Link>

            <Link
              href="/stories"
              className="inline-flex items-center gap-2 text-sm font-medium text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:underline group"
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
