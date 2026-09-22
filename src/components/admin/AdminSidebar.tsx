import Link from "next/link";
import { GlobeAltIcon } from "@heroicons/react/24/outline";

import AdminNavLinks from "@/components/admin/AdminNavLinks";
import { SITE_FULL_NAME } from "@/lib/site";

export default function AdminSidebar() {
  return (
    <aside className="sticky top-0 w-64 h-screen shrink-0 flex flex-col gap-8 p-4 bg-surface border-r border-border overflow-y-auto">
      <div className="flex flex-col gap-1 px-3">
        <Link
          href="/admin"
          className="w-fit rounded-sm font-serif text-xl font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          {SITE_FULL_NAME}
        </Link>

        <p className="text-sm text-muted">Admin</p>
      </div>

      <nav aria-label="Admin sections" className="flex-1">
        <AdminNavLinks />
      </nav>

      <div className="pt-4 border-t border-border">
        <Link
          href="/"
          className="w-full flex items-center gap-3 p-3 rounded-lg text-sm text-muted transition-colors hover:bg-surface-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <GlobeAltIcon aria-hidden="true" className="w-5 h-5 shrink-0" />
          View website
        </Link>
      </div>
    </aside>
  );
}
