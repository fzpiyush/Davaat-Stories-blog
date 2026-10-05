import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("comments", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table
      .uuid("blog_id")
      .references("id")
      .inTable("blogs")
      .onDelete("CASCADE");
    table
      .uuid("story_id")
      .references("id")
      .inTable("stories")
      .onDelete("CASCADE");
    table
      .uuid("parent_id")
      .references("id")
      .inTable("comments")
      .onDelete("CASCADE");
    table
      .uuid("user_id")
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
    table.text("body").notNullable();
    table.boolean("is_hidden").notNullable().defaultTo(false);
    table.timestamp("edited_at", { useTz: true });
    table
      .timestamp("created_at", { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());
    table
      .timestamp("updated_at", { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());
    table.index(["blog_id", "created_at"]);
    table.index(["story_id", "created_at"]);
    table.index(["parent_id"]);
    table.index(["user_id"]);
  });

  // Every comment belongs to exactly one blog or one story
  await knex.raw(`
    alter table comments add constraint comments_single_target
    check (num_nonnulls(blog_id, story_id) = 1)
  `);

  await knex.schema.createTable("likes", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table
      .uuid("blog_id")
      .references("id")
      .inTable("blogs")
      .onDelete("CASCADE");
    table
      .uuid("story_id")
      .references("id")
      .inTable("stories")
      .onDelete("CASCADE");
    table.text("visitor_hash").notNullable();
    table
      .timestamp("created_at", { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());
  });

  await knex.raw(`
    alter table likes add constraint likes_single_target
    check (num_nonnulls(blog_id, story_id) = 1)
  `);

  // One like per browser per blog or story
  await knex.raw(`
    create unique index likes_blog_visitor_unique
    on likes (blog_id, visitor_hash) where blog_id is not null
  `);
  await knex.raw(`
    create unique index likes_story_visitor_unique
    on likes (story_id, visitor_hash) where story_id is not null
  `);

  await knex.schema.createTable("page_views", (table) => {
    table.bigIncrements("id");
    table
      .uuid("blog_id")
      .references("id")
      .inTable("blogs")
      .onDelete("CASCADE");
    table
      .uuid("story_id")
      .references("id")
      .inTable("stories")
      .onDelete("CASCADE");
    table
      .uuid("chapter_id")
      .references("id")
      .inTable("chapters")
      .onDelete("CASCADE");
    table.text("visitor_hash").notNullable();
    table.date("viewed_on").notNullable().defaultTo(knex.raw("current_date"));
    table
      .timestamp("created_at", { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());
    table.index(["blog_id"]);
    table.index(["story_id"]);
    table.index(["viewed_on"]);
  });

  // A view is either a blog, or a chapter that also records its story
  await knex.raw(`
    alter table page_views add constraint page_views_target_check
    check (
      (blog_id is not null and story_id is null and chapter_id is null)
      or (blog_id is null and story_id is not null and chapter_id is not null)
    )
  `);

  // Once per visitor per day
  await knex.raw(`
    create unique index page_views_blog_daily_unique
    on page_views (blog_id, visitor_hash, viewed_on) where blog_id is not null
  `);
  await knex.raw(`
    create unique index page_views_chapter_daily_unique
    on page_views (chapter_id, visitor_hash, viewed_on) where chapter_id is not null
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("page_views");
  await knex.schema.dropTableIfExists("likes");
  await knex.schema.dropTableIfExists("comments");
}