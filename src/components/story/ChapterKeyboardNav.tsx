"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface ChapterKeyboardNavProps {
  previousHref?: string;
  nextHref?: string;
}

export default function ChapterKeyboardNav({
  previousHref,
  nextHref,
}: ChapterKeyboardNavProps) {
  const router = useRouter();

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (
        event.defaultPrevented ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey
      ) {
        return;
      }

      const target = event.target as HTMLElement | null;

      if (
        target?.closest("input, textarea, select, [contenteditable='true']")
      ) {
        return;
      }

      if (event.key === "ArrowLeft" && previousHref) {
        router.push(previousHref);
      }

      if (event.key === "ArrowRight" && nextHref) {
        router.push(nextHref);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router, previousHref, nextHref]);

  return null;
}
