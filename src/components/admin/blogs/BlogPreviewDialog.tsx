"use client";

import { useEffect, useRef } from "react";
import { EyeIcon, XMarkIcon } from "@heroicons/react/20/solid";

import BlogArticle from "@/components/blog/BlogArticle";
import { smallButtonClass } from "@/lib/admin/ui";
import type { Blog } from "@/lib/blog/types";

interface BlogPreviewDialogProps {
  blog: Blog | null;
  onClose: () => void;
}

export default function BlogPreviewDialog({
  blog,
  onClose,
}: BlogPreviewDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (blog && dialog && !dialog.open) {
      dialog.showModal();
    }
  }, [blog]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      aria-label="Blog preview"
      className="w-full max-w-none h-full max-h-none m-0 p-0 text-foreground bg-background"
    >
      {blog && (
        <div className="w-full h-full flex flex-col">
          <div className="px-4 sm:px-6 py-3 flex shrink-0 items-center justify-between gap-4 bg-surface border-b border-border">
            <p className="flex items-center gap-2 text-sm text-muted">
              <EyeIcon
                aria-hidden="true"
                className="w-4 h-4 shrink-0 text-accent"
              />
              Preview of your unsaved post. Links are turned off here.
            </p>

            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              className={smallButtonClass.secondary}
            >
              <XMarkIcon aria-hidden="true" className="w-4 h-4" />
              Close
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* inert keeps links and buttons from leaving the editor */}
            <div inert>
              <BlogArticle blog={blog} />
            </div>
          </div>
        </div>
      )}
    </dialog>
  );
}
