import Link from "next/link";
import type { IconType } from "react-icons";
import { ArrowUpIcon } from "@heroicons/react/20/solid";
import {
  FaFacebookF,
  FaInstagram,
  FaXTwitter,
  FaYoutube,
} from "react-icons/fa6";

import {
  footerNav,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TAGLINE,
  socialLinks,
  type SocialPlatform,
} from "@/lib/site";

const socialIcons: Record<SocialPlatform, IconType> = {
  facebook: FaFacebookF,
  instagram: FaInstagram,
  x: FaXTwitter,
  youtube: FaYoutube,
};

const stayInTouch = [
  { label: "Newsletter", href: "/#newsletter-heading" },
  { label: "Latest blogs", href: "/blogs" },
  { label: "New chapters", href: "/stories" },
];

const linkClass =
  "rounded-sm transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent";

const headingClass =
  "text-xs font-medium uppercase tracking-[0.2em] text-foreground";

export default function PublicFooter() {
  const currentYear = new Date().getFullYear();
  const activeSocials = socialLinks.filter((link) => link.href);

  return (
    <footer className="w-full bg-surface border-t border-border">
      <div className="w-full max-w-7xl 2xl:max-w-360 px-4 py-12 sm:px-6 sm:py-16 lg:px-8 mx-auto flex flex-col gap-10 sm:gap-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
          <div className="max-w-md sm:col-span-2 lg:col-span-1 flex flex-col gap-4">
            <Link
              href="/"
              className="w-fit font-serif text-2xl sm:text-3xl text-foreground rounded-sm transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              {SITE_NAME}
            </Link>

            <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
              {SITE_TAGLINE}
            </p>

            <p className="text-sm leading-6 text-pretty text-muted">
              {SITE_DESCRIPTION}
            </p>

            {activeSocials.length > 0 && (
              <ul
                aria-label="Follow along"
                className="pt-2 flex flex-wrap items-center gap-2"
              >
                {activeSocials.map(({ platform, label, href }) => {
                  const Icon = socialIcons[platform];

                  return (
                    <li key={platform}>
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={label}
                        aria-label={`${label}, opens in a new tab`}
                        className="w-10 h-10 flex items-center justify-center text-muted bg-background border border-border rounded-full transition-colors hover:text-accent-foreground hover:bg-accent hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
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
            className="w-fit inline-flex items-center gap-1.5 text-xs font-medium text-muted rounded-sm transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent group"
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
