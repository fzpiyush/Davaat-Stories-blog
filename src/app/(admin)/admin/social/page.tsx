import type { Metadata } from "next";

import SocialLinksEditor from "@/components/admin/social/SocialLinksEditor";
import AdminPageHeader from "@/components/admin/ui/AdminPageHeader";
import { saveSocialLinks } from "@/lib/admin/social/actions";
import { requireAdmin } from "@/lib/auth/session";
import { listSocialLinks } from "@/lib/db/socialLinks";

export const metadata: Metadata = {
  title: "Social links",
};

export default async function SocialLinksPage() {
  await requireAdmin();

  const links = await listSocialLinks();

  return (
    <section className="w-full flex flex-col gap-8">
      <AdminPageHeader
        title="Social links"
        description="Where readers can find you. Add, remove, and reorder them here."
      />

      <SocialLinksEditor
        action={saveSocialLinks}
        initial={links.map((link) => ({
          platform: link.platform,
          url: link.url,
        }))}
      />
    </section>
  );
}
