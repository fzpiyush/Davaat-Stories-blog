import MediaCard from "@/components/admin/media/MediaCard";
import { deleteMedia, updateMediaAlt } from "@/lib/admin/media/actions";
import type { MediaWithUsage } from "@/lib/db/media";

interface MediaGridProps {
  items: MediaWithUsage[];
}

export default function MediaGrid({ items }: MediaGridProps) {
  return (
    <ul
      role="list"
      className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4"
    >
      {items.map((media) => (
        <MediaCard
          key={media.id}
          media={media}
          altAction={updateMediaAlt.bind(null, media.id)}
          deleteAction={deleteMedia.bind(null, media.id)}
        />
      ))}
    </ul>
  );
}
