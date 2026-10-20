"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRightEndOnRectangleIcon } from "@heroicons/react/20/solid";

import { buttonClass, smallButtonClass } from "@/lib/admin/ui";
import { pluralize } from "@/lib/admin/format";
import {
  createComment,
  deleteOwnComment,
  loadComments,
  updateComment,
} from "@/lib/comments/actions";
import { buildSignInHref } from "@/lib/engagement/signIn";
import type {
  ActionResult,
  CommentsPayload,
  EngagementKind,
} from "@/lib/engagement/types";

import CommentForm from "./CommentForm";
import CommentItem from "./CommentItem";

const LOAD_ERROR = "Comments couldn't load right now.";

interface CommentsSectionProps {
  kind: EngagementKind;
  targetId: string;
}

export default function CommentsSection({
  kind,
  targetId,
}: CommentsSectionProps) {
  const pathname = usePathname();
  const [payload, setPayload] = useState<CommentsPayload | null>(null);
  const [loadError, setLoadError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;

    loadComments({ kind, targetId })
      .then((data) => {
        if (!active) {
          return;
        }

        if (data) {
          setPayload(data);
          setLoadError("");
        } else {
          setLoadError(LOAD_ERROR);
        }
      })
      .catch(() => {
        if (active) {
          setLoadError(LOAD_ERROR);
        }
      });

    return () => {
      active = false;
    };
  }, [kind, targetId, reloadKey]);

  // Admin View links point at #comment-id, so scroll there once comments arrive
  useEffect(() => {
    if (!payload || !window.location.hash.startsWith("#comment-")) {
      return;
    }

    document
      .getElementById(window.location.hash.slice(1))
      ?.scrollIntoView({ block: "center" });
  }, [payload]);

  function refresh() {
    setReloadKey((key) => key + 1);
  }

  async function withRefresh(
    result: Promise<ActionResult>,
  ): Promise<ActionResult> {
    const outcome = await result;

    if (outcome.ok) {
      refresh();
    }

    return outcome;
  }

  const viewer = payload?.viewer ?? null;
  const canComment = Boolean(viewer && !viewer.isBlocked);

  return (
    <section
      id="comments"
      aria-labelledby="comments-heading"
      className="w-full p-5 sm:p-6 flex flex-col gap-6 bg-linear-to-br from-surface to-surface-muted rounded-lg scroll-mt-24"
    >
      <div className="flex items-baseline justify-between gap-4">
        <h2
          id="comments-heading"
          className="font-serif text-2xl sm:text-3xl text-foreground"
        >
          Comments
        </h2>

        {payload && (
          <p className="text-sm text-muted">
            {pluralize(payload.count, "comment")}
          </p>
        )}
      </div>

      {!payload && !loadError && (
        <div
          aria-busy="true"
          className="flex flex-col gap-3 animate-pulse motion-reduce:animate-none"
        >
          <p role="status" className="sr-only">
            Loading comments
          </p>
          <div
            aria-hidden="true"
            className="w-full h-24 bg-background/60 rounded-lg"
          />
          <div
            aria-hidden="true"
            className="w-2/3 h-4 bg-background/60 rounded-lg"
          />
        </div>
      )}

      {payload &&
        (canComment ? (
          <CommentForm
            label="Write a comment"
            submitLabel="Post comment"
            placeholder="Share a thought"
            onSubmit={(body) =>
              withRefresh(
                createComment({ kind, targetId, parentId: null, body }),
              )
            }
          />
        ) : viewer?.isBlocked ? (
          <p className="p-4 text-sm text-muted bg-background border border-border rounded-lg">
            Commenting is turned off for your account.
          </p>
        ) : (
          <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-background border border-border rounded-lg">
            <div className="flex flex-col gap-1">
              <p className="font-serif text-lg text-foreground">
                Join the conversation
              </p>
              <p className="text-sm text-muted">
                Sign in with Google to leave a comment.
              </p>
            </div>

            <a
              href={buildSignInHref(pathname, "#comments")}
              className={`${buttonClass.primary} w-fit`}
            >
              <ArrowRightEndOnRectangleIcon
                aria-hidden="true"
                className="w-4 h-4"
              />
              Sign in to comment
            </a>
          </div>
        ))}

      {loadError && (
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted">
          <p role="alert">{loadError}</p>
          <button
            type="button"
            onClick={refresh}
            className={smallButtonClass.secondary}
          >
            Try again
          </button>
        </div>
      )}

      {payload &&
        (payload.comments.length > 0 ? (
          <ol className="flex flex-col divide-y divide-border">
            {payload.comments.map((comment) => (
              <li key={comment.id} className="py-6 first:pt-0 last:pb-0">
                <CommentItem
                  comment={comment}
                  canComment={canComment}
                  onReply={(parentId, body) =>
                    withRefresh(
                      createComment({ kind, targetId, parentId, body }),
                    )
                  }
                  onEdit={(id, body) =>
                    withRefresh(updateComment({ id, body }))
                  }
                  onDelete={(id) => withRefresh(deleteOwnComment({ id }))}
                />
              </li>
            ))}
          </ol>
        ) : (
          <p className="py-4 text-center text-sm text-muted">
            No comments yet. Be the first to share a thought.
          </p>
        ))}
    </section>
  );
}
