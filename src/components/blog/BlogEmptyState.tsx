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
    <div className="w-full max-w-2xl flex flex-col items-center gap-4 mx-auto px-6 py-16 bg-surface-muted rounded-lg text-center">
      <div className="w-12 h-12 flex items-center justify-center bg-background rounded-full text-accent">
        <PencilSquareIcon aria-hidden="true" className="w-6 h-6" />
      </div>

      <p className="pt-2 text-sm font-medium uppercase tracking-[0.2em] text-accent">
        {eyebrow}
      </p>

      <h2 className="text-balance font-serif text-3xl text-foreground">
        {title}
      </h2>

      <p className="max-w-md text-pretty text-sm leading-6 text-muted">
        {description}
      </p>

      {action && (
        <div className="pt-4">
          <Link
            href={action.href}
            className="inline-flex items-center gap-2 px-5 py-3 bg-accent rounded-lg text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface-muted group"
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
