import Link from "next/link";
import { PencilSquareIcon } from "@heroicons/react/20/solid";

import AdminEmptyState from "@/components/admin/ui/AdminEmptyState";
import ConfirmActionButton from "@/components/admin/ui/ConfirmActionButton";
import { formatUsage } from "@/lib/admin/format";
import { deleteTermAction } from "@/lib/admin/taxonomy/actions";
import { TAXONOMY, type TaxonomyKind } from "@/lib/admin/taxonomy/config";
import { smallButtonClass } from "@/lib/admin/ui";
import type { Term } from "@/lib/db/taxonomy";

interface TermListProps {
  kind: TaxonomyKind;
  terms: Term[];
}

export default function TermList({ kind, terms }: TermListProps) {
  const config = TAXONOMY[kind];

  if (terms.length === 0) {
    return (
      <AdminEmptyState
        title={`No ${config.plural} yet`}
        description={`Add your first ${config.singular} using the form.`}
      />
    );
  }

  return (
    <ul
      role="list"
      className="w-full bg-surface border border-border rounded-xl divide-y divide-border overflow-hidden"
    >
      {terms.map((term) => {
        const usage = formatUsage(term.blog_count, term.story_count);
        const isUsed = term.blog_count + term.story_count > 0;

        return (
          <li
            key={term.id}
            className="p-4 sm:px-5 flex flex-col sm:flex-row sm:items-center gap-4"
          >
            <div className="min-w-0 flex flex-1 flex-col gap-1">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <p className="font-medium text-foreground">{term.name}</p>
                <span className="text-xs text-muted">/{term.slug}</span>
              </div>

              {term.description && (
                <p className="line-clamp-2 text-sm leading-6 text-muted">
                  {term.description}
                </p>
              )}
            </div>

            <span className="w-fit px-3 py-1 shrink-0 text-xs text-muted bg-surface-muted rounded-full">
              {usage}
            </span>

            <div className="flex shrink-0 items-start gap-2">
              <Link
                href={`${config.path}/${term.id}`}
                className={smallButtonClass.secondary}
              >
                <PencilSquareIcon aria-hidden="true" className="w-4 h-4" />
                Edit
              </Link>

              <ConfirmActionButton
                action={deleteTermAction.bind(null, kind, term.id)}
                label="Delete"
                pendingLabel="Deleting"
                confirmMessage={`Delete ${term.name}? This can't be undone.`}
                size="small"
                disabledReason={
                  isUsed ? `Used in ${usage}. Move those first.` : undefined
                }
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
