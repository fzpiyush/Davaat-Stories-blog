import "server-only";

import { db } from "@/lib/db/knex";

export type DashboardCounts = {
  blogs: number;
  stories: number;
  comments: number;
  views: number;
};

export async function getDashboardCounts(): Promise<DashboardCounts> {
  const { rows } = await db.raw<{ rows: DashboardCounts[] }>(`
    select
      (select count(*) from blogs)::int as blogs,
      (select count(*) from stories)::int as stories,
      (select count(*) from comments where not is_hidden)::int as comments,
      (select count(*) from page_views)::int as views
  `);

  return rows[0];
}
