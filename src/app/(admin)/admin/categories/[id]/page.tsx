import type { Metadata } from "next";

import TaxonomyEditView from "@/components/admin/taxonomy/TaxonomyEditView";
import { requireAdmin } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Edit category",
};

interface EditCategoryPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCategoryPage({
  params,
}: EditCategoryPageProps) {
  await requireAdmin();
  const { id } = await params;

  return <TaxonomyEditView kind="categories" id={id} />;
}
