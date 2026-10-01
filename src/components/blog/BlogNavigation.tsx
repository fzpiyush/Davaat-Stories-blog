import Link from "next/link";
import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/20/solid";

import type { Blog } from "@/lib/blog/mockBlogs";

type Direction = "previous" | "next";

type DirectionConfig = {
  label: string;
  action: string;
  emptyTitle: string;
  emptyText: string;
  Icon: typeof ArrowLeftIcon;
  iconClass: string;
  alignClass: string;
};

const directionConfig = {
  previous: {
    label: "Previous post",
    action: "Previous",
    emptyTitle: "You're at the very beginning",
    emptyText: "There's no older post yet.",
    Icon: ArrowLeftIcon,
    iconClass: "group-hover:-translate-x-1",
    alignClass: "items-start text-left",
  },
  next: {
    label: "Next post",
    action: "Next",
    emptyTitle: "You're all caught up",
    emptyText: "Nothing newer yet. Check back soon.",
    Icon: ArrowRightIcon,
    iconClass: "group-hover:translate-x-1",
    alignClass: "items-start text-left sm:items-end sm:text-right",
  },
} satisfies Record<Direction, DirectionConfig>;

interface NavCardProps {
  blog?: Blog;
  direction: Direction;
}

function NavCard({ blog, direction }: NavCardProps) {
  const { label, action, emptyTitle, emptyText, Icon, iconClass, alignClass } =
    directionConfig[direction];

  const isDisabled = !blog;

  const icon = (
    <Icon
      aria-hidden="true"
      className={`w-4 h-4 transition-transform duration-200 motion-reduce:transition-none ${isDisabled ? "" : iconClass}`}
    />
  );

  const button = (
    <span
      aria-hidden="true"
      className={
        isDisabled
          ? "mt-auto px-4 py-2 inline-flex items-center gap-1.5 text-sm font-medium text-muted bg-background border border-border rounded-full"
          : "mt-auto px-4 py-2 inline-flex items-center gap-1.5 text-sm font-medium text-accent-foreground bg-accent rounded-full transition-opacity group-hover:opacity-90"
      }
    >
      {direction === "previous" && icon}
      {action}
      {direction === "next" && icon}
    </span>
  );

  if (isDisabled) {
    return (
      <div
        aria-disabled="true"
        className={`w-full h-full p-5 sm:p-6 flex flex-col gap-3 ${alignClass} bg-surface-muted rounded-lg opacity-60 cursor-not-allowed`}
      >
        <span className="text-xs font-medium uppercase tracking-[0.15em] text-muted">
          {label}
        </span>

        <span className="font-serif text-lg sm:text-xl text-foreground">
          {emptyTitle}
        </span>

        <span className="pb-2 text-sm text-muted">{emptyText}</span>

        {button}
      </div>
    );
  }

  return (
    <Link
      href={`/blogs/${blog.slug}`}
      className={`w-full h-full p-5 sm:p-6 flex flex-col gap-3 ${alignClass} bg-surface-muted rounded-lg transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent group`}
    >
      <span className="text-xs font-medium uppercase tracking-[0.15em] text-muted">
        {label}
      </span>

      <span className="pb-2 line-clamp-2 font-serif text-lg sm:text-xl text-foreground transition-colors duration-200 group-hover:text-accent">
        {blog.title}
      </span>

      {button}
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
      className="w-full pt-8 grid gap-4 sm:grid-cols-2 sm:gap-6 border-t border-border"
    >
      <NavCard blog={previousBlog} direction="previous" />
      <NavCard blog={nextBlog} direction="next" />
    </nav>
  );
}
