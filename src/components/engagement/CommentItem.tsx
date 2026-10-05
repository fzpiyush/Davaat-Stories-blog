"use client";

import Image from "next/image";
import { useState } from "react";

import { formatRelative } from "@/lib/comments/format";
import type { ActionResult, PublicComment } from "@/lib/engagement/types";

import CommentForm from "./CommentForm";

type Mode = "view" | "edit" | "reply";

const actionClass =
  "text-xs font-medium text-muted rounded-sm transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-60";

function Avatar({ comment }: { comment: PublicComment }) {
  if (!comment.author) {
    return (
      <div
        aria-hidden="true"
        className="w-9 h-9 shrink-0 bg-surface-muted rounded-full"
      />
    );
  }

  if (comment.author.avatarUrl) {
    return (
      <div className="w-9 h-9 shrink-0 bg-surface-muted rounded-full relative overflow-hidden">
        <Image
          src={comment.author.avatarUrl}
          alt=""
          fill
          sizes="36px"
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div
      aria-hidden="true"
      className="w-9 h-9 shrink-0 flex items-center justify-center font-serif text-sm text-accent bg-surface-muted rounded-full"
    >
      {comment.author.name.trim().charAt(0).toUpperCase() || "?"}
    </div>
  );
}

interface CommentItemProps {
  comment: PublicComment;
  canComment: boolean;
  onReply: (parentId: string, body: string) => Promise<ActionResult>;
  onEdit: (id: string, body: string) => Promise<ActionResult>;
  onDelete: (id: string) => Promise<ActionResult>;
}

export default function CommentItem({
  comment,
  canComment,
  onReply,
  onEdit,
  onDelete,
}: CommentItemProps) {
  const [mode, setMode] = useState<Mode>("view");
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  const isReply = Boolean(comment.parentId);
  const canReply = canComment && !isReply && !comment.isRemoved;

  async function handleDelete() {
    const hasReplies = comment.replies.length > 0;
    const message = hasReplies
      ? "Remove your comment? The replies will stay, with a note that it was removed."
      : "Delete your comment? This can't be undone.";

    if (!window.confirm(message)) {
      return;
    }

    setIsDeleting(true);
    setError("");

    const result = await onDelete(comment.id);

    if (!result.ok) {
      setError(result.message);
      setIsDeleting(false);
    }
  }

  return (
    <article
      id={`comment-${comment.id}`}
      className="flex items-start gap-3 scroll-mt-24"
    >
      <Avatar comment={comment} />

      <div className="min-w-0 flex flex-1 flex-col gap-2">
        {comment.isRemoved ? (
          <p className="pt-2 text-sm italic text-muted">
            This comment was removed.
          </p>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <p className="text-sm font-medium text-foreground">
                {comment.author?.name}
              </p>

              {comment.author?.isAuthor && (
                <span className="px-2 py-0.5 text-xs font-medium text-accent-foreground bg-accent rounded-full">
                  Author
                </span>
              )}

              <time dateTime={comment.createdAt} className="text-xs text-muted">
                {formatRelative(comment.createdAt)}
              </time>

              {comment.editedAt && (
                <span className="text-xs text-muted">• edited</span>
              )}
            </div>

            {mode === "edit" ? (
              <CommentForm
                label="Edit your comment"
                submitLabel="Save"
                placeholder="Edit your comment"
                initialBody={comment.body}
                autoFocus
                onSubmit={(body) => onEdit(comment.id, body)}
                onCancel={() => setMode("view")}
                onDone={() => setMode("view")}
              />
            ) : (
              <p className="text-sm sm:text-base leading-7 whitespace-pre-line break-words text-foreground/90">
                {comment.body}
              </p>
            )}

            {mode !== "edit" && (canReply || comment.isMine) && (
              <div className="flex flex-wrap items-center gap-4">
                {canReply && (
                  <button
                    type="button"
                    onClick={() => setMode(mode === "reply" ? "view" : "reply")}
                    aria-expanded={mode === "reply"}
                    className={actionClass}
                  >
                    Reply
                  </button>
                )}

                {comment.isMine && (
                  <>
                    <button
                      type="button"
                      onClick={() => setMode("edit")}
                      className={actionClass}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className={actionClass}
                    >
                      {isDeleting ? "Deleting" : "Delete"}
                    </button>
                  </>
                )}
              </div>
            )}

            {error && (
              <p role="alert" className="text-xs text-red-600">
                {error}
              </p>
            )}
          </>
        )}

        {mode === "reply" && (
          <div className="pt-2">
            <CommentForm
              label={`Reply to ${comment.author?.name ?? "this comment"}`}
              submitLabel="Reply"
              placeholder="Write a reply"
              autoFocus
              onSubmit={(body) => onReply(comment.id, body)}
              onCancel={() => setMode("view")}
              onDone={() => setMode("view")}
            />
          </div>
        )}

        {comment.replies.length > 0 && (
          <ol className="mt-3 pl-4 sm:pl-6 flex flex-col gap-6 border-l-2 border-border">
            {comment.replies.map((reply) => (
              <li key={reply.id}>
                <CommentItem
                  comment={reply}
                  canComment={canComment}
                  onReply={onReply}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              </li>
            ))}
          </ol>
        )}
      </div>
    </article>
  );
}
