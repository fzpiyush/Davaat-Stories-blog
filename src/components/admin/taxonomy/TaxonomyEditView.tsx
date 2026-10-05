import { notFound } from "next/navigation";

import TermForm from "@/components/admin/taxonomy/TermForm";
import AdminPageHeader from "@/components/admin/ui/AdminPageHeader";
import BackLink from "@/components/admin/ui/BackLink";
import ConfirmActionButton from "@/components/admin/ui/ConfirmActionButton";
import { formatUsage } from "@/lib/admin/format";
import { deleteTermAction, saveTerm } from "@/lib/admin/taxonomy/actions";
import { TAXONOMY, type TaxonomyKind } from "@/lib/admin/taxonomy/config";
import { getTerm } from "@/lib/db/taxonomy";
import { idSchema } from "@/lib/validation/shared";

interface TaxonomyEditViewProps {
  kind: TaxonomyKind;
  id: string;
}

export default async function TaxonomyEditView({
  kind,
  id,
}: TaxonomyEditViewProps) {
  if (!idSchema.safeParse(id).success) {
    notFound();
  }

  const term = await getTerm(kind, id);

  if (!term) {
    notFound();
  }

  const config = TAXONOMY[kind];
  const usage = formatUsage(term.blog_count, term.story_count);
  const isUsed = term.blog_count + term.story_count > 0;

  return (
    <section className="w-full max-w-2xl flex flex-col gap-8">
      <BackLink href={config.path}>All {config.plural}</BackLink>

      <AdminPageHeader
        title={term.name}
        description={
          isUsed ? `Used in ${usage}.` : "Not used in any blog or story yet."
        }
      />

      <TermForm
        kind={kind}
        action={saveTerm.bind(null, kind, term.id)}
        heading="Details"
        submitLabel="Save changes"
        pendingLabel="Saving"
        term={{
          name: term.name,
          slug: term.slug,
          description: term.description,
        }}
      />

      <section
        aria-labelledby="delete-term-heading"
        className="w-full p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-surface border border-red-600/20 rounded-xl"
      >
        <div className="flex flex-col gap-1">
          <h2
            id="delete-term-heading"
            className="text-base font-semibold text-foreground"
          >
            Delete this {config.singular}
          </h2>

          <p className="text-sm leading-6 text-muted">
            {isUsed
              ? `Move the ${usage} to another ${config.singular} first.`
              : "This can't be undone."}
          </p>
        </div>

        <ConfirmActionButton
          action={deleteTermAction.bind(null, kind, term.id)}
          label="Delete"
          pendingLabel="Deleting"
          confirmMessage={`Delete ${term.name}? This can't be undone.`}
          disabledReason={isUsed ? `Used in ${usage}` : undefined}
        />
      </section>
    </section>
  );
}
