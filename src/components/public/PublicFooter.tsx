import Link from "next/link";

import { footerNav, SITE_NAME, SITE_TAGLINE } from "@/lib/site";

export default function PublicFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-border">
      <div className="w-full max-w-7xl flex flex-col gap-8 mx-auto px-6 py-10 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-8">
          <div className="flex flex-col gap-2">
            <Link
              href="/"
              className="w-fit rounded-sm font-serif text-2xl text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              {SITE_NAME}
            </Link>

            <p className="text-sm text-muted">{SITE_TAGLINE}</p>
          </div>

          <nav aria-label="Footer">
            <ul className="flex flex-wrap gap-6 text-sm text-muted">
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

        <p className="pt-6 border-t border-border text-xs text-muted">
          © {currentYear} {SITE_NAME}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
