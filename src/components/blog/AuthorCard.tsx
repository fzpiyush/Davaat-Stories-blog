import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/20/solid";

import { smallButtonClass } from "@/lib/admin/ui";
import { textLang } from "@/lib/content/script";

interface AuthorCardProps {
  name: string;
  bio: string;
  avatarUrl: string | null;
}

export default function AuthorCard({ name, bio, avatarUrl }: AuthorCardProps) {
  const initial = Array.from((name ?? "").trim())[0] ?? "?";

  return (
    <section
      aria-label="About the author"
      className="w-full p-5 sm:p-6 flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-5 bg-linear-to-br from-surface to-surface-muted border border-border rounded-lg"
    >
      <div className="w-14 h-14 sm:w-16 sm:h-16 shrink-0 flex items-center justify-center font-serif text-xl text-accent bg-background border border-border rounded-lg relative overflow-hidden">
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt=""
            fill
            sizes="64px"
            className="object-cover"
          />
        ) : (
          <span aria-hidden="true">{initial}</span>
        )}
      </div>

      <div className="min-w-0 flex flex-col gap-2">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
          Written by
        </p>

        <p
          lang={textLang(name)}
          className="font-serif text-xl sm:text-2xl leading-tight hi:leading-[1.4] text-foreground"
        >
          {name}
        </p>

        {bio && (
          <p
            lang={textLang(bio)}
            className="text-sm leading-6 hi:leading-7 text-muted"
          >
            {bio}
          </p>
        )}

        <Link
          href="/about"
          className={`${smallButtonClass.secondary} w-fit mt-2 group`}
        >
          More about me
          <ArrowRightIcon
            aria-hidden="true"
            className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none"
          />
        </Link>
      </div>
    </section>
  );
}
