import type { Metadata } from "next";

import TaxonomyListView from "@/components/admin/taxonomy/TaxonomyListView";
import { requireAdmin } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Tags",
};

export default async function TagsPage() {
  await requireAdmin();

  return <TaxonomyListView kind="tags" />;
}
