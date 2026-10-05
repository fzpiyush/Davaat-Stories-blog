import type { Metadata } from "next";

import ImageUploader from "@/components/admin/media/ImageUploader";
import MediaGrid from "@/components/admin/media/MediaGrid";
import AdminEmptyState from "@/components/admin/ui/AdminEmptyState";
import AdminPageHeader from "@/components/admin/ui/AdminPageHeader";
import Pagination from "@/components/admin/ui/Pagination";
import { pluralize } from "@/lib/admin/format";
import { firstParam, parsePage } from "@/lib/admin/params";
import { buttonClass, inputClass } from "@/lib/admin/ui";
import { requireAdmin } from "@/lib/auth/session";
import { listMedia, MEDIA_PAGE_SIZE } from "@/lib/db/media";

export const metadata: Metadata = {
  title: "Media",
};

interface MediaPageProps {
  searchParams: Promise<{
    q?: string | string[];
    page?: string | string[];
  }>;
}

export default async function MediaPage({ searchParams }: MediaPageProps) {
  await requireAdmin();

  const params = await searchParams;
  const query = firstParam(params.q).trim().slice(0, 100);
  const page = parsePage(params.page);
  const { items, total } = await listMedia({ page, query });
  const totalPages = Math.max(1, Math.ceil(total / MEDIA_PAGE_SIZE));

  return (
    <section className="w-full flex flex-col gap-8">
      <AdminPageHeader
        title="Media"
        description="Images are resized and converted to WebP on your computer before they upload, so your storage stays light."
      />

      <ImageUploader refreshAfterUpload />

      <div className="flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="flex items-baseline gap-3 text-lg font-semibold text-foreground">
            Library
            <span className="text-sm font-normal text-muted">
              {pluralize(total, "image")}
            </span>
          </h2>

          <form
            role="search"
            action="/admin/media"
            className="w-full sm:max-w-sm flex gap-2"
          >
            <label htmlFor="media-search" className="sr-only">
              Search images
            </label>

            <input
              id="media-search"
              name="q"
              type="search"
              defaultValue={query}
              placeholder="Search alt text or file name"
              className={inputClass}
            />

            <button type="submit" className={buttonClass.secondary}>
              Search
            </button>
          </form>
        </div>

        {items.length > 0 ? (
          <MediaGrid items={items} />
        ) : (
          <AdminEmptyState
            title={query ? "No images match" : "No images yet"}
            description={
              query
                ? "Try a different word, or clear the search."
                : "Upload your first image using the box above."
            }
          />
        )}

        <Pagination
          page={page}
          totalPages={totalPages}
          basePath="/admin/media"
          params={{ q: query }}
        />
      </div>
    </section>
  );
}
