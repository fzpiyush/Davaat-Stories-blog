import type { QuoteLang } from "@/lib/db/types";

export const QUOTE_LANG_LABEL: Record<QuoteLang, string> = {
  hi: "हिंदी",
  en: "English",
};

/* The first line of a quote, shortened, for titles and admin lists */
export function toQuoteTitle(text: string, max = 60): string {
  const firstLine = text.trim().split("\n")[0]?.trim() ?? "";

  if (!firstLine) {
    return "Untitled quote";
  }

  return firstLine.length > max
    ? `${firstLine.slice(0, max - 3).trimEnd()}...`
    : firstLine;
}
