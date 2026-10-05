import Image from "next/image";

const DEFAULT_BIO =
  "Writing about technology, life, ideas, and the lessons I learn along the way.";

interface AuthorCardProps {
  name: string;
  bio?: string;
  avatarUrl?: string | null;
}

export default function AuthorCard({
  name,
  bio,
  avatarUrl = null,
}: AuthorCardProps) {
  const initial = name.trim().charAt(0).toUpperCase();
  const text = bio?.trim() || DEFAULT_BIO;

  return (
    <aside
      aria-label="About the author"
      className="w-full p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 bg-surface-muted rounded-lg"
    >
      {avatarUrl ? (
        <div className="w-14 h-14 shrink-0 bg-background rounded-full relative overflow-hidden">
          <Image
            src={avatarUrl}
            alt=""
            fill
            sizes="56px"
            className="object-cover"
          />
        </div>
      ) : (
        <div
          aria-hidden="true"
          className="w-14 h-14 shrink-0 flex items-center justify-center font-serif text-2xl text-accent bg-background rounded-full"
        >
          {initial}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium uppercase tracking-[0.15em] text-accent">
          Written by
        </p>

        <p className="font-serif text-2xl text-foreground">{name}</p>

        <p className="text-sm leading-6 text-pretty text-muted">{text}</p>
      </div>
    </aside>
  );
}
