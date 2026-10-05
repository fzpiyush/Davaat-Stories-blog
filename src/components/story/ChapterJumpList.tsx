import Link from "next/link";
import { ChevronDownIcon, ListBulletIcon } from "@heroicons/react/20/solid";

import type { ChapterListItem } from "@/lib/story/types";

interface ChapterJumpListProps {
  storySlug: string;
  chapters: ChapterListItem[];
  currentNumber: number;
}

export default function ChapterJumpList({
  storySlug,
  chapters,
  currentNumber,
}: ChapterJumpListProps) {
  return (
    <details className="w-full group/details">
      <summary className="w-fit px-4 py-2 inline-flex items-center gap-2 text-sm font-medium text-foreground bg-surface-muted rounded-lg list-none cursor-pointer transition-colors hover:bg-surface [&::-webkit-details-marker]:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
        <ListBulletIcon aria-hidden="true" className="w-4 h-4 text-accent" />
        All chapters
        <ChevronDownIcon
          aria-hidden="true"
          className="w-4 h-4 transition-transform duration-200 group-open/details:rotate-180 motion-reduce:transition-none"
        />
      </summary>

      <ol className="w-full max-h-80 mt-3 p-2 flex flex-col bg-surface shadow-md rounded-lg overflow-y-auto">
        {chapters.map((chapter) => (
          <li key={chapter.id}>
            <Link
              href={`/stories/${storySlug}/${chapter.number}`}
              aria-current={
                chapter.number === currentNumber ? "page" : undefined
              }
              className="w-full px-3 py-2 flex items-baseline gap-3 text-sm text-muted rounded-md transition-colors hover:bg-surface-muted hover:text-foreground aria-[current=page]:font-medium aria-[current=page]:text-accent aria-[current=page]:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <span className="w-8 shrink-0 text-xs">{chapter.number}</span>
              <span className="line-clamp-1">{chapter.title}</span>
            </Link>
          </li>
        ))}
      </ol>
    </details>
  );
}
