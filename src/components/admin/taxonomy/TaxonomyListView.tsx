import TermForm from "@/components/admin/taxonomy/TermForm";
import TermList from "@/components/admin/taxonomy/TermList";
import AdminPageHeader from "@/components/admin/ui/AdminPageHeader";
import { saveTerm } from "@/lib/admin/taxonomy/actions";
import { TAXONOMY, type TaxonomyKind } from "@/lib/admin/taxonomy/config";
import { listTerms } from "@/lib/db/taxonomy";

interface TaxonomyListViewProps {
  kind: TaxonomyKind;
}

export default async function TaxonomyListView({
  kind,
}: TaxonomyListViewProps) {
  const config = TAXONOMY[kind];
  const terms = await listTerms(kind);

  return (
    <section className="w-full flex flex-col gap-8">
      <AdminPageHeader title={config.title} description={config.description} />

      <div className="w-full grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start">
        <div className="xl:order-last xl:sticky xl:top-24">
          <TermForm
            kind={kind}
            action={saveTerm.bind(null, kind, null)}
            heading={`New ${config.singular}`}
            submitLabel={`Add ${config.singular}`}
            pendingLabel="Adding"
          />
        </div>

        <TermList kind={kind} terms={terms} />
      </div>
    </section>
  );
}
