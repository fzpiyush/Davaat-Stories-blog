"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import {
  CheckIcon,
  EnvelopeIcon,
  LinkIcon,
  ShareIcon,
} from "@heroicons/react/20/solid";

import { socialIcons } from "@/components/shared/socialIcons";

type Network = "whatsapp" | "x" | "facebook" | "linkedin";
type CopyStatus = "idle" | "copied" | "failed";

const NETWORKS: {
  key: Network;
  label: string;
  build: (url: string, title: string) => string;
}[] = [
  {
    key: "whatsapp",
    label: "WhatsApp",
    build: (url, title) =>
      `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
  },
  {
    key: "x",
    label: "X",
    build: (url, title) =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
  },
  {
    key: "facebook",
    label: "Facebook",
    build: (url) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    build: (url) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
];

const COPY_RESET_MS = 2000;

const roundButtonClass =
  "w-9 h-9 flex shrink-0 items-center justify-center text-muted bg-surface border border-border rounded-full transition-colors hover:text-accent-foreground hover:bg-accent hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent";

const copyButtonClass =
  "h-9 px-3.5 inline-flex shrink-0 items-center gap-1.5 text-xs font-medium text-muted bg-surface border border-border rounded-full transition-colors hover:text-accent hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent";

const COPY_LABEL: Record<CopyStatus, string> = {
  idle: "Copy link",
  copied: "Copied",
  failed: "Couldn't copy",
};

// Nothing to subscribe to, the browser's share support never changes
function subscribe() {
  return () => {};
}

interface ShareButtonsProps {
  title: string;
  /** The page path, like /blogs/my-post. The full link is built in the browser */
  path: string;
  label?: string;
  /** A short line for the phone share sheet */
  text?: string;
}

export default function ShareButtons({
  title,
  path,
  label = "Share",
  text,
}: ShareButtonsProps) {
  // False on the server, checked in the browser after the page loads
  const canNativeShare = useSyncExternalStore(
    subscribe,
    () => typeof navigator.share === "function",
    () => false,
  );
  const [copyStatus, setCopyStatus] = useState<CopyStatus>("idle");

  useEffect(() => {
    if (copyStatus === "idle") {
      return;
    }

    const timer = window.setTimeout(() => setCopyStatus("idle"), COPY_RESET_MS);
    return () => window.clearTimeout(timer);
  }, [copyStatus]);

  function getUrl(): string {
    return new URL(path, window.location.origin).toString();
  }

  async function shareNative() {
    try {
      await navigator.share({ title, text: text || title, url: getUrl() });
    } catch {
      // Closing the share sheet counts as an error, nothing to do
    }
  }

  function openNetwork(build: (url: string, title: string) => string) {
    window.open(build(getUrl(), title), "_blank", "noopener,noreferrer");
  }

  function shareByEmail() {
    const body = `${title}\n\n${getUrl()}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(getUrl());
      setCopyStatus("copied");
    } catch {
      setCopyStatus("failed");
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <p className="mr-1 text-xs font-medium uppercase tracking-[0.15em] text-muted">
        {label}
      </p>

      {canNativeShare && (
        <button
          type="button"
          onClick={shareNative}
          aria-label="Share using your device"
          title="Share"
          className={roundButtonClass}
        >
          <ShareIcon aria-hidden="true" className="w-4 h-4" />
        </button>
      )}

      {NETWORKS.map((network) => {
        const Icon = socialIcons[network.key];

        return (
          <button
            key={network.key}
            type="button"
            onClick={() => openNetwork(network.build)}
            aria-label={`Share on ${network.label}, opens in a new tab`}
            title={network.label}
            className={roundButtonClass}
          >
            <Icon aria-hidden="true" className="w-4 h-4" />
          </button>
        );
      })}

      <button
        type="button"
        onClick={shareByEmail}
        aria-label="Share by email"
        title="Email"
        className={roundButtonClass}
      >
        <EnvelopeIcon aria-hidden="true" className="w-4 h-4" />
      </button>

      <button type="button" onClick={copyLink} className={copyButtonClass}>
        {copyStatus === "copied" ? (
          <CheckIcon aria-hidden="true" className="w-4 h-4 text-accent" />
        ) : (
          <LinkIcon aria-hidden="true" className="w-4 h-4" />
        )}
        {COPY_LABEL[copyStatus]}
      </button>

      <span role="status" aria-live="polite" className="sr-only">
        {copyStatus === "copied"
          ? "Link copied"
          : copyStatus === "failed"
            ? "Couldn't copy the link"
            : ""}
      </span>
    </div>
  );
}
