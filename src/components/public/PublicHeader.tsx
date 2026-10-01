import Image from "next/image";
import Link from "next/link";

import MobileMenu from "@/components/public/MobileMenu";
import NavLinks from "@/components/public/NavLinks";
import ThemeToggle from "@/components/shared/ThemeToggle";
import { mainNav, SITE_NAME } from "@/lib/site";

import logoLight from "@/assets/Dark_Logo.png";
import logoDark from "@/assets/White_Logo.png";

export default function PublicHeader() {
  return (
    <header className="w-full bg-background border-b border-border relative z-30">
      <div className="w-full max-w-7xl 2xl:max-w-360 h-16 px-4 sm:px-6 lg:px-8 mx-auto flex items-center justify-between gap-4 sm:gap-6">
        <Link
          href="/"
          aria-label={SITE_NAME}
          className="relative block h-10 w-40 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <Image
            src={logoDark}
            alt=""
            fill
            sizes="160px"
            className="object-contain object-left block dark:hidden"
            priority
          />

          <Image
            src={logoLight}
            alt=""
            fill
            sizes="160px"
            className="object-contain object-left hidden dark:block"
            priority
          />
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
