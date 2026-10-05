export type TaxonomyKind = "categories" | "tags";

type TaxonomyConfig = {
  title: string;
  description: string;
  singular: string;
  plural: string;
  path: string;
  namePlaceholder: string;
  hasDescription: boolean;
};

export const TAXONOMY = {
  categories: {
    title: "Categories",
    description:
      "Group your blogs and stories by topic. Each post or story has one category.",
    singular: "category",
    plural: "categories",
    path: "/admin/categories",
    namePlaceholder: "Technology",
    hasDescription: true,
  },
  tags: {
    title: "Tags",
    description:
      "Small topic labels. A post or story can have as many tags as you like.",
    singular: "tag",
    plural: "tags",
    path: "/admin/tags",
    namePlaceholder: "Productivity",
    hasDescription: false,
  },
} as const satisfies Record<TaxonomyKind, TaxonomyConfig>;

export function isTaxonomyKind(value: unknown): value is TaxonomyKind {
  return value === "categories" || value === "tags";
}
