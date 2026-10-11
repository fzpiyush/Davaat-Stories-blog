import type { Metadata } from "next";

import AboutEditor from "@/components/admin/about/AboutEditor";
import AdminPageHeader from "@/components/admin/ui/AdminPageHeader";
import { saveAbout } from "@/lib/admin/about/actions";
import { toSectionDrafts } from "@/lib/admin/editor";
import { requireAdmin } from "@/lib/auth/session";
import { getAboutPage } from "@/lib/db/about";

export const metadata: Metadata = {
  title: "About page",
};

export default async function AboutAdminPage() {
  await requireAdmin();

  const about = await getAboutPage();

  return (
    <section className="w-full flex flex-col gap-8">
      <AdminPageHeader
        title="About page"
        description="Tell readers your story. Your name, photo, and short bio come from your profile."
      />

      <AboutEditor
        action={saveAbout}
        initial={{
          headline: about.headline,
          intro: about.intro,
          sections: toSectionDrafts(about.sections),
          showLatest: about.show_latest,
        }}
      />
    </section>
  );
}
