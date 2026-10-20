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
      className="w-full px-4 pb-12 sm:px-6 sm:pb-16 lg:px-8"
    >
      {/* Same shell as the article, so from xl this starts at the text's left edge */}
      <div className="w-full max-w-274 mx-auto">
        <div className="w-full max-w-3xl mx-auto xl:mx-0 flex flex-col gap-6 sm:gap-8">
          <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-linear-to-br from-surface to-surface-muted border border-border rounded-lg">
            <p className="font-serif text-lg sm:text-xl text-foreground">
              {prompt}
            </p>
            <LikeButton kind={kind} targetId={targetId} label={likeLabel} />
          </div>

          <CommentsSection kind={kind} targetId={targetId} />
        </div>
      </div>
    </section>
  );
}
