"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import { ArrowPathIcon, XMarkIcon } from "@heroicons/react/20/solid";

import ImageUploader from "@/components/admin/media/ImageUploader";
import type { CoverValue } from "@/lib/admin/editor";
import { listMediaForPicker, type PickerMedia } from "@/lib/admin/media/picker";
import { buttonClass, iconButtonClass, inputClass } from "@/lib/admin/ui";
import type { ImagePresetKey } from "@/lib/media/presets";

type Tab = "library" | "upload";

const TABS: { value: Tab; label: string }[] = [
  { value: "library", label: "Library" },
  { value: "upload", label: "Upload new" },
];

const SEARCH_DELAY_MS = 300;
const LOAD_ERROR = "Couldn't load your images. Please try again.";

interface MediaPickerDialogProps {
  title: string;
  preset: ImagePresetKey;
  onSelect: (cover: NonNullable<CoverValue>) => void;
  onClose: () => void;
}

export default function MediaPickerDialog({
  title,
  preset,
  onSelect,
  onClose,
}: MediaPickerDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const id = useId();

  const [tab, setTab] = useState<Tab>("library");
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<PickerMedia[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const titleId = `${id}-title`;
  const searchId = `${id}-search`;

  useEffect(() => {
    const dialog = dialogRef.current;

    if (dialog && !dialog.open) {
      dialog.showModal();
    }
  }, []);

  // Waits a moment after typing so every keystroke isn't a request
  useEffect(() => {
    let cancelled = false;

    const timer = window.setTimeout(
      async () => {
        setIsLoading(true);
        setLoadError("");

        try {
          const result = await listMediaForPicker({ query, page: 1 });

          if (!cancelled) {
            setItems(result.items);
            setPage(1);
            setHasMore(result.hasMore);
          }
        } catch {
          if (!cancelled) {
            setLoadError(LOAD_ERROR);
          }
        } finally {
          if (!cancelled) {
            setIsLoading(false);
          }
        }
      },
      query ? SEARCH_DELAY_MS : 0,
    );

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query]);

  async function loadMore() {
    const nextPage = page + 1;
    setIsLoading(true);

    try {
      const result = await listMediaForPicker({ query, page: nextPage });
      setItems((current) => [...current, ...result.items]);
      setPage(nextPage);
      setHasMore(result.hasMore);
    } catch {
      setLoadError(LOAD_ERROR);
    } finally {
      setIsLoading(false);
    }
  }

  function close() {
    dialogRef.current?.close();
  }

  function handleBackdropClick(event: MouseEvent<HTMLDialogElement>) {
    if (event.target === event.currentTarget) {
      close();
    }
  }

  function choose(media: PickerMedia) {
    onSelect({ id: media.id, url: media.url, alt: media.alt_text });
  }

  return createPortal(
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={handleBackdropClick}
      className="w-[calc(100%-2rem)] max-w-4xl max-h-[85dvh] p-0 m-auto text-foreground bg-surface shadow-xl border border-border rounded-xl backdrop:bg-foreground/30 backdrop:backdrop-blur-sm"
    >
      <div className="max-h-[85dvh] flex flex-col">
        <div className="px-5 py-4 flex items-center justify-between gap-4 border-b border-border">
          <h2 id={titleId} className="text-lg font-semibold text-foreground">
            {title}
          </h2>

          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className={iconButtonClass}
          >
            <XMarkIcon aria-hidden="true" className="w-5 h-5" />
          </button>
        </div>

        <div
          role="tablist"
          aria-label="Image source"
          className="px-5 pt-4 flex gap-2"
        >
          {TABS.map((item) => (
            <button
              key={item.value}
              type="button"
              role="tab"
              aria-selected={tab === item.value}
              onClick={() => setTab(item.value)}
              className="h-9 px-4 text-sm font-medium text-muted rounded-full transition-colors hover:text-foreground aria-selected:text-accent-foreground aria-selected:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="p-5 flex-1 overflow-y-auto">
          {tab === "library" ? (
            <div className="flex flex-col gap-4">
              <label htmlFor={searchId} className="sr-only">
                Search images
              </label>

              <input
                id={searchId}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search alt text or file name"
                className={inputClass}
              />

              {loadError && (
                <p role="alert" className="text-sm text-red-600">
                  {loadError}
                </p>
              )}

              {items.length > 0 ? (
                <ul
                  role="list"
                  className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4"
                >
                  {items.map((media) => (
                    <li key={media.id}>
                      <button
                        type="button"
                        onClick={() => choose(media)}
                        aria-label={media.alt_text || "Image without alt text"}
                        className="w-full aspect-4/3 block bg-surface-muted rounded-lg relative overflow-hidden ring-1 ring-border transition hover:ring-2 hover:ring-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                      >
                        <Image
                          src={media.url}
                          alt=""
                          fill
                          sizes="200px"
                          className="object-cover"
                        />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                !isLoading &&
                !loadError && (
                  <p className="py-10 text-center text-sm text-muted">
                    {query
                      ? "No images match."
                      : "No images yet. Upload one instead."}
                  </p>
                )
              )}

              {isLoading && (
                <p className="py-4 flex items-center justify-center gap-2 text-sm text-muted">
                  <ArrowPathIcon
                    aria-hidden="true"
                    className="w-4 h-4 animate-spin motion-reduce:animate-none"
                  />
                  Loading
                </p>
              )}

              {hasMore && !isLoading && (
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={loadMore}
                    className={buttonClass.secondary}
                  >
                    Load more
                  </button>
                </div>
              )}
            </div>
          ) : (
            <ImageUploader
              preset={preset}
              onUploaded={(media) =>
                onSelect({ id: media.id, url: media.url, alt: media.alt_text })
              }
            />
          )}
        </div>
      </div>
    </dialog>,
    document.body,
  );
}
