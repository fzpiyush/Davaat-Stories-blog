import type { Metadata } from "next";

import TaxonomyEditView from "@/components/admin/taxonomy/TaxonomyEditView";
import { requireAdmin } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Edit tag",
};

interface EditTagPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditTagPage({ params }: EditTagPageProps) {
  await requireAdmin();
  const { id } = await params;

  return <TaxonomyEditView kind="tags" id={id} />;
}
