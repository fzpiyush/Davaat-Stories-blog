import type { BlogSection } from "@/lib/db/types";

const WORDS_PER_MINUTE = 200;

export function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

export function countSectionWords(sections: BlogSection[]): number {
  return sections.reduce(
    (total, section) =>
      total +
      countWords(section.heading ?? "") +
      section.paragraphs.reduce(
        (sum, paragraph) => sum + countWords(paragraph),
        0,
      ) +
      countWords(section.quote ?? ""),
    0,
  );
}

export function getReadTimeMinutes(words: number): number {
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

export function formatReadTime(minutes: number): string {
  return `${minutes} min read`;
}

/* Chapter text is typed with an empty line between paragraphs */
export function splitParagraphs(text: string): string[] {
  return text
    .replace(/\r\n/g, "\n")
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}
