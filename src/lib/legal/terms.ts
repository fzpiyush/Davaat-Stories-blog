import { LEGAL } from "@/lib/legal/config";
import type { LegalSection } from "@/lib/legal/types";

const { siteName, siteUrl, ownerName, contactEmail, jurisdiction } = LEGAL;

export const TERMS_SECTIONS: readonly LegalSection[] = [
  {
    id: "agreement",
    heading: "Agreeing to these terms",
    blocks: [
      `These Terms of Use are an agreement between you and ${ownerName}, who runs ${siteName} (${siteUrl}). By using the site, you agree to them. If you do not agree, please do not use the site.`,
      "Our Privacy Policy explains how we handle personal data and is part of these terms.",
    ],
  },
  {
    id: "who-can-use",
    heading: "Who can use the site",
    blocks: [
      "Anyone can read the site. You must be 18 or older to sign in, comment or join the newsletter. When you sign in, you confirm that the Google account you use is yours.",
    ],
  },
  {
    id: "accounts",
    heading: "Your account",
    blocks: [
      "You sign in with your Google account and are responsible for what happens under it, so please sign out on shared devices. We may block or remove any account that breaks these terms, with or without notice.",
    ],
  },
  {
    id: "our-content",
    heading: "Our writing and artwork",
    blocks: [
      `All blogs, stories, chapters, quotes, shayari, artwork and design on this site are created by ${ownerName} unless credited otherwise, and are protected by copyright. Quotes credited to other writers remain theirs.`,
      "You are welcome to",
      {
        list: [
          "Read and enjoy everything here.",
          "Share links to any page.",
          "Quote a short excerpt with clear credit and a link back to the original page.",
        ],
      },
      "You may not, without written permission",
      {
        list: [
          "Copy, republish, translate, sell or adapt whole posts, chapters, stories or collections of quotes.",
          "Remove credits or present the work as your own.",
          "Scrape the site or use its content to train artificial intelligence models.",
        ],
      },
    ],
  },
  {
    id: "your-comments",
    heading: "Your comments",
    blocks: [
      "You keep ownership of the comments you write. By posting one, you give us a free, worldwide permission to store, display and moderate it on this site. You are responsible for what you post.",
      "Comments must not include",
      {
        list: [
          "Hate, harassment, threats or abuse toward anyone.",
          "Sexual content, or anything harmful to children.",
          "Spam, advertising or unrelated promotional links.",
          "Someone else's personal information.",
          "Material you do not have the right to share, such as copyrighted text or images.",
          "Impersonation of another person.",
          "Anything illegal, or that encourages illegal acts.",
        ],
      },
      "We may hide or delete any comment and block any account at our discretion, including after the fact.",
    ],
  },
  {
    id: "fair-use",
    heading: "Using the site fairly",
    blocks: [
      {
        list: [
          "Do not try to break into, overload or disrupt the site.",
          "Do not fake or automate views, likes or comments.",
          "Do not get around blocks, limits or other safety measures.",
          "Do not use bots or scripts to collect data from the site.",
        ],
      },
    ],
  },
  {
    id: "newsletter",
    heading: "The newsletter",
    blocks: [
      "If you join the newsletter, your email is used only for the newsletter. Every email will include a way to unsubscribe, and you can also ask us to remove you at any time.",
    ],
  },
  {
    id: "reporting",
    heading: "Reporting a problem",
    blocks: [
      `To report a comment, a copyright concern or anything else that breaks these terms, email ${contactEmail} with a link to the content and a short explanation. For copyright claims, please include proof that you own the work. We review reports promptly and act within the time limits set by law.`,
    ],
  },
  {
    id: "disclaimers",
    heading: "Disclaimers",
    blocks: [
      "Blog posts share personal experiences and opinions for general information only. They are not professional, legal, financial or medical advice.",
      "Stories are fiction. Any resemblance to real people or events is a coincidence.",
      "The site is provided as it is. We work to keep it running smoothly, but we cannot promise it will always be available or free of errors.",
    ],
  },
  {
    id: "third-parties",
    heading: "Other websites and services",
    blocks: [
      "The site may link to other websites and uses Google for sign in. We do not control those services and are not responsible for their content or policies.",
    ],
  },
  {
    id: "liability",
    heading: "Limits of liability",
    blocks: [
      "To the fullest extent the law allows, we are not liable for indirect or unforeseeable losses from using the site, or for comments written by other readers. Nothing in these terms limits rights you have under law that cannot be limited.",
    ],
  },
  {
    id: "changes",
    heading: "Changes to these terms",
    blocks: [
      "We may update these terms from time to time. The date at the top shows the latest version, and significant changes will be announced on the site. Using the site after a change means you accept the updated terms.",
    ],
  },
  {
    id: "law",
    heading: "Governing law",
    blocks: [
      `These terms are governed by the laws of India. Any dispute will be handled by the courts at ${jurisdiction}.`,
    ],
  },
  {
    id: "contact",
    heading: "Contact",
    blocks: [
      {
        list: [
          `Name, ${ownerName}`,
          `Email, ${contactEmail}`,
          `Website, ${siteUrl}`,
        ],
      },
    ],
  },
];
