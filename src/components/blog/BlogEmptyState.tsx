import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/20/solid";
import { PencilSquareIcon } from "@heroicons/react/24/outline";

type EmptyStateAction = {
  label: string;
  href: string;
};

interface BlogEmptyStateProps {
  eyebrow?: string;
  title?: string;
  description?: string;
  action?: EmptyStateAction | null;
}

export default function BlogEmptyState({
  eyebrow = "The blog",
  title = "Nothing here yet.",
  description = "New thoughts and stories will appear here when they are published.",
  action = { label: "Back home", href: "/" },
}: BlogEmptyStateProps) {
  return (
    <div className="w-full max-w-2xl px-6 py-12 sm:py-16 mx-auto flex flex-col items-center gap-4 text-center bg-surface-muted rounded-lg">
      <div className="w-12 h-12 flex items-center justify-center text-accent bg-background rounded-full">
        <PencilSquareIcon aria-hidden="true" className="w-6 h-6" />
      </div>

      <p className="pt-2 text-sm font-medium uppercase tracking-[0.2em] text-accent">
        {eyebrow}
      </p>

      <h2 className="font-serif text-2xl sm:text-3xl text-balance text-foreground">
        {title}
      </h2>

      <p className="max-w-md text-sm leading-6 text-pretty text-muted">
        {description}
      </p>

      {action && (
        <div className="pt-4">
          <Link
            href={action.href}
            className="px-5 py-3 inline-flex items-center gap-2 text-sm font-medium text-accent-foreground bg-accent rounded-lg transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface-muted group"
          >
            <ArrowLeftIcon
              aria-hidden="true"
              className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1 motion-reduce:transition-none"
            />
            {action.label}
          </Link>
        </div>
      )}
    </div>
  );
}
