import { ArrowRightStartOnRectangleIcon } from "@heroicons/react/24/outline";

import AdminMobileNav from "@/components/admin/AdminMobileNav";
import AdminPageTitle from "@/components/admin/AdminPageTitle";
import ThemeToggle from "@/components/shared/ThemeToggle";
import { signOut } from "@/lib/auth/actions";

interface AdminHeaderProps {
  userName: string;
}

export default function AdminHeader({ userName }: AdminHeaderProps) {
  return (
    <header className="w-full h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3 sm:gap-4 bg-background border-b border-border sticky top-0 z-10">
      <div className="min-w-0 flex items-center gap-3">
        <AdminMobileNav />
        <AdminPageTitle />
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <p className="max-w-48 hidden md:block truncate text-sm text-muted">
          {userName}
        </p>

        <ThemeToggle />

        <form action={signOut}>
          <button
            type="submit"
            aria-label="Sign out"
            className="h-9 px-3 inline-flex items-center gap-2 text-sm text-muted rounded-lg transition-colors hover:bg-surface-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <ArrowRightStartOnRectangleIcon
              aria-hidden="true"
              className="w-5 h-5 shrink-0"
            />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </form>
      </div>
    </header>
  );
}
