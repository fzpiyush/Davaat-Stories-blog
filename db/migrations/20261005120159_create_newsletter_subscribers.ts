import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("newsletter_subscribers", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.text("email").notNullable().unique();
    table
      .text("status")
      .notNullable()
      .defaultTo("subscribed")
      .checkIn(["subscribed", "unsubscribed"], "subscribers_status_check");
    table
      .timestamp("subscribed_at", { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());
    table.timestamp("unsubscribed_at", { useTz: true });
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("newsletter_subscribers");
}
