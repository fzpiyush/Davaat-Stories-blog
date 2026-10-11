import "server-only";

import { cache } from "react";

import { getAboutPage } from "@/lib/db/about";
import { db } from "@/lib/db/knex";
import type { BlogSection } from "@/lib/db/types";

export type PublicAbout = {
  headline: string;
  intro: string;
  sections: BlogSection[];
  showLatest: boolean;
};

export type SiteStats = {
  blogs: number;
  stories: number;
  chapters: number;
  since: number | null;
};

type StatsRow = SiteStats;

// A chapter only counts when both it and its story are live
const STATS_SQL = `
  select
    (select count(*) from blogs
      where status <> 'draft' and published_at <= now())::int as blogs,
    (select count(*) from stories
      where status <> 'draft' and published_at <= now())::int as stories,
    (select count(*) from chapters ch
      join stories s on s.id = ch.story_id
      where ch.status <> 'draft' and ch.published_at <= now()
        and s.status <> 'draft' and s.published_at <= now())::int as chapters,
    (select extract(year from (min(first_at) at time zone 'Asia/Kolkata'))::int
      from (
        select min(published_at) as first_at from blogs
          where status <> 'draft' and published_at <= now()
        union all
        select min(published_at) from stories
          where status <> 'draft' and published_at <= now()
      ) firsts) as since
`;

export const getPublicAbout = cache(async (): Promise<PublicAbout> => {
  const about = await getAboutPage();

  return {
    headline: about.headline,
    intro: about.intro,
    sections: about.sections,
    showLatest: about.show_latest,
  };
});

export const getSiteStats = cache(async (): Promise<SiteStats> => {
  const result = await db.raw<{ rows: StatsRow[] }>(STATS_SQL);
  const row = result.rows[0];

  return {
    blogs: row?.blogs ?? 0,
    stories: row?.stories ?? 0,
    chapters: row?.chapters ?? 0,
    since: row?.since ?? null,
  };
});