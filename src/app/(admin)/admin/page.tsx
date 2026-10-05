import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon, PlusIcon } from "@heroicons/react/20/solid";

import UserAvatar from "@/components/admin/ui/UserAvatar";
import { formatAdminDateTime, pluralize } from "@/lib/admin/format";
import { buttonClass, cardClass } from "@/lib/admin/ui";
import { requireAdmin } from "@/lib/auth/session";
import {
  getDailyViews,
  getDashboardStats,
  getRecentComments,
  getTopContent,
} from "@/lib/db/dashboard";

export const metadata: Metadata = {
  title: "Dashboard",
};

type Stat = {
  label: string;
  value: number;
  hint?: string;
};

const numberFormat = new Intl.NumberFormat("en-US");

function StatCard({ label, value, hint }: Stat) {
  return (
    <li className="p-5 flex flex-col gap-2 bg-surface border border-border rounded-xl">
      <p className="text-sm text-muted">{label}</p>
      <p className="text-2xl font-semibold text-foreground">
        {numberFormat.format(value)}
      </p>
      {hint && <p className="text-xs text-muted">{hint}</p>}
    </li>
  );
}

export default async function AdminDashboardPage() {
  const { user } = await requireAdmin();

  const [stats, dailyViews, topContent, recentComments] = await Promise.all([
    getDashboardStats(),
    getDailyViews(14),
    getTopContent(5),
    getRecentComments(5),
  ]);

  const firstName = (user.name ?? "").split(" ")[0];
  const maxViews = Math.max(1, ...dailyViews.map((day) => day.views));
  const fortnightViews = dailyViews.reduce(
    (total, day) => total + day.views,
    0,
  );

  const statCards: Stat[] = [
    {
      label: "Live blogs",
      value: stats.live_blogs,
      hint: `${stats.draft_blogs} drafts, ${stats.scheduled_blogs} scheduled`,
    },
    {
      label: "Live stories",
      value: stats.live_stories,
      hint: `${pluralize(stats.live_chapters, "chapter")} live`,
    },
    {
      label: "Views this week",
      value: stats.views_week,
      hint: "Once per visitor per day",
    },
    { label: "Views all time", value: stats.views_total },
    { label: "Likes", value: stats.likes_total },
    {
      label: "Comments",
      value: stats.comments_total,
      hint: `${stats.comments_week} in the last 7 days`,
    },
    { label: "Subscribers", value: stats.subscribers },
    { label: "Readers", value: stats.readers, hint: "Signed in to comment" },
  ];

  return (
    <section
      aria-labelledby="dashboard-heading"
      className="w-full flex flex-col gap-8"
    >
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1
            id="dashboard-heading"
            className="font-serif text-3xl font-semibold text-foreground"
          >
            Welcome back{firstName ? `, ${firstName}` : ""}
          </h1>

          <p className="text-muted">Here&apos;s how your site is doing.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link href="/admin/blogs/new" className={buttonClass.primary}>
            <PlusIcon aria-hidden="true" className="w-4 h-4" />
            New blog
          </Link>

          <Link href="/admin/stories/new" className={buttonClass.secondary}>
            <PlusIcon aria-hidden="true" className="w-4 h-4" />
            New story
          </Link>
        </div>
      </header>

      <ul role="list" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </ul>

      <section aria-labelledby="views-heading" className={cardClass}>
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
          <h2
            id="views-heading"
            className="text-lg font-semibold text-foreground"
          >
            Views, last 14 days
          </h2>

          <p className="text-sm text-muted">
            {pluralize(fortnightViews, "view")} in total
          </p>
        </div>

        <ol className="h-40 flex items-end gap-1.5 sm:gap-2">
          {dailyViews.map((day) => (
            <li
              key={day.label}
              title={`${day.label}: ${pluralize(day.views, "view")}`}
              className="h-full flex flex-1 items-end group"
            >
              <span className="sr-only">
                {day.label}: {pluralize(day.views, "view")}
              </span>

              <div
                aria-hidden="true"
                style={{
                  height: `${Math.max(2, (day.views / maxViews) * 100)}%`,
                }}
                className="w-full bg-accent rounded-t-md opacity-70 transition-opacity group-hover:opacity-100 motion-reduce:transition-none"
              />
            </li>
          ))}
        </ol>

        <div
          aria-hidden="true"
          className="flex justify-between text-xs text-muted"
        >
          <span>{dailyViews[0]?.label}</span>
          <span>{dailyViews.at(-1)?.label}</span>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section aria-labelledby="top-heading" className={cardClass}>
          <h2
            id="top-heading"
            className="text-lg font-semibold text-foreground"
          >
            Most read, last 30 days
          </h2>

          {topContent.length > 0 ? (
            <ol className="flex flex-col divide-y divide-border">
              {topContent.map((item, index) => (
                <li
                  key={`${item.kind}-${item.id}`}
                  className="py-3 flex items-center gap-3"
                >
                  <span className="w-6 shrink-0 text-sm font-semibold text-accent">
                    {index + 1}
                  </span>

                  <Link
                    href={`/admin/${item.kind === "blog" ? "blogs" : "stories"}/${item.id}`}
                    className="min-w-0 flex-1 line-clamp-1 text-sm text-foreground rounded-sm transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    {item.title}
                  </Link>

                  <span className="shrink-0 text-xs text-muted">
                    {item.kind === "blog" ? "Blog" : "Story"} •{" "}
                    {pluralize(item.views, "view")}
                  </span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="py-6 text-center text-sm text-muted">
              No views yet. They start counting once readers visit.
            </p>
          )}
        </section>

        <section aria-labelledby="recent-heading" className={cardClass}>
          <div className="flex items-center justify-between gap-4">
            <h2
              id="recent-heading"
              className="text-lg font-semibold text-foreground"
            >
              Recent comments
            </h2>

            <Link
              href="/admin/comments"
              className="inline-flex items-center gap-1 text-sm font-medium text-accent rounded-sm transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent group"
            >
              All comments
              <ArrowRightIcon
                aria-hidden="true"
                className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none"
              />
            </Link>
          </div>

          {recentComments.length > 0 ? (
            <ul className="flex flex-col divide-y divide-border">
              {recentComments.map((comment) => (
                <li key={comment.id} className="py-3 flex items-start gap-3">
                  <UserAvatar name={comment.user_name} url={null} />

                  <div className="min-w-0 flex flex-col gap-1">
                    <p className="text-xs text-muted">
                      <span className="font-medium text-foreground">
                        {comment.user_name ?? "Reader"}
                      </span>{" "}
                      on {comment.target_title ?? "a post"} •{" "}
                      {formatAdminDateTime(comment.created_at)}
                      {comment.is_hidden && " • hidden"}
                    </p>

                    <p className="line-clamp-2 text-sm leading-6 text-foreground">
                      {comment.body}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-6 text-center text-sm text-muted">
              No comments yet. They&apos;ll show up here as readers join in.
            </p>
          )}
        </section>
      </div>
    </section>
  );
}
