import type { Knex } from "knex";

const CONTENT_STATUSES = ["draft", "published", "scheduled"];
const STORY_PROGRESS = ["ongoing", "completed", "hiatus"];

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("stories", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.text("slug").notNullable().unique();
    table.text("title").notNullable();
    table.text("blurb").notNullable().defaultTo("");
    table
      .uuid("cover_media_id")
      .references("id")
      .inTable("media")
      .onDelete("RESTRICT");
    table
      .uuid("category_id")
      .references("id")
      .inTable("categories")
      .onDelete("RESTRICT");
    table
      .uuid("author_id")
      .references("id")
      .inTable("authors")
      .onDelete("SET NULL");
    table
      .text("status")
      .notNullable()
      .defaultTo("draft")
      .checkIn(CONTENT_STATUSES, "stories_status_check");
    table
      .text("progress")
      .notNullable()
      .defaultTo("ongoing")
      .checkIn(STORY_PROGRESS, "stories_progress_check");
    table.timestamp("published_at", { useTz: true });
    table.boolean("is_featured").notNullable().defaultTo(false);
    table
      .uuid("created_by")
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
    table.index(["status", "published_at"]);
    table.index(["category_id"]);
    table.index(["cover_media_id"]);
  });

  await knex.raw(`
    alter table stories add constraint stories_published_at_check
    check (status = 'draft' or published_at is not null)
  `);

  await knex.raw(
    "create unique index stories_single_featured on stories (is_featured) where is_featured",
  );

  await knex.schema.createTable("story_tags", (table) => {
    table
      .uuid("story_id")
      .notNullable()
      .references("id")
      .inTable("stories")
      .onDelete("CASCADE");
    table
      .uuid("tag_id")
      .notNullable()
      .references("id")
      .inTable("tags")
      .onDelete("RESTRICT");
    table.primary(["story_id", "tag_id"]);
    table.index(["tag_id"]);
  });

  await knex.schema.createTable("chapters", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table
      .uuid("story_id")
      .notNullable()
      .references("id")
      .inTable("stories")
      .onDelete("CASCADE");
    table.integer("number").notNullable();
    table.text("title").notNullable();
    table.text("content").notNullable().defaultTo("");
    table.integer("word_count").notNullable().defaultTo(0);
    table
      .text("status")
      .notNullable()
      .defaultTo("draft")
      .checkIn(CONTENT_STATUSES, "chapters_status_check");
    table.timestamp("published_at", { useTz: true });
    table
      .timestamp("created_at", { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());
    table
      .timestamp("updated_at", { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());
    table.index(["story_id", "status", "published_at"]);
  });

  // Deferred so chapters can swap numbers while reordering
  await knex.raw(`
    alter table chapters add constraint chapters_story_number_unique
    unique (story_id, number) deferrable initially deferred
  `);

  await knex.raw(`
    alter table chapters add constraint chapters_number_positive
    check (number > 0)
  `);

  await knex.raw(`
    alter table chapters add constraint chapters_published_at_check
    check (status = 'draft' or published_at is not null)
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("chapters");
  await knex.schema.dropTableIfExists("story_tags");
  await knex.schema.dropTableIfExists("stories");
}
