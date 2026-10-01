"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { adminNav, isAdminNavActive } from "@/lib/admin/navigation";

interface AdminNavLinksProps {
  onNavigate?: () => void;
}

export default function AdminNavLinks({ onNavigate }: AdminNavLinksProps) {
  const pathname = usePathname();

  return (
    <ul className="flex flex-col gap-1">
      {adminNav.map(({ label, href, Icon }) => {
        const active = isAdminNavActive(pathname, href);

        return (
          <li key={href}>
            <Link
              href={href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className="w-full p-3 flex items-center gap-3 text-sm font-medium text-muted rounded-lg transition-colors hover:bg-surface-muted hover:text-foreground aria-[current=page]:bg-surface-muted aria-[current=page]:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent group"
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
