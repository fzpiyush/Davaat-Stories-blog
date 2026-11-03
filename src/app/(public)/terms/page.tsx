import type { Metadata } from "next";

import LegalPage from "@/components/public/LegalPage";
import { pageBackgroundClass } from "@/lib/content/pageBackground";
import { TERMS_SECTIONS } from "@/lib/legal/terms";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: `Terms of Use | ${SITE_NAME}`,
  description:
    "The simple rules for reading, commenting and sharing on this site, and who owns what.",
};

export default function TermsPage() {
  return (
    <div className={`w-full min-h-screen ${pageBackgroundClass}`}>
      <LegalPage
        id="terms-heading"
        title="Terms of Use"
        description="The simple rules for reading, commenting and sharing here, and who owns what."
        sections={TERMS_SECTIONS}
        related={{ label: "Privacy Policy", href: "/privacy" }}
      />
    </div>
  );
}
