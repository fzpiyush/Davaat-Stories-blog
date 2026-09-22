import { formatDate } from "@/lib/formatDate";

interface BlogMetaProps {
  author: string;
  publishedAt: string;
  readTime: string;
  className?: string;
}

export default function BlogMeta({
  author,
  publishedAt,
  readTime,
  className = "",
}: BlogMetaProps) {
  const date = formatDate(publishedAt);

  return (
    <div
      className={`flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted ${className}`}
    >
      <span>
        By <span className="font-medium text-foreground">{author}</span>
      </span>

      <span aria-hidden="true">•</span>

      <time dateTime={date.iso}>{date.label}</time>

      <span aria-hidden="true">•</span>

      <span>{readTime}</span>
    </div>
  );
}
