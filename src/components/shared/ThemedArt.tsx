import { getImageProps, type StaticImageData } from "next/image";

export type ThemedArtSet = {
  day: StaticImageData;
  night: StaticImageData;
  dayPhone: StaticImageData;
  nightPhone: StaticImageData;
};

type Breakpoint = "md" | "lg";

const WIDE_QUERY: Record<Breakpoint, string> = {
  md: "(min-width: 768px)",
  lg: "(min-width: 1024px)",
};

interface ArtPictureProps {
  wide: StaticImageData;
  phone: StaticImageData;
  breakpoint: Breakpoint;
  eager: boolean;
  pictureClassName: string;
  imageClassName: string;
}

function ArtPicture({
  wide,
  phone,
  breakpoint,
  eager,
  pictureClassName,
  imageClassName,
}: ArtPictureProps) {
  const shared = { alt: "", fill: true, sizes: "100vw" } as const;

  const {
    props: { srcSet: wideSrcSet },
  } = getImageProps({ ...shared, src: wide });

  const {
    props: { srcSet: phoneSrcSet, ...imageProps },
  } = getImageProps({
    ...shared,
    src: phone,
    loading: eager ? "eager" : "lazy",
    fetchPriority: eager ? "high" : "auto",
  });

  return (
    <picture className={pictureClassName}>
      <source
        media={WIDE_QUERY[breakpoint]}
        srcSet={wideSrcSet}
        sizes="100vw"
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        {...imageProps}
        srcSet={phoneSrcSet}
        alt=""
        className={imageClassName}
      />
    </picture>
  );
}

interface ThemedArtProps {
  art: ThemedArtSet;
  /** Screen width where the wide painting replaces the phone one */
  breakpoint?: Breakpoint;
  imageClassName?: string;
}

/*
 * Day and night follow the theme, phone and wide follow the screen.
 * Hidden lazy images never download, so night art costs day
 * visitors nothing.
 */
export default function ThemedArt({
  art,
  breakpoint = "md",
  imageClassName = "object-cover",
}: ThemedArtProps) {
  return (
    <>
      <ArtPicture
        wide={art.day}
        phone={art.dayPhone}
        breakpoint={breakpoint}
        eager
        pictureClassName="dark:hidden"
        imageClassName={imageClassName}
      />

      <ArtPicture
        wide={art.night}
        phone={art.nightPhone}
        breakpoint={breakpoint}
        eager={false}
        pictureClassName="hidden dark:block"
        imageClassName={imageClassName}
      />
    </>
  );
}
