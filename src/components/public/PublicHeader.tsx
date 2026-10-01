import Link from "next/link";

import MobileMenu from "@/components/public/MobileMenu";
import NavLinks from "@/components/public/NavLinks";
import ThemeToggle from "@/components/shared/ThemeToggle";
import { mainNav, SITE_NAME } from "@/lib/site";

export default function PublicHeader() {
  return (
    <header className="w-full bg-background border-b border-border relative z-30">
      <div className="w-full max-w-7xl 2xl:max-w-360 h-16 px-4 sm:px-6 lg:px-8 mx-auto flex items-center justify-between gap-4 sm:gap-6">
        <Link
          href="/"
          className="font-serif text-lg sm:text-xl font-semibold text-foreground rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          {SITE_NAME}
        </Link>

        <div className="flex items-center gap-3 md:gap-6">
          <nav aria-label="Main" className="hidden md:flex items-center">
            <NavLinks items={mainNav} />
          </nav>

          <ThemeToggle />

          <MobileMenu items={mainNav} />
        </div>
      </div>
    </header>
  );
}
