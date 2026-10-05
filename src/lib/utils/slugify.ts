/*
 * Turns a title into a URL friendly slug. Accents are removed first,
 * so Café becomes cafe. Titles in non Latin scripts like Hindi return
 * an empty string, and the form will ask for a slug in that case.
 */
export function slugify(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}