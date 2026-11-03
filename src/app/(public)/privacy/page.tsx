import type { Metadata } from "next";

import LegalPage from "@/components/public/LegalPage";
import { pageBackgroundClass } from "@/lib/content/pageBackground";
import { PRIVACY_SECTIONS } from "@/lib/legal/privacy";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: `Privacy Policy | ${SITE_NAME}`,
  description:
    "What this site collects, why, how long it is kept, and the rights you have over your data.",
};

export default function PrivacyPage() {
  return (
    <div className={`w-full min-h-screen ${pageBackgroundClass}`}>
      <LegalPage
        id="privacy-heading"
        title="Privacy Policy"
        description="What this site collects, why it needs it, and the choices you have. Written plainly, no fine print games."
        sections={PRIVACY_SECTIONS}
        related={{ label: "Terms of Use", href: "/terms" }}
      />
    </div>
  );
}
