import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("quotes", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.text("text").notNullable().defaultTo("");
    table.text("lang").notNullable().defaultTo("hi");
    table.text("translation").notNullable().defaultTo("");
    table.text("author").notNullable().defaultTo("");
    table.text("status").notNullable().defaultTo("draft");
    table.timestamp("published_at", { useTz: true }).nullable();
    table.boolean("is_featured").notNullable().defaultTo(false);
    table
      .uuid("created_by")
      .nullable()
      .references("id")
      .inTable("users")
      .onDelete("SET NULL");
    table
      .timestamp("created_at", { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());
    table
      .timestamp("updated_at", { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());
  });

  await knex.raw(
    "alter table quotes add constraint quotes_lang_check check (lang in ('hi', 'en'))",
  );

  await knex.raw(
    "alter table quotes add constraint quotes_status_check check (status in ('draft', 'published', 'scheduled'))",
  );

  // Anything that isn't a draft needs a publish time
  await knex.raw(
    "alter table quotes add constraint quotes_published_at_check check (status = 'draft' or published_at is not null)",
  );

  // The database itself guarantees only one featured quote
  await knex.raw(
    "create unique index quotes_one_featured on quotes (is_featured) where is_featured",
  );

  // Keeps the public newest first list fast
  await knex.raw(
    "create index quotes_live_order on quotes (published_at desc, id desc) where status <> 'draft'",
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("quotes");
}
