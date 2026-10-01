"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { NavItem } from "@/lib/site";

type Orientation = "horizontal" | "vertical";

interface NavLinksProps {
  items: readonly NavItem[];
  orientation?: Orientation;
  onNavigate?: () => void;
}

const listClass: Record<Orientation, string> = {
  horizontal: "flex items-center gap-6 lg:gap-8",
  vertical: "flex flex-col gap-1",
};

const linkClass: Record<Orientation, string> = {
  horizontal:
    "py-1 text-sm text-muted rounded-sm relative transition-colors hover:text-foreground aria-[current=page]:font-medium aria-[current=page]:text-foreground after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:bg-accent after:scale-x-0 after:transition-transform after:duration-200 aria-[current=page]:after:scale-x-100 motion-reduce:after:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
  vertical:
    "w-full px-3 py-3 block text-base text-muted rounded-lg transition-colors hover:text-foreground hover:bg-surface-muted aria-[current=page]:font-medium aria-[current=page]:text-accent aria-[current=page]:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
};

function isActive(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function NavLinks({
  items,
  orientation = "horizontal",
  onNavigate,
}: NavLinksProps) {
  const pathname = usePathname();

  return (
    <ul className={listClass[orientation]}>
      {items.map((item) => {
        const active = isActive(pathname, item.href);

        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={linkClass[orientation]}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
