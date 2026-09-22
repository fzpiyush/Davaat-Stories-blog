"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { NavItem } from "@/lib/site";

interface NavLinksProps {
  items: readonly NavItem[];
}

function isActive(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function NavLinks({ items }: NavLinksProps) {
  const pathname = usePathname();

  return (
    <ul className="flex items-center gap-6">
      {items.map((item) => {
        const active = isActive(pathname, item.href);

        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              className="relative py-1 rounded-sm text-sm text-muted transition-colors hover:text-foreground aria-[current=page]:font-medium aria-[current=page]:text-foreground after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:bg-accent after:scale-x-0 after:transition-transform after:duration-200 aria-[current=page]:after:scale-x-100 motion-reduce:after:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
