import type { Metadata } from "next";

import { requireAdmin } from "@/lib/auth/session";
import { blogs } from "@/lib/blog/mockBlogs";

export const metadata: Metadata = {
  title: "Dashboard",
};

type Stat = {
  label: string;
  value: number | null;
};

const numberFormat = new Intl.NumberFormat("en-US");

function StatCard({ label, value }: Stat) {
  return (
    <li className="flex flex-col gap-2 p-5 bg-surface border border-border rounded-xl">
      <p className="text-sm text-muted">{label}</p>

      <p className="text-2xl font-semibold text-foreground">
        {value === null ? (
          <>
            <span aria-hidden="true">—</span>
            <span className="sr-only">Not available yet</span>
          </>
        ) : (
          numberFormat.format(value)
        )}
      </p>
    </li>
  );
}

export default async function AdminDashboardPage() {
  await requireAdmin();

  const stats: Stat[] = [
    { label: "Blogs", value: blogs.length },
    { label: "Stories", value: null },
    { label: "Comments", value: null },
    { label: "Views", value: null },
  ];

  return (
    <section
      aria-labelledby="dashboard-heading"
      className="w-full flex flex-col gap-8"
    >
      <header className="flex flex-col gap-2">
        <h1
          id="dashboard-heading"
          className="font-serif text-3xl font-semibold text-foreground"
        >
          Welcome back
        </h1>

        <p className="text-muted">
          Manage your blogs, stories, comments, and media.
        </p>
      </header>

      <ul role="list" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </ul>
    </section>
  );
}
