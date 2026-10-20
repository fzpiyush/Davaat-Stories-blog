/*
 * Marks text as Hindi when it holds Devanagari letters. The page then
 * uses taller line height for it, and screen readers pick the right voice.
 */
const DEVANAGARI = /[\u0900-\u097F]/;

export function textLang(text: string | null | undefined): "hi" | undefined {
  return text && DEVANAGARI.test(text) ? "hi" : undefined;
}

/*
 * Cuts text at whole letters, so a Hindi letter never gets split from its
 * marks. Adds three dots when something was cut.
 */
export function truncateText(text: string, max: number): string {
  const clean = text.replace(/\s+/g, " ").trim();
  const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
  const letters = Array.from(segmenter.segment(clean), (part) => part.segment);

  if (letters.length <= max) {
    return clean;
  }

  return `${letters
    .slice(0, max - 3)
    .join("")
    .trimEnd()}...`;
}
