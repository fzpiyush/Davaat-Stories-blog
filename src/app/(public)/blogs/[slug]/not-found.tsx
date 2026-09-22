import Link from "next/link";
import { ArrowRightIcon, HomeIcon } from "@heroicons/react/20/solid";
import { DocumentMagnifyingGlassIcon } from "@heroicons/react/24/outline";

export default function BlogNotFound() {
  return (
    <section
      aria-labelledby="not-found-heading"
      className="w-full min-h-[70vh] flex items-center justify-center px-6 py-20"
    >
      <div className="w-full max-w-xl flex flex-col items-center gap-4 text-center">
        <div className="w-14 h-14 flex items-center justify-center bg-surface-muted rounded-full text-accent">
          <DocumentMagnifyingGlassIcon aria-hidden="true" className="w-7 h-7" />
        </div>

        <p className="pt-2 text-sm font-medium uppercase tracking-[0.2em] text-accent">
          404
        </p>

        <h1
          id="not-found-heading"
          className="text-balance font-serif text-4xl sm:text-5xl text-foreground"
        >
          This post doesn&apos;t exist.
        </h1>

        <p className="max-w-md pt-1 text-pretty text-base leading-7 text-muted">
          The article may have been moved, unpublished, or the link may be
          incorrect.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link
            href="/blogs"
            className="inline-flex items-center gap-2 px-5 py-3 bg-accent rounded-lg text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 group"
          >
            Browse blogs
            <ArrowRightIcon
              aria-hidden="true"
              className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none"
            />
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-medium text-foreground transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <HomeIcon aria-hidden="true" className="w-4 h-4" />
            Go home
          </Link>
        </div>
      </div>
    </section>
  );
}
