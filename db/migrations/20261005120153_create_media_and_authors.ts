import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("media", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    // Null for outside images like Unsplash or a Google avatar
    table.text("storage_path").unique();
    table.text("url").notNullable();
    table.text("alt_text").notNullable().defaultTo("");
    table.text("original_name");
    table.text("mime_type");
    table.integer("size_bytes");
    table.integer("original_size_bytes");
    table.integer("width");
    table.integer("height");
    table
      .uuid("uploaded_by")
      .references("id")
      .inTable("users")
      .onDelete("SET NULL");
    table
      .timestamp("created_at", { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());
    table.index(["created_at"]);
  });

  await knex.schema.createTable("authors", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.text("name").notNullable();
    table.text("slug").notNullable().unique();
    table.text("bio").notNullable().defaultTo("");
    table
      .uuid("avatar_media_id")
      .references("id")
      .inTable("media")
      .onDelete("RESTRICT");
    table.text("website_url");
    table.text("instagram_url");
    table.text("x_url");
    table.text("linkedin_url");
    table
      .timestamp("created_at", { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());
    table
      .timestamp("updated_at", { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("authors");
  await knex.schema.dropTableIfExists("media");
}