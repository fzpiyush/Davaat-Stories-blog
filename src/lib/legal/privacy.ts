import { LEGAL } from "@/lib/legal/config";
import type { LegalSection } from "@/lib/legal/types";

const { siteName, siteUrl, ownerName, contactEmail } = LEGAL;

export const PRIVACY_SECTIONS: readonly LegalSection[] = [
  {
    id: "who-we-are",
    heading: "Who we are",
    blocks: [
      `${siteName} (${siteUrl}) is a personal writing site run by ${ownerName}, an individual based in India. In this policy, "we", "us" and "our" mean the site and its owner, and "you" means anyone who visits it.`,
      "This policy explains what personal data the site handles, why, how long it is kept, and the rights you have. It is written to follow Indian law, including the Information Technology Act, 2000 and the Digital Personal Data Protection Act, 2023 and its rules as they come into force.",
    ],
  },
  {
    id: "what-we-collect",
    heading: "What we collect",
    blocks: [
      "When you simply read the site, we handle",
      {
        list: [
          "A random visitor ID saved in a cookie on your browser. We store only a one way scrambled version of it, called a hash, never the ID itself and never your IP address.",
          "Which blog posts and chapters were viewed on which day, linked to that scrambled ID, so each visitor counts once a day.",
          "Which posts and stories you liked, linked to the same scrambled ID, so a like counts once per browser.",
          "Your light or dark theme choice, saved only in your own browser.",
        ],
      },
      "When you sign in with Google, we receive",
      {
        list: [
          "Your Google account ID, name, email address and profile photo link, shared by Google only after you agree on Google's own screen.",
          "The time you last signed in, and a sign in session so you stay logged in.",
        ],
      },
      "We never receive or store your Google password.",
      "When you comment, we store the comment you write, when it was posted or edited, and which post or story it belongs to. Comments are public and appear with your name and profile photo.",
      "When you join the newsletter, we store your email address, whether you are subscribed, and when you joined or left.",
      "Our hosting and database providers may automatically log technical details such as IP address, browser type and request times to keep their services secure and working. Those logs are handled under their own privacy policies.",
      "We do not collect financial details, health information or government ID numbers, and we do not use advertising or third party tracking cookies.",
    ],
  },
  {
    id: "why-we-use-it",
    heading: "Why we use it",
    blocks: [
      {
        list: [
          "To show you the site and remember your theme.",
          "To count views and likes honestly, once per visitor.",
          "To let you sign in, comment, reply, and edit or delete your own comments.",
          "To keep conversations safe, including limiting how fast comments can be posted and blocking accounts that break the rules.",
          "To send the newsletter you asked for, once sending starts, and to stop when you unsubscribe.",
          "To keep the site secure, fix problems, and meet our legal duties.",
        ],
      },
      "We rely on your consent when you sign in or join the newsletter, and on uses the law allows for running and protecting the site. You can withdraw your consent at any time, as explained under Your rights.",
    ],
  },
  {
    id: "cookies",
    heading: "Cookies and browser storage",
    blocks: [
      "The site uses only the small set of cookies it needs to work.",
      {
        list: [
          "di_visitor lasts one year and holds a random ID used to count views and likes fairly. Only its hash is stored on our side.",
          "di_session lasts 30 days and keeps you signed in. Only its hash is stored on our side.",
          "di_oauth_state, di_oauth_verifier and di_oauth_next last a few minutes during Google sign in, to keep sign in safe and return you to the right page.",
          "Your theme choice is kept in your browser's local storage and is never sent to us.",
        ],
      },
      "You can clear or block cookies in your browser settings. Reading will still work, but signing in and fair like counts may not.",
    ],
  },
  {
    id: "sharing",
    heading: "Who we share it with",
    blocks: [
      "We never sell your personal data or share it for advertising. We only use these service providers to run the site",
      {
        list: [
          "Vercel, which hosts the site and delivers every page.",
          "Supabase, which stores the database and images.",
          "Google, which handles sign in when you choose to use it.",
        ],
      },
      "We may also share data if the law requires it, such as a valid request from a government authority, or when needed to protect the site and its readers from fraud or abuse.",
    ],
  },
  {
    id: "where-stored",
    heading: "Where your data is stored",
    blocks: [
      "Our database and images are stored with Supabase in its Mumbai, India region. Pages are delivered through Vercel's network, which may process requests on servers outside India. Google processes sign in under its own policies.",
    ],
  },
  {
    id: "retention",
    heading: "How long we keep it",
    blocks: [
      {
        list: [
          "Your account details stay while your account exists. Ask us and we will delete them.",
          "Sign in sessions end after 30 days, or sooner when you sign out.",
          "Comments stay until you delete them or we remove them. If a comment you delete has replies, its text is removed and a placeholder keeps the conversation readable.",
          "View and like records are kept as counts, linked only to scrambled IDs.",
          "Newsletter emails stay until you unsubscribe or ask us to delete them.",
        ],
      },
    ],
  },
  {
    id: "your-rights",
    heading: "Your rights",
    blocks: [
      "You can ask us to",
      {
        list: [
          "Give you a summary of the personal data we hold about you and how it is used.",
          "Correct or update it.",
          "Delete it, and withdraw any consent you gave, as easily as you gave it.",
          "Let someone you nominate use these rights for you if you pass away or are unable to act.",
          "Look into a complaint about how we handled your data.",
        ],
      },
      `To use any of these rights, email ${contactEmail} from the address linked to your account. We may ask a simple question to confirm it is really you. We will reply as soon as we can, and within the time limits set by law.`,
      "You can also delete your own comments at any time from the post or story where you wrote them.",
      "If you are not satisfied with our response, you can complain to the Data Protection Board of India.",
    ],
  },
  {
    id: "children",
    heading: "Children",
    blocks: [
      "Anyone can read the site. To sign in, comment or join the newsletter, you must be 18 or older. We do not knowingly collect personal data from children. If you believe a child has shared personal data here, contact us and we will delete it.",
    ],
  },
  {
    id: "security",
    heading: "How we protect it",
    blocks: [
      "Every page uses HTTPS, sign in sessions and visitor IDs are stored only in scrambled form, the admin area is limited to the site owner, and secret keys never reach your browser.",
      "No website can promise perfect security. If a breach ever affects your data, we will inform you and the authorities as the law requires.",
    ],
  },
  {
    id: "changes",
    heading: "Changes to this policy",
    blocks: [
      "When we change this policy, we update the date at the top. If a change is significant, we will also show a notice on the site before it takes effect.",
    ],
  },
  {
    id: "contact",
    heading: "Contact and grievances",
    blocks: [
      "For questions, requests or complaints about your data, contact the site owner, who also acts as the grievance officer.",
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
