import "server-only";

import type { Knex } from "knex";

import { db } from "@/lib/db/knex";
import { escapeLike } from "@/lib/db/sql";
import type { NewsletterSubscriberRow, SubscriberStatus } from "@/lib/db/types";

export const SUBSCRIBER_PAGE_SIZE = 50;
export const SUBSCRIBER_FILTERS = [
  "all",
  "subscribed",
  "unsubscribed",
] as const;
export type SubscriberFilter = (typeof SUBSCRIBER_FILTERS)[number];

function applyFilter(
  builder: Knex.QueryBuilder,
  filter: SubscriberFilter,
): void {
  if (filter !== "all") {
    builder.where("status", filter);
  }
}

export async function listSubscribers({
  filter,
  query,
  page,
}: {
  filter: SubscriberFilter;
  query: string;
  page: number;
}): Promise<{ items: NewsletterSubscriberRow[]; total: number }> {
  const filtered = db<NewsletterSubscriberRow>("newsletter_subscribers")
    .modify(applyFilter, filter)
    .modify((builder) => {
      if (query) {
        builder.whereILike("email", `%${escapeLike(query)}%`);
      }
    });

  const [countRow, items] = await Promise.all([
    filtered.clone().count({ count: "*" }).first(),
    filtered
      .clone()
      .select("*")
      .orderBy("subscribed_at", "desc")
      .limit(SUBSCRIBER_PAGE_SIZE)
      .offset((page - 1) * SUBSCRIBER_PAGE_SIZE),
  ]);

  return {
    items: items as NewsletterSubscriberRow[],
    total: Number(countRow?.count ?? 0),
  };
}

export async function getSubscriberCounts(): Promise<
  Record<SubscriberFilter, number>
> {
  const row = await db("newsletter_subscribers").first(
    db.raw("count(*)::int as total"),
    db.raw(
      "(count(*) filter (where status = 'subscribed'))::int as subscribed",
    ),
    db.raw(
      "(count(*) filter (where status = 'unsubscribed'))::int as unsubscribed",
    ),
  );

  return {
    all: row?.total ?? 0,
    subscribed: row?.subscribed ?? 0,
    unsubscribed: row?.unsubscribed ?? 0,
  };
}

export async function listSubscribersForExport(
  filter: SubscriberFilter,
): Promise<NewsletterSubscriberRow[]> {
  return db<NewsletterSubscriberRow>("newsletter_subscribers")
    .modify(applyFilter, filter)
    .select("*")
    .orderBy("subscribed_at", "asc");
}

export async function setSubscriberStatus(
  id: string,
  status: SubscriberStatus,
): Promise<void> {
  await db("newsletter_subscribers")
    .where({ id })
    .update({
      status,
      unsubscribed_at: status === "unsubscribed" ? new Date() : null,
    });
}

export async function deleteSubscriber(id: string): Promise<void> {
  await db("newsletter_subscribers").where({ id }).delete();
}

/*
 * Adds a new email, or brings back someone who unsubscribed.
 * Subscribing twice does nothing, so the original date stays.
 */
export async function subscribeEmail(email: string): Promise<void> {
  await db("newsletter_subscribers")
    .insert({ email })
    .onConflict("email")
    .merge({
      status: "subscribed",
      unsubscribed_at: null,
      subscribed_at: db.raw(
        "case when newsletter_subscribers.status = 'unsubscribed' then now() else newsletter_subscribers.subscribed_at end",
      ),
    });
}
