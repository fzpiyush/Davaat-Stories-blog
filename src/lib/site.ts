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
  { label: "Blogs", href: "/blogs" },
  { label: "Stories", href: "/stories" },
  { label: "About", href: "/about" },
] as const satisfies readonly NavItem[];

export const footerNav = [
  { label: "Home", href: "/" },
  ...mainNav,
] as const satisfies readonly NavItem[];
