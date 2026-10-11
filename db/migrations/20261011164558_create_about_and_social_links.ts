import type { Knex } from "knex";

// Kept here on purpose, migrations must never change after they run
const PLATFORMS = [
  "instagram",
  "x",
  "facebook",
  "youtube",
  "linkedin",
  "threads",
  "whatsapp",
  "website",
];

const AUTHOR_LINKS = [
  { column: "website_url", platform: "website" },
  { column: "instagram_url", platform: "instagram" },
  { column: "x_url", platform: "x" },
  { column: "linkedin_url", platform: "linkedin" },
] as const;

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("social_links", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table
      .text("platform")
      .notNullable()
      .checkIn(PLATFORMS, "social_links_platform_check");
    table.text("url").notNullable();
    table.integer("position").notNullable().defaultTo(0);
    table
      .timestamp("created_at", { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());
    table
      .timestamp("updated_at", { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());
  });

  await knex.schema.createTable("about_page", (table) => {
    table.smallint("id").primary().defaultTo(1);
    table.text("headline").notNullable().defaultTo("");
    table.text("intro").notNullable().defaultTo("");
    table
      .jsonb("sections")
      .notNullable()
      .defaultTo(knex.raw("'[]'::jsonb"));
    table
      .uuid("banner_media_id")
      .references("id")
      .inTable("media")
      .onDelete("RESTRICT");
    table.boolean("show_latest").notNullable().defaultTo(true);
    table
      .timestamp("updated_at", { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());
  });

  // Only one about page can ever exist
  await knex.raw(
    "alter table about_page add constraint about_page_single_row check (id = 1)",
  );
  await knex("about_page").insert({ id: 1 });

  const author = await knex("authors").orderBy("created_at", "asc").first();

  if (author) {
    const rows = AUTHOR_LINKS.flatMap(({ column, platform }) => {
      const url = typeof author[column] === "string" ? author[column].trim() : "";
      return url ? [{ platform, url }] : [];
    }).map((row, position) => ({ ...row, position }));

    if (rows.length > 0) {
      await knex("social_links").insert(rows);
    }
  }

  await knex.schema.alterTable("authors", (table) => {
    table.dropColumns(...AUTHOR_LINKS.map(({ column }) => column));
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("authors", (table) => {
    for (const { column } of AUTHOR_LINKS) {
      table.text(column);
    }
  });

  const author = await knex("authors").orderBy("created_at", "asc").first();
  const links = await knex("social_links").orderBy("position", "asc");

  if (author) {
    const update: Record<string, string> = {};

    for (const { column, platform } of AUTHOR_LINKS) {
      const link = links.find((row) => row.platform === platform);

      if (link) {
        update[column] = link.url;
      }
    }

    if (Object.keys(update).length > 0) {
      await knex("authors").where({ id: author.id }).update(update);
    }
  }

  await knex.schema.dropTableIfExists("about_page");
  await knex.schema.dropTableIfExists("social_links");
}