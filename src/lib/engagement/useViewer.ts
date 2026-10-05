"use client";

import { useEffect, useState } from "react";

import { getViewer } from "@/lib/engagement/actions";
import type { Viewer } from "@/lib/engagement/types";

type ViewerState =
  | { status: "loading" }
  | { status: "ready"; viewer: Viewer | null };

let viewerPromise: Promise<Viewer | null> | null = null;

function loadViewer(): Promise<Viewer | null> {
  if (!viewerPromise) {
    viewerPromise = getViewer().catch(() => null);
  }

  return viewerPromise;
}

export function useViewer(): ViewerState {
  const [state, setState] = useState<ViewerState>({ status: "loading" });

  useEffect(() => {
    let active = true;

    loadViewer().then((viewer) => {
      if (active) {
        setState({ status: "ready", viewer });
      }
    });

    return () => {
      active = false;
    };
  }, []);

  return state;
}
