export type NavItem = {
  label: string;
  href: string;
};

export const SITE_NAME = "DI World";
export const SITE_TAGLINE = "Thoughts. Blogs. Stories. A better you.";

export const mainNav = [
  { label: "Blogs", href: "/blogs" },
  { label: "Stories", href: "/stories" },
] as const satisfies readonly NavItem[];

export const footerNav = [
  { label: "Home", href: "/" },
  ...mainNav,
  { label: "About", href: "/about" },
] as const satisfies readonly NavItem[];

export const SITE_FULL_NAME = "Dawad Imagine World";
