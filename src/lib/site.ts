export type NavItem = {
  label: string;
  href: string;
};

export const SITE_NAME = "Davaat Imagine World";
export const SITE_FULL_NAME = SITE_NAME;
export const SITE_TAGLINE = "Thoughts. Blogs. Stories. A better you.";
export const SITE_DESCRIPTION =
  "A quiet corner of the internet for blogs and stories about technology, life, and the small things that make days better.";

export const mainNav = [
  { label: "Stories", href: "/stories" },
  { label: "Blogs", href: "/blogs" },
  { label: "Quotes", href: "/quotes" },
] as const satisfies readonly NavItem[];

// About lives here, so it's one click away from every page
export const footerNav = [
  { label: "Home", href: "/" },
  ...mainNav,
  { label: "About", href: "/about" },
] as const satisfies readonly NavItem[];

// Small links in the footer's bottom bar, next to the copyright
export const legalNav = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
] as const satisfies readonly NavItem[];
