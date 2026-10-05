"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import {
  ArrowRightStartOnRectangleIcon,
  Squares2X2Icon,
} from "@heroicons/react/20/solid";
import { UserCircleIcon } from "@heroicons/react/24/outline";

import { signOutViewer } from "@/lib/engagement/actions";
import { buildSignInHref } from "@/lib/engagement/signIn";
import { useViewer } from "@/lib/engagement/useViewer";

const menuItemClass =
  "w-full px-3 py-2 flex items-center gap-2 text-sm text-muted rounded-md transition-colors hover:bg-surface-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-60";

export default function AccountMenu() {
  const viewerState = useViewer();
  const pathname = usePathname();
  const menuId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Closes on a click outside or the Escape key
  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  if (viewerState.status === "loading") {
    return <span aria-hidden="true" className="w-9 h-9" />;
  }

  const { viewer } = viewerState;

  // A plain link, so the browser never prefetches the Google sign in
  if (!viewer) {
    return (
      <a
        href={buildSignInHref(pathname)}
        aria-label="Sign in"
        className="w-9 h-9 sm:w-auto sm:px-4 inline-flex shrink-0 items-center justify-center gap-2 text-sm font-medium text-accent-foreground bg-accent shadow-sm rounded-full transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <UserCircleIcon aria-hidden="true" className="w-5 h-5 shrink-0" />
        <span aria-hidden="true" className="hidden sm:inline">
          Sign in
        </span>
      </a>
    );
  }

  async function handleSignOut() {
    setIsSigningOut(true);

    try {
      await signOutViewer();
    } finally {
      window.location.reload();
    }
  }

  const initial = viewer.name.trim().charAt(0).toUpperCase() || "?";

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={`Account menu for ${viewer.name}`}
        className="w-9 h-9 flex items-center justify-center font-serif text-sm text-accent bg-surface-muted rounded-full ring-2 ring-transparent ring-offset-2 ring-offset-background overflow-hidden transition hover:ring-accent aria-expanded:ring-accent focus-visible:outline-none focus-visible:ring-accent"
      >
        {viewer.avatarUrl ? (
          <Image
            src={viewer.avatarUrl}
            alt=""
            width={36}
            height={36}
            className="w-9 h-9 object-cover"
          />
        ) : (
          initial
        )}
      </button>

      {open && (
        <div
          id={menuId}
          className="w-56 mt-2 p-2 flex flex-col gap-1 bg-background shadow-lg border border-border rounded-lg absolute top-full right-0 z-50"
        >
          <p className="px-3 py-2 truncate text-sm font-medium text-foreground">
            {viewer.name}
          </p>

          {viewer.isAdmin && (
            <Link
              href="/admin"
              onClick={() => setOpen(false)}
              className={menuItemClass}
            >
              <Squares2X2Icon aria-hidden="true" className="w-4 h-4" />
              Admin panel
            </Link>
          )}

          <button
            type="button"
            onClick={handleSignOut}
            disabled={isSigningOut}
            className={menuItemClass}
          >
            <ArrowRightStartOnRectangleIcon
              aria-hidden="true"
              className="w-4 h-4"
            />
            {isSigningOut ? "Signing out" : "Sign out"}
          </button>
        </div>
      )}
    </div>
  );
}
