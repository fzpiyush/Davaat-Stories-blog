"use client";

import { useEffect, useRef } from "react";

import { recordView } from "@/lib/engagement/actions";
import type { ViewKind } from "@/lib/engagement/types";

interface ViewTrackerProps {
  kind: ViewKind;
  id: string;
}

/* Sends one quiet request after the page loads. The server handles repeats */
export default function ViewTracker({ kind, id }: ViewTrackerProps) {
  const sentFor = useRef<string | null>(null);

  useEffect(() => {
    const key = `${kind}:${id}`;

    if (sentFor.current === key) {
      return;
    }

    sentFor.current = key;
    recordView({ kind, id }).catch(() => {});
  }, [kind, id]);

  return null;
}
