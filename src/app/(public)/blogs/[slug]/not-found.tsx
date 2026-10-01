import Link from "next/link";
import { ArrowRightIcon, HomeIcon } from "@heroicons/react/20/solid";
import { DocumentMagnifyingGlassIcon } from "@heroicons/react/24/outline";

export default function BlogNotFound() {
  return (
    <section
      aria-labelledby="not-found-heading"
      className="w-full min-h-[70vh] px-4 py-16 sm:px-6 sm:py-20 flex items-center justify-center"
    >
      <div className="w-full max-w-xl flex flex-col items-center gap-4 text-center">
        <div className="w-14 h-14 flex items-center justify-center text-accent bg-surface-muted rounded-full">
          <DocumentMagnifyingGlassIcon aria-hidden="true" className="w-7 h-7" />
        </div>

        <p className="pt-2 text-sm font-medium uppercase tracking-[0.2em] text-accent">
          404
        </p>

        <h1
          id="not-found-heading"
          className="font-serif text-3xl sm:text-4xl lg:text-5xl text-balance text-foreground"
        >
          This post doesn&apos;t exist.
        </h1>

        <p className="max-w-md pt-1 text-base leading-7 text-pretty text-muted">
          The article may have been moved, unpublished, or the link may be
          incorrect.
        </p>

        <div className="w-full sm:w-auto pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/blogs"
            className="w-full sm:w-auto px-5 py-3 inline-flex items-center justify-center gap-2 text-sm font-medium text-accent-foreground bg-accent rounded-lg transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 group"
          >
            Browse blogs
            <ArrowRightIcon
              aria-hidden="true"
              className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none"
            />
          </Link>

          <Link
            href="/"
            className="w-full sm:w-auto px-5 py-3 inline-flex items-center justify-center gap-2 text-sm font-medium text-foreground rounded-lg transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <HomeIcon aria-hidden="true" className="w-4 h-4" />
            Go home
          </Link>
        </div>
      </div>
    </section>
  );
}
