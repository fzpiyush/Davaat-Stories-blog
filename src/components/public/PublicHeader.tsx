import Link from "next/link";

import NavLinks from "@/components/public/NavLinks";
import ThemeToggle from "@/components/shared/ThemeToggle";
import { mainNav, SITE_NAME } from "@/lib/site";

export default function PublicHeader() {
  return (
    <header className="w-full bg-background border-b border-border">
      <div className="w-full max-w-7xl flex items-center justify-between gap-6 mx-auto px-6 py-4 lg:px-8">
        <Link
          href="/"
          className="rounded-sm font-serif text-xl font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          {SITE_NAME}
        </Link>

        <nav aria-label="Main" className="flex items-center gap-6">
          <NavLinks items={mainNav} />
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
