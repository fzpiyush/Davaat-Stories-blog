import Link from "next/link";
import {
  EyeIcon,
  EyeSlashIcon,
  NoSymbolIcon,
} from "@heroicons/react/20/solid";

import ConfirmActionButton from "@/components/admin/ui/ConfirmActionButton";
import UserAvatar from "@/components/admin/ui/UserAvatar";
import { deleteCommentAction, setCommentHiddenAction } from "@/lib/admin/comments/actions";
import { formatAdminDateTime, pluralize } from "@/lib/admin/format";
import { setReaderBlockedAction } from "@/lib/admin/readers/actions";
import { smallButtonClass } from "@/lib/admin/ui";
import type { AdminCommentItem } from "@/lib/db/comments";

const badgeClass = {
  hidden: "px-2 py-0.5 text-xs font-medium text-muted bg-surface-muted rounded-full",
  blocked: "px-2 py-0.5 text-xs font-medium text-red-600 bg-red-600/10 rounded-full",
  reply: "px-2 py-0.5 text-xs font-medium text-accent bg-surface-muted rounded-full",
  admin: "px-2 py-0.5 text-xs font-medium text-accent-foreground bg-accent rounded-full",
} as const;

function getTarget(comment: AdminCommentItem) {
  if (comment.blog_slug) {
    return {
      kind: "blog",
      title: comment.blog_title ?? "a blog",
      href: `/blogs/${comment.blog_slug}#comment-${comment.id}`,
    };
  }

  return {
    kind: "story",
    title: comment.story_title ?? "a story",
    href: `/stories/${comment.story_slug}#comment-${comment.id}`,
  };
}

interface CommentListProps {
  items: AdminCommentItem[];
}

export default function CommentList({ items }: CommentListProps) {
  return (
    <ul
      role="list"
      className="w-full bg-surface border border-border rounded-xl divide-y divide-border overflow-hidden"
    >
      {items.map((comment) => {
        const target = getTarget(comment);
        const isReader = comment.user_role === "reader";
        const name = comment.user_name ?? "Reader";

        return (
          <li key={comment.id} className="p-4 sm:px-5 flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div className="min-w-0 flex items-start gap-3">
                <UserAvatar name={comment.user_name} url={comment.user_avatar_url} />

                <div className="min-w-0 flex flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{name}</p>
                    {!isReader && <span className={badgeClass.admin}>You</span>}
                    {comment.parent_id && <span className={badgeClass.reply}>Reply</span>}
                    {comment.is_hidden && <span className={badgeClass.hidden}>Hidden</span>}
                    {comment.user_is_blocked && (
                      <span className={badgeClass.blocked}>Blocked</span>
                    )}
                  </div>

                  <p className="truncate text-xs text-muted">{comment.user_email}</p>
                </div>
              </div>

              <p className="shrink-0 text-xs text-muted">
                {formatAdminDateTime(comment.created_at)}
                {comment.edited_at && " • edited"}
              </p>
            </div>

            <p className="line-clamp-4 text-sm leading-6 whitespace-pre-line text-foreground">
              {comment.body}
            </p>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <p className="text-xs text-muted">
                On {target.kind}{" "}
                <Link
                  href={target.href}
                  target="_blank"
                  className="font-medium text-foreground underline underline-offset-4 rounded-sm transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  {target.title}
                  <span className="sr-only">, opens in a new tab</span>
                </Link>
                {comment.reply_count > 0 &&
                  ` • ${pluralize(comment.reply_count, "reply", "replies")}`}
              </p>

              <div className="flex flex-wrap items-start gap-2">
                <form action={setCommentHiddenAction.bind(null, comment.id, !comment.is_hidden)}>
                  <button type="submit" className={smallButtonClass.secondary}>
                    {comment.is_hidden ? (
                      <EyeIcon aria-hidden="true" className="w-4 h-4" />
                    ) : (
                      <EyeSlashIcon aria-hidden="true" className="w-4 h-4" />
                    )}
                    {comment.is_hidden ? "Show" : "Hide"}
                  </button>
                </form>

                {isReader && (
                  <form
                    action={setReaderBlockedAction.bind(
                      null,
                      comment.user_id,
                      !comment.user_is_blocked,
                    )}
                  >
                    <button type="submit" className={smallButtonClass.secondary}>
                      <NoSymbolIcon aria-hidden="true" className="w-4 h-4" />
                      {comment.user_is_blocked ? "Unblock reader" : "Block reader"}
                    </button>
                  </form>
                )}

                <ConfirmActionButton
                  action={deleteCommentAction.bind(null, comment.id)}
                  label="Delete"
                  pendingLabel="Deleting"
                  size="small"
                  confirmMessage={
                    comment.reply_count > 0
                      ? `Delete this comment and its ${pluralize(comment.reply_count, "reply", "replies")}? This can't be undone.`
                      : "Delete this comment? This can't be undone."
                  }
                />
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}