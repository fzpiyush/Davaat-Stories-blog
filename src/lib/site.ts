export type NavItem = {
  label: string;
  href: string;
};

export type SocialPlatform = "facebook" | "instagram" | "x" | "youtube";

export type SocialLink = {
  platform: SocialPlatform;
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
] as const satisfies readonly NavItem[];

export const footerNav = [
  { label: "Home", href: "/" },
  ...mainNav,
  { label: "About", href: "/about" },
] as const satisfies readonly NavItem[];

// Paste your full profile links here. Empty ones stay hidden in the footer.
export const socialLinks: readonly SocialLink[] = [
  {
    platform: "facebook",
    label: "Facebook",
    href: "https://facebook.com/yourpage",
  },
  {
    platform: "instagram",
    label: "Instagram",
    href: "https://instagram.com/yourname",
  },
  { platform: "x", label: "X", href: "https://x.com/yourname" },
  {
    platform: "youtube",
    label: "YouTube",
    href: "https://youtube.com/@yourchannel",
  },
];
