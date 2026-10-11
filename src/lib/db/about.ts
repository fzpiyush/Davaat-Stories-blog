import "server-only";

import { db } from "@/lib/db/knex";
import type { AboutPageRow, BlogSection } from "@/lib/db/types";

const ABOUT_ID = 1;

export type AboutPageInput = {
  headline: string;
  intro: string;
  sections: BlogSection[];
  showLatest: boolean;
};

const EMPTY_ABOUT: AboutPageRow = {
  id: ABOUT_ID,
  headline: "",
  intro: "",
  sections: [],
  banner_media_id: null,
  show_latest: true,
  updated_at: new Date(0),
};

export async function getAboutPage(): Promise<AboutPageRow> {
  return (
    (await db<AboutPageRow>("about_page").where({ id: ABOUT_ID }).first()) ??
    EMPTY_ABOUT
  );
}

export async function saveAboutRecord(input: AboutPageInput): Promise<void> {
  const row = {
    headline: input.headline,
    intro: input.intro,
    // jsonb needs a JSON string, a plain array would become a Postgres array
    sections: JSON.stringify(input.sections),
    // The artwork lives in src/assets now, so this column stays empty
    banner_media_id: null,
    show_latest: input.showLatest,
    updated_at: new Date(),
  };

  await db("about_page")
    .insert({ id: ABOUT_ID, ...row })
    .onConflict("id")
    .merge();
}
