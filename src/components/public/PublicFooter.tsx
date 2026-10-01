import Link from "next/link";

import { footerNav, SITE_NAME, SITE_TAGLINE } from "@/lib/site";

export default function PublicFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-border">
      <div className="w-full max-w-7xl 2xl:max-w-360 px-4 py-10 sm:px-6 lg:px-8 mx-auto flex flex-col gap-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 sm:gap-8">
          <div className="flex flex-col gap-2">
            <Link
              href="/"
              className="w-fit font-serif text-2xl text-foreground rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              {SITE_NAME}
            </Link>

            <p className="text-sm text-muted">{SITE_TAGLINE}</p>
          </div>

          <nav aria-label="Footer">
            <ul className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted">
              {footerNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="rounded-sm transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <p className="pt-6 text-xs text-muted border-t border-border">
          © {currentYear} {SITE_NAME}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
