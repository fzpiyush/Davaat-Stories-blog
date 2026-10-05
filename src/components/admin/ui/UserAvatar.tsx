import Image from "next/image";

const sizeClass = {
  small: "w-9 h-9 text-sm",
  medium: "w-11 h-11 text-base",
} as const;

interface UserAvatarProps {
  name: string | null;
  url: string | null;
  size?: keyof typeof sizeClass;
}

export default function UserAvatar({
  name,
  url,
  size = "small",
}: UserAvatarProps) {
  const initial = (name ?? "?").trim().charAt(0).toUpperCase() || "?";

  if (url) {
    return (
      <div
        className={`${sizeClass[size]} shrink-0 bg-surface-muted rounded-full relative overflow-hidden`}
      >
        <Image src={url} alt="" fill sizes="44px" className="object-cover" />
      </div>
    );
  }

  return (
    <div
      aria-hidden="true"
      className={`${sizeClass[size]} shrink-0 flex items-center justify-center font-serif text-accent bg-surface-muted rounded-full`}
    >
      {initial}
    </div>
  );
}
