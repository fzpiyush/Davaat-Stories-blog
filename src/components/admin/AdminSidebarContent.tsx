import Link from "next/link";
import { GlobeAltIcon } from "@heroicons/react/24/outline";

import AdminNavLinks from "@/components/admin/AdminNavLinks";
import { SITE_FULL_NAME } from "@/lib/site";

interface AdminSidebarContentProps {
  onNavigate?: () => void;
}

export default function AdminSidebarContent({
  onNavigate,
}: AdminSidebarContentProps) {
  return (
    <>
      <div className="px-3 flex flex-col gap-1">
        <Link
          href="/admin"
          onClick={onNavigate}
          className="w-fit font-serif text-xl font-semibold text-foreground rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          {SITE_FULL_NAME}
        </Link>

        <p className="text-sm text-muted">Admin</p>
      </div>

      <nav aria-label="Admin sections" className="flex-1">
        <AdminNavLinks onNavigate={onNavigate} />
      </nav>

      <div className="pt-4 border-t border-border">
        <Link
          href="/"
          onClick={onNavigate}
          className="w-full p-3 flex items-center gap-3 text-sm text-muted rounded-lg transition-colors hover:bg-surface-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <GlobeAltIcon aria-hidden="true" className="w-5 h-5 shrink-0" />
          View website
        </Link>
      </div>
    </>
  );
}
