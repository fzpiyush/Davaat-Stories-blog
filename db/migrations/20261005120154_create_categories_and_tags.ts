import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("categories", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.text("name").notNullable();
    table.text("slug").notNullable().unique();
    table.text("description").notNullable().defaultTo("");
    table
      .timestamp("created_at", { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());
    table
      .timestamp("updated_at", { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());
  });

  // Stops Design and design from becoming two categories
  await knex.raw(
    "create unique index categories_name_lower_unique on categories (lower(name))",
  );

  await knex.schema.createTable("tags", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.text("name").notNullable();
    table.text("slug").notNullable().unique();
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
    "create unique index tags_name_lower_unique on tags (lower(name))",
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("tags");
  await knex.schema.dropTableIfExists("categories");
}
