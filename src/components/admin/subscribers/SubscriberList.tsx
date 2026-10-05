import ConfirmActionButton from "@/components/admin/ui/ConfirmActionButton";
import { formatAdminDate } from "@/lib/admin/format";
import {
  deleteSubscriberAction,
  setSubscriberStatusAction,
} from "@/lib/admin/subscribers/actions";
import { smallButtonClass } from "@/lib/admin/ui";
import type { NewsletterSubscriberRow } from "@/lib/db/types";

const statusClass = {
  subscribed:
    "px-2.5 py-1 text-xs font-medium text-accent-foreground bg-accent rounded-full",
  unsubscribed:
    "px-2.5 py-1 text-xs font-medium text-muted bg-surface-muted rounded-full",
} as const;

interface SubscriberListProps {
  items: NewsletterSubscriberRow[];
}

export default function SubscriberList({ items }: SubscriberListProps) {
  return (
    <ul
      role="list"
      className="w-full bg-surface border border-border rounded-xl divide-y divide-border overflow-hidden"
    >
      {items.map((subscriber) => {
        const isSubscribed = subscriber.status === "subscribed";

        return (
          <li
            key={subscriber.id}
            className="p-4 sm:px-5 flex flex-col md:flex-row md:items-center gap-3"
          >
            <div className="min-w-0 flex flex-1 flex-col gap-1">
              <p className="truncate text-sm font-medium text-foreground">
                {subscriber.email}
              </p>

              <p className="text-xs text-muted">
                Subscribed {formatAdminDate(subscriber.subscribed_at)}
                {subscriber.unsubscribed_at &&
                  ` • Left ${formatAdminDate(subscriber.unsubscribed_at)}`}
              </p>
            </div>

            <span
              className={`w-fit shrink-0 ${statusClass[subscriber.status]}`}
            >
              {isSubscribed ? "Subscribed" : "Unsubscribed"}
            </span>

            <div className="flex shrink-0 flex-wrap items-start gap-2">
              <form
                action={setSubscriberStatusAction.bind(
                  null,
                  subscriber.id,
                  isSubscribed ? "unsubscribed" : "subscribed",
                )}
              >
                <button type="submit" className={smallButtonClass.secondary}>
                  {isSubscribed ? "Unsubscribe" : "Resubscribe"}
                </button>
              </form>

              <ConfirmActionButton
                action={deleteSubscriberAction.bind(null, subscriber.id)}
                label="Delete"
                pendingLabel="Deleting"
                size="small"
                confirmMessage={`Delete ${subscriber.email} completely? This can't be undone.`}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
