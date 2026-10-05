import type { Knex } from "knex";

const ROLE_CONSTRAINT = "users_role_check";

/*
 * The first migration used checkIn without a name, so Postgres
 * picked one. This finds any role check and removes it.
 */
async function dropRoleChecks(knex: Knex): Promise<void> {
  const { rows } = await knex.raw<{ rows: { conname: string }[] }>(`
    select conname
    from pg_constraint
    where conrelid = 'users'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%role%'
  `);

  for (const { conname } of rows) {
    await knex.raw("alter table users drop constraint ??", [conname]);
  }
}

export async function up(knex: Knex): Promise<void> {
  await dropRoleChecks(knex);

  await knex.raw(
    `alter table users add constraint ${ROLE_CONSTRAINT} check (role in ('admin', 'reader'))`,
  );
  await knex.raw("alter table users alter column role set default 'reader'");

  await knex.schema.alterTable("users", (table) => {
    table.boolean("is_blocked").notNullable().defaultTo(false);
    table.timestamp("blocked_at", { useTz: true });
  });
}

export async function down(knex: Knex): Promise<void> {
  // Readers can't exist under the old rule, so they go first
  await knex("users").where({ role: "reader" }).delete();

  await knex.schema.alterTable("users", (table) => {
    table.dropColumn("is_blocked");
    table.dropColumn("blocked_at");
  });

  await knex.raw(
    `alter table users drop constraint if exists ${ROLE_CONSTRAINT}`,
  );
  await knex.raw("alter table users alter column role set default 'admin'");
  await knex.raw(
    `alter table users add constraint ${ROLE_CONSTRAINT} check (role in ('admin'))`,
  );
}
