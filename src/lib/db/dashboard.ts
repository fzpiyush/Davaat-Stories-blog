import "server-only";

import { db } from "@/lib/db/knex";

export type DashboardStats = {
  live_blogs: number;
  draft_blogs: number;
  scheduled_blogs: number;
  live_stories: number;
  live_chapters: number;
  views_week: number;
  views_total: number;
  likes_total: number;
  comments_total: number;
  comments_week: number;
  subscribers: number;
  readers: number;
};

export type DailyViews = {
  label: string;
  views: number;
};

export type TopContent = {
  kind: "blog" | "story";
  id: string;
  title: string;
  views: number;
};

export type RecentComment = {
  id: string;
  body: string;
  created_at: Date;
  is_hidden: boolean;
  user_name: string | null;
  target_title: string | null;
};

const LIVE = "status <> 'draft' and published_at <= now()";

export async function getDashboardStats(): Promise<DashboardStats> {
  const { rows } = await db.raw<{ rows: DashboardStats[] }>(`
    select
      (select count(*) from blogs where ${LIVE})::int as live_blogs,
      (select count(*) from blogs where status = 'draft')::int as draft_blogs,
      (select count(*) from blogs where status <> 'draft' and published_at > now())::int as scheduled_blogs,
      (select count(*) from stories where ${LIVE})::int as live_stories,
      (select count(*) from chapters where ${LIVE})::int as live_chapters,
      (select count(*) from page_views where viewed_on >= current_date - 6)::int as views_week,
      (select count(*) from page_views)::int as views_total,
      (select count(*) from likes)::int as likes_total,
      (select count(*) from comments where not is_hidden)::int as comments_total,
      (select count(*) from comments where created_at >= now() - interval '7 days')::int as comments_week,
      (select count(*) from newsletter_subscribers where status = 'subscribed')::int as subscribers,
      (select count(*) from users where role = 'reader')::int as readers
  `);

  return rows[0];
}

/* One row per day, including days with zero views */
export async function getDailyViews(days = 14): Promise<DailyViews[]> {
  const { rows } = await db.raw<{ rows: DailyViews[] }>(
    `
    select to_char(day, 'Mon FMDD') as label, count(pv.id)::int as views
    from generate_series(current_date - (?::int - 1), current_date, interval '1 day') as day
    left join page_views pv on pv.viewed_on = day::date
    group by day
    order by day
    `,
    [days],
  );

  return rows;
}

export async function getTopContent(limit = 5): Promise<TopContent[]> {
  const { rows } = await db.raw<{ rows: TopContent[] }>(
    `
    select * from (
      select 'blog' as kind, b.id, b.title, count(pv.id)::int as views
      from page_views pv
      join blogs b on b.id = pv.blog_id
      where pv.viewed_on >= current_date - 29
      group by b.id, b.title
      union all
      select 'story' as kind, s.id, s.title, count(pv.id)::int as views
      from page_views pv
      join stories s on s.id = pv.story_id
      where pv.viewed_on >= current_date - 29
      group by s.id, s.title
    ) as content
    order by views desc
    limit ?
    `,
    [limit],
  );

  return rows;
}

export async function getRecentComments(limit = 5): Promise<RecentComment[]> {
  return db("comments as cm")
    .join("users as u", "u.id", "cm.user_id")
    .leftJoin("blogs as b", "b.id", "cm.blog_id")
    .leftJoin("stories as s", "s.id", "cm.story_id")
    .select(
      "cm.id",
      "cm.body",
      "cm.created_at",
      "cm.is_hidden",
      "u.name as user_name",
      db.raw("coalesce(b.title, s.title) as target_title"),
    )
    .orderBy("cm.created_at", "desc")
    .limit(limit);
}
