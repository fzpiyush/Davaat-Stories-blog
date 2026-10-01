import type { Knex } from "knex";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });

// Both use the Supabase session pooler (port 5432).
// Session mode is safe for migrations, unlike the transaction pooler on 6543.
const base: Knex.Config = {
  client: "pg",
  pool: { min: 0, max: 5 },
  migrations: {
    directory: "./db/migrations",
    extension: "ts",
  },
};

const config: { [key: string]: Knex.Config } = {
  development: { ...base, connection: process.env.DATABASE_URL },
  production: { ...base, connection: process.env.PRODUCTION_DATABASE_URL },
};

export default config;
