"use client";

import { useEffect, useState } from "react";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/20/solid";
import { HeartIcon as HeartOutlineIcon } from "@heroicons/react/24/outline";

import { loadLikeState, toggleLike } from "@/lib/engagement/actions";
import type { EngagementKind, LikeState } from "@/lib/engagement/types";

const numberFormat = new Intl.NumberFormat("en-US");

interface LikeButtonProps {
  kind: EngagementKind;
  targetId: string;
  /** Read by screen readers, like "this post" */
  label: string;
}

export default function LikeButton({ kind, targetId, label }: LikeButtonProps) {
  const [state, setState] = useState<LikeState | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    loadLikeState({ kind, id: targetId }).then((result) => {
      if (active) {
        setState(result ?? { count: 0, liked: false });
      }
    });

    return () => {
      active = false;
    };
  }, [kind, targetId]);

  async function handleClick() {
    if (!state || isPending) {
      return;
    }

    const previous = state;
    setError("");
    setIsPending(true);

    // Updates instantly, then confirms with the server
    setState({
      count: previous.count + (previous.liked ? -1 : 1),
      liked: !previous.liked,
    });

    const result = await toggleLike({ kind, id: targetId });

    if (result.ok) {
      setState(result.state);
    } else {
      setState(previous);
      setError(result.message);
    }

    setIsPending(false);
  }

  const liked = state?.liked ?? false;

  return (
    <div className="flex flex-col items-start sm:items-end gap-1.5">
      <button
        type="button"
        onClick={handleClick}
        disabled={!state}
        aria-pressed={liked}
        aria-busy={isPending}
        className="h-11 px-5 inline-flex items-center gap-2 text-sm font-medium text-foreground bg-background border border-border rounded-full transition-colors hover:bg-surface-muted aria-pressed:text-accent aria-pressed:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-60 disabled:cursor-not-allowed group"
      >
        {liked ? (
          <HeartSolidIcon aria-hidden="true" className="w-5 h-5 text-accent" />
        ) : (
          <HeartOutlineIcon
            aria-hidden="true"
            className="w-5 h-5 transition-transform duration-200 group-hover:scale-110 motion-reduce:transition-none"
          />
        )}
        {liked ? "Liked" : "Like"}
        <span className="text-muted">
          {state ? numberFormat.format(state.count) : "–"}
        </span>
        <span className="sr-only">{label}</span>
      </button>

      {error && (
        <p role="alert" className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
