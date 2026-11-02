import type { QuoteLang } from "@/lib/db/types";

export type PublicQuote = {
  id: string;
  text: string;
  lang: QuoteLang;
  translation: string | null;
  author: string | null;
};
