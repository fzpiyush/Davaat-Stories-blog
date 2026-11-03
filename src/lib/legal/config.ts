import { SITE_NAME } from "@/lib/site";

/* Fill these in once. Both legal pages read from here */
export const LEGAL = {
  siteName: SITE_NAME,
  siteUrl: "https://davaat-stories-blog.vercel.app",
  // Your real full name, as the person responsible for the site
  ownerName: "Rahil Khan",
  // An inbox you actually check, it's also the grievance contact
  contactEmail: "davaatimagineworld@gmail.com",
  // The city whose courts handle disputes, for example "Jaipur, Rajasthan"
  jurisdiction: "Kota, Rajasthan",
  lastUpdated: "3 November 2026",
} as const;
