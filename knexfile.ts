import type { Knex } from "knex";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });

const config: { [key: string]: Knex.Config } = {
  development: {
    client: "pg",
    connection: process.env.DATABASE_URL,
    migrations: {
      directory: "./db/migrations",
      extension: "ts",
    },
  },

  // Migrations use the direct connection, not the pooler. DDL on a
  // transaction pooler can fail or hang, and a migration is a long-lived
  // connection doing exactly what the pooler is not built for.
  staging: {
    client: "pg",
    connection: process.env.STAGING_DATABASE_URL,
    migrations: {
      directory: "./db/migrations",
      extension: "ts",
    },
  },
};

export default config;
