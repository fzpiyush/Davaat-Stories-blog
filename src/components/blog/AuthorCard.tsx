interface AuthorCardProps {
  name: string;
  bio?: string;
}

export default function AuthorCard({
  name,
  bio = "Writing about technology, life, ideas, and the lessons I learn along the way.",
}: AuthorCardProps) {
  return (
    <aside
      aria-label="About the author"
      className="w-full flex flex-col gap-3 p-6 sm:p-8 bg-surface-muted rounded-lg"
    >
      <p className="text-sm font-medium uppercase tracking-[0.15em] text-accent">
        Written by
      </p>

      <p className="font-serif text-2xl text-foreground">{name}</p>

      <p className="text-pretty text-sm leading-6 text-muted">{bio}</p>
    </aside>
  );
}
