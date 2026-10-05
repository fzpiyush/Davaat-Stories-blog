import type { Metadata } from "next";

import ProfileEditor from "@/components/admin/profile/ProfileEditor";
import AdminPageHeader from "@/components/admin/ui/AdminPageHeader";
import { saveProfile } from "@/lib/admin/profile/actions";
import { requireAdmin } from "@/lib/auth/session";
import { getAuthorProfile } from "@/lib/db/authors";
import { slugify } from "@/lib/utils/slugify";

export const metadata: Metadata = {
  title: "Profile",
};

export default async function ProfilePage() {
  const { user } = await requireAdmin();
  const profile = await getAuthorProfile();

  const fallbackName = user.name ?? user.email.split("@")[0];
  const author = profile?.author;

  return (
    <section className="w-full flex flex-col gap-8">
      <AdminPageHeader
        title="Your profile"
        description="This is how you appear to readers, on every blog and story."
      />

      <ProfileEditor
        action={saveProfile}
        initial={{
          name: author?.name ?? fallbackName,
          slug: author?.slug ?? slugify(fallbackName),
          bio: author?.bio ?? "",
          avatar: profile?.avatar
            ? {
                id: profile.avatar.id,
                url: profile.avatar.url,
                alt: profile.avatar.alt_text,
              }
            : null,
          websiteUrl: author?.website_url ?? "",
          instagramUrl: author?.instagram_url ?? "",
          xUrl: author?.x_url ?? "",
          linkedinUrl: author?.linkedin_url ?? "",
        }}
      />
    </section>
  );
}
