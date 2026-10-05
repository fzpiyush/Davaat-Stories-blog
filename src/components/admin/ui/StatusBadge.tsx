import { STATUS_LABEL, type DisplayStatus } from "@/lib/content/status";

const badgeClass: Record<DisplayStatus, string> = {
  published:
    "px-2.5 py-1 inline-flex items-center text-xs font-medium text-accent-foreground bg-accent rounded-full",
  scheduled:
    "px-2.5 py-1 inline-flex items-center text-xs font-medium text-accent bg-surface-muted rounded-full ring-1 ring-accent/40",
  draft:
    "px-2.5 py-1 inline-flex items-center text-xs font-medium text-muted bg-surface-muted rounded-full",
};

interface StatusBadgeProps {
  status: DisplayStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  return <span className={badgeClass[status]}>{STATUS_LABEL[status]}</span>;
}