import ConfirmActionButton from "@/components/admin/ui/ConfirmActionButton";
import type { ActionState } from "@/lib/admin/actionState";

interface DangerZoneProps {
  title: string;
  description: string;
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  confirmMessage: string;
  label?: string;
  disabledReason?: string;
}

export default function DangerZone({
  title,
  description,
  action,
  confirmMessage,
  label = "Delete",
  disabledReason,
}: DangerZoneProps) {
  return (
    <section
      aria-label={title}
      className="w-full p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-surface border border-red-600/20 rounded-xl"
    >
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        <p className="max-w-xl text-sm leading-6 text-muted">{description}</p>
      </div>

      <ConfirmActionButton
        action={action}
        label={label}
        pendingLabel="Deleting"
        confirmMessage={confirmMessage}
        disabledReason={disabledReason}
      />
    </section>
  );
}
