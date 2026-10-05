import type { Metadata } from "next";

import TaxonomyListView from "@/components/admin/taxonomy/TaxonomyListView";
import { requireAdmin } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Categories",
};

export default async function CategoriesPage() {
  await requireAdmin();

  return <TaxonomyListView kind="categories" />;
}
