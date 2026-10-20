import { firstParam } from "@/lib/admin/params";

export type FilterOption = {
  slug: string;
  name: string;
};

export type SearchParamValue = string | string[] | undefined;

/* Category and tag slugs from the address bar, trimmed and kept short */
export function parseSlug(value: SearchParamValue): string {
  return firstParam(value).trim().slice(0, 120);
}

/* Builds a list link, leaving out empty values and page 1 */
export function buildListHref(
  basePath: string,
  params: Record<string, string | number>,
): string {
  const search = new URLSearchParams();

  for (const [name, value] of Object.entries(params)) {
    const text = String(value);

    if (text && !(name === "page" && text === "1")) {
      search.set(name, text);
    }
  }

  const queryString = search.toString();
  return queryString ? `${basePath}?${queryString}` : basePath;
}
