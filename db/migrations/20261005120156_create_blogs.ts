import type { Knex } from "knex";

const CONTENT_STATUSES = ["draft", "published", "scheduled"];

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("blogs", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.text("slug").notNullable().unique();
    table.text("title").notNullable();
    table.text("excerpt").notNullable().defaultTo("");
    table.jsonb("content").notNullable().defaultTo(knex.raw("'[]'::jsonb"));
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
      .checkIn(CONTENT_STATUSES, "blogs_status_check");
    table.timestamp("published_at", { useTz: true });
    table.boolean("is_featured").notNullable().defaultTo(false);
    table.integer("read_time_minutes").notNullable().defaultTo(1);
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
    alter table blogs add constraint blogs_published_at_check
    check (status = 'draft' or published_at is not null)
  `);

  // Only one blog can be featured at a time
  await knex.raw(
    "create unique index blogs_single_featured on blogs (is_featured) where is_featured",
  );

  await knex.schema.createTable("blog_tags", (table) => {
    table
      .uuid("blog_id")
      .notNullable()
      .references("id")
      .inTable("blogs")
      .onDelete("CASCADE");
    table
      .uuid("tag_id")
      .notNullable()
      .references("id")
      .inTable("tags")
      .onDelete("RESTRICT");
    table.primary(["blog_id", "tag_id"]);
    table.index(["tag_id"]);
  });

  await knex.schema.createTable("blog_recommendations", (table) => {
    table
      .uuid("blog_id")
      .notNullable()
      .references("id")
      .inTable("blogs")
      .onDelete("CASCADE");
    table
      .uuid("recommended_blog_id")
      .notNullable()
      .references("id")
      .inTable("blogs")
      .onDelete("CASCADE");
    table.integer("position").notNullable().defaultTo(0);
    table.primary(["blog_id", "recommended_blog_id"]);
  });

  await knex.raw(`
    alter table blog_recommendations add constraint blog_recommendations_not_self
    check (blog_id <> recommended_blog_id)
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("blog_recommendations");
  await knex.schema.dropTableIfExists("blog_tags");
  await knex.schema.dropTableIfExists("blogs");
}