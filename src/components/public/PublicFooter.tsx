import Link from "next/link";
import { ArrowUpIcon } from "@heroicons/react/20/solid";

import { socialIcons } from "@/components/shared/socialIcons";
import { smallButtonClass } from "@/lib/admin/ui";
import { pageBackgroundClass } from "@/lib/content/pageBackground";
import {
  footerNav,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TAGLINE,
} from "@/lib/site";
import { getSocialLinks } from "@/lib/social/queries";

const stayInTouch = [
  { label: "Newsletter", href: "/#newsletter-heading" },
  { label: "Latest blogs", href: "/blogs" },
  { label: "New chapters", href: "/stories" },
];

const linkClass =
  "w-fit inline-block rounded-sm transition-all duration-200 hover:text-accent hover:translate-x-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent motion-reduce:transition-none";

const headingClass =
  "flex items-center gap-3 text-xs font-medium uppercase tracking-[0.2em] text-foreground";

function HeadingLine() {
  return <span aria-hidden="true" className="w-6 h-px bg-accent" />;
}

export default async function PublicFooter() {
  const currentYear = new Date().getFullYear();
  const socials = await getSocialLinks();

  return (
    <footer
      className={`w-full relative border-t border-border ${pageBackgroundClass}`}
    >
      <div
        aria-hidden="true"
        className="h-px inset-x-0 top-0 absolute bg-linear-to-r from-transparent via-accent/60 to-transparent"
      />

      <div className="w-full max-w-7xl 2xl:max-w-360 px-4 py-12 sm:px-6 sm:py-16 lg:px-8 mx-auto flex flex-col gap-10 sm:gap-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
          <div className="max-w-md sm:col-span-2 lg:col-span-1 flex flex-col gap-4">
            <Link
              href="/"
              className="w-fit font-serif text-2xl sm:text-3xl text-foreground rounded-sm transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              {SITE_NAME}
            </Link>

            <p className="flex items-center gap-3 text-xs font-medium uppercase tracking-[0.2em] text-accent">
              <HeadingLine />
              {SITE_TAGLINE}
            </p>

            <p className="text-sm leading-6 text-pretty text-muted">
              {SITE_DESCRIPTION}
            </p>

            {socials.length > 0 && (
              <ul
                aria-label="Follow along"
                className="pt-2 flex flex-wrap items-center gap-2"
              >
                {socials.map((link) => {
                  const Icon = socialIcons[link.platform];

                  return (
                    <li key={link.id}>
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={link.label}
                        aria-label={`${link.label}, opens in a new tab`}
                        className="w-10 h-10 flex items-center justify-center text-muted bg-linear-to-br from-surface to-surface-muted border border-border rounded-lg transition-colors hover:text-accent-foreground hover:bg-none hover:bg-accent hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                      >
                        <Icon aria-hidden="true" className="w-4 h-4" />
                      </a>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <nav
            aria-labelledby="footer-explore-heading"
            className="flex flex-col gap-4"
          >
            <h2 id="footer-explore-heading" className={headingClass}>
              <HeadingLine />
              Explore
            </h2>

            <ul className="flex flex-col gap-3 text-sm text-muted">
              {footerNav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={linkClass}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav
            aria-labelledby="footer-touch-heading"
            className="flex flex-col gap-4"
          >
            <h2 id="footer-touch-heading" className={headingClass}>
              <HeadingLine />
              Stay in touch
            </h2>

            <ul className="flex flex-col gap-3 text-sm text-muted">
              {stayInTouch.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={linkClass}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-border">
          <p className="text-xs text-muted">
            © {currentYear} {SITE_NAME}. All rights reserved.
          </p>

          <a
            href="#main-content"
            className={`${smallButtonClass.secondary} w-fit group`}
          >
            Back to top
            <ArrowUpIcon
              aria-hidden="true"
              className="w-3.5 h-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 motion-reduce:transition-none"
            />
          </a>
        </div>
      </div>
    </footer>
  );
}
