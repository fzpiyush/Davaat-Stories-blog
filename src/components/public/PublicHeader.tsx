"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import AccountMenu from "@/components/public/AccountMenu";
import MobileMenu from "@/components/public/MobileMenu";
import NavLinks from "@/components/public/NavLinks";
import ThemeToggle from "@/components/shared/ThemeToggle";
import { mainNav, SITE_NAME } from "@/lib/site";

// Named by WHERE they're used, so they never get swapped again
import logoForLightTheme from "@/assets/Dark_Logo.png";
import logoForDarkTheme from "@/assets/White_Logo.png";

const SCROLL_THRESHOLD = 24;

export default function PublicHeader() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    let ticking = false;

    const update = () => {
      setIsScrolled(window.scrollY > SCROLL_THRESHOLD);
      ticking = false;
    };

    // Runs at most once per frame instead of on every scroll event
    const handleScroll = () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 z-30 w-full h-16 border-b text-foreground transition-[background-color,border-color,box-shadow] duration-300 ${
        isScrolled
          ? "bg-background/95 border-border shadow-sm backdrop-blur-md"
          : "bg-background/60 border-transparent backdrop-blur-sm"
      }`}
    >
      <div className="w-full max-w-7xl 2xl:max-w-360 h-16 px-4 sm:px-6 lg:px-8 mx-auto flex items-center justify-between gap-4 sm:gap-6">
        <Link
          href="/"
          aria-label={`${SITE_NAME} home`}
          className="flex items-center shrink-0 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          {/* Logo follows the THEME only, never the scroll */}
          <Image
            src={logoForDarkTheme}
            alt=""
            priority
            className="h-8 w-auto block dark:hidden"
          />
          <Image
            src={logoForLightTheme}
            alt=""
            priority
            className="h-8 w-auto hidden dark:block"
          />
        </Link>

        <div className="flex items-center gap-2 sm:gap-3 md:gap-6">
          <ThemeToggle />

          <nav aria-label="Main" className="hidden md:flex items-center">
            <NavLinks items={mainNav} />
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <MobileMenu items={mainNav} />
            <AccountMenu />
          </div>
        </div>
      </div>
    </header>
  );
}
