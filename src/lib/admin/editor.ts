import { getDisplayStatus, STATUS_LABEL } from "@/lib/content/status";
import { splitParagraphs } from "@/lib/content/text";
import type {
  BlogSection,
  BlogSectionImage,
  ContentStatus,
} from "@/lib/db/types";

export type Option = {
  id: string;
  label: string;
};

export type CoverValue = {
  id: string;
  url: string;
  alt: string;
} | null;

/* A picked section image. Size is known for saved images, not for fresh picks */
export type SectionImageValue = {
  id: string;
  url: string;
  alt: string;
  width?: number | null;
  height?: number | null;
};

/*
 * One section as it looks in the editor, paragraphs typed as one text.
 * Image and caption are optional, so editors without images still fit.
 */
export type SectionDraft = {
  heading: string;
  body: string;
  quote: string;
  image?: SectionImageValue | null;
  caption?: string;
};

export const EMPTY_SECTION: SectionDraft = {
  heading: "",
  body: "",
  quote: "",
  image: null,
  caption: "",
};

export function toSectionDrafts(sections: BlogSection[]): SectionDraft[] {
  const drafts = sections.map((section) => ({
    heading: section.heading ?? "",
    body: section.paragraphs.join("\n\n"),
    quote: section.quote ?? "",
    image: section.image
      ? {
          id: section.image.mediaId,
          url: section.image.url,
          alt: section.image.alt,
          width: section.image.width ?? null,
          height: section.image.height ?? null,
        }
      : null,
    caption: section.image?.caption ?? "",
  }));

  return drafts.length > 0 ? drafts : [EMPTY_SECTION];
}

function toSectionImage(
  image: SectionImageValue,
  caption: string,
): BlogSectionImage {
  const result: BlogSectionImage = {
    mediaId: image.id,
    url: image.url,
    alt: image.alt,
  };

  if (image.width && image.height) {
    result.width = image.width;
    result.height = image.height;
  }

  if (caption) {
    result.caption = caption;
  }

  return result;
}

/* Turns editor sections into what the site reads, dropping empty ones */
export function toBlogSections(drafts: SectionDraft[]): BlogSection[] {
  return drafts.flatMap((draft) => {
    const heading = draft.heading.trim();
    const quote = draft.quote.trim();
    const caption = (draft.caption ?? "").trim();
    const image = draft.image ?? null;
    const paragraphs = splitParagraphs(draft.body);

    if (!heading && !quote && !image && paragraphs.length === 0) {
      return [];
    }

    const section: BlogSection = { paragraphs };

    if (heading) {
      section.heading = heading;
    }

    if (quote) {
      section.quote = quote;
    }

    // A caption without an image has nothing to describe, so it's dropped
    if (image) {
      section.image = toSectionImage(image, caption);
    }

    return [section];
  });
}

export function toContentOption(
  id: string,
  title: string,
  status: ContentStatus,
  publishedAt: Date | null,
): Option {
  const display = getDisplayStatus(status, publishedAt);

  return {
    id,
    label:
      display === "published" ? title : `${title} (${STATUS_LABEL[display]})`,
  };
}
