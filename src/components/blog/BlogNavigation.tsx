import Link from "next/link";
import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/20/solid";

import type { BlogSummary as Blog } from "@/lib/blog/types";
import { textLang } from "@/lib/content/script";

type Direction = "previous" | "next";

type DirectionConfig = {
  label: string;
  emptyTitle: string;
  Icon: typeof ArrowLeftIcon;
  iconClass: string;
};

const directionConfig = {
  previous: {
    label: "Previous post",
    emptyTitle: "You're at the very beginning",
    Icon: ArrowLeftIcon,
    iconClass: "group-hover:-translate-x-0.5",
  },
  next: {
    label: "Next post",
    emptyTitle: "You're all caught up",
    Icon: ArrowRightIcon,
    iconClass: "group-hover:translate-x-0.5",
  },
} satisfies Record<Direction, DirectionConfig>;

const baseClass =
  "w-full min-w-0 px-4 py-3 flex items-center gap-3 bg-linear-to-br from-surface to-surface-muted border border-border rounded-lg";

interface NavCardProps {
  blog?: Blog;
  direction: Direction;
}

function NavCard({ blog, direction }: NavCardProps) {
  const { label, emptyTitle, Icon, iconClass } = directionConfig[direction];
  const rowClass =
    direction === "next" ? "flex-row-reverse text-right" : "text-left";

  if (!blog) {
    return (
      <div
        aria-disabled="true"
        className={`${baseClass} ${rowClass} opacity-60 cursor-not-allowed`}
      >
        <span
          aria-hidden="true"
          className="w-9 h-9 shrink-0 flex items-center justify-center text-muted bg-background border border-border rounded-lg"
        >
          <Icon className="w-4 h-4" />
        </span>

        <span className="min-w-0 flex flex-col gap-0.5">
          <span className="text-xs font-medium uppercase tracking-[0.15em] text-muted">
            {label}
          </span>
          <span className="line-clamp-1 font-serif text-base text-foreground">
            {emptyTitle}
          </span>
        </span>
      </div>
    );
  }

  return (
    <Link
      href={`/blogs/${blog.slug}`}
      className={`${baseClass} ${rowClass} transition-colors duration-200 hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent group`}
    >
      <span
        aria-hidden="true"
        className="w-9 h-9 shrink-0 flex items-center justify-center text-accent-foreground bg-accent rounded-lg transition-opacity duration-200 group-hover:opacity-90"
      >
        <Icon
          className={`w-4 h-4 transition-transform duration-200 motion-reduce:transition-none ${iconClass}`}
        />
      </span>

      <span className="min-w-0 flex flex-col gap-0.5">
        <span className="text-xs font-medium uppercase tracking-[0.15em] text-muted">
          {label}
        </span>
        <span
          lang={textLang(blog.title)}
          className="line-clamp-1 font-serif text-base hi:leading-[1.5] text-foreground transition-colors duration-200 group-hover:text-accent"
        >
          {blog.title}
        </span>
      </span>
    </Link>
  );
}

interface BlogNavigationProps {
  previousBlog?: Blog;
  nextBlog?: Blog;
}

export default function BlogNavigation({
  previousBlog,
  nextBlog,
}: BlogNavigationProps) {
  return (
    <nav
      aria-label="Blog navigation"
      className="w-full pt-6 grid gap-3 sm:grid-cols-2 sm:gap-4 border-t border-border"
    >
      <NavCard blog={previousBlog} direction="previous" />
      <NavCard blog={nextBlog} direction="next" />
    </nav>
  );
}
