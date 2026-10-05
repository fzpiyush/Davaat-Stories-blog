import type { EngagementKind } from "@/lib/engagement/types";

import CommentsSection from "./CommentsSection";
import LikeButton from "./LikeButton";

interface PostEngagementProps {
  kind: EngagementKind;
  targetId: string;
  likeLabel: string;
  prompt: string;
}

export default function PostEngagement({
  kind,
  targetId,
  likeLabel,
  prompt,
}: PostEngagementProps) {
  return (
    <section
      aria-label="Reactions and comments"
      className="w-full max-w-3xl px-4 pb-16 sm:px-6 sm:pb-20 lg:px-0 mx-auto flex flex-col gap-12"
    >
      <div className="py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-y border-border">
        <p className="font-serif text-lg sm:text-xl text-foreground">
          {prompt}
        </p>
        <LikeButton kind={kind} targetId={targetId} label={likeLabel} />
      </div>

      <CommentsSection kind={kind} targetId={targetId} />
    </section>
  );
}
