import Link from "next/link";
import { ChatBubbleLeftIcon, NoSymbolIcon } from "@heroicons/react/20/solid";

import UserAvatar from "@/components/admin/ui/UserAvatar";
import { formatAdminDate, pluralize } from "@/lib/admin/format";
import { setReaderBlockedAction } from "@/lib/admin/readers/actions";
import { smallButtonClass } from "@/lib/admin/ui";
import type { ReaderItem } from "@/lib/db/readers";

interface ReaderListProps {
  items: ReaderItem[];
}

export default function ReaderList({ items }: ReaderListProps) {
  return (
    <ul
      role="list"
      className="w-full bg-surface border border-border rounded-xl divide-y divide-border overflow-hidden"
    >
      {items.map((reader) => (
        <li
          key={reader.id}
          className="p-4 sm:px-5 flex flex-col md:flex-row md:items-center gap-4"
        >
          <div className="min-w-0 flex flex-1 items-center gap-3">
            <UserAvatar
              name={reader.name}
              url={reader.avatar_url}
              size="medium"
            />

            <div className="min-w-0 flex flex-col gap-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-medium text-foreground">
                  {reader.name ?? "Reader"}
                </p>

                {reader.is_blocked && (
                  <span className="px-2 py-0.5 text-xs font-medium text-red-600 bg-red-600/10 rounded-full">
                    Blocked
                  </span>
                )}
              </div>

              <p className="truncate text-xs text-muted">{reader.email}</p>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
            <span>Joined {formatAdminDate(reader.created_at)}</span>
            {reader.last_login_at && (
              <span>Last seen {formatAdminDate(reader.last_login_at)}</span>
            )}
            <span>
              {pluralize(reader.comment_count, "comment")}
              {reader.hidden_count > 0 && `, ${reader.hidden_count} hidden`}
            </span>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {reader.comment_count > 0 && (
              <Link
                href={`/admin/comments?q=${encodeURIComponent(reader.email)}`}
                className={smallButtonClass.secondary}
              >
                <ChatBubbleLeftIcon aria-hidden="true" className="w-4 h-4" />
                Comments
              </Link>
            )}

            <form
              action={setReaderBlockedAction.bind(
                null,
                reader.id,
                !reader.is_blocked,
              )}
            >
              <button
                type="submit"
                className={
                  reader.is_blocked
                    ? smallButtonClass.secondary
                    : smallButtonClass.danger
                }
              >
                <NoSymbolIcon aria-hidden="true" className="w-4 h-4" />
                {reader.is_blocked ? "Unblock" : "Block"}
              </button>
            </form>
          </div>
        </li>
      ))}
    </ul>
  );
}
