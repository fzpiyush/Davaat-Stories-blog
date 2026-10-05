import { getDisplayStatus, STATUS_LABEL } from "@/lib/content/status";
import { splitParagraphs } from "@/lib/content/text";
import type { BlogSection, ContentStatus } from "@/lib/db/types";

export type Option = {
  id: string;
  label: string;
};

export type CoverValue = {
  id: string;
  url: string;
  alt: string;
} | null;

/* One section as it looks in the editor, paragraphs typed as one text */
export type SectionDraft = {
  heading: string;
  body: string;
  quote: string;
};

export const EMPTY_SECTION: SectionDraft = { heading: "", body: "", quote: "" };

export function toSectionDrafts(sections: BlogSection[]): SectionDraft[] {
  const drafts = sections.map((section) => ({
    heading: section.heading ?? "",
    body: section.paragraphs.join("\n\n"),
    quote: section.quote ?? "",
  }));

  return drafts.length > 0 ? drafts : [EMPTY_SECTION];
}

/* Turns editor sections into what the site reads, dropping empty ones */
export function toBlogSections(drafts: SectionDraft[]): BlogSection[] {
  return drafts.flatMap((draft) => {
    const heading = draft.heading.trim();
    const quote = draft.quote.trim();
    const paragraphs = splitParagraphs(draft.body);

    if (!heading && !quote && paragraphs.length === 0) {
      return [];
    }

    const section: BlogSection = { paragraphs };

    if (heading) {
      section.heading = heading;
    }

    if (quote) {
      section.quote = quote;
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
