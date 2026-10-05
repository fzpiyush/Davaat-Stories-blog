import type { Knex } from "knex";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });

// Migrations and seeds use the Supabase session pooler (port 5432).
// The running app uses the transaction pooler (port 6543) through DATABASE_URL.
const base: Knex.Config = {
  client: "pg",
  pool: { min: 0, max: 5 },
  migrations: {
    directory: "./db/migrations",
    extension: "ts",
  },
  seeds: {
    directory: "./db/seeds",
    extension: "ts",
  },
};

const config: { [key: string]: Knex.Config } = {
  development: { ...base, connection: process.env.MIGRATION_DATABASE_URL },
  production: {
    ...base,
    connection: process.env.PRODUCTION_MIGRATION_DATABASE_URL,
  },
};

export default config;
