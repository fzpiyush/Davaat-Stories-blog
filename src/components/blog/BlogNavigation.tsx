import Link from "next/link";
import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/20/solid";

import type { Blog } from "@/lib/blog/mockBlogs";

type Direction = "previous" | "next";

type DirectionConfig = {
  label: string;
  action: string;
  Icon: typeof ArrowLeftIcon;
  iconClass: string;
  alignClass: string;
};

const directionConfig = {
  previous: {
    label: "Previous post",
    action: "Previous",
    Icon: ArrowLeftIcon,
    iconClass: "group-hover:-translate-x-1",
    alignClass: "",
  },
  next: {
    label: "Next post",
    action: "Next",
    Icon: ArrowRightIcon,
    iconClass: "group-hover:translate-x-1",
    alignClass: "sm:items-end sm:text-right",
  },
} satisfies Record<Direction, DirectionConfig>;

interface NavCardProps {
  blog: Blog;
  direction: Direction;
}

function NavCard({ blog, direction }: NavCardProps) {
  const { label, action, Icon, iconClass, alignClass } =
    directionConfig[direction];

  const icon = (
    <Icon
      aria-hidden="true"
      className={`w-4 h-4 transition-transform duration-200 motion-reduce:transition-none ${iconClass}`}
    />
  );

  return (
    <Link
      href={`/blogs/${blog.slug}`}
      className={`w-full h-full flex flex-col gap-3 ${alignClass} p-5 bg-surface-muted rounded-lg transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent group`}
    >
      <span className="text-xs font-medium uppercase tracking-[0.15em] text-muted">
        {label}
      </span>

      <span className="line-clamp-2 font-serif text-xl text-foreground">
        {blog.title}
      </span>

      <span
        aria-hidden="true"
        className="inline-flex items-center gap-1.5 pt-1 text-sm font-medium text-accent"
      >
        {direction === "previous" && icon}
        {action}
        {direction === "next" && icon}
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
  if (!previousBlog && !nextBlog) {
    return null;
  }

  return (
    <nav
      aria-label="Blog navigation"
      className="w-full grid gap-4 sm:grid-cols-2 mt-16 pt-8 border-t border-border"
    >
      {previousBlog ? (
        <NavCard blog={previousBlog} direction="previous" />
      ) : (
        <div aria-hidden="true" className="hidden sm:block" />
      )}

      {nextBlog ? (
        <NavCard blog={nextBlog} direction="next" />
      ) : (
        <div aria-hidden="true" className="hidden sm:block" />
      )}
    </nav>
  );
}
