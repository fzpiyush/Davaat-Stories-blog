"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { adminNav, isAdminNavActive } from "@/lib/admin/navigation";

export default function AdminNavLinks() {
  const pathname = usePathname();

  return (
    <ul className="flex flex-col gap-1">
      {adminNav.map(({ label, href, Icon }) => {
        const active = isAdminNavActive(pathname, href);

        return (
          <li key={href}>
            <Link
              href={href}
              aria-current={active ? "page" : undefined}
              className="w-full flex items-center gap-3 p-3 rounded-lg text-sm font-medium text-muted transition-colors hover:bg-surface-muted hover:text-foreground aria-[current=page]:bg-surface-muted aria-[current=page]:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent group"
            >
              <Icon
                aria-hidden="true"
                className="w-5 h-5 shrink-0 transition-colors group-aria-[current=page]:text-accent"
              />
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
