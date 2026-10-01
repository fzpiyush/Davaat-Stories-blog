import "server-only";

import knex, { type Knex } from "knex";

const globalForDb = globalThis as unknown as { db?: Knex };

function createDb(): Knex {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("Missing environment variable DATABASE_URL");
  }

  return knex({
    client: "pg",
    connection: connectionString,
    pool: { min: 0, max: 10 },
  });
}

export const db: Knex = globalForDb.db ?? createDb();

if (process.env.NODE_ENV !== "production") {
  globalForDb.db = db;
}
