import type { SocialPlatform } from "@/lib/db/types";

export const MAX_SOCIAL_LINKS = 12;

export const SOCIAL_PLATFORMS = [
  "instagram",
  "x",
  "facebook",
  "youtube",
  "linkedin",
  "threads",
  "whatsapp",
  "website",
] as const satisfies readonly SocialPlatform[];

export const SOCIAL_PLATFORM_LABEL: Record<SocialPlatform, string> = {
  instagram: "Instagram",
  x: "X",
  facebook: "Facebook",
  youtube: "YouTube",
  linkedin: "LinkedIn",
  threads: "Threads",
  whatsapp: "WhatsApp",
  website: "Website",
};

export const SOCIAL_PLATFORM_PLACEHOLDER: Record<SocialPlatform, string> = {
  instagram: "https://instagram.com/yourname",
  x: "https://x.com/yourname",
  facebook: "https://facebook.com/yourpage",
  youtube: "https://youtube.com/@yourchannel",
  linkedin: "https://linkedin.com/in/yourname",
  threads: "https://threads.net/@yourname",
  whatsapp: "https://whatsapp.com/channel/yourchannel",
  website: "https://yoursite.com",
};
